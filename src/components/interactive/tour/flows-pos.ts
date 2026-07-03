/**
 * Avoqado Tour — Flow P "Punto de venta" (founder request 2026-07-03):
 * el mensaje es que Avoqado no es solo terminal + navegador — hay un POS
 * completo en iOS / Android / Windows, y habla solo con la terminal.
 *
 *   p-intro  → computadora y tablet lado a lado con el MISMO POS; al entrar
 *              se FUSIONAN en una sola pantalla (merge + crossfade).
 *   p-pos    → POS completo: catálogo → ticket → cliente → cobrar → método.
 *   PAX      → el cobro sale a la terminal (slot 2): propina → detecting →
 *              procesando → aprobado → recibo (mismas pantallas de A/B).
 *   p-done   → venta registrada y sincronizada en todos los equipos.
 *
 * Montos EXACTOS del resto del demo (no inventar): Playera $195.00 + Gorra
 * $100.00 = $295.00 (DEMO_BASE) + propina 18% $53.10 = $348.10 (DEMO_TOTAL).
 */
import type { TourStep } from './engine';
import type { StepCtx } from './flows';
import { DEMO_BASE_AMOUNT, DEMO_BASE_LABEL, DEMO_TIP_AMOUNT } from './flows';

/* ==========================================================
   POS screen state
   ========================================================== */
export interface PosState {
  /** p-intro: los dos dispositivos se fusionan (animación CSS). */
  merged: boolean;
  playeraAdded: boolean;
  gorraAdded: boolean;
  /** Cliente asignado al ticket (María G. — la misma de lealtad). */
  customerSet: boolean;
  /** Sheet "¿Cómo cobras?" abierto (siempre montado, gateado por clase). */
  sheetOpen: boolean;
  /** Método "Terminal Avoqado" elegido (estado visual antes del brinco al PAX). */
  terminalSelected: boolean;
  cobrarLabel: string;
}

export const INITIAL_POS_STATE: PosState = {
  merged: false,
  playeraAdded: false,
  gorraAdded: false,
  customerSet: false,
  sheetOpen: false,
  terminalSelected: false,
  cobrarLabel: 'Cobrar',
};

export type PosAction =
  | { type: 'merge' }
  | { type: 'addItem'; product: 'playera' | 'gorra'; totalDisplay: string }
  | { type: 'setCustomer' }
  | { type: 'openSheet' }
  | { type: 'selectTerminal' }
  | { type: 'reset' };

export function posReducer(state: PosState, action: PosAction): PosState {
  switch (action.type) {
    case 'merge':
      return { ...state, merged: true };
    case 'addItem':
      return {
        ...state,
        playeraAdded: action.product === 'playera' ? true : state.playeraAdded,
        gorraAdded: action.product === 'gorra' ? true : state.gorraAdded,
        cobrarLabel: `Cobrar ${action.totalDisplay}`,
      };
    case 'setCustomer':
      return { ...state, customerSet: true };
    case 'openSheet':
      return { ...state, sheetOpen: true };
    case 'selectTerminal':
      return { ...state, terminalSelected: true };
    case 'reset':
      return INITIAL_POS_STATE;
  }
}

/* ==========================================================
   Steps — el POS vive en el slot default; la terminal PAX en el
   slot marcado frame:'desktop' (toggle de slots, ver AvoqadoTour).

   Función (no const): flows.ts ↔ flows-pos.ts se importan mutuamente
   (aquí se leen los DEMO_*), así que los steps se construyen hasta que
   flows.ts ya inicializó sus constantes — un array a nivel de módulo
   truena con TDZ por el ciclo de imports.
   ========================================================== */
export function posSteps(): TourStep<StepCtx>[] {
  return [
    {
      screen: 'p-intro',
      target: '[data-t="pos-enter"]',
      pill: 'Un solo POS — entra',
      pos: 'bottom',
      ch: 1,
      onTap: ctx => ctx.posDispatch({ type: 'merge' }),
      /* deja correr la animación de fusión antes del crossfade a p-pos */
      tapDelay: 1050,
    },
    {
      screen: 'p-pos',
      target: '[data-t="pos-prod-playera"]',
      pill: 'Agrega la playera',
      pos: 'bottom',
      ch: 2,
      onTap: ctx => ctx.posDispatch({ type: 'addItem', product: 'playera', totalDisplay: '$195.00' }),
      tapDelay: 260,
    },
    {
      screen: 'p-pos',
      target: '[data-t="pos-prod-gorra"]',
      pill: 'Y la gorra',
      pos: 'bottom',
      ch: 2,
      onTap: ctx => ctx.posDispatch({ type: 'addItem', product: 'gorra', totalDisplay: DEMO_BASE_LABEL }),
      tapDelay: 260,
    },
    {
      screen: 'p-pos',
      target: '[data-t="pos-customer"]',
      pill: 'Ponle cliente — suma puntos',
      pos: 'left',
      ch: 2,
      onTap: ctx => ctx.posDispatch({ type: 'setCustomer' }),
      tapDelay: 340,
    },
    {
      screen: 'p-pos',
      target: '[data-t="pos-cobrar"]',
      pill: 'Cobra',
      pos: 'left',
      ch: 2,
      onTap: ctx => ctx.posDispatch({ type: 'openSheet' }),
      tapDelay: 320,
    },
    {
      screen: 'p-pos',
      target: '[data-t="pos-pay-terminal"]',
      pill: 'Mándalo a tu terminal',
      pos: 'top',
      ch: 3,
      onTap: ctx => ctx.posDispatch({ type: 'selectTerminal' }),
      tapDelay: 460,
    },
    /* ---- el cobro brinca a la terminal (slot PAX) ---- */
    {
      screen: 'tip',
      frame: 'desktop',
      target: '[data-t="tip18"]',
      pill: 'Tu cliente deja propina',
      pos: 'top',
      ch: 3,
      onTap: ctx => ctx.dispatch({ type: 'selectTip' }),
      tapDelay: 320,
    },
    {
      screen: 'tip',
      frame: 'desktop',
      target: '[data-t="tip-continue"]',
      pill: 'Continuar',
      pos: 'top',
      ch: 3,
      tapDelay: 140,
    },
    { screen: 'detecting', frame: 'desktop', auto: 1400, ch: 3 },
    { screen: 'processing', frame: 'desktop', auto: 1100, ch: 3 },
    {
      screen: 'success',
      frame: 'desktop',
      auto: 1800,
      ch: 3,
      onEnter: ctx => {
        ctx.dispatch({ type: 'confetti' });
        ctx.notifyPayment({ amount: DEMO_BASE_AMOUNT, tip: DEMO_TIP_AMOUNT, flow: 'pos' });
      },
    },
    { screen: 'receipt', frame: 'desktop', auto: 1500, ch: 3 },
    /* ---- de vuelta al POS: venta registrada y sincronizada ---- */
    { screen: 'p-done', final: true, ch: 4 },
  ];
}
