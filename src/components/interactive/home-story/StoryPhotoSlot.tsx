import type { HTMLAttributes } from 'react';
import { getStoryPhoto, type StoryPhotoId } from './story-media';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
  id: StoryPhotoId;
  imageClassName?: string;
  overlayClassName?: string;
  showStatus?: boolean;
}

const ASPECT_RATIO: Record<StoryPhotoId, string> = {
  'service-in-action': 'aspect-[4/5]',
  'customer-mobile': 'aspect-[3/4]',
  'payment-handoff': 'aspect-[4/3]',
  'owner-overview': 'aspect-[4/3]',
};

export default function StoryPhotoSlot({
  id,
  className = '',
  imageClassName = '',
  overlayClassName = 'bg-[linear-gradient(180deg,transparent_58%,oklch(0.13_0.005_155_/_0.28))]',
  showStatus = false,
  ...props
}: Props) {
  const photo = getStoryPhoto(id);
  const source = typeof photo.src === 'string' ? photo.src : photo.src.src;
  const dimensions = typeof photo.src === 'string'
    ? {}
    : { width: photo.src.width, height: photo.src.height };
  const fetchPriority = { fetchpriority: photo.priority ? 'high' : 'low' };

  return (
    <div
      {...props}
      data-story-photo={photo.id}
      data-photo-status={photo.status}
      className={`relative isolate overflow-hidden bg-neutral-900 ${ASPECT_RATIO[id]} ${className}`}
    >
      <img
        src={source}
        alt={photo.alt}
        {...dimensions}
        loading={photo.priority ? 'eager' : 'lazy'}
        {...fetchPriority}
        decoding="async"
        className={`absolute inset-0 size-full ${photo.fit === 'cover' ? 'object-cover' : 'object-contain'} ${imageClassName}`}
        style={{ objectPosition: photo.objectPosition }}
      />
      {overlayClassName ? <span className={`pointer-events-none absolute inset-0 ${overlayClassName}`} /> : null}
      {showStatus && photo.status === 'placeholder' ? (
        <span className="absolute bottom-2 left-2 rounded-full bg-neutral-950/80 px-2.5 py-1 text-[0.6rem] font-medium uppercase tracking-[0.12em] text-neutral-200">
          Foto temporal
        </span>
      ) : null}
    </div>
  );
}
