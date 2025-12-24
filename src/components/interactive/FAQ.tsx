import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import DoodleBackground from './DoodleBackground';

export default function FAQ() {
  const containerRef = useRef<HTMLElement>(null);
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setMounted(true);
    const updateSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  
  // Track scroll progress of this specific section (200vh height)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Animation Maps
  // 1. Text Writing Sequence
  // Line 1: 0% -> 10% (Starts as soon as it sticks)
  const writeProgress1 = useTransform(scrollYProgress, [0, 0.1], ["0%", "100%"]);
  // Line 2: 10% -> 20%
  const writeProgress2 = useTransform(scrollYProgress, [0.1, 0.2], ["0%", "100%"]);

  // 2. Arrow Sequence
  // a) Main Line draws first (25% -> 60%)
  const lineDraw = useTransform(scrollYProgress, [0.25, 0.60], [0, 1]); 
  // Fix "White Dot" - Opacity 0 until just before drawing
  const arrowLineOpacity = useTransform(scrollYProgress, [0.24, 0.25], [0, 1]);
  
  // b) Arrow Head fades in immediately AFTER line finishes
  const arrowHeadOpacity = useTransform(scrollYProgress, [0.59, 0.60], [0, 1]);

  // 3. Circle draws around the bot (65% -> 90%)
  const circleDraw = useTransform(scrollYProgress, [0.65, 0.90], [0, 1]); 
  
  // Overlay Opacity
  // Fade in at start (0-5%) and STAY VISIBLE
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.05], [0, 1]);

  // Calculate coordinates based on window size
  const { width, height } = windowSize;
  const isMobile = width < 768;

  // Responsive start point (below the text)
  const startX = width / 2;
  const startY = height / 2 + (isMobile ? 60 : 90);

  // Responsive end point (chatbot button position)
  // Leave extra margin to prevent stroke from causing overflow
  const endX = width - (isMobile ? 60 : 120);
  const endY = height - (isMobile ? 60 : 75);

  // Control points for the curve - adjusted for mobile
  // On mobile: shorter, more direct curve
  // On desktop: wider, more elegant curve
  const cp1X = isMobile ? width * 0.3 : width * 0.4;
  const cp1Y = isMobile ? height * 0.65 : height * 0.7;
  const cp2X = isMobile ? width * 0.7 : width * 0.75;
  const cp2Y = endY - (isMobile ? 30 : 10);

  const arrowPathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;

  // Arrowhead - responsive size
  const headSize = isMobile ? 15 : 25;
  const arrowHeadD = `M ${endX - headSize} ${endY - headSize} Q ${endX} ${endY - 5} ${endX} ${endY} Q ${endX} ${endY + 5} ${endX - headSize} ${endY + (isMobile ? 12 : 20)}`;

  // Circle around chatbot button - responsive position and size
  // Mobile: larger circle so button fits completely inside
  // Keep safe margin from viewport edge to prevent overflow
  const cx = width - (isMobile ? 65 : 60);
  const cy = height - (isMobile ? 58 : 60);
  const rx = isMobile ? 48 : 55;
  const ry = isMobile ? 45 : 50;
  
  // Approximation of a hand-drawn double oval using Cubic Beziers
  // Loop 1 (Outer) -> Loop 2 (Inner/Offset)
  const scribblePathD = `
    M ${cx - rx + 10} ${cy - 5} 
    C ${cx - rx + 10} ${cy - ry}, ${cx + rx} ${cy - ry}, ${cx + rx} ${cy} 
    C ${cx + rx} ${cy + ry}, ${cx - rx} ${cy + ry}, ${cx - rx} ${cy} 
    C ${cx - rx} ${cy - ry + 10}, ${cx + rx - 5} ${cy - ry + 15}, ${cx + rx - 5} ${cy + 5} 
    C ${cx + rx - 5} ${cy + ry - 10}, ${cx - rx + 15} ${cy + ry - 5}, ${cx - rx + 20} ${cy + 10}
  `;

  return (
    <section ref={containerRef} className="w-full h-[300vh] bg-black text-white relative">
      {/* Background Texture (Subtle Chalkboard effect) - only within this section */}
      <div className="absolute inset-0 opacity-20 pointer-events-none"
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-scales.png")' }}></div>

      {/* Sticky Content - Stays centered while scrolling */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Doodles Background with Parallax */}
        <DoodleBackground scrollYProgress={scrollYProgress} />

        <div className="max-w-4xl mx-auto px-4 text-center z-10 relative">
          
          {/* Rotated Container for Diagonal Text */}
          <div className="rotate-[-15deg] transform origin-center">
            {/* Title Line 1 */}
            <div className="relative inline-block mr-4">
               {/* Ghost Text for layout */}
               <span className="text-5xl md:text-6xl lg:text-7xl font-baby leading-tight text-transparent opacity-0">
                 ¿Quieres saber
               </span>
               {/* Reveal Mask */}
               <motion.div 
                 style={{ width: writeProgress1 }}
                 className="absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap"
               >
                 <span className="text-5xl md:text-6xl lg:text-7xl font-baby leading-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                    ¿Quieres saber
                 </span>
               </motion.div>
            </div>
            
            <br />

            {/* Title Line 2 */}
            <div className="relative inline-block">
               <span className="text-5xl md:text-6xl lg:text-7xl font-baby leading-tight text-transparent opacity-0">
                 todo de Avoqado?
               </span>
               <motion.div 
                 style={{ width: writeProgress2 }}
                 className="absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap"
               >
                 <span className="text-5xl md:text-6xl lg:text-7xl font-baby leading-tight text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]">
                    todo de Avoqado?
                 </span>
               </motion.div>
            </div>
          </div>

        </div>
      </div>

      {/* Global Overlay Portal - Renders outside of any transform context */}
      {mounted && createPortal(
        <motion.div
          style={{ opacity: overlayOpacity }}
          className="fixed inset-0 pointer-events-none z-[40] overflow-hidden"
        >
          <svg
            className="w-full h-full"
            style={{ overflow: 'hidden' }}
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="xMidYMid slice"
          > 
             {/* Arrow Path using calculated coordinates */}
             <motion.path
               d={arrowPathD}
               fill="none"
               stroke="#69E185"
               strokeWidth="5"
               strokeLinecap="round"
               strokeDasharray="15 10 5 10" // Organic chalk
               style={{ 
                 pathLength: lineDraw,
                 opacity: arrowLineOpacity 
               }}
             />
             
             {/* Arrow Head */}
             <motion.path
                d={arrowHeadD}
                fill="none"
                stroke="#69E185"
                strokeWidth="5"
                strokeLinecap="round"
                style={{ opacity: arrowHeadOpacity }} 
             />
             
             {/* Double-Loop Scribble Oval */}
             <motion.path
                d={scribblePathD}
                fill="none"
                stroke="#69E185"
                strokeWidth="3" // Slightly thinner for the scribble to look detailed
                strokeDasharray="20 5 10 5" 
                style={{ 
                  pathLength: circleDraw,
                  rotate: -10 
                }}
             />
          </svg>
        </motion.div>,
        document.body
      )}
    </section>
  );
}
