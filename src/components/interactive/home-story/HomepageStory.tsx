import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import AnimatedStory from './AnimatedStory';
import ReducedMotionStory from './ReducedMotionStory';

export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {mounted && reduceMotion ? <ReducedMotionStory /> : <AnimatedStory />}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: '[data-story-mode="animated"] { display: none !important; }' }} />
        <ReducedMotionStory mode="noscript" />
      </noscript>
    </>
  );
}
