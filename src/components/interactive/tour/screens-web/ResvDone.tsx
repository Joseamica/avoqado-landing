/**
 * Reserva en línea — Paso 5: confirmación de la reserva.
 * Mockup fiel de la pantalla de éxito del widget real (book.avoqado.io).
 * Maqueta estática, sin props ni estado.
 */
export default function ResvDone() {
  return (
    <section className="web-screen rsv" data-screen="r-done">
      <div className="rsv-body">
        <div className="rsv-done-head">
          <span className="rsv-check">
            <svg
              viewBox="0 0 24 24"
              width="28"
              height="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h1 className="rsv-done-title">Gracias por tu reserva</h1>
        </div>

        <div className="rsv-card">
          <p className="rsv-card-title">Cita</p>
          <p className="rsv-line rsv-line-strong">Corte de cabello</p>
          <p className="rsv-line rsv-line-muted">Viernes, 12 de junio · 11:30 · 45 min</p>
          <p className="rsv-line rsv-line-muted">Estética Bella</p>
          <button type="button" className="rsv-ghost-link">
            Añadir al calendario
          </button>
        </div>

        <div className="rsv-card">
          <p className="rsv-card-title">Próximos pasos</p>
          <p className="rsv-line rsv-line-muted">
            Te llamaremos al 55 1234 5678 si hay algún cambio.
          </p>
        </div>

        <div className="rsv-card">
          <p className="rsv-card-title">Pago</p>
          <p className="rsv-line rsv-line-muted">A pagar en la cita — $250</p>
        </div>

        <p className="rsv-wa-note">
          <span className="rsv-wa-dot" />
          Recibirás recordatorios por WhatsApp antes de tu cita.
        </p>
      </div>
    </section>
  );
}
