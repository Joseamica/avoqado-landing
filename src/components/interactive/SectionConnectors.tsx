import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ConnectionLine {
  id: string;
  startY: number; // percentage from top (0-100)
  endY: number;   // percentage from top (0-100)
  color: string;
  gradient?: {
    from: string;
    to: string;
  };
}

// Define connection lines between sections
const CONNECTIONS: ConnectionLine[] = [
  {
    id: 'hero-to-chatbot',
    startY: 15,  // From bottom of SquareHero
    endY: 30,    // To top of ChatbotCTA
    color: '#69E185',
    gradient: {
      from: '#69E185',
      to: '#60A5FA',
    },
  },
  {
    id: 'chatbot-to-payment',
    startY: 35,  // From bottom of ChatbotCTA
    endY: 50,    // To top of PaymentRouting
    color: '#60A5FA',
    gradient: {
      from: '#60A5FA',
      to: '#8B5CF6',
    },
  },
  {
    id: 'payment-to-unified',
    startY: 60,  // From bottom of PaymentRouting
    endY: 72,    // To top of UnifiedPlatform
    color: '#8B5CF6',
    gradient: {
      from: '#8B5CF6',
      to: '#EC4899',
    },
  },
  {
    id: 'unified-to-industry',
    startY: 82,  // From bottom of UnifiedPlatform
    endY: 92,    // To top of IndustryAccordion
    color: '#EC4899',
    gradient: {
      from: '#EC4899',
      to: '#FBBF24',
    },
  },
];

interface AnimatedLineProps {
  line: ConnectionLine;
  containerHeight: number;
  scrollProgress: any;
}

const AnimatedLine: React.FC<AnimatedLineProps> = ({ line, containerHeight, scrollProgress }) => {
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  // Calculate absolute positions
  const startYPx = (line.startY / 100) * containerHeight;
  const endYPx = (line.endY / 100) * containerHeight;
  const centerX = 50; // Center of the viewport

  // Create a subtle S-curve path
  const controlPoint1X = centerX - 15;
  const controlPoint1Y = startYPx + (endYPx - startYPx) * 0.3;
  const controlPoint2X = centerX + 15;
  const controlPoint2Y = startYPx + (endYPx - startYPx) * 0.7;

  const path = `M ${centerX} ${startYPx}
                C ${controlPoint1X} ${controlPoint1Y},
                  ${controlPoint2X} ${controlPoint2Y},
                  ${centerX} ${endYPx}`;

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  // Animate based on scroll position
  // Lines appear AFTER sections are visible (add delay)
  const sectionAppearDelay = 0.05; // 5% scroll delay after section is visible
  const lineStart = (line.startY / 100) + sectionAppearDelay;
  const lineEnd = (line.endY / 100) + sectionAppearDelay + 0.1; // 10% to complete animation

  const strokeDashoffset = useTransform(
    scrollProgress,
    [lineStart, lineEnd],
    [pathLength, 0]
  );

  const opacity = useTransform(
    scrollProgress,
    [lineStart - 0.02, lineStart, lineEnd, lineEnd + 0.05],
    [0, 1, 1, 0]
  );

  return (
    <g>
      <defs>
        {line.gradient && (
          <linearGradient
            id={`gradient-${line.id}`}
            x1="0%"
            y1="0%"
            x2="0%"
            y2="100%"
          >
            <stop offset="0%" stopColor={line.gradient.from} />
            <stop offset="100%" stopColor={line.gradient.to} />
          </linearGradient>
        )}
      </defs>
      <motion.path
        ref={pathRef}
        d={path}
        fill="none"
        stroke={line.gradient ? `url(#gradient-${line.id})` : line.color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          strokeDasharray: pathLength,
          strokeDashoffset,
          opacity,
          filter: `drop-shadow(0 0 8px ${line.color})`,
        }}
      />
    </g>
  );
};

export const SectionConnectors: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-10"
      style={{ height: '100vh' }}
    >
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={`0 0 100 ${containerHeight}`}
        preserveAspectRatio="none"
      >
        {CONNECTIONS.map((line) => (
          <AnimatedLine
            key={line.id}
            line={line}
            containerHeight={containerHeight}
            scrollProgress={scrollYProgress}
          />
        ))}
      </svg>
    </div>
  );
};
