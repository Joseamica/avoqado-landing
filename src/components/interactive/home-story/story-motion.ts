import { useTransform, type MotionValue } from 'framer-motion';

export type MotionRange = [number, number];

export const STORY_PHASES: {
  compact: MotionRange;
  result: MotionRange;
  hold: MotionRange;
  exit: MotionRange;
  layerEnter: MotionRange;
  stepHalfWindow: number;
} = {
  compact: [0.18, 0.38],
  result: [0.73, 0.84],
  hold: [0.84, 0.93],
  exit: [0.93, 1],
  layerEnter: [0, 0.07],
  stepHalfWindow: 0.02,
};

export function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

export function stepWindow(threshold: number): MotionRange {
  return [threshold - STORY_PHASES.stepHalfWindow, threshold + STORY_PHASES.stepHalfWindow];
}

export function useStepReveal(
  progress: MotionValue<number>,
  threshold: number,
  distance = 14,
) {
  const window = stepWindow(threshold);
  return {
    opacity: useTransform(progress, window, [0, 1], { ease: smoothstep }),
    offset: useTransform(progress, window, [distance, 0], { ease: smoothstep }),
  };
}

export function useNarrativeVisualMotion(progress: MotionValue<number>) {
  const demo = useTransform(progress, STORY_PHASES.compact, [0, 1], { ease: smoothstep });
  const result = useTransform(progress, STORY_PHASES.result, [0, 1], { ease: smoothstep });
  return {
    opacity: useTransform(() => (0.14 + 0.86 * demo.get()) * (1 - 0.35 * result.get())),
    y: useTransform(() => 14 * (1 - demo.get())),
    scale: useTransform(() => 0.987 + 0.013 * demo.get()),
  };
}
