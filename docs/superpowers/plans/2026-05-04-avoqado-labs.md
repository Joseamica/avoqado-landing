# Avoqado Labs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/labs` — a Lovable-style sales-chatbot page that extracts a structured 7-field brief and emails it to Jose for human review, positioned as Avoqado's sub-brand for from-scratch custom software.

**Architecture:** Astro page with a single React island (LabsChat) that streams from a server-side OpenAI chat endpoint. Structured field extraction via OpenAI tool calling. Final brief submitted via a second endpoint that uses the existing nodemailer setup. Visual identity is Editorial Light, scoped under `[data-theme="labs"]` so it does not pollute the rest of the dark-first site. Spec lives at `docs/superpowers/specs/2026-05-04-avoqado-labs-design.md`.

**Tech Stack:** Astro 5 (server output, Cloudflare adapter) · React 18 · TypeScript · Tailwind 4 · framer-motion 12.23.26 (pinned) · nodemailer 7 · OpenAI SDK (to be added) · DM Sans + Playfair Display.

**Note on testing:** Per user guidance, automated tests are deferred — the plan ends each major phase with a manual smoke-test checklist. Production tests can be backfilled afterward.

---

## File Structure

**New files:**

```
src/
├── pages/
│   ├── labs.astro                          # The /labs page
│   └── api/
│       └── labs/
│           ├── chat.ts                     # POST: streams OpenAI chat completion
│           └── submit.ts                   # POST: validates brief, emails Jose
├── components/
│   └── labs/                               # New scoped folder for Labs UI
│       ├── LabsHero.astro                  # Hero section (compact, editorial)
│       ├── LabsChat.tsx                    # Main React island (chat + summary)
│       ├── LabsMessage.tsx                 # Single chat bubble component
│       ├── LabsSummary.tsx                 # Live summary panel with editable tags
│       ├── LabsSubmitModal.tsx             # Final confirmation modal
│       └── LabsSuccessScreen.tsx           # Post-submit success state
└── lib/
    └── labs/                               # Shared logic (server + client)
        ├── types.ts                        # ChatMessage, ExtractedFields, etc.
        ├── systemPrompt.ts                 # Agent persona + rules
        ├── extractionSchema.ts             # OpenAI tool/function schema
        └── emailTemplate.ts                # HTML email template builder
```

**Modified files:**

```
src/
├── styles/
│   └── global.css                          # Add [data-theme="labs"] tokens
└── components/
    └── interactive/
        └── NavigationMenu.tsx              # Add Labs entry + light-page detection
.env.example                                # Add OPENAI_API_KEY
package.json                                # Add openai dependency
```

---

## Phase 1: Foundations

### Task 1: Install OpenAI SDK

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Add the official OpenAI Node SDK**

```bash
cd /Users/amieva/Documents/Programming/Avoqado/avoqado-landing
npm install openai
```

Expected: `openai` appears in `package.json` dependencies. Latest stable (v5+) supports streaming and tool calling out of the box.

- [ ] **Step 2: Confirm install**

```bash
node -e "console.log(require('./package.json').dependencies.openai)"
```

Expected: prints a version string like `^5.x.x`.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add openai sdk for labs chatbot"
```

---

### Task 2: Document required environment variables

**Files:**
- Modify or Create: `.env.example`

- [ ] **Step 1: Read current `.env.example` (or create if missing)**

```bash
cat /Users/amieva/Documents/Programming/Avoqado/avoqado-landing/.env.example 2>/dev/null || echo "(missing)"
```

- [ ] **Step 2: Ensure these vars are listed (append if missing, don't duplicate):**

```bash
# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxx

# SMTP (existing — already used by /api/contact.ts)
SMTP_USER=jose@avoqado.io
SMTP_PASS=your-smtp-password
SMTP_HOST=smtpout.secureserver.net
SMTP_PORT=587

# Labs configuration
LABS_NOTIFY_EMAIL=jose@avoqado.io
```

- [ ] **Step 3: Add real key to local `.env` (do NOT commit)**

User adds `OPENAI_API_KEY=...` and `LABS_NOTIFY_EMAIL=...` to their `.env` manually.

- [ ] **Step 4: Commit example only**

```bash
git add .env.example
git commit -m "docs: document OPENAI_API_KEY and LABS_NOTIFY_EMAIL env vars"
```

---

## Phase 2: Theme tokens

### Task 3: Add Labs theme tokens to global.css

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Append a `[data-theme="labs"]` token block at the end of `global.css`**

Place it after the existing `:root` block and before the `@keyframes` definitions:

```css
/* ─── Avoqado Labs sub-brand: Editorial Light ─── */
[data-theme="labs"] {
  --labs-bg: oklch(0.97 0.012 80);
  --labs-bg-elevated: oklch(0.99 0.008 80);
  --labs-ink: oklch(0.22 0.012 250);
  --labs-ink-muted: oklch(0.45 0.015 250);
  --labs-rule: oklch(0.88 0.015 80);
  --labs-accent: oklch(0.62 0.16 35);
  --labs-accent-hover: oklch(0.55 0.17 35);
  --labs-accent-soft: oklch(0.92 0.05 35);
  --labs-shadow-soft: 0 1px 3px oklch(0.22 0.012 250 / 0.04), 0 4px 12px oklch(0.22 0.012 250 / 0.05);
  --labs-shadow-pop: 0 8px 24px oklch(0.62 0.16 35 / 0.12), 0 2px 6px oklch(0.62 0.16 35 / 0.08);

  background-color: var(--labs-bg);
  color: var(--labs-ink);
  font-family: var(--font-family-sans);
}

[data-theme="labs"] ::selection {
  background-color: var(--labs-accent-soft);
  color: var(--labs-ink);
}
```

- [ ] **Step 2: Verify it parses by running the dev server**

```bash
cd /Users/amieva/Documents/Programming/Avoqado/avoqado-landing
npm run dev
```

Wait for "ready in" message, then `Ctrl+C`. No CSS errors should appear.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat: add Labs Editorial Light theme tokens"
```

---

## Phase 3: Shared types and prompt

### Task 4: Create shared types

**Files:**
- Create: `src/lib/labs/types.ts`

- [ ] **Step 1: Create the file with the full type surface**

