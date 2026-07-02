/**
 * DashResvCal — "Reservaciones · Calendario" (dash-resv-cal): the reserva
 * flow's payoff scene. After the booking widget confirms Sofía's cita, the
 * stage crossfades phone → dashboard and her reservation lands highlighted
 * in the venue's calendar (Estética Bella). The guided part then closes the
 * money loop: open her card, mark attendance ("Llegó" = show), and the $250
 * charge lands in Ventas (dash-resv-sales).
 *
 * The show/no-show buttons are ALWAYS mounted (visual state gated by the
 * `statusOpen` prop) — a tour target must exist in the DOM the instant its
 * step activates, or the engine soft-locks. Same lesson as DashAi's chip 2.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

interface Props {
  /** Status picker (Llegó / No llegó) revealed on Sofía's card. */
  statusOpen: boolean;
  /** Cita marked as show — card flips to "Atendida · $250 cobrados". */
  showMarked: boolean;
}

interface Slot {
  time: string;
  booking?: { name: string; service: string; detail: string; isNew?: boolean };
}

/* The times mirror the widget's own data: Sofía picked Viernes 12 · 11:30. */
const SLOTS: Slot[] = [
  { time: '10:00', booking: { name: 'Karla M.', service: 'Manicure spa', detail: '60 min · $350' } },
  { time: '11:00' },
  { time: '11:30', booking: { name: 'Sofía Ramírez', service: 'Corte de cabello', detail: '45 min · $250', isNew: true } },
  { time: '12:30' },
  { time: '13:00', booking: { name: 'Renata L.', service: 'Tinte completo', detail: '2 h · $1,200' } },
];

export default function DashResvCal({ statusOpen, showMarked }: Props) {
  return (
    <section className="web-screen lg dash-resv-cal" data-screen="dash-resv-cal">
      <DashShell venue="Estética Bella" nav={<ChainNav active="reservas" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Reservaciones · Calendario</h1>
            <p className="lg-subtitle">La cita cayó sola en tu agenda — confirmada y con recordatorios por WhatsApp.</p>
          </div>
        </div>

        <p className="dash-cal-day">Viernes, 12 de junio</p>

        <div className="dash-cal">
          {SLOTS.map(slot => (
            <div className="dash-cal-row" key={slot.time}>
              <span className="dash-cal-time">{slot.time}</span>
              {slot.booking ? (
                slot.booking.isNew ? (
                  <div
                    className={`dash-cal-card dash-cal-card-new${showMarked ? ' dash-cal-card-attended' : ''}`}
                    data-t="resv-card"
                  >
                    <span className="dash-cal-card-title">
                      <b>{slot.booking.name}</b> — {slot.booking.service}
                      {showMarked ? (
                        <span className="lg-badge dash-badge-new">Atendida</span>
                      ) : (
                        <span className="lg-badge dash-badge-new">Nueva</span>
                      )}
                    </span>
                    <span className="dash-cal-card-detail">
                      {showMarked ? '$250 cobrados — ya está en Ventas' : slot.booking.detail}
                    </span>
                    {/* Always mounted; visuals gated (see doc comment). */}
                    <span className={`dash-cal-status${statusOpen && !showMarked ? '' : ' dash-cal-status-pending'}`} aria-hidden={!statusOpen || showMarked}>
                      <span className="dash-cal-status-q">¿Asistió a su cita?</span>
                      <button type="button" className="dash-cal-status-btn dash-cal-status-show" data-t="resv-show" disabled={!statusOpen || showMarked} tabIndex={statusOpen && !showMarked ? undefined : -1}>
                        Llegó
                      </button>
                      <button type="button" className="dash-cal-status-btn" disabled={!statusOpen || showMarked} tabIndex={statusOpen && !showMarked ? undefined : -1}>
                        No llegó
                      </button>
                    </span>
                  </div>
                ) : (
                  <div className="dash-cal-card">
                    <span className="dash-cal-card-title">
                      <b>{slot.booking.name}</b> — {slot.booking.service}
                    </span>
                    <span className="dash-cal-card-detail">{slot.booking.detail}</span>
                  </div>
                )
              ) : (
                <div className="dash-cal-empty" />
              )}
            </div>
          ))}
        </div>
      </DashShell>
    </section>
  );
}
