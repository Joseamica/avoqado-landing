import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for the TPV product — sized to fill the mockup column.
 * Mimics a real PAX-style handheld terminal with screen + chin.
 *
 * States:
 *   0-25%: Order list with items being added
 *  25-50%: Payment method selection + amount
 *  50-75%: NFC contactless tap
 *  75-100%: Approved + ticket summary
 */
export default function TpvLivingPreview({ scrollYProgress }: Props) {
  // State crossfades — state 1 (menu) gets more scroll space
  const s1 = useTransform(scrollYProgress, [0, 0.06, 0.35, 0.40], [0, 1, 1, 0]);
  const s2 = useTransform(scrollYProgress, [0.35, 0.40, 0.55, 0.60], [0, 1, 1, 0]);
  const s3 = useTransform(scrollYProgress, [0.55, 0.60, 0.75, 0.80], [0, 1, 1, 0]);
  const s4 = useTransform(scrollYProgress, [0.75, 0.80, 0.95, 1], [0, 1, 1, 1]);

  // Labels
  const l1Y = useTransform(scrollYProgress, [0, 0.06], [10, 0]);
  const l2Y = useTransform(scrollYProgress, [0.35, 0.40], [10, 0]);
  const l3Y = useTransform(scrollYProgress, [0.55, 0.60], [10, 0]);
  const l4Y = useTransform(scrollYProgress, [0.75, 0.80], [10, 0]);

  // State 1: Items stagger in (more spread out)
  const item1 = useTransform(scrollYProgress, [0.04, 0.12], [0, 1]);
  const item2 = useTransform(scrollYProgress, [0.10, 0.18], [0, 1]);
  const item3 = useTransform(scrollYProgress, [0.16, 0.24], [0, 1]);
  const totalOpacity = useTransform(scrollYProgress, [0.22, 0.30], [0, 1]);

  // State 3: Amount counter
  const amountValue = useTransform(scrollYProgress, [0.58, 0.68], [0, 547]);
  const amountDisplay = useTransform(amountValue, (v) => `$${Math.round(v).toLocaleString('en-US')}.00`);

  // State 4: Check scale
  const checkScale = useTransform(scrollYProgress, [0.78, 0.85], [0, 1]);

  const GREEN = '#69E185';
  const ACCENT = GREEN;
  const LABEL_BG = 'oklch(0.12 0.005 155)';
  const N600 = 'oklch(0.40 0.005 155)';
  const N700 = 'oklch(0.30 0.005 155)';
  const N800 = 'oklch(0.22 0.005 155)';
  const N900 = 'oklch(0.16 0.005 155)';
  const BLUE = 'oklch(0.72 0.14 240)';

  return (
    <div className="flex justify-center w-full">
      {/* Terminal body — PAX-style: white/gray body, black screen, camera notch, thick chin */}
      <div className="relative w-full max-w-[300px] md:max-w-[320px]">

        {/* Labels — centered on top edge of device frame */}
        <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <motion.span style={{ opacity: s1, y: l1Y, borderColor: GREEN, color: GREEN, background: LABEL_BG }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Menu
          </motion.span>
          <motion.span style={{ opacity: s2, y: l2Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Orden
          </motion.span>
          <motion.span style={{ opacity: s3, y: l3Y, borderColor: BLUE, color: BLUE, background: LABEL_BG, position: 'absolute' }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Metodo de pago
          </motion.span>
          <motion.span style={{ opacity: s4, y: l4Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Aprobado
          </motion.span>
        </div>

        {/* Outer shell — gray body with reader module on top */}
        <div className="relative">
          {/* ─── 3D Reader block ─── */}
          {/* Top face of reader (the flat top you see from above) */}
          <div className="mx-2 h-3 rounded-t-lg"
            style={{ background: 'oklch(0.22 0.005 155)', borderTop: '1px solid oklch(0.30 0.005 155)', borderLeft: '1px solid oklch(0.30 0.005 155)', borderRight: '1px solid oklch(0.30 0.005 155)' }}>
            {/* Slot */}
            <div className="absolute top-[3px] left-1/2 -translate-x-1/2 w-[40%] h-[3px] rounded-sm"
              style={{ background: 'oklch(0.10 0.005 155)' }} />
            {/* LED */}
            <div className="absolute top-[4px] right-[18%] w-1.5 h-1.5 rounded-full"
              style={{ background: 'oklch(0.50 0.15 155)' }} />
          </div>
          {/* Diagonal front face — trapezoid that connects reader top to phone body */}
          {/* Wider at top (reader width), narrower at bottom (phone body width) = depth illusion */}
          <div className="h-4"
            style={{
              background: 'oklch(0.16 0.005 155)',
              clipPath: 'polygon(0.5rem 0%, calc(100% - 0.5rem) 0%, calc(100% - 0.25rem) 100%, 0.25rem 100%)',
              borderLeft: 'none',
            }} />

          {/* Main body */}
          <div className="rounded-b-[1.2rem] overflow-hidden shadow-2xl shadow-black/60"
            style={{ background: 'oklch(0.18 0.005 155)', border: '1px solid oklch(0.28 0.005 155)', borderTop: 'none' }}>

          {/* ─── Screen (black, inset with thin bezel) ─── */}
          <div className="mx-2.5 mt-2.5 rounded-xl overflow-hidden relative"
            style={{ background: '#0A0A0A', border: '2px solid oklch(0.35 0.005 155)', minHeight: '380px' }}>

            {/* Top spacing */}
            <div className="h-2" />

            {/* Content area — states crossfade */}
            <div className="relative px-4 pb-4" style={{ minHeight: '330px' }}>

              {/* STATE 1: Product catalog / menu */}
              <motion.div style={{ opacity: s1 }} className="absolute inset-x-4 top-0 bottom-4 flex flex-col">
                {/* Category tabs */}
                <div className="flex gap-1.5 mb-3 mt-1">
                  <div className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-black" style={{ background: GREEN }}>Tacos</div>
                  <div className="px-3 py-1.5 rounded-full text-[10px]" style={{ background: N900, color: N600 }}>Platos</div>
                  <div className="px-3 py-1.5 rounded-full text-[10px]" style={{ background: N900, color: N600 }}>Bebidas</div>
                  <div className="px-3 py-1.5 rounded-full text-[10px]" style={{ background: N900, color: N600 }}>Postres</div>
                </div>

                {/* Product grid */}
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <motion.div style={{ opacity: item1, background: N900, borderColor: GREEN }} className="rounded-xl p-3 flex flex-col border">
                    <div className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-6 h-6 rounded" style={{ background: 'oklch(0.55 0.14 75)' }} />
                    </div>
                    <div className="text-[11px] text-white font-medium">Tacos Pastor</div>
                    <div className="text-[10px]" style={{ color: GREEN }}>$95</div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-[9px]" style={{ color: N700 }}>x2 agregados</span>
                      <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: GREEN }}>
                        <span className="text-[8px] font-bold text-black">2</span>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div style={{ opacity: item2, background: N900, borderColor: N800 }} className="rounded-xl p-3 flex flex-col border">
                    <div className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-6 h-6 rounded" style={{ background: 'oklch(0.55 0.12 25)' }} />
                    </div>
                    <div className="text-[11px] text-white font-medium">Enchiladas</div>
                    <div className="text-[10px]" style={{ color: N600 }}>$165</div>
                  </motion.div>

                  <motion.div style={{ opacity: item3, background: N900, borderColor: N800 }} className="rounded-xl p-3 flex flex-col border">
                    <div className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-6 h-6 rounded" style={{ background: 'oklch(0.55 0.14 155)' }} />
                    </div>
                    <div className="text-[11px] text-white font-medium">Guacamole</div>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] line-through" style={{ color: N700 }}>$170</span>
                      <span className="text-[10px]" style={{ color: 'oklch(0.78 0.14 75)' }}>$85</span>
                    </div>
                    <span className="text-[8px] mt-0.5 px-1.5 py-0.5 rounded-full self-start" style={{ background: 'oklch(0.20 0.02 75)', color: 'oklch(0.78 0.14 75)' }}>2x1</span>
                  </motion.div>

                  <motion.div style={{ opacity: item3, background: N900, borderColor: N800 }} className="rounded-xl p-3 flex flex-col border">
                    <div className="w-full aspect-square rounded-lg mb-2 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-6 h-6 rounded-full" style={{ background: 'oklch(0.60 0.10 200)' }} />
                    </div>
                    <div className="text-[11px] text-white font-medium">Horchata</div>
                    <div className="text-[10px]" style={{ color: N600 }}>$45</div>
                  </motion.div>
                </div>

                {/* Cart bar */}
                <motion.div style={{ opacity: totalOpacity, background: GREEN }} className="mt-2 w-full h-10 rounded-xl flex items-center justify-between px-4">
                  <span className="text-[11px] font-semibold text-black">3 items</span>
                  <span className="text-sm font-semibold text-black">Ver orden →</span>
                </motion.div>
              </motion.div>

              {/* STATE 2: Order summary */}
              <motion.div style={{ opacity: s2 }} className="absolute inset-x-4 top-0 bottom-4 flex flex-col">
                {/* Order header */}
                <div className="flex items-center justify-between mb-3 mt-1">
                  <span className="text-[11px] text-white font-medium">Orden #847</span>
                  <span className="text-[10px]" style={{ color: N600 }}>14:32</span>
                </div>

                {/* Items */}
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center justify-between p-2.5 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: N900, color: GREEN }}>2</div>
                      <div>
                        <div className="text-xs text-white">Tacos al Pastor</div>
                        <div className="text-[10px]" style={{ color: N700 }}>c/pina, cilantro</div>
                      </div>
                    </div>
                    <span className="text-xs text-white">$190</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: N900, color: GREEN }}>1</div>
                      <div>
                        <div className="text-xs text-white">Enchiladas Suizas</div>
                        <div className="text-[10px]" style={{ color: N700 }}>salsa verde, crema</div>
                      </div>
                    </div>
                    <span className="text-xs text-white">$165</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: N900, color: GREEN }}>2</div>
                      <div>
                        <div className="text-xs text-white">Agua Horchata</div>
                        <div className="text-[10px]" style={{ color: N700 }}>500ml</div>
                      </div>
                    </div>
                    <span className="text-xs text-white">$90</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-lg">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: N900, color: BLUE }}>1</div>
                      <div>
                        <div className="text-xs text-white">Guacamole</div>
                        <div className="text-[10px]" style={{ color: 'oklch(0.78 0.14 75)' }}>Promo 2x1</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] line-through mr-1" style={{ color: N700 }}>$170</span>
                      <span className="text-xs text-white">$85</span>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="mt-2 pt-2 border-t" style={{ borderColor: N800 }}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px]" style={{ color: N700 }}>5 items + propina</span>
                    <span className="text-lg font-light text-white">$547.00</span>
                  </div>
                  <div className="w-full h-10 rounded-xl flex items-center justify-center" style={{ background: GREEN }}>
                    <span className="text-sm font-semibold text-black">Cobrar $547.00</span>
                  </div>
                </div>
              </motion.div>

              {/* STATE 3: Payment method selection */}
              <motion.div style={{ opacity: s3 }} className="absolute inset-x-4 top-0 bottom-4 flex flex-col items-center justify-center">
                <motion.div className="text-3xl font-light text-white mb-6">{amountDisplay}</motion.div>
                <div className="text-[10px] uppercase tracking-widest mb-4" style={{ color: N600 }}>Selecciona metodo</div>

                <div className="grid grid-cols-3 gap-2 w-full max-w-[280px]">
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2" style={{ background: N900, borderColor: GREEN }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" strokeLinecap="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" x2="23" y1="10" y2="10"/></svg>
                    <span className="text-[9px] text-white">Tarjeta</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border" style={{ background: N900, borderColor: N800 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={N600} strokeWidth="2" strokeLinecap="round"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                    <span className="text-[9px]" style={{ color: N600 }}>QR</span>
                  </div>
                  <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl border" style={{ background: N900, borderColor: N800 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={N600} strokeWidth="2" strokeLinecap="round"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                    <span className="text-[9px]" style={{ color: N600 }}>Split</span>
                  </div>
                </div>

                <div className="mt-4 w-full max-w-[280px] h-10 rounded-xl flex items-center justify-center" style={{ background: GREEN }}>
                  <span className="text-sm font-semibold text-black">Continuar con tarjeta</span>
                </div>
              </motion.div>

              {/* STATE 4: Approved */}
              <motion.div style={{ opacity: s4 }} className="absolute inset-x-4 top-0 bottom-4 flex flex-col items-center justify-center">
                <motion.div style={{ scale: checkScale }} className="mb-5">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.18 0.04 155)' }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </motion.div>

                <span className="text-lg text-white font-medium mb-1">Pago aprobado</span>
                <span className="text-2xl font-light text-white mb-3">$547.00</span>

                <div className="space-y-1 text-center">
                  <div className="text-[11px]" style={{ color: N600 }}>Visa **** 4821</div>
                  <div className="text-[11px]" style={{ color: N600 }}>Orden #847 - 5 items</div>
                  <div className="text-[11px]" style={{ color: GREEN }}>Ticket impreso</div>
                </div>

                <div className="mt-4 flex gap-2 w-full max-w-[260px]">
                  <div className="flex-1 h-9 rounded-lg flex items-center justify-center border" style={{ borderColor: N800 }}>
                    <span className="text-[11px]" style={{ color: N600 }}>Enviar recibo</span>
                  </div>
                  <div className="flex-1 h-9 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                    <span className="text-[11px] font-semibold text-black">Nueva orden</span>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>

          {/* ─── Chin — minimal bottom bezel ─── */}
          <div className="h-4" />

          </div>
        </div>
      </div>
    </div>
  );
}
