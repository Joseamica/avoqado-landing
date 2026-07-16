import type { NarrativeBeat } from '../home-story/story';
import { STORY_FIXTURE } from '../home-story/story-fixture';
import { smoothstep, stepWindow } from '../home-story/story-motion';
import { OPENING_CHANNELS, type OpeningChannelId } from './opening-tiles';

export interface OpeningChannelDemonstration {
  channelId: OpeningChannelId;
  primary: string;
  detail: string;
  context: string;
  status: string;
}

export const OPENING_CHANNEL_DEMONSTRATIONS = [
  {
    channelId: 'online-booking',
    primary: STORY_FIXTURE.service,
    detail: `${STORY_FIXTURE.customer} · ${STORY_FIXTURE.appointmentTime}`,
    context: STORY_FIXTURE.venue,
    status: STORY_FIXTURE.appointmentTime,
  },
  {
    channelId: 'payment-link',
    primary: '$1,250',
    detail: 'Liga enviada por WhatsApp',
    context: 'Pago con tarjeta',
    status: 'Recibido',
  },
  {
    channelId: 'payment-terminal',
    primary: '$348',
    detail: 'Pago sin contacto',
    context: `Terminal física · ${STORY_FIXTURE.venue}`,
    status: 'Aprobado',
  },
] as const satisfies readonly OpeningChannelDemonstration[];

export const OPENING_CHANNEL_NARRATIVE = {
  eyebrow: 'Una sola operación',
  title: 'Tu cliente reserva, compra o paga como prefiera.',
  thread: 'Reservación en línea → Reserva confirmada',
  result: 'Todo llega conectado al mismo negocio.',
  body: 'Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.',
  stepThresholds: [0.30, 0.45, 0.60],
} as const satisfies NarrativeBeat;

export function openingChannelById(id: OpeningChannelId) {
  const channel = OPENING_CHANNELS.find(item => item.id === id);
  if (!channel) throw new Error(`Unknown opening channel: ${id}`);
  return channel;
}

function channelRouteWindow(index: number, threshold: number, fadeOutStart: number, switchAt: number) {
  const [start, end] = stepWindow(threshold);
  return { index, threshold, start, end, fadeOutStart, switchAt };
}

const CHANNEL_ROUTE_WINDOWS = [
  channelRouteWindow(0, 0.30, 0.39, 0.43),
  channelRouteWindow(1, 0.45, 0.54, 0.58),
  channelRouteWindow(2, 0.60, 1, 1),
] as const;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export function resolveOpeningChannelSequence(progress: number) {
  const value = clamp01(progress);
  const index = value < 0.43 ? 0 : value < 0.58 ? 1 : 2;
  const window = CHANNEL_ROUTE_WINDOWS[index];
  const draw = smoothstep(clamp01((value - window.start) / (window.end - window.start)));
  const fade = index === 2
    ? 1
    : 1 - smoothstep(clamp01((value - window.fadeOutStart) / (window.switchAt - window.fadeOutStart)));
  return {
    index,
    routeProgress: draw,
    routeOpacity: draw * fade,
    started: value >= window.start,
  };
}
