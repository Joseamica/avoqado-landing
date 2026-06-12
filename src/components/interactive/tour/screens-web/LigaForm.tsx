/**
 * LigaForm — paso 2 del wizard "Crear liga de pago" (FullScreenModal), fiel
 * al formulario plano estilo Square del dashboard real: finalidad, Detalles,
 * Monto con toggle Fijo|Abierto, y vista previa de teléfono espejo.
 * Presentacional puro; `amountTyped` lo anima el engine ("se teclea solo").
 */
import LigaPhone from './LigaPhone';

interface Props {
  amountTyped: string;
}

export default function LigaForm({ amountTyped }: Props) {
  return (
    <section className="web-screen lg" data-screen="l-form">
      <div className="lg-modal">
        <header className="lg-modal-head">
          <button type="button" className="lg-x" aria-label="Cerrar">
            &#10005;
          </button>
          <div className="lg-modal-titles">
            <span>Estudio Lumina</span>
            <b>Crear liga de pago</b>
          </div>
          <button type="button" className="lg-btn-primary" data-t="liga-save">
            Guardar
          </button>
        </header>
        <div className="lg-modal-body">
          <div className="lg-col-form">
            <div className="lg-fcard lg-purpose-chip">
              <span className="lg-flabel">Finalidad</span>
              <span className="lg-purpose-row">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
                  <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
                  <circle cx="8" cy="8" r="1.8" />
                </svg>
                Aceptar un pago
                <svg className="lg-chev" width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>

            <div className="lg-fcard">
              <h3 className="lg-fsec">Detalles</h3>
              <span className="lg-flabel">Título</span>
              <div className="lg-input filled">Sesión de fotos</div>
              <span className="lg-flabel">Descripción</span>
              <div className="lg-input lg-textarea filled">
                Sesión de 1 hora en estudio
                <span className="lg-counter">29/400</span>
              </div>
            </div>

            <div className="lg-fcard">
              <h3 className="lg-fsec">Monto</h3>
              <span className="lg-flabel">Tipo de monto</span>
              <div className="lg-segment">
                <span className="lg-seg-opt active">Fijo</span>
                <span className="lg-seg-opt">Abierto</span>
              </div>
              <p className="lg-hint">El cliente paga el monto exacto que definas</p>
              <span className="lg-flabel">Monto (MXN)</span>
              <button type="button" className={`lg-input lg-amount${amountTyped ? ' filled' : ''}`} data-t="liga-amount">
                <span className="lg-dollar">$</span>
                {amountTyped || '0.00'}
              </button>
            </div>
          </div>
          <div className="lg-col-preview">
            <LigaPhone
              title="Sesión de fotos"
              description="Sesión de 1 hora en estudio"
              amountLabel={amountTyped ? `$${amountTyped}.00` : '$0.00'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
