# Avoqado Labs — Design Spec

**Date:** 2026-05-04
**Status:** Approved (brainstorm), pending implementation plan
**Owner:** Jose Antonio Amieva

---

## 1. Summary

Avoqado Labs is a new sub-brand of Avoqado positioned as an AI-powered boutique software agency. Clients describe what they want to build through a conversational chatbot; the agent qualifies the request, extracts a structured brief, and emails it to Jose for human review and delivery. Promise: most projects delivered in less than one day, leveraging Avoqado's AI agents and engineering pipeline.

Labs lives at `/labs` as a dedicated page accessible from the main navbar. It is **distinct from** `/traje-a-la-medida`, which remains focused on customizations on top of Avoqado's existing infrastructure.

## 2. Service Definition

### 2.1 What Labs is

A boutique custom software development service. Audience: any business owner — restaurant, hotel, gym, retail, professional services, indie founder, marketing manager — who needs custom software fast and is willing to brief an AI sales agent to start the conversation.

Typical deliverables:

- Web apps and dashboards
- Mobile apps (light scope)
- Integrations between systems (POS, WhatsApp, Stripe, Sheets, ERPs)
- Automations and scheduled workflows
- AI agents and chatbots for internal processes
- Custom reports and analytics tooling

### 2.2 What Labs is NOT

- Customizations on top of an existing Avoqado installation (those go to `/traje-a-la-medida`)
- Games or hardware projects
- Pure branding, logo design, or marketing creative work
- Pure marketing campaign execution (Google Ads management, paid social, etc.)
- Anything where Jose cannot review and ship within a few days with confidence

### 2.3 Promise vs. commitment

Marketing promise: "Lo que pidas, en menos de un día." This is an ambition statement, not a per-conversation commitment.

The agent **never** quotes a specific timeline or price during the chat. The agent always closes with: *"Jose te confirma timeline y costo en menos de 24 horas."* Human-in-the-loop is the quality gate.

## 3. Information Architecture

### 3.1 Navbar

Add a new top-level entry **"Labs"** linking to `/labs`. Position: alongside existing entries (Traje a la medida stays as-is).

No teaser of Labs on the homepage (`/`). The chatbot is reachable only through the navbar entry or direct link.

### 3.2 Page composition (`/labs`)

```
┌─────────────────────────────────────────────────┐
│ Navbar (existing, transparentOnTop)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  HERO (compact)                                 │
│  - Eyebrow: "AVOQADO LABS"                      │
│  - Headline: Playfair italic, large, editorial  │
│    "Lo que pidas. En menos de un día."          │
│  - Sub: 1–2 line value prop in DM Sans          │
│  - 3 example chips (clickable, prefill chat)    │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│  CHATBOT (protagonist)                          │
│  ┌──────────────────────┬───────────────────┐   │
│  │                      │  Resumen vivo     │   │
│  │  Conversation        │  - Tipo           │   │
│  │  ↑ messages          │  - Contexto       │   │
│  │                      │  - Funcionalidad  │   │
│  │                      │  - Integraciones  │   │
│  │                      │  - Diseño         │   │
│  │                      │  - Urgencia       │   │
│  │  Input grande     ↓  │  - Contacto       │   │
│  │                      │                   │   │
│  │                      │  [Enviar a Jose]  │   │
│  └──────────────────────┴───────────────────┘   │
│                                                 │
├─────────────────────────────────────────────────┤
│ Footer (minimal: logo, legal links)             │
└─────────────────────────────────────────────────┘
```

No additional narrative sections. The page is a focused conversion surface.

### 3.3 Mobile layout

- Hero stacks vertically, headline scales to fluid clamp
- Chat goes full-width, the live summary collapses into a sticky bottom sheet that expands on tap
- "Enviar a Jose" CTA becomes sticky bottom button when summary is complete
- 3 example chips wrap into a horizontal scroll if needed

## 4. Visual Identity — Editorial Light

A deliberate visual departure from Avoqado's dark-first aesthetic. The contrast is the brand statement: "Labs is its own thing."

### 4.1 Tokens

Define under a `[data-theme="labs"]` scope in `global.css` so Labs tokens do not pollute the rest of the site.

