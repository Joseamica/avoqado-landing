import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

const GREEN = '#69E185';
const BLUE = 'oklch(0.72 0.14 240)';
const INDIGO = 'oklch(0.68 0.15 290)';
const AMBER = 'oklch(0.78 0.14 75)';
const TEAL = 'oklch(0.75 0.14 195)';
const MAGENTA = 'oklch(0.72 0.15 340)';

const products = [
  { id: 'dashboard', num: '01', name: 'Dashboard', desc: 'Inventario, personal, reportes y asistente IA', color: BLUE, href: '/productos/dashboard' },
  { id: 'tpv', num: '02', name: 'TPV', desc: 'Terminal de cobro con NFC, chip y banda', color: GREEN, href: '/productos/tpv' },
  { id: 'pos', num: '03', name: 'POS', desc: 'Punto de venta iOS y Android', color: INDIGO, href: '/productos/pos' },
  { id: 'qr', num: '04', name: 'QR', desc: 'Escanea, pide y paga en 30 segundos', color: AMBER, href: '/productos/qr' },
  { id: 'ia', num: '05', name: 'Asistente IA', desc: 'Pregunta en lenguaje natural, obtiene respuestas', color: TEAL, href: '/productos/ai' },
  { id: 'widget', num: '06', name: 'Widget', desc: 'Ordenes y reservas embebidas en tu sitio', color: MAGENTA, href: '/productos/widget' },
];

// ─── Product Card (cube style) ──────────────────────
function ProductCube({ product, isActive, progress, index }: {
  product: typeof products[0];
  isActive: boolean;
  progress: MotionValue<number>;
  index: number;
}) {
  // Each cube fades in staggered
  const startFade = 0.05 + index * 0.01;
  const opacity = useTransform(progress, [startFade, startFade + 0.08], [0, 1]);
  const y = useTransform(progress, [startFade, startFade + 0.08], [15, 0]);

  return (
    <motion.a
      href={product.href}
      className="block rounded-xl p-3 transition-all duration-300"
      style={{
        opacity, y,
        background: isActive ? `oklch(0.14 0.005 155)` : 'transparent',
        border: isActive ? `1px solid ${product.color}30` : '1px solid transparent',
        boxShadow: isActive ? `0 0 20px ${product.color}10` : 'none',
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300"
          style={{
            background: isActive ? `${product.color}20` : 'oklch(0.18 0.005 155)',
          }}
        >
          <div
            className="w-2.5 h-2.5 rounded-full transition-all duration-300"
            style={{ background: isActive ? product.color : 'oklch(0.35 0.005 155)' }}
          />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-mono transition-colors duration-300" style={{ color: isActive ? product.color : 'oklch(0.35 0.005 155)' }}>{product.num}</span>
            <span className="text-sm font-medium transition-colors duration-300" style={{ color: isActive ? 'white' : 'oklch(0.50 0.005 155)' }}>{product.name}</span>
          </div>
          <p className="text-[10px] transition-colors duration-300 truncate" style={{ color: isActive ? 'oklch(0.55 0.005 155)' : 'oklch(0.35 0.005 155)' }}>
            {product.desc}
          </p>
        </div>
        {isActive && (
          <svg className="w-3.5 h-3.5 shrink-0 ml-auto" style={{ color: product.color }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        )}
      </div>
    </motion.a>
  );
}

// ─── Preview Mockups ────────────────────────────────
function PreviewDashboard() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'oklch(0.12 0.005 155)', border: '1px solid oklch(0.20 0.005 155)' }}>
      <div className="flex">
        <div className="w-10 py-3 space-y-2 flex flex-col items-center shrink-0" style={{ background: 'oklch(0.10 0.005 155)', borderRight: '1px solid oklch(0.18 0.005 155)' }}>
          <div className="w-5 h-5 rounded-md" style={{ background: `${BLUE}30` }} />
          <div className="w-4 h-1 rounded" style={{ background: 'oklch(0.25 0.005 155)' }} />
          <div className="w-4 h-1 rounded" style={{ background: 'oklch(0.25 0.005 155)' }} />
          <div className="w-4 h-1 rounded" style={{ background: 'oklch(0.25 0.005 155)' }} />
        </div>
        <div className="flex-1 p-3 space-y-2">
          <div className="flex gap-2">
            <div className="flex-1 p-2 rounded-lg" style={{ background: 'oklch(0.16 0.005 155)' }}>
              <div className="text-[7px]" style={{ color: 'oklch(0.40 0.005 155)' }}>Ventas</div>
              <div className="text-xs font-semibold" style={{ color: BLUE }}>$24,850</div>
            </div>
            <div className="flex-1 p-2 rounded-lg" style={{ background: 'oklch(0.16 0.005 155)' }}>
              <div className="text-[7px]" style={{ color: 'oklch(0.40 0.005 155)' }}>Ordenes</div>
              <div className="text-xs font-semibold" style={{ color: GREEN }}>127</div>
            </div>
          </div>
          <div className="h-16 rounded-lg flex items-end gap-1 p-2" style={{ background: 'oklch(0.16 0.005 155)' }}>
            {[35, 55, 40, 70, 50, 80, 65].map((h, i) => (
              <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: BLUE, opacity: 0.5 + i * 0.07 }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewTPV() {
  return (
    <div className="flex justify-center">
      <div className="w-32 rounded-xl overflow-hidden" style={{ background: 'oklch(0.10 0.005 155)', border: '1px solid oklch(0.20 0.005 155)' }}>
        <div className="p-2 space-y-1.5">
          <div className="flex gap-1">
            <div className="px-1.5 py-0.5 rounded text-[6px] text-black" style={{ background: GREEN }}>Tacos</div>
            <div className="px-1.5 py-0.5 rounded text-[6px]" style={{ color: 'oklch(0.40 0.005 155)' }}>Platos</div>
          </div>
          {['Pastor $95', 'Suadero $85'].map((item, i) => (
            <div key={i} className="p-1.5 rounded text-[7px] text-white" style={{ background: 'oklch(0.16 0.005 155)' }}>{item}</div>
          ))}
          <div className="py-1 rounded text-[7px] text-center text-black font-semibold" style={{ background: GREEN }}>Cobrar</div>
        </div>
      </div>
    </div>
  );
}

function PreviewPOS() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'oklch(0.12 0.005 155)', border: '1px solid oklch(0.20 0.005 155)' }}>
      <div className="p-2.5 space-y-1.5">
        <div className="grid grid-cols-3 gap-1">
          {['Mesa 1', 'Mesa 2', 'Mesa 3', 'Mesa 4', 'Mesa 5', 'Mesa 6'].map((m, i) => (
            <div key={i} className="p-1.5 rounded text-[7px] text-center" style={{
              background: i < 2 ? `${INDIGO}20` : 'oklch(0.16 0.005 155)',
              color: i < 2 ? INDIGO : 'oklch(0.40 0.005 155)',
              border: i < 2 ? `1px solid ${INDIGO}30` : '1px solid transparent',
            }}>{m}</div>
          ))}
        </div>
        <div className="py-1 rounded text-[7px] text-center text-black font-semibold" style={{ background: INDIGO }}>Nueva orden</div>
      </div>
    </div>
  );
}

