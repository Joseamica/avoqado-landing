/**
 * DashBancos — "Bancos" (dash-bancos): saldo y movimientos por cuenta, la
 * funcionalidad de bancos que la plataforma está estrenando. Cierra el loop
 * del paso multi-merchant: el visitante ELIGIÓ Cuenta Operativa (BBVA) al
 * cobrar y aquí ve su venta caer en esa cuenta.
 *
 * Los montos cuadran EXACTO con el resto del demo (no inventar):
 * BBVA hoy $3,352.00 en 8 cobros → +$348.10 de esta venta = $3,700.10 en 9
 * (lo que cita AI_ANSWER_3); Santander hoy $1,514.00; Inbursa $18,400 al mes
 * y 61% de meta (AI_ANSWER_4). `bancosIn` sigue el patrón `counted` de
 * DashReport: la venta entra como movimiento (fila siempre montada, gateada
 * por clase) y el saldo/hoy cambian con el highlight de conteo.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

interface Props {
  bancosIn: boolean;
}

const MOVS = [
  { name: 'Liga de pago · Sesión de fotos', time: '12:41', amount: '+$350.00', in: true },
  { name: 'Venta TPV · Luis — Tarjeta', time: '12:05', amount: '+$520.00', in: true },
  { name: 'Transferencia · Pago de créditos (Inbursa)', time: '9:00', amount: '-$2,000.00', in: false },
];

function MovIcon({ inbound }: { inbound: boolean }) {
  return (
    <span className={`dash-bank-mov-ic${inbound ? ' in' : ''}`}>
      <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {inbound ? <path d="M8 3v9M4.5 8.5 8 12l3.5-3.5" /> : <path d="M8 13V4M4.5 7.5 8 4l3.5 3.5" />}
      </svg>
    </span>
  );
}

export default function DashBancos({ bancosIn }: Props) {
  return (
    <section className="web-screen lg dash-bank" data-screen="dash-bancos">
      <DashShell nav={<ChainNav active="nav-bancos" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Bancos</h1>
            <p className="lg-subtitle">Saldo y movimientos de tus cuentas — sin entrar al portal del banco.</p>
          </div>
        </div>

        <div className="dash-bank-cards">
          <div className="dash-bank-card active">
            <span className="dash-bank-card-label">Cuenta Operativa · BBVA</span>
            <b className={`dash-bank-card-value${bancosIn ? ' dash-rep-counting' : ''}`}>{bancosIn ? '$48,230.75' : '$47,882.65'}</b>
            <span className="dash-bank-card-sub">{bancosIn ? 'Hoy +$3,700.10 · 9 cobros' : 'Hoy +$3,352.00 · 8 cobros'}</span>
          </div>
          <div className="dash-bank-card">
            <span className="dash-bank-card-label">Cuenta Nómina · Santander</span>
            <b className="dash-bank-card-value">$12,890.00</b>
            <span className="dash-bank-card-sub">Hoy +$1,514.00</span>
          </div>
          <div className="dash-bank-card">
            <span className="dash-bank-card-label">Pago de créditos · Inbursa</span>
            <b className="dash-bank-card-value">$18,400.00</b>
            <span className="dash-bank-card-sub">Enviado este mes · 61% de tu meta</span>
          </div>
        </div>

        <div className="dash-bank-movs">
          <p className="dash-bank-movs-title">Movimientos · Cuenta Operativa (BBVA)</p>
          {/* La venta recién cobrada — siempre montada, entra por clase. */}
          <div className={`dash-bank-mov ${bancosIn ? 'dash-sale-row-in' : 'dash-sale-row-hidden'}`}>
            <MovIcon inbound />
            <span className="dash-bank-mov-text">
              <b>
                Venta TPV · Ana — Tarjeta
                <span className="lg-badge dash-badge-new">Nueva</span>
              </b>
              <span>hace 1 min</span>
            </span>
            <b className="dash-bank-mov-amount in">+$348.10</b>
          </div>
          {MOVS.map(m => (
            <div className="dash-bank-mov" key={m.name}>
              <MovIcon inbound={m.in} />
              <span className="dash-bank-mov-text">
                <b>{m.name}</b>
                <span>{m.time}</span>
              </span>
              <b className={`dash-bank-mov-amount${m.in ? ' in' : ''}`}>{m.amount}</b>
            </div>
          ))}
        </div>
      </DashShell>
    </section>
  );
}
