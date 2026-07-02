/**
 * DashCfdi — "Facturación" (dash-cfdi): the sale ready for self-billing +
 * a preview of the customer's own portal to generate their CFDI 4.0.
 * Premium-tier feature (CFDI) — badge is informative only, no real gating
 * in the tour (see spec "Fuera de alcance"). Static screen, no props.
 *
 * PHASE 3 NOTE: this is the TEMPORARY final screen of the chain until
 * Phase 4 lands dash-commission/dash-loyalty/dash-report/dash-ai — see
 * flows-chain.ts and the spec's "Steps nuevos" table.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';
import PremiumBadge from './PremiumBadge';

/* Small deterministic QR mock (same seeded-PRNG + finder-pattern approach as
   SuccessReceipt.tsx's receipt QR, at a smaller grid — purely decorative). */
const QR_SIZE = 15;

function buildQrCells(): { x: number; y: number }[] {
  let seed = 20260702;
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
    for (let y = -1; y < 6; y++) {
      for (let x = -1; x < 6; x++) {
        const gx = ox + x;
        const gy = oy + y;
        if (gx < 0 || gy < 0 || gx >= QR_SIZE || gy >= QR_SIZE) continue;
        if (x === -1 || x === 5 || y === -1 || y === 5) grid[gy]![gx] = false;
      }
    }
    for (let y = 0; y < 5; y++) {
      for (let x = 0; x < 5; x++) {
        const ring = x === 0 || x === 4 || y === 0 || y === 4;
        const core = x === 2 && y === 2;
        grid[oy + y]![ox + x] = ring || core;
      }
    }
  };
  finder(0, 0);
  finder(QR_SIZE - 5, 0);
  finder(0, QR_SIZE - 5);

  const cells: { x: number; y: number }[] = [];
  for (let y = 0; y < QR_SIZE; y++) {
    for (let x = 0; x < QR_SIZE; x++) {
      if (grid[y]![x]) cells.push({ x, y });
    }
  }
  return cells;
}

const QR_CELLS = buildQrCells();

export default function DashCfdi() {
  return (
    <section className="web-screen lg dash-cfdi" data-screen="dash-cfdi">
      <DashShell nav={<ChainNav active="nav-cfdi" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">
              Facturación <PremiumBadge />
            </h1>
            <p className="lg-subtitle">Tu cliente se factura solo desde el QR del recibo — tú no capturas nada.</p>
          </div>
        </div>

        <div className="dash-cfdi-body">
          <div className="dash-cfdi-card">
            <p className="dash-cfdi-card-label">Venta</p>
            <p className="dash-cfdi-ref">
              B-1042 · $295.00 · <span className="dash-cfdi-available">Autofactura disponible</span>
            </p>
            <div className="dash-cfdi-qr">
              <svg viewBox={`0 0 ${QR_SIZE} ${QR_SIZE}`} shapeRendering="crispEdges" role="img" aria-label="Código QR de autofactura (demo)">
                {QR_CELLS.map(({ x, y }) => (
                  <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#1C1C1C" />
                ))}
              </svg>
            </div>
            <p className="dash-cfdi-note">El QR va en el recibo de tu cliente</p>
          </div>

          <div className="dash-cfdi-card dash-cfdi-portal">
            <p className="dash-cfdi-card-label">Portal del cliente</p>
            <h3 className="dash-cfdi-portal-title">Genera tu factura</h3>
            <span className="lg-flabel">RFC</span>
            <div className="lg-input filled">XAXX010101000</div>
            <button type="button" className="lg-btn-primary dash-cfdi-btn">
              Generar CFDI 4.0
            </button>
            <p className="dash-cfdi-note">Tu cliente captura su RFC una vez — el CFDI llega solo a su correo.</p>
          </div>
        </div>

        <div className="dash-cfdi-breakdown">
          <span>
            Subtotal <b>$254.31</b>
          </span>
          <span>
            IVA 16% <b>$40.69</b>
          </span>
          <span>
            Total <b>$295.00</b>
          </span>
          <span className="dash-cfdi-breakdown-note">(la propina no se factura)</span>
        </div>
      </DashShell>
    </section>
  );
}
