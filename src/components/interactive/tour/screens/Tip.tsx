/**
 * 3. Tip — "Propina": cards 15/18/20% + monto personalizado + sin propina.
 * Fiel al TPV real: header "Subtotal: $X MXN" → "Total: $X MXN" al elegir,
 * card seleccionada en primary #E8E8E8 (no verde), "Sin propina" como texto
 * primary sin subrayar, y "Continuar" deshabilitado hasta seleccionar.
 */
import TopBar from './TopBar';

interface Props {
  selected: boolean;
  totalLabel: string;
}

export default function Tip({ selected, totalLabel }: Props) {
  return (
    <section className="tpv-screen" data-screen="tip">
      <TopBar title="Propina" subtitle={`Paso 2 de 3 · ${totalLabel}`} />
      <div className="tip-body">
        <div className="tip-row">
          <button type="button" className="tip-card">
            <div className="pct">15%</div>
            <div className="amt">$44.25</div>
          </button>
          <button type="button" className={`tip-card${selected ? ' selected' : ''}`} data-t="tip18">
            <div className="pct">18%</div>
            <div className="amt">$53.10</div>
          </button>
          <button type="button" className="tip-card">
            <div className="pct">20%</div>
            <div className="amt">$59.00</div>
          </button>
        </div>
        <button type="button" className="tip-custom">
          Monto personalizado
        </button>
        <div className="tip-skip">
          <button type="button" className="tip-skip-btn">
            Sin propina
          </button>
        </div>
        <div className="tip-spacer" />
        <button type="button" className={`btn btn-primary${selected ? '' : ' disabled'}`} data-t="tip-continue">
          Continuar
        </button>
      </div>
    </section>
  );
}
