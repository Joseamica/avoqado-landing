import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import type { StoryScene } from './story';
import { smoothstep } from './story-motion';

interface Props {
  scene: StoryScene;
  index: number;
  total: number;
  progress: MotionValue<number>;
  active: boolean;
  children: (localProgress: MotionValue<number>) => ReactNode;
}

export default function StoryLayer({ scene, index, total, progress, active, children }: Props) {
  const layerRef = useRef<HTMLElement>(null);
  const [start, end] = scene.range;
  const localProgress = useTransform(progress, [start, end], [0, 1], { clamp: true });
  const opacityInput = index === 0
    ? [0, 0.93, 1]
    : index === total - 1
      ? [0, 0.07, 1]
      : [0, 0.07, 0.93, 1];
  const opacityOutput = index === 0
    ? [1, 1, 0]
    : index === total - 1
      ? [0, 1, 1]
      : [0, 1, 1, 0];
  const opacity = useTransform(localProgress, opacityInput, opacityOutput, { ease: smoothstep });

  useEffect(() => {
    layerRef.current?.toggleAttribute('inert', !active);
  }, [active]);

  return (
    <motion.section
      ref={layerRef}
      data-story-scene={scene.id}
      data-active={active ? 'true' : 'false'}
      aria-hidden={!active}
      className="absolute inset-0"
      style={{ opacity, pointerEvents: active ? 'auto' : 'none' }}
    >
      {children(localProgress)}
    </motion.section>
  );
}
