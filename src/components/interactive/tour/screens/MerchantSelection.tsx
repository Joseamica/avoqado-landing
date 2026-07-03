/**
 * 4. MerchantSelection — "Seleccionar Cuenta": monto hero + desglose + la
 * selección MULTI-MERCHANT (founder request): el dinero de cada venta cae a
 * la cuenta bancaria que el negocio elige — cards apiladas con nombre +
 * banco, como las filas del TPV real. El método de pago (Tarjeta | Efectivo
 * | Cripto) pasa a segmentos inline de izquierda a derecha.
 */
import TopBar from './TopBar';
import { DEMO_BASE_LABEL, DEMO_TIP_LABEL, DEMO_TOTAL_LABEL } from '../flows';

interface Props {
  accountSelected: boolean;
  cardSelected: boolean;
}

const ACCOUNTS = [
  { id: 'operativa', name: 'Cuenta Operativa', bank: 'BBVA', target: 'acct-operativa' },
  { id: 'nomina', name: 'Cuenta Nómina', bank: 'Santander' },
  { id: 'creditos', name: 'Pago de créditos', bank: 'Inbursa' },
] as const;

const METHODS = [
  { id: 'card', label: 'Tarjeta', target: 'seg-card' },
  { id: 'cash', label: 'Efectivo' },
  { id: 'crypto', label: 'Cripto' },
] as const;

function Check() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" />
      <path d="M6 10.3l2.6 2.6L14 7.4" stroke="#2A2A2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function MerchantSelection({ accountSelected, cardSelected }: Props) {
  return (
    <section className="tpv-screen" data-screen="merchant">
      <TopBar title="Seleccionar Cuenta" subtitle={`Paso 3 de 3 · Total: ${DEMO_TOTAL_LABEL}`} />
      <div className="merchant-body">
        <div className="m-total">{DEMO_TOTAL_LABEL}</div>
        <div className="m-breakdown">Monto: {DEMO_BASE_LABEL}</div>
        <div className="m-breakdown">Propina: {DEMO_TIP_LABEL}</div>

        <div className="m-label">Cuenta destino</div>
        <div className="method-list">
          {ACCOUNTS.map(a => {
            const isSelected = a.id === 'operativa' && accountSelected;
            return (
              <button
                key={a.id}
                type="button"
                className={`method-row acct-row${isSelected ? ' selected' : ''}`}
                data-t={'target' in a ? a.target : undefined}
              >
                <span className="acct-copy">
                  <span className="acct-name">{a.name}</span>
                  <span className="acct-bank">{a.bank}</span>
                </span>
                {isSelected ? <Check /> : null}
              </button>
            );
          })}
        </div>

        <div className="m-label">Método de pago</div>
        <div className="method-seg">
          {METHODS.map(m => {
            const isSelected = m.id === 'card' && cardSelected;
            return (
              <button
                key={m.id}
                type="button"
                className={`method-chip${isSelected ? ' selected' : ''}`}
                data-t={'target' in m ? m.target : undefined}
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
