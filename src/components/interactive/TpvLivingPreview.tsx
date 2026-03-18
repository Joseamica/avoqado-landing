import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for the TPV product — uses real PAX A910S photo
 * with UI overlay on the screen area.
 *
 * States:
 *   0-35%: Product catalog / menu
 *  35-55%: Order summary
 *  55-75%: Payment method selection
 *  75-100%: Approved + ticket
 */
export default function TpvLivingPreview({ scrollYProgress }: Props) {
  // State crossfades
  const s1 = useTransform(scrollYProgress, [0, 0.06, 0.35, 0.40], [0, 1, 1, 0]);
  const s2 = useTransform(scrollYProgress, [0.35, 0.40, 0.55, 0.60], [0, 1, 1, 0]);
  const s3 = useTransform(scrollYProgress, [0.55, 0.60, 0.75, 0.80], [0, 1, 1, 0]);
  const s4 = useTransform(scrollYProgress, [0.75, 0.80, 0.95, 1], [0, 1, 1, 1]);

  // Labels
  const l1Y = useTransform(scrollYProgress, [0, 0.06], [10, 0]);
  const l2Y = useTransform(scrollYProgress, [0.35, 0.40], [10, 0]);
  const l3Y = useTransform(scrollYProgress, [0.55, 0.60], [10, 0]);
  const l4Y = useTransform(scrollYProgress, [0.75, 0.80], [10, 0]);

  // State 1: Items stagger
  const item1 = useTransform(scrollYProgress, [0.04, 0.12], [0, 1]);
  const item2 = useTransform(scrollYProgress, [0.10, 0.18], [0, 1]);
  const item3 = useTransform(scrollYProgress, [0.16, 0.24], [0, 1]);
  const totalOpacity = useTransform(scrollYProgress, [0.22, 0.30], [0, 1]);

  // State 3: Amount
  const amountValue = useTransform(scrollYProgress, [0.58, 0.68], [0, 547]);
  const amountDisplay = useTransform(amountValue, (v) => `$${Math.round(v).toLocaleString('en-US')}.00`);

  // State 4: Check
  const checkScale = useTransform(scrollYProgress, [0.78, 0.85], [0, 1]);

  const GREEN = '#69E185';
  const LABEL_BG = 'oklch(0.12 0.005 155)';
  const N600 = 'oklch(0.40 0.005 155)';
  const N700 = 'oklch(0.30 0.005 155)';
  const N800 = 'oklch(0.22 0.005 155)';
  const N900 = 'oklch(0.16 0.005 155)';
  const BLUE = 'oklch(0.72 0.14 240)';

  return (
    <div className="flex justify-center w-full">
      <div className="relative w-full max-w-[600px] md:max-w-[700px]">

        {/* Labels — above the terminal */}
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

        {/* Real PAX A910S image as frame */}
        <div className="relative">
          <img
            src="/pax-no-screen.png"
            alt="Terminal PAX A910S"
            className="w-full h-auto relative z-[15] pointer-events-none select-none"
            draggable="false"
          />

          {/* UI rendered BEHIND the terminal image — shows through transparent screen */}
          <div className="absolute z-[5] overflow-hidden"
            style={{
              top: '25%',
              left: '29%',
              width: '28%',
              height: '58.5%',
              background: '#0A0A0A',
              borderRadius: '3px',
            }}
          >
            <div className="relative w-full h-full p-2 sm:p-2.5">

              {/* STATE 1: Product catalog */}
              <motion.div style={{ opacity: s1 }} className="absolute inset-2 sm:inset-2.5 flex flex-col">
                <div className="flex gap-1 mb-2">
                  <div className="px-2 py-1 rounded-full text-[7px] sm:text-[8px] font-semibold text-black" style={{ background: GREEN }}>Tacos</div>
                  <div className="px-2 py-1 rounded-full text-[7px] sm:text-[8px]" style={{ background: N900, color: N600 }}>Platos</div>
                  <div className="px-2 py-1 rounded-full text-[7px] sm:text-[8px]" style={{ background: N900, color: N600 }}>Bebidas</div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-1.5">
                  <motion.div style={{ opacity: item1 }} className="rounded-lg p-2 flex flex-col" >
                    <div className="w-full aspect-square rounded mb-1.5 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-4 h-4 rounded" style={{ background: 'oklch(0.55 0.14 75)' }} />
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-white font-medium">Tacos Pastor</div>
                    <div className="text-[7px] sm:text-[8px]" style={{ color: GREEN }}>$95</div>
                  </motion.div>
                  <motion.div style={{ opacity: item2 }} className="rounded-lg p-2 flex flex-col">
                    <div className="w-full aspect-square rounded mb-1.5 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-4 h-4 rounded" style={{ background: 'oklch(0.55 0.12 25)' }} />
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-white font-medium">Enchiladas</div>
                    <div className="text-[7px] sm:text-[8px]" style={{ color: N600 }}>$165</div>
                  </motion.div>
                  <motion.div style={{ opacity: item3 }} className="rounded-lg p-2 flex flex-col">
                    <div className="w-full aspect-square rounded mb-1.5 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-4 h-4 rounded" style={{ background: 'oklch(0.55 0.14 155)' }} />
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-white font-medium">Guacamole</div>
                    <div className="text-[7px] sm:text-[8px]" style={{ color: 'oklch(0.78 0.14 75)' }}>$85</div>
                  </motion.div>
                  <motion.div style={{ opacity: item3 }} className="rounded-lg p-2 flex flex-col">
                    <div className="w-full aspect-square rounded mb-1.5 flex items-center justify-center" style={{ background: 'oklch(0.14 0.005 155)' }}>
                      <div className="w-4 h-4 rounded-full" style={{ background: 'oklch(0.60 0.10 200)' }} />
                    </div>
                    <div className="text-[8px] sm:text-[9px] text-white font-medium">Horchata</div>
                    <div className="text-[7px] sm:text-[8px]" style={{ color: N600 }}>$45</div>
                  </motion.div>
                </div>
                <motion.div style={{ opacity: totalOpacity, background: GREEN }} className="mt-1.5 w-full py-1.5 rounded-lg flex items-center justify-between px-3">
                  <span className="text-[8px] font-semibold text-black">3 items</span>
                  <span className="text-[9px] font-semibold text-black">Ver orden</span>
                </motion.div>
              </motion.div>

              {/* STATE 2: Order summary */}
              <motion.div style={{ opacity: s2 }} className="absolute inset-2 sm:inset-2.5 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[8px] text-white font-medium">Orden #847</span>
                  <span className="text-[7px]" style={{ color: N600 }}>14:32</span>
                </div>
                <div className="flex-1 space-y-1">
                  {[
                    { qty: '2', name: 'Tacos Pastor', sub: 'c/pina, cilantro', price: '$190' },
                    { qty: '1', name: 'Enchiladas', sub: 'salsa verde', price: '$165' },
                    { qty: '2', name: 'Horchata', sub: '500ml', price: '$90' },
                    { qty: '1', name: 'Guacamole', sub: '2x1', price: '$85' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-1.5 rounded">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded flex items-center justify-center text-[7px] font-bold" style={{ background: N900, color: GREEN }}>{item.qty}</div>
                        <div>
                          <div className="text-[8px] text-white">{item.name}</div>
                          <div className="text-[6px]" style={{ color: N700 }}>{item.sub}</div>
                        </div>
                      </div>
                      <span className="text-[8px] text-white">{item.price}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-1.5 border-t" style={{ borderColor: N800 }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[7px]" style={{ color: N700 }}>5 items</span>
                    <span className="text-sm font-light text-white">$547.00</span>
                  </div>
                  <div className="w-full py-1.5 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                    <span className="text-[9px] font-semibold text-black">Cobrar $547.00</span>
                  </div>
                </div>
              </motion.div>

              {/* STATE 3: Payment method */}
              <motion.div style={{ opacity: s3 }} className="absolute inset-2 sm:inset-2.5 flex flex-col items-center justify-center">
                <motion.div className="text-xl font-light text-white mb-3">{amountDisplay}</motion.div>
                <div className="text-[7px] uppercase tracking-widest mb-3" style={{ color: N600 }}>Selecciona metodo</div>
                <div className="grid grid-cols-3 gap-1.5 w-full">
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg border" style={{ background: N900, borderColor: GREEN }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" x2="23" y1="10" y2="10"/></svg>
                    <span className="text-[7px] text-white">Tarjeta</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg border" style={{ background: N900, borderColor: N800 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={N600} strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/></svg>
                    <span className="text-[7px]" style={{ color: N600 }}>QR</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 p-2 rounded-lg border" style={{ background: N900, borderColor: N800 }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={N600} strokeWidth="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 014-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>
                    <span className="text-[7px]" style={{ color: N600 }}>Split</span>
                  </div>
                </div>
                <div className="mt-3 w-full py-1.5 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                  <span className="text-[9px] font-semibold text-black">Continuar</span>
                </div>
              </motion.div>

              {/* STATE 4: Approved */}
              <motion.div style={{ opacity: s4 }} className="absolute inset-2 sm:inset-2.5 flex flex-col items-center justify-center">
                <motion.div style={{ scale: checkScale }} className="mb-3">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'oklch(0.18 0.04 155)' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </motion.div>
                <span className="text-sm text-white font-medium mb-0.5">Pago aprobado</span>
                <span className="text-lg font-light text-white mb-2">$547.00</span>
                <div className="space-y-0.5 text-center">
                  <div className="text-[8px]" style={{ color: N600 }}>Visa **** 4821</div>
                  <div className="text-[8px]" style={{ color: GREEN }}>Ticket impreso</div>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
