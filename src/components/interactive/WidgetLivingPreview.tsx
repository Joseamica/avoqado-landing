import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for the Avoqado Widget product.
 * Browser window frame showing a third-party restaurant website
 * with an embedded Avoqado ordering widget.
 *
 * States:
 *   0-25%: Floating widget button on restaurant site
 *  25-50%: Menu/catalog panel opened
 *  50-75%: Integrated checkout
 *  75-100%: Order confirmed
 */
export default function WidgetLivingPreview({ scrollYProgress }: Props) {
  // ─── State visibility (crossfade between states) ───
  const s1 = useTransform(scrollYProgress, [0, 0.08, 0.22, 0.28], [0, 1, 1, 0]);
  const s2 = useTransform(scrollYProgress, [0.22, 0.28, 0.47, 0.53], [0, 1, 1, 0]);
  const s3 = useTransform(scrollYProgress, [0.47, 0.53, 0.72, 0.78], [0, 1, 1, 0]);
  const s4 = useTransform(scrollYProgress, [0.72, 0.78, 0.95, 1], [0, 1, 1, 1]);

  // ─── Label positions ───
  const l1Y = useTransform(scrollYProgress, [0, 0.08], [10, 0]);
  const l2Y = useTransform(scrollYProgress, [0.22, 0.28], [10, 0]);
  const l3Y = useTransform(scrollYProgress, [0.47, 0.53], [10, 0]);
  const l4Y = useTransform(scrollYProgress, [0.72, 0.78], [10, 0]);

  // ─── State 2: menu items stagger ───
  const item1 = useTransform(scrollYProgress, [0.30, 0.36], [0, 1]);
  const item2 = useTransform(scrollYProgress, [0.33, 0.39], [0, 1]);
  const item3 = useTransform(scrollYProgress, [0.36, 0.42], [0, 1]);
  const item4 = useTransform(scrollYProgress, [0.39, 0.45], [0, 1]);

  // ─── State 4: checkmark scale ───
  const checkScale = useTransform(scrollYProgress, [0.80, 0.87], [0, 1]);

  // ─── Colors ───
  const ACCENT = 'oklch(0.72 0.15 340)';
  const ACCENT_DIM = 'oklch(0.45 0.10 340)';
  const GREEN = '#69E185';
  const AMBER = 'oklch(0.78 0.14 75)';
  const LABEL_BG = 'oklch(0.12 0.005 155)';
  const N600 = 'oklch(0.40 0.005 155)';
  const N700 = 'oklch(0.30 0.005 155)';
  const N800 = 'oklch(0.22 0.005 155)';
  const N900 = 'oklch(0.16 0.005 155)';
  const PAGE_BG = 'oklch(0.97 0.005 75)';
  const PAGE_MUTED = 'oklch(0.92 0.005 75)';
  const PAGE_TEXT = 'oklch(0.25 0.005 155)';
  const PAGE_TEXT_DIM = 'oklch(0.55 0.005 155)';
  const CHROME_BG = 'oklch(0.16 0.005 155)';
  const CHROME_URL = 'oklch(0.12 0.005 155)';

  return (
    <div className="relative w-full">
      {/* Labels — centered on top edge of browser frame */}
      <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <motion.span
          style={{ opacity: s1, y: l1Y, borderColor: ACCENT, color: ACCENT, background: LABEL_BG }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border"
        >
          Widget flotante
        </motion.span>
        <motion.span
          style={{ opacity: s2, y: l2Y, borderColor: ACCENT, color: ACCENT, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border"
        >
          Catalogo integrado
        </motion.span>
        <motion.span
          style={{ opacity: s3, y: l3Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border"
        >
          Checkout en tu sitio
        </motion.span>
        <motion.span
          style={{ opacity: s4, y: l4Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border"
        >
          Pedido confirmado
        </motion.span>
      </div>

      {/* Browser frame */}
      <div
        className="relative rounded-2xl overflow-hidden border shadow-2xl shadow-black/60 aspect-[4/3] w-full"
        style={{ background: CHROME_BG, borderColor: 'oklch(0.28 0.005 155)' }}
      >
        {/* Chrome — top bar with dots and URL */}
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-2.5" style={{ background: CHROME_BG }}>
          {/* Traffic lights */}
          <div className="flex gap-1.5 shrink-0">
            <div className="w-[6px] h-[6px] sm:w-2 sm:h-2 rounded-full" style={{ background: 'oklch(0.65 0.20 25)' }} />
            <div className="w-[6px] h-[6px] sm:w-2 sm:h-2 rounded-full" style={{ background: AMBER }} />
            <div className="w-[6px] h-[6px] sm:w-2 sm:h-2 rounded-full" style={{ background: 'oklch(0.70 0.16 145)' }} />
          </div>
          {/* URL bar */}
          <div
            className="flex-1 flex items-center justify-center px-3 py-1 rounded-md"
            style={{ background: CHROME_URL }}
          >
            <span className="text-[8px] sm:text-[10px] font-mono" style={{ color: N600 }}>
              misushi.com.mx
            </span>
          </div>
          {/* Spacer to balance traffic lights */}
          <div className="w-8 sm:w-10 shrink-0" />
        </div>

        {/* Page content area */}
        <div className="relative" style={{ background: PAGE_BG, height: 'calc(100% - 36px)' }}>
          <div className="absolute inset-0">

            {/* STATE 1: Restaurant website with floating button */}
            <motion.div style={{ opacity: s1 }} className="absolute inset-0 flex flex-col">
              {/* Restaurant nav */}
              <div className="flex items-center justify-between px-3 sm:px-5 py-2 sm:py-3" style={{ borderBottom: `1px solid oklch(0.90 0.005 75)` }}>
                <span className="text-[10px] sm:text-xs font-semibold tracking-wide" style={{ color: PAGE_TEXT }}>Mi Sushi</span>
                <div className="flex gap-2 sm:gap-3">
                  <div className="h-1.5 w-8 sm:w-10 rounded-full" style={{ background: PAGE_MUTED }} />
                  <div className="h-1.5 w-8 sm:w-10 rounded-full" style={{ background: PAGE_MUTED }} />
                  <div className="h-1.5 w-6 sm:w-8 rounded-full" style={{ background: PAGE_MUTED }} />
                </div>
              </div>

              {/* Hero image placeholder */}
              <div className="mx-3 sm:mx-5 mt-2 sm:mt-3 rounded-lg flex-1 max-h-[40%] flex items-center justify-center" style={{ background: PAGE_MUTED }}>
                <div className="text-center">
                  <div className="flex justify-center gap-1 mb-2">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: 'oklch(0.82 0.03 75)', opacity: 0.5 + i * 0.2 }} />
                    ))}
                  </div>
                  <span className="text-[8px] sm:text-[10px]" style={{ color: PAGE_TEXT_DIM }}>Bienvenido a Mi Sushi</span>
                </div>
              </div>

              {/* Fake content lines */}
              <div className="px-3 sm:px-5 mt-3 sm:mt-4 space-y-2">
                <div className="h-2 w-3/4 rounded-full" style={{ background: PAGE_MUTED }} />
                <div className="h-2 w-1/2 rounded-full" style={{ background: PAGE_MUTED }} />
                <div className="flex gap-2 mt-3">
                  <div className="h-8 sm:h-10 w-16 sm:w-20 rounded-md" style={{ background: PAGE_MUTED }} />
                  <div className="h-8 sm:h-10 w-16 sm:w-20 rounded-md" style={{ background: PAGE_MUTED }} />
                  <div className="h-8 sm:h-10 w-16 sm:w-20 rounded-md" style={{ background: PAGE_MUTED }} />
                </div>
              </div>

              {/* Floating widget button — bottom right */}
              <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
                <div
                  className="w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: ACCENT, boxShadow: `0 4px 20px oklch(0.72 0.15 340 / 0.4)` }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="mt-1 text-center">
                  <span className="text-[7px] sm:text-[8px] font-medium" style={{ color: PAGE_TEXT_DIM }}>Ordenar</span>
                </div>
              </div>
            </motion.div>

            {/* STATE 2: Menu / catalog panel */}
            <motion.div style={{ opacity: s2 }} className="absolute inset-0 flex">
              {/* Dimmed website behind */}
              <div className="w-[40%] sm:w-[45%] shrink-0 relative">
                <div className="absolute inset-0" style={{ background: PAGE_BG, opacity: 0.4 }}>
                  <div className="px-2 sm:px-3 py-2">
                    <div className="h-1.5 w-12 rounded-full mb-2" style={{ background: PAGE_MUTED }} />
                    <div className="h-10 sm:h-16 rounded-md mb-2" style={{ background: PAGE_MUTED }} />
                    <div className="h-1 w-16 rounded-full mb-1" style={{ background: PAGE_MUTED }} />
                    <div className="h-1 w-10 rounded-full" style={{ background: PAGE_MUTED }} />
                  </div>
                </div>
                <div className="absolute inset-0" style={{ background: 'oklch(0.50 0 0 / 0.3)', backdropFilter: 'blur(2px)' }} />
              </div>

              {/* Widget panel */}
              <div className="flex-1 flex flex-col" style={{ background: N900 }}>
                {/* Widget header */}
                <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-3" style={{ borderBottom: `1px solid ${N800}` }}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ background: GREEN }} />
                    <span className="text-[10px] sm:text-xs font-medium text-white">Ordenar</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.50 0.005 155)" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>

                {/* Category tabs */}
                <div className="flex gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2">
                  {['Rolls', 'Nigiri', 'Bebidas'].map((cat, i) => (
                    <div key={cat} className="px-2 sm:px-3 py-1 text-center" style={{ borderBottom: i === 0 ? `2px solid ${ACCENT}` : '2px solid transparent' }}>
                      <span className="text-[8px] sm:text-[10px]" style={{ color: i === 0 ? ACCENT : N600 }}>{cat}</span>
                    </div>
                  ))}
                </div>

                {/* Product cards */}
                <div className="flex-1 px-2.5 sm:px-4 py-1.5 sm:py-2 space-y-1.5 sm:space-y-2 overflow-hidden">
                  <motion.div style={{ opacity: item1 }}>
                    <MenuCard name="Dragon Roll" price="$185" color={ACCENT} />
                  </motion.div>
                  <motion.div style={{ opacity: item2 }}>
                    <MenuCard name="Philadelphia" price="$165" color={ACCENT} />
                  </motion.div>
                  <motion.div style={{ opacity: item3 }}>
                    <MenuCard name="Spicy Tuna" price="$175" color={ACCENT} />
                  </motion.div>
                  <motion.div style={{ opacity: item4 }}>
                    <MenuCard name="Edamame" price="$95" color={ACCENT} />
                  </motion.div>
                </div>

                {/* Cart summary */}
                <div className="px-2.5 sm:px-4 py-2 sm:py-3" style={{ borderTop: `1px solid ${N800}` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[9px] sm:text-[10px]" style={{ color: N600 }}>2 productos</span>
                    <span className="text-[10px] sm:text-xs text-white font-medium">$375</span>
                  </div>
                  <div className="w-full h-7 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
                    <span className="text-[9px] sm:text-[10px] font-semibold text-white">Ver carrito</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* STATE 3: Checkout */}
            <motion.div style={{ opacity: s3 }} className="absolute inset-0 flex">
              {/* Dimmed website behind */}
              <div className="w-[40%] sm:w-[45%] shrink-0 relative">
                <div className="absolute inset-0" style={{ background: PAGE_BG, opacity: 0.4 }}>
                  <div className="px-2 sm:px-3 py-2">
                    <div className="h-1.5 w-12 rounded-full mb-2" style={{ background: PAGE_MUTED }} />
                    <div className="h-10 sm:h-16 rounded-md mb-2" style={{ background: PAGE_MUTED }} />
                    <div className="h-1 w-16 rounded-full mb-1" style={{ background: PAGE_MUTED }} />
                  </div>
                </div>
                <div className="absolute inset-0" style={{ background: 'oklch(0.50 0 0 / 0.3)', backdropFilter: 'blur(2px)' }} />
              </div>

              {/* Checkout panel */}
              <div className="flex-1 flex flex-col" style={{ background: N900 }}>
                {/* Header */}
                <div className="flex items-center justify-between px-2.5 sm:px-4 py-2 sm:py-3" style={{ borderBottom: `1px solid ${N800}` }}>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full" style={{ background: GREEN }} />
                    <span className="text-[10px] sm:text-xs font-medium text-white">Checkout</span>
                  </div>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="oklch(0.50 0.005 155)" strokeWidth="2" strokeLinecap="round">
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </div>

                {/* Cart items */}
                <div className="px-2.5 sm:px-4 py-2 sm:py-3 space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] text-white">2x Dragon Roll</span>
                    <span className="text-[9px] sm:text-[10px] text-white">$370</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] sm:text-[10px] text-white">1x Edamame</span>
                    <span className="text-[9px] sm:text-[10px] text-white">$95</span>
                  </div>
                  <div className="pt-1.5 border-t flex justify-between items-center" style={{ borderColor: N800 }}>
                    <span className="text-[10px] sm:text-xs text-white font-medium">Subtotal</span>
                    <span className="text-[10px] sm:text-xs text-white font-medium">$465</span>
                  </div>
                </div>

                {/* Delivery/pickup toggle */}
                <div className="px-2.5 sm:px-4 py-1.5 sm:py-2">
                  <div className="flex rounded-lg overflow-hidden" style={{ background: N800 }}>
                    <div className="flex-1 py-1.5 text-center rounded-lg" style={{ background: ACCENT }}>
                      <span className="text-[8px] sm:text-[9px] font-medium text-white">Delivery</span>
                    </div>
                    <div className="flex-1 py-1.5 text-center">
                      <span className="text-[8px] sm:text-[9px]" style={{ color: N600 }}>Recoger</span>
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="px-2.5 sm:px-4 py-1.5 sm:py-2">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-wider mb-1.5" style={{ color: N600 }}>Metodo de pago</div>
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: N800 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={ACCENT} strokeWidth="1.5" strokeLinecap="round">
                      <rect x="1" y="4" width="22" height="16" rx="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    <span className="text-[9px] sm:text-[10px] text-white">Terminada en 4242</span>
                  </div>
                </div>

                {/* Address */}
                <div className="px-2.5 sm:px-4 py-1.5 sm:py-2">
                  <div className="text-[8px] sm:text-[9px] uppercase tracking-wider mb-1.5" style={{ color: N600 }}>Direccion</div>
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg" style={{ background: N800 }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: GREEN }} />
                    <div className="h-1.5 w-24 sm:w-32 rounded-full" style={{ background: N700 }} />
                  </div>
                </div>

                {/* Pay button */}
                <div className="mt-auto px-2.5 sm:px-4 py-2 sm:py-3">
                  <div className="w-full h-8 sm:h-9 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                    <span className="text-[10px] sm:text-xs font-semibold text-black">Pagar $465</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* STATE 4: Order confirmed */}
            <motion.div style={{ opacity: s4 }} className="absolute inset-0 flex">
              {/* Dimmed website behind */}
              <div className="w-[40%] sm:w-[45%] shrink-0 relative">
                <div className="absolute inset-0" style={{ background: PAGE_BG, opacity: 0.4 }}>
                  <div className="px-2 sm:px-3 py-2">
                    <div className="h-1.5 w-12 rounded-full mb-2" style={{ background: PAGE_MUTED }} />
                    <div className="h-10 sm:h-16 rounded-md mb-2" style={{ background: PAGE_MUTED }} />
                  </div>
                </div>
                <div className="absolute inset-0" style={{ background: 'oklch(0.50 0 0 / 0.3)', backdropFilter: 'blur(2px)' }} />
              </div>

              {/* Confirmation panel */}
              <div className="flex-1 flex flex-col items-center justify-center px-3 sm:px-6" style={{ background: N900 }}>
                {/* Checkmark */}
                <motion.div style={{ scale: checkScale }} className="mb-3 sm:mb-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.18 0.04 155)' }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </motion.div>

                <span className="text-xs sm:text-sm text-white font-medium mb-0.5">Pedido confirmado</span>
                <span className="text-[10px] sm:text-xs font-mono mb-3" style={{ color: ACCENT }}>#AVO-3847</span>

                {/* Order details card */}
                <div className="w-full max-w-[180px] sm:max-w-[200px] rounded-lg p-2.5 sm:p-3 mb-3" style={{ background: N800 }}>
                  <div className="flex items-center gap-1.5 mb-2">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={AMBER} strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span className="text-[9px] sm:text-[10px]" style={{ color: AMBER }}>30-45 min</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: N600 }}>Tu pedido esta siendo preparado</span>
                </div>

                {/* Mini map placeholder */}
                <div className="w-full max-w-[180px] sm:max-w-[200px] h-12 sm:h-16 rounded-lg relative overflow-hidden" style={{ background: N800 }}>
                  {/* Map grid lines */}
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 left-0 right-0 h-px" style={{ background: N700 }} />
                    <div className="absolute top-1/2 left-0 right-0 h-px" style={{ background: N700 }} />
                    <div className="absolute top-3/4 left-0 right-0 h-px" style={{ background: N700 }} />
                    <div className="absolute left-1/4 top-0 bottom-0 w-px" style={{ background: N700 }} />
                    <div className="absolute left-1/2 top-0 bottom-0 w-px" style={{ background: N700 }} />
                    <div className="absolute left-3/4 top-0 bottom-0 w-px" style={{ background: N700 }} />
                  </div>
                  {/* Location dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: ACCENT, boxShadow: `0 0 8px oklch(0.72 0.15 340 / 0.5)` }} />
                  </div>
                  {/* Route dot */}
                  <div className="absolute top-[30%] left-[30%]">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }} />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Sub-components ──────────────────────────────────────────

function MenuCard({ name, price, color }: {
  name: string;
  price: string;
  color: string;
}) {
  const N800 = 'oklch(0.22 0.005 155)';
  const N600 = 'oklch(0.40 0.005 155)';

  return (
    <div className="flex items-center gap-2 sm:gap-2.5 px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg" style={{ background: N800 }}>
      {/* Image placeholder */}
      <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md shrink-0" style={{ background: 'oklch(0.28 0.02 340)' }} />
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-[9px] sm:text-[10px] text-white truncate">{name}</div>
        <div className="text-[8px] sm:text-[9px]" style={{ color: N600 }}>{price}</div>
      </div>
      {/* Add button */}
      <div className="px-2 py-0.5 sm:py-1 rounded-md shrink-0" style={{ background: color }}>
        <span className="text-[7px] sm:text-[8px] font-semibold text-white">Agregar</span>
      </div>
    </div>
  );
}
