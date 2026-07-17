import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { NarrativeBeat } from './story';
import { smoothstep, STORY_PHASES } from './story-motion';

interface NarrativeAnchorProps {
  narrative: NarrativeBeat;
  progress: MotionValue<number>;
  thread?: ReactNode;
  headingLevel?: 1 | 2;
  headingId?: string;
  actions?: ReactNode;
  light?: boolean;
}

export default function NarrativeAnchor({
  narrative,
  progress,
  thread = narrative.thread,
  headingLevel = 2,
  headingId,
  actions,
  light = false,
}: NarrativeAnchorProps) {
  const Heading = headingLevel === 1 ? motion.h1 : motion.h2;
  const actionsRef = useRef<HTMLDivElement>(null);
  const compact = useTransform(progress, STORY_PHASES.compact, [0, 1], { ease: smoothstep });
  const headingScale = useTransform(compact, [0, 1], [1, 0.72]);
  const copyY = useTransform(compact, [0, 1], [0, -14]);
  const eyebrowOpacity = useTransform(compact, [0, 1], [1, 0]);
  const threadOpacity = useTransform(compact, [0, 1], [0, 1]);
  const resultOpacity = useTransform(progress, STORY_PHASES.result, [0, 1], { ease: smoothstep });
  const resultY = useTransform(progress, STORY_PHASES.result, [14, 0], { ease: smoothstep });

  const syncActions = useCallback((value: number) => {
    actionsRef.current?.toggleAttribute('inert', value < 0.95);
  }, []);

  useMotionValueEvent(resultOpacity, 'change', syncActions);
  useEffect(() => syncActions(resultOpacity.get()), [resultOpacity, syncActions]);

  return (
    <header data-narrative-anchor className="story-narrative-anchor relative z-20 min-h-0 self-center">
      <motion.div style={{ y: copyY }}>
        <div className="story-narrative-meta relative h-4">
          <motion.p
            data-narrative-eyebrow
            style={{ opacity: eyebrowOpacity }}
            className={light ? 'absolute inset-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-green-800 sm:text-xs' : 'absolute inset-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-xs'}
          >
            {narrative.eyebrow}
          </motion.p>
          <motion.p
            data-narrative-thread
            style={{ opacity: threadOpacity }}
            className={light ? 'absolute inset-0 flex items-center gap-2 text-[0.68rem] font-semibold text-neutral-600 sm:text-xs' : 'absolute inset-0 flex items-center gap-2 text-[0.68rem] font-semibold text-neutral-400 sm:text-xs'}
          >
            <span data-narrative-thread-marker aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-avoqado-green" />
            {thread}
          </motion.p>
        </div>
        <Heading
          id={headingId}
          data-narrative-title
          className="story-narrative-title mt-3 max-w-[13ch] origin-left-top text-[clamp(2.25rem,10vw,3rem)] font-medium leading-[0.98] tracking-[-0.052em] lg:text-[clamp(2.875rem,4.4vw,4.375rem)]"
          style={{ scale: headingScale }}
        >
          {narrative.title}
        </Heading>
        <p data-narrative-body className="sr-only">{narrative.body}</p>
        <motion.div
          data-narrative-result
          style={{ opacity: resultOpacity, y: resultY }}
          className="story-narrative-result mt-7 max-w-[32ch]"
        >
          <p className={light ? 'text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-green-800' : 'text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-avoqado-green'}>
            Resultado
          </p>
          <strong className="mt-2 block text-[clamp(1rem,1.5vw,1.375rem)] font-medium leading-[1.35] tracking-[-0.025em]">
            {narrative.result}
          </strong>
          {actions ? <div ref={actionsRef} {...{ inert: '' }} className="story-frame-actions mt-5">{actions}</div> : null}
        </motion.div>
      </motion.div>
    </header>
  );
}
