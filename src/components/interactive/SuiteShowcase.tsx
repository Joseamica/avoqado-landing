import { useRef, type ReactNode } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

const GREEN = '#69E185';
const BLUE = 'oklch(0.72 0.14 240)';
const INDIGO = 'oklch(0.68 0.15 290)';
const AMBER = 'oklch(0.78 0.14 75)';
const TEAL = 'oklch(0.75 0.14 195)';
const MAGENTA = 'oklch(0.72 0.15 340)';
const N = (l: number) => `oklch(${l} 0.005 155)`;

// ─── Animated Split Panel ───────────────────────────
// Each product gets unique entrance animations for its 2 panels
function AnimatedPanel({ children, progress, start, from, label, color }: {
  children: ReactNode; progress: MotionValue<number>;
  start: number; from: 'left' | 'right' | 'top' | 'bottom' | 'scale' | 'rotate';
  label: string; color: string;
}) {
  const fadeIn = start + 0.015;
  const opacity = useTransform(progress, [start, fadeIn + 0.02], [0, 1]);

  const x = from === 'left' ? useTransform(progress, [start, fadeIn + 0.03], [-80, 0]) :
            from === 'right' ? useTransform(progress, [start, fadeIn + 0.03], [80, 0]) :
            useTransform(progress, [start, fadeIn], [0, 0]);
  const y = from === 'top' ? useTransform(progress, [start, fadeIn + 0.03], [-60, 0]) :
            from === 'bottom' ? useTransform(progress, [start, fadeIn + 0.03], [60, 0]) :
            useTransform(progress, [start, fadeIn], [0, 0]);
  const scale = from === 'scale' ? useTransform(progress, [start, fadeIn + 0.03], [0.7, 1]) :
                useTransform(progress, [start, fadeIn], [1, 1]);
  const rotate = from === 'rotate' ? useTransform(progress, [start, fadeIn + 0.03], [-8, 0]) :
                 useTransform(progress, [start, fadeIn], [0, 0]);

  return (
    <motion.div className="flex-1 min-w-0" style={{ opacity, x, y, scale, rotate }}>
      <div className="rounded-xl overflow-hidden h-full" style={{ background: N(0.11), border: `1px solid ${N(0.20)}` }}>
        <div className="px-3 py-2" style={{ borderBottom: `1px solid ${N(0.16)}` }}>
          <span className="text-[9px] font-medium" style={{ color }}>{label}</span>
        </div>
        <div className="p-3">{children}</div>
      </div>
    </motion.div>
  );
}

// ─── Product Section (title + 2 animated panels) ───
// Positions where past cards drift to (corners/edges, out of the way)
const STACK_POSITIONS = [
  { x: -280, y: -120 },
  { x: 300, y: -100 },
  { x: -300, y: 140 },
  { x: 320, y: 120 },
  { x: -260, y: 20 },
  { x: 280, y: -20 },
];

// Final grid positions (3x2 centered) for the end state
const GRID_FINAL = [
  { x: -230, y: -90 },  // row 1
  { x: 0, y: -90 },
  { x: 230, y: -90 },
  { x: -230, y: 90 },   // row 2
  { x: 0, y: 90 },
  { x: 230, y: 90 },
];
const FINAL_START = 0.88; // when grid mode begins

