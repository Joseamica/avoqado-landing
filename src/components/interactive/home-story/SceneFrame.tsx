import { motion, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import NarrativeAnchor from './NarrativeAnchor';
import { useNarrativeVisualMotion } from './story-motion';
import type { StoryScene } from './story';
import './home-story.css';

interface Props {
  scene: StoryScene;
  progress: MotionValue<number>;
  actions?: ReactNode;
  children: ReactNode;
}

export default function SceneFrame({ scene, progress, actions, children }: Props) {
  const visualMotion = useNarrativeVisualMotion(progress);
  const light = scene.theme === 'light';

  return (
    <div data-scene-frame={scene.id} className={light ? 'story-frame--scene h-full overflow-hidden bg-neutral-50 text-neutral-950' : 'story-frame--scene h-full overflow-hidden bg-neutral-950 text-neutral-50'}>
      <div className="story-frame-grid mx-auto grid h-full max-w-[1320px] grid-rows-[minmax(220px,38fr)_minmax(0,62fr)] gap-3 px-6 pb-6 pt-7 lg:grid-cols-[minmax(280px,41fr)_minmax(500px,59fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-16 lg:py-12">
        <NarrativeAnchor
          narrative={scene}
          progress={progress}
          actions={actions}
          light={light}
        />
        <motion.div
          data-narrative-visual
          aria-hidden="true"
          {...{ inert: '' }}
          className="story-frame-visual relative min-h-0 self-stretch lg:min-h-[500px]"
          style={visualMotion}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
