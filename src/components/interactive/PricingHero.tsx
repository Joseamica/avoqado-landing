import { motion } from 'framer-motion';

export default function PricingHero() {
  return (
    <section className="bg-white py-20 md:py-28 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 to-white pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Eyebrow */}
          <p className="text-gray-500 text-lg mb-6 font-medium">
            Precios transparentes, sin sorpresas
          </p>

          {/* Main Transaction Fee Display */}
          <div className="mb-8">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-7xl md:text-9xl font-bold text-black tracking-tight">
                2.9%
              </span>
              <span className="text-4xl md:text-6xl font-bold text-gray-400">
                + $3
              </span>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 mt-4">
              por transacción procesada
            </p>
          </div>

          {/* Value Props */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-10 mb-12 text-gray-600">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-avoqado-green flex-shrink-0" style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Sin costos ocultos</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-avoqado-green flex-shrink-0" style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Sin contratos</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-avoqado-green flex-shrink-0" style={{ width: '20px', height: '20px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Cancela cuando quieras</span>
            </div>
          </div>

          {/* CTA */}
          <motion.a 
            href="/contact"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-bold text-lg rounded-full hover:bg-gray-800 transition-colors"
          >
            Comienza gratis
            <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </motion.a>

          <p className="text-gray-400 text-sm mt-4">
            14 días de prueba gratis • Sin tarjeta de crédito
          </p>
        </motion.div>
      </div>
    </section>
  );
}
