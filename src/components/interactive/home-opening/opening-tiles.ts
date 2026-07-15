import img1 from '../../../assets/hero/hero-tile-01.jpg';
import img3 from '../../../assets/hero/hero-tile-03.jpg';
import img4 from '../../../assets/hero/hero-tile-04.jpg';
import img5 from '../../../assets/hero/hero-tile-05.jpg';
import img6 from '../../../assets/hero/hero-tile-06.jpg';
import img8 from '../../../assets/hero/hero-tile-08.jpg';
import img9 from '../../../assets/hero/hero-tile-09.jpg';
import img10 from '../../../assets/hero/hero-tile-10.jpg';
import img11 from '../../../assets/hero/hero-tile-11.jpg';
import img12 from '../../../assets/hero/hero-tile-12.jpg';
import img13 from '../../../assets/hero/hero-tile-13.jpg';
import img14 from '../../../assets/hero/hero-tile-14.jpg';
import img16 from '../../../assets/hero/hero-tile-16.jpg';
import img17 from '../../../assets/hero/hero-tile-17.jpg';
import bookingImg from '../../../assets/hero/hero-entry-online-booking.jpg';
import paymentLinkImg from '../../../assets/hero/hero-entry-payment-link.jpg';
import posImg from '../../../assets/hero/hero-entry-point-of-sale.jpg';

export const OPENING_CHANNEL_IDS = [
  'online-booking',
  'online-store',
  'payment-link',
  'point-of-sale',
  'payment-terminal',
] as const;

export type OpeningChannelId = (typeof OPENING_CHANNEL_IDS)[number];

export interface OpeningTile {
  id: `tile-${number}`;
  src: string;
  desktop: { col: number; row: number };
  mobile: { col: number; row: number } | null;
  channelId?: OpeningChannelId;
}

export interface OpeningChannel {
  id: OpeningChannelId;
  label: string;
  result: string;
  tileId: OpeningTile['id'];
}

export const OPENING_TILES: readonly OpeningTile[] = [
  { id: 'tile-1', src: img1.src, desktop: { col: 2, row: 1 }, mobile: { col: 1, row: 1 } },
  { id: 'tile-2', src: paymentLinkImg.src, desktop: { col: 4, row: 1 }, mobile: { col: 2, row: 1 }, channelId: 'payment-link' },
  { id: 'tile-3', src: img3.src, desktop: { col: 6, row: 1 }, mobile: { col: 3, row: 1 } },
  { id: 'tile-4', src: img4.src, desktop: { col: 8, row: 1 }, mobile: null },
  { id: 'tile-5', src: img5.src, desktop: { col: 1, row: 2 }, mobile: { col: 1, row: 2 } },
  { id: 'tile-6', src: img6.src, desktop: { col: 3, row: 2 }, mobile: null },
  { id: 'tile-7', src: bookingImg.src, desktop: { col: 5, row: 2 }, mobile: { col: 3, row: 2 }, channelId: 'online-booking' },
  { id: 'tile-8', src: img8.src, desktop: { col: 7, row: 2 }, mobile: null },
  { id: 'tile-9', src: img9.src, desktop: { col: 9, row: 2 }, mobile: null },
  { id: 'tile-10', src: img10.src, desktop: { col: 1, row: 4 }, mobile: { col: 1, row: 4 }, channelId: 'payment-terminal' },
  { id: 'tile-11', src: img11.src, desktop: { col: 3, row: 4 }, mobile: { col: 2, row: 4 } },
  { id: 'tile-12', src: img12.src, desktop: { col: 7, row: 4 }, mobile: { col: 3, row: 4 }, channelId: 'online-store' },
  { id: 'tile-13', src: img13.src, desktop: { col: 9, row: 4 }, mobile: null },
  { id: 'tile-14', src: img14.src, desktop: { col: 2, row: 5 }, mobile: { col: 1, row: 5 } },
  { id: 'tile-15', src: posImg.src, desktop: { col: 4, row: 5 }, mobile: { col: 2, row: 5 }, channelId: 'point-of-sale' },
  { id: 'tile-16', src: img16.src, desktop: { col: 6, row: 5 }, mobile: { col: 3, row: 5 } },
  { id: 'tile-17', src: img17.src, desktop: { col: 8, row: 5 }, mobile: null },
];

export const OPENING_CHANNELS: readonly OpeningChannel[] = [
  { id: 'online-booking', label: 'Reservación en línea', result: 'Reserva confirmada', tileId: 'tile-7' },
  { id: 'online-store', label: 'Tienda en línea', result: 'Pedido recibido', tileId: 'tile-12' },
  { id: 'payment-link', label: 'Liga de pago', result: 'Pago recibido', tileId: 'tile-2' },
  { id: 'point-of-sale', label: 'Punto de venta', result: 'Venta registrada', tileId: 'tile-15' },
  { id: 'payment-terminal', label: 'Terminal de cobro', result: 'Cobro aprobado', tileId: 'tile-10' },
] as const;