| Token | Value | Use |
|---|---|---|
| `--labs-bg` | `oklch(0.97 0.012 80)` | Page background (warm cream) |
| `--labs-bg-elevated` | `oklch(0.99 0.008 80)` | Cards, chat bubbles, summary panel |
| `--labs-ink` | `oklch(0.22 0.012 250)` | Body text (charcoal, not pure black) |
| `--labs-ink-muted` | `oklch(0.45 0.015 250)` | Secondary text |
| `--labs-rule` | `oklch(0.88 0.015 80)` | Borders, dividers |
| `--labs-accent` | `oklch(0.62 0.16 35)` | Terracotta — CTAs, tags, focus |
| `--labs-accent-hover` | `oklch(0.55 0.17 35)` | Hover state |
| `--labs-accent-soft` | `oklch(0.92 0.05 35)` | Tag backgrounds, soft fills |

### 4.2 Typography

- **Headlines:** Playfair Display italic, 300–400 weight, tight tracking, large sizes (clamp 2.5rem → 5rem)
- **Body:** DM Sans, 400 weight, 1.6 line-height
- **Eyebrow / labels:** DM Sans uppercase, 600 weight, wide tracking, 0.75rem
- **Chat messages:** DM Sans, 400 weight, comfortable size (1rem desktop / 0.95rem mobile)
- **Brand mark:** Baby Doll only for the Avoqado logo, never for Labs headlines

### 4.3 Motion

Subtle, editorial. No flashy gradients or rainbow shifts.

- Hero headline fade-up on load
- Example chips: hover lifts 2px with soft shadow
- Tags appear in summary panel with a small spring fade-in (one at a time as the agent extracts them)
- Send-to-Jose CTA uses a "stamp" animation (scale 1.0 → 1.05 → settle) when summary completes
- Respect `prefers-reduced-motion`

### 4.4 What to avoid

- Pure black text or backgrounds
- Cool gray neutrals (always tint warm: hue 35–80)
- Glassmorphism, neon glows, animated gradients (those belong to other aesthetic systems, not Labs)
- Any element that copies the Lovable / Vercel / ChatGPT visual signature

## 5. Conversation UX

### 5.1 Entry state

User lands on `/labs`. Below the hero:

- Large input box with placeholder: *"¿Qué quieres construir?"*
- Three suggestion chips below the input (defined in §5.2)
- Empty conversation area above the input
- Right-side panel shows the 7 summary fields as empty placeholders ("Tipo · pendiente", etc.)
- Send-to-Jose CTA disabled until all 7 fields are present

### 5.2 Suggestion chips (3 examples)

Goal: span verticals, prove range, inspire without constraining. Final copy can be tuned, but the structure:

1. *"Un dashboard que conecte mi POS con WhatsApp"* — operations × integrations
2. *"Un agente que conteste reservaciones automáticamente"* — AI agent × hospitality
3. *"Un reporte diario de ventas que me llegue al correo"* — analytics × automation

Click on a chip prefills the input with that text. User can edit before sending.

### 5.3 Conversation flow

1. User sends first message (free-text or chip-prefilled)
2. Agent responds via streaming chat completion
3. Agent's job each turn: ask the next most informative question to fill missing summary fields, in a warm consultative tone
4. After each agent message, the structured-extraction layer runs and updates summary tags
5. User sees tags appear in real-time in the summary panel; each tag is editable inline
6. Agent acknowledges what's been understood, asks for the next missing piece
7. When all 7 fields are present, agent says: *"Creo que ya tengo todo. ¿Quieres que mande esto a Jose, o agregamos algo más?"*
8. Send-to-Jose CTA enables (with stamp animation)

### 5.4 Submit flow

1. User clicks "Enviar a Jose"
2. Modal opens with full structured summary + an optional textarea ("¿Algo más que quieras agregar para Jose?")
3. Email/contact field is validated (must be a valid email; WhatsApp optional but recommended)
4. User clicks "Enviar"
5. Loading state (skeleton or spinner with "Enviando…")
6. Success screen: *"Jose recibió tu brief. Te confirma timeline y costo en menos de 24 horas."* + a "Volver al inicio" link that navigates to `/`
7. localStorage cleared for the conversation

### 5.5 Edge cases the agent must handle

