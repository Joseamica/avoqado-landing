import { motion, useTransform, type MotionValue } from 'framer-motion';
import { STORY_SCENES } from './story';

interface Props {
  progress: MotionValue<number>;
  activeIndex: number;
}

export default function StoryProgress({ progress, activeIndex }: Props) {
  const mobileScale = useTransform(progress, [0, 1], [0, 1]);
  const milestones = STORY_SCENES.filter(scene => (
    ['service', 'payment', 'operations', 'multibranch', 'ai'].includes(scene.id)
  ));
  const activeStart = STORY_SCENES[activeIndex].range[0];
  const activeMilestone = milestones.reduce((current, scene, index) => scene.range[0] <= activeStart ? index : current, 0);

  return (
    <>
      <nav aria-label="Progreso de la historia" className="absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <ol className="space-y-3 border-l border-white/10 pl-4">
          {milestones.map((scene, index) => (
            <li key={scene.id} className={index === activeMilestone ? 'text-xs text-white' : 'text-xs text-neutral-500'}>
              {scene.progressLabel}
            </li>
          ))}
        </ol>
      </nav>
      <div className="absolute inset-x-0 bottom-0 z-40 h-px bg-white/10 lg:hidden" aria-hidden="true">
        <motion.div className="h-px origin-left bg-avoqado-green" style={{ scaleX: mobileScale }} />
      </div>
    </>
  );
}
