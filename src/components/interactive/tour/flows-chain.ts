/**
 * flows-chain.ts — the post-sale "cadena" chapters (4-5) that run after the
 * TPV receipt, on the desktop BrowserFrame (dashboard mock).
 *
 * PHASE 5 SCOPE: the full 10-step chain is built here — dash-live cascade →
 * dash-inventory → dash-cfdi → dash-commission → dash-loyalty → dash-report →
 * dash-ai (2 questions + final). `chainTail()`'s `dash-report` step now
 * targets `nav-ia` (no longer `final`) and the chain ends on the last
 * `dash-ai` step instead. See
 * docs/superpowers/specs/2026-07-02-avoqado-tour-cadena-post-venta.md.
 *
 * `ChainState`/`ChainAction` cover the full chain; every action is now
 * dispatched somewhere in `chainSteps`/`chainTail`.
 */
import type { TourStep } from './engine';
import type { StepCtx } from './flows';

/* ==========================================================
   Chain state + reducer (full shape — later phases dispatch the rest)
   ========================================================== */
export interface ChainState {
  saleRowIn: boolean;
  cascadeShown: 0 | 1 | 2 | 3 | 4;
  invCounted: boolean;
  reportCounted: boolean;
  aiStage: 0 | 1 | 2 | 3 | 4;
  aiTyping: boolean;
}

export const INITIAL_CHAIN_STATE: ChainState = {
  saleRowIn: false,
  cascadeShown: 0,
  invCounted: false,
  reportCounted: false,
  aiStage: 0,
  aiTyping: false,
};

export type ChainAction =
  | { type: 'saleIn' }
  | { type: 'cascade'; shown: 1 | 2 | 3 | 4 }
  | { type: 'cascadeAll'; total: 3 | 4 }
  | { type: 'invCount' }
  | { type: 'reportCount' }
  | { type: 'aiAsk1' }
  | { type: 'aiAnswer1' }
  | { type: 'aiAsk2' }
  | { type: 'aiAnswer2' }
  | { type: 'aiTypingOn' }
  | { type: 'reset' };

export function chainReducer(state: ChainState, action: ChainAction): ChainState {
  switch (action.type) {
    case 'saleIn':
      return { ...state, saleRowIn: true };
    case 'cascade':
      return { ...state, cascadeShown: action.shown };
    case 'cascadeAll':
      return { ...state, cascadeShown: action.total };
    case 'invCount':
      return { ...state, invCounted: true };
    case 'reportCount':
      return { ...state, reportCounted: true };
    case 'aiAsk1':
      return { ...state, aiStage: 1 };
    case 'aiAnswer1':
      return { ...state, aiStage: 2, aiTyping: false };
    case 'aiAsk2':
      return { ...state, aiStage: 3 };
    case 'aiAnswer2':
      return { ...state, aiStage: 4, aiTyping: false };
    case 'aiTypingOn':
      return { ...state, aiTyping: true };
    case 'reset':
      return INITIAL_CHAIN_STATE;
  }
}

/** True when the visitor's OS/browser asked for reduced motion. */
export function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ==========================================================
   dash-ai copy — EXACT text from the spec's "Copy IA EXACTO" table,
   word for word (customer-facing, approved verbatim). Do not paraphrase.
   ========================================================== */
export const AI_WELCOME = 'Pregúntale lo que sea a tu negocio — respondo con tus datos en vivo.';

export const AI_CHIP_1 = '¿Qué vendí hoy?';

export const AI_ANSWER_1: Record<'A' | 'B', string> = {
  B: 'Hoy llevas 1 venta: $348.10 — 1 Playera básica blanca y 1 Gorra logo, cobrada por Ana con tarjeta ($295.00 + $53.10 de propina). María G. sumó 29 puntos y la autofactura ya está en su recibo.',
  A: 'Hoy llevas 1 venta: $348.10, cobrada por Ana con tarjeta ($295.00 + $53.10 de propina). María G. sumó 29 puntos y la autofactura ya está en su recibo.',
};

export const AI_CHIP_2: Record<'A' | 'B', string> = {
  B: '¿Qué me toca resurtir?',
  A: '¿Cómo van las comisiones?',
};

export const AI_ANSWER_2: Record<'A' | 'B', string> = {
  B: 'La Gorra logo bajó a 7 piezas — a tu ritmo de venta se agota en unas 2 semanas. ¿Te preparo la orden de compra al proveedor?',
  A: 'Ana Torres lleva $312.40 de comisión en la quincena — 78% de su meta. Hoy sumó $29.50 por la venta de $295.00 (la comisión no incluye propina).',
};

/* ==========================================================
   Steps — dash-live cascade + dash-inventory (B only) + dash-cfdi
   + dash-commission + dash-loyalty + dash-report + dash-ai
   ========================================================== */

/** Flow B: 4-event cascade (inventario → facturación → comisiones → lealtad). */
function dashLiveStepB(): TourStep<StepCtx> {
  return {
    screen: 'dash-live',
    frame: 'desktop',
    auto: 3000,
    ch: 4,
    onEnter: ctx => {
      if (reducedMotion()) {
        ctx.chainDispatch({ type: 'saleIn' });
        ctx.chainDispatch({ type: 'cascadeAll', total: 4 });
        return;
      }
      ctx.setTimer(() => ctx.chainDispatch({ type: 'saleIn' }), 400);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 1 }), 1000);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 2 }), 1450);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 3 }), 1900);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 4 }), 2350);
    },
  };
}

