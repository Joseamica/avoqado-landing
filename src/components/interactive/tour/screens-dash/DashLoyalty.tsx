/**
 * DashLoyalty — "Clientes · Lealtad" (dash-loyalty): María G. earning points
 * from this exact sale, moving her toward her next reward automatically.
 * Static screen, no props — matches spec "Escenas" table for dash-loyalty.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

const TOTAL_POINTS = 220;
const REWARD_POINTS = 250;
const POINTS_MISSING = REWARD_POINTS - TOTAL_POINTS;
const PROGRESS_PCT = Math.round((TOTAL_POINTS / REWARD_POINTS) * 100);

export default function DashLoyalty() {
  return (
    <section className="web-screen lg dash-loyalty" data-screen="dash-loyalty">
      <DashShell nav={<ChainNav active="nav-clientes" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Clientes · Lealtad</h1>
            <p className="lg-subtitle">Si tu cliente está en tu directorio, cada compra suma sola.</p>
          </div>
        </div>

        <div className="dash-loy-card">
          <div className="dash-loy-avatar">MG</div>
          <div className="dash-loy-body">
            <p className="dash-loy-name">María G.</p>
            <p className="dash-loy-points-earned">+29 puntos por esta compra</p>
            <p className="dash-loy-rule">1 punto por cada $10 de compra (sin propina)</p>

            <div className="dash-loy-progress">
              <div className="dash-loy-progress-head">
                <span>{TOTAL_POINTS} pts</span>
                <span>Sesión mini gratis · {REWARD_POINTS} pts</span>
              </div>
              <span className="dash-loy-bar">
                <span className="dash-loy-bar-fill" style={{ width: `${PROGRESS_PCT}%` }} />
              </span>
              <p className="dash-loy-missing">Le faltan {POINTS_MISSING} pts</p>
            </div>
          </div>
        </div>
      </DashShell>
    </section>
  );
}