```typescript
// src/lib/labs/types.ts

export type ProjectType =
  | 'web-app'
  | 'mobile-app'
  | 'dashboard'
  | 'automation'
  | 'ai-agent'
  | 'integration'
  | 'report'
  | 'other';

export type Urgency = 'hoy' | 'esta-semana' | 'este-mes' | 'sin-prisa';

export interface ContactInfo {
  name: string;
  email: string;
  whatsapp?: string;
}

export interface ExtractedFields {
  projectType?: ProjectType;
  projectTypeFreeText?: string; // required when projectType === 'other'
  businessContext?: string;
  coreFunctionality?: string;
  integrations?: string[];
  designReference?: string;
  urgency?: Urgency;
  contact?: ContactInfo;
}

export type ChatRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: number;
}

export interface ConversationState {
  sessionId: string;
  messages: ChatMessage[];
  fields: ExtractedFields;
  startedAt: number;
  lastActivityAt: number;
  submittedAt?: number;
}

export interface SubmitPayload {
  sessionId: string;
  fields: Required<Omit<ExtractedFields, 'projectTypeFreeText' | 'integrations'>> & {
    projectTypeFreeText?: string;
    integrations: string[];
  };
  additionalNotes?: string;
  transcript: ChatMessage[];
}

export interface SubmitResponse {
  success: boolean;
  message: string;
}

// Helper: returns the list of missing required fields
export function missingFields(f: ExtractedFields): string[] {
  const missing: string[] = [];
  if (!f.projectType) missing.push('projectType');
  if (f.projectType === 'other' && !f.projectTypeFreeText) missing.push('projectTypeFreeText');
  if (!f.businessContext) missing.push('businessContext');
  if (!f.coreFunctionality) missing.push('coreFunctionality');
  if (!f.integrations) missing.push('integrations');
  if (!f.designReference) missing.push('designReference');
  if (!f.urgency) missing.push('urgency');
  if (!f.contact?.name || !f.contact?.email) missing.push('contact');
  return missing;
}

export function isComplete(f: ExtractedFields): boolean {
  return missingFields(f).length === 0;
}
```

- [ ] **Step 2: Type-check**

```bash
npx astro check 2>&1 | tail -20
```

Expected: no errors mentioning `src/lib/labs/types.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/labs/types.ts
git commit -m "feat: add Labs shared types"
```

---

### Task 5: Write the agent system prompt

**Files:**
- Create: `src/lib/labs/systemPrompt.ts`

- [ ] **Step 1: Create file with the prompt**

```typescript
// src/lib/labs/systemPrompt.ts

export const LABS_SYSTEM_PROMPT = `Eres consultor-vendedor de Avoqado Labs, una agencia AI que construye software a la medida en menos de un día. Tu trabajo es entender qué quiere construir el cliente y armar un brief completo que Jose, el fundador, va a revisar personalmente.

## Identidad
- Eres cálido, consultivo, conciso. Nunca robótico, nunca pushy.
- Hablas español de México por default. Si el usuario escribe en inglés, respondes en inglés.
- Te identificas como AI assistant si te preguntan, y mencionas que Jose revisa cada brief antes de cualquier compromiso.

## Misión
Extraer 7 piezas de información a través de conversación natural:
1. **Tipo de proyecto** (web app, mobile app, dashboard, automatización, agente AI, integración, reporte, u otra cosa)
2. **Contexto del negocio** (industria, tamaño, qué problema resuelve)
3. **Funcionalidad principal** (qué tiene que hacer en una frase)
4. **Integraciones** (con qué sistemas tiene que conectar — POS, WhatsApp, Stripe, Sheets, ERPs, etc.)
5. **Referencia de diseño** ("como Notion", "minimal y oscuro", una URL, o "no tengo referencia")
6. **Urgencia** (hoy, esta semana, este mes, sin prisa)
7. **Contacto** (nombre, email, WhatsApp opcional)

## Reglas duras
- **NUNCA comprometas fecha específica.** No digas "te lo entrego mañana" ni "está listo en 24 horas". Di siempre: "Jose te confirma timeline en menos de 24 horas".
- **NUNCA comprometas precio.** Si el usuario pregunta cuánto cuesta, responde: "El costo lo confirma Jose después de revisar el brief — depende del alcance".
- **NUNCA prometas alcance no acordado.** Si el usuario asume algo que no se ha hablado, aclara antes de seguir.
- **Cierra siempre con el handoff a Jose** cuando el brief esté completo.

## Routing
- Si el cliente quiere customizar SU instalación de Avoqado existente (módulos sobre el dashboard de Avoqado, integraciones POS dentro de su venue, etc.), redirígelo cálidamente: "Eso vive en Traje a la medida (https://avoqado.io/traje-a-la-medida) — aquí en Labs construimos cosas que viven fuera de tu instalación de Avoqado".
- Si el cliente pide algo fuera de alcance (videojuegos, hardware, branding/diseño puro sin software, gestión de campañas de marketing), explica cálidamente que no es lo nuestro y sugiere el subset que sí podemos hacer si aplica.

## Estrategia de conversación
- Una pregunta a la vez. No abrumes.
- Prefiere multiple-choice o ejemplos concretos sobre preguntas abiertas cuando puedas.
- Reconoce lo que entendiste antes de pedir lo siguiente: "Ok, dashboard para tu hotel. Para conectar a tu PMS — ¿cuál usas? (Cloudbeds, Mews, otro?)".
- Si la respuesta del usuario es vaga, haz UNA pregunta de seguimiento, no tres.
- Si llevas ya 3+ turnos en el mismo campo, acepta lo que tengas y avanza al siguiente.

## Cuándo avisar que ya tienes todo
Cuando los 7 campos estén completos, di algo como: "Creo que ya tengo todo lo que Jose necesita. ¿Quieres que mande tu brief, o agregamos algo más?". Y entonces espera la confirmación del usuario antes de hacer el llamado a la función \`finalizeBrief\`.

## Tono final
Tu trabajo es que el cliente termine la conversación pensando: "ok, hablé con alguien que entendió mi proyecto y sabe lo que está haciendo". No con sensación de formulario, no con sensación de soporte robótico.`;
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/labs/systemPrompt.ts
git commit -m "feat: write Labs agent system prompt"
```

---

### Task 6: Define OpenAI tool/function schema for extraction

**Files:**
- Create: `src/lib/labs/extractionSchema.ts`

- [ ] **Step 1: Define the tool schema for OpenAI tool calling**

```typescript
// src/lib/labs/extractionSchema.ts
//
// Single tool the model can call: updateBrief.
// The model is instructed to call this any time it learns new info.
// This gives us deterministic structured updates instead of regex on chat text.

export const updateBriefTool = {
  type: 'function' as const,
  function: {
    name: 'updateBrief',
    description:
      'Llama esta función cada vez que el usuario te dé información que pertenezca a uno de los 7 campos del brief. Solo incluye los campos que aprendiste en este turno; no repitas lo ya capturado.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        projectType: {
          type: 'string',
          enum: ['web-app', 'mobile-app', 'dashboard', 'automation', 'ai-agent', 'integration', 'report', 'other'],
          description: 'Tipo principal del proyecto.',
        },
        projectTypeFreeText: {
          type: 'string',
          description: 'Solo si projectType === "other". Descripción libre del tipo.',
        },
        businessContext: {
          type: 'string',
          description: 'Industria, tamaño y problema que resuelve. 1-3 frases.',
        },
        coreFunctionality: {
          type: 'string',
          description: 'Qué tiene que hacer el sistema en una frase.',
        },
        integrations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Sistemas con los que debe conectar. Array vacío si ninguna.',
        },
        designReference: {
          type: 'string',
          description: 'Estética deseada o URL de referencia. "no tengo referencia" es válido.',
        },
        urgency: {
          type: 'string',
          enum: ['hoy', 'esta-semana', 'este-mes', 'sin-prisa'],
        },
        contact: {
          type: 'object',
          additionalProperties: false,
          properties: {
            name: { type: 'string' },
            email: { type: 'string' },
            whatsapp: { type: 'string' },
          },
          required: ['name', 'email'],
        },
      },
    },
  },
};

