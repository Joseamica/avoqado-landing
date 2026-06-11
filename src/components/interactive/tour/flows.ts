/**
 * Avoqado Tour — the two guided flows (steps as pure data + handlers)
 * and the TPV screen state they mutate.
 *
 * Copy, targets, timings and amounts are a faithful port of the approved
 * mockup (docs/superpowers/specs/mockups/2026-06-10-avoqado-tour-mockup.html):
 *
 *   Flow A "Pago rápido": keypad 2 → 9 → 5 → ✓ ($2 → $29 → $295.00)
 *   Flow B "Cobrar":      tab Todos los productos → playera → gorra → Cobrar
 *   Shared tail:          calificación → propina 18% → tarjeta → acerca la
 *                         tarjeta → procesando → aprobado (confetti) → recibo
 */
import type { Dispatch } from 'react';
import type { EngineCtx, FlowId, TourStep } from './engine';

/* ==========================================================
   Demo amounts (single source for steps, screens and the F2 seam)
   ========================================================== */
export const DEMO_BASE_AMOUNT = 295;
export const DEMO_TIP_AMOUNT = 53.1;
export const DEMO_BASE_LABEL = '$295.00';
export const DEMO_TIP_LABEL = '$53.10';
export const DEMO_TOTAL_LABEL = '$348.10';

/** F2 seam: payload handed to `onPaymentComplete` when the simulated
 *  payment is approved — where the real demo-sim POST will hook later. */
export interface PaymentInfo {
  amount: number;
  tip: number;
  flow: 'fast' | 'cobrar';
}

/* ==========================================================
   TPV screen state — everything visible inside the screens
   ========================================================== */
export interface TpvState {
  /** FastPaymentEntry display. */
  amount: string;
  /** Increments per keypress to retrigger the amount "pop" animation. */
  amountPopKey: number;
  /** Review screen: stars filled so far (0–5, staggered by timers). */
  starsFilled: number;
  /** Tip screen: 18% card selected + header total updated. */
  tipSelected: boolean;
  tipTotalLabel: string;
  /** MerchantSelection: "Tarjeta" segment selected. */
  cardSelected: boolean;
  /** Increments per approval to (re)play the confetti burst; 0 = none. */
  confettiKey: number;
  /** "Cobrar" module (flow B). */
  cobrarView: 'teclado' | 'productos';
  cartPlayera: boolean;
  cartGorra: boolean;
  cartItems: number;
  cartButtonLabel: string;
}

export const INITIAL_TPV_STATE: TpvState = {
  amount: '$0.00',
  amountPopKey: 0,
  starsFilled: 0,
  tipSelected: false,
  tipTotalLabel: `Total: ${DEMO_BASE_LABEL}`,
  cardSelected: false,
  confettiKey: 0,
  cobrarView: 'teclado',
  cartPlayera: false,
  cartGorra: false,
  cartItems: 0,
  cartButtonLabel: 'Cobrar',
};

export type TpvAction =
  | { type: 'setAmount'; value: string }
  | { type: 'setStars'; count: number }
  | { type: 'selectTip' }
  | { type: 'selectCard' }
  | { type: 'confetti' }
  | { type: 'cobrarShowProducts' }
  | { type: 'cobrarAdd'; product: 'playera' | 'gorra'; totalDisplay: string }
  | { type: 'reset' };

export function tpvReducer(state: TpvState, action: TpvAction): TpvState {
  switch (action.type) {
    case 'setAmount':
      return { ...state, amount: action.value, amountPopKey: state.amountPopKey + 1 };
    case 'setStars':
      return { ...state, starsFilled: action.count };
    case 'selectTip':
      return { ...state, tipSelected: true, tipTotalLabel: `Total: ${DEMO_TOTAL_LABEL}` };
    case 'selectCard':
      return { ...state, cardSelected: true };
    case 'confetti':
      return { ...state, confettiKey: state.confettiKey + 1 };
    case 'cobrarShowProducts':
      return { ...state, cobrarView: 'productos' };
    case 'cobrarAdd':
      return {
        ...state,
        cartPlayera: action.product === 'playera' ? true : state.cartPlayera,
        cartGorra: action.product === 'gorra' ? true : state.cartGorra,
        cartItems: state.cartItems + 1,
        cartButtonLabel: `Cobrar ${action.totalDisplay}`,
      };
    case 'reset':
      return INITIAL_TPV_STATE;
  }
}

/* ==========================================================
   Step context — engine helpers + screen-state dispatch + F2 seam
   ========================================================== */
