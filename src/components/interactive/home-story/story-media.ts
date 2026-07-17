import type { ImageMetadata } from 'astro';
import servicePhoto from '../../../assets/story/service-facial.webp';
import customerPlaceholder from '../../../assets/hero/hero-tile-05.jpg';
import ownerPlaceholder from '../../../assets/hero/hero-tile-04.jpg';
import paymentPlaceholder from '../../../assets/hero/hero-tile-17.jpg';

export type StoryPhotoId =
  | 'service-in-action'
  | 'customer-mobile'
  | 'payment-handoff'
  | 'owner-overview';

export interface StoryPhotoSlot {
  id: StoryPhotoId;
  src: ImageMetadata | string;
  alt: string;
  objectPosition: string;
  fit: 'cover' | 'contain';
  priority: boolean;
  status: 'placeholder' | 'approved';
}

/**
 * The only source of photographic media for the homepage story.
 * Replace these four entries when approved, licensed production photos arrive;
 * scene geometry and motion must not depend on a particular photograph.
 */
export const STORY_MEDIA = {
  'service-in-action': {
    id: 'service-in-action',
    src: servicePhoto,
    alt: 'Una clienta recibe un facial hidratante mientras una especialista aplica una mascarilla.',
    objectPosition: '42% 50%',
    fit: 'cover',
    priority: true,
    status: 'approved',
  },
  'customer-mobile': {
    id: 'customer-mobile',
    src: customerPlaceholder,
    alt: 'Una clienta conversa con una colaboradora en el mostrador.',
    objectPosition: '62% 50%',
    fit: 'cover',
    priority: false,
    status: 'placeholder',
  },
  'payment-handoff': {
    id: 'payment-handoff',
    src: paymentPlaceholder,
    alt: 'Una colaboradora lleva una orden dentro de un restaurante.',
    objectPosition: '48% 50%',
    fit: 'cover',
    priority: false,
    status: 'placeholder',
  },
  'owner-overview': {
    id: 'owner-overview',
    src: ownerPlaceholder,
    alt: 'Vista general de un negocio preparado para recibir clientes.',
    objectPosition: '50% 52%',
    fit: 'cover',
    priority: false,
    status: 'placeholder',
  },
} as const satisfies Record<StoryPhotoId, StoryPhotoSlot>;

export function getStoryPhoto(id: StoryPhotoId): StoryPhotoSlot {
  return STORY_MEDIA[id];
}