// The signal-tool that the agent calls when the user explicitly confirms
// they want to send the brief. The frontend listens for this to enable
// the final submit CTA.
export const finalizeBriefTool = {
  type: 'function' as const,
  function: {
    name: 'finalizeBrief',
    description:
      'Llama esta función SOLO cuando el usuario haya confirmado explícitamente que quiere enviar el brief a Jose. No llames esta función automáticamente — espera el "sí, mándalo" del usuario.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
};

export const LABS_TOOLS = [updateBriefTool, finalizeBriefTool];
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/labs/extractionSchema.ts
git commit -m "feat: define OpenAI tool schema for Labs brief extraction"
```

---

## Phase 4: API routes

### Task 7: Create the streaming chat endpoint

**Files:**
- Create: `src/pages/api/labs/chat.ts`

- [ ] **Step 1: Implement the streaming endpoint**

```typescript
// src/pages/api/labs/chat.ts
import type { APIRoute } from 'astro';
import OpenAI from 'openai';
import { LABS_SYSTEM_PROMPT } from '../../../lib/labs/systemPrompt';
import { LABS_TOOLS } from '../../../lib/labs/extractionSchema';
import type { ChatMessage } from '../../../lib/labs/types';

export const prerender = false;

interface ChatRequest {
  messages: Pick<ChatMessage, 'role' | 'content'>[];
}

// Naive in-memory rate limiter, scoped per-instance.
// Cloudflare Workers may have multiple instances; for v1 this is best-effort.
const RATE_BUCKET = new Map<string, { count: number; windowStart: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

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

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const apiKey = import.meta.env.OPENAI_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'OPENAI_API_KEY missing' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const ip = clientAddress || 'unknown';
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
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', value: delta.content })}\n\n`));
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
            `data: ${JSON.stringify({ type: 'error', message: err instanceof Error ? err.message : 'stream error' })}\n\n`
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
```

- [ ] **Step 2: Smoke test the endpoint with the dev server running**

```bash
npm run dev &
sleep 5
curl -N -X POST http://localhost:4321/api/labs/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Hola, quiero un dashboard"}]}' \
  --max-time 15
kill %1 2>/dev/null
```

Expected: `data: {"type":"text","value":"..."}` events stream back. If you see `OPENAI_API_KEY missing`, set the env var in `.env`.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/labs/chat.ts
git commit -m "feat: streaming chat endpoint for Labs"
```

---

### Task 8: Create the email submit endpoint and template

**Files:**
- Create: `src/lib/labs/emailTemplate.ts`
- Create: `src/pages/api/labs/submit.ts`

- [ ] **Step 1: Create the email HTML template**

```typescript
// src/lib/labs/emailTemplate.ts
import type { SubmitPayload } from './types';

const labelMap: Record<string, string> = {
  'web-app': 'Web App',
  'mobile-app': 'App Móvil',
  dashboard: 'Dashboard',
  automation: 'Automatización',
  'ai-agent': 'Agente AI',
  integration: 'Integración',
  report: 'Reporte',
  other: 'Otro',
};

const urgencyMap: Record<string, string> = {
  hoy: 'Hoy',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mes',
  'sin-prisa': 'Sin prisa',
};

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderBriefEmail(payload: SubmitPayload): string {
  const f = payload.fields;
  const transcriptHtml = payload.transcript
    .map(
      m =>
        `<div style="margin:8px 0;padding:8px 12px;border-left:3px solid ${
          m.role === 'user' ? '#c9712f' : '#888'
        };background:#fafafa;font-size:13px;">
          <strong>${m.role === 'user' ? 'Cliente' : 'Agente'}:</strong>
          <div style="white-space:pre-wrap;margin-top:4px;">${escape(m.content)}</div>
        </div>`
    )
    .join('');

  const projectTypeLabel =
    f.projectType === 'other' && f.projectTypeFreeText
      ? `Otro: ${escape(f.projectTypeFreeText)}`
      : labelMap[f.projectType] || f.projectType;

  return `
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; max-width: 720px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 24px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .field { margin: 8px 0; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; }
  .value { font-size: 15px; line-height: 1.5; }
  .pill { display: inline-block; background: #f5e8df; color: #c9712f; padding: 2px 10px; border-radius: 999px; font-size: 12px; margin: 0 4px 4px 0; }
  .meta { background: #fafafa; padding: 12px; border-radius: 8px; font-size: 12px; color: #666; margin-top: 24px; }
</style>
</head>
<body>
  <h1>Nuevo brief de Avoqado Labs</h1>
  <p style="color:#666;font-size:14px;margin:0 0 16px;">
    Sesión <code>${escape(payload.sessionId)}</code> · ${labelMap[f.projectType] || f.projectType} · Urgencia: ${urgencyMap[f.urgency] || f.urgency}
  </p>

  <h2>Contacto</h2>
  <div class="field"><div class="label">Nombre</div><div class="value">${escape(f.contact.name)}</div></div>
  <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${escape(f.contact.email)}">${escape(f.contact.email)}</a></div></div>
  ${f.contact.whatsapp ? `<div class="field"><div class="label">WhatsApp</div><div class="value">${escape(f.contact.whatsapp)}</div></div>` : ''}

  <h2>Proyecto</h2>
  <div class="field"><div class="label">Tipo</div><div class="value">${projectTypeLabel}</div></div>
  <div class="field"><div class="label">Contexto del negocio</div><div class="value">${escape(f.businessContext)}</div></div>
  <div class="field"><div class="label">Funcionalidad principal</div><div class="value">${escape(f.coreFunctionality)}</div></div>
  <div class="field">
    <div class="label">Integraciones</div>
    <div class="value">
      ${f.integrations.length === 0 ? 'ninguna' : f.integrations.map(i => `<span class="pill">${escape(i)}</span>`).join('')}
    </div>
  </div>
  <div class="field"><div class="label">Referencia de diseño</div><div class="value">${escape(f.designReference)}</div></div>
  <div class="field"><div class="label">Urgencia</div><div class="value">${urgencyMap[f.urgency] || f.urgency}</div></div>

  ${
    payload.additionalNotes
      ? `<h2>Notas adicionales del cliente</h2><div class="value" style="white-space:pre-wrap;">${escape(payload.additionalNotes)}</div>`
      : ''
  }

  <h2>Transcripción</h2>
  ${transcriptHtml}

  <div class="meta">
    Enviado desde avoqado.io/labs · ${new Date().toISOString()}
  </div>
</body>
</html>`;
}
```

- [ ] **Step 2: Create the submit endpoint**

```typescript
// src/pages/api/labs/submit.ts
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import type { SubmitPayload, SubmitResponse } from '../../../lib/labs/types';
import { renderBriefEmail } from '../../../lib/labs/emailTemplate';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(p: unknown): p is SubmitPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (typeof o.sessionId !== 'string') return false;
  if (typeof o.fields !== 'object' || o.fields === null) return false;
  const f = o.fields as Record<string, unknown>;
  if (typeof f.projectType !== 'string') return false;
  if (typeof f.businessContext !== 'string' || f.businessContext.trim().length === 0) return false;
  if (typeof f.coreFunctionality !== 'string' || f.coreFunctionality.trim().length === 0) return false;
  if (!Array.isArray(f.integrations)) return false;
  if (typeof f.designReference !== 'string') return false;
  if (typeof f.urgency !== 'string') return false;
  if (typeof f.contact !== 'object' || f.contact === null) return false;
  const c = f.contact as Record<string, unknown>;
  if (typeof c.name !== 'string' || c.name.trim().length === 0) return false;
  if (typeof c.email !== 'string' || !EMAIL_RE.test(c.email)) return false;
  if (!Array.isArray(o.transcript)) return false;
  return true;
}

export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const r: SubmitResponse = { success: false, message: 'JSON inválido' };
    return new Response(JSON.stringify(r), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!validate(body)) {
    const r: SubmitResponse = { success: false, message: 'Faltan campos requeridos o son inválidos' };
    return new Response(JSON.stringify(r), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const payload = body as SubmitPayload;

  const smtpUser = import.meta.env.SMTP_USER;
  const smtpPass = import.meta.env.SMTP_PASS;
  const smtpHost = import.meta.env.SMTP_HOST || 'smtpout.secureserver.net';
  const smtpPort = parseInt(import.meta.env.SMTP_PORT || '587');
  const notifyEmail = import.meta.env.LABS_NOTIFY_EMAIL || smtpUser;

  if (!smtpUser || !smtpPass) {
    console.error('Labs submit: SMTP credentials missing');
    const r: SubmitResponse = { success: false, message: 'Error de configuración del servidor' };
    return new Response(JSON.stringify(r), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
  });

  const html = renderBriefEmail(payload);
  const projectLabel = payload.fields.projectType;
  const subject = `[Labs] ${projectLabel} — ${payload.fields.contact.name} (${payload.fields.urgency})`;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: notifyEmail,
      replyTo: payload.fields.contact.email,
      subject,
      html,
      attachments: [
        {
          filename: `brief-${payload.sessionId}.json`,
          content: JSON.stringify(payload, null, 2),
          contentType: 'application/json',
        },
      ],
    });

    // Confirmation email to the user
    await transporter.sendMail({
      from: smtpUser,
      to: payload.fields.contact.email,
      subject: 'Recibimos tu brief — Avoqado Labs',
      html: `
        <h2>Hola ${payload.fields.contact.name},</h2>
        <p>Recibimos tu brief para Avoqado Labs. Jose lo revisa personalmente y te confirma timeline y costo en menos de 24 horas.</p>
        <p>Mientras tanto, si quieres agregar algo, responde a este correo.</p>
        <p style="color:#888;font-size:13px;">— El equipo de Avoqado Labs</p>
      `,
    });

    const r: SubmitResponse = { success: true, message: 'Brief enviado' };
    return new Response(JSON.stringify(r), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Labs submit error:', err);
    const r: SubmitResponse = { success: false, message: 'No pudimos enviar el brief. Intenta de nuevo.' };
    return new Response(JSON.stringify(r), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/labs/emailTemplate.ts src/pages/api/labs/submit.ts
git commit -m "feat: Labs brief submit endpoint with email template"
```

---

## Phase 5: React island components

### Task 9: Build the chat island skeleton with state

**Files:**
- Create: `src/components/labs/LabsChat.tsx`

- [ ] **Step 1: Create the chat island with all state hooks but minimal UI**

```tsx
// src/components/labs/LabsChat.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, ConversationState, ExtractedFields, SubmitResponse } from '../../lib/labs/types';
import { isComplete } from '../../lib/labs/types';
import LabsSummary from './LabsSummary';
import LabsMessage from './LabsMessage';
import LabsSubmitModal from './LabsSubmitModal';
import LabsSuccessScreen from './LabsSuccessScreen';

const STORAGE_KEY = 'avoqado-labs-conversation-v1';
const IDLE_MS = 24 * 60 * 60 * 1000;

const SUGGESTION_CHIPS = [
  'Un dashboard que conecte mi POS con WhatsApp',
  'Un agente que conteste reservaciones automáticamente',
  'Un reporte diario de ventas que me llegue al correo',
];

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function loadFromStorage(): ConversationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversationState;
    if (Date.now() - parsed.lastActivityAt > IDLE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveToStorage(state: ConversationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be disabled
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

export default function LabsChat() {
  const [state, setState] = useState<ConversationState>(() => {
    const restored = loadFromStorage();
    if (restored) return restored;
    return {
      sessionId: uid(),
      messages: [],
      fields: {},
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    };
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Persist on every state change
  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  // Auto-scroll on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, isStreaming]);

  const setFields = useCallback((updater: (prev: ExtractedFields) => ExtractedFields) => {
    setState(prev => ({ ...prev, fields: updater(prev.fields), lastActivityAt: Date.now() }));
  }, []);

  const addMessage = useCallback((m: ChatMessage) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, m], lastActivityAt: Date.now() }));
  }, []);

  const updateLastAssistant = useCallback((appendText: string) => {
    setState(prev => {
      const msgs = [...prev.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + appendText };
      }
      return { ...prev, messages: msgs, lastActivityAt: Date.now() };
    });
  }, []);

  // Stub — implemented in Task 12
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: Date.now() };
      addMessage(userMsg);
      setInput('');
      setIsStreaming(true);
      // TODO: wire to /api/labs/chat in Task 12
      setIsStreaming(false);
    },
    [isStreaming, addMessage]
  );

  const handleChipClick = (chip: string) => setInput(chip);

  const restart = () => {
    if (!confirm('¿Empezar de nuevo? Se borrará la conversación actual.')) return;
    clearStorage();
    setState({
      sessionId: uid(),
      messages: [],
      fields: {},
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    });
    setSubmitted(false);
    setSubmitError(null);
  };

  const handleSubmitConfirmed = async (additionalNotes: string): Promise<SubmitResponse> => {
    // TODO: wire to /api/labs/submit in Task 14
    return { success: false, message: 'not implemented' };
  };

  if (submitted) {
    return <LabsSuccessScreen onRestart={restart} />;
  }

  const empty = state.messages.length === 0;

  return (
    <div data-theme="labs" className="w-full max-w-[1200px] mx-auto px-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-10">
        {/* Chat column */}
        <div className="flex flex-col min-h-[60vh]">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pb-6 space-y-4"
            style={{ scrollBehavior: 'smooth' }}
          >
            {empty ? (
              <div className="text-center py-12 text-[color:var(--labs-ink-muted)]">
                <p className="text-sm">Empieza por contarnos qué quieres construir.</p>
              </div>
            ) : (
              state.messages.map(m => <LabsMessage key={m.id} message={m} />)
            )}
            {isStreaming && (
              <div className="text-xs text-[color:var(--labs-ink-muted)] px-1">Escribiendo…</div>
            )}
          </div>

          {/* Input area */}
          <div className="rounded-2xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] p-4 shadow-[var(--labs-shadow-soft)]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="¿Qué quieres construir?"
              rows={empty ? 3 : 2}
              className="w-full bg-transparent border-0 outline-none resize-none text-[color:var(--labs-ink)] placeholder:text-[color:var(--labs-ink-muted)] text-base"
              disabled={isStreaming}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-[color:var(--labs-ink-muted)]">
                {state.messages.length > 0 && (
                  <button onClick={restart} className="hover:underline">
                    Empezar de nuevo
                  </button>
                )}
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-40 bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white"
              >
                Enviar
              </button>
            </div>
          </div>

          {/* Chips */}
          {empty && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-4 py-2 rounded-full text-sm border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] text-[color:var(--labs-ink)] hover:border-[color:var(--labs-accent)] hover:-translate-y-px transition-all duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Summary panel */}
        <LabsSummary
          fields={state.fields}
          onEdit={(field, value) => setFields(prev => ({ ...prev, [field]: value }))}
          canSubmit={isComplete(state.fields)}
          onSubmit={() => setSubmitModalOpen(true)}
        />
      </div>

      {submitModalOpen && (
        <LabsSubmitModal
          fields={state.fields}
          onClose={() => setSubmitModalOpen(false)}
          onConfirm={async notes => {
            const result = await handleSubmitConfirmed(notes);
            if (result.success) {
              setSubmitted(true);
              clearStorage();
              setSubmitModalOpen(false);
            } else {
              setSubmitError(result.message);
            }
            return result;
          }}
        />
      )}

      {submitError && (
        <div className="fixed bottom-6 right-6 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
          {submitError}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
npx astro check 2>&1 | grep "labs/" | head -20
```

Expected: errors only for missing imports (`LabsSummary`, `LabsMessage`, etc.) — those are next tasks.

- [ ] **Step 3: Commit (it won't compile yet — that's fine, commit incrementally)**

```bash
git add src/components/labs/LabsChat.tsx
git commit -m "feat: LabsChat island skeleton with state and storage"
```

---

### Task 10: Build LabsMessage bubble component

**Files:**
- Create: `src/components/labs/LabsMessage.tsx`

- [ ] **Step 1: Create the message bubble**

```tsx
// src/components/labs/LabsMessage.tsx
import type { ChatMessage } from '../../lib/labs/types';

export default function LabsMessage({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
          isUser
            ? 'bg-[color:var(--labs-accent)] text-white rounded-tr-sm'
            : 'bg-[color:var(--labs-bg-elevated)] text-[color:var(--labs-ink)] border border-[color:var(--labs-rule)] rounded-tl-sm'
        }`}
      >
        <div className="whitespace-pre-wrap">{message.content}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/labs/LabsMessage.tsx
git commit -m "feat: LabsMessage bubble component"
```

---

### Task 11: Build LabsSummary live panel

**Files:**
- Create: `src/components/labs/LabsSummary.tsx`

- [ ] **Step 1: Create summary panel with editable tags**

```tsx
// src/components/labs/LabsSummary.tsx
import { useState } from 'react';
import type { ExtractedFields, ProjectType, Urgency } from '../../lib/labs/types';

interface Props {
  fields: ExtractedFields;
  onEdit: (field: keyof ExtractedFields, value: ExtractedFields[keyof ExtractedFields]) => void;
  canSubmit: boolean;
  onSubmit: () => void;
}

const projectTypeLabels: Record<ProjectType, string> = {
  'web-app': 'Web App',
  'mobile-app': 'App Móvil',
  dashboard: 'Dashboard',
  automation: 'Automatización',
  'ai-agent': 'Agente AI',
  integration: 'Integración',
  report: 'Reporte',
  other: 'Otro',
};

const urgencyLabels: Record<Urgency, string> = {
  hoy: 'Hoy',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mes',
  'sin-prisa': 'Sin prisa',
};

interface RowProps {
  label: string;
  value: string | undefined;
  pending?: boolean;
}

function Row({ label, value, pending }: RowProps) {
  return (
    <div className="py-3 border-b border-[color:var(--labs-rule)] last:border-b-0">
      <div className="text-[10px] uppercase tracking-widest text-[color:var(--labs-ink-muted)] mb-1">
        {label}
      </div>
      <div
        className={`text-sm ${
          pending ? 'text-[color:var(--labs-ink-muted)] italic' : 'text-[color:var(--labs-ink)]'
        }`}
      >
        {pending ? 'pendiente' : value}
      </div>
    </div>
  );
}

export default function LabsSummary({ fields, canSubmit, onSubmit }: Props) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-2xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] p-5 shadow-[var(--labs-shadow-soft)]">
        <div className="text-xs uppercase tracking-widest text-[color:var(--labs-accent)] font-semibold mb-3">
          Resumen vivo
        </div>

        <Row
          label="Tipo"
          value={
            fields.projectType === 'other' && fields.projectTypeFreeText
              ? `Otro: ${fields.projectTypeFreeText}`
              : fields.projectType
              ? projectTypeLabels[fields.projectType]
              : undefined
          }
          pending={!fields.projectType}
        />
        <Row label="Contexto" value={fields.businessContext} pending={!fields.businessContext} />
        <Row label="Funcionalidad" value={fields.coreFunctionality} pending={!fields.coreFunctionality} />
        <Row
          label="Integraciones"
          value={
            fields.integrations === undefined
              ? undefined
              : fields.integrations.length === 0
              ? 'ninguna'
              : fields.integrations.join(', ')
          }
          pending={fields.integrations === undefined}
        />
        <Row label="Diseño" value={fields.designReference} pending={!fields.designReference} />
        <Row
          label="Urgencia"
          value={fields.urgency ? urgencyLabels[fields.urgency] : undefined}
          pending={!fields.urgency}
        />
        <Row
          label="Contacto"
          value={fields.contact ? `${fields.contact.name} · ${fields.contact.email}` : undefined}
          pending={!fields.contact?.name || !fields.contact?.email}
        />

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full mt-4 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
            canSubmit
              ? 'bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white shadow-[var(--labs-shadow-pop)] hover:-translate-y-0.5'
              : 'bg-[color:var(--labs-rule)] text-[color:var(--labs-ink-muted)] cursor-not-allowed'
          }`}
        >
          {canSubmit ? 'Enviar a Jose' : 'Faltan datos'}
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/labs/LabsSummary.tsx
git commit -m "feat: LabsSummary live panel"
```

