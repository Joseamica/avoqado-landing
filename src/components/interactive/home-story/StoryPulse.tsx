import type { MotionValue } from 'framer-motion';

export default function StoryPulse({ progress: _progress }: { progress: MotionValue<number> }) {
  return (
    <div
      data-story-pulse-dock
      className="pointer-events-none absolute left-[38%] top-1/2 z-30 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
      aria-hidden="true"
    >
      <span className="absolute left-1/2 top-1/2 h-px w-8 -translate-x-1/2 -translate-y-1/2 bg-white/12" />
      <span className="block size-4 rounded-full border border-avoqado-green/30" />
    </div>
  );
}