function ProductSection({ product, progress, rangeStart, index }: {
  product: typeof products[0]; progress: MotionValue<number>; rangeStart: number; index: number;
}) {
  const DURATION = 0.12;
  const mid = rangeStart + DURATION * 0.3;
  const end = rangeStart + DURATION;
  const stackPos = STACK_POSITIONS[index % STACK_POSITIONS.length];
  const gridPos = GRID_FINAL[index];

  // Opacity
  const sectionOp = useTransform(progress, (v) => {
    if (v < rangeStart - 0.01) return 0;
    if (v < rangeStart + 0.02) return (v - (rangeStart - 0.01)) / 0.03;
    if (v < end) return 1;
    if (v >= FINAL_START) return 1; // fully visible in grid
    const past = Math.min((v - end) / DURATION, 5);
    return Math.max(0.5 - past * 0.1, 0.15);
  });

  // Scale
  const sectionScale = useTransform(progress, (v) => {
    if (v < rangeStart) return 0.9;
    if (v < rangeStart + 0.02) return 0.9 + ((v - rangeStart) / 0.02) * 0.1;
    if (v < end) return 1;
    if (v >= FINAL_START) {
      // Transition to grid size
      const t = Math.min((v - FINAL_START) / 0.06, 1);
      const stackScale = 0.28;
      return stackScale + (0.42 - stackScale) * t; // grow to grid size 0.42
    }
    const past = Math.min((v - end) / DURATION, 5);
    return Math.max(0.35 - past * 0.03, 0.20);
  });

  // Position
  const sectionX = useTransform(progress, (v) => {
    if (v < end) return 0;
    if (v >= FINAL_START) {
      // Transition from stack pos to grid pos
      const t = Math.min((v - FINAL_START) / 0.06, 1);
      const fromX = stackPos.x;
      return fromX + (gridPos.x - fromX) * t;
    }
    const t = Math.min((v - end) / (DURATION * 0.5), 1);
    return stackPos.x * t;
  });
  const sectionY = useTransform(progress, (v) => {
    if (v < rangeStart) return 50;
    if (v < rangeStart + 0.02) return 50 * (1 - (v - rangeStart) / 0.02);
    if (v < end) return 0;
    if (v >= FINAL_START) {
      const t = Math.min((v - FINAL_START) / 0.06, 1);
      const fromY = stackPos.y;
      return fromY + (gridPos.y - fromY) * t;
    }
    const t = Math.min((v - end) / (DURATION * 0.5), 1);
    return stackPos.y * t;
  });

  const zIndex = useTransform(progress, (v) => {
    if (v >= FINAL_START) return 15; // all same level in grid
    if (v >= rangeStart && v < end) return 20;
    if (v >= end) return 10 - Math.min(Math.floor((v - end) / DURATION), 9);
    return 0;
  });

  // Title: visible when active OR in final grid
  const titleOp = useTransform(progress, (v) => {
    if (v >= FINAL_START) {
      return Math.min((v - FINAL_START) / 0.04, 1); // fade in for grid
    }
    if (v >= rangeStart && v < end) {
      if (v < rangeStart + 0.015) return (v - rangeStart) / 0.015;
      if (v > end - 0.02) return (end - v) / 0.02;
      return 1;
    }
    return 0;
  });
  const linkOp = useTransform(progress, (v) => {
    if (v >= FINAL_START) return Math.min((v - FINAL_START) / 0.04, 1);
    if (v >= mid + 0.02 && v < end - 0.02) return Math.min((v - (mid + 0.02)) / 0.02, 1);
    if (v >= end - 0.02 && v < end) return (end - v) / 0.02;
    return 0;
  });

  // Only allow clicks when active or in final grid
  const pointerEvents = useTransform(progress, (v): string => {
    if (v >= rangeStart && v < end) return 'auto'; // active
    if (v >= FINAL_START) return 'auto'; // grid
    return 'none'; // stacked behind — don't block clicks
  });

  return (
    <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: sectionOp, scale: sectionScale, x: sectionX, y: sectionY, zIndex, pointerEvents }}>
      <a href={product.href} className="block w-full max-w-[680px] mx-auto rounded-2xl p-5 sm:p-6 hover:-translate-y-1 transition-transform duration-200" style={{ background: 'oklch(0.08 0.005 155)', border: `1px solid ${product.color}20`, boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
        {/* Title — only visible when active */}
        <motion.div className="flex items-center gap-3 mb-4" style={{ opacity: titleOp }}>
          <div className="w-3 h-3 rounded-full shrink-0" style={{ background: product.color, boxShadow: `0 0 12px ${product.color}50` }} />
          <span className="text-[10px] font-mono" style={{ color: N(0.55) }}>{product.num}</span>
          <span className="text-base sm:text-lg font-medium text-white">{product.name}</span>
          <span className="text-[10px] sm:text-[11px] hidden sm:inline" style={{ color: N(0.65) }}>{product.desc}</span>
        </motion.div>

        {/* Split panels */}
        <div className="flex flex-col sm:flex-row gap-3">
          <AnimatedPanel progress={progress} start={rangeStart + 0.01} from={product.leftAnim} label={product.leftLabel} color={product.color}>
            {product.leftContent}
          </AnimatedPanel>
          <AnimatedPanel progress={progress} start={mid} from={product.rightAnim} label={product.rightLabel} color={product.color}>
            {product.rightContent}
          </AnimatedPanel>
        </div>

        {/* Link hint — only visible when active */}
        <motion.div className="flex justify-center mt-4" style={{ opacity: linkOp }}>
          <span className="text-[11px] font-medium flex items-center gap-1" style={{ color: product.color }}>
            Explorar {product.name}
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </span>
        </motion.div>
      </a>
    </motion.div>
  );
}

