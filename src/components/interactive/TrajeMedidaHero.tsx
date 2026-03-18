import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

const GREEN = '#69E185';
const TEAL = 'oklch(0.75 0.14 195)';
const BLUE = 'oklch(0.72 0.14 240)';
const AMBER = 'oklch(0.78 0.14 75)';
const MAGENTA = 'oklch(0.72 0.15 340)';
const INDIGO = 'oklch(0.68 0.15 290)';
const N800 = 'oklch(0.22 0.005 155)';
const CARD_BG = 'oklch(0.14 0.005 155)';

// Modules with PILED positions (overlapping, chaotic)
const allModules = [
  { name: 'Pagos', color: GREEN, x: -15, y: -85, rot: -12, z: 8, selected: true },
  { name: 'Ordenes', color: GREEN, x: 55, y: -100, rot: 15, z: 3, selected: false },
  { name: 'Inventario', color: AMBER, x: -60, y: -40, rot: 6, z: 9, selected: true },
  { name: 'Staff', color: BLUE, x: 85, y: -55, rot: -8, z: 2, selected: false },
  { name: 'IA', color: TEAL, x: -85, y: 20, rot: -18, z: 7, selected: true },
  { name: 'CRM', color: BLUE, x: 25, y: -15, rot: 10, z: 10, selected: true },
  { name: 'Reportes', color: MAGENTA, x: -90, y: -85, rot: 20, z: 1, selected: false },
  { name: 'Promos', color: AMBER, x: 95, y: 15, rot: -14, z: 4, selected: false },
  { name: 'Reservas', color: INDIGO, x: 65, y: 60, rot: 8, z: 6, selected: true },
  { name: 'Lealtad', color: GREEN, x: -40, y: 75, rot: -6, z: 2, selected: false },
  { name: 'Menu', color: GREEN, x: 25, y: 90, rot: 12, z: 5, selected: true },
  { name: 'Turnos', color: BLUE, x: -80, y: 80, rot: -22, z: 1, selected: false },
];

const selected = allModules.filter(m => m.selected);
const grid = [
  { x: -98, y: -98 }, { x: 0, y: -98 }, { x: 98, y: -98 },
  { x: -98, y: 0 }, { x: 0, y: 0 }, { x: 98, y: 0 },
];

// ─── Square Cube ────────────────────────────────────
function Cube({ mod, index, progress }: {
  mod: typeof allModules[0]; index: number; progress: MotionValue<number>;
}) {
  const isSel = mod.selected;
  const si = isSel ? selected.indexOf(mod) : -1;
  const gp = si >= 0 ? grid[si] : null;

  const x = useTransform(progress, [0, 0.30, 0.55], [mod.x, mod.x, gp ? gp.x : mod.x * 2]);
  const y = useTransform(progress, [0, 0.30, 0.55], [mod.y, mod.y, gp ? gp.y : mod.y * 2]);
  const rotate = useTransform(progress, [0, 0.30, 0.55], [mod.rot, mod.rot, 0]);
  const opacity = useTransform(progress,
    isSel ? [0, 1] : [0.12, 0.30],
    isSel ? [1, 1] : [0.65, 0]
  );
  const scale = useTransform(progress,
    isSel ? [0.28, 0.36, 0.50, 0.56] : [0.12, 0.28],
    isSel ? [1, 1.05, 1.05, 0.92] : [0.95, 0.3]
  );
  const borderColor = useTransform(progress, (v) =>
    isSel && v > 0.24 ? `${mod.color}40` : N800
  );
  const shadow = useTransform(progress, (v) =>
    isSel && v > 0.28 ? `0 0 16px ${mod.color}15` : 'none'
  );

  return (
    <motion.div
      className="absolute rounded-2xl flex flex-col items-center justify-center gap-1.5"
      style={{
        x, y, rotate, opacity, scale,
        background: CARD_BG,
        border: '1px solid',
        borderColor,
        boxShadow: shadow,
        width: '90px', height: '90px',
        left: '50%', top: '50%',
        marginLeft: '-45px', marginTop: '-45px',
        zIndex: mod.z,
      }}
    >
      <div className="w-5 h-5 rounded-full" style={{ background: mod.color }} />
      <span className="text-[10px] font-medium text-white leading-none">{mod.name}</span>
    </motion.div>
  );
}

