/**
 * DashInventory — "Inventario" (dash-inventory, flow B only): the catalog
 * table showing stock quietly decrementing after the sale, no manual entry.
 * Premium-tier feature (INVENTORY_TRACKING) — badge is informative only,
 * no real gating in the tour (see spec "Fuera de alcance").
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';
import PremiumBadge from './PremiumBadge';

interface Props {
  counted: boolean;
}

interface Row {
  id: string;
  name: string;
  soldToday: number;
  soldAfter: number;
  stockBefore: number;
  stockAfter: number;
  restock?: boolean;
}

const ROWS: Row[] = [
  { id: 'playera', name: 'Playera básica blanca', soldToday: 0, soldAfter: 1, stockBefore: 12, stockAfter: 11 },
  { id: 'gorra', name: 'Gorra logo', soldToday: 0, soldAfter: 1, stockBefore: 8, stockAfter: 7, restock: true },
  { id: 'sudadera', name: 'Sudadera premium', soldToday: 0, soldAfter: 0, stockBefore: 15, stockAfter: 15 },
  { id: 'lentes', name: 'Lentes de sol', soldToday: 0, soldAfter: 0, stockBefore: 9, stockAfter: 9 },
  { id: 'termo', name: 'Termo 600ml', soldToday: 0, soldAfter: 0, stockBefore: 12, stockAfter: 12 },
  { id: 'llavero', name: 'Llavero metálico', soldToday: 0, soldAfter: 0, stockBefore: 30, stockAfter: 30 },
];

export default function DashInventory({ counted }: Props) {
  return (
    <section className="web-screen lg dash-inventory" data-screen="dash-inventory">
      <DashShell nav={<ChainNav active="nav-inv" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">
              Inventario <PremiumBadge />
            </h1>
            <p className="lg-subtitle">Se descontó solo — sin capturar nada.</p>
          </div>
        </div>

        <div className="lg-table dash-inv-table">
          <div className="lg-tr lg-th dash-inv-tr">
            <span>Producto</span>
            <span>Vendidos hoy</span>
            <span>Stock</span>
            <span>Estado</span>
          </div>
          {ROWS.map(row => {
            const isMover = row.id === 'playera' || row.id === 'gorra';
            const sold = counted && isMover ? row.soldAfter : row.soldToday;
            const stock = counted && isMover ? row.stockAfter : row.stockBefore;
            return (
              <div className="lg-tr dash-inv-tr" key={row.id}>
                <span className="lg-tcell">
                  <b>{row.name}</b>
                </span>
                <span className={isMover && counted ? 'dash-inv-counting' : undefined}>{sold}</span>
                <span className={isMover && counted ? 'dash-inv-counting' : undefined}>{stock}</span>
                <span>{row.restock && counted ? <span className="dash-badge-amber">Resurtir pronto</span> : null}</span>
              </div>
            );
          })}
        </div>
      </DashShell>
    </section>
  );
}
