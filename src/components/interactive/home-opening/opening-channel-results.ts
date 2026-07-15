import { STORY_FIXTURE } from '../home-story/story-fixture';
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

export function openingChannelById(id: OpeningChannelId) {
  const channel = OPENING_CHANNELS.find(item => item.id === id);
  if (!channel) throw new Error(`Unknown opening channel: ${id}`);
  return channel;
}
