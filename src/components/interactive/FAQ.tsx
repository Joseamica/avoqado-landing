import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

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
  const startX = width / 2;
  const startY = height / 2 + 90; // Start lower to avoid crossing text
  
  // Updated Target: Width-115 (Left) and Height-70 (Lower)
  const endX = width - 115;
  const endY = height - 70;
  
  // Control points for the curve (Cubic Bezier)
  const cp1X = width * 0.4; 
  const cp1Y = height * 0.7;
  const cp2X = width * 0.75; 
  const cp2Y = endY - 10;

  const arrowPathD = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
  // Expert UX: "C-Shaped" Hook Arrowhead (Matches reference)
  // A clean, simple hook curve
  const arrowHeadD = `M ${endX - 25} ${endY - 25} Q ${endX} ${endY - 5} ${endX} ${endY} Q ${endX} ${endY + 5} ${endX - 25} ${endY + 20}`;

  // Double-Loop "Scribble" Circle Path
  // We construct a path that loops around the center essentially twice with variation
  const cx = width - 54;
  const cy = height - 54;
  const rx = 60;
  const ry = 55;
  
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
      {/* Background Texture (Subtle Chalkboard effect) */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" 
           style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/black-scales.png")' }}></div>

      {/* Sticky Content - Stays centered while scrolling */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
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
          className="fixed inset-0 pointer-events-none z-[9999]"
        >
          <svg className="w-full h-full"> 
             {/* Arrow Path using calculated coordinates */}
             <motion.path
               d={arrowPathD}
               fill="none"
               stroke="white"
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
                stroke="white"
                strokeWidth="5"
                strokeLinecap="round"
                style={{ opacity: arrowHeadOpacity }} 
             />
             
             {/* Double-Loop Scribble Oval */}
             <motion.path
                d={scribblePathD}
                fill="none"
                stroke="white"
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
