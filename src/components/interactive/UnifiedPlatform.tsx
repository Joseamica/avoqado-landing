import React, { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

// Stripe Dark Style with simple curved connections + Electric flow animation

interface DataSource {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  angle: number;
  radius: number;
}

const DATA_SOURCES: DataSource[] = [
  {
    id: 'tpv',
    name: 'TPV Móvil',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="tpv-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#69E185" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
        </defs>
        <rect x="10" y="4" width="20" height="32" rx="3" fill="url(#tpv-grad)" />
        <rect x="13" y="8" width="14" height="18" rx="2" fill="white" fillOpacity="0.2" />
        <circle cx="20" cy="31" r="2" fill="white" fillOpacity="0.5" />
      </svg>
    ),
    color: '#69E185',
    angle: 270,
    radius: 200,
  },
  {
    id: 'dashboard',
    name: 'Dashboard',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="dash-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="14" height="14" rx="2" fill="url(#dash-grad)" />
        <rect x="22" y="4" width="14" height="8" rx="2" fill="url(#dash-grad)" fillOpacity="0.6" />
        <rect x="22" y="16" width="14" height="20" rx="2" fill="url(#dash-grad)" fillOpacity="0.6" />
        <rect x="4" y="22" width="14" height="14" rx="2" fill="url(#dash-grad)" />
      </svg>
    ),
    color: '#60A5FA',
    angle: 0,
    radius: 220,
  },
  {
    id: 'terminal1',
    name: 'Terminal 1',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="term1-grad" x1="20" y1="8" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
        <rect x="6" y="8" width="28" height="18" rx="3" fill="url(#term1-grad)" />
        <rect x="14" y="28" width="12" height="4" rx="1" fill="url(#term1-grad)" />
      </svg>
    ),
    color: '#A78BFA',
    angle: 45,
    radius: 175,
  },
  {
    id: 'terminal2',
    name: 'Terminal 2',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="term2-grad" x1="20" y1="8" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C084FC" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
        </defs>
        <rect x="6" y="8" width="28" height="18" rx="3" fill="url(#term2-grad)" />
        <rect x="14" y="28" width="12" height="4" rx="1" fill="url(#term2-grad)" />
      </svg>
    ),
    color: '#C084FC',
    angle: 100,
    radius: 180,
  },
  {
    id: 'pos',
    name: 'Sistema POS',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="pos-grad" x1="20" y1="10" x2="20" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F472B6" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
        </defs>
        <rect x="4" y="10" width="32" height="20" rx="3" fill="url(#pos-grad)" />
        <path d="M10 16h8M10 22h12" stroke="white" strokeOpacity="0.4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: '#F472B6',
    angle: 150,
    radius: 225,
  },
  {
    id: 'efectivo',
    name: 'Efectivo',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="cash-grad" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="14" fill="url(#cash-grad)" />
        <path d="M20 10v20M24 14h-6a3 3 0 000 6h4a3 3 0 010 6h-6" stroke="white" strokeOpacity="0.5" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    color: '#FCD34D',
    angle: 200,
    radius: 190,
  },
  {
    id: 'qr',
    name: 'Pagos QR',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="qr-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9A8D4" />
            <stop offset="1" stopColor="#F472B6" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="13" height="13" rx="2" fill="url(#qr-grad)" />
        <rect x="23" y="4" width="13" height="13" rx="2" fill="url(#qr-grad)" />
        <rect x="4" y="23" width="13" height="13" rx="2" fill="url(#qr-grad)" />
        <rect x="23" y="23" width="13" height="13" rx="2" fill="url(#qr-grad)" fillOpacity="0.5" />
      </svg>
    ),
    color: '#F9A8D4',
    angle: 240,
    radius: 220,
  },
  {
    id: 'integraciones',
    name: 'Integraciones',
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="w-9 h-9">
        <defs>
          <linearGradient id="int-grad" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="5" fill="url(#int-grad)" />
        <path d="M20 6v8M20 26v8M6 20h8M26 20h8" stroke="url(#int-grad)" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    color: '#2DD4BF',
    angle: 315,
    radius: 205,
  },
];

const MAX_RADIUS = 230;
const CENTER_SIZE = 120;
const NODE_SIZE = 80;

// Helper to fix hydration mismatches by standardizing floating point precision
const toPrecision = (num: number) => Math.round(num * 1000) / 1000;

