/**
 * Avoqado Tour — web flows (rendered inside a browser frame, not the TPV):
 *
 *   Flow R "Reserva en línea": the REAL booking-widget journey on the venue's
 *   page (Estética Bella) — Citas → servicio → día/hora → datos → confirmada.
 *   Flow L "Liga de pago": the REAL dashboard PaymentLinks journey (Estudio
 *   Lumina) — Crear liga → finalidad → monto fijo → guardar → WhatsApp → pago.
 *
 * Steps follow the same data shape as flows.ts; screen state lives in its own
 * WebState slice so the TPV reducer stays untouched.
 */
import type { TourStep } from './engine';
import type { StepCtx } from './flows';

/* ==========================================================
   Web screens state
   ========================================================== */
export interface WebState {
  /** R — booking widget. */
  resvServiceAdded: boolean;
  resvDay: number | null;
  resvSlot: string | null;
  /** R — dashboard calendar payoff: show/no-show sobre la cita de Sofía. */
  resvStatusOpen: boolean;
  resvShowMarked: boolean;
  /** L — payment links. */
  ligaPurpose: boolean;
  ligaAmount: string;
  ligaSaved: boolean;
  ligaWaOpen: boolean;
  ligaWaSent: boolean;
  ligaPaid: boolean;
  ligaToast: string | null;
}

export const INITIAL_WEB_STATE: WebState = {
  resvServiceAdded: false,
  resvDay: null,
  resvSlot: null,
  resvStatusOpen: false,
  resvShowMarked: false,
  ligaPurpose: false,
  ligaAmount: '',
  ligaSaved: false,
  ligaWaOpen: false,
  ligaWaSent: false,
  ligaPaid: false,
  ligaToast: null,
};

export type WebAction =
  | { type: 'resvAddService' }
  | { type: 'resvPickDay'; day: number }
  | { type: 'resvPickSlot'; slot: string }
  | { type: 'resvOpenStatus' }
  | { type: 'resvMarkShow' }
  | { type: 'ligaSelectPurpose' }
  | { type: 'ligaTypeAmount'; value: string }
  | { type: 'ligaSave' }
  | { type: 'ligaWaOpen' }
  | { type: 'ligaWaSend' }
  | { type: 'ligaWaClose' }
  | { type: 'ligaPay' }
  | { type: 'ligaToast'; value: string | null }
  | { type: 'reset' };

export function webReducer(state: WebState, action: WebAction): WebState {
  switch (action.type) {
    case 'resvAddService':
      return { ...state, resvServiceAdded: true };
    case 'resvPickDay':
      return { ...state, resvDay: action.day };
    case 'resvPickSlot':
      return { ...state, resvSlot: action.slot };
    case 'resvOpenStatus':
      return { ...state, resvStatusOpen: true };
    case 'resvMarkShow':
      return { ...state, resvShowMarked: true };
    case 'ligaSelectPurpose':
      return { ...state, ligaPurpose: true };
    case 'ligaTypeAmount':
      return { ...state, ligaAmount: action.value };
    case 'ligaSave':
      return { ...state, ligaSaved: true, ligaToast: 'Liga de pago creada' };
    case 'ligaWaOpen':
      return { ...state, ligaWaOpen: true, ligaToast: null };
    case 'ligaWaSend':
      return { ...state, ligaWaSent: true };
    case 'ligaWaClose':
      return { ...state, ligaWaOpen: false };
    case 'ligaPay':
      return { ...state, ligaPaid: true, ligaToast: 'Pago recibido · $350.00 MXN' };
    case 'ligaToast':
      return { ...state, ligaToast: action.value };
    case 'reset':
      return INITIAL_WEB_STATE;
  }
}

/* ==========================================================
   Flow R — Reserva en línea (booking widget, real journey)
   ========================================================== */
