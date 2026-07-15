import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { pushEvent } from '../../../lib/gtm';
import { getActiveSceneIndex, STORY_SCENES } from './story';
import StoryProgress from './StoryProgress';
import StoryStage from './StoryStage';

export default function AnimatedStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', value => {
    const nextIndex = getActiveSceneIndex(value);
    setActiveIndex(current => current === nextIndex ? current : nextIndex);
    if (value >= 0.9 && !completedRef.current) {
      completedRef.current = true;
      pushEvent('homepage_story_complete');
    }
  });

  return (
    <div
      ref={rootRef}
      data-story-mode="animated"
      data-active-scene={STORY_SCENES[activeIndex].id}
      className="relative h-[700vh] bg-neutral-950 lg:h-[800vh]"
    >
      <div
        className="sticky overflow-hidden"
        style={{
          top: 'var(--site-header-height)',
          height: 'calc(100dvh - var(--site-header-height))',
        }}
      >
        <StoryProgress progress={scrollYProgress} activeIndex={activeIndex} />
        <StoryStage progress={scrollYProgress} activeIndex={activeIndex} />
      </div>
    </div>
  );
}
