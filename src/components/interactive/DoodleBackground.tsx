import { motion, MotionValue, useTransform } from 'framer-motion';

// SVG Doodles con estilo infantil (trazos irregulares/temblorosos)
const DoodleSVGs = {
  // Estrellas
  star4: (color: string) => (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
      <path
        d="M16 2c0.5 4.5 1.2 7.8 5 9.5-4.2 0.8-5.5 4-5.5 8.5 0.2-4.8-1.8-7.2-5.5-8 4-1.5 5.2-5.2 6-10"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  star5: (color: string) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 2l2.5 7.5h8l-6.5 5 2.5 8-6.5-5-6.5 5 2.5-8-6.5-5h8z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  starBurst: (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M5 19l3-3M16 8l3-3"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),
  twinkle: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path
        d="M10 1c0.3 3.2 0.8 5.5 3.5 6.8-3 0.6-3.8 2.8-3.8 6 0.1-3.4-1.3-5-3.8-5.6 2.8-1 3.6-3.6 4.1-7.2"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),

  // Dinero
  dollar: (color: string) => (
    <svg width="24" height="36" viewBox="0 0 24 36" fill="none">
      <path
        d="M12 4v28M18 10c0-3-2.5-5-6-5s-6 1.8-6 4.5c0 3 2.5 4 6 5s6 2.5 6 5.5c0 3-2.8 5-6 5s-6-2-6-5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  coin: (color: string) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="14" rx="11" ry="10" stroke={color} strokeWidth="2" />
      <path
        d="M14 8v12M17 11c0-1.5-1.2-2.5-3-2.5s-3 0.8-3 2.2c0 1.5 1.2 2 3 2.5s3 1.2 3 2.8c0 1.5-1.3 2.5-3 2.5s-3-1-3-2.5"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  ),
  bills: (color: string) => (
    <svg width="36" height="24" viewBox="0 0 36 24" fill="none">
      <rect x="2" y="4" width="28" height="16" rx="2" stroke={color} strokeWidth="2" />
      <rect x="6" y="2" width="28" height="16" rx="2" stroke={color} strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="16" cy="12" r="4" stroke={color} strokeWidth="1.5" />
    </svg>
  ),

  // Tarjetas
  card: (color: string) => (
    <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
      <rect x="2" y="2" width="32" height="22" rx="3" stroke={color} strokeWidth="2" />
      <line x1="2" y1="9" x2="34" y2="9" stroke={color} strokeWidth="2" />
      <rect x="6" y="14" width="10" height="3" rx="1" stroke={color} strokeWidth="1.5" />
      <circle cx="28" cy="18" r="3" stroke={color} strokeWidth="1.5" />
      <circle cx="24" cy="18" r="3" stroke={color} strokeWidth="1.5" />
    </svg>
  ),
  chip: (color: string) => (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
      <rect x="2" y="2" width="20" height="16" rx="2" stroke={color} strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="18" stroke={color} strokeWidth="1.5" />
      <line x1="16" y1="2" x2="16" y2="18" stroke={color} strokeWidth="1.5" />
      <line x1="2" y1="7" x2="22" y2="7" stroke={color} strokeWidth="1.5" />
      <line x1="2" y1="13" x2="22" y2="13" stroke={color} strokeWidth="1.5" />
    </svg>
  ),

  // Porcentajes y datos
  percent: (color: string) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="8" cy="8" r="4" stroke={color} strokeWidth="2" />
      <circle cx="20" cy="20" r="4" stroke={color} strokeWidth="2" />
      <line x1="22" y1="6" x2="6" y2="22" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  ),
  chartUp: (color: string) => (
    <svg width="32" height="24" viewBox="0 0 32 24" fill="none">
      <path
        d="M2 20l8-6 6 4 12-14"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 4h6v6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  barChart: (color: string) => (
    <svg width="28" height="24" viewBox="0 0 28 24" fill="none">
      <rect x="2" y="14" width="5" height="8" stroke={color} strokeWidth="1.5" />
      <rect x="9" y="8" width="5" height="14" stroke={color} strokeWidth="1.5" />
      <rect x="16" y="4" width="5" height="18" stroke={color} strokeWidth="1.5" />
      <rect x="23" y="10" width="5" height="12" stroke={color} strokeWidth="1.5" />
    </svg>
  ),

  // Decorativos
  spiral: (color: string) => (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <path
        d="M14 14c0-2 1.5-3.5 3.5-3.5s3.5 1.5 3.5 3.5-1.5 5-5 5-7-2.5-7-6 3-7 7-7 9 3.5 9 8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  ),
  zigzag: (color: string) => (
    <svg width="32" height="16" viewBox="0 0 32 16" fill="none">
      <path
        d="M2 12l6-8 6 8 6-8 6 8 6-8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (color: string) => (
    <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
      <path
        d="M2 10l7 8L22 2"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  heart: (color: string) => (
    <svg width="24" height="22" viewBox="0 0 24 22" fill="none">
      <path
        d="M12 20S2 14 2 7.5C2 4 4.5 2 7.5 2c2 0 3.5 1 4.5 2.5C13 3 14.5 2 16.5 2 19.5 2 22 4 22 7.5 22 14 12 20 12 20z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  lightning: (color: string) => (
    <svg width="20" height="28" viewBox="0 0 20 28" fill="none">
      <path
        d="M11 2L3 14h6l-2 12 10-14h-6l2-10z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  ),
  waves: (color: string) => (
    <svg width="36" height="16" viewBox="0 0 36 16" fill="none">
      <path
        d="M2 8c3-4 6-4 9 0s6 4 9 0 6-4 9 0"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  ),

  // Aguacate mini
  avocado: (color: string) => (
    <svg width="24" height="32" viewBox="0 0 24 32" fill="none">
      <path
        d="M12 2c-6 0-10 8-10 16s4 12 10 12 10-4 10-12S18 2 12 2z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <ellipse cx="12" cy="20" rx="4" ry="5" stroke={color} strokeWidth="1.5" fill="none" />
    </svg>
  ),
  avocadoHalf: (color: string) => (
    <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
      <path
        d="M14 2C6 2 2 10 2 18s6 12 12 12 12-4 12-12S22 2 14 2z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      <circle cx="14" cy="18" r="5" stroke={color} strokeWidth="2" fill="none" />
      <circle cx="14" cy="18" r="2" fill={color} />
    </svg>
  ),

  // Extra decorativos
  circle: (color: string) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="7" stroke={color} strokeWidth="2" strokeDasharray="4 2" />
    </svg>
  ),
  dots: (color: string) => (
    <svg width="24" height="8" viewBox="0 0 24 8" fill="none">
      <circle cx="4" cy="4" r="2" fill={color} />
      <circle cx="12" cy="4" r="2" fill={color} />
      <circle cx="20" cy="4" r="2" fill={color} />
    </svg>
  ),
  arrow: (color: string) => (
    <svg width="28" height="16" viewBox="0 0 28 16" fill="none">
      <path
        d="M2 8h20M18 2l6 6-6 6"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

type DoodleType = keyof typeof DoodleSVGs;

interface DoodleConfig {
  id: string;
  type: DoodleType;
  x: string;
  y: string;
  rotation: number;
  scale: number;
  color: 'green' | 'white';
  opacity: number;
  parallaxSpeed: number;
}

// Configuracion de 28 doodles distribuidos por la pantalla
const doodleConfigs: DoodleConfig[] = [
  // Fila superior
  { id: 'd1', type: 'star4', x: '5%', y: '8%', rotation: 15, scale: 1, color: 'green', opacity: 0.3, parallaxSpeed: 0.3 },
  { id: 'd2', type: 'dollar', x: '20%', y: '5%', rotation: -10, scale: 0.9, color: 'white', opacity: 0.25, parallaxSpeed: 0.5 },
  { id: 'd3', type: 'twinkle', x: '35%', y: '12%', rotation: 20, scale: 1.1, color: 'green', opacity: 0.35, parallaxSpeed: 0.4 },
  { id: 'd4', type: 'percent', x: '55%', y: '6%', rotation: -5, scale: 0.85, color: 'white', opacity: 0.2, parallaxSpeed: 0.6 },
  { id: 'd5', type: 'starBurst', x: '75%', y: '10%', rotation: 30, scale: 1, color: 'green', opacity: 0.3, parallaxSpeed: 0.35 },
  { id: 'd6', type: 'coin', x: '90%', y: '8%', rotation: -15, scale: 0.9, color: 'white', opacity: 0.25, parallaxSpeed: 0.45 },

  // Segunda fila
  { id: 'd7', type: 'card', x: '8%', y: '25%', rotation: -8, scale: 0.8, color: 'green', opacity: 0.25, parallaxSpeed: 0.5 },
  { id: 'd8', type: 'spiral', x: '25%', y: '22%', rotation: 45, scale: 1, color: 'white', opacity: 0.2, parallaxSpeed: 0.3 },
  { id: 'd9', type: 'lightning', x: '45%', y: '28%', rotation: 10, scale: 0.9, color: 'green', opacity: 0.3, parallaxSpeed: 0.55 },
  { id: 'd10', type: 'star5', x: '65%', y: '20%', rotation: -20, scale: 1.1, color: 'white', opacity: 0.25, parallaxSpeed: 0.4 },
  { id: 'd11', type: 'chartUp', x: '85%', y: '26%', rotation: 5, scale: 0.85, color: 'green', opacity: 0.3, parallaxSpeed: 0.35 },

  // Tercera fila (zona media)
  { id: 'd12', type: 'avocado', x: '3%', y: '45%', rotation: -12, scale: 1, color: 'green', opacity: 0.35, parallaxSpeed: 0.45 },
  { id: 'd13', type: 'heart', x: '18%', y: '50%', rotation: 15, scale: 0.8, color: 'white', opacity: 0.2, parallaxSpeed: 0.5 },
  { id: 'd14', type: 'bills', x: '92%', y: '42%', rotation: -5, scale: 0.9, color: 'green', opacity: 0.25, parallaxSpeed: 0.4 },
  { id: 'd15', type: 'twinkle', x: '82%', y: '55%', rotation: 25, scale: 1, color: 'white', opacity: 0.3, parallaxSpeed: 0.35 },

  // Cuarta fila
  { id: 'd16', type: 'check', x: '6%', y: '65%', rotation: -10, scale: 0.9, color: 'green', opacity: 0.3, parallaxSpeed: 0.55 },
  { id: 'd17', type: 'star4', x: '22%', y: '70%', rotation: 35, scale: 1.1, color: 'white', opacity: 0.25, parallaxSpeed: 0.3 },
  { id: 'd18', type: 'chip', x: '40%', y: '68%', rotation: 8, scale: 0.85, color: 'green', opacity: 0.25, parallaxSpeed: 0.5 },
  { id: 'd19', type: 'waves', x: '60%', y: '72%', rotation: -3, scale: 1, color: 'white', opacity: 0.2, parallaxSpeed: 0.4 },
  { id: 'd20', type: 'barChart', x: '78%', y: '65%', rotation: 12, scale: 0.9, color: 'green', opacity: 0.3, parallaxSpeed: 0.45 },
  { id: 'd21', type: 'zigzag', x: '93%', y: '70%', rotation: -15, scale: 0.8, color: 'white', opacity: 0.25, parallaxSpeed: 0.35 },

  // Fila inferior
  { id: 'd22', type: 'avocadoHalf', x: '10%', y: '85%', rotation: 20, scale: 0.9, color: 'green', opacity: 0.3, parallaxSpeed: 0.4 },
  { id: 'd23', type: 'dollar', x: '28%', y: '88%', rotation: -8, scale: 1, color: 'white', opacity: 0.25, parallaxSpeed: 0.55 },
  { id: 'd24', type: 'starBurst', x: '48%', y: '82%', rotation: 40, scale: 1.1, color: 'green', opacity: 0.35, parallaxSpeed: 0.3 },
  { id: 'd25', type: 'circle', x: '68%', y: '90%', rotation: 0, scale: 1, color: 'white', opacity: 0.2, parallaxSpeed: 0.5 },
  { id: 'd26', type: 'percent', x: '85%', y: '85%', rotation: -25, scale: 0.85, color: 'green', opacity: 0.3, parallaxSpeed: 0.45 },

  // Extras dispersos
  { id: 'd27', type: 'dots', x: '50%', y: '15%', rotation: 0, scale: 1, color: 'white', opacity: 0.15, parallaxSpeed: 0.6 },
  { id: 'd28', type: 'arrow', x: '15%', y: '38%', rotation: 30, scale: 0.7, color: 'green', opacity: 0.2, parallaxSpeed: 0.35 },
];

const COLORS = {
  green: '#69E185',
  white: '#FFFFFF',
};

interface DoodleBackgroundProps {
  scrollYProgress: MotionValue<number>;
}

export default function DoodleBackground({ scrollYProgress }: DoodleBackgroundProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {doodleConfigs.map((doodle) => (
        <DoodleItem key={doodle.id} doodle={doodle} scrollYProgress={scrollYProgress} />
      ))}
    </div>
  );
}

function DoodleItem({ doodle, scrollYProgress }: { doodle: DoodleConfig; scrollYProgress: MotionValue<number> }) {
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [0, doodle.parallaxSpeed * 150]
  );

  const DoodleSVG = DoodleSVGs[doodle.type];
  const color = COLORS[doodle.color];

  return (
    <motion.div
      className="absolute will-change-transform"
      style={{
        left: doodle.x,
        top: doodle.y,
        rotate: doodle.rotation,
        scale: doodle.scale,
        opacity: doodle.opacity,
        y,
      }}
    >
      {DoodleSVG(color)}
    </motion.div>
  );
}
