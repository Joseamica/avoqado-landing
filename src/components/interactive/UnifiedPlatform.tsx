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
  isDrawn: boolean;
  showElectricity: boolean;
  index: number;
}> = ({ fromPos, toPos, color, id, isDrawn, showElectricity, index }) => {
  // Cubic Bezier Logic
  // Control points: 50% of the way horizontally, keeping y flat
  const dx = toPos.x - fromPos.x;
  
  // Stretch control points further for outer columns to smooth the curve
  const tension = 0.5; 
  const c1x = fromPos.x + dx * tension;
  const c1y = fromPos.y;
  const c2x = toPos.x - dx * tension;
  const c2y = toPos.y;

  const path = `M ${fromPos.x} ${fromPos.y} C ${c1x} ${c1y} ${c2x} ${c2y} ${toPos.x} ${toPos.y}`;
  
  // Fixed pattern for seamless looping
  const dashSize = 12;
  const gapSize = 118;
  const patternLength = dashSize + gapSize;

  return (
    <g key={`connection-${id}`}>
      <defs>
        <linearGradient id={`grad-${id}`} x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.4" />
          <stop offset="1" stopColor={color} stopOpacity="0.1" />
        </linearGradient>
      </defs>
      
      {/* Base line */}
      <path
        d={path}
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeWidth={1.5}
        strokeLinecap="round"
        opacity={isDrawn ? 1 : 0}
        style={{ transition: 'opacity 0.5s ease' }}
      />
      
      {/* Electricity flow - animated dashes */}
      {showElectricity && (
        <>
          {/* Flowing electricity effect */}
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={`${dashSize} ${gapSize}`}
            opacity={0.8}
            style={{
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
        </>
      )}
    </g>
  );
};

// Clean card with subtle shadow
const CleanCard: React.FC<{
  source: DataSource;
  position: { x: number; y: number };
  isVisible: boolean;
}> = ({ source, position, isVisible }) => {
  return (
    <motion.div
      className="absolute flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 hover:scale-110 group"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
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

  const [scrollValue, setScrollValue] = useState(0);

  useEffect(() => {
    const unsubscribe = scrollYProgress.on('change', (v) => setScrollValue(v));
    return () => unsubscribe();
  }, [scrollYProgress]);

  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [30, 0]);
  const centerOpacity = useTransform(scrollYProgress, [0.1, 0.25], [0, 1]);

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

  // Check visibility based on scroll
  const isNodeVisible = (index: number) => {
    const start = 0.2 + (index * 0.04);
    return scrollValue >= start;
  };

  const areLinesDrawn = scrollValue >= 0.55;
  const showElectricity = scrollValue >= 0.75;

  return (
    <div ref={containerRef} className="relative h-[300vh] bg-black z-0">
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
                className="text-gray-500 text-sm lg:text-lg leading-relaxed max-w-lg"
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

            {/* Right: Left-to-Right Flow Diagram - Responsive */}
            <div className="flex justify-center lg:justify-end w-full overflow-hidden">
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
                        isDrawn={areLinesDrawn}
                        showElectricity={showElectricity}
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
                    <img
                      src="/imagotipo-white.png"
                      alt="Avoqado"
                      className="w-full h-full object-contain"
                      style={{ 
                        filter: showElectricity 
                          ? 'drop-shadow(0 0 10px rgba(105, 225, 133, 0.5))' 
                          : 'none',
                        transition: 'filter 0.5s ease',
                      }}
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
                      isVisible={isNodeVisible(index)}
                    />
                  );
                })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