---

### Task 12: Wire chat client to streaming endpoint

**Files:**
- Modify: `src/components/labs/LabsChat.tsx` (replace the `sendMessage` stub from Task 9)

- [ ] **Step 1: Replace the `sendMessage` stub with the streaming implementation**

Find this block:

```tsx
const sendMessage = useCallback(
  async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: Date.now() };
    addMessage(userMsg);
    setInput('');
    setIsStreaming(true);
    // TODO: wire to /api/labs/chat in Task 12
    setIsStreaming(false);
  },
  [isStreaming, addMessage]
);
```

Replace with:

```tsx
const sendMessage = useCallback(
  async (text: string) => {
    if (!text.trim() || isStreaming) return;
    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: Date.now() };
    addMessage(userMsg);
    setInput('');
    setIsStreaming(true);

    const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', content: '', timestamp: Date.now() };
    addMessage(assistantMsg);

    // Build the message history we'll send to the server (after adding userMsg)
    const history = [...state.messages, userMsg].map(m => ({ role: m.role, content: m.content }));

    // Tool-call assembly buffer (deltas can arrive across chunks)
    const toolCallBuffer: Record<number, { name?: string; args: string }> = {};

    try {
      const res = await fetch('/api/labs/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history }),
      });

      if (!res.ok || !res.body) {
        const errBody = await res.text();
        updateLastAssistant(`\n\n_Error: ${errBody.slice(0, 200)}_`);
        setIsStreaming(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const ev of events) {
          if (!ev.startsWith('data: ')) continue;
          const json = ev.slice(6);
          try {
            const parsed = JSON.parse(json);
            if (parsed.type === 'text') {
              updateLastAssistant(parsed.value);
            } else if (parsed.type === 'tool_call_delta') {
              const tc = parsed.value;
              const idx: number = tc.index ?? 0;
              if (!toolCallBuffer[idx]) toolCallBuffer[idx] = { args: '' };
              if (tc.function?.name) toolCallBuffer[idx].name = tc.function.name;
              if (tc.function?.arguments) toolCallBuffer[idx].args += tc.function.arguments;
            } else if (parsed.type === 'done') {
              // Process accumulated tool calls
              for (const tc of Object.values(toolCallBuffer)) {
                if (tc.name === 'updateBrief' && tc.args) {
                  try {
                    const args = JSON.parse(tc.args) as ExtractedFields;
                    setFields(prev => mergeFields(prev, args));
                  } catch (e) {
                    console.warn('Failed to parse updateBrief args', e);
                  }
                } else if (tc.name === 'finalizeBrief') {
                  // Agent signaled the user confirmed — auto-open the modal
                  if (isComplete(stateRef.current.fields)) {
                    setSubmitModalOpen(true);
                  }
                }
              }
            } else if (parsed.type === 'error') {
              updateLastAssistant(`\n\n_Error: ${parsed.message}_`);
            }
          } catch {
            // ignore malformed event
          }
        }
      }
    } catch (err) {
      updateLastAssistant(`\n\n_Error de conexión._`);
      console.error(err);
    } finally {
      setIsStreaming(false);
    }
  },
  [isStreaming, addMessage, updateLastAssistant, state.messages, setFields]
);
```

