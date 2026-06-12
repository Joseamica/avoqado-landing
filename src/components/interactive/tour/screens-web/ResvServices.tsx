/**
 * Reserva en línea — Paso 2: selección de servicio.
 * Mockup fiel del widget real (book.avoqado.io) para "Estética Bella".
 * Presentacional puro: `serviceAdded` lo controla el engine del tour.
 */
interface Props {
  serviceAdded: boolean;
}

export default function ResvServices({ serviceAdded }: Props) {
  return (
    <section className="web-screen rsv" data-screen="r-services">
      <div className="rsv-body">
        <h2 className="rsv-h2">Selecciona un servicio</h2>

        <div className="rsv-search">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="M20 20l-4-4" />
          </svg>
          Buscar servicio
        </div>

        <div className="rsv-chips">
          <button type="button" className="rsv-chip rsv-chip-on">
            Todas
          </button>
          <button type="button" className="rsv-chip">
            Cabello
          </button>
          <button type="button" className="rsv-chip">
            Uñas
          </button>
          <button type="button" className="rsv-chip">
            Color
          </button>
        </div>

        <button type="button" className="rsv-svc-row" data-t="svc-corte">
          <span className="rsv-svc-info">
            <span className="rsv-svc-name">Corte de cabello</span>
            <span className="rsv-svc-desc">Corte + lavado + styling con tu estilista</span>
            <span className="rsv-svc-price">$250 · 45 min</span>
          </span>
          {serviceAdded && <span className="rsv-added-pill">Añadido</span>}
        </button>

        <button type="button" className="rsv-svc-row">
          <span className="rsv-svc-info">
            <span className="rsv-svc-name">Manicure spa</span>
            <span className="rsv-svc-desc">Manos perfectas con gelish</span>
            <span className="rsv-svc-price">$350 · 60 min</span>
          </span>
        </button>

        <button type="button" className="rsv-svc-row">
          <span className="rsv-svc-info">
            <span className="rsv-svc-name">Tinte completo</span>
            <span className="rsv-svc-desc">Color de raíz a puntas</span>
            <span className="rsv-svc-price">$1,200 · 2 h</span>
          </span>
        </button>

        <div className="rsv-card rsv-summary">
          <p className="rsv-card-title">Resumen de la cita</p>
          {serviceAdded ? (
            <>
              <p className="rsv-summary-row">1 servicio · $250 · 45 min</p>
              <p className="rsv-summary-item">• Corte de cabello — $250</p>
            </>
          ) : (
            <p className="rsv-summary-empty">Todavía no se han añadido servicios</p>
          )}
        </div>

        <button
          type="button"
          className={`rsv-btn ${serviceAdded ? 'rsv-btn-accent' : 'rsv-btn-off'}`}
          data-t="svc-next"
        >
          Siguiente
        </button>
      </div>
    </section>
  );
}