export const RESERVA_STEPS: TourStep<StepCtx>[] = [
  {
    screen: 'r-landing',
    target: '[data-t="resv-citas"]',
    pill: 'Reserva una cita',
    pos: 'top' /* bottom taparía la card "Clases" */,
    ch: 1,
    tapDelay: 180,
  },
  {
    screen: 'r-services',
    target: '[data-t="svc-corte"]',
    pill: 'Elige el servicio',
    pos: 'bottom',
    ch: 1,
    onTap: ctx => ctx.webDispatch({ type: 'resvAddService' }),
    tapDelay: 340,
  },
  {
    screen: 'r-services',
    target: '[data-t="svc-next"]',
    pill: 'Siguiente',
    pos: 'top',
    ch: 1,
    tapDelay: 180,
  },
  {
    screen: 'r-datetime',
    target: '[data-t="day-12"]',
    pill: 'Elige el día',
    pos: 'bottom',
    ch: 2,
    onTap: ctx => ctx.webDispatch({ type: 'resvPickDay', day: 12 }),
    tapDelay: 360,
  },
  {
    screen: 'r-datetime',
    target: '[data-t="slot-1130"]',
    pill: 'Elige la hora',
    pos: 'top',
    ch: 2,
    onTap: ctx => ctx.webDispatch({ type: 'resvPickSlot', slot: '11:30' }),
    tapDelay: 420,
  },
  {
    screen: 'r-checkout',
    target: '[data-t="resv-confirm"]',
    pill: 'Confirma la reserva',
    pos: 'top',
    ch: 2,
    tapDelay: 320,
  },
  { screen: 'r-done', auto: 2600, ch: 3 },
  /* Payoff (founder request): crossfade phone → dashboard and watch the
     reservation land in the venue's calendar — same "everything fires from
     one action" beat the TPV chain closes on. The auto beat lets Sofía's
     card animate in before the guided part continues. */
  { screen: 'dash-resv-cal', frame: 'desktop', auto: 2400, ch: 3 },
  /* Founder request round 2: attendance closes the money loop — mark the
     cita as show ("Llegó") and the $250 charge lands in Ventas. */
  {
    screen: 'dash-resv-cal',
    frame: 'desktop',
    target: '[data-t="resv-card"]',
    pill: 'Terminó la cita — ¿llegó?',
    pos: 'bottom',
    ch: 4,
    onTap: ctx => ctx.webDispatch({ type: 'resvOpenStatus' }),
    tapDelay: 340,
  },
  {
    screen: 'dash-resv-cal',
    frame: 'desktop',
    target: '[data-t="resv-show"]',
    pill: 'Sí llegó — márcala',
    pos: 'bottom',
    ch: 4,
    onTap: ctx => ctx.webDispatch({ type: 'resvMarkShow' }),
    tapDelay: 700,
  },
  {
    screen: 'dash-resv-cal',
    frame: 'desktop',
    target: '[data-t="nav-ventas"]',
    pill: 'Mira: ya es una venta',
    pos: 'right',
    ch: 4,
  },
  { screen: 'dash-resv-sales', frame: 'desktop', final: true, ch: 4 },
];

/* ==========================================================
   Flow L — Liga de pago (dashboard PaymentLinks, real journey)
   ========================================================== */
export const LIGA_STEPS: TourStep<StepCtx>[] = [
  {
    screen: 'l-list',
    target: '[data-t="liga-create"]',
    pill: 'Crea una liga',
    pos: 'bottom',
    ch: 1,
    tapDelay: 200,
  },
  {
    screen: 'l-purpose',
    target: '[data-t="purpose-pago"]',
    pill: 'Elige cómo cobrar',
    pos: 'right',
    ch: 1,
    onTap: ctx => ctx.webDispatch({ type: 'ligaSelectPurpose' }),
    tapDelay: 280,
  },
  {
    screen: 'l-purpose',
    target: '[data-t="purpose-continue"]',
    pill: 'Continuar',
    pos: 'bottom',
    ch: 1,
    tapDelay: 220,
  },
  {
    screen: 'l-form',
    target: '[data-t="liga-amount"]',
    pill: 'Define el monto',
    pos: 'right',
    ch: 1,
    onTap: ctx => {
      /* the amount "types itself", mirrored live by the phone preview */
      ctx.setTimer(() => ctx.webDispatch({ type: 'ligaTypeAmount', value: '3' }), 60);
      ctx.setTimer(() => ctx.webDispatch({ type: 'ligaTypeAmount', value: '35' }), 220);
      ctx.setTimer(() => ctx.webDispatch({ type: 'ligaTypeAmount', value: '350' }), 380);
    },
    tapDelay: 800,
  },
  {
    screen: 'l-form',
    target: '[data-t="liga-save"]',
    pill: 'Guarda tu liga',
    pos: 'bottom',
    ch: 1,
    onTap: ctx => {
      ctx.webDispatch({ type: 'ligaSave' });
      ctx.setTimer(() => ctx.webDispatch({ type: 'ligaToast', value: null }), 2300);
    },
    tapDelay: 260,
  },
  {
    screen: 'l-list',
    target: '[data-t="liga-wa"]',
    pill: 'Compártela por WhatsApp',
    pos: 'left',
    ch: 2,
    onTap: ctx => ctx.webDispatch({ type: 'ligaWaOpen' }),
    tapDelay: 320,
  },
  {
    screen: 'l-list',
    target: '[data-t="wa-send"]',
    pill: 'Envíala',
    pos: 'top',
    ch: 2,
    onTap: ctx => ctx.webDispatch({ type: 'ligaWaSend' }),
    tapDelay: 420,
  },
  {
    /* payoff: the customer pays the link — the list updates live */
    screen: 'l-list',
    auto: 2400,
    ch: 3,
    onEnter: ctx => {
      ctx.setTimer(() => ctx.webDispatch({ type: 'ligaWaClose' }), 900);
      ctx.setTimer(() => ctx.webDispatch({ type: 'ligaPay' }), 1400);
    },
  },
  { screen: 'l-list', final: true, ch: 3 },
];