// Smooth Cubic Bezier Curve Connection (Stripe-like organic flow)
const ElectricConnection: React.FC<{
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  color: string;
  id: string;
  scrollY: any; 
  index: number;
}> = ({ fromPos, toPos, color, id, scrollY, index }) => {
  // Cubic Bezier Logic
  const dx = toPos.x - fromPos.x;
  const tension = 0.5; 
  const c1x = fromPos.x + dx * tension;
  const c1y = fromPos.y;
  const c2x = toPos.x - dx * tension;
  const c2y = toPos.y;

  const path = `M ${fromPos.x} ${fromPos.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${toPos.x} ${toPos.y}`;
  
  const dashSize = 12;
  const gapSize = 118;
  const patternLength = dashSize + gapSize;

  // Optimizations: Use transforms instead of state
  // Line appears after 0.55
  const opacity = useTransform(scrollY, [0.55, 0.6], [0, 1]);
  // Electricity appears after 0.75
  const electricOpacity = useTransform(scrollY, [0.75, 0.8], [0, 0.8]);

  return (
    <g key={`connection-${id}`}>
      <defs>
        <linearGradient id={`grad-${id}`} x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.4" />
          <stop offset="1" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Base line */}
      <motion.path
        d={path}
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeWidth={1.5}
        strokeLinecap="round"
        style={{ opacity, transition: 'opacity 0.5s ease' }}
      />
      
      {/* Electricity flow - animated dashes */}
      <motion.path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={`${dashSize} ${gapSize}`}
        style={{
          opacity: electricOpacity,
          animation: `electricFlow 2s linear infinite`,
          filter: `drop-shadow(0 0 3px ${color})`,
        }}
      />
      <style>
        {`
          @keyframes electricFlow {
            from {
              stroke-dashoffset: ${patternLength};
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </g>
  );
};

// Clean card with subtle shadow
const CleanCard: React.FC<{
  source: DataSource;
  position: { x: number; y: number };
  scrollY: any;
  index: number;
}> = ({ source, position, scrollY, index }) => {
  // Stagger appearance based on index
  const start = 0.2 + (index * 0.04);
  const opacity = useTransform(scrollY, [start, start + 0.1], [0, 1]);
  const scale = useTransform(scrollY, [start, start + 0.1], [0.8, 1]);

  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110 group"
      style={{
        width: toPrecision(NODE_SIZE),
        height: toPrecision(NODE_SIZE),
        left: toPrecision(position.x - NODE_SIZE / 2),
        top: toPrecision(position.y - NODE_SIZE / 2),
        background: 'rgba(20, 20, 20, 0.8)', // Lighter, glassier
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
        zIndex: 10,
        opacity,
        scale
      }}
      whileHover={{
        boxShadow: `0 12px 40px rgba(0, 0, 0, 0.4), 0 0 25px ${source.color}20`,
        borderColor: `${source.color}60`,
        background: 'rgba(30, 30, 30, 0.95)'
      }}
    >
      {source.icon}
      <span className="text-[10px] text-gray-400 font-medium mt-1.5 text-center leading-tight max-w-[70px]">
        {source.name}
      </span>
    </motion.div>
  );
};

export const UnifiedPlatform: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [30, 0]);
  const centerOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);
  // Restore logo glow effect
  const logoFilter = useTransform(
    scrollYProgress, 
    [0.75, 0.8], 
    ["drop-shadow(0 0 0px rgba(105, 225, 133, 0))", "drop-shadow(0 0 10px rgba(105, 225, 133, 0.5))"]
  );

  const containerWidth = 700;
  const containerHeight = 600;
  
  // Right-side center for Avoqado
  const coreX = 580;
  const coreY = 300;
  


  const getNodeCenter = (source: DataSource, index: number) => {

    // "Organic Staggered Grid" (Hive Layout)
    const col = index % 2; // 0 (Left), 1 (Right)
    const row = Math.floor(index / 2); // 0, 1, 2, 3

    // Horizontal Positions
    const xBase = 60;
    const xStep = 160; // Distance between columns
    
    // Vertical Positions
    const yBase = 70;
    const yStep = 125; // Vertical distance between items in same column
    const yStagger = 62.5; // Offset for second column (half of yStep)

    const x = xBase + col * xStep; 
    const y = yBase + (row * yStep) + (col * yStagger);

    return { x, y };
  };

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-black z-0">
      {/* Global SVG Defs - Chrome bug workaround: gradients don't work inside transform containers */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <linearGradient id="tpv-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#69E185" />
            <stop offset="1" stopColor="#22C55E" />
          </linearGradient>
          <linearGradient id="dash-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#60A5FA" />
            <stop offset="1" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id="term1-grad" x1="20" y1="8" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#8B5CF6" />
          </linearGradient>
          <linearGradient id="term2-grad" x1="20" y1="8" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#C084FC" />
            <stop offset="1" stopColor="#A855F7" />
          </linearGradient>
          <linearGradient id="pos-grad" x1="20" y1="10" x2="20" y2="30" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F472B6" />
            <stop offset="1" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="cash-grad" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FCD34D" />
            <stop offset="1" stopColor="#FBBF24" />
          </linearGradient>
          <linearGradient id="qr-grad" x1="20" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F9A8D4" />
            <stop offset="1" stopColor="#F472B6" />
          </linearGradient>
          <linearGradient id="int-grad" x1="20" y1="6" x2="20" y2="34" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2DD4BF" />
            <stop offset="1" stopColor="#14B8A6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-start lg:items-center z-10 pt-4 lg:pt-0">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start lg:items-center">
            {/* Left: Text */}
            <div className="space-y-4 lg:space-y-6">
              <motion.p
                style={{ opacity: titleOpacity }}
                className="text-avoqado-green font-semibold text-xs lg:text-sm tracking-widest uppercase"
              >
                Plataforma Unificada
              </motion.p>

              <motion.h2
                style={{ opacity: titleOpacity, y: titleY }}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight"
              >
                Un solo sistema.<br />
                <span className="text-gray-400">Cero conciliaciones.</span>
              </motion.h2>

              <motion.p
                style={{ opacity: useTransform(scrollYProgress, [0.1, 0.2], [0, 1]) }}
                className="hidden lg:block text-gray-500 text-sm lg:text-lg leading-relaxed max-w-lg"
              >
                Múltiples terminales, pagos en efectivo, tarjetas, QR y conexiones POS.
                Todo registrado automáticamente en un solo lugar.
              </motion.p>

              <motion.div
                style={{ opacity: useTransform(scrollYProgress, [0.6, 0.75], [0, 1]) }}
                className="hidden lg:block space-y-3"
              >
                {['Sin hojas de Excel para conciliar', 'Cierre de caja automático', 'Reportes unificados en tiempo real'].map((text, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-avoqado-green">
                        <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span className="text-gray-300 text-sm">{text}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Left-to-Right Flow Diagram - Responsive (Desktop Only) */}
            <div className="hidden lg:flex justify-center lg:justify-end w-full overflow-visible">
              {/* Wrapper that scales with the viewport */}
              <div
                className="relative overflow-visible"
                style={{
                  width: `min(100%, ${containerWidth}px)`,
                  height: `min(60vh, ${containerHeight}px)`,
                }}
              >
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.5] sm:scale-[0.8] md:scale-[0.9] lg:scale-[1.0] xl:scale-[1.0]"
                  style={{
                    width: containerWidth,
                    height: containerHeight,
                  }}
                >
                {/* Subtle radial gradient background behind core */}
                <div 
                  className="absolute rounded-full opacity-20"
                  style={{
                    width: '600px',
                    height: '600px',
                    left: coreX - 300,
                    top: coreY - 300,
                    background: 'radial-gradient(circle at center, rgba(105, 225, 133, 0.15) 0%, transparent 60%)',
                  }}
                />

                {/* Connection Lines with Electric Flow */}
                <svg
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 5 }}
                  viewBox={`0 0 ${containerWidth} ${containerHeight}`}
                  width={containerWidth}
                  height={containerHeight}
                >
                  {DATA_SOURCES.map((source, index) => {
                    const nodeCenter = getNodeCenter(source, index);
                    return (
                      <ElectricConnection
                        key={`line-${source.id}`}
                        id={source.id}
                        fromPos={nodeCenter}
                        toPos={{ x: coreX - 60, y: coreY }}
                        color={source.color}
                        scrollY={scrollYProgress}
                        index={index}
                      />
                    );
                  })}
                </svg>

                {/* Center Node - Avoqado Logo Container (Now on Right) */}
                <motion.div
                  className="absolute flex items-center justify-center rounded-full"
                  style={{
                    width: CENTER_SIZE,
                    height: CENTER_SIZE,
                    left: coreX - CENTER_SIZE / 2,
                    top: coreY - CENTER_SIZE / 2,
                    opacity: centerOpacity,
                    zIndex: 20,
                  }}
                >
                  {/* Inner logo */}
                  <div className="relative w-[100%] h-[77%] flex items-center justify-center">
                    <motion.img
                      src="/imagotipo-white.png"
                      alt="Avoqado"
                      className="w-full h-full object-contain"
                      style={{ filter: logoFilter }}
                    />
                  </div>
                </motion.div>

                {/* Data Source Cards (Left Grid) */}
                {DATA_SOURCES.map((source, index) => {
                  const nodeCenter = getNodeCenter(source, index);
                  return (
                    <CleanCard
                      key={source.id}
                      source={source}
                      position={nodeCenter}
                      scrollY={scrollYProgress}
                      index={index}
                    />
                  );
                })}
                </div>
              </div>
            </div>

            {/* Mobile Waterfall Diagram (lg:hidden) */}
            <div className="lg:hidden absolute inset-0 w-full h-[85vh] top-24 pointer-events-none">
                 <div className="relative w-full h-full"> 
                    {/* Avoqado Goal Node (Bottom Center) */}
                    <motion.div 
                        style={{ opacity: centerOpacity }}
                        className="absolute bottom-20 left-1/2 -translate-x-1/2 p-4 rounded-3xl bg-black/80 border border-white/10 backdrop-blur-md z-20 flex flex-col items-center shadow-2xl"
                    >
                         <img src="/imagotipo-white.png" alt="Avoqado" className="w-24 h-auto object-contain" />
                         <span className="text-[10px] text-gray-500 mt-2 font-medium tracking-widest uppercase">Sistema Central</span>
                    </motion.div>

                    {/* Waterfall Streams */}
                    <svg className="absolute inset-0 w-full h-full z-10 overflow-visible">
                        {DATA_SOURCES.map((source, i) => {
                             // Calculated positions for 2-column waterfall
                             const isLeft = i % 2 === 0;
                             const row = Math.floor(i / 2);
                             const xPercent = isLeft ? 20 : 80;
                             const yPercent = 10 + (row * 12); // Staggered down

                             // Target: Bottom Center (50%, 85%) - approx where logo is
                             return (
                                <MobileWaterfallItem 
                                    key={source.id}
                                    source={source}
                                    index={i}
                                    scrollY={scrollYProgress}
                                    xPercent={xPercent}
                                    yPercent={yPercent}
                                />
                             );
                        })}
                    </svg>
                 </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component for Mobile Items (Defined BEFORE usage or hoisted)
const MobileWaterfallItem: React.FC<{
    source: DataSource;
    index: number;
    scrollY: any;
    xPercent: number;
    yPercent: number;
}> = ({ source, index, scrollY, xPercent, yPercent }) => {
    // Staggered timing
    const start = 0.15 + (index * 0.05);
    const end = start + 0.15;
    
    // Opacity: Appears quickly
    const opacity = useTransform(scrollY, [start, start + 0.05], [0, 1]);
    const scale = useTransform(scrollY, [start, start + 0.05], [0.5, 1]);
    
    // Line Drawing: Takes longer, flows down
    const drawProgress = useTransform(scrollY, [start + 0.02, end + 0.1], [0, 1]);
    
    return (
        <g>
            {/* The Card (HTML rendered inside ForeignObject for SVG) - OR just render SVG group */}
            <foreignObject x={`${xPercent - 15}%`} y={`${yPercent - 5}%`} width="30%" height="80px" className="overflow-visible">
                 <motion.div 
                    style={{ opacity, scale }}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-neutral-900/90 border border-white/10 shadow-lg backdrop-blur"
                 >
                    <div className="scale-75 mb-1">{source.icon}</div>
                    <span className="text-[9px] text-white font-medium text-center leading-none">{source.name}</span>
                 </motion.div>
            </foreignObject>

            {/* The Wire */}
            <MobileWire 
                startX={`${xPercent}%`} 
                startY={`${yPercent + 4}%`} // Bottom of card approx
                endX="50%" 
                endY="80%" // Top of Avoqado Logo approx
                color={source.color} 
                progress={drawProgress}
            />
        </g>
    )
}

const MobileWire: React.FC<{
    startX: string;
    startY: string;
    endX: string;
    endY: string;
    color: string;
    progress: any;
}> = ({ startX, startY, endX, endY, color, progress }) => {
    // Generate a unique curved path
    // Since coordinates are %, we might need coordinate conversion or use straight lines if SVG handles % paths (it doesn't well for control points)
    // Hack: Use simple L for now or basic Bezier if we assume 100x100 viewbox?
    // Actually, parent SVG doesn't have viewBox set to 0 0 100 100.
    // Let's use generic percentage based curve if possible? No.
    // Better: Render path with `vector-effect: non-scaling-stroke`?
    // Let's stick to standard vertical drop + curve.
    
    // FIX: To use proper curves with percentages, use a nested SVG with viewBox 0 0 100 100
    // But then stroke width varies. 
    // ALTERNATIVE: Just use straight lines for mobile waterfall? Or simple Q curves.
    // Let's assume the parent SVG container is responsive.
    
    return (
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <motion.path 
                d={`M ${parseFloat(startX)} ${parseFloat(startY)} C ${parseFloat(startX)} ${parseFloat(startY) + 20}, 50 ${parseFloat(endY) - 20}, 50 ${parseFloat(endY)}`}
                fill="none"
                stroke={color}
                strokeWidth="0.5" // Relative to 100x100 viewBox
                strokeLinecap="round"
                // opacity={progress} // Fade overlap
                style={{ pathLength: progress }}
            />
        </svg>
    );
};
