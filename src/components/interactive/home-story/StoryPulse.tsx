import { motion, useTransform, type MotionValue } from 'framer-motion';

export default function StoryPulse({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], ['-38dvh', '38dvh']);
  const scale = useTransform(progress, [0, 0.5, 1], [0.8, 1.15, 0.8]);

  return (
    <div className="pointer-events-none absolute left-[38%] top-1/2 z-30 hidden h-[76dvh] w-px -translate-y-1/2 bg-white/8 lg:block" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.span className="block size-3 rounded-full bg-avoqado-green shadow-[0_0_24px_rgb(122_221_44_/_0.45)]" style={{ y, scale }} />
      </span>
    </div>
  );
}
