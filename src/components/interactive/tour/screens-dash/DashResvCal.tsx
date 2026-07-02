/**
 * DashResvCal — "Reservaciones · Calendario" (dash-resv-cal): the reserva
 * flow's payoff scene. After the booking widget confirms Sofía's cita, the
 * stage crossfades phone → dashboard and her reservation lands highlighted
 * in the venue's calendar — the same "one action fires everything" beat the
 * TPV chain closes on, at the reserva venue (Estética Bella, not the
 * TPV/liga demo venue).
 *
 * Fully static — the entry animation triggers via CSS when the screen gains
 * `.active` (no chain-state involvement; see tour-dash.css, with a
 * prefers-reduced-motion override).
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';

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

export default function DashResvCal() {
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
                <div className={`dash-cal-card${slot.booking.isNew ? ' dash-cal-card-new' : ''}`}>
                  <span className="dash-cal-card-title">
                    <b>{slot.booking.name}</b> — {slot.booking.service}
                    {slot.booking.isNew && <span className="lg-badge dash-badge-new">Nueva</span>}
                  </span>
                  <span className="dash-cal-card-detail">{slot.booking.detail}</span>
                </div>
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