function PreviewQR() {
  return (
    <div className="flex justify-center">
      <div className="w-28 rounded-2xl overflow-hidden" style={{ background: 'oklch(0.10 0.005 155)', border: '1px solid oklch(0.20 0.005 155)' }}>
        <div className="p-3 flex flex-col items-center">
          <div className="w-14 h-14 rounded-lg mb-2 grid grid-cols-3 gap-0.5 p-1" style={{ border: `1px solid ${AMBER}` }}>
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="rounded-sm" style={{ background: `${AMBER}${i % 2 === 0 ? '60' : '30'}` }} />
            ))}
          </div>
          <div className="text-[8px] text-white mb-0.5">Escanea el QR</div>
          <div className="text-[6px]" style={{ color: 'oklch(0.40 0.005 155)' }}>Sin app</div>
        </div>
      </div>
    </div>
  );
}

function PreviewIA() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'oklch(0.12 0.005 155)', border: '1px solid oklch(0.20 0.005 155)' }}>
      <div className="p-2.5 space-y-1.5">
        <div className="flex justify-end">
          <div className="px-2 py-1 rounded-lg text-[7px] text-white max-w-[80%]" style={{ background: 'oklch(0.22 0.005 155)' }}>
            Cuanto vendi hoy?
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="w-4 h-4 rounded-full shrink-0" style={{ background: `${TEAL}30` }}>
            <div className="w-full h-full rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
            </div>
          </div>
          <div className="px-2 py-1 rounded-lg text-[7px]" style={{ background: 'oklch(0.18 0.005 155)', color: 'oklch(0.65 0.005 155)' }}>
            <span style={{ color: TEAL }}>$24,850</span> en 127 ordenes. +12% vs ayer.
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewWidget() {
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: 'oklch(0.95 0.005 75)', border: '1px solid oklch(0.88 0.005 75)' }}>
      <div className="flex items-center justify-between px-2 py-1" style={{ borderBottom: '1px solid oklch(0.88 0.005 75)' }}>
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.50 0.15 25)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.65 0.15 85)' }} />
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.55 0.15 145)' }} />
        </div>
        <div className="text-[6px]" style={{ color: 'oklch(0.60 0.005 75)' }}>misushi.com</div>
      </div>
      <div className="p-2 relative" style={{ minHeight: '60px' }}>
        <div className="h-1 w-12 rounded mb-1" style={{ background: 'oklch(0.82 0.005 75)' }} />
        <div className="h-0.5 w-full rounded mb-0.5" style={{ background: 'oklch(0.88 0.005 75)' }} />
        <div className="h-0.5 w-3/4 rounded" style={{ background: 'oklch(0.88 0.005 75)' }} />
        <div className="absolute bottom-2 right-2 px-2 py-1 rounded text-[6px] text-white font-semibold" style={{ background: MAGENTA }}>
          Ordenar
        </div>
      </div>
    </div>
  );
}

