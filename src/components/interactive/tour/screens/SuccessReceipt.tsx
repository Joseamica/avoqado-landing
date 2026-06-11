/**
 * 7a. Success — "Aprobado": círculo que se dibuja + check con bounce
 * (animaciones CSS al activarse la pantalla) + ráfaga de confetti.
 * 7b. Receipt — recibo estilo ticket con QR determinista, divisor
 * punteado, desglose y acciones Imprimir | Email | WhatsApp.
 */
import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import { DEMO_BASE_LABEL, DEMO_TIP_LABEL, DEMO_TOTAL_LABEL } from '../flows';

/* ==========================================================
   Confetti — 44 piezas regeneradas en cada aprobación
   ========================================================== */
const CONFETTI_COLORS = ['#10B981', '#34D399', '#FBBF24', '#F472B6', '#60A5FA', '#FAFAFA'];
const CONFETTI_COUNT = 44;

function buildConfettiStyles(): CSSProperties[] {
  return Array.from({ length: CONFETTI_COUNT }, (_, i) => {
    const size = 5 + Math.random() * 4;
    return {
      left: `${Math.random() * 100}%`,
      width: `${size}px`,
      height: `${size * 1.6}px`,
      background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      '--dx': `${((Math.random() - 0.5) * 90).toFixed(0)}px`,
      '--rot': `${((Math.random() - 0.5) * 720).toFixed(0)}deg`,
      animationDuration: `${(1.2 + Math.random() * 1.1).toFixed(2)}s`,
      animationDelay: `${(Math.random() * 0.5).toFixed(2)}s`,
    } as CSSProperties;
  });
}

interface SuccessProps {
  /** 0 = no confetti (reset); increments on every approval to replay the burst. */
  confettiKey: number;
}

export function SuccessScreen({ confettiKey }: SuccessProps) {
  const pieces = useMemo(() => (confettiKey === 0 ? [] : buildConfettiStyles()), [confettiKey]);

  return (
    <section className="tpv-screen screen-success" data-screen="success">
      <div className="success-body">
        <div className="confetti-layer" aria-hidden="true">
          {pieces.map((style, i) => (
            <i key={`${confettiKey}-${i}`} style={style} />
          ))}
        </div>
        <svg className="success-svg" viewBox="0 0 120 120" aria-hidden="true">
          <circle className="sc-circle" cx="60" cy="60" r="50" pathLength="100" />
          <path className="sc-check" d="M38 62 L54 78 L84 46" pathLength="100" />
        </svg>
        <div className="success-title">Aprobado</div>
        <div className="success-amount">{DEMO_TOTAL_LABEL}</div>
      </div>
    </section>
  );
}

/* ==========================================================
   Fake QR — deterministic (same seed as the approved mockup)
   ========================================================== */
const QR_SIZE = 21;

function buildQrCells(): { x: number; y: number }[] {
  let seed = 20260610;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const grid: boolean[][] = [];
  for (let y = 0; y < QR_SIZE; y++) {
    grid[y] = [];
    for (let x = 0; x < QR_SIZE; x++) grid[y]![x] = rnd() < 0.44;
  }

  const finder = (ox: number, oy: number) => {
    /* quiet zone around finder */
    for (let y = -1; y < 8; y++) {
      for (let x = -1; x < 8; x++) {
        const gx = ox + x;
        const gy = oy + y;
        if (gx < 0 || gy < 0 || gx >= QR_SIZE || gy >= QR_SIZE) continue;
        if (x === -1 || x === 7 || y === -1 || y === 7) grid[gy]![gx] = false;
      }
    }
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        const ring = x === 0 || x === 6 || y === 0 || y === 6;
        const core = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        grid[oy + y]![ox + x] = ring || core;
      }
    }
  };
  finder(0, 0);
  finder(QR_SIZE - 7, 0);
  finder(0, QR_SIZE - 7);

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (grid[y]![x]) cells.push({ x, y });
    }
  }
  return cells;
}

const QR_CELLS = buildQrCells();

export function ReceiptScreen() {
  return (
    <section className="tpv-screen" data-screen="receipt">
      <div className="receipt-body">
        <button type="button" className="btn btn-green" data-action="new-payment">
          Nuevo Pago
        </button>
        <div className="ticket">
          <div className="qr">
            <svg viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} shapeRendering="crispEdges" role="img" aria-label="Código QR del recibo (demo)">
              {QR_CELLS.map(({ x, y }) => (
                <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1C1C1C" />
              ))}
            </svg>
          </div>
          <p className="qr-copy">Escanea el código QR para descargar el recibo y dejar una calificación</p>
          <hr className="dash" />
          <div className="row total">
            <span>Total pagado</span>
            <b>{DEMO_TOTAL_LABEL}</b>
          </div>
          <div className="row">
            <span>Monto:</span>
            <span>{DEMO_BASE_LABEL}</span>
          </div>
          <div className="row">
            <span>Propina:</span>
            <span>{DEMO_TIP_LABEL}</span>
          </div>
        </div>
        <div className="receipt-actions">
          <button type="button" className="btn btn-outline">
            Imprimir
          </button>
          <button type="button" className="btn btn-outline">
            Email
          </button>
          <button type="button" className="btn btn-outline">
            WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