- [ ] **Step 2: Add the `mergeFields` helper and a `stateRef` near the top of the component**

Just below `const scrollRef = useRef<HTMLDivElement>(null);` add:

```tsx
const stateRef = useRef(state);
useEffect(() => {
  stateRef.current = state;
}, [state]);

function mergeFields(prev: ExtractedFields, next: ExtractedFields): ExtractedFields {
  const merged: ExtractedFields = { ...prev };
  for (const key of Object.keys(next) as (keyof ExtractedFields)[]) {
    const v = next[key];
    if (v === undefined || v === null) continue;
    if (key === 'integrations' && Array.isArray(v)) {
      merged.integrations = v as string[];
    } else if (key === 'contact' && typeof v === 'object') {
      merged.contact = { ...(prev.contact ?? { name: '', email: '' }), ...(v as ExtractedFields['contact']) };
    } else {
      // @ts-expect-error — generic write through
      merged[key] = v;
    }
  }
  return merged;
}
```

- [ ] **Step 3: Smoke test**

```bash
npm run dev
```

Open `http://localhost:4321/labs` in browser (page doesn't exist yet — will 404; we test wiring in Task 17).

Skip browser test until Task 17 lands.

- [ ] **Step 4: Commit**

```bash
git add src/components/labs/LabsChat.tsx
git commit -m "feat: wire LabsChat to streaming /api/labs/chat with tool-call extraction"
```

---

### Task 13: Build LabsSubmitModal

**Files:**
- Create: `src/components/labs/LabsSubmitModal.tsx`

- [ ] **Step 1: Build the modal**

```tsx
// src/components/labs/LabsSubmitModal.tsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ExtractedFields, SubmitResponse } from '../../lib/labs/types';

interface Props {
  fields: ExtractedFields;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<SubmitResponse>;
}

export default function LabsSubmitModal({ fields, onClose, onConfirm }: Props) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lock body scroll using position-fixed pattern (per CLAUDE.md scrollytelling rule)
  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    return () => {
      const savedY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, parseInt(savedY || '0') * -1);
    };
  }, []);

  const handleSend = async () => {
    setSubmitting(true);
    setError(null);
    const result = await onConfirm(notes);
    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
    }
    // success path: parent unmounts this component
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-theme="labs"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[color:var(--labs-bg-elevated)] border border-[color:var(--labs-rule)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-serif italic text-[color:var(--labs-ink)] mb-2">¿Mando esto a Jose?</h2>
        <p className="text-sm text-[color:var(--labs-ink-muted)] mb-5">
          Jose te confirma timeline y costo en menos de 24 horas.
        </p>

        <div className="space-y-2 mb-5 text-sm">
          <div>
            <span className="text-[color:var(--labs-ink-muted)]">Tipo:</span>{' '}
            <span className="text-[color:var(--labs-ink)]">{fields.projectType}</span>
          </div>
          <div>
            <span className="text-[color:var(--labs-ink-muted)]">Contacto:</span>{' '}
            <span className="text-[color:var(--labs-ink)]">
              {fields.contact?.name} ({fields.contact?.email})
            </span>
          </div>
        </div>

        <label className="block text-xs uppercase tracking-widest text-[color:var(--labs-ink-muted)] mb-2">
          ¿Algo más que quieras agregar para Jose? (opcional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Cualquier detalle extra que no salió en la conversación…"
          className="w-full bg-[color:var(--labs-bg)] border border-[color:var(--labs-rule)] rounded-lg p-3 text-sm text-[color:var(--labs-ink)] placeholder:text-[color:var(--labs-ink-muted)] outline-none focus:border-[color:var(--labs-accent)]"
        />

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">{error}</div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-full text-sm font-medium border border-[color:var(--labs-rule)] text-[color:var(--labs-ink)] hover:bg-[color:var(--labs-bg)]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-full text-sm font-medium bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white disabled:opacity-50"
          >
            {submitting ? 'Enviando…' : 'Enviar a Jose'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/labs/LabsSubmitModal.tsx
git commit -m "feat: LabsSubmitModal with portal and scroll lock"
```

---

### Task 14: Wire submit handler to backend

**Files:**
- Modify: `src/components/labs/LabsChat.tsx` (replace the `handleSubmitConfirmed` stub from Task 9)

- [ ] **Step 1: Replace the stub `handleSubmitConfirmed`**

Find:

```tsx
const handleSubmitConfirmed = async (additionalNotes: string): Promise<SubmitResponse> => {
  // TODO: wire to /api/labs/submit in Task 14
  return { success: false, message: 'not implemented' };
};
```

Replace with:

```tsx
const handleSubmitConfirmed = async (additionalNotes: string): Promise<SubmitResponse> => {
  if (!isComplete(state.fields)) {
    return { success: false, message: 'Faltan datos en el brief' };
  }
  try {
    const res = await fetch('/api/labs/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: state.sessionId,
        fields: state.fields,
        additionalNotes: additionalNotes.trim() || undefined,
        transcript: state.messages,
      }),
    });
    const data = (await res.json()) as SubmitResponse;
    return data;
  } catch (err) {
    return { success: false, message: 'Error de conexión. Intenta de nuevo.' };
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/components/labs/LabsChat.tsx
git commit -m "feat: wire LabsChat submit handler to /api/labs/submit"
```

---

### Task 15: Build LabsSuccessScreen

**Files:**
- Create: `src/components/labs/LabsSuccessScreen.tsx`

- [ ] **Step 1: Create the success screen**

```tsx
// src/components/labs/LabsSuccessScreen.tsx
interface Props {
  onRestart: () => void;
}

export default function LabsSuccessScreen({ onRestart }: Props) {
  return (
    <div data-theme="labs" className="w-full max-w-2xl mx-auto px-6 py-24 text-center">
      <div className="text-6xl mb-6">✓</div>
      <h2 className="text-4xl md:text-5xl font-serif italic text-[color:var(--labs-ink)] mb-4">
        Brief enviado.
      </h2>
      <p className="text-lg text-[color:var(--labs-ink-muted)] mb-10 max-w-md mx-auto">
        Jose lo revisa personalmente. Te confirma timeline y costo en menos de 24 horas.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/"
          className="px-6 py-3 rounded-full text-sm font-medium bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white transition-colors"
        >
          Volver al inicio
        </a>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-full text-sm font-medium border border-[color:var(--labs-rule)] text-[color:var(--labs-ink)] hover:bg-[color:var(--labs-bg-elevated)] transition-colors"
        >
          Empezar otro brief
        </button>
      </div>
    </div>
  );
}
```

Note: the spec calls for *no emojis*. The check mark above is a Unicode character (U+2713), not an emoji glyph — but if the project's "no emojis" rule is interpreted strictly, replace with an inline SVG check or just a typographic mark. Recommended replacement:

```tsx
<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
     className="mx-auto mb-6 text-[color:var(--labs-accent)]">
  <circle cx="12" cy="12" r="10" />
  <path d="M9 12l2 2 4-4" />
</svg>
```

Use the SVG version. Replace `<div className="text-6xl mb-6">✓</div>` with the SVG above.

- [ ] **Step 2: Commit**

```bash
git add src/components/labs/LabsSuccessScreen.tsx
git commit -m "feat: LabsSuccessScreen post-submit state"
```

---

## Phase 6: Page assembly

### Task 16: Create LabsHero section

**Files:**
- Create: `src/components/labs/LabsHero.astro`

- [ ] **Step 1: Build the hero**

```astro
---
// src/components/labs/LabsHero.astro
---

<section class="px-6 pt-32 pb-12 md:pt-40 md:pb-16">
  <div class="max-w-[1200px] mx-auto text-center">
    <span
      class="inline-block text-[10px] uppercase tracking-[0.25em] font-semibold mb-6"
      style="color: var(--labs-accent);"
    >
      Avoqado Labs
    </span>

    <h1
      class="font-serif italic text-5xl md:text-7xl lg:text-8xl leading-[1.05] tracking-tight mb-6"
      style="color: var(--labs-ink);"
    >
      Lo que pidas.<br/>
      <span style="color: var(--labs-accent);">En menos de un día.</span>
    </h1>

    <p class="text-lg md:text-xl max-w-xl mx-auto leading-relaxed" style="color: var(--labs-ink-muted);">
      Software a la medida construido por agentes AI y revisado por humanos.
      Cuéntanos qué necesitas — armamos el brief, Jose te confirma timeline y costo.
    </p>
  </div>
</section>

<style>
  h1 {
    font-family: var(--font-family-serif), Georgia, serif;
  }
</style>
```

- [ ] **Step 2: Commit**

```bash
git add src/components/labs/LabsHero.astro
git commit -m "feat: LabsHero editorial section"
```

---

### Task 17: Create the /labs page

**Files:**
- Create: `src/pages/labs.astro`

- [ ] **Step 1: Build the page**

```astro
---
// src/pages/labs.astro
import '../styles/global.css';
import Navbar from '../components/layout/Navbar.astro';
import Footer from '../components/layout/Footer.astro';
import LabsHero from '../components/labs/LabsHero.astro';
import LabsChat from '../components/labs/LabsChat.tsx';
---

<!doctype html>
<html lang="es" data-theme="labs">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Avoqado Labs — Software a la medida en menos de un día</title>
    <meta name="description" content="Avoqado Labs construye software a la medida con agentes AI. Apps, dashboards, integraciones, automatizaciones y agentes — entregados en menos de un día." />
    <link rel="icon" type="image/png" href="/favicon.png" />
  </head>
  <body data-theme="labs" data-nav-light="true" style="background-color: var(--labs-bg);">
    <Navbar position="fixed" transparentOnTop={false} />

    <LabsHero />

    <LabsChat client:load />

    <Footer />
  </body>
</html>
```

- [ ] **Step 2: Smoke test in browser**

```bash
npm run dev
```

Open `http://localhost:4321/labs`. Verify:
- Page loads with cream background
- Hero shows in Playfair italic
- Chat input is visible with placeholder "¿Qué quieres construir?"
- 3 suggestion chips show below the input
- Right-side summary panel shows 7 "pendiente" rows on desktop
- Type a message → assistant streams response
- Click a suggestion chip → fills input

Stop dev server with Ctrl+C.

- [ ] **Step 3: Commit**

```bash
git add src/pages/labs.astro
git commit -m "feat: /labs page assembly"
```

---

## Phase 7: Navbar integration

### Task 18: Add Labs entry to NavigationMenu

**Files:**
- Modify: `src/components/interactive/NavigationMenu.tsx`

- [ ] **Step 1: Add Labs link in the desktop nav (after the "Traje a la medida" entry)**

Find around line 158-165:

```tsx
<a
  href="/traje-a-la-medida"
  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
    isDark ? 'text-white/80 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
  }`}
