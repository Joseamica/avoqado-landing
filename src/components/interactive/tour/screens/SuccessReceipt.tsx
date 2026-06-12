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
/* Paleta real del TPV (PaymentApprovedScreen.kt) */
const CONFETTI_COLORS = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#7B68EE', '#22C55E', '#3B82F6'];
const CONFETTI_COUNT = 50;

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
        {/* toolbar real: Home (outline) + "Nuevo Pago" neutro + detalles */}
        <div className="receipt-toolbar">
          <button type="button" className="icon-btn" aria-label="Inicio">
            <svg width="19" height="18" viewBox="0 0 17 16" fill="none" aria-hidden="true">
              <path
                d="M2 7.2 8.5 1.8 15 7.2V13a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 13V7.2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button type="button" className="btn btn-neutral" data-action="new-payment">
            Nuevo Pago
          </button>
          <button type="button" className="icon-btn" aria-label="Detalles de la orden">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        {/* ticket oscuro (surfaceVariant #282828) con QR en caja blanca, como el real */}
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
        {/* barra segmentada de acciones con iconos (real), WA en #25D366 */}
        <div className="receipt-segbar">
          <button type="button">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 9V3h12v6M6 18h12v3H6v-3zM4 9h16a2 2 0 0 1 2 2v5h-4M2 16h4v-5a2 2 0 0 1 2-2" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Imprimir
          </button>
          <button type="button">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
              <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
            Email
          </button>
          <button type="button" className="wa">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5.1-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.2 1.1-1.7 1.2-.4 0-.9.2-3.1-.6-2.6-1-4.3-3.7-4.4-3.9-.1-.2-1.1-1.4-1.1-2.7s.7-1.9 1-2.2c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.1c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.8 1.3 1.7 2.1 1.2 1.1 2.2 1.4 2.5 1.5.3.1.5.1.7-.1l1-1.2c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.6.4 0 .1 0 .7-.2 1.3z" />
            </svg>
            WhatsApp
          </button>
        </div>
      </div>
    </section>
  );
}