export interface StepCtx extends EngineCtx {
  dispatch: Dispatch<TpvAction>;
  notifyPayment: (info: PaymentInfo) => void;
}

/** Faithful to the TPV: stars fill one by one, then the flow auto-advances. */
function fillStars(ctx: StepCtx) {
  for (let i = 1; i <= 5; i++) {
    ctx.setTimer(() => ctx.dispatch({ type: 'setStars', count: i }), (i - 1) * 70);
  }
}

/* ==========================================================
   Step scripts — steps are DATA
   ========================================================== */

/** Shared payment tail: review → tip → merchant → card → success → receipt. */
function tailSteps(): TourStep<StepCtx>[] {
  return [
    {
      screen: 'review',
      target: '[data-t="star5"]',
      pill: 'Tu cliente te califica',
      pos: 'top',
      ch: 2,
      onTap: fillStars,
      tapDelay: 1100,
    },
    {
      screen: 'tip',
      target: '[data-t="tip18"]',
      pill: 'Elige 18%',
      pos: 'top',
      ch: 2,
      onTap: ctx => ctx.dispatch({ type: 'selectTip' }),
      tapDelay: 320,
    },
    {
      screen: 'tip',
      target: '[data-t="tip-continue"]',
      pill: 'Continuar',
      pos: 'top',
      ch: 2,
      tapDelay: 140,
    },
    {
      screen: 'merchant',
      target: '[data-t="seg-card"]',
      pill: 'Cobra con tarjeta',
      pos: 'top',
      ch: 3,
      onTap: ctx => ctx.dispatch({ type: 'selectCard' }),
      tapDelay: 380,
    },
    { screen: 'detecting', auto: 1950, ch: 3 } /* card slides in (1.4s anim) */,
    { screen: 'processing', auto: 1300, ch: 3 },
    {
      screen: 'success',
      auto: 2100,
      ch: 3,
      onEnter: ctx => {
        ctx.dispatch({ type: 'confetti' });
        /* F2 seam: this is where the real demo-sim POST hooks in later. */
        ctx.notifyPayment({
          amount: DEMO_BASE_AMOUNT,
          tip: DEMO_TIP_AMOUNT,
          flow: ctx.flow === 'A' ? 'fast' : 'cobrar',
        });
      },
    },
    { screen: 'receipt', final: true, ch: 3 },
  ];
}

export const TOUR_FLOWS: Record<FlowId, TourStep<StepCtx>[]> = {
  /* Flow A — "Pago rápido": guided keypad sequence, amount grows per key. */
  A: [
    {
      screen: 'fast',
      target: '[data-key="2"]',
      pill: 'Marca el monto',
      pos: 'right',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'setAmount', value: '$2' }),
      tapDelay: 80,
    },
    {
      screen: 'fast',
      target: '[data-key="9"]',
      pill: 'Marca el monto',
      pos: 'right',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'setAmount', value: '$29' }),
      tapDelay: 80,
    },
    {
      screen: 'fast',
      target: '[data-key="5"]',
      pill: 'Marca el monto',
      pos: 'right',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'setAmount', value: DEMO_BASE_LABEL }),
      tapDelay: 80,
    },
    {
      screen: 'fast',
      target: '[data-t="key-confirm"]',
      pill: 'Confirma',
      pos: 'right',
      ch: 1,
      tapDelay: 180,
    },
    ...tailSteps(),
  ],

  /* Flow B — "Cobrar" module: tabs + retail catalog + cart panel. */
  B: [
    {
      screen: 'cobrar',
      target: '[data-t="tab-productos"]',
      pill: 'Ve a tus productos',
      pos: 'bottom',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'cobrarShowProducts' }),
      tapDelay: 220,
    },
    {
      screen: 'cobrar',
      target: '[data-t="prod-playera"]',
      pill: 'Agrega la playera',
      pos: 'bottom',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'cobrarAdd', product: 'playera', totalDisplay: '$195.00' }),
      tapDelay: 240,
    },
    {
      screen: 'cobrar',
      target: '[data-t="prod-gorra"]',
      pill: 'Agrega la gorra',
      pos: 'bottom',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'cobrarAdd', product: 'gorra', totalDisplay: DEMO_BASE_LABEL }),
      tapDelay: 240,
    },
    {
      screen: 'cobrar',
      target: '[data-t="btn-cobrar-cart"]',
      pill: 'Cobra',
      pos: 'top',
      ch: 1,
      tapDelay: 200,
    },
    ...tailSteps(),
  ],
};