const previews = [PreviewDashboard, PreviewTPV, PreviewPOS, PreviewQR, PreviewIA, PreviewWidget];

// ─── Main Component ─────────────────────────────────
export default function SuiteShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Title
  const titleOp = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.08], [25, 0]);

  // Each product activates sequentially
  // 6 products across scroll range 0.10 → 0.90
  const RANGE = 0.80 / 6; // ~0.133 per product

  // Active product index based on scroll
  const activeIndex = useTransform(scrollYProgress, (v) => {
    if (v < 0.10) return 0;
    const idx = Math.floor((v - 0.10) / RANGE);
    return Math.min(idx, 5);
  });

  // Preview crossfade for each product
  const previewOpacities = products.map((_, i) => {
    const start = 0.10 + i * RANGE;
    const end = start + RANGE;
    if (i === 5) {
      // Last product stays visible
      return useTransform(scrollYProgress, [start - 0.02, start + 0.03, 0.95, 1], [0, 1, 1, 1]);
    }
    return useTransform(scrollYProgress, [start - 0.02, start + 0.03, end - 0.04, end], [0, 1, 1, 0]);
  });

  // CTA
  const ctaOp = useTransform(scrollYProgress, [0.88, 0.95], [0, 1]);

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: '350vh' }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center">

            {/* Left: Title + Product list (5 cols) */}
            <div className="lg:col-span-5">
              <motion.div style={{ opacity: titleOp, y: titleY }}>
                <p className="text-avoqado-green text-xs font-semibold tracking-widest uppercase mb-3">Ecosistema</p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mb-3 leading-tight">
                  Seis productos.<br />
                  <span className="text-avoqado-green">Un ecosistema.</span>
                </h2>
                <p className="text-gray-500 text-sm mb-6 max-w-sm">
                  Todo conectado en tiempo real. Cada producto se integra con los demas.
                </p>
              </motion.div>

              {/* Product list */}
              <div className="space-y-1">
                {products.map((product, i) => (
                  <ProductCube
                    key={product.id}
                    product={product}
                    isActive={true} // We'll use scroll-driven active state
                    progress={scrollYProgress}
                    index={i}
                  />
                ))}
              </div>

              {/* CTA */}
              <motion.div className="mt-6" style={{ opacity: ctaOp }}>
                <a href="/productos" className="inline-flex items-center gap-2 text-sm font-medium text-avoqado-green hover:underline">
                  Ver todos los productos
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </motion.div>
            </div>

            {/* Right: Preview mockup (7 cols) */}
            <div className="lg:col-span-7 flex items-center justify-center">
              <div className="relative w-full max-w-[400px]" style={{ minHeight: '280px' }}>
                {products.map((product, i) => {
                  const Preview = previews[i];
                  return (
                    <motion.div
                      key={product.id}
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ opacity: previewOpacities[i] }}
                    >
                      <div className="w-full">
                        {/* Label */}
                        <div className="flex justify-center mb-3">
                          <span className="text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border"
                            style={{ color: product.color, borderColor: `${product.color}40`, background: 'oklch(0.12 0.005 155)' }}>
                            {product.name}
                          </span>
                        </div>
                        <Preview />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
