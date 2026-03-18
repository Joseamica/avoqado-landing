import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for Avoqado QR — from the customer's phone perspective.
 * Phone mockup showing scan → view bill → split/tip → paid flow.
 */
export default function QrLivingPreview({ scrollYProgress }: Props) {
  const s1 = useTransform(scrollYProgress, [0, 0.06, 0.30, 0.35], [0, 1, 1, 0]);
  const s2 = useTransform(scrollYProgress, [0.30, 0.35, 0.55, 0.60], [0, 1, 1, 0]);
  const s3 = useTransform(scrollYProgress, [0.55, 0.60, 0.78, 0.83], [0, 1, 1, 0]);
  const s4 = useTransform(scrollYProgress, [0.78, 0.83, 0.95, 1], [0, 1, 1, 1]);

  const l1Y = useTransform(scrollYProgress, [0, 0.06], [10, 0]);
  const l2Y = useTransform(scrollYProgress, [0.30, 0.35], [10, 0]);
  const l3Y = useTransform(scrollYProgress, [0.55, 0.60], [10, 0]);
  const l4Y = useTransform(scrollYProgress, [0.78, 0.83], [10, 0]);

  // State 2: items stagger
  const row1 = useTransform(scrollYProgress, [0.33, 0.38], [0, 1]);
  const row2 = useTransform(scrollYProgress, [0.36, 0.41], [0, 1]);
  const row3 = useTransform(scrollYProgress, [0.39, 0.44], [0, 1]);

  // State 4: check
  const checkScale = useTransform(scrollYProgress, [0.80, 0.87], [0, 1]);

  const GREEN = '#69E185';
  const AMBER = 'oklch(0.78 0.14 75)';
  const LABEL_BG = 'oklch(0.12 0.005 155)';
  const N600 = 'oklch(0.40 0.005 155)';
  const N700 = 'oklch(0.30 0.005 155)';
  const N800 = 'oklch(0.22 0.005 155)';
  const N900 = 'oklch(0.16 0.005 155)';

  return (
    <div className="flex justify-center w-full">
      {/* Phone frame */}
      <div className="relative w-full max-w-[280px] md:max-w-[300px]">
        {/* Labels — absolute centered on top edge of phone */}
        {/* Labels — centered on top edge of phone frame */}
        <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <motion.span style={{ opacity: s1, y: l1Y, borderColor: AMBER, color: AMBER, background: LABEL_BG }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Escanear
          </motion.span>
          <motion.span style={{ opacity: s2, y: l2Y, borderColor: AMBER, color: AMBER, background: LABEL_BG, position: 'absolute' }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Tu cuenta
          </motion.span>
          <motion.span style={{ opacity: s3, y: l3Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Dividir cuenta
          </motion.span>
          <motion.span style={{ opacity: s4, y: l4Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
            className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
            Pagado
          </motion.span>
        </div>

        <div className="rounded-[2rem] overflow-hidden border shadow-2xl shadow-black/60"
          style={{ background: '#0A0A0A', borderColor: 'oklch(0.28 0.005 155)' }}>

          {/* Notch */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-20 h-5 rounded-full" style={{ background: 'oklch(0.15 0.005 155)' }} />
          </div>

          {/* Screen content */}
          <div className="px-4 pb-5 relative" style={{ minHeight: '420px' }}>

            {/* STATE 1: QR Scan prompt */}
            <motion.div style={{ opacity: s1 }} className="absolute inset-x-4 top-0 bottom-5 flex flex-col items-center justify-center">
              {/* Label moved to phone edge */}

              {/* QR code visual */}
              <div className="w-40 h-40 rounded-2xl p-4 mb-6" style={{ border: `2px solid ${AMBER}` }}>
                <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-1">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const isCorner = (i < 2 || (i >= 3 && i < 5)) && (Math.floor(i/5) < 2) ||
                                     (i % 5 >= 3 && Math.floor(i/5) < 2) ||
                                     (i % 5 < 2 && Math.floor(i/5) >= 3);
                    return (
                      <div key={i} className="rounded-sm" style={{
                        background: isCorner ? `oklch(0.50 0.08 75)` : i % 3 === 0 ? `oklch(0.30 0.04 75)` : `oklch(0.40 0.06 75)`,
                        opacity: isCorner ? 1 : 0.5 + (i % 4) * 0.15,
                      }} />
                    );
                  })}
                </div>
              </div>

              <span className="text-sm text-white mb-1">Escanea el codigo QR</span>
              <span className="text-[11px]" style={{ color: N600 }}>Sin descargar app</span>
            </motion.div>

            {/* STATE 2: View bill */}
            <motion.div style={{ opacity: s2 }} className="absolute inset-x-4 top-0 bottom-5 flex flex-col">
              {/* Label moved to phone edge */}

              {/* Restaurant/business name */}
              <div className="text-center mb-4 mt-1">
                <div className="text-xs text-white font-medium">La Terraza Rooftop</div>
                <div className="text-[10px]" style={{ color: N700 }}>Mesa 7</div>
              </div>

              {/* Items */}
              <div className="flex-1 space-y-2">
                <motion.div style={{ opacity: row1 }} className="flex justify-between items-center p-2.5 rounded-lg" >
                  <div className="flex items-center gap-2.5">
                    <div>
                      <div className="text-[11px] text-white">2x Tacos al Pastor</div>
                      <div className="text-[9px]" style={{ color: N700 }}>c/pina, cilantro</div>
                    </div>
                  </div>
                  <span className="text-[11px] text-white">$190</span>
                </motion.div>

                <motion.div style={{ opacity: row2 }} className="flex justify-between items-center p-2.5 rounded-lg">
                  <div>
                    <div className="text-[11px] text-white">1x Enchiladas Suizas</div>
                    <div className="text-[9px]" style={{ color: N700 }}>salsa verde</div>
                  </div>
                  <span className="text-[11px] text-white">$165</span>
                </motion.div>

                <motion.div style={{ opacity: row3 }} className="flex justify-between items-center p-2.5 rounded-lg">
                  <div>
                    <div className="text-[11px] text-white">2x Agua Horchata</div>
                  </div>
                  <span className="text-[11px] text-white">$90</span>
                </motion.div>

                <motion.div style={{ opacity: row3 }} className="flex justify-between items-center p-2.5 rounded-lg">
                  <div>
                    <div className="text-[11px] text-white">1x Guacamole</div>
                    <div className="text-[9px]" style={{ color: AMBER }}>Promo 2x1</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] line-through mr-1" style={{ color: N700 }}>$170</span>
                    <span className="text-[11px] text-white">$85</span>
                  </div>
                </motion.div>
              </div>

              {/* Total */}
              <div className="mt-3 pt-3 border-t" style={{ borderColor: N800 }}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-white">Total</span>
                  <span className="text-xl font-light text-white">$530.00</span>
                </div>
                <div className="w-full h-11 rounded-xl flex items-center justify-center" style={{ background: AMBER }}>
                  <span className="text-sm font-semibold text-black">Pagar mi parte</span>
                </div>
              </div>
            </motion.div>

            {/* STATE 3: Split + Tip */}
            <motion.div style={{ opacity: s3 }} className="absolute inset-x-4 top-0 bottom-5 flex flex-col">
              {/* Label moved to phone edge */}

              {/* Split selector */}
              <div className="text-center mb-4 mt-1">
                <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: N600 }}>Dividir entre</div>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium"
                      style={{
                        background: n === 3 ? GREEN : N900,
                        color: n === 3 ? '#000' : N600,
                        border: n === 3 ? 'none' : `1px solid ${N800}`,
                      }}>
                      {n}
                    </div>
                  ))}
                </div>
              </div>

              {/* Your part */}
              <div className="rounded-xl p-4 mb-4" style={{ background: N900 }}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px]" style={{ color: N700 }}>Tu parte</span>
                  <span className="text-lg font-light text-white">$176.67</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: N800 }}>
                  <div className="h-full rounded-full w-1/3" style={{ background: GREEN }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px]" style={{ color: N700 }}>1 de 3</span>
                  <span className="text-[9px]" style={{ color: GREEN }}>33%</span>
                </div>
              </div>

              {/* Tip selector */}
              <div className="mb-4">
                <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: N600 }}>Propina</div>
                <div className="flex gap-2">
                  {['10%', '15%', '20%', 'Otro'].map((t, i) => (
                    <div key={t} className="flex-1 py-2 rounded-lg text-center text-[10px]"
                      style={{
                        background: i === 1 ? 'oklch(0.18 0.02 155)' : N900,
                        color: i === 1 ? GREEN : N600,
                        border: i === 1 ? `1px solid ${GREEN}` : `1px solid ${N800}`,
                      }}>
                      {t}
                    </div>
                  ))}
                </div>
                <div className="text-right mt-1">
                  <span className="text-[10px]" style={{ color: GREEN }}>+$26.50</span>
                </div>
              </div>

              {/* Pay button */}
              <div className="mt-auto">
                <div className="w-full h-11 rounded-xl flex items-center justify-center" style={{ background: AMBER }}>
                  <span className="text-sm font-semibold text-black">Pagar $203.17</span>
                </div>
              </div>
            </motion.div>

            {/* STATE 4: Payment confirmed */}
            <motion.div style={{ opacity: s4 }} className="absolute inset-x-4 top-0 bottom-5 flex flex-col items-center justify-center">
              {/* Label moved to phone edge */}

              <motion.div style={{ scale: checkScale }} className="mb-5">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.18 0.04 155)' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </motion.div>

              <span className="text-lg text-white font-medium mb-1">Pago completado</span>
              <span className="text-2xl font-light text-white mb-1">$203.17</span>
              <span className="text-[11px] mb-4" style={{ color: N600 }}>Incluye propina de $26.50</span>

              <div className="w-full space-y-2 max-w-[240px]">
                <div className="rounded-xl p-3 text-center" style={{ background: N900 }}>
                  <div className="text-[10px] mb-1" style={{ color: N700 }}>Pagos del grupo</div>
                  <div className="flex justify-center gap-3 mt-2">
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px] font-semibold" style={{ background: 'oklch(0.20 0.03 155)', color: GREEN }}>Tu</div>
                      <div className="text-[8px]" style={{ color: GREEN }}>Pagado</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px]" style={{ background: 'oklch(0.20 0.03 155)', color: GREEN }}>A</div>
                      <div className="text-[8px]" style={{ color: GREEN }}>Pagado</div>
                    </div>
                    <div className="text-center">
                      <div className="w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-[10px]" style={{ background: N900, color: AMBER, border: `1px solid ${AMBER}` }}>B</div>
                      <div className="text-[8px]" style={{ color: AMBER }}>Pendiente</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* Home indicator */}
          <div className="flex justify-center pb-2">
            <div className="w-28 h-1 rounded-full" style={{ background: N800 }} />
          </div>
        </div>
      </div>
    </div>
  );
}
