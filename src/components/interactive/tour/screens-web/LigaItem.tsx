/**
 * LigaItem — paso 2 del wizard "Crear liga de pago" cuando la finalidad es
 * "Vender un artículo o servicio" (founder request): se elige del catálogo
 * con su precio ya puesto — sin capturar montos a mano. El tour guía a
 * "Sesión de fotos · $350.00", que es EXACTO la liga que después aparece en
 * la lista, se comparte por WhatsApp y se paga ($350.00 — no cambiar uno sin
 * el otro). Presentacional puro; `itemPicked` lo controla el engine.
 */
import LigaPhone from './LigaPhone';

interface Props {
  itemPicked: boolean;
}

const ITEMS = [
  {
    id: 'sesion',
    name: 'Sesión de fotos',
    meta: 'Servicio · 1 hora en estudio',
    price: '$350.00',
    target: true,
    icon: (
      <>
        <rect x="1.8" y="4.5" width="12.4" height="9" rx="1.5" />
        <path d="M5.5 4.5 6.6 2.8h2.8l1.1 1.7" />
        <circle cx="8" cy="8.8" r="2.3" />
      </>
    ),
  },
  {
    id: 'impresion',
    name: 'Impresión fine art 30×40',
    meta: 'Artículo · 3 en stock',
    price: '$520.00',
    icon: (
      <>
        <rect x="2.5" y="2.5" width="11" height="11" rx="1.5" />
        <path d="m2.5 10.5 3.2-3.2 3 3 2-2 2.8 2.8" />
        <circle cx="10.2" cy="5.8" r="1" />
      </>
    ),
  },
  {
    id: 'retrato',
    name: 'Paquete retrato estudio',
    meta: 'Servicio · 45 min',
    price: '$890.00',
    icon: (
      <>
        <circle cx="8" cy="5.6" r="2.4" />
        <path d="M3.2 13.4c.5-2.6 2.2-4 4.8-4s4.3 1.4 4.8 4" />
      </>
    ),
  },
] as const;

export default function LigaItem({ itemPicked }: Props) {
  return (
    <section className="web-screen lg" data-screen="l-item">
      <div className="lg-modal">
        <header className="lg-modal-head">
          <button type="button" className="lg-x" aria-label="Cerrar">
            &#10005;
          </button>
          <div className="lg-modal-titles">
            <span>Estudio Lumina</span>
            <b>Crear liga de pago</b>
          </div>
          <button type="button" className={`lg-btn-primary${itemPicked ? '' : ' off'}`} data-t="liga-save">
            Crear liga
          </button>
        </header>
        <div className="lg-modal-body">
          <div className="lg-col-form">
            <h2 className="lg-step-title">Elige el artículo o servicio</h2>
            <p className="lg-step-sub">Se vende con el precio de tu catálogo — sin capturar montos a mano</p>
            {ITEMS.map(item => (
              <button
                key={item.id}
                type="button"
                className={`lg-purpose${'target' in item && item.target && itemPicked ? ' selected' : ''}`}
                {...('target' in item && item.target ? { 'data-t': 'item-sesion' } : {})}
              >
                <span className="lg-purpose-ic">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {item.icon}
                  </svg>
                </span>
                <span className="lg-purpose-text">
                  <b>{item.name}</b>
                  <span>{item.meta}</span>
                </span>
                <span className="lg-item-price">{item.price}</span>
              </button>
            ))}
          </div>
          <div className="lg-col-preview">
            <LigaPhone
              title={itemPicked ? 'Sesión de fotos' : 'Elige un artículo'}
              description={itemPicked ? 'Sesión de 1 hora en estudio' : 'El checkout se arma solo con tu catálogo'}
              amountLabel={itemPicked ? '$350.00' : '$0.00'}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
