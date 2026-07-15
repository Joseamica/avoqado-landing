import { useEffect, useRef, useState } from 'react';
import { useScroll } from 'framer-motion';
import OpeningMosaic from './OpeningMosaic';
import OpeningVideo from './OpeningVideo';

export interface OpeningJourneyProps {
  variant?: 'mosaic-only' | 'channel-handoff';
  autoplay?: boolean;
}

export default function OpeningJourney({
  variant = 'channel-handoff',
  autoplay = true,
}: OpeningJourneyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    window.dispatchEvent(new CustomEvent('avoqado-ready'));
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div
      ref={rootRef}
      data-opening-mode="animated"
      data-opening-variant={variant}
      className={variant === 'mosaic-only' ? 'relative h-[180vh] bg-black' : 'relative h-[260vh] bg-black md:h-[300vh]'}
    >
      <div className="sticky left-0 top-0 h-screen w-full overflow-hidden">
        <OpeningVideo progress={scrollYProgress} isMobile={isMobile} autoplay={autoplay} />
        <OpeningMosaic progress={scrollYProgress} variant={variant} isMobile={isMobile} />
      </div>
    </div>
  );
}