| Scenario | Agent behavior |
|---|---|
| User asks for Avoqado-infra customization ("quiero un nuevo módulo en mi dashboard de Avoqado") | Warmly redirect: *"Eso vive en Traje a la medida — [link]. Aquí en Labs construimos cosas que viven fuera de tu instalación de Avoqado."* |
| User asks for out-of-scope work (game, hardware, pure branding, marketing campaign management) | Cálidamente explicar el límite y sugerir alternativa. Si tiene un componente que sí cae en alcance, ofrecer ese subset. |
| User is vague ("quiero algo cool") | Hacer una sola pregunta abierta para anclar contexto: "¿Para qué tipo de negocio? ¿Qué problema te quita el sueño?" |
| User pide precio o fecha específica | "No te puedo confirmar costo ni fecha aquí — Jose lo revisa personalmente. Mándalo y te confirma en <24h." |
| User da info contradictoria | Reconocer la contradicción y pedir aclaración explícita. |
| Conversation drifts off-topic | Re-anclar: "Para no perderlo, volvamos a tu proyecto. ¿[siguiente campo pendiente]?" |
| User refuses to share contact at the end | Explicar que sin contacto Jose no puede dar follow-up; ofrecer email mínimo solamente. |

### 5.6 Persistence

- Conversation state (messages, extracted fields, partial input) saved to `localStorage` under key `avoqado-labs-conversation-v1`
- On page refresh, restore the conversation (the user picks up exactly where they left off)
- On successful submit, clear localStorage
- A small "Empezar de nuevo" link in the chat header clears state with a confirmation

## 6. Agent Behavior — System Prompt Spec

The system prompt must encode:

1. **Identity:** "Eres consultor-vendedor de Avoqado Labs, una agencia AI que construye software a la medida en menos de un día."
2. **Tone:** warm, consultative, concise. Speaks Spanish by default; switches to English if the user writes in English. Never robotic, never pushy.
3. **Goal:** extract a structured brief covering 7 fields (see §7) through natural conversation.
4. **Hard rules:**
   - Never quote a specific timeline (no "te lo entrego mañana"). Always defer to Jose.
   - Never quote a specific price.
   - Never promise scope that hasn't been confirmed.
   - Always close with Jose handoff.
5. **Routing rules:** redirect Avoqado-infra requests to `/traje-a-la-medida`; redirect out-of-scope requests with a warm explanation.
6. **Conversation strategy:** ask one question at a time. Prefer multiple-choice or concrete examples over open-ended when possible. Acknowledge what was understood before asking the next question.
7. **Self-awareness:** if asked, the agent can say it's an AI assistant, that Jose reviews every brief personally, and that the AI agents at Avoqado Labs do the heavy lifting on delivery.

The exact prompt copy is owned by implementation; this spec defines the contract.

## 7. Structured Brief — 7 Fields

Each field is captured via OpenAI function calling so extraction is deterministic, not regex on chat text.

| Field | Type | Required for submit | Notes |
|---|---|---|---|
| `projectType` | enum (`web-app`, `mobile-app`, `dashboard`, `automation`, `ai-agent`, `integration`, `report`, `other`) | Yes | "other" requires `projectTypeFreeText` |
| `businessContext` | string (industry, size, problem) | Yes | Free-text, ~1–3 sentences |
| `coreFunctionality` | string | Yes | One-sentence description of what it must do |
| `integrations` | array of strings | Yes | Empty array allowed if user explicitly says "ninguna" |
| `designReference` | string \| URL | Yes | "minimal", "como Notion", a URL, or "no tengo referencia" all valid |
| `urgency` | enum (`hoy`, `esta-semana`, `este-mes`, `sin-prisa`) | Yes | |
| `contact` | object: `{ name, email, whatsapp? }` | Yes | `email` validated; `whatsapp` optional but encouraged |

Each field is editable from the summary panel: click → inline editor → save returns to display state.

## 8. Technical Approach

### 8.1 Stack

- **Page:** `src/pages/labs.astro` (Astro page)
- **React island:** `src/components/labs/LabsChat.tsx` (renamed/scoped under a new `labs/` folder to keep the sub-brand separated from existing components)
- **Hydration:** `client:load` (the chatbot IS the page; no point lazy-loading)
- **API route:** `src/pages/api/labs/submit.ts` for final brief submission
- **API route:** `src/pages/api/labs/chat.ts` for streaming OpenAI completions (server-side to keep API key off client)

### 8.2 OpenAI integration

