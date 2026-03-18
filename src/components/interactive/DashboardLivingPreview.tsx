import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for the Dashboard product.
 * A wireframe mockup that transforms through 4 states as the user scrolls,
 * each self-explanatory with a floating label.
 *
 * States:
 *   0-25%: Sales KPIs + bar chart growing
 *  25-50%: Inventory list with low-stock alert
 *  50-75%: Staff cards with shift status + commissions
 *  75-100%: AI chatbot conversation
 */
export default function DashboardLivingPreview({ scrollYProgress }: Props) {
  // ─── State visibility (crossfade between states) ───
  const state1Opacity = useTransform(scrollYProgress, [0, 0.08, 0.22, 0.28], [0, 1, 1, 0]);
  const state2Opacity = useTransform(scrollYProgress, [0.22, 0.28, 0.47, 0.53], [0, 1, 1, 0]);
  const state3Opacity = useTransform(scrollYProgress, [0.47, 0.53, 0.72, 0.78], [0, 1, 1, 0]);
  const state4Opacity = useTransform(scrollYProgress, [0.72, 0.78, 0.95, 1], [0, 1, 1, 1]);

  // ─── Label positions ───
  const label1Y = useTransform(scrollYProgress, [0, 0.08], [10, 0]);
  const label2Y = useTransform(scrollYProgress, [0.22, 0.28], [10, 0]);
  const label3Y = useTransform(scrollYProgress, [0.47, 0.53], [10, 0]);
  const label4Y = useTransform(scrollYProgress, [0.72, 0.78], [10, 0]);

  // ─── State 1: Bar chart growth ───
  const bar1H = useTransform(scrollYProgress, [0.05, 0.18], [0, 30]);
  const bar2H = useTransform(scrollYProgress, [0.06, 0.19], [0, 50]);
  const bar3H = useTransform(scrollYProgress, [0.07, 0.20], [0, 40]);
  const bar4H = useTransform(scrollYProgress, [0.08, 0.21], [0, 70]);
  const bar5H = useTransform(scrollYProgress, [0.09, 0.22], [0, 55]);
  const bar6H = useTransform(scrollYProgress, [0.10, 0.23], [0, 80]);
  const bar7H = useTransform(scrollYProgress, [0.11, 0.24], [0, 65]);
  const bar8H = useTransform(scrollYProgress, [0.12, 0.25], [0, 90]);

  // KPI counter animation
  const kpi1 = useTransform(scrollYProgress, [0.04, 0.15], [0, 24850]);
  const kpi2 = useTransform(scrollYProgress, [0.06, 0.16], [0, 127]);
  const kpi3 = useTransform(scrollYProgress, [0.08, 0.17], [0, 195]);

  // Sidebar active item shifts per state
  const sidebarActive = useTransform(scrollYProgress, [0, 0.25, 0.5, 0.75], [0, 1, 2, 3]);

  // Dashboard accent — this is the correct product accent from the design system
  const ACCENT = 'oklch(0.72 0.14 240)';
  const ACCENT_DIM = 'oklch(0.45 0.10 240)';
  // Green-tinted neutrals (hue 155) — from Avoqado design system
  const SURFACE = '#151515';         // --color-avoqado-dark-surface
  const SURFACE_ELEVATED = '#1C1C1E'; // slightly lighter surface
  const NEUTRAL_700 = 'oklch(0.30 0.005 155)'; // sidebar items, subtle borders
  const NEUTRAL_800 = 'oklch(0.22 0.005 155)'; // dimmer elements
  const NEUTRAL_900 = 'oklch(0.16 0.005 155)'; // card backgrounds
  // Brand & semantic colors
  const GREEN = '#69E185';           // --color-avoqado-green
  const AMBER = 'oklch(0.78 0.14 75)'; // product-qr accent, warnings
  const RED = 'oklch(0.65 0.20 25)';   // alerts, low stock

  const LABEL_BG = 'oklch(0.12 0.005 155)';

  return (
    <div className="relative w-full">
      {/* Labels — centered on top edge of device frame */}
      <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <motion.span style={{ opacity: state1Opacity, y: label1Y, borderColor: ACCENT, color: ACCENT, background: LABEL_BG }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Ventas en tiempo real
        </motion.span>
        <motion.span style={{ opacity: state2Opacity, y: label2Y, borderColor: AMBER, color: AMBER, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Alertas de inventario
        </motion.span>
        <motion.span style={{ opacity: state3Opacity, y: label3Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Gestion de personal
        </motion.span>
        <motion.span style={{ opacity: state4Opacity, y: label4Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Asistente IA integrado
        </motion.span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-avoqado-dark-surface border border-white/5 aspect-[4/3] w-full">
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col">

        {/* ─── Top bar (persistent) ─── */}
        <div className="flex items-center gap-3 mb-4 sm:mb-6 shrink-0">
          <div className="w-3 h-3 rounded-full" style={{ background: ACCENT }} />
          <div className="h-2 w-20 sm:w-24 rounded-full" style={{ background: NEUTRAL_700 }} />
          <div className="ml-auto flex gap-2">
            <div className="h-2 w-12 sm:w-16 rounded-full" style={{ background: NEUTRAL_800 }} />
            <div className="h-2 w-8 sm:w-12 rounded-full" style={{ background: NEUTRAL_800 }} />
          </div>
        </div>

        {/* ─── Main area: sidebar + content ─── */}
        <div className="flex gap-3 sm:gap-4 flex-1 min-h-0">

          {/* Sidebar (persistent, active item shifts) */}
          <div className="w-1/5 space-y-2 sm:space-y-3 shrink-0">
            {['Ventas', 'Inventario', 'Personal', 'IA'].map((label, i) => (
              <SidebarItem key={label} index={i} activeIndex={sidebarActive} color={ACCENT} dimColor={NEUTRAL_800} />
            ))}
          </div>

          {/* Content area — states crossfade */}
          <div className="flex-1 relative min-h-0">

            {/* STATE 1: Sales KPIs + Chart */}
            <motion.div style={{ opacity: state1Opacity }} className="absolute inset-0 flex flex-col gap-3 sm:gap-4">
              {/* KPI Cards */}
              <div className="flex gap-2 sm:gap-3">
                <KPICard label="Ventas" value={kpi1} prefix="$" format="currency" color={ACCENT} bg={NEUTRAL_900} />
                <KPICard label="Ordenes" value={kpi2} color={ACCENT_DIM} bg={NEUTRAL_900} />
                <KPICard label="Ticket" value={kpi3} prefix="$" color={ACCENT_DIM} bg={NEUTRAL_900} />
              </div>

              {/* Bar chart */}
              <div className="rounded-lg p-2 sm:p-4 flex-1 flex items-end gap-1 sm:gap-1.5" style={{ background: NEUTRAL_900 }}>
                {[bar1H, bar2H, bar3H, bar4H, bar5H, bar6H, bar7H, bar8H].map((h, i) => (
                  <BarChartBar key={i} height={h} color={ACCENT} index={i} />
                ))}
              </div>
            </motion.div>

            {/* STATE 2: Inventory */}
            <motion.div style={{ opacity: state2Opacity }} className="absolute inset-0 flex flex-col gap-2 sm:gap-3">
              {/* Inventory header */}
              <div className="flex items-center justify-between px-2">
                <div className="h-2 w-20 rounded" style={{ background: NEUTRAL_700 }} />
                <div className="h-2 w-12 rounded" style={{ background: NEUTRAL_800 }} />
              </div>

              {/* Inventory rows */}
              <InventoryRow name="Aguacate Hass" stock={85} color={GREEN} />
              <InventoryRow name="Tortilla maiz" stock={62} color={GREEN} />
              <InventoryRow name="Limon" stock={12} color={RED} alert />
              <InventoryRow name="Aceite oliva" stock={45} color={AMBER} />
              <InventoryRow name="Queso Oaxaca" stock={8} color={RED} alert />
              <InventoryRow name="Cebolla" stock={71} color={GREEN} />
            </motion.div>

            {/* STATE 3: Staff */}
            <motion.div style={{ opacity: state3Opacity }} className="absolute inset-0 flex flex-col gap-2 sm:gap-3">
              <StaffCard name="Maria G." role="Mesera" status="En turno" commission={78} color={GREEN} />
              <StaffCard name="Carlos R." role="Bartender" status="En turno" commission={92} color={ACCENT} />
              <StaffCard name="Ana L." role="Hostess" status="Descanso" commission={45} color={AMBER} />
              <StaffCard name="Pedro M." role="Cocina" status="En turno" commission={63} color={GREEN} />
            </motion.div>

            {/* STATE 4: AI Chatbot */}
            <motion.div style={{ opacity: state4Opacity }} className="absolute inset-0 flex flex-col">
              {/* Chat area */}
              <div className="flex-1 flex flex-col gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg" style={{ background: NEUTRAL_900 }}>
                {/* User message */}
                <div className="flex justify-end">
                  <div className="px-3 py-2 rounded-2xl rounded-br-sm max-w-[75%]" style={{ background: 'oklch(0.22 0.005 155)' }}>
                    <span className="text-[10px] sm:text-xs text-gray-300">Cual fue el platillo mas vendido esta semana?</span>
                  </div>
                </div>

                {/* Bot message */}
                <div className="flex gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'oklch(0.20 0.02 155)' }}>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: GREEN }} />
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-bl-sm max-w-[80%]" style={{ background: 'oklch(0.18 0.005 155)' }}>
                    <span className="text-[10px] sm:text-xs text-gray-300">
                      Los <span style={{ color: GREEN }}>Tacos al Pastor</span> con 284 ordenes (+18% vs semana pasada). Seguido por Enchiladas Suizas (201) y Guacamole (187).
                    </span>
                  </div>
                </div>

                {/* Follow-up user message */}
                <div className="flex justify-end">
                  <div className="px-3 py-2 rounded-2xl rounded-br-sm max-w-[75%]" style={{ background: 'oklch(0.22 0.005 155)' }}>
                    <span className="text-[10px] sm:text-xs text-gray-300">Crea una promo 2x1 para el guacamole</span>
                  </div>
                </div>

                {/* Bot response */}
                <div className="flex gap-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: 'oklch(0.20 0.02 155)' }}>
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: GREEN }} />
                  </div>
                  <div className="px-3 py-2 rounded-2xl rounded-bl-sm max-w-[80%]" style={{ background: 'oklch(0.18 0.005 155)' }}>
                    <span className="text-[10px] sm:text-xs text-gray-300">
                      Listo. Promo <span style={{ color: AMBER }}>"2x1 Guacamole"</span> activa desde hoy hasta el domingo. Aplicada automaticamente en TPV y QR.
                    </span>
                  </div>
                </div>
              </div>

              {/* Input bar */}
              <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: 'oklch(0.18 0.005 155)', border: '1px solid oklch(0.28 0.005 155)' }}>
                <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full" style={{ background: GREEN, opacity: 0.5 }} />
                <div className="h-2 w-32 rounded" style={{ background: 'oklch(0.28 0.005 155)' }} />
                <div className="ml-auto w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center" style={{ background: GREEN }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                  </svg>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
      </div>
    </div>
  );
}


// ─── Sub-components ──────────────────────────────────────────

function SidebarItem({ index, activeIndex, color, dimColor }: {
  index: number;
  activeIndex: MotionValue<number>;
  color: string;
  dimColor: string;
}) {
  const isActive = useTransform(activeIndex, (v) => Math.round(v) === index ? 1 : 0);
  const bg = useTransform(isActive, (v) => v ? color : dimColor);
  const width = useTransform(isActive, (v) => v ? '100%' : '75%');

  return (
    <motion.div
      className="h-2 rounded"
      style={{ background: bg, width }}
    />
  );
}

function KPICard({ label, value, prefix = '', format, color, bg }: {
  label: string;
  value: MotionValue<number>;
  prefix?: string;
  format?: 'currency';
  color: string;
  bg: string;
}) {
  const display = useTransform(value, (v) => {
    const rounded = Math.round(v);
    if (format === 'currency') {
      return `${prefix}${rounded.toLocaleString('en-US')}`;
    }
    return `${prefix}${rounded}`;
  });

  return (
    <div className="flex-1 rounded-lg p-2 sm:p-3" style={{ background: bg }}>
      <div className="text-[8px] sm:text-[10px] mb-1 sm:mb-2" style={{ color: 'oklch(0.45 0.005 155)' }}>{label}</div>
      <motion.div className="text-xs sm:text-sm font-semibold" style={{ color }}>
        {display}
      </motion.div>
    </div>
  );
}

function BarChartBar({ height, color, index }: {
  height: MotionValue<number>;
  color: string;
  index: number;
}) {
  const h = useTransform(height, (v) => `${v}%`);
  const opacity = 0.5 + (index / 8) * 0.5;

  return (
    <motion.div
      className="w-full rounded-t"
      style={{ height: h, background: color, opacity }}
    />
  );
}

function InventoryRow({ name, stock, color, alert = false }: {
  name: string;
  stock: number;
  color: string;
  alert?: boolean;
}) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg ${alert ? 'animate-pulse' : ''}`}
      style={{ background: alert ? 'oklch(0.18 0.03 25)' : 'oklch(0.15 0.005 155)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="text-[10px] sm:text-xs text-gray-300 truncate">{name}</div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="w-12 sm:w-16 h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.20 0.005 155)' }}>
          <div className="h-full rounded-full" style={{ width: `${stock}%`, background: color }} />
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono w-6 text-right" style={{ color }}>{stock}%</span>
      </div>
      {alert && (
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
      )}
    </div>
  );
}

function StaffCard({ name, role, status, commission, color }: {
  name: string;
  role: string;
  status: string;
  commission: number;
  color: string;
}) {
  const isActive = status === 'En turno';
  return (
    <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg" style={{ background: 'oklch(0.15 0.005 155)' }}>
      {/* Avatar */}
      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full shrink-0" style={{ background: 'oklch(0.22 0.005 155)' }}>
        <div className="w-full h-full rounded-full flex items-center justify-center text-[8px] sm:text-[10px] font-semibold text-gray-400">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs text-white truncate">{name}</span>
          <span className="text-[8px] sm:text-[9px] px-1.5 py-0.5 rounded-full" style={{
            background: isActive ? 'oklch(0.20 0.02 155)' : 'oklch(0.20 0.02 75)',
            color: isActive ? '#69E185' : 'oklch(0.65 0.10 75)',
          }}>
            {status}
          </span>
        </div>
        <span className="text-[9px] sm:text-[10px] text-gray-500">{role}</span>
      </div>

      {/* Commission bar */}
      <div className="flex items-center gap-1.5 shrink-0">
        <div className="w-10 sm:w-14 h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(0.20 0.005 155)' }}>
          <div className="h-full rounded-full" style={{ width: `${commission}%`, background: color }} />
        </div>
        <span className="text-[9px] sm:text-[10px] font-mono w-6 text-right" style={{ color }}>{commission}%</span>
      </div>
    </div>
  );
}
