/**
 * DashLive — "Transacciones" (dash-live), the key scene of the post-sale
 * chain: the visitor's own sale slides into the live table, then a cascade
 * of events (inventory/invoice/commission/loyalty) reveals in the side panel
 * — Avoqado's "cobrando se dispara todo" differentiator.
 *
 * Purely presentational — state (`saleRowIn`, `cascadeShown`) is owned by
 * `ChainState` and driven by flows-chain.ts step timers.
 */
import type { ReactNode } from 'react';
import DashShell from './DashShell';
import ChainNav from './ChainNav';

interface Props {
  saleRowIn: boolean;
  cascadeShown: number;
  flow: 'A' | 'B';
}

function EvIcon({ p }: { p: ReactNode }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p}
    </svg>
  );
}

const evIc = {
  inventario: (
    <>
      <path d="M2.5 5.2 8 2.5l5.5 2.7L8 7.9Z" />
      <path d="M2.5 5.2v5.6L8 13.5l5.5-2.7V5.2" />
      <path d="M8 7.9v5.6" />
    </>
  ),
  factura: (
    <>
      <path d="M4 2.5h6l2.5 2.5v8a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-10A.5.5 0 0 1 4 2.5Z" />
      <path d="M5.6 6.2h4.8M5.6 8.4h4.8M5.6 10.6h3" />
    </>
  ),
  comision: (
    <>
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 4.8v6.4M9.9 6.1c-.3-.5-1-.9-1.9-.9-1.1 0-1.9.6-1.9 1.4 0 1.9 3.8.9 3.8 2.8 0 .8-.8 1.4-1.9 1.4-.9 0-1.6-.4-1.9-.9" />
    </>
  ),
  lealtad: (
    <path d="M8 2.8 9.7 6.3l3.8.5-2.8 2.7.7 3.8L8 11.4l-3.4 1.9.7-3.8-2.8-2.7 3.8-.5Z" />
  ),
};

interface ChainEvent {
  key: 'ev-inv' | 'ev-cfdi' | 'ev-com' | 'ev-loy';
  icon: ReactNode;
  title: string;
  detail: string;
}

const EVENTS: Record<ChainEvent['key'], ChainEvent> = {
  'ev-inv': { key: 'ev-inv', icon: evIc.inventario, title: 'Inventario', detail: 'Playera básica blanca −1 · Gorra logo −1' },
  'ev-cfdi': { key: 'ev-cfdi', icon: evIc.factura, title: 'Facturación', detail: 'Autofactura lista en el recibo' },
  'ev-com': { key: 'ev-com', icon: evIc.comision, title: 'Comisiones', detail: 'Ana Torres +$29.50' },
  'ev-loy': { key: 'ev-loy', icon: evIc.lealtad, title: 'Lealtad', detail: 'María G. +29 puntos' },
};

/* Flow B shows 4 events (inventario included); flow A skips inventario and
   shows only 3 — the cascadeShown count from the engine lines up with
   however many of THIS flow's list are visible at that point. */
const ORDER_B: ChainEvent['key'][] = ['ev-inv', 'ev-cfdi', 'ev-com', 'ev-loy'];
const ORDER_A: ChainEvent['key'][] = ['ev-cfdi', 'ev-com', 'ev-loy'];

export default function DashLive({ saleRowIn, cascadeShown, flow }: Props) {
  const order = flow === 'B' ? ORDER_B : ORDER_A;
  const visible = order.slice(0, cascadeShown);

  return (
    <section className="web-screen lg dash-live" data-screen="dash-live">
      <DashShell nav={<ChainNav active="ventas" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Transacciones</h1>
            <p className="lg-subtitle">Cada cobro, al segundo</p>
          </div>
        </div>

        <div className="dash-live-body">
          <div className="lg-table dash-live-table">
            <div className="lg-tr lg-th dash-live-tr">
              <span>Monto</span>
              <span>Método</span>
              <span>Empleado</span>
              <span>Hora</span>
            </div>
            <div className={`lg-tr dash-live-tr${saleRowIn ? ' lg-row-new dash-sale-row-in' : ' dash-sale-row-hidden'}`}>
              <span className="lg-tcell">
                <b>$348.10</b>
                {saleRowIn && <span className="lg-badge dash-badge-new">Nueva</span>}
              </span>
              <span>Tarjeta</span>
              <span>Ana Torres</span>
              <span className="lg-date">ahora</span>
            </div>
            <div className="lg-tr dash-live-tr">
              <span>$1,250.00</span>
              <span>Efectivo</span>
              <span>Luis Mora</span>
              <span className="lg-date">10:12</span>
            </div>
            <div className="lg-tr dash-live-tr">
              <span>$890.00</span>
              <span>Tarjeta</span>
              <span>Ana Torres</span>
              <span className="lg-date">09:48</span>
            </div>
          </div>

          <aside className="dash-activity-panel">
            <p className="dash-activity-title">Actividad de esta venta</p>
            <ul className="dash-activity-list">
              {visible.map(key => {
                const ev = EVENTS[key];
                return (
                  <li key={ev.key} className="dash-activity-item dash-activity-item-in" data-t={ev.key}>
                    <span className="dash-activity-ic">
                      <EvIcon p={ev.icon} />
                    </span>
                    <span className="dash-activity-text">
                      <b>{ev.title}</b>
                      <span>{ev.detail}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </div>
      </DashShell>
    </section>
  );
}