- Model: GPT-4o (or GPT-5 if available on the account at implementation time)
- Streaming responses for the chat UX
- Function calling (or JSON mode) for structured field extraction. Two reasonable patterns; pick during implementation:
  - **Pattern A:** single completion call returns both a chat message AND a partial extraction via tool call
  - **Pattern B:** primary chat call streams to user; a second non-streaming call after each turn extracts/updates fields
- Server-side rate limiting (see §9)
- API key stored in environment variable, never sent to client

### 8.3 Email delivery

- Reuse the nodemailer setup from `src/pages/api/contact.ts`
- Two outputs sent to Jose's inbox:
  - HTML email: human-readable brief, structured with sections matching the 7 fields, plus the optional "algo más" textarea, plus a transcript of the full conversation appended below
  - JSON attachment: machine-readable for future tooling (e.g., piping to Claude Code, Notion, Linear, etc.)
- Subject line format: `[Labs] {projectType} — {contact.name} ({urgency})`
- Reply-to set to the user's email so Jose can reply directly

### 8.4 State and persistence

- Conversation state in `localStorage`, key versioned (`avoqado-labs-conversation-v1`)
- Schema includes: `messages[]`, `extractedFields`, `submittedAt | null`, `sessionId`
- No server-side DB in v1
- v2 (out of scope here): persist sessions in Supabase or similar for cross-device handoff and analytics

### 8.5 Theme isolation

- Add `[data-theme="labs"]` scope in `global.css`
- The `labs.astro` page sets `<body data-theme="labs">` so tokens apply only there
- Navbar component needs a new prop (suggested: `variant?: "dark" | "light"`) so the navbar renders cream-on-charcoal with terracotta accents on `/labs`. This is a small additive change to `src/components/layout/Navbar.astro`; existing pages keep current behavior by default.

## 9. Operational Defaults

| Concern | v1 default | Reasoning |
|---|---|---|
| Spam / rate limiting | 5 messages/minute per IP, 30 per hour. Server enforces in `/api/labs/chat`. | Protect inbox and OpenAI costs without friction for genuine users |
| Email verification before submit | Magic link sent to provided email; user clicks to confirm before brief is forwarded to Jose | Stops drive-by submits with fake emails |
| Conversation length cap | 30 user turns max. After that, agent suggests submitting what's been gathered. | Prevents runaway costs and runaway conversations |
| Idle timeout | If no activity for 24 hours, conversation auto-clears on next visit (with a "Recover previous conversation?" prompt available for 24h via localStorage timestamp) | Hygiene |
| Languages | Spanish by default; agent mirrors user's language if they write in English | Audience is Spanish-first |
| Logging | Server logs `{sessionId, timestamp, eventType, fieldsCompleted}` for funnel analytics — never logs full message content | Privacy + ops visibility |

## 10. Out of Scope (v1)

Captured to prevent scope creep during implementation:

- Voice input / speech-to-text in the chat
- Multi-session conversation history persisted server-side
- Sharing a brief draft via link before submit
- Automatic Slack/Discord notification to Jose (email is enough for v1)
- Real-time "Jose is reviewing your brief" status updates
- Multi-language UI beyond agent response language (the page chrome stays in Spanish)
- Payment collection or deposit during the chat (explicit in §2.3 — no commitments in chat)
- A/B testing of agent prompts (will iterate manually post-launch)
- Analytics dashboard for Jose to see Labs funnel metrics

## 11. Open Questions

These do not block the spec but should be resolved during implementation:

1. **Suggestion chips final copy:** the 3 examples in §5.2 are placeholders. Final copy should be tuned with Jose to feel right and span the most representative project types.
2. **Magic-link email provider:** does the existing nodemailer config support transactional volume, or do we need a dedicated provider (Resend, Postmark)? Decide during impl.
3. **Function-calling vs structured output approach:** Pattern A vs B in §8.2. Decide based on latency profiling.
4. **Navbar entry order:** where exactly does "Labs" sit relative to existing entries? Cosmetic — Jose decides on review.

---

## Appendix A — Glossary

- **Avoqado Labs** — the new sub-brand defined here
- **Traje a la medida** — existing service for customizations on Avoqado infrastructure (`/traje-a-la-medida`)
- **Brief** — the structured 7-field summary the agent extracts and emails to Jose
- **Live summary** — the right-side panel on the chat that shows extracted fields in real time
