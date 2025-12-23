import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion';

const AnimatedCounter: React.FC<{ value: number; className?: string }> = ({ value, className }) => {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => { motionValue.set(value); }, [value, motionValue]);
  useEffect(() => {
    const unsubscribe = springValue.on("change", (v) => setDisplayValue(Math.round(v)));
    return () => unsubscribe();
  }, [springValue]);

  return <span className={className}>{displayValue}</span>;
};

export const EarlyAccessCTA: React.FC = () => {
  const [hasTriggered, setHasTriggered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ACTUAL_SPOTS_LEFT = 47;
  const SPOTS_TAKEN = 100 - ACTUAL_SPOTS_LEFT;

  const [animatedSpotsLeft, setAnimatedSpotsLeft] = useState(0);
  const [animatedSpotsTaken, setAnimatedSpotsTaken] = useState(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  useEffect(() => {
    const unsubscribe = scrollYProgress.on("change", (latest) => {
      if (latest > 0.05 && !hasTriggered) {
        setHasTriggered(true);
        setAnimatedSpotsLeft(ACTUAL_SPOTS_LEFT);
        setAnimatedSpotsTaken(SPOTS_TAKEN);
      }
    });
    return () => unsubscribe();
  }, [scrollYProgress, hasTriggered]);

  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [40, 0]);
  const counterOpacity = useTransform(scrollYProgress, [0.15, 0.35], [0, 1]);
  const benefitsOpacity = useTransform(scrollYProgress, [0.3, 0.5], [0, 1]);
  const formOpacity = useTransform(scrollYProgress, [0.55, 0.75], [0, 1]);
  const footerOpacity = useTransform(scrollYProgress, [0.75, 0.9], [0, 1]);



  const benefits = [
    { stat: "100%", label: "Features priorizadas por ti" },
    { stat: "<2h", label: "Tiempo de respuesta VIP" },
    { stat: "50%", label: "Descuento de por vida" },
    { stat: "∞", label: "Personalizaciones incluidas" },
  ];

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-white">
      <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-hidden flex items-center justify-center">
        <div className="relative px-4 sm:px-6 w-full max-w-4xl mx-auto text-center">

          {/* Heading */}
          <motion.div className="mb-4 sm:mb-8 lg:mb-12" style={{ opacity: titleOpacity, y: titleY }}>
            <h2 className="text-xl sm:text-3xl lg:text-5xl font-bold text-black mb-1 sm:mb-3">
              Sé parte del futuro
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-500">
              Únete a los primeros 100 fundadores
            </p>
          </motion.div>

          {/* Big Counter */}
          <motion.div className="mb-4 sm:mb-8 lg:mb-12" style={{ opacity: counterOpacity }}>
            <AnimatedCounter
              value={animatedSpotsLeft}
              className="text-[60px] sm:text-[100px] lg:text-[140px] font-bold text-black leading-none"
            />
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 mt-1">lugares disponibles</p>
          </motion.div>

          {/* Benefits Grid - Clean 4 columns */}
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 lg:gap-10 mb-4 sm:mb-8 lg:mb-12 max-w-3xl mx-auto"
            style={{ opacity: benefitsOpacity }}
          >
            {benefits.map((b, i) => (
              <div key={i} className="text-center">
                <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-1">{b.stat}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 leading-tight">{b.label}</p>
              </div>
            ))}
          </motion.div>

          {/* Button */}
          <motion.div className="max-w-md mx-auto" style={{ opacity: formOpacity }}>
            <div className="flex justify-center">
              <a
                href="/contact"
                className="inline-flex px-10 sm:px-12 py-4 sm:py-5 rounded-full font-bold text-lg sm:text-xl bg-black text-white hover:bg-gray-800 hover:scale-105 transition-all shadow-xl"
              >
                Reservar
              </a>
            </div>
            <p className="text-xs text-gray-400 mt-4">Sin costo · Sin compromiso</p>
          </motion.div>

          {/* Footer */}
          <motion.p className="mt-6 sm:mt-12 text-xs sm:text-sm text-gray-400" style={{ opacity: footerOpacity }}>
            <span className="text-black font-medium">+<AnimatedCounter value={animatedSpotsTaken} /> negocios</span> ya reservaron
          </motion.p>
        </div>
      </div>
    </div>
  );
};
