import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

interface ProductSectionProps {
  /** Product number display ("01", "02", etc.) */
  number: string;
  /** Small label above title ("Control central") */
  label: string;
  /** Accent color for label and number */
  accentColor: string;
  /** Product title ("Dashboard Web") */
  title: string;
  /** Description paragraph */
  description: string;
  /** Tags/badges to display */
  tags: string[];
  /** Link text ("Explorar Dashboard") */
  linkText: string;
  /** Link href */
  linkHref: string;
  /** The visual mockup — either static ReactNode or render prop receiving scrollYProgress */
  children: ReactNode | ((scrollYProgress: MotionValue<number>) => ReactNode);
  /** Reverse layout (mockup left, text right). Default false */
  reversed?: boolean;
  /** Background class. Default "bg-black" */
  bgClass?: string;
  /** Section id for anchor links */
  id?: string;
  /** Container height in vh. Default 200. Use 350 for Living Previews. */
  height?: number;
  /** Light mode — inverts text colors for white backgrounds. Default false */
  light?: boolean;
}

export default function ProductSection({
  number,
  label,
  accentColor,
  title,
  description,
  tags,
  linkText,
  linkHref,
  children,
  reversed = false,
  bgClass = 'bg-black',
  id,
  height = 200,
  light = false,
}: ProductSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Text side animations
  const numberOpacity = useTransform(scrollYProgress, [0, 0.12], [0, 1]);
  const numberX = useTransform(scrollYProgress, [0, 0.12], [-20, 0]);

  const titleOpacity = useTransform(scrollYProgress, [0.05, 0.2], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.05, 0.2], [40, 0]);

  const descOpacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);
  const descY = useTransform(scrollYProgress, [0.15, 0.3], [30, 0]);

  const tagsOpacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const tagsY = useTransform(scrollYProgress, [0.25, 0.4], [20, 0]);

  const linkOpacity = useTransform(scrollYProgress, [0.35, 0.5], [0, 1]);

  // Mockup side animations
  const mockupOpacity = useTransform(scrollYProgress, [0.1, 0.3], [0, 1]);
  const mockupScale = useTransform(scrollYProgress, [0.1, 0.3], [0.88, 1]);
  const mockupX = useTransform(scrollYProgress, [0.1, 0.3], [reversed ? -60 : 60, 0]);

  return (
    <div ref={containerRef} id={id} className={`relative ${bgClass} ${light ? 'border-t border-black/5' : 'border-t border-white/5'}`} style={{ height: `${height}vh` }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

            {/* Text Column */}
            <div className={reversed ? 'order-1 lg:order-2' : ''}>
              {/* Number + Label */}
              <motion.div
                style={{ opacity: numberOpacity, x: numberX }}
                className="flex items-center gap-3 mb-6"
              >
                <span className={`text-5xl font-light ${light ? 'text-black/10' : 'text-white/10'}`}>{number}</span>
                <span
                  className="text-xs uppercase tracking-widest font-semibold"
                  style={{ color: accentColor }}
                >
                  {label}
                </span>
              </motion.div>

              {/* Title */}
              <motion.h2
                style={{ opacity: titleOpacity, y: titleY }}
                className={`text-4xl md:text-5xl font-light tracking-tight mb-6 leading-tight ${light ? 'text-black' : 'text-white'}`}
              >
                {title}
              </motion.h2>

              {/* Description */}
              <motion.p
                style={{ opacity: descOpacity, y: descY }}
                className={`text-lg leading-relaxed mb-8 ${light ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {description}
              </motion.p>

              {/* Tags */}
              <motion.div
                style={{ opacity: tagsOpacity, y: tagsY }}
                className="flex flex-wrap gap-2 mb-8"
              >
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1.5 text-xs rounded-full border ${light ? 'border-black/10 text-gray-600' : 'border-white/10 text-gray-400'}`}
                  >
                    {tag}
                  </span>
                ))}
              </motion.div>

              {/* Link */}
              <motion.div style={{ opacity: linkOpacity }}>
                <a
                  href={linkHref}
                  className={`group inline-flex items-center gap-2 font-medium hover:text-avoqado-green transition-colors ${light ? 'text-black' : 'text-white'}`}
                >
                  {linkText}
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
                  </svg>
                </a>
              </motion.div>
            </div>

            {/* Mockup Column */}
            <motion.div
              style={{
                opacity: mockupOpacity,
                scale: mockupScale,
                x: mockupX,
              }}
              className={reversed ? 'order-2 lg:order-1' : ''}
            >
              {typeof children === 'function' ? children(scrollYProgress) : children}
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