// ─── Custom Cube ────────────────────────────────────
function CustomCube({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.60, 0.70], [0, 1]);
  const scale = useTransform(progress, [0.60, 0.70, 0.75], [0.3, 1.08, 1]);
  const glow = useTransform(progress, [0.70, 0.80], [
    '0 0 0px transparent',
    `0 0 28px ${GREEN}30, 0 0 56px ${GREEN}10`
  ]);

  return (
    <motion.div
      className="absolute rounded-2xl flex flex-col items-center justify-center gap-1"
      style={{
        opacity, scale,
        boxShadow: glow,
        background: 'oklch(0.15 0.01 155)',
        border: `1px solid ${GREEN}45`,
        width: '96px', height: '96px',
        left: '50%', top: '50%',
        marginLeft: '-48px', marginTop: '52px',
        zIndex: 20,
      }}
    >
      <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${GREEN}20` }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </div>
      <span className="text-[10px] font-semibold" style={{ color: GREEN }}>Custom</span>
    </motion.div>
  );
}

function ConnectionLine({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.68, 0.78], [0, 0.3]);
  return (
    <motion.div className="absolute" style={{
      opacity, left: '50%', top: '50%',
      width: '1px', height: '22px',
      marginLeft: '-0.5px', marginTop: '8px',
      background: `linear-gradient(180deg, ${GREEN}40, ${GREEN}08)`,
      zIndex: 15,
    }} />
  );
}

// ─── Narrative text — LEFT SIDE, changes per phase ──
function PhaseText({ progress }: { progress: MotionValue<number> }) {
  const p1 = useTransform(progress, [0, 0.01, 0.12, 0.16], [1, 1, 1, 0]);
  const p2 = useTransform(progress, [0.18, 0.24, 0.30, 0.34], [0, 1, 1, 0]);
  const p3 = useTransform(progress, [0.38, 0.44, 0.56, 0.60], [0, 1, 1, 0]);
  const p4 = useTransform(progress, [0.64, 0.70, 0.90, 1], [0, 1, 1, 1]);

  return (
    <div className="relative h-6 mb-6">
      <motion.p className="absolute inset-0 text-sm text-gray-500" style={{ opacity: p1 }}>
        Mas de 30 modulos listos para usar.
      </motion.p>
      <motion.p className="absolute inset-0 text-sm font-medium" style={{ opacity: p2, color: GREEN }}>
        Escoge solo los que necesitas.
      </motion.p>
      <motion.p className="absolute inset-0 text-sm font-medium" style={{ opacity: p3, color: BLUE }}>
        Se organizan en tu solucion.
      </motion.p>
      <motion.p className="absolute inset-0 text-sm font-medium" style={{ opacity: p4, color: GREEN }}>
        Y lo que falta, lo creamos.
      </motion.p>
    </div>
  );
}

// ─── Main ───────────────────────────────────────────
export default function TrajeMedidaHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const badgesOp = useTransform(scrollYProgress, [0.72, 0.82], [0, 1]);
  const badgesY = useTransform(scrollYProgress, [0.72, 0.82], [10, 0]);
  const ctaOp = useTransform(scrollYProgress, [0.80, 0.90], [0, 1]);

  return (
    <div ref={containerRef} className="relative bg-black" style={{ height: '400vh' }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-center">

            {/* ─── Left ─── */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-px w-8" style={{ background: `linear-gradient(90deg, ${GREEN}, transparent)` }} />
                <span className="text-xs uppercase tracking-widest font-semibold text-avoqado-green">Traje a la medida</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light tracking-tight text-white mb-4 leading-tight">
                Tu negocio es unico.<br/>
                <span className="text-avoqado-green">Tu software tambien.</span>
              </h1>

              <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-4 max-w-lg">
                Escoge los modulos que necesitas, los ensamblamos para tu operacion, y creamos lo que falta.
              </p>

              {/* Phase narration — changes with scroll */}
              <PhaseText progress={scrollYProgress} />

              {/* Badges */}
              <motion.div className="flex flex-col gap-2.5 mb-6" style={{ opacity: badgesOp, y: badgesY }}>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full w-fit" style={{ background: CARD_BG, border: `1px solid ${N800}` }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-avoqado-green animate-pulse" />
                  <span className="text-xs text-white font-medium">Entrega en 48 horas promedio</span>
                  <span className="text-[10px] text-gray-500">— porque no empezamos de cero</span>
                </div>
                <div className="flex items-center gap-2.5 px-4 py-2 rounded-full w-fit" style={{ background: CARD_BG, border: `1px solid ${N800}` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: BLUE }} />
                  <span className="text-xs text-white font-medium">Funciona en 6 plataformas</span>
                  <span className="text-[10px] text-gray-500">— iOS, Android, Web, Terminal, Widget, Kiosko</span>
                </div>
              </motion.div>

              {/* CTAs */}
              <motion.div className="flex flex-wrap gap-3" style={{ opacity: ctaOp }}>
                <a href="/contact" className="px-6 py-3 rounded-full bg-avoqado-green text-black text-sm font-semibold hover:bg-green-400 transition-colors">
                  Agendar llamada
                </a>
                <a href="https://wa.me/525640070001?text=Hola%2C%20me%20interesa%20desarrollo%20a%20la%20medida%20con%20Avoqado" target="_blank" rel="noopener noreferrer"
                  className="px-6 py-3 rounded-full border border-white/15 text-white text-sm font-medium hover:bg-white/5 transition-colors flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </motion.div>
            </div>

            {/* ─── Right: Square Cubes ─── */}
            <div className="flex items-center justify-center">
              <div className="relative" style={{ width: '380px', height: '380px' }}>
                {allModules.map((mod, i) => (
                  <Cube key={mod.name} mod={mod} index={i} progress={scrollYProgress} />
                ))}
                <ConnectionLine progress={scrollYProgress} />
                <CustomCube progress={scrollYProgress} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
