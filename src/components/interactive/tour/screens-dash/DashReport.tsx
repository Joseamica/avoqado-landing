/**
 * DashReport — "Reportes · Hoy" (dash-report): the day's counters ticking up
 * by exactly this sale's amounts, a static hourly bar chart (last bar grows
 * on entry — no real Date read, fully deterministic), and the payment-method
 * split. Mirrors DashInventory's `counted` prop pattern: before/after values
 * swap once the step's onEnter fires `reportCount`.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

interface Props {
  counted: boolean;
}

/* Static mock hours 9:00-14:00 — heights are illustrative only, the last bar
   (14:00, "now") grows when `counted` flips, everything else stays fixed. */
const HOURS: { label: string; before: number; after?: number }[] = [
  { label: '9:00', before: 38 },
  { label: '10:00', before: 52 },
  { label: '11:00', before: 61 },
  { label: '12:00', before: 74 },
  { label: '13:00', before: 66 },
  { label: '14:00', before: 70, after: 100 },
];

export default function DashReport({ counted }: Props) {
  const ventas = counted ? 14 : 13;
  const total = counted ? '$5,214.10' : '$4,866.00';
  const propinas = counted ? '$540.30' : '$487.20';

  return (
    <section className="web-screen lg dash-report" data-screen="dash-report">
      <DashShell nav={<ChainNav active="nav-reportes" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Reportes · Hoy</h1>
            <p className="lg-subtitle">Tu corte del día se arma solo — sin cerrar caja a mano.</p>
          </div>
        </div>

        <div className="dash-rep-counters">
          <div className="dash-rep-counter">
            <span className="dash-rep-counter-label">Ventas</span>
            <span className={`dash-rep-counter-value${counted ? ' dash-rep-counting' : ''}`}>{ventas}</span>
          </div>
          <div className="dash-rep-counter">
            <span className="dash-rep-counter-label">Total</span>
            <span className={`dash-rep-counter-value${counted ? ' dash-rep-counting' : ''}`}>{total}</span>
          </div>
          <div className="dash-rep-counter">
            <span className="dash-rep-counter-label">Propinas</span>
            <span className={`dash-rep-counter-value${counted ? ' dash-rep-counting' : ''}`}>{propinas}</span>
          </div>
        </div>

        <div className="dash-rep-chart">
          <p className="dash-rep-chart-title">Ventas por hora</p>
          <div className="dash-rep-bars">
            {HOURS.map(h => {
              const height = h.after !== undefined && counted ? h.after : h.before;
              const isLast = h.after !== undefined;
              return (
                <div className="dash-rep-bar-col" key={h.label}>
                  <span
                    className={`dash-rep-bar${isLast && counted ? ' dash-rep-bar-grow' : ''}`}
                    style={{ height: `${height}%` }}
                  />
                  <span className="dash-rep-bar-label">{h.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="dash-rep-methods">
          <span>
            Tarjeta <b>71%</b>
          </span>
          <span>
            Efectivo <b>29%</b>
          </span>
        </div>
      </DashShell>
    </section>
  );
}
