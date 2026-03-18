import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Scrollytelling hero for /productos page.
 * "Cuatro productos. Un ecosistema." with staggered number counters.
 */
export default function ProductsScrollHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Phase 1: Label (0 - 0.1)
  const labelOpacity = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const labelY = useTransform(scrollYProgress, [0, 0.1], [20, 0]);

  // Phase 2: "Cuatro productos." (0.05 - 0.2)
  const line1Opacity = useTransform(scrollYProgress, [0.05, 0.2], [0, 1]);
  const line1Y = useTransform(scrollYProgress, [0.05, 0.2], [60, 0]);

  // Phase 3: "Un ecosistema." (0.15 - 0.3)
  const line2Opacity = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);
  const line2Y = useTransform(scrollYProgress, [0.15, 0.3], [60, 0]);

  // Phase 4: Description (0.25 - 0.4)
  const descOpacity = useTransform(scrollYProgress, [0.25, 0.4], [0, 1]);
  const descY = useTransform(scrollYProgress, [0.25, 0.4], [30, 0]);

  // Phase 5: CTA buttons (0.4 - 0.55)
  const ctaOpacity = useTransform(scrollYProgress, [0.4, 0.55], [0, 1]);
  const ctaY = useTransform(scrollYProgress, [0.4, 0.55], [30, 0]);

  // Phase 6: Four product pills stagger in (0.5 - 0.85)
  const products = [
    { num: '01', name: 'Dashboard', color: 'oklch(0.72 0.14 240)' },
    { num: '02', name: 'TPV', color: '#69E185' },
    { num: '03', name: 'POS', color: 'oklch(0.68 0.15 290)' },
    { num: '04', name: 'QR', color: 'oklch(0.78 0.14 75)' },
  ];

  const pillTransforms = products.map((_, i) => {
    const start = 0.5 + (i * 0.07);
    const end = start + 0.12;
    return {
      opacity: useTransform(scrollYProgress, [start, end], [0, 1]),
      y: useTransform(scrollYProgress, [start, end], [40, 0]),
      scale: useTransform(scrollYProgress, [start, end], [0.8, 1]),
    };
  });

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-black">
      <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6">

          {/* Label */}
          <motion.p
            style={{ opacity: labelOpacity, y: labelY }}
            className="text-avoqado-green text-sm font-semibold tracking-widest uppercase mb-6"
          >
            Productos
          </motion.p>

          {/* Title line 1 */}
          <motion.h1
            style={{ opacity: line1Opacity, y: line1Y }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] text-white max-w-4xl"
          >
            Cuatro productos.
          </motion.h1>

          {/* Title line 2 */}
          <motion.h1
            style={{ opacity: line2Opacity, y: line2Y }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-tight leading-[0.95] text-white max-w-4xl mb-8"
          >
            Un ecosistema.
          </motion.h1>

          {/* Description */}
          <motion.p
            style={{ opacity: descOpacity, y: descY }}
            className="text-lg md:text-xl text-gray-500 max-w-xl leading-relaxed mb-12"
          >
            Terminal de cobro, punto de venta, dashboard con IA y pagos QR — todo sincronizado en tiempo real.
          </motion.p>

          {/* CTA */}
          <motion.div
            style={{ opacity: ctaOpacity, y: ctaY }}
            className="flex flex-col sm:flex-row gap-4 mb-16"
          >
            <a href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition-colors">
              Agendar demo
            </a>
            <a href="https://demo.dashboard.avoqado.io" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center px-8 py-4 border border-white/20 text-white font-medium rounded-full hover:bg-white/5 transition-colors">
              Probar gratis
            </a>
          </motion.div>

          {/* Product pills */}
          <div className="flex flex-wrap gap-3">
            {products.map((product, i) => (
              <motion.a
                key={product.num}
                href={`#product-${product.num}`}
                style={{
                  opacity: pillTransforms[i].opacity,
                  y: pillTransforms[i].y,
                  scale: pillTransforms[i].scale,
                }}
                className="flex items-center gap-3 px-5 py-3 rounded-full border border-white/10 hover:border-white/20 transition-colors group cursor-pointer"
              >
                <span className="text-xs font-mono" style={{ color: product.color }}>{product.num}</span>
                <span className="text-white text-sm font-medium group-hover:text-avoqado-green transition-colors">{product.name}</span>
                <svg className="w-3.5 h-3.5 text-gray-600 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </motion.a>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
