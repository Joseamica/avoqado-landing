import React, { useState, useRef, useEffect } from 'react';
import { motion, useScroll, useTransform, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';

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
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
    setAnimatedSpotsLeft(prev => Math.max(1, prev - 1));
    setAnimatedSpotsTaken(prev => Math.min(99, prev + 1));
  };

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

          {/* Form */}
          <motion.div className="max-w-md mx-auto" style={{ opacity: formOpacity }}>
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-4 sm:py-8"
                >
                  <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-avoqado-green flex items-center justify-center">
                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-lg sm:text-xl font-semibold text-black">¡Bienvenido al equipo!</p>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu@email.com"
                      required
                      className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-full focus:border-black bg-white text-black"
                      style={{ outline: 'none', boxShadow: 'none', borderRadius: '9999px' }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {isSubmitting ? '...' : 'Reservar'}
                    </button>
                  </div>
                  <p className="text-xs text-gray-400">Sin costo · Sin compromiso</p>
                </motion.form>
              )}
            </AnimatePresence>
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