// ─── Product data with content ──────────────────────
const products = [
  {
    num: '01', name: 'Dashboard Web', desc: 'Control central de tu negocio', color: BLUE, href: '/productos/dashboard',
    leftLabel: 'Analytics', rightLabel: 'Inventario',
    leftAnim: 'left' as const, rightAnim: 'right' as const,
    leftContent: (
      <>
        <div className="flex gap-1.5 mb-2">
          {[{l:'Ventas',v:'$24,850',c:BLUE},{l:'Ordenes',v:'127',c:GREEN},{l:'Ticket',v:'$195',c:AMBER}].map((k,i) => (
            <div key={i} className="flex-1 p-2 rounded-lg" style={{background:N(0.14)}}>
              <div className="text-[7px]" style={{color:N(0.55)}}>{k.l}</div>
              <div className="text-xs font-semibold" style={{color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-lg p-2" style={{background:N(0.14)}}>
          <div className="text-[7px] mb-1" style={{color:N(0.55)}}>Ventas semanal</div>
          <div className="flex items-end gap-1 h-[65px]">
            {[35,55,40,75,50,85,65].map((h,i) => <div key={i} className="flex-1 rounded-t" style={{height:`${h}%`,background:BLUE,opacity:0.4+i*0.08}}/>)}
          </div>
        </div>
      </>
    ),
    rightContent: (
      <div className="space-y-1.5">
        {[{n:'Crema facial 50ml',s:85,c:GREEN},{n:'Aceite de argán',s:12,c:'oklch(0.65 0.20 25)'},{n:'Gel UV constructor',s:8,c:'oklch(0.65 0.20 25)'},{n:'Toallas desechables',s:62,c:GREEN},{n:'Shampoo profesional',s:71,c:GREEN}].map((item,i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded" style={{background:item.s<15?'oklch(0.16 0.02 25)':N(0.14)}}>
            <span className="text-[8px] text-white flex-1 truncate">{item.n}</span>
            <div className="w-12 h-1.5 rounded-full overflow-hidden" style={{background:N(0.22)}}><div className="h-full rounded-full" style={{width:`${item.s}%`,background:item.c}}/></div>
            <span className="text-[7px] w-6 text-right" style={{color:item.c}}>{item.s}%</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    num: '02', name: 'Avoqado TPV', desc: 'Ordena y cobra al instante', color: GREEN, href: '/productos/tpv',
    leftLabel: 'Orden', rightLabel: 'Cobro',
    leftAnim: 'top' as const, rightAnim: 'bottom' as const,
    leftContent: (
      <div className="space-y-1.5">
        {[{n:'Membresía mensual',p:'$899'},{n:'10 clases spinning',p:'$1,200'},{n:'Batido proteína',p:'$85'}].map((item,i) => (
          <div key={i} className="flex items-center justify-between p-2 rounded-lg" style={{background:N(0.14)}}>
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold" style={{background:N(0.20),color:GREEN}}>{i===0?'1':i===2?'1':'1'}</div>
              <span className="text-[9px] text-white">{item.n}</span>
            </div>
            <span className="text-[9px] text-white">{item.p}</span>
          </div>
        ))}
        <div className="flex justify-between pt-1.5" style={{borderTop:`1px solid ${N(0.20)}`}}>
          <span className="text-[8px]" style={{color:N(0.55)}}>3 items</span>
          <span className="text-base font-light text-white">$2,184</span>
        </div>
      </div>
    ),
    rightContent: (
      <div className="flex flex-col h-full">
        <div className="text-center mb-3"><div className="text-2xl font-light text-white">$2,184</div><div className="text-[8px]" style={{color:N(0.55)}}>Total</div></div>
        <div className="space-y-1.5 flex-1">
          {['Tarjeta (NFC/Chip)','Codigo QR','Efectivo'].map((m,i) => (
            <div key={m} className="py-2 rounded-lg text-center text-[9px] font-medium" style={{background:i===0?GREEN:N(0.16),color:i===0?'#000':N(0.45),border:i===0?'none':`1px solid ${N(0.22)}`}}>{m}</div>
          ))}
        </div>
        <div className="mt-2 py-2 rounded-xl text-center text-[10px] font-semibold text-black" style={{background:GREEN}}>Cobrar $2,184</div>
      </div>
    ),
  },
  {
    num: '03', name: 'Avoqado POS', desc: 'Gestiona citas y agenda', color: INDIGO, href: '/productos/pos',
    leftLabel: 'Espacios', rightLabel: 'Agenda de citas',
    leftAnim: 'scale' as const, rightAnim: 'rotate' as const,
    leftContent: (
      <>
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          {['Sala 1','Sala 2','Cabina A','Cabina B','Estación 1','Estación 2'].map((m,i) => {
            const st=['occupied','occupied','free','reserved','free','occupied'][i];
            const c={occupied:{bg:`${INDIGO}15`,b:`${INDIGO}40`,t:INDIGO},free:{bg:N(0.14),b:N(0.20),t:N(0.40)},reserved:{bg:`${AMBER}10`,b:`${AMBER}30`,t:AMBER}}[st]!;
            return <div key={i} className="aspect-square rounded-lg flex flex-col items-center justify-center" style={{background:c.bg,border:`1px solid ${c.b}`}}>
              <span className="text-[7px] font-medium text-center leading-tight" style={{color:c.t}}>{m}</span>
              <span className="text-[6px]" style={{color:c.t}}>{st==='occupied'?'En cita':st==='reserved'?'11:00':''}</span>
            </div>;
          })}
        </div>
        <div className="flex gap-2">
          {[{l:'Ocupado',c:INDIGO},{l:'Libre',c:N(0.40)},{l:'Reserv.',c:AMBER}].map((s,i) => (
            <div key={i} className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full" style={{background:s.c}}/><span className="text-[7px]" style={{color:N(0.55)}}>{s.l}</span></div>
          ))}
        </div>
      </>
    ),
    rightContent: (
      <>
        <div className="text-[8px] mb-1.5" style={{color:INDIGO}}>Marzo 2026</div>
        <div className="grid grid-cols-7 gap-0.5 mb-0.5">{['L','M','X','J','V','S','D'].map(d=><div key={d} className="text-center text-[6px]" style={{color:N(0.35)}}>{d}</div>)}</div>
        <div className="grid grid-cols-7 gap-0.5 mb-2">
          {[16,17,18,19,20,21,22].map(d=>(
            <div key={d} className="aspect-square rounded flex items-center justify-center text-[7px]" style={{background:d===18?INDIGO:d===20?`${AMBER}30`:N(0.16),color:d===18?'#000':d===20?AMBER:'white',fontWeight:d===18?600:400}}>{d}</div>
          ))}
        </div>
        <div className="space-y-1">
          {[{t:'10:00',n:'Sala 1 — Corte + color'},{t:'11:30',n:'Cabina A — Facial'},{t:'12:00',n:'Estación 2 — Uñas'}].map((r,i)=>(
            <div key={i} className="flex items-center gap-2 p-1.5 rounded" style={{background:N(0.16)}}>
              <span className="text-[7px] font-mono" style={{color:INDIGO}}>{r.t}</span>
              <span className="text-[8px] text-white">{r.n}</span>
            </div>
          ))}
        </div>
      </>
    ),
  },
  {
    num: '04', name: 'Avoqado QR', desc: 'Tu cliente paga sin app', color: AMBER, href: '/productos/qr',
    leftLabel: 'Escanear', rightLabel: 'Pagar',
    leftAnim: 'left' as const, rightAnim: 'scale' as const,
    leftContent: (
      <div className="flex flex-col items-center py-2">
        <div className="w-28 h-28 rounded-2xl p-3 mb-3" style={{border:`2px solid ${AMBER}`}}>
          <div className="w-full h-full grid grid-cols-5 grid-rows-5 gap-1">
            {Array.from({length:25}).map((_,i) => {
              const isCorner = (i < 2 || (i >= 3 && i < 5)) && (Math.floor(i/5) < 2) ||
                               (i % 5 >= 3 && Math.floor(i/5) < 2) ||
                               (i % 5 < 2 && Math.floor(i/5) >= 3);
              return <div key={i} className="rounded-sm" style={{
                background: isCorner ? `oklch(0.50 0.08 75)` : i%3===0 ? `oklch(0.30 0.04 75)` : `oklch(0.40 0.06 75)`,
                opacity: isCorner ? 1 : 0.5 + (i%4)*0.15,
              }}/>;
            })}
          </div>
        </div>
        <span className="text-[11px] text-white mb-0.5">Escanea el codigo QR</span>
        <span className="text-[8px]" style={{color:N(0.55)}}>Sin descargar app</span>
      </div>
    ),
    rightContent: (
      <div className="space-y-1.5">
        {[{n:'Blusa bordada',p:'$890'},{n:'Aretes artesanales',p:'$350'},{n:'Bolsa de piel',p:'$1,450'}].map((item,i)=>(
          <div key={i} className="flex justify-between p-2 rounded text-[9px]" style={{background:N(0.14)}}>
            <span className="text-white">{item.n}</span><span style={{color:AMBER}}>{item.p}</span>
          </div>
        ))}
        <div className="flex justify-between pt-1.5" style={{borderTop:`1px solid ${N(0.20)}`}}>
          <span className="text-[8px]" style={{color:N(0.55)}}>Total</span>
          <span className="text-sm text-white">$2,690</span>
        </div>
        <div className="py-2 rounded-lg text-center text-[10px] font-semibold text-black" style={{background:AMBER}}>Pagar $2,690</div>
      </div>
    ),
  },
  {
    num: '05', name: 'Asistente IA', desc: 'Pregunta, visualiza, actua', color: TEAL, href: '/productos/ai',
    leftLabel: 'Preguntas', rightLabel: 'Respuestas',
    leftAnim: 'bottom' as const, rightAnim: 'top' as const,
    leftContent: (
      <div className="space-y-2">
        {['Cuanto vendi esta semana?','Genera la grafica de ventas','Exporta reporte a Excel'].map((q,i)=>(
          <div key={i} className="px-3 py-2 rounded-xl text-[9px] text-white" style={{background:N(0.18)}}>{q}</div>
        ))}
      </div>
    ),
    rightContent: (
      <div className="space-y-2">
        <div className="text-[9px]" style={{color:N(0.60)}}><span style={{color:TEAL}}>$148,500</span> esta semana. +12% vs anterior.</div>
        <div className="rounded-lg p-2" style={{background:N(0.14)}}>
          <div className="flex items-end gap-1 h-[55px]">
            {[40,55,50,65,85,60,45].map((h,i)=><div key={i} className="flex-1 rounded-t" style={{height:`${h}%`,background:TEAL,opacity:0.5+i*0.07}}/>)}
          </div>
          <div className="flex justify-between mt-1">{['L','M','X','J','V','S','D'].map(d=><span key={d} className="text-[5px] flex-1 text-center" style={{color:N(0.35)}}>{d}</span>)}</div>
        </div>
        <div className="flex items-center gap-1.5 p-2 rounded" style={{background:N(0.14)}}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={TEAL} strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 7h10M7 12h10M7 17h6"/></svg>
          <span className="text-[8px]" style={{color:TEAL}}>Ventas_Semanal.xlsx</span>
        </div>
      </div>
    ),
  },
  {
    num: '06', name: 'Avoqado Widget', desc: 'Tu negocio en cualquier sitio', color: MAGENTA, href: '/productos/widget',
    leftLabel: 'Tu pagina web', rightLabel: 'Widget embebido',
    leftAnim: 'rotate' as const, rightAnim: 'left' as const,
    leftContent: (
      <div>
        <div className="flex items-center gap-1 mb-2">
          <div className="w-1.5 h-1.5 rounded-full" style={{background:'oklch(0.40 0.15 25)'}}/><div className="w-1.5 h-1.5 rounded-full" style={{background:'oklch(0.60 0.15 85)'}}/><div className="w-1.5 h-1.5 rounded-full" style={{background:'oklch(0.55 0.15 145)'}}/>
          <span className="text-[7px] ml-1" style={{color:N(0.55)}}>miestudio.com.mx</span>
        </div>
        <div className="rounded-lg p-2.5" style={{background:'oklch(0.94 0.005 75)'}}>
          <div className="h-2 w-16 rounded mb-1.5" style={{background:'oklch(0.80 0.005 75)'}}/>
          <div className="h-1 w-full rounded mb-1" style={{background:'oklch(0.86 0.005 75)'}}/>
          <div className="h-1 w-3/4 rounded mb-2.5" style={{background:'oklch(0.86 0.005 75)'}}/>
          <div className="h-14 w-full rounded-lg" style={{background:'oklch(0.88 0.005 75)'}}/>
        </div>
      </div>
    ),
    rightContent: (
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 mb-1"><div className="w-3.5 h-3.5 rounded-full" style={{background:GREEN}}/><span className="text-[9px] text-white font-medium">Ordenar</span></div>
        {['Clase cycling','Asesoría nutricional','Paquete 10 sesiones'].map((item,i)=>(
          <div key={i} className="flex justify-between p-2 rounded text-[8px]" style={{background:N(0.14)}}>
            <span className="text-white">{item}</span><span style={{color:GREEN}}>{['$250','$600','$2,000'][i]}</span>
          </div>
        ))}
        <div className="py-2 rounded-lg text-center text-[9px] font-semibold text-black" style={{background:GREEN}}>Pagar $2,850</div>
      </div>
    ),
  },
];

// ─── Main Component ─────────────────────────────────
export default function SuiteShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });

  const titleOp = useTransform(scrollYProgress, [0, 0.04], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.04], [20, 0]);

  // Each product gets ~14% of scroll range, starting at 5%
  const STEP = 0.14;
  const ctaOp = useTransform(scrollYProgress, [0.92, 0.97], [0, 1]);

  return (
    <div ref={containerRef} className="relative bg-white" style={{ height: '600vh' }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex flex-col items-center justify-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6">

          {/* Title — always visible */}
          <motion.div className="text-center mb-6" style={{ opacity: titleOp, y: titleY }}>
            <p className="text-avoqado-green text-xs font-semibold tracking-widest uppercase mb-2">Ecosistema</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-black mb-2">
              Seis productos. <span className="text-avoqado-green">Un ecosistema.</span>
            </h2>
          </motion.div>

          {/* Product sections — each crossfades in its scroll range */}
          <div className="relative" style={{ minHeight: '360px' }}>
            {products.map((product, i) => (
              <ProductSection
                key={product.num}
                product={product}
                progress={scrollYProgress}
                rangeStart={0.05 + i * STEP}
                index={i}
              />
            ))}
          </div>

          {/* CTA */}
          <motion.div className="text-center mt-4" style={{ opacity: ctaOp }}>
            <a href="/productos" className="inline-flex items-center gap-2 text-sm font-medium text-avoqado-green hover:underline">
              Explorar todos los productos
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
