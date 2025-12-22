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
    radius: 185,
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
    radius: 210,
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

// Simple curved connection with flowing electricity animation
const ElectricConnection: React.FC<{
  fromPos: { x: number; y: number };
  toPos: { x: number; y: number };
  color: string;
  id: string;
  isDrawn: boolean;
  showElectricity: boolean;
  index: number;
}> = ({ fromPos, toPos, color, id, isDrawn, showElectricity, index }) => {
  // Circuit-board style connections (90 degree angles)
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  
  // Determine dominant direction to create cleaner paths
  const isHorizontal = Math.abs(dx) > Math.abs(dy);
  
  let path = '';
  if (isHorizontal) {
    const midX = fromPos.x + dx / 2;
    path = `M ${fromPos.x} ${fromPos.y} L ${midX} ${fromPos.y} L ${midX} ${toPos.y} L ${toPos.x} ${toPos.y}`;
  } else {
    const midY = fromPos.y + dy / 2;
    path = `M ${fromPos.x} ${fromPos.y} L ${fromPos.x} ${midY} L ${toPos.x} ${midY} L ${toPos.x} ${toPos.y}`;
  }
  
  // Fixed pattern for seamless looping: 12px dash, 118px gap = 130px total pattern
  const dashSize = 12;
  const gapSize = 118;
  const patternLength = dashSize + gapSize;

  return (
    <g key={`connection-${id}`}>
      <defs>
        <linearGradient id={`grad-${id}`} x1={fromPos.x} y1={fromPos.y} x2={toPos.x} y2={toPos.y} gradientUnits="userSpaceOnUse">
          <stop stopColor={color} stopOpacity="0.7" />
          <stop offset="1" stopColor={color} stopOpacity="0.3" />
        </linearGradient>
      </defs>
      
      {/* Base line */}
      <path
        d={path}
        fill="none"
        stroke={`url(#grad-${id})`}
        strokeWidth={2}
        strokeLinecap="round"
        opacity={isDrawn ? 0.6 : 0}
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
            strokeWidth={3}
            strokeLinecap="round"
            strokeDasharray={`${dashSize} ${gapSize}`}
            opacity={0.9}
            style={{
              animation: `electricFlow 1.5s linear infinite`,
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
          {/* Glow layer */}
          <path
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={`${dashSize} ${gapSize}`}
            opacity={0.3}
            style={{
              animation: `electricFlow 1.5s linear infinite`,
              filter: `blur(3px)`,
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
      className="absolute flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-300 hover:scale-105"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: isVisible ? 1 : 0.8, opacity: isVisible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      style={{
        width: toPrecision(NODE_SIZE),
        height: toPrecision(NODE_SIZE),
        left: toPrecision(position.x - NODE_SIZE / 2),
        top: toPrecision(position.y - NODE_SIZE / 2),
        background: 'rgba(17, 17, 17, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        zIndex: 10,
      }}
      whileHover={{
        boxShadow: `0 8px 30px rgba(0, 0, 0, 0.5), 0 0 20px ${source.color}30`,
        borderColor: `${source.color}40`,
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

  const containerWidth = MAX_RADIUS * 2 + NODE_SIZE + 80;
  const containerHeight = MAX_RADIUS * 2 + NODE_SIZE + 80;
  const centerX = containerWidth / 2;
  const centerY = containerHeight / 2;

  const getNodeCenter = (source: DataSource) => {
    const angleRad = (source.angle * Math.PI) / 180;
    return {
      x: toPrecision(centerX + source.radius * Math.cos(angleRad)),
      y: toPrecision(centerY + source.radius * Math.sin(angleRad)),
    };
  };

  // Check visibility based on scroll
  const isNodeVisible = (index: number) => {
    const start = 0.2 + (index * 0.04);
    return scrollValue >= start;
  };

  const areLinesDrawn = scrollValue >= 0.55;
  const showElectricity = scrollValue >= 0.75;

  return (
    <div ref={containerRef} className="relative h-[180vh] bg-black z-0">
      <div className="sticky top-0 h-screen flex items-center overflow-hidden z-10">
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="space-y-6">
              <motion.p
                style={{ opacity: titleOpacity }}
                className="text-avoqado-green font-semibold text-sm tracking-widest uppercase"
              >
                Plataforma Unificada
              </motion.p>

              <motion.h2
                style={{ opacity: titleOpacity, y: titleY }}
                className="text-4xl md:text-5xl font-bold text-white leading-tight"
              >
                Un solo sistema.<br />
                <span className="text-gray-400">Cero conciliaciones.</span>
              </motion.h2>

              <motion.p
                style={{ opacity: useTransform(scrollYProgress, [0.1, 0.2], [0, 1]) }}
                className="text-gray-500 text-lg leading-relaxed max-w-lg"
              >
                Múltiples terminales, pagos en efectivo, tarjetas, QR y conexiones POS.
                Todo registrado automáticamente en un solo lugar.
              </motion.p>

              <motion.div
                style={{ opacity: useTransform(scrollYProgress, [0.6, 0.75], [0, 1]) }}
                className="space-y-3"
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

            {/* Right: Radial Diagram with Electric Flow */}
            <div className="flex justify-center lg:justify-end">
              <div
                className="relative"
                style={{ width: containerWidth, height: containerHeight }}
              >
                {/* Subtle radial gradient background */}
                <div 
                  className="absolute inset-0 rounded-full opacity-20"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(105, 225, 133, 0.15) 0%, transparent 50%)',
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
                    const nodeCenter = getNodeCenter(source);
                    return (
                      <ElectricConnection
                        key={`line-${source.id}`}
                        id={source.id}
                        fromPos={nodeCenter}
                        toPos={{ x: centerX, y: centerY }}
                        color={source.color}
                        isDrawn={areLinesDrawn}
                        showElectricity={showElectricity}
                        index={index}
                      />
                    );
                  })}
                </svg>

                {/* Center Node - Avoqado Logo Container */}
                <motion.div
                  className="absolute flex items-center justify-center rounded-full  bg-black"
                  style={{
                    width: CENTER_SIZE,
                    height: CENTER_SIZE,
                    left: centerX - CENTER_SIZE / 2,
                    top: centerY - CENTER_SIZE / 2,
                    opacity: centerOpacity,
                    zIndex: 20,
                    boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                  }}
                >
                  {/* Pulsing glow when electricity flows */}
                  {/* {showElectricity && (
                    <div 
                      className="absolute inset-0 rounded-full "
                      style={{
                        background: 'radial-gradient(circle, rgba(105, 225, 133, 0.2) 0%, transparent 80%)',
                        transform: 'scale(1.8)',
                        zIndex: -1
                      }}
                    />
                  )} */}
                  
                  {/* Inner logo */}
                  <div className="relative w-[77%] h-[77%] flex items-center justify-center">
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

                {/* Data Source Cards */}
                {DATA_SOURCES.map((source, index) => {
                  const nodeCenter = getNodeCenter(source);
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
  );
};
