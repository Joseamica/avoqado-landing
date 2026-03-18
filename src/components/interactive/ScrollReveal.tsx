import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ScrollRevealProps {
  children: ReactNode;
  /** Container height multiplier in vh. Default 150. More = slower scroll. */
  height?: number;
  /** Background color class. Default "bg-black" */
  bgClass?: string;
  /** Sticky top offset class. Default "top-16" (below navbar) */
  topClass?: string;
  /** Additional className for the sticky viewport */
  viewportClass?: string;
}

/**
 * Reusable scrollytelling wrapper.
 * Wraps any content in a tall scroll container with a sticky viewport.
 * Children receive scrollYProgress via the render prop pattern.
 *
 * Usage:
 * ```tsx
 * <ScrollReveal height={200}>
 *   {(progress) => (
 *     <>
 *       <FadeIn progress={progress} range={[0, 0.3]}>
 *         <h2>Title</h2>
 *       </FadeIn>
 *       <FadeIn progress={progress} range={[0.3, 0.6]}>
 *         <p>Content</p>
 *       </FadeIn>
 *     </>
 *   )}
 * </ScrollReveal>
 * ```
 */
export default function ScrollReveal({
  children,
  height = 150,
  bgClass = 'bg-black',
  topClass = 'top-16',
  viewportClass = '',
}: ScrollRevealProps & { children: (scrollYProgress: any) => ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <div ref={containerRef} className={`relative ${bgClass}`} style={{ height: `${height}vh` }}>
      <div className={`sticky ${topClass} h-[calc(100vh-4rem)] flex items-center overflow-hidden ${viewportClass}`}>
        {children(scrollYProgress)}
      </div>
    </div>
  );
}

// ─── Helper Components ────────────────────────────────────────

interface FadeInProps {
  progress: any; // MotionValue<number>
  /** [start, end] scroll progress range. e.g. [0, 0.3] */
  range: [number, number];
  /** Starting Y offset in px. Default 40 */
  yOffset?: number;
  /** Additional className */
  className?: string;
  children: ReactNode;
}

/**
 * Fade + slide up within a ScrollReveal.
 */
export function FadeIn({ progress, range, yOffset = 40, className = '', children }: FadeInProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [yOffset, 0]);

  return (
    <motion.div style={{ opacity, y }} className={className}>
      {children}
    </motion.div>
  );
}

interface ScaleInProps {
  progress: any;
  range: [number, number];
  /** Starting scale. Default 0.85 */
  from?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Scale + fade within a ScrollReveal.
 */
export function ScaleIn({ progress, range, from = 0.85, className = '', children }: ScaleInProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  const scale = useTransform(progress, range, [from, 1]);

  return (
    <motion.div style={{ opacity, scale }} className={className}>
      {children}
    </motion.div>
  );
}

interface SlideInProps {
  progress: any;
  range: [number, number];
  /** Direction to slide from. Default "left" */
  from?: 'left' | 'right';
  /** Distance in px. Default 80 */
  distance?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Slide in from left or right within a ScrollReveal.
 */
export function SlideIn({ progress, range, from = 'left', distance = 80, className = '', children }: SlideInProps) {
  const opacity = useTransform(progress, range, [0, 1]);
  const x = useTransform(progress, range, [from === 'left' ? -distance : distance, 0]);

  return (
    <motion.div style={{ opacity, x }} className={className}>
      {children}
    </motion.div>
  );
}

interface StaggerProps {
  progress: any;
  /** Base start of the stagger range */
  baseStart: number;
  /** How much each item offsets. Default 0.04 */
  staggerBy?: number;
  /** Duration of each item's animation. Default 0.15 */
  duration?: number;
  /** Items to render */
  items: ReactNode[];
  className?: string;
  itemClassName?: string;
}

/**
 * Staggered reveal of multiple items within a ScrollReveal.
 */
export function Stagger({ progress, baseStart, staggerBy = 0.04, duration = 0.15, items, className = '', itemClassName = '' }: StaggerProps) {
  return (
    <div className={className}>
      {items.map((item, i) => {
        const start = baseStart + (i * staggerBy);
        const end = start + duration;
        return (
          <StaggerItem key={i} progress={progress} range={[start, end]} className={itemClassName}>
            {item}
          </StaggerItem>
        );
      })}
    </div>
  );
}

function StaggerItem({ progress, range, className, children }: { progress: any; range: [number, number]; className: string; children: ReactNode }) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [20, 0]);
  const scale = useTransform(progress, range, [0.9, 1]);

  return (
    <motion.div style={{ opacity, y, scale }} className={className}>
      {children}
    </motion.div>
  );
}
