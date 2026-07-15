import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import AnimatedStory from './AnimatedStory';
import ReducedMotionStory from './ReducedMotionStory';
import OpeningJourney from '../home-opening/OpeningJourney';
import ReducedMotionOpening from '../home-opening/ReducedMotionOpening';

export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [forceMotion, setForceMotion] = useState(false);

  useEffect(() => {
    setForceMotion(new URLSearchParams(window.location.search).get('motion') === 'full');
    setMounted(true);
  }, []);

  const staticMode = mounted && reduceMotion && !forceMotion;

  return (
    <>
      {staticMode ? (
        <>
          <ReducedMotionOpening />
          <ReducedMotionStory />
        </>
      ) : (
        <>
          <OpeningJourney variant="channel-handoff" autoplay={mounted && (!reduceMotion || forceMotion)} />
          <AnimatedStory />
        </>
      )}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: '[data-opening-mode="animated"], [data-story-mode="animated"] { display: none !important; }' }} />
        <ReducedMotionOpening mode="noscript" />
        <ReducedMotionStory mode="noscript" />
      </noscript>
    </>
  );
}
