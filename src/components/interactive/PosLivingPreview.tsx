import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for Avoqado POS — tablet app.
 * Landscape mockup showing floor plan, ordering, KDS, and shift summary.
 */
export default function PosLivingPreview({ scrollYProgress }: Props) {
  // State crossfades
  const s1 = useTransform(scrollYProgress, [0, 0.06, 0.30, 0.35], [0, 1, 1, 0]);
  const s2 = useTransform(scrollYProgress, [0.30, 0.35, 0.55, 0.60], [0, 1, 1, 0]);
  const s3 = useTransform(scrollYProgress, [0.55, 0.60, 0.78, 0.83], [0, 1, 1, 0]);
  const s4 = useTransform(scrollYProgress, [0.78, 0.83, 0.95, 1], [0, 1, 1, 1]);

  // Labels
  const l1Y = useTransform(scrollYProgress, [0, 0.06], [10, 0]);
  const l2Y = useTransform(scrollYProgress, [0.30, 0.35], [10, 0]);
  const l3Y = useTransform(scrollYProgress, [0.55, 0.60], [10, 0]);
  const l4Y = useTransform(scrollYProgress, [0.78, 0.83], [10, 0]);

  // State 1: Tables stagger
  const table1 = useTransform(scrollYProgress, [0.04, 0.10], [0, 1]);
  const table2 = useTransform(scrollYProgress, [0.08, 0.14], [0, 1]);
  const table3 = useTransform(scrollYProgress, [0.12, 0.18], [0, 1]);
  const table4 = useTransform(scrollYProgress, [0.16, 0.22], [0, 1]);

  // State 4: Counter
  const salesValue = useTransform(scrollYProgress, [0.80, 0.90], [0, 18450]);
  const salesDisplay = useTransform(salesValue, (v) => `$${Math.round(v).toLocaleString('en-US')}`);
  const ordersValue = useTransform(scrollYProgress, [0.82, 0.90], [0, 34]);
  const ordersDisplay = useTransform(ordersValue, (v) => `${Math.round(v)}`);

  const GREEN = '#69E185';
  const INDIGO = 'oklch(0.68 0.15 290)';
  const AMBER = 'oklch(0.78 0.14 75)';
  const LABEL_BG = 'oklch(0.12 0.005 155)';
  const N600 = 'oklch(0.40 0.005 155)';
  const N700 = 'oklch(0.30 0.005 155)';
  const N800 = 'oklch(0.22 0.005 155)';
  const N900 = 'oklch(0.16 0.005 155)';

  return (
    <div className="relative w-full">
      {/* Labels — centered on top edge of device frame */}
      <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <motion.span style={{ opacity: s1, y: l1Y, borderColor: INDIGO, color: INDIGO, background: LABEL_BG }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Vista de piso
        </motion.span>
        <motion.span style={{ opacity: s2, y: l2Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Nueva venta
        </motion.span>
        <motion.span style={{ opacity: s3, y: l3Y, borderColor: AMBER, color: AMBER, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Reservaciones
        </motion.span>
        <motion.span style={{ opacity: s4, y: l4Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Cierre de turno
        </motion.span>
      </div>

      {/* Tablet frame — landscape aspect ratio */}
      <div className="relative rounded-2xl overflow-hidden border aspect-[4/3] w-full"
        style={{ background: '#0A0A0A', borderColor: 'oklch(0.28 0.005 155)' }}>
        <div className="absolute inset-0 p-3 sm:p-4 flex flex-col">

          {/* Tab bar (persistent) */}
          <div className="flex items-center justify-between mb-3 shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />
              <div className="h-2 w-16 rounded-full" style={{ background: N800 }} />
            </div>
            <div className="flex gap-1.5">
              <div className="px-2.5 py-1 rounded-lg text-[9px]" style={{ background: N900, color: N600 }}>Mesas</div>
              <div className="px-2.5 py-1 rounded-lg text-[9px]" style={{ background: N900, color: N600 }}>Reservas</div>
              <div className="px-2.5 py-1 rounded-lg text-[9px]" style={{ background: INDIGO, color: 'white' }}>Activo</div>
            </div>
          </div>

          {/* Content — states crossfade */}
          <div className="relative flex-1 min-h-0">

            {/* STATE 1: Floor plan — table grid */}
            <motion.div style={{ opacity: s1 }} className="absolute inset-0 flex flex-col">
              <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 sm:gap-3">
                <motion.div style={{ opacity: table1, background: 'oklch(0.14 0.02 155)', border: `2px solid ${GREEN}` }} className="rounded-xl flex flex-col items-center justify-center p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'oklch(0.20 0.03 155)' }}>
                    <span className="text-[10px] sm:text-xs font-semibold" style={{ color: GREEN }}>1</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: GREEN }}>Ocupada</span>
                  <span className="text-[7px] sm:text-[8px]" style={{ color: N700 }}>$485</span>
                </motion.div>

                <motion.div style={{ opacity: table2, background: N900, border: `1px solid ${N800}` }} className="rounded-xl flex flex-col items-center justify-center p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'oklch(0.12 0.005 155)' }}>
                    <span className="text-[10px] sm:text-xs" style={{ color: N600 }}>2</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: N600 }}>Libre</span>
                </motion.div>

                <motion.div style={{ opacity: table2, background: 'oklch(0.14 0.02 75)', border: `2px solid ${AMBER}` }} className="rounded-xl flex flex-col items-center justify-center p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'oklch(0.18 0.03 75)' }}>
                    <span className="text-[10px] sm:text-xs font-semibold" style={{ color: AMBER }}>3</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: AMBER }}>Por pagar</span>
                  <span className="text-[7px] sm:text-[8px]" style={{ color: N700 }}>$320</span>
                </motion.div>

                <motion.div style={{ opacity: table3, background: 'oklch(0.14 0.02 155)', border: `2px solid ${GREEN}` }} className="rounded-xl flex flex-col items-center justify-center p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'oklch(0.20 0.03 155)' }}>
                    <span className="text-[10px] sm:text-xs font-semibold" style={{ color: GREEN }}>4</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: GREEN }}>Ocupada</span>
                  <span className="text-[7px] sm:text-[8px]" style={{ color: N700 }}>$547</span>
                </motion.div>

                <motion.div style={{ opacity: table3, background: N900, border: `1px solid ${N800}` }} className="rounded-xl flex flex-col items-center justify-center p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full mb-1 flex items-center justify-center" style={{ background: 'oklch(0.12 0.005 155)' }}>
                    <span className="text-[10px] sm:text-xs" style={{ color: N600 }}>5</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: N600 }}>Libre</span>
                </motion.div>

                <motion.div style={{ opacity: table4, background: 'oklch(0.14 0.015 290)', border: `2px solid ${INDIGO}` }} className="rounded-xl flex flex-col items-center justify-center p-2">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg mb-1 flex items-center justify-center" style={{ background: 'oklch(0.18 0.03 290)' }}>
                    <span className="text-[10px] sm:text-xs font-semibold" style={{ color: INDIGO }}>6</span>
                  </div>
                  <span className="text-[8px] sm:text-[9px]" style={{ color: INDIGO }}>Reservada</span>
                  <span className="text-[7px] sm:text-[8px]" style={{ color: N700 }}>19:00</span>
                </motion.div>
              </div>
            </motion.div>

            {/* STATE 2: Taking order — split view */}
            <motion.div style={{ opacity: s2 }} className="absolute inset-0 flex gap-2 sm:gap-3">
              {/* Product grid */}
              <div className="w-3/5 flex flex-col gap-2">
                <div className="flex gap-1.5">
                  <div className="px-2 py-1 rounded-full text-[8px] sm:text-[9px] text-black" style={{ background: GREEN }}>Todos</div>
                  <div className="px-2 py-1 rounded-full text-[8px] sm:text-[9px]" style={{ background: N900, color: N600 }}>Favoritos</div>
                  <div className="px-2 py-1 rounded-full text-[8px] sm:text-[9px]" style={{ background: N900, color: N600 }}>Promos</div>
                </div>
                <div className="flex-1 grid grid-cols-3 gap-1.5">
                  {['Servicio A', 'Producto B', 'Combo 1', 'Servicio C', 'Producto D', 'Extra'].map((item, i) => (
                    <div key={item} className="rounded-lg p-2 flex flex-col items-center justify-center"
                      style={{ background: i === 0 ? 'oklch(0.14 0.02 155)' : N900, border: i === 0 ? `1px solid ${GREEN}` : `1px solid ${N800}` }}>
                      <span className="text-[8px] sm:text-[10px] text-white text-center">{item}</span>
                      <span className="text-[7px] sm:text-[9px]" style={{ color: i === 0 ? GREEN : N600 }}>${[250, 180, 350, 120, 95, 45][i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order sidebar */}
              <div className="w-2/5 rounded-xl p-2 sm:p-3 flex flex-col" style={{ background: N900 }}>
                <div className="text-[9px] sm:text-[10px] text-white font-medium mb-2">Venta #848</div>
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between items-center p-1.5 rounded" style={{ background: 'oklch(0.13 0.005 155)' }}>
                    <span className="text-[8px] sm:text-[10px] text-white">2x Servicio A</span>
                    <span className="text-[8px] sm:text-[10px]" style={{ color: GREEN }}>$500</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded" style={{ background: 'oklch(0.13 0.005 155)' }}>
                    <span className="text-[8px] sm:text-[10px] text-white">1x Combo 1</span>
                    <span className="text-[8px] sm:text-[10px]" style={{ color: GREEN }}>$350</span>
                  </div>
                  <div className="flex justify-between items-center p-1.5 rounded" style={{ background: 'oklch(0.13 0.005 155)' }}>
                    <span className="text-[8px] sm:text-[10px] text-white">1x Extra</span>
                    <span className="text-[8px] sm:text-[10px]" style={{ color: GREEN }}>$45</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t" style={{ borderColor: N800 }}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>Total</span>
                    <span className="text-[10px] sm:text-xs text-white font-medium">$895.00</span>
                  </div>
                  <div className="h-7 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                    <span className="text-[9px] sm:text-[10px] font-semibold text-black">Cobrar</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* STATE 3: Reservations calendar */}
            <motion.div style={{ opacity: s3 }} className="absolute inset-0 flex gap-2 sm:gap-3">
              {/* Calendar */}
              <div className="w-1/2 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] sm:text-[11px] text-white font-medium">Marzo 2025</span>
                  <div className="flex gap-1">
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: N900 }}>
                      <span className="text-[9px]" style={{ color: N600 }}>{'<'}</span>
                    </div>
                    <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: N900 }}>
                      <span className="text-[9px]" style={{ color: N600 }}>{'>'}</span>
                    </div>
                  </div>
                </div>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-0.5 mb-1">
                  {['L','M','Mi','J','V','S','D'].map(d => (
                    <div key={d} className="text-center text-[7px] sm:text-[8px] py-0.5" style={{ color: N700 }}>{d}</div>
                  ))}
                </div>
                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-0.5 flex-1">
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = i - 4; // offset so 1st falls on Wednesday
                    const num = day + 1;
                    const isValid = num >= 1 && num <= 31;
                    const isToday = num === 17;
                    const hasReservation = [5, 8, 12, 15, 17, 19, 22, 26].includes(num);
                    const isPast = num < 17;
                    return (
                      <div key={i} className="rounded flex flex-col items-center justify-center py-0.5"
                        style={{
                          background: isToday ? GREEN : hasReservation && !isPast ? 'oklch(0.18 0.03 290)' : 'transparent',
                          border: hasReservation && !isPast && !isToday ? `1px solid oklch(0.35 0.08 290)` : '1px solid transparent',
                        }}>
                        <span className="text-[7px] sm:text-[8px]" style={{
                          color: !isValid ? 'transparent' : isToday ? '#000' : isPast ? N800 : hasReservation ? INDIGO : N600,
                          fontWeight: isToday ? 600 : 400,
                        }}>
                          {isValid ? num : ''}
                        </span>
                        {hasReservation && isValid && !isPast && !isToday && (
                          <div className="w-1 h-1 rounded-full mt-0.5" style={{ background: INDIGO }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Today's reservations */}
              <div className="w-1/2 rounded-xl p-2 sm:p-3 flex flex-col" style={{ background: N900 }}>
                <div className="text-[9px] sm:text-[10px] text-white font-medium mb-2">Hoy — 4 reservas</div>
                <div className="flex-1 space-y-1.5">
                  <div className="p-2 rounded-lg" style={{ background: 'oklch(0.13 0.005 155)', borderLeft: `3px solid ${GREEN}` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[10px] text-white">Garcia - 4 pax</span>
                      <span className="text-[8px] sm:text-[9px]" style={{ color: GREEN }}>14:00</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'oklch(0.13 0.005 155)', borderLeft: `3px solid ${INDIGO}` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[10px] text-white">Martinez - 6 pax</span>
                      <span className="text-[8px] sm:text-[9px]" style={{ color: INDIGO }}>18:30</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'oklch(0.13 0.005 155)', borderLeft: `3px solid ${AMBER}` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[10px] text-white">Lopez - 2 pax</span>
                      <span className="text-[8px] sm:text-[9px]" style={{ color: AMBER }}>19:00</span>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg" style={{ background: 'oklch(0.13 0.005 155)', borderLeft: `3px solid ${INDIGO}` }}>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] sm:text-[10px] text-white">Evento corp. - 12 pax</span>
                      <span className="text-[8px] sm:text-[9px]" style={{ color: INDIGO }}>20:00</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 h-7 sm:h-8 rounded-lg flex items-center justify-center" style={{ background: INDIGO }}>
                  <span className="text-[9px] sm:text-[10px] font-semibold text-white">Nueva reserva</span>
                </div>
              </div>
            </motion.div>

            {/* STATE 4: Shift summary */}
            <motion.div style={{ opacity: s4 }} className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="w-full max-w-[320px]">
                <div className="text-center mb-4">
                  <span className="text-[10px] sm:text-xs" style={{ color: N600 }}>Turno de Maria G.</span>
                  <motion.div className="text-3xl sm:text-4xl font-light text-white mt-1">{salesDisplay}</motion.div>
                  <span className="text-[10px] sm:text-xs" style={{ color: N700 }}>en ventas</span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="rounded-xl p-2.5 text-center" style={{ background: N900 }}>
                    <motion.div className="text-sm sm:text-base font-medium text-white">{ordersDisplay}</motion.div>
                    <span className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>Ordenes</span>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: N900 }}>
                    <div className="text-sm sm:text-base font-medium" style={{ color: GREEN }}>$1,845</div>
                    <span className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>Propinas</span>
                  </div>
                  <div className="rounded-xl p-2.5 text-center" style={{ background: N900 }}>
                    <div className="text-sm sm:text-base font-medium text-white">$542</div>
                    <span className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>Ticket prom.</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <div className="flex-1 h-8 sm:h-9 rounded-lg flex items-center justify-center border" style={{ borderColor: N800 }}>
                    <span className="text-[10px] sm:text-[11px]" style={{ color: N600 }}>Imprimir</span>
                  </div>
                  <div className="flex-1 h-8 sm:h-9 rounded-lg flex items-center justify-center" style={{ background: GREEN }}>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-black">Cerrar turno</span>
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
