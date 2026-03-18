import { useRef } from 'react';
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion';

const MAGENTA = 'oklch(0.72 0.15 340)';
const GREEN = '#69E185';
const AMBER = 'oklch(0.78 0.14 75)';
const TEAL = 'oklch(0.75 0.14 195)';
const N600 = 'oklch(0.40 0.005 155)';
const N700 = 'oklch(0.30 0.005 155)';
const N800 = 'oklch(0.22 0.005 155)';
const N900 = 'oklch(0.16 0.005 155)';
const CARD_BG = 'oklch(0.14 0.005 155)';
const LABEL_BG = 'oklch(0.12 0.005 155)';
const PAGE_BG = 'oklch(0.96 0.005 75)';

const platforms = ['WordPress', 'Shopify', 'Wix', 'Squarespace', 'Custom HTML'];

const steps = [
  { num: '01', title: 'Copia el codigo', desc: 'Snippet de 4 lineas desde tu dashboard.', color: MAGENTA, icon: 'copy' },
  { num: '02', title: 'Pegalo en tu sitio', desc: 'Antes de </body>. Cualquier plataforma.', color: MAGENTA, icon: 'code' },
  { num: '03', title: 'Ordenes en vivo', desc: 'Tus clientes piden y pagan desde tu pagina.', color: GREEN, icon: 'cart' },
  { num: '04', title: 'Reservaciones y citas', desc: 'Clases, servicios, mesas — todo desde tu sitio.', color: TEAL, icon: 'calendar' },
];

// ─── Icons ──────────────────────────────────────────
function StepIcon({ type, color }: { type: string; color: string }) {
  const bg = type === 'calendar' ? 'oklch(0.18 0.02 195)' :
             type === 'cart' || type === 'check' ? 'oklch(0.18 0.02 155)' : 'oklch(0.18 0.02 340)';
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: bg, color }}>
      {type === 'copy' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>}
      {type === 'code' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>}
      {type === 'cart' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>}
      {type === 'calendar' && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
    </div>
  );
}

// ─── Timeline Dot ───────────────────────────────────
function TimelineDot({ progress, activateAt, completeAt, color }: {
  progress: MotionValue<number>; activateAt: number; completeAt: number; color: string;
}) {
  const bg = useTransform(progress, (v) => v >= completeAt ? GREEN : v >= activateAt ? color : CARD_BG);
  const border = useTransform(progress, (v) => v >= completeAt ? GREEN : v >= activateAt ? color : N800);
  const shadow = useTransform(progress, (v) =>
    v >= activateAt && v < completeAt ? `0 0 12px oklch(0.72 0.15 340 / 0.5)` :
    v >= completeAt ? `0 0 8px oklch(0.78 0.18 155 / 0.3)` : 'none'
  );
  const scale = useTransform(progress, [activateAt - 0.01, activateAt, activateAt + 0.015], [1, 1.3, 1]);

  return (
    <motion.div className="absolute left-[9px] w-[12px] h-[12px] rounded-full" style={{
      background: bg, borderWidth: 2, borderStyle: 'solid', borderColor: border,
      boxShadow: shadow, scale, zIndex: 2,
    }} />
  );
}

