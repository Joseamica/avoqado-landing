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

  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    stream: true,
    messages: [
      { role: 'system', content: LABS_SYSTEM_PROMPT },
      ...body.messages.map(m => ({ role: m.role, content: m.content })),
    ],
    tools: LABS_TOOLS,
    tool_choice: 'auto',
    temperature: 0.7,
  });

  const encoder = new TextEncoder();
  const sse = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const delta = chunk.choices[0]?.delta;
          if (!delta) continue;

          if (delta.content) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'text', value: delta.content })}\n\n`)
            );
          }

          if (delta.tool_calls) {
            for (const tc of delta.tool_calls) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'tool_call_delta', value: tc })}\n\n`)
              );
            }
          }

          const finishReason = chunk.choices[0]?.finish_reason;
          if (finishReason) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'done', reason: finishReason })}\n\n`)
            );
          }
        }
        controller.close();
      } catch (err) {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              type: 'error',
              message: err instanceof Error ? err.message : 'stream error',
            })}\n\n`
          )
        );
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
