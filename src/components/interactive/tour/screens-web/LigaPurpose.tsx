/**
 * LigaPurpose — paso 1 del wizard "Crear liga de pago" (FullScreenModal),
 * fiel al CreatePaymentLinkDialog real: 4 cards de finalidad (evento/clase
 * con "Muy pronto") + vista previa de teléfono a la derecha.
 * Presentacional puro; `purpose` lo controla el engine del tour.
 */
import LigaPhone from './LigaPhone';

interface Props {
  purpose: boolean;
}

const PURPOSES = [
  {
    id: 'pago',
    title: 'Aceptar un pago',
    desc: 'Cobra un monto fijo o permite que el cliente ingrese su propio monto',
    target: true,
    icon: (
      <>
        <rect x="1.5" y="4" width="13" height="8" rx="1.5" />
        <circle cx="8" cy="8" r="1.8" />
      </>
    ),
  },
  {
    id: 'articulo',
    title: 'Vender un artículo',
    desc: 'Vende un producto de tu inventario directamente con una liga',
    icon: (
      <>
        <path d="M2.5 5.5 8 2.8l5.5 2.7v5L8 13.2l-5.5-2.7v-5Z" />
        <path d="M2.5 5.5 8 8.2l5.5-2.7M8 8.2v5" />
      </>
    ),
  },
  {
    id: 'evento',
    title: 'Vender un evento o clase',
    desc: 'Vende acceso a eventos, clases o experiencias',
    soon: true,
    icon: (
      <>
        <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
        <path d="M2.5 6.5h11M5.5 2.2v2.2M10.5 2.2v2.2" />
      </>
    ),
  },
  {
    id: 'donacion',
    title: 'Aceptar una donación',
    desc: 'Recibe donaciones de cualquier monto',
    icon: <path d="M8 13.4 3.2 8.8a3 3 0 0 1 0-4.2 2.9 2.9 0 0 1 4.1 0l.7.7.7-.7a2.9 2.9 0 0 1 4.1 0 3 3 0 0 1 0 4.2L8 13.4Z" />,
  },
] as const;

export default function LigaPurpose({ purpose }: Props) {
  return (
    <section className="web-screen lg" data-screen="l-purpose">
      <div className="lg-modal">
        <header className="lg-modal-head">
          <button type="button" className="lg-x" aria-label="Cerrar">
            &#10005;
          </button>
          <div className="lg-modal-titles">
            <span>Estudio Lumina</span>
            <b>Crear liga de pago</b>
          </div>
          <button type="button" className={`lg-btn-primary${purpose ? '' : ' off'}`} data-t="purpose-continue">
            Continuar
          </button>
        </header>
        <div className="lg-modal-body">
          <div className="lg-col-form">
            <h2 className="lg-step-title">Elige la finalidad</h2>
            <p className="lg-step-sub">Elige el tipo de liga que mejor se adapte a tu necesidad</p>
            {PURPOSES.map(p => (
              <button
                key={p.id}
                type="button"
                className={`lg-purpose${'soon' in p && p.soon ? ' soon' : ''}${'target' in p && p.target && purpose ? ' selected' : ''}`}
                {...('target' in p && p.target ? { 'data-t': 'purpose-pago' } : {})}
              >
                <span className="lg-purpose-ic">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {p.icon}
                  </svg>
                </span>
                <span className="lg-purpose-text">
                  <b>{p.title}</b>
                  <span>{p.desc}</span>
                </span>
                {'soon' in p && p.soon ? <span className="lg-soon">Muy pronto</span> : null}
              </button>
            ))}
          </div>
          <div className="lg-col-preview">
            <LigaPhone title="Pago pendiente" description="Por favor ingresa y paga el monto total indicado." amountLabel="$0.00" />
          </div>
        </div>
      </div>
    </section>
  );
}
