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
import { RESERVA_STEPS, LIGA_STEPS } from './flows-web';
import type { WebAction } from './flows-web';
import { chainSteps } from './flows-chain';
import type { ChainAction } from './flows-chain';

export type { WebAction, WebState } from './flows-web';
export { INITIAL_WEB_STATE, webReducer } from './flows-web';

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
  /** FastPaymentEntry display — raw as typed, like the real app ('$0', '$295'). */
  amount: string;
  /** Increments per keypress to retrigger the amount "pop" animation. */
  amountPopKey: number;
  /** Review screen: stars filled so far (0–5, staggered by timers). */
  starsFilled: number;
  /** Tip screen: 18% card selected + header subtitle updated (Subtotal → Total). */
  tipSelected: boolean;
  tipTotalLabel: string;
  /** MerchantSelection: "Tarjeta" row selected. */
  cardSelected: boolean;
  /** Increments per approval to (re)play the confetti burst; 0 = none. */
  confettiKey: number;
  /** "Cobrar" module (flow B). */
  cobrarView: 'teclado' | 'productos';
  cartPlayera: boolean;
  cartGorra: boolean;
  cartItems: number;
  cartButtonLabel: string;
  /** Real flow: "Cobrar" opens the CartDetailsSheet before payment. */
  cartSheetOpen: boolean;
}

export const INITIAL_TPV_STATE: TpvState = {
  amount: '$0',
  amountPopKey: 0,
  starsFilled: 0,
  tipSelected: false,
  tipTotalLabel: `Subtotal: ${DEMO_BASE_LABEL} MXN`,
  cardSelected: false,
  confettiKey: 0,
  cobrarView: 'teclado',
  cartPlayera: false,
  cartGorra: false,
  cartItems: 0,
  cartButtonLabel: 'Cobrar',
  cartSheetOpen: false,
};

export type TpvAction =
  | { type: 'setAmount'; value: string }
  | { type: 'setStars'; count: number }
  | { type: 'selectTip' }
  | { type: 'selectCard' }
  | { type: 'confetti' }
  | { type: 'cobrarShowProducts' }
  | { type: 'cobrarAdd'; product: 'playera' | 'gorra'; totalDisplay: string }
  | { type: 'cobrarOpenSheet' }
  | { type: 'reset' };

export function tpvReducer(state: TpvState, action: TpvAction): TpvState {
  switch (action.type) {
    case 'setAmount':
      return { ...state, amount: action.value, amountPopKey: state.amountPopKey + 1 };
    case 'setStars':
      return { ...state, starsFilled: action.count };
    case 'selectTip':
      return { ...state, tipSelected: true, tipTotalLabel: `Total: ${DEMO_TOTAL_LABEL} MXN` };
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
    case 'cobrarOpenSheet':
      return { ...state, cartSheetOpen: true };
    case 'reset':
      return INITIAL_TPV_STATE;
  }
}

/* ==========================================================
   Step context — engine helpers + screen-state dispatch + F2 seam
   ========================================================== */
export interface StepCtx extends EngineCtx {
  dispatch: Dispatch<TpvAction>;
  /** Web flows (R reserva / L liga de pago) mutate their own state slice. */
  webDispatch: Dispatch<WebAction>;
  /** Post-sale chain screens (dash-*) mutate their own state slice. */
  chainDispatch: Dispatch<ChainAction>;
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
      auto: 2500 /* duración real del Aprobado en el TPV */,
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
    { screen: 'receipt', auto: 2200, ch: 3 },
  ];
}

export const TOUR_FLOWS: Record<FlowId, TourStep<StepCtx>[]> = {
  /* Flow A — "Pago rápido": guided keypad sequence; the amount renders raw
     as typed ('$2' → '$295'), like the real app (decimals apply on submit).
     pos:'top' keeps the pill off the neighboring keys (founder QA). */
  A: [
    {
      screen: 'fast',
      target: '[data-key="2"]',
      pill: 'Marca el monto',
      pos: 'top',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'setAmount', value: '$2' }),
      tapDelay: 80,
    },
    {
      screen: 'fast',
      target: '[data-key="9"]',
      pill: 'Marca el monto',
      pos: 'top',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'setAmount', value: '$29' }),
      tapDelay: 80,
    },
    {
      screen: 'fast',
      target: '[data-key="5"]',
      pill: 'Marca el monto',
      pos: 'top',
      ch: 1,
      onTap: ctx => ctx.dispatch({ type: 'setAmount', value: '$295' }),
      tapDelay: 80,
    },
    {
      screen: 'fast',
      target: '[data-t="key-confirm"]',
      pill: 'Confirma',
      pos: 'left',
      ch: 1,
      tapDelay: 180,
    },
    ...tailSteps(),
    ...chainSteps('A'),
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
      onTap: ctx => ctx.dispatch({ type: 'cobrarOpenSheet' }),
      tapDelay: 320,
    },
    /* Real flow: "Cobrar" opens the CartDetailsSheet first; the definitive
       charge happens from the sheet's own Cobrar button. */
    {
      screen: 'cobrar',
      target: '[data-t="sheet-cobrar"]',
      pill: 'Confirma el cobro',
      pos: 'top',
      ch: 1,
      tapDelay: 200,
    },
    ...tailSteps(),
    ...chainSteps('B'),
  ],

  /* Flow R — "Reserva en línea": the booking widget on the venue's page. */
  R: RESERVA_STEPS,

  /* Flow L — "Liga de pago": create + share a payment link in the dashboard. */
  L: LIGA_STEPS,
};
