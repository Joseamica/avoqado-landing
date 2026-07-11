import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import type { StoryScene } from './story';

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
  const values = index === 0
    ? [1, 1, 1, 0]
    : index === total - 1
      ? [0, 1, 1, 1]
      : [0, 1, 1, 0];
  const opacity = useTransform(
    progress,
    [start, Math.min(start + 0.018, end), Math.max(end - 0.018, start), end],
    values,
  );
  const preservesCascadeDock = scene.id === 'operations' || scene.id === 'finance';
  const y = useTransform(
    localProgress,
    [0, 0.18, 0.82, 1],
    preservesCascadeDock ? [0, 0, 0, 0] : [24, 0, 0, -18],
  );

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
      style={{ opacity, y, pointerEvents: active ? 'auto' : 'none' }}
    >
      {children(localProgress)}
    </motion.section>
  );
}
