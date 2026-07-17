import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import AnimatedStory from './AnimatedStory';
import ReducedMotionStory from './ReducedMotionStory';
import OpeningJourney from '../home-opening/OpeningJourney';
import ReducedMotionOpening from '../home-opening/ReducedMotionOpening';
import {
  resolveMediaProfile,
  resolveMotionProfile,
  type MediaProfile,
  type MotionProfile,
} from './experience-profile';

interface NavigatorWithConnection extends Navigator {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [motionProfile, setMotionProfile] = useState<MotionProfile>('full');
  const [mediaProfile, setMediaProfile] = useState<MediaProfile>('standard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMotionProfile(resolveMotionProfile({
      override: params.get('motion'),
      prefersReducedMotion: Boolean(reduceMotion),
    }));
    setMediaProfile(resolveMediaProfile(
      (navigator as NavigatorWithConnection).connection,
    ));
    setMounted(true);
  }, [reduceMotion]);

  return (
    <div
      data-home-motion-profile={motionProfile}
      data-home-media-profile={mediaProfile}
    >
      {motionProfile === 'reduced' ? (
        <>
          <ReducedMotionOpening />
          <ReducedMotionStory />
        </>
      ) : (
        <>
          <OpeningJourney
            variant="channel-handoff"
            autoplay={mounted}
          />
          <AnimatedStory />
        </>
      )}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: '[data-opening-mode="animated"], [data-story-mode="animated"] { display: none !important; }' }} />
        <ReducedMotionOpening mode="noscript" />
        <ReducedMotionStory mode="noscript" />
      </noscript>
    </div>
  );
}
