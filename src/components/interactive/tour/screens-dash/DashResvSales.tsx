/**
 * DashResvSales — "Transacciones" at Estética Bella (dash-resv-sales): the
 * reserva flow's final scene. Marking Sofía's cita as attended ("Llegó")
 * turned it into a charge — her $250 lands highlighted in Ventas, closing
 * the reservation → attendance → money loop.
 *
 * Fully static — the sale row's entry animation triggers via CSS when the
 * screen gains `.active` (same pattern as the calendar card), with a
 * prefers-reduced-motion override in tour-dash.css.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

export default function DashResvSales() {
  return (
    <section className="web-screen lg dash-resv-sales" data-screen="dash-resv-sales">
      <DashShell venue="Estética Bella" nav={<ChainNav active="nav-ventas" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Transacciones</h1>
            <p className="lg-subtitle">La cita atendida se cobró sola — ya vive en tus ventas.</p>
          </div>
        </div>

        <div className="lg-table dash-rsales-table">
          <div className="lg-tr dash-rsales-tr lg-th">
            <span>Monto</span>
            <span>Concepto</span>
            <span>Cliente</span>
            <span>Hora</span>
          </div>
          <div className="lg-tr dash-rsales-tr dash-rsales-row-new">
            <span className="lg-tcell">
              <b>$250.00</b>
              <span className="lg-badge dash-badge-new">Nueva</span>
            </span>
            <span>Corte de cabello</span>
            <span>Sofía Ramírez</span>
            <span className="lg-date">ahora</span>
          </div>
          <div className="lg-tr dash-rsales-tr">
            <span>$350.00</span>
            <span>Manicure spa</span>
            <span>Karla M.</span>
            <span className="lg-date">11:05</span>
          </div>
          <div className="lg-tr dash-rsales-tr">
            <span>$180.00</span>
            <span>Venta mostrador</span>
            <span>Público general</span>
            <span className="lg-date">09:15</span>
          </div>
        </div>
      </DashShell>
    </section>
  );
}