// ─── Timeline Step Card ─────────────────────────────
function TimelineStep({ index, progress, step, stepInterval }: {
  index: number; progress: MotionValue<number>;
  step: typeof steps[0]; stepInterval: number;
}) {
  const activateAt = 0.12 + index * stepInterval;
  const opacity = useTransform(progress, [activateAt - 0.05, activateAt], [0.25, 1]);
  const x = useTransform(progress, [activateAt - 0.05, activateAt], [-6, 0]);
  const cardBorder = useTransform(progress, (v) =>
    v >= activateAt && v < activateAt + stepInterval ? `1px solid oklch(0.72 0.15 340 / 0.25)` : `1px solid oklch(0.20 0.005 155)`
  );

  return (
    <motion.div className="relative pl-[34px] py-1" style={{ opacity, x }}>
      <TimelineDot progress={progress} activateAt={activateAt} completeAt={activateAt + stepInterval} color={step.color} />
      <motion.div className="rounded-lg p-2.5 sm:p-3" style={{ background: CARD_BG, border: cardBorder }}>
        <div className="flex items-center gap-2">
          <StepIcon type={step.icon} color={step.color} />
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] sm:text-[9px] font-mono" style={{ color: step.color }}>{step.num}</span>
              <span className="text-white font-medium text-[10px] sm:text-xs">{step.title}</span>
            </div>
            <p className="text-gray-500 text-[9px] sm:text-[10px]">{step.desc}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Preview 1: Code Snippet ────────────────────────
function PreviewCode({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-2 px-4 py-2 shrink-0" style={{ borderBottom: `1px solid ${N800}` }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />
        <div className="h-1.5 w-16 rounded" style={{ background: N700 }} />
        <div className="ml-auto h-1.5 w-10 rounded" style={{ background: N800 }} />
      </div>
      <div className="flex-1 p-3 sm:p-4 flex flex-col">
        <div className="text-[8px] sm:text-[9px] uppercase tracking-widest mb-2" style={{ color: N600 }}>Widget Embed Code</div>
        <div className="rounded-lg p-3 flex-1" style={{ background: 'oklch(0.10 0.005 155)', border: `1px solid ${N800}` }}>
          <pre className="text-[8px] sm:text-[9px] font-mono leading-relaxed">
            <span style={{ color: N600 }}>{'<!-- Agrega antes de </body> -->'}</span>{'\n'}
            <span style={{ color: MAGENTA }}>{'<script'}</span>{'\n'}
            {'  '}<span style={{ color: AMBER }}>src</span>{'='}<span style={{ color: GREEN }}>"https://widget.avoqado.io/v1.js"</span>{'\n'}
            {'  '}<span style={{ color: AMBER }}>data-venue</span>{'='}<span style={{ color: GREEN }}>"tu-negocio"</span>{'\n'}
            {'  '}<span style={{ color: AMBER }}>data-theme</span>{'='}<span style={{ color: GREEN }}>"dark"</span>{'\n'}
            <span style={{ color: MAGENTA }}>{'></script>'}</span>
          </pre>
        </div>
        <div className="mt-2 flex justify-end">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-medium" style={{ background: MAGENTA, color: '#000' }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copiar
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Preview 2: Pasting into Website ────────────────
function PreviewPaste({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col">
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: N900, borderBottom: `1px solid ${N800}` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.35 0.15 25)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.60 0.15 85)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.55 0.15 145)' }} />
        <div className="flex-1 ml-1 px-2 py-0.5 rounded text-[8px]" style={{ background: 'oklch(0.12 0.005 155)', color: N600 }}>misushi.com.mx/admin</div>
      </div>
      <div className="flex-1 relative" style={{ background: PAGE_BG }}>
        <div className="flex items-center justify-between px-3 py-1.5" style={{ background: 'oklch(0.98 0.003 75)', borderBottom: '1px solid oklch(0.90 0.005 75)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: 'oklch(0.85 0.005 75)' }} />
            <div className="h-1.5 w-12 rounded" style={{ background: 'oklch(0.82 0.005 75)' }} />
          </div>
          <div className="flex gap-1.5">
            <div className="h-1 w-6 rounded" style={{ background: 'oklch(0.85 0.005 75)' }} />
            <div className="h-1 w-6 rounded" style={{ background: 'oklch(0.85 0.005 75)' }} />
          </div>
        </div>
        <div className="p-3">
          <div className="h-2 w-20 rounded mb-2" style={{ background: 'oklch(0.82 0.005 75)' }} />
          <div className="h-1 w-full rounded mb-1" style={{ background: 'oklch(0.88 0.005 75)' }} />
          <div className="h-1 w-3/4 rounded mb-3" style={{ background: 'oklch(0.88 0.005 75)' }} />
          <div className="h-14 w-full rounded-lg" style={{ background: 'oklch(0.90 0.005 75)' }} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-2.5" style={{ background: 'oklch(0.12 0.005 155 / 0.95)', borderTop: `1px solid ${MAGENTA}` }}>
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: MAGENTA }} />
            <span className="text-[8px] font-medium" style={{ color: MAGENTA }}>Codigo insertado</span>
          </div>
          <pre className="text-[7px] sm:text-[8px] font-mono" style={{ color: N600 }}>{'<script src="widget.avoqado.io/v1.js" ...></script>'}</pre>
        </div>
        <div className="absolute bottom-12 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: MAGENTA, boxShadow: `0 4px 16px oklch(0.72 0.15 340 / 0.4)` }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Preview 3: Ordering embedded in Restaurant Site ─
function PreviewOrdering({ opacity }: { opacity: MotionValue<number> }) {
  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: N900, borderBottom: `1px solid ${N800}` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.35 0.15 25)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.60 0.15 85)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.55 0.15 145)' }} />
        <div className="flex-1 ml-1 px-2 py-0.5 rounded text-[8px]" style={{ background: 'oklch(0.12 0.005 155)', color: N600 }}>misushi.com.mx/menu</div>
      </div>

      {/* Restaurant website with embedded widget */}
      <div className="flex-1 overflow-hidden" style={{ background: PAGE_BG }}>
        {/* Nav */}
        <div className="flex items-center justify-between px-4 py-1.5" style={{ background: 'oklch(0.15 0.01 340)', borderBottom: '1px solid oklch(0.25 0.01 340)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded" style={{ background: MAGENTA }} />
            <div className="h-1.5 w-12 rounded" style={{ background: 'oklch(0.60 0.005 155)' }} />
          </div>
          <div className="flex gap-2">
            <div className="h-1 w-6 rounded" style={{ background: 'oklch(0.40 0.005 155)' }} />
            <div className="h-1 w-6 rounded" style={{ background: 'oklch(0.40 0.005 155)' }} />
            <div className="px-2 py-0.5 rounded text-[6px] font-medium text-black" style={{ background: MAGENTA }}>Ordenar</div>
          </div>
        </div>

        {/* Page section title */}
        <div className="px-4 pt-3 pb-2" style={{ background: PAGE_BG }}>
          <div className="text-[8px] uppercase tracking-widest mb-1" style={{ color: 'oklch(0.50 0.08 340)' }}>Menu online</div>
          <div className="h-2 w-28 rounded mb-1" style={{ background: 'oklch(0.25 0.005 155)' }} />
          <div className="h-1 w-48 rounded" style={{ background: 'oklch(0.75 0.005 75)' }} />
        </div>

        {/* Embedded Avoqado widget — inline, part of the page */}
        <div className="mx-4 rounded-xl overflow-hidden" style={{ background: 'oklch(0.11 0.005 155)', border: `1px solid ${N800}` }}>
          {/* Widget header — subtle, feels native */}
          <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${N800}` }}>
            <div className="flex gap-1.5">
              <div className="px-1.5 py-0.5 rounded text-[6px] font-medium text-black" style={{ background: MAGENTA }}>Todo</div>
              <div className="px-1.5 py-0.5 rounded text-[6px]" style={{ background: N900, color: N600 }}>Rolls</div>
              <div className="px-1.5 py-0.5 rounded text-[6px]" style={{ background: N900, color: N600 }}>Nigiri</div>
              <div className="px-1.5 py-0.5 rounded text-[6px]" style={{ background: N900, color: N600 }}>Bebidas</div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: GREEN }} />
              <span className="text-[6px]" style={{ color: N600 }}>Avoqado</span>
            </div>
          </div>

          {/* Product grid — feels like part of the site */}
          <div className="p-2.5 space-y-1.5">
            {[
              { name: 'Dragon Roll', qty: 'x2', sub: 'Salmon, aguacate, pepino', price: '$280', bg: 'oklch(0.20 0.02 340)' },
              { name: 'Edamame', qty: '', sub: 'Con sal de mar', price: '$95', bg: 'oklch(0.20 0.02 155)' },
              { name: 'Limonada Yuzu', qty: '', sub: '350ml — fresca', price: '$75', bg: 'oklch(0.20 0.02 75)' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: N900 }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg" style={{ background: item.bg }} />
                  <div>
                    <div className="text-white text-[8px]">{item.name} {item.qty && <span style={{ color: MAGENTA }}>{item.qty}</span>}</div>
                    <div className="text-[6px]" style={{ color: N600 }}>{item.sub}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-[8px]">{item.price}</span>
                  <div className="w-4 h-4 rounded flex items-center justify-center text-[8px]" style={{ background: 'oklch(0.20 0.005 155)', color: N600 }}>+</div>
                </div>
              </div>
            ))}
          </div>

          {/* Cart bar */}
          <div className="px-2.5 py-2" style={{ borderTop: `1px solid ${N800}` }}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[7px]" style={{ color: N600 }}>3 productos</span>
              <span className="text-white text-[9px] font-medium">$450</span>
            </div>
            <div className="w-full py-1.5 rounded-lg text-center text-[8px] font-semibold text-black" style={{ background: GREEN }}>
              Pagar $450
            </div>
          </div>
        </div>

        {/* More page content below widget */}
        <div className="px-4 py-3">
          <div className="h-1 w-20 rounded mb-1" style={{ background: 'oklch(0.82 0.005 75)' }} />
          <div className="h-1 w-full rounded" style={{ background: 'oklch(0.88 0.005 75)' }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Preview 4: Booking embedded in Studio Site ─────
function PreviewBooking({ opacity }: { opacity: MotionValue<number> }) {
  const days = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
  const dates = [
    { d: 16, avail: false }, { d: 17, avail: true }, { d: 18, avail: true, selected: true },
    { d: 19, avail: true }, { d: 20, avail: true }, { d: 21, avail: false }, { d: 22, avail: true },
  ];
  const slots = [
    { time: '07:00', name: 'Pilates Mat', spots: 3 },
    { time: '09:30', name: 'Pilates Reformer', spots: 1 },
    { time: '17:00', name: 'Pilates Intensivo', spots: 2 },
  ];

  return (
    <motion.div style={{ opacity }} className="absolute inset-0 flex flex-col">
      {/* Browser chrome */}
      <div className="flex items-center gap-2 px-3 py-2 shrink-0" style={{ background: N900, borderBottom: `1px solid ${N800}` }}>
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.35 0.15 25)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.60 0.15 85)' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: 'oklch(0.55 0.15 145)' }} />
        <div className="flex-1 ml-1 px-2 py-0.5 rounded text-[8px]" style={{ background: 'oklch(0.12 0.005 155)', color: N600 }}>studiozen.mx/clases</div>
      </div>

      {/* Studio website with embedded booking widget */}
      <div className="flex-1 overflow-hidden" style={{ background: PAGE_BG }}>
        {/* Nav */}
        <div className="flex items-center justify-between px-4 py-1.5" style={{ background: 'oklch(0.12 0.01 195)', borderBottom: `1px solid oklch(0.22 0.01 195)` }}>
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full" style={{ background: TEAL }} />
            <div className="h-1.5 w-14 rounded" style={{ background: 'oklch(0.50 0.005 155)' }} />
          </div>
          <div className="flex gap-2">
            <div className="h-1 w-6 rounded" style={{ background: 'oklch(0.40 0.005 155)' }} />
            <div className="h-1 w-6 rounded" style={{ background: 'oklch(0.40 0.005 155)' }} />
            <div className="px-2 py-0.5 rounded text-[6px] font-medium text-black" style={{ background: TEAL }}>Reservar</div>
          </div>
        </div>

        {/* Page section title */}
        <div className="px-4 pt-3 pb-2" style={{ background: PAGE_BG }}>
          <div className="text-[8px] uppercase tracking-widest mb-1" style={{ color: 'oklch(0.50 0.08 195)' }}>Reserva tu clase</div>
          <div className="h-2 w-32 rounded mb-1" style={{ background: 'oklch(0.25 0.005 155)' }} />
          <div className="h-1 w-48 rounded" style={{ background: 'oklch(0.75 0.005 75)' }} />
        </div>

        {/* Embedded Avoqado booking widget — inline in page */}
        <div className="mx-4 rounded-xl overflow-hidden" style={{ background: 'oklch(0.11 0.005 155)', border: `1px solid ${N800}` }}>
          {/* Widget header */}
          <div className="flex items-center justify-between px-3 py-1.5" style={{ borderBottom: `1px solid ${N800}` }}>
            <div className="flex items-center gap-1.5">
              <span className="text-white text-[8px] font-medium">Marzo 2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={N600} strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke={N600} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
              <div className="w-2 h-2 rounded-full" style={{ background: TEAL }} />
              <span className="text-[6px]" style={{ color: N600 }}>Avoqado</span>
            </div>
          </div>

          {/* Calendar row */}
          <div className="px-3 pt-1.5">
            <div className="grid grid-cols-7 gap-0.5 mb-0.5">
              {days.map(d => <div key={d} className="text-center text-[6px]" style={{ color: N600 }}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-0.5 mb-1.5">
              {dates.map(({ d, avail, selected }) => (
                <div key={d} className="aspect-square rounded flex items-center justify-center text-[7px]" style={{
                  background: selected ? TEAL : avail ? N900 : 'transparent',
                  color: selected ? '#000' : avail ? 'white' : N700,
                  fontWeight: selected ? 600 : 400,
                }}>{d}</div>
              ))}
            </div>
          </div>

          {/* Time slots */}
          <div className="px-3 space-y-0.5 pb-1.5">
            <div className="text-[6px] mb-0.5" style={{ color: N600 }}>Clases disponibles — Mar 18</div>
            {slots.map((slot, i) => (
              <div key={i} className="flex items-center justify-between p-1.5 rounded-lg" style={{ background: N900 }}>
                <div className="flex items-center gap-1.5">
                  <div className="text-[7px] font-mono w-8" style={{ color: TEAL }}>{slot.time}</div>
                  <div>
                    <div className="text-white text-[7px]">{slot.name}</div>
                    <div className="text-[6px]" style={{ color: N600 }}>{slot.spots} {slot.spots === 1 ? 'lugar' : 'lugares'}</div>
                  </div>
                </div>
                <div className="px-1.5 py-0.5 rounded text-[6px] font-medium" style={{ background: 'oklch(0.18 0.02 195)', color: TEAL }}>Reservar</div>
              </div>
            ))}
          </div>

          {/* Confirm bar */}
          <div className="px-3 py-2" style={{ borderTop: `1px solid ${N800}` }}>
            <div className="w-full py-1.5 rounded-lg text-center text-[8px] font-semibold text-black" style={{ background: TEAL }}>
              Confirmar reservacion
            </div>
          </div>
        </div>

        {/* More page content below */}
        <div className="px-4 py-2">
          <div className="h-1 w-20 rounded mb-1" style={{ background: 'oklch(0.82 0.005 75)' }} />
          <div className="h-1 w-full rounded" style={{ background: 'oklch(0.88 0.005 75)' }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────
export default function WidgetTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Step interval: 4 steps spread across scroll range
  const STEP_INTERVAL = 0.20;

  // ─── Text animations ───
  const labelOpacity = useTransform(scrollYProgress, [0, 0.08], [0, 1]);
  const titleOpacity = useTransform(scrollYProgress, [0.02, 0.12], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0.02, 0.12], [25, 0]);
  const descOpacity = useTransform(scrollYProgress, [0.06, 0.16], [0, 1]);
  const descY = useTransform(scrollYProgress, [0.06, 0.16], [15, 0]);
  const badgesOpacity = useTransform(scrollYProgress, [0.10, 0.22], [0, 1]);

  // ─── Timeline line fill ───
  const lineFill = useTransform(scrollYProgress, [0.10, 0.88], ['0%', '100%']);

  // ─── Preview mockup entrance ───
  const mockupOpacity = useTransform(scrollYProgress, [0.06, 0.16], [0, 1]);
  const mockupScale = useTransform(scrollYProgress, [0.06, 0.16], [0.92, 1]);
  const mockupX = useTransform(scrollYProgress, [0.06, 0.16], [40, 0]);

  // ─── 4 state crossfades ───
  // State 1: Code (0.06 → 0.28)
  const s1 = useTransform(scrollYProgress, [0.06, 0.12, 0.26, 0.30], [0, 1, 1, 0]);
  const l1 = useTransform(scrollYProgress, [0.06, 0.12, 0.26, 0.30], [0, 1, 1, 0]);
  const l1Y = useTransform(scrollYProgress, [0.06, 0.12], [8, 0]);

  // State 2: Paste (0.28 → 0.50)
  const s2 = useTransform(scrollYProgress, [0.28, 0.32, 0.48, 0.52], [0, 1, 1, 0]);
  const l2 = useTransform(scrollYProgress, [0.28, 0.32, 0.48, 0.52], [0, 1, 1, 0]);
  const l2Y = useTransform(scrollYProgress, [0.28, 0.32], [8, 0]);

  // State 3: Ordering (0.50 → 0.72)
  const s3 = useTransform(scrollYProgress, [0.50, 0.54, 0.70, 0.74], [0, 1, 1, 0]);
  const l3 = useTransform(scrollYProgress, [0.50, 0.54, 0.70, 0.74], [0, 1, 1, 0]);
  const l3Y = useTransform(scrollYProgress, [0.50, 0.54], [8, 0]);

  // State 4: Booking (0.72 → 1.0)
  const s4 = useTransform(scrollYProgress, [0.72, 0.76, 0.94, 1], [0, 1, 1, 1]);
  const l4 = useTransform(scrollYProgress, [0.72, 0.76, 0.94, 1], [0, 1, 1, 1]);
  const l4Y = useTransform(scrollYProgress, [0.72, 0.76], [8, 0]);

  return (
    <div ref={containerRef} className="relative bg-black border-t border-white/5" style={{ height: '300vh' }}>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center overflow-hidden">
        <div className="max-w-[1400px] mx-auto w-full px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">

            {/* ─── Left: Text + Timeline ─── */}
            <div>
              <motion.span className="text-xs uppercase tracking-widest font-semibold mb-2 block"
                style={{ color: MAGENTA, opacity: labelOpacity }}>
                Integracion
              </motion.span>
              <motion.h2 className="text-3xl md:text-4xl lg:text-5xl font-light tracking-tight text-white mb-3 leading-tight"
                style={{ opacity: titleOpacity, y: titleY }}>
                Copia. Pega. Listo.
              </motion.h2>
              <motion.p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-4"
                style={{ opacity: descOpacity, y: descY }}>
                Un script tag. Funciona en cualquier sitio web. Ordenes, pagos y reservaciones.
              </motion.p>
              <motion.div className="flex flex-wrap gap-1.5 mb-4" style={{ opacity: badgesOpacity }}>
                {platforms.map(p => (
                  <span key={p} className="px-2 py-0.5 text-[9px] rounded-full border border-white/10 text-gray-500">{p}</span>
                ))}
              </motion.div>

              {/* Timeline */}
              <div className="relative">
                <div className="absolute left-[14px] top-[8px] bottom-[8px] w-[2px]" style={{ background: N800 }} />
                <motion.div className="absolute left-[14px] top-[8px] w-[2px]"
                  style={{ background: `linear-gradient(180deg, ${MAGENTA}, ${GREEN}, ${TEAL})`, height: lineFill, maxHeight: 'calc(100% - 16px)' }} />
                <div className="flex flex-col">
                  {steps.map((step, i) => (
                    <TimelineStep key={i} index={i} progress={scrollYProgress} step={step} stepInterval={STEP_INTERVAL} />
                  ))}
                </div>
              </div>
            </div>

            {/* ─── Right: Living Preview ─── */}
            <motion.div style={{ opacity: mockupOpacity, scale: mockupScale, x: mockupX }}>
              <div className="relative w-full">
                {/* Labels */}
                <div className="absolute -top-3 left-0 right-0 z-30 flex justify-center pointer-events-none">
                  <motion.span style={{ opacity: l1, y: l1Y, borderColor: MAGENTA, color: MAGENTA, background: LABEL_BG }}
                    className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
                    Copiar snippet
                  </motion.span>
                  <motion.span style={{ opacity: l2, y: l2Y, borderColor: MAGENTA, color: MAGENTA, background: LABEL_BG, position: 'absolute' }}
                    className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
                    Pegar en tu sitio
                  </motion.span>
                  <motion.span style={{ opacity: l3, y: l3Y, borderColor: GREEN, color: GREEN, background: LABEL_BG, position: 'absolute' }}
                    className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
                    Ordenes en vivo
                  </motion.span>
                  <motion.span style={{ opacity: l4, y: l4Y, borderColor: TEAL, color: TEAL, background: LABEL_BG, position: 'absolute' }}
                    className="text-[9px] sm:text-[10px] font-medium tracking-widest uppercase px-3 py-1.5 rounded-full border">
                    Reservaciones
                  </motion.span>
                </div>

                {/* Device frame */}
                <div className="rounded-2xl overflow-hidden bg-avoqado-dark-surface border border-white/5 aspect-[4/3] w-full relative">
                  <PreviewCode opacity={s1} />
                  <PreviewPaste opacity={s2} />
                  <PreviewOrdering opacity={s3} />
                  <PreviewBooking opacity={s4} />
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
}
