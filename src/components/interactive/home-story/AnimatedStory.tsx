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
  const [engaged, setEngaged] = useState(false);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', value => {
    const nextIndex = getActiveSceneIndex(value);
    setActiveIndex(current => current === nextIndex ? current : nextIndex);
    const nextEngaged = value > 0.001 && value < 0.89;
    setEngaged(current => current === nextEngaged ? current : nextEngaged);
    if (value >= 0.9 && !completedRef.current) {
      completedRef.current = true;
      pushEvent('homepage_story_complete');
    }
  });

  return (
    <div
      ref={rootRef}
      data-story-mode="animated"
      data-story-engaged={engaged ? 'true' : 'false'}
      data-active-scene={STORY_SCENES[activeIndex].id}
      className="relative h-[900vh] bg-neutral-950 lg:h-[1000vh]"
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
