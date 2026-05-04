import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { LABS_SYSTEM_PROMPT } from '../../../lib/labs/systemPrompt';
import { LABS_TOOLS } from '../../../lib/labs/extractionSchema';
import type { ChatMessage } from '../../../lib/labs/types';

export const prerender = false;

interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
}

const RATE_BUCKET = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 15;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_BUCKET.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    RATE_BUCKET.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

export const POST: APIRoute = async ({ request, clientAddress, locals }) => {
  // Prefer Cloudflare runtime env (set in CF Pages dashboard); fall back to
  // import.meta.env for local Astro dev when not running under Miniflare.
  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
  const apiKey = runtimeEnv?.OPENAI_API_KEY || import.meta.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let ip = 'unknown';
  try {
    ip = clientAddress || 'unknown';
  } catch {
    // clientAddress may throw on prerendered routes or some adapters
  }
  if (rateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Demasiadas solicitudes. Espera un minuto.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: ChatRequest;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'invalid JSON' }), { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(JSON.stringify({ error: 'messages required' }), { status: 400 });
  }

  if (body.messages.length > 60) {
    return new Response(JSON.stringify({ error: 'conversation too long' }), { status: 400 });
  }

  const openai = new OpenAI({ apiKey });

  // Tool-use loop: if the model returns tool_calls without text, we need to send
  // synthetic tool results back and let the model generate its actual response.
  // This is the canonical OpenAI tool calling pattern.
  type AccumulatedToolCall = { id: string; name: string; args: string };

  // We strip earlier "_Error: ..." artifacts here too as defense-in-depth — if a
  // client somehow sends polluted history, the prompt to OpenAI stays clean.
  const errorFragmentRe = /(\n*_Error[: ]|OPENAI_API_KEY|API_KEY\s+missing|"error"\s*:|_Error de conexión)/i;
  const cleanedMessages = body.messages
    .map(m => {
      if (m.role !== 'assistant') return m;
      const match = m.content.match(errorFragmentRe);
      const content = match && match.index !== undefined ? m.content.slice(0, match.index).trim() : m.content;
      return { role: m.role, content };
    })
    .filter(m => m.role !== 'assistant' || (m.content.length > 0 && !errorFragmentRe.test(m.content)));

  const baseHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
    { role: 'system', content: LABS_SYSTEM_PROMPT },
    ...cleanedMessages.map(m => ({ role: m.role, content: m.content })),
  ];

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      const send = (event: object) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));

      try {
        const MAX_ITERATIONS = 3;
        let workingHistory = baseHistory;
        let producedTextThisRequest = false;

        for (let iter = 0; iter < MAX_ITERATIONS; iter++) {
          // After the first iteration, force a text response by withholding tools.
          // This guarantees the model talks to the user even if it wanted to keep
          // chaining silent updateBrief calls.
          const useTools = iter === 0;

          const stream = await openai.chat.completions.create({
            model: 'gpt-4o',
            stream: true,
            messages: workingHistory,
            tools: useTools ? LABS_TOOLS : undefined,
            tool_choice: useTools ? 'auto' : undefined,
            temperature: 0.7,
          });

          let textInThisIter = 0;
          let finishReason: string | null = null;
          const accum: Record<number, AccumulatedToolCall> = {};

          for await (const chunk of stream) {
            const choice = chunk.choices[0];
            const delta = choice?.delta;
            if (!delta) continue;

            if (delta.content) {
              textInThisIter += delta.content.length;
              producedTextThisRequest = true;
              send({ type: 'text', value: delta.content });
            }

            if (delta.tool_calls) {
              for (const tc of delta.tool_calls) {
                const idx = tc.index ?? 0;
                if (!accum[idx]) accum[idx] = { id: '', name: '', args: '' };
                if (tc.id) accum[idx].id = tc.id;
                if (tc.function?.name) accum[idx].name = tc.function.name;
                if (tc.function?.arguments) accum[idx].args += tc.function.arguments;
                // Only stream tool_call deltas to the client on the first iteration —
                // otherwise the client's index-based buffer would conflict between iterations.
                if (iter === 0) {
                  send({ type: 'tool_call_delta', value: tc });
                }
              }
            }

            if (choice?.finish_reason) {
              finishReason = choice.finish_reason;
            }
          }

          // Done: the model produced text. Exit the loop.
          if (textInThisIter > 0) break;

          // The model returned only tool_calls. Roundtrip with synthetic results
          // so the next iteration produces text.
          const toolCallList = Object.values(accum).filter(tc => tc.id && tc.name);
          if (finishReason === 'tool_calls' && toolCallList.length > 0) {
            workingHistory = [
              ...workingHistory,
              {
                role: 'assistant',
                content: '',
                tool_calls: toolCallList.map(tc => ({
                  id: tc.id,
                  type: 'function',
                  function: { name: tc.name, arguments: tc.args || '{}' },
                })),
              },
              ...toolCallList.map(tc => ({
                role: 'tool' as const,
                tool_call_id: tc.id,
                content: JSON.stringify({ ok: true }),
              })),
            ];
            continue;
          }

          // Anything else (stop, length, content_filter): break out.
          break;
        }

        // Final fallback: if after the whole loop we never got text, send a graceful
        // sentence so the user sees something. This is rare but keeps the UX seamless.
        if (!producedTextThisRequest) {
          send({
            type: 'text',
            value: 'Listo, anoté esa parte. ¿Seguimos con la siguiente pieza del brief?',
          });
        }

        send({ type: 'done', reason: 'stop' });
        controller.close();
      } catch (err) {
        send({
          type: 'error',
          message: err instanceof Error ? err.message : 'stream error',
        });
        controller.close();
      }
    },
  });

  return new Response(sse, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
};
