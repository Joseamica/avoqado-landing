/**
 * Avoqado Tour — analytics sobre el dataLayer de GTM (vía src/lib/gtm.ts,
 * mismo mecanismo que el banner de Fundador). Eventos del embudo del demo:
 *
 *   tour_view        — el island montó (la persona VE el demo)
 *   tour_start       — primer tap exitoso de un flujo (engagement real)
 *   tour_step        — cada paso completado (tour_flow + tour_step)
 *   tour_complete    — llegó a la pantalla final del flujo
 *   tour_cta_click   — click en el CTA de handoff (LA conversión de /demo)
 *   tour_flow_switch — cambió de demo en el selector (tour_from → tour_flow)
 *   tour_reset       — reinició el flujo actual
 *
 * pushEvent es SSR-safe y nunca lanza; si GTM no cargó, el push queda en un
 * array huérfano sin efectos.
 */
import { pushEvent } from '../../../lib/gtm';

export type TourFlowId = 'A' | 'B' | 'R' | 'L';

/** Nombres legibles para los reportes (en vez de A/B/R/L). */
const FLOW_NAMES: Record<TourFlowId, string> = {
  A: 'pago-rapido',
  B: 'cobrar',
  R: 'reserva',
  L: 'liga-de-pago',
};

export function trackTour(event: string, data: Record<string, unknown> = {}): void {
  pushEvent(event, { location: 'avoqado_tour', ...data });
}

export function flowName(flow: TourFlowId): string {
  return FLOW_NAMES[flow] ?? flow;
}