/** Flow A: 3-event cascade (facturación → comisiones → lealtad, no inventario). */
function dashLiveStepA(): TourStep<StepCtx> {
  return {
    screen: 'dash-live',
    frame: 'desktop',
    auto: 2600,
    ch: 4,
    onEnter: ctx => {
      if (reducedMotion()) {
        ctx.chainDispatch({ type: 'saleIn' });
        ctx.chainDispatch({ type: 'cascadeAll', total: 3 });
        return;
      }
      ctx.setTimer(() => ctx.chainDispatch({ type: 'saleIn' }), 400);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 1 }), 1000);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 2 }), 1450);
      ctx.setTimer(() => ctx.chainDispatch({ type: 'cascade', shown: 3 }), 1900);
    },
  };
}

/** Shared tail from dash-cfdi through dash-report — same for both flows
 *  (commission/loyalty/report scenes don't vary by flow). The last step
 *  targets nav-ia — dashAiSteps() picks up from there. */
function chainTail(): TourStep<StepCtx>[] {
  return [
    {
      screen: 'dash-cfdi',
      frame: 'desktop',
      target: '[data-t="nav-equipo"]',
      pill: 'Ve lo que ganó tu equipo',
      pos: 'right',
      ch: 4,
    },
    {
      screen: 'dash-commission',
      frame: 'desktop',
      target: '[data-t="nav-clientes"]',
      pill: 'Y lo que ganó tu cliente',
      pos: 'right',
      ch: 4,
    },
    {
      screen: 'dash-loyalty',
      frame: 'desktop',
      target: '[data-t="nav-reportes"]',
      pill: 'Tu corte ya está listo',
      pos: 'right',
      ch: 4,
    },
    {
      screen: 'dash-report',
      frame: 'desktop',
      target: '[data-t="nav-ia"]',
      pill: 'Ahora pregúntale a tu negocio',
      pos: 'right',
      ch: 4,
      onEnter: ctx => ctx.chainDispatch({ type: 'reportCount' }),
    },
  ];
}

/** dash-ai: 2 scripted Q&A steps + a final step. Shared by both flows — only
 *  the copy (AI_CHIP_2/AI_ANSWER_1/AI_ANSWER_2) varies by flow, read at
 *  render time from `flow` in ctx, not here (steps stay flow-agnostic data).
 *  `tapDelay` is a plain number on TourStep (see engine.ts), so it can only
 *  be evaluated once when chainSteps() builds the step list (per mount/flow
 *  switch) — reducedMotion() here reflects the setting at BUILD time, same
 *  limitation the rest of the codebase already accepts for non-reactive
 *  fields. The onTap/onEnter bodies below DO call reducedMotion() at CALL
 *  time (reactive), matching Phase 3's convention. */
function dashAiSteps(): TourStep<StepCtx>[] {
  return [
    {
      screen: 'dash-ai',
      frame: 'desktop',
      target: '[data-t="ai-q1"]',
      pill: 'Pregúntale',
      pos: 'top',
      ch: 5,
      onTap: ctx => {
        ctx.chainDispatch({ type: 'aiAsk1' });
        ctx.chainDispatch({ type: 'aiTypingOn' });
        ctx.setTimer(() => ctx.chainDispatch({ type: 'aiAnswer1' }), reducedMotion() ? 150 : 1300);
      },
      tapDelay: reducedMotion() ? 300 : 1600,
    },
    {
      screen: 'dash-ai',
      frame: 'desktop',
      target: '[data-t="ai-q2"]',
      pill: 'Ahora algo más difícil',
      pos: 'top',
      ch: 5,
      onTap: ctx => {
        ctx.chainDispatch({ type: 'aiAsk2' });
        ctx.chainDispatch({ type: 'aiTypingOn' });
        ctx.setTimer(() => ctx.chainDispatch({ type: 'aiAnswer2' }), reducedMotion() ? 150 : 1400);
      },
      tapDelay: reducedMotion() ? 300 : 1700,
    },
    { screen: 'dash-ai', frame: 'desktop', final: true, ch: 5 },
  ];
}

/** `chainSteps` — the full 10-step (B) / 9-step (A) chain (see spec §"Steps nuevos"). */
export function chainSteps(flow: 'A' | 'B'): TourStep<StepCtx>[] {
  if (flow === 'B') {
    return [
      dashLiveStepB(),
      {
        screen: 'dash-live',
        frame: 'desktop',
        target: '[data-t="ev-inv"]',
        pill: 'Mira: tu inventario se movió solo',
        pos: 'left',
        ch: 4,
      },
      {
        screen: 'dash-inventory',
        frame: 'desktop',
        target: '[data-t="nav-cfdi"]',
        pill: 'Ahora, la factura',
        pos: 'right',
        ch: 4,
        onEnter: ctx => ctx.chainDispatch({ type: 'invCount' }),
      },
      ...chainTail(),
      ...dashAiSteps(),
    ];
  }

  return [
    dashLiveStepA(),
    {
      screen: 'dash-live',
      frame: 'desktop',
      target: '[data-t="ev-cfdi"]',
      pill: 'Mira: tu factura quedó lista',
      pos: 'left',
      ch: 4,
    },
    ...chainTail(),
    ...dashAiSteps(),
  ];
}