>
  Traje a la medida
</a>
```

Insert directly after it:

```tsx
<a
  href="/labs"
  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
    isDark ? 'text-white/80 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
  }`}
>
  Labs
</a>
```

- [ ] **Step 2: Add Labs entry to the mobile menu**

Find the mobile menu sections and add a Labs link in the same group as "Traje a la medida". Search for `Traje a la medida` in the file — there should be a mobile-side reference around line 425+. Add a sibling entry right after it:

```tsx
<a href="/labs" className="block p-2.5 text-sm font-medium text-gray-600 hover:text-gray-900">
  Labs
</a>
```

If the mobile section structure is different from this snippet, adapt to match the surrounding pattern (use the same className and onClick if present).

- [ ] **Step 3: Update light-page detection so /labs triggers light navbar**

Find the `useEffect` that detects light pages (around line 58-66):

```tsx
useEffect(() => {
  const bodyBg = document.body.style.backgroundColor || '';
  const computedBg = window.getComputedStyle(document.body).backgroundColor;
  const isLight = bodyBg.includes('fff') || bodyBg.includes('white') || computedBg === 'rgb(255, 255, 255)';
  if (isLight) {
    setIsLightPage(true);
    setScrolled(true);
  }
}, []);
```

Replace with:

```tsx
useEffect(() => {
  const bodyBg = document.body.style.backgroundColor || '';
  const computedBg = window.getComputedStyle(document.body).backgroundColor;
  const explicitLight = document.body.dataset.navLight === 'true';
  const isLight =
    explicitLight ||
    bodyBg.includes('fff') ||
    bodyBg.includes('white') ||
    computedBg === 'rgb(255, 255, 255)';
  if (isLight) {
    setIsLightPage(true);
    setScrolled(true);
  }
}, []);
```

