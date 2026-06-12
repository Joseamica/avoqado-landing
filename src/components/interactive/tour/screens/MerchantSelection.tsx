/**
 * 4. MerchantSelection — "Seleccionar Cuenta", fiel al TPV real con UN solo
 * merchant (MerchantSelectionContent.kt): NO hay card de cuenta — monto hero
 * + "Monto:"/"Propina:" en dos líneas apiladas + estrellas emoji ⭐, y el
 * método de pago como filas (Tarjeta | Efectivo | Cripto) con selección en
 * primary #E8E8E8. Subtítulo sin " MXN" (así lo muestra la app).
 */
import TopBar from './TopBar';
import { DEMO_BASE_LABEL, DEMO_TIP_LABEL, DEMO_TOTAL_LABEL } from '../flows';

interface Props {
  cardSelected: boolean;
}

const METHODS = [
  { id: 'card', label: 'Tarjeta', target: 'seg-card' },
  { id: 'cash', label: 'Efectivo' },
  { id: 'crypto', label: 'Cripto' },
] as const;

export default function MerchantSelection({ cardSelected }: Props) {
  return (
    <section className="tpv-screen" data-screen="merchant">
      <TopBar title="Seleccionar Cuenta" subtitle={`Paso 3 de 3 · Total: ${DEMO_TOTAL_LABEL}`} />
      <div className="merchant-body">
        <div className="m-total">{DEMO_TOTAL_LABEL}</div>
        <div className="m-breakdown">Monto: {DEMO_BASE_LABEL}</div>
        <div className="m-breakdown">Propina: {DEMO_TIP_LABEL}</div>
        <div className="m-stars" aria-label="Calificación 5 estrellas">
          &#11088;&#11088;&#11088;&#11088;&#11088;
        </div>

        <div className="m-label">Método de pago</div>
        <div className="method-list">
          {METHODS.map(m => {
            const isSelected = m.id === 'card' && cardSelected;
            return (
              <button
                key={m.id}
                type="button"
                className={`method-row${isSelected ? ' selected' : ''}`}
                data-t={'target' in m ? m.target : undefined}
              >
                <span>{m.label}</span>
                {isSelected ? (
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <circle cx="10" cy="10" r="10" fill="currentColor" />
                    <path d="M6 10.3l2.6 2.6L14 7.4" stroke="#2A2A2A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
