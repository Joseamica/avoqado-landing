import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';

export default function ChatbotCTA() {
  const [inputValue, setInputValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll Progress relative to the container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Animations based on scroll progress
  // 0.0 - 0.2: Fade in Title
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [50, 0]);

  // 0.2 - 0.5: Input expands from dot/small to full
  const inputWidth = useTransform(scrollYProgress, [0.2, 0.5], ["0%", "100%"]);
  const inputOpacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);
  const inputScale = useTransform(scrollYProgress, [0.2, 0.5], [0.5, 1]);

  // 0.5 - 0.8: Suggestion chips appear
  const chipsOpacity = useTransform(scrollYProgress, [0.6, 0.8], [0, 1]);
  const chipsY = useTransform(scrollYProgress, [0.6, 0.8], [20, 0]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim().length > 0) {
      e.preventDefault();
      setIsModalOpen(true);
      inputRef.current?.blur();
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-black">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center px-4 overflow-hidden">
        
        {/* Background decorations - REMOVED for pure black */}
        {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vw] h-[150vw] bg-avoqado-green/5 rounded-full blur-3xl pointer-events-none" /> */}

        <div className="relative z-10 w-full max-w-2xl flex flex-col items-center text-center space-y-12">
          
          {/* Title Section */}
          <motion.div style={{ opacity: titleOpacity, y: titleY }} className="space-y-4">
            <h2 className="text-4xl md:text-6xl  text-white max-w-xl leading-tight mx-auto">
              Pregúntale a tu negocio <span className="text-avoqado-green">lo que sea.</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-urbanist max-w-lg mx-auto">
              La inteligencia artificial de Avoqado analiza tus ventas, inventario y clientes en tiempo real.
            </p>
          </motion.div>

          {/* Input Section */}
          <motion.div 
            style={{ 
              opacity: inputOpacity, 
              width: inputWidth,
              scale: inputScale
            }} 
            className="w-full relative group max-w-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-avoqado-green/20 via-white/10 to-avoqado-green/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative flex items-center bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-full overflow-hidden shadow-2xl transition-all duration-300 focus-within:border-avoqado-green/50 focus-within:ring-1 focus-within:ring-avoqado-green/50">
              <div className="pl-6 text-avoqado-green shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                  <line x1="12" x2="12" y1="19" y2="22"/>
                </svg>
              </div>
              
              <input
                ref={inputRef}
                type="text"
                className="flex-1 w-full bg-transparent border-none text-white text-lg px-4 py-4 focus:ring-0 focus:outline-none focus:border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none placeholder-gray-500 font-urbanist appearance-none !outline-none !shadow-none !ring-0 m-0 min-w-0"
                placeholder="¿Cuál fue el platillo más vendido hoy?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              
              <div className="pr-2 shrink-0">
                <button 
                  onClick={() => inputValue.trim().length > 0 && setIsModalOpen(true)}
                  className={`p-2 rounded-full transition-all duration-300 ${inputValue.trim().length > 0 ? 'bg-avoqado-green text-black hover:scale-105' : 'bg-white/5 text-gray-500 cursor-not-allowed'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/>
                    <path d="m12 5 7 7-7 7"/>
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Chips Section */}
          <motion.div 
            style={{ opacity: chipsOpacity, y: chipsY }}
            className="flex flex-wrap gap-3 justify-center text-sm text-gray-500"
          >
            <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setInputValue("Dame un reporte de ventas")}>"Dame un reporte de ventas"</span>
            <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 cursor-pointer transition-colors" onClick={() => setInputValue("Crear una promoción 2x1")}>"Crear una promoción 2x1"</span>
            <span className="bg-white/5 px-4 py-2 rounded-full border border-white/5 hover:bg-white/10 cursor-pointer transition-colors sm:block hidden" onClick={() => setInputValue("Optimizar inventario")}>"Optimizar inventario"</span>
          </motion.div>
        
        </div>
      </div>

      {/* Modal Dialog (Stays on top of everything) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <button 
                onClick={closeModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" x2="6" y1="6" y2="18"/>
                  <line x1="6" x2="18" y1="6" y2="18"/>
                </svg>
              </button>

              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-avoqado-green/20 rounded-2xl flex items-center justify-center mb-6 text-avoqado-green">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" x2="12" y1="19" y2="22"/>
                  </svg>
                </div>

                <h3 className="text-2xl  text-white mb-2">
                  Lleva tu venue al siguiente nivel
                </h3>
                
                <p className="text-gray-400 mb-8">
                  Para interactuar con el asistente virtual de Avoqado y transformar tu operación, necesitas una cuenta activa.
                </p>

                <div className="w-full space-y-3">
                  <a href="#" className="block w-full bg-avoqado-green text-black font-baby py-4 rounded-xl hover:scale-[1.02] transition-transform text-center">
                    Comenzar prueba gratis
                  </a>
                  <a href="#" className="block w-full bg-white/5 text-white font-medium py-4 rounded-xl hover:bg-white/10 transition-colors border border-white/5 text-center">
                    Agendar demostración
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
