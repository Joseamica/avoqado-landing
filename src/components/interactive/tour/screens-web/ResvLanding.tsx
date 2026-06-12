/**
 * Reserva en línea — Paso 1: landing de la página de reservas hospedada.
 * Mockup fiel del widget real (book.avoqado.io) para el salón demo "Estética Bella".
 * Componente presentacional puro: sin hooks ni estado; el engine guía los clicks
 * mediante los atributos data-t.
 */
export default function ResvLanding() {
  return (
    <section className="web-screen rsv" data-screen="r-landing">
      <header className="rsv-topnav">
        <div className="rsv-brand">
          <span className="rsv-brand-dot" />
          <span className="rsv-brand-name">Estética Bella</span>
        </div>
        <nav className="rsv-nav-links">Citas · Clases</nav>
        <span className="rsv-account-pill">Mi Cuenta</span>
      </header>

      <div className="rsv-body">
        <h2 className="rsv-landing-title">¿Qué quieres reservar?</h2>
        <p className="rsv-landing-sub">Selecciona el tipo de reserva</p>

        <button type="button" className="rsv-cta-card" data-t="resv-citas">
          <span className="rsv-tile rsv-tile-accent">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M16 3v4M8 3v4M3 11h18" />
            </svg>
          </span>
          <span className="rsv-cta-text">
            <span className="rsv-cta-title">Citas</span>
            <span className="rsv-cta-sub">Servicios uno a uno con horario flexible</span>
          </span>
          <svg
            className="rsv-chevron"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <button type="button" className="rsv-cta-card">
          <span className="rsv-tile rsv-tile-green">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="4.5" r="2" />
              <path d="M12 8.5v4.5" />
              <path d="M4.5 10.5l7.5 2.5 7.5-2.5" />
              <path d="M12 13l-4.5 7M12 13l4.5 7" />
            </svg>
          </span>
          <span className="rsv-cta-text">
            <span className="rsv-cta-title">Clases</span>
            <span className="rsv-cta-sub">Sesiones grupales programadas</span>
          </span>
          <svg
            className="rsv-chevron"
            viewBox="0 0 24 24"
            width="18"
            height="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 6l6 6-6 6" />
          </svg>
        </button>

        <div className="rsv-powered">
          <span className="rsv-avocado-dot" />
          Con tecnología de Avoqado
        </div>
      </div>
    </section>
  );
}