This honors the `data-nav-light="true"` attribute we set on the `<body>` of `/labs.astro` in Task 17.

- [ ] **Step 4: Smoke test**

```bash
npm run dev
```

- Visit `/` — navbar starts transparent over the dark hero, transitions to white on scroll. "Labs" link visible after "Traje a la medida".
- Visit `/labs` — navbar shows in light mode immediately (no scroll needed). "Labs" link is highlighted as current page (no special styling needed for v1, just confirm it works).
- Click "Labs" from `/` — navigates to `/labs`.
- Click "Avoqado" logo from `/labs` — navigates back to `/`.

Kill dev server with Ctrl+C.

- [ ] **Step 5: Commit**

```bash
git add src/components/interactive/NavigationMenu.tsx
git commit -m "feat: add Labs entry to navbar with light-page detection"
```

---

## Phase 8: Build & end-to-end smoke

### Task 19: Production build and final smoke

**Files:**
- (read-only verification)

- [ ] **Step 1: Type-check the whole project**

```bash
cd /Users/amieva/Documents/Programming/Avoqado/avoqado-landing
npx astro check
```

Expected: 0 errors. If errors appear in `src/components/labs/` or `src/lib/labs/` or `src/pages/labs.astro` or `src/pages/api/labs/`, fix them before continuing.

