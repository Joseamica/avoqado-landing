import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import ChannelHandoff from './ChannelHandoff';
import OpeningMosaic from './OpeningMosaic';
import OpeningVideo from './OpeningVideo';
import SharedTileLayer from './SharedTileLayer';

export interface OpeningJourneyProps {
  variant?: 'mosaic-only' | 'channel-handoff';
  autoplay?: boolean;
}

export default function OpeningJourney({
  variant = 'channel-handoff',
  autoplay = true,
}: OpeningJourneyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sharedTilesReady, setSharedTilesReady] = useState(false);
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

  useEffect(() => {
    setSharedTilesReady(false);
  }, [isMobile]);

  const legacyEnd = isMobile ? 0.52 : 0.56;
  const remappedOpeningProgress = useTransform(
    scrollYProgress,
    [0, legacyEnd],
    [0, 0.84],
    { clamp: true },
  );
  const openingProgress = variant === 'channel-handoff'
    ? remappedOpeningProgress
    : scrollYProgress;
  const channelProgress = useTransform(scrollYProgress, [0.50, 0.62], [0, 1], { clamp: true });
  const sequenceProgress = useTransform(scrollYProgress, [0.60, 0.98], [0, 1], { clamp: true });

  return (
    <div
      ref={rootRef}
      data-opening-mode="animated"
      data-opening-variant={variant}
      className={variant === 'mosaic-only'
        ? 'relative h-[180vh] bg-black'
        : 'relative h-[360vh] bg-black md:h-[400vh]'}
    >
      <div ref={stageRef} className="sticky left-0 top-0 h-screen w-full overflow-hidden">
        <OpeningVideo progress={openingProgress} isMobile={isMobile} autoplay={autoplay} />
        <OpeningMosaic
          progress={openingProgress}
          variant={variant}
          isMobile={isMobile}
          handoffReady={variant === 'channel-handoff' ? sharedTilesReady : false}
        />
        {variant === 'channel-handoff' ? (
          <>
            <ChannelHandoff
              openingProgress={openingProgress}
              progress={channelProgress}
              sequenceProgress={sequenceProgress}
              ready={sharedTilesReady}
            />
            <SharedTileLayer
              rootRef={stageRef}
              progress={openingProgress}
              layoutKey={isMobile ? 'mobile' : 'desktop'}
              onReadyChange={setSharedTilesReady}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
