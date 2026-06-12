/**
 * Reserva en línea — Paso 4: proceso de pago.
 * Mockup fiel del checkout del widget real (book.avoqado.io); datos de la
 * clienta prellenados (maqueta estática, sin props ni estado).
 */
export default function ResvCheckout() {
  return (
    <section className="web-screen rsv" data-screen="r-checkout">
      <div className="rsv-body">
        <h2 className="rsv-co-title">Proceso de pago</h2>
        <p className="rsv-co-count">Cita reservada durante 9:56</p>

        <h3 className="rsv-sec-title">Tus datos</h3>

        <div className="rsv-field">
          <span className="rsv-field-label">Teléfono *</span>
          <span className="rsv-field-input">55 1234 5678</span>
        </div>
        <div className="rsv-field">
          <span className="rsv-field-label">Nombre *</span>
          <span className="rsv-field-input">Sofía Ramírez</span>
        </div>
        <div className="rsv-field">
          <span className="rsv-field-label">Correo (opcional)</span>
          <span className="rsv-field-input">sofia@email.com</span>
        </div>

        <div className="rsv-card rsv-summary">
          <p className="rsv-card-title">Resumen de la cita</p>
          <p className="rsv-line rsv-line-strong">Corte de cabello — $250</p>
          <p className="rsv-line rsv-line-muted">
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
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
            Viernes, 12 de junio · 11:30
          </p>
          <div className="rsv-divider" />
          <p className="rsv-line rsv-line-strong">Total — $250</p>
          <p className="rsv-line rsv-line-muted">A pagar en la cita</p>
        </div>

        <button type="button" className="rsv-btn rsv-btn-accent" data-t="resv-confirm">
          Reserva cita
        </button>
      </div>
    </section>
  );
}