- [ ] **Step 2: Run the production build**

```bash
npm run build
```

Expected: build completes without errors. Cloudflare adapter should bundle the API routes.

- [ ] **Step 3: Preview the production build (skip if no cloudflared tunnel set up)**

```bash
npm run preview
```

If the `preview` script fails (it requires cloudflared), use:

```bash
npm run dev
```

instead, and test against the dev server.

- [ ] **Step 4: Manual end-to-end test (golden path)**

In the browser, visit `/labs` and walk through:

1. Hero loads, Playfair italic headline visible
2. Type: *"Quiero un dashboard que conecte mi POS con WhatsApp para que mi mesero reciba alertas cuando una cuenta lleva mucho tiempo abierta"*
3. Agent should ask follow-ups; respond conversationally:
   - "Es para un restaurante de 8 mesas en CDMX"
   - "Que el alert llegue después de 90 minutos sin actividad"
   - "Mi POS es Avoqado" → agent should redirect to `/traje-a-la-medida`
4. Restart with **Empezar de nuevo** — confirm dialog clears state
5. Re-do with: *"Quiero una app para registrar el inventario de mi tienda de ropa"* (NOT Avoqado-related)
6. Provide all 7 fields through normal conversation
7. Confirm summary panel populates one tag at a time
8. When all tags populated, click **Enviar a Jose**
9. Modal opens; add a note; click **Enviar a Jose**
10. Success screen appears; check email inbox of `LABS_NOTIFY_EMAIL` for the brief HTML email + JSON attachment + confirmation email to user

- [ ] **Step 5: Manual edge-case checks**

- Refresh page mid-conversation → conversation restored from localStorage
- Open DevTools → Application → Local Storage → confirm `avoqado-labs-conversation-v1` key is present with expected shape
- Resize to mobile (< 768px) → summary panel stacks below chat (or whatever responsive behavior was implemented)
- Try sending without API key (temporarily rename `OPENAI_API_KEY` in .env) → graceful error toast

- [ ] **Step 6: Commit anything you fixed during smoke**

```bash
git status
# If any fixes were made:
git add -A
git commit -m "fix: smoke test polish for /labs"
```

- [ ] **Step 7: Final summary commit (if needed)**

```bash
git log --oneline -20
```

Verify the Labs feature work appears as a coherent series of commits on the current branch.

---

## Out of Plan (Spec §10 — explicitly deferred)

These are intentionally not implemented in v1:

- Magic-link email verification before submit (spec §9 lists it as v1 default but for an MVP without auth infra, deferred — added to follow-up plan if Jose decides spam is real)
- Voice input
- Server-side conversation persistence
- Slack/Discord notifications to Jose
- Real-time "Jose is reviewing" indicator
- Analytics dashboard for funnel metrics
- A/B testing framework

If Jose's inbox starts getting spam, the next plan should add:
1. Cloudflare Turnstile or similar captcha on the chat endpoint
2. Magic-link verification on submit
3. Server-side rate-limit-per-IP using a KV store (the in-memory limiter in Task 7 is best-effort only)

---

## Self-Review Notes

After writing this plan, the following spec coverage gaps were identified and addressed:

- **§5.6 persistence** — covered in Tasks 9 (storage helpers) and 17 (page hydration with `client:load`). Storage version key matches spec.
- **§5.5 edge cases** — handled at the system-prompt level (Task 5). The frontend doesn't enforce them; the agent does.
- **§4.3 motion** — minimal in v1. Tags appear via React re-renders only; no spring animations. Acceptable for MVP; can be added later with framer-motion (already installed).
- **§9 magic-link verification** — explicitly deferred to "Out of Plan" with reasoning. Spec promised it; v1 ships without it because adding email verification doubles the implementation surface and the email-channel is already a friction filter.
- **§9 idle timeout 24h** — implemented in Task 9 via `IDLE_MS` constant.
- **§9 conversation length cap (30 turns)** — partially enforced server-side in Task 7 (`messages.length > 60` rejects, since each turn = 2 messages user+assistant). Agent prompt does not explicitly suggest submitting at the cap; can be added to system prompt later.
- **§5.3 streaming acknowledgment + tag animation** — tags update on each tool-call delta but without animation. Hooked place to add motion later is `LabsSummary` `Row` component.
- **§7 contact validation** — server-side only via regex in `submit.ts`. No client-side blocker; user can attempt submit with bad email and see server error. Acceptable for v1; client validation can be added in modal.
