import type { MotionValue } from 'framer-motion';
import { STORY_SCENES } from './story';
import StoryLayer from './StoryLayer';

interface Props {
  progress: MotionValue<number>;
  activeIndex: number;
}

export default function StoryStage({ progress, activeIndex }: Props) {
  return (
    <div className="relative h-full w-full">
      {STORY_SCENES.map((scene, index) => (
        <StoryLayer
          key={scene.id}
          scene={scene}
          index={index}
          total={STORY_SCENES.length}
          progress={progress}
          active={index === activeIndex}
        >
          {() => (
            <div className={`flex h-full items-center ${scene.theme === 'light' ? 'bg-neutral-50 text-neutral-950' : 'bg-neutral-950 text-neutral-50'}`}>
              <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:pl-32">
                <p className="text-sm font-medium text-avoqado-green">{scene.eyebrow}</p>
                {index === 0 ? (
                  <h1 className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-6xl lg:text-7xl">{scene.title}</h1>
                ) : (
                  <h2 className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-6xl lg:text-7xl">{scene.title}</h2>
                )}
                <p className="mt-6 max-w-2xl text-lg opacity-70">{scene.body}</p>
              </div>
            </div>
          )}
        </StoryLayer>
      ))}
    </div>
  );
}
