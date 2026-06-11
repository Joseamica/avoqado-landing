/**
 * 4. MerchantSelection — "Seleccionar Cuenta": total + desglose + estrellas,
 * cuenta receptora y método de pago (Tarjeta | Efectivo | Cripto).
 */
import TopBar from './TopBar';
import { DEMO_BASE_LABEL, DEMO_TIP_LABEL, DEMO_TOTAL_LABEL } from '../flows';

interface Props {
  cardSelected: boolean;
}

export default function MerchantSelection({ cardSelected }: Props) {
  return (
    <section className="tpv-screen" data-screen="merchant">
      <TopBar title="Seleccionar Cuenta" subtitle={`Paso 3 de 3 · Total: ${DEMO_TOTAL_LABEL} MXN`} />
      <div className="merchant-body">
        <div className="m-total">{DEMO_TOTAL_LABEL}</div>
        <div className="m-breakdown">
          Monto: {DEMO_BASE_LABEL} · Propina: {DEMO_TIP_LABEL}
        </div>
        <div className="m-stars" aria-label="Calificación 5 estrellas">
          &#9733;&#9733;&#9733;&#9733;&#9733;
        </div>

        <div className="merchant-card">
          <div className="m-avatar">B</div>
          <div className="m-info">
            <div className="m-name">Boutique Demo</div>
            <div className="m-sub">Cuenta principal</div>
          </div>
          <svg className="m-check" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M6 10.3l2.6 2.6L14 7.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div className="m-label">Método de pago</div>
        <div className="seg-row">
          <button type="button" className={`seg${cardSelected ? ' selected' : ''}`} data-t="seg-card">
            Tarjeta
          </button>
          <button type="button" className="seg">
            Efectivo
          </button>
          <button type="button" className="seg">
            Cripto
          </button>
        </div>
      </div>
    </section>
  );
}
