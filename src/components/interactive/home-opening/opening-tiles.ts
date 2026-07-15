import img1 from '../../../assets/hero/hero-tile-01.jpg';
import img2 from '../../../assets/hero/hero-tile-02.jpg';
import img3 from '../../../assets/hero/hero-tile-03.jpg';
import img4 from '../../../assets/hero/hero-tile-04.jpg';
import img5 from '../../../assets/hero/hero-tile-05.jpg';
import img6 from '../../../assets/hero/hero-tile-06.jpg';
import img7 from '../../../assets/hero/hero-tile-07.jpg';
import img8 from '../../../assets/hero/hero-tile-08.jpg';
import img9 from '../../../assets/hero/hero-tile-09.jpg';
import img10 from '../../../assets/hero/hero-tile-10.jpg';
import img11 from '../../../assets/hero/hero-tile-11.jpg';
import img12 from '../../../assets/hero/hero-tile-12.jpg';
import img13 from '../../../assets/hero/hero-tile-13.jpg';
import img14 from '../../../assets/hero/hero-tile-14.jpg';
import img15 from '../../../assets/hero/hero-tile-15.jpg';
import img16 from '../../../assets/hero/hero-tile-16.jpg';
import img17 from '../../../assets/hero/hero-tile-17.jpg';

export const OPENING_CHANNEL_IDS = [
  'consumer-app',
  'booking-widget',
  'online',
  'point-of-sale',
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
  active: boolean;
}

export const OPENING_TILES: readonly OpeningTile[] = [
  { id: 'tile-1', src: img1.src, desktop: { col: 2, row: 1 }, mobile: { col: 1, row: 1 } },
  { id: 'tile-2', src: img2.src, desktop: { col: 4, row: 1 }, mobile: { col: 2, row: 1 }, channelId: 'consumer-app' },
  { id: 'tile-3', src: img3.src, desktop: { col: 6, row: 1 }, mobile: { col: 3, row: 1 } },
  { id: 'tile-4', src: img4.src, desktop: { col: 8, row: 1 }, mobile: null },
  { id: 'tile-5', src: img5.src, desktop: { col: 1, row: 2 }, mobile: { col: 1, row: 2 } },
  { id: 'tile-6', src: img6.src, desktop: { col: 3, row: 2 }, mobile: null },
  { id: 'tile-7', src: img7.src, desktop: { col: 5, row: 2 }, mobile: { col: 3, row: 2 }, channelId: 'booking-widget' },
  { id: 'tile-8', src: img8.src, desktop: { col: 7, row: 2 }, mobile: null },
  { id: 'tile-9', src: img9.src, desktop: { col: 9, row: 2 }, mobile: null },
  { id: 'tile-10', src: img10.src, desktop: { col: 1, row: 4 }, mobile: { col: 1, row: 4 }, channelId: 'point-of-sale' },
  { id: 'tile-11', src: img11.src, desktop: { col: 3, row: 4 }, mobile: { col: 2, row: 4 } },
  { id: 'tile-12', src: img12.src, desktop: { col: 7, row: 4 }, mobile: { col: 3, row: 4 }, channelId: 'online' },
  { id: 'tile-13', src: img13.src, desktop: { col: 9, row: 4 }, mobile: null },
  { id: 'tile-14', src: img14.src, desktop: { col: 2, row: 5 }, mobile: { col: 1, row: 5 } },
  { id: 'tile-15', src: img15.src, desktop: { col: 4, row: 5 }, mobile: { col: 2, row: 5 } },
  { id: 'tile-16', src: img16.src, desktop: { col: 6, row: 5 }, mobile: { col: 3, row: 5 } },
  { id: 'tile-17', src: img17.src, desktop: { col: 8, row: 5 }, mobile: null },
];

export const OPENING_CHANNELS: readonly OpeningChannel[] = [
  { id: 'consumer-app', label: 'Consumer App', result: 'Reserva', tileId: 'tile-2', active: false },
  { id: 'booking-widget', label: 'Booking Widget', result: 'Seleccionado', tileId: 'tile-7', active: true },
  { id: 'online', label: 'Online', result: 'Pago', tileId: 'tile-12', active: false },
  { id: 'point-of-sale', label: 'Punto de venta', result: 'Venta presencial', tileId: 'tile-10', active: false },
] as const;
