import { motion, useTransform, type MotionValue } from 'framer-motion';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Living Preview for the AI Assistant product.
 * A standalone chat interface mockup that transforms through 4 states as the user scrolls,
 * each self-explanatory with a floating label.
 *
 * States:
 *   0-25%:  Natural language question with typing indicator
 *  25-50%:  Data response with mini bar chart
 *  50-75%:  Report export with progress bar
 *  75-100%: Live actions across platforms
 */

// ─── Color constants (green-tinted neutrals, hue 155) ───
const ACCENT = 'oklch(0.75 0.14 195)';
const ACCENT_DIM = 'oklch(0.45 0.10 195)';
const GREEN = '#69E185';
const AMBER = 'oklch(0.78 0.14 75)';
const LABEL_BG = 'oklch(0.12 0.005 155)';
const N700 = 'oklch(0.30 0.005 155)';
const N800 = 'oklch(0.22 0.005 155)';
const N900 = 'oklch(0.16 0.005 155)';

const USER_BUBBLE_BG = 'oklch(0.22 0.005 155)';
const AI_BUBBLE_BG = 'oklch(0.18 0.005 155)';
const AVATAR_RING = 'oklch(0.20 0.02 155)';

export default function AiLivingPreview({ scrollYProgress }: Props) {
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

  // ─── State 2: Bar chart growth ───
  const bar1H = useTransform(scrollYProgress, [0.28, 0.38], [0, 25]);
  const bar2H = useTransform(scrollYProgress, [0.29, 0.39], [0, 40]);
  const bar3H = useTransform(scrollYProgress, [0.30, 0.40], [0, 55]);
  const bar4H = useTransform(scrollYProgress, [0.31, 0.41], [0, 35]);
  const bar5H = useTransform(scrollYProgress, [0.32, 0.42], [0, 65]);
  const bar6H = useTransform(scrollYProgress, [0.33, 0.43], [0, 50]);
  const bar7H = useTransform(scrollYProgress, [0.34, 0.44], [0, 80]);
  const bar8H = useTransform(scrollYProgress, [0.35, 0.45], [0, 70]);

  // ─── State 3: Progress bar fill ───
  const progressWidth = useTransform(scrollYProgress, [0.55, 0.70], [0, 100]);

  // ─── State 4: Platform badge scale ───
  const badge1Scale = useTransform(scrollYProgress, [0.78, 0.84], [0, 1]);
  const badge2Scale = useTransform(scrollYProgress, [0.82, 0.88], [0, 1]);
  const badge3Scale = useTransform(scrollYProgress, [0.86, 0.92], [0, 1]);

  return (
    <div className="relative w-full">
      {/* Labels — centered on top edge of device frame */}
      <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
        <motion.span style={{ opacity: state1Opacity, y: label1Y, borderColor: ACCENT, color: ACCENT, background: LABEL_BG }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Pregunta natural
        </motion.span>
        <motion.span style={{ opacity: state2Opacity, y: label2Y, borderColor: ACCENT, color: ACCENT, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Respuesta con datos
        </motion.span>
        <motion.span style={{ opacity: state3Opacity, y: label3Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Exportar reportes
        </motion.span>
        <motion.span style={{ opacity: state4Opacity, y: label4Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
          className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
          Acciones en vivo
        </motion.span>
      </div>

      <div className="relative rounded-2xl overflow-hidden bg-avoqado-dark-surface border border-white/5 aspect-[3/4] w-full">
        <div className="absolute inset-0 flex flex-col">

          {/* ─── Chat header (persistent) ─── */}
          <div className="flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 shrink-0" style={{ borderBottom: `1px solid oklch(0.22 0.005 155)` }}>
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center" style={{ background: AVATAR_RING }}>
              <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full" style={{ background: GREEN }} />
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-white font-medium">Asistente IA</div>
              <div className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>En linea</div>
            </div>
            <div className="ml-auto flex gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: N700 }} />
              <div className="w-1 h-1 rounded-full" style={{ background: N700 }} />
              <div className="w-1 h-1 rounded-full" style={{ background: N700 }} />
            </div>
          </div>

          {/* ─── Chat messages area — states crossfade ─── */}
          <div className="flex-1 relative min-h-0 px-3 sm:px-4 py-3 sm:py-4">

            {/* STATE 1: Natural language question + typing indicator */}
            <motion.div style={{ opacity: state1Opacity }} className="absolute inset-0 px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
              <UserMessage text="Cuales fueron mis ventas esta semana?" />
              <div className="flex gap-2">
                <AiAvatar />
                <div className="px-3 py-2.5 rounded-2xl rounded-bl-sm" style={{ background: AI_BUBBLE_BG }}>
                  <div className="flex gap-1 items-center h-4">
                    <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: ACCENT, animationDelay: '0ms' }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: ACCENT, animationDelay: '150ms' }} />
                    <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: ACCENT, animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* STATE 2: Data response with bar chart */}
            <motion.div style={{ opacity: state2Opacity }} className="absolute inset-0 px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
              <UserMessage text="Cuales fueron mis ventas esta semana?" />
              <div className="flex gap-2">
                <AiAvatar />
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%] flex flex-col gap-2" style={{ background: AI_BUBBLE_BG }}>
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm sm:text-base font-semibold text-white">$148,500</span>
                    <span className="text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ color: GREEN, background: 'oklch(0.20 0.04 155)' }}>
                      +12%
                    </span>
                    <span className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>esta semana</span>
                  </div>
                  {/* Mini bar chart */}
                  <div className="flex items-end gap-0.5 sm:gap-1 h-10 sm:h-12">
                    {[bar1H, bar2H, bar3H, bar4H, bar5H, bar6H, bar7H, bar8H].map((h, i) => (
                      <MiniBar key={i} height={h} index={i} />
                    ))}
                  </div>
                  <span className="text-[9px] sm:text-[10px]" style={{ color: ACCENT }}>Ver detalles</span>
                </div>
              </div>
            </motion.div>

            {/* STATE 3: Report export with progress bar */}
            <motion.div style={{ opacity: state3Opacity }} className="absolute inset-0 px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
              <UserMessage text="Exporta reporte de inventario" />
              <div className="flex gap-2">
                <AiAvatar />
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%] flex flex-col gap-2.5" style={{ background: AI_BUBBLE_BG }}>
                  <span className="text-[10px] sm:text-xs text-gray-300">Listo, aqui esta tu reporte:</span>
                  <FileCard progressWidth={progressWidth} />
                </div>
              </div>
            </motion.div>

            {/* STATE 4: Live actions across platforms */}
            <motion.div style={{ opacity: state4Opacity }} className="absolute inset-0 px-3 sm:px-4 py-3 sm:py-4 flex flex-col gap-2 sm:gap-3">
              <UserMessage text="Crea promo 2x1 para hoy" />
              <div className="flex gap-2">
                <AiAvatar />
                <div className="px-3 py-2 rounded-2xl rounded-bl-sm max-w-[85%] flex flex-col gap-2.5" style={{ background: AI_BUBBLE_BG }}>
                  <span className="text-[10px] sm:text-xs text-gray-300">Promo activada en 3 plataformas</span>
                  <div className="flex flex-col gap-1.5">
                    <PlatformBadge label="TPV" color={GREEN} scale={badge1Scale} />
                    <PlatformBadge label="QR" color={AMBER} scale={badge2Scale} />
                    <PlatformBadge label="Web" color={ACCENT} scale={badge3Scale} />
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          {/* ─── Input bar (persistent across all states) ─── */}
          <div className="shrink-0 px-3 sm:px-4 pb-3 sm:pb-4 pt-1">
            <div className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full" style={{ background: AI_BUBBLE_BG, border: `1px solid oklch(0.28 0.005 155)` }}>
              <div className="h-2 w-24 sm:w-32 rounded" style={{ background: 'oklch(0.28 0.005 155)' }} />
              <div className="ml-auto w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: GREEN }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
                </svg>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Typing dots animation (CSS-only) */}
      <style>{`
        .typing-dot {
          animation: typingPulse 1.2s ease-in-out infinite;
        }
        @keyframes typingPulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(0.85); }
          30% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}


// ─── Sub-components ──────────────────────────────────────────

function AiAvatar() {
  return (
    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full shrink-0 flex items-center justify-center" style={{ background: AVATAR_RING }}>
      <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: GREEN }} />
    </div>
  );
}

function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex justify-end">
      <div className="px-3 py-2 rounded-2xl rounded-br-sm max-w-[80%]" style={{ background: USER_BUBBLE_BG }}>
        <span className="text-[10px] sm:text-xs text-gray-300">{text}</span>
      </div>
    </div>
  );
}

function MiniBar({ height, index }: { height: MotionValue<number>; index: number }) {
  const h = useTransform(height, (v) => `${v}%`);
  const opacity = 0.5 + (index / 8) * 0.5;

  return (
    <motion.div
      className="w-full rounded-t"
      style={{ height: h, background: ACCENT, opacity }}
    />
  );
}

function FileCard({ progressWidth }: { progressWidth: MotionValue<number> }) {
  const width = useTransform(progressWidth, (v) => `${v}%`);

  return (
    <div className="rounded-lg p-2.5 sm:p-3 flex items-center gap-2.5" style={{ background: N900 }}>
      {/* File icon */}
      <div className="w-8 h-10 sm:w-9 sm:h-11 shrink-0 rounded relative" style={{ background: N800 }}>
        <svg className="absolute inset-0 w-full h-full p-1.5" viewBox="0 0 24 30" fill="none">
          <path d="M3 2C3 0.9 3.9 0 5 0H15L21 6V28C21 29.1 20.1 30 19 30H5C3.9 30 3 29.1 3 28V2Z" fill="oklch(0.28 0.005 155)" />
          <path d="M15 0L21 6H17C15.9 6 15 5.1 15 4V0Z" fill="oklch(0.35 0.005 155)" />
          <rect x="6" y="12" width="12" height="1.5" rx="0.75" fill="oklch(0.40 0.005 155)" />
          <rect x="6" y="16" width="9" height="1.5" rx="0.75" fill="oklch(0.40 0.005 155)" />
          <rect x="6" y="20" width="10" height="1.5" rx="0.75" fill="oklch(0.40 0.005 155)" />
        </svg>
      </div>
      {/* File info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="text-[10px] sm:text-xs text-white truncate">Inventario_Mar2026.xlsx</div>
        <div className="text-[8px] sm:text-[9px]" style={{ color: N700 }}>2.4 MB</div>
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: N800 }}>
          <motion.div className="h-full rounded-full" style={{ width, background: GREEN }} />
        </div>
      </div>
      {/* Download icon */}
      <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: 'oklch(0.20 0.04 155)' }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14"/><path d="m5 12 7 7 7-7"/>
        </svg>
      </div>
    </div>
  );
}

function PlatformBadge({ label, color, scale }: { label: string; color: string; scale: MotionValue<number> }) {
  return (
    <motion.div
      className="flex items-center gap-2"
      style={{ scale, opacity: scale }}
    >
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md" style={{ background: N900 }}>
        <div className="w-2 h-2 rounded-full" style={{ background: color }} />
        <span className="text-[9px] sm:text-[10px] font-medium" style={{ color }}>{label}</span>
      </div>
      {/* Checkmark */}
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12l5 5L20 7"/>
      </svg>
    </motion.div>
  );
}
