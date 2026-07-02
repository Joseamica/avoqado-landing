/**
 * flows-chain.ts — the post-sale "cadena" chapters (4-5) that run after the
 * TPV receipt, on the desktop BrowserFrame (dashboard mock).
 *
 * PHASE 3 SCOPE: only steps 1-4 of the chain (dash-live cascade → dash-inventory
 * → dash-cfdi) are built here. dash-commission/dash-loyalty/dash-report/dash-ai
 * land in later phases (see docs/superpowers/specs/2026-07-02-avoqado-tour-cadena-post-venta.md).
 * The last step of each flow below is a TEMPORARY `final: true` so the tour
 * stays fully completable while the rest of the chain is built — clearly
 * marked at each site, same convention Phase 1 used for the placeholder.
 *
 * `ChainState`/`ChainAction` are written for the FULL chain (all 5 chapters)
 * so the type doesn't need to change again in later phases — only
 * saleIn/cascade/cascadeAll/invCount/reset are actually dispatched this phase.
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
   Steps — Phase 3: dash-live cascade + dash-inventory (B only) + dash-cfdi
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

/** `chainSteps` — the ONLY steps built in this phase (see spec §"Steps nuevos"). */
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
      // TEMPORARY final — Phase 4 replaces this with a real target to nav-equipo
      // (dash-commission comes next in the full chain). See spec "Steps nuevos".
      { screen: 'dash-cfdi', frame: 'desktop', final: true, ch: 4 },
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
    // TEMPORARY final — Phase 4 replaces this with a real target to nav-equipo
    // (dash-commission comes next in the full chain). See spec "Steps nuevos".
    { screen: 'dash-cfdi', frame: 'desktop', final: true, ch: 4 },
  ];
}
