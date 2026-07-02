/**
 * DashCommission — "Equipo · Comisiones" (dash-commission): the commission
 * scheme applied to this sale, credited to Ana Torres automatically.
 * Static screen, no props — matches spec "Escenas" table for dash-commission.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

interface StaffRow {
  id: string;
  name: string;
  today: string;
  biweekly: string;
  goal: string;
  pct: number;
}

const ROWS: StaffRow[] = [
  { id: 'ana', name: 'Ana Torres', today: '+$29.50', biweekly: '$312.40', goal: '$400', pct: 78 },
  { id: 'luis', name: 'Luis Mora', today: '$0.00', biweekly: '$198.00', goal: '$400', pct: 49 },
];

export default function DashCommission() {
  return (
    <section className="web-screen lg dash-commission" data-screen="dash-commission">
      <DashShell nav={<ChainNav active="nav-equipo" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Equipo · Comisiones</h1>
            <p className="lg-subtitle">Cada venta suma a la comisión de quien cobró — sin Excel a fin de quincena.</p>
          </div>
        </div>

        <div className="dash-com-scheme">
          <p className="dash-com-scheme-label">Esquema</p>
          <p className="dash-com-scheme-text">Mostrador · 10% sobre venta (sin propina)</p>
        </div>

        <div className="lg-table dash-com-table">
          <div className="lg-tr lg-th dash-com-tr">
            <span>Empleado</span>
            <span>Hoy</span>
            <span>Quincena</span>
            <span>Meta</span>
          </div>
          {ROWS.map(row => (
            <div className="lg-tr dash-com-tr" key={row.id}>
              <span className="lg-tcell">
                <b>{row.name}</b>
              </span>
              <span className={row.id === 'ana' ? 'dash-com-today-up' : undefined}>{row.today}</span>
              <span>{row.biweekly}</span>
              <span className="dash-com-goal">
                <span className="dash-com-bar">
                  <span className="dash-com-bar-fill" style={{ width: `${row.pct}%` }} />
                </span>
                <span className="dash-com-goal-label">
                  {row.pct}% · meta {row.goal}
                </span>
              </span>
            </div>
          ))}
        </div>
      </DashShell>
    </section>
  );
}
