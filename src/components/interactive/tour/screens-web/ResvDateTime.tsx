/**
 * Reserva en línea — Paso 3: fecha y hora.
 * Mockup fiel del calendario del widget real (book.avoqado.io): jun 2026,
 * hoy = día 11, target = día 12 + horario 11:30. Presentacional puro,
 * `day` y `slot` los controla el engine del tour.
 */
interface Props {
  day: number | null;
  slot: string | null;
}

const WEEKDAYS = ['lun', 'mar', 'mié', 'jue', 'vie', 'sáb', 'dom'];
const DAYS = Array.from({ length: 28 }, (_, i) => i + 1);
const MORNING = ['10:00', '11:30', '12:15'];
const AFTERNOON = ['16:00', '17:30'];

export default function ResvDateTime({ day, slot }: Props) {
  return (
    <section className="web-screen rsv" data-screen="r-datetime">
      <div className="rsv-body">
        <div className="rsv-cal-nav">
          <button type="button" className="rsv-cal-arrow" aria-hidden="true">
            ‹
          </button>
          <span className="rsv-cal-month">jun 2026</span>
          <button type="button" className="rsv-cal-arrow" aria-hidden="true">
            ›
          </button>
        </div>

        <div className="rsv-cal-week">
          {WEEKDAYS.map(wd => (
            <span key={wd} className="rsv-cal-wd">
              {wd}
            </span>
          ))}
        </div>

        <div className="rsv-cal-grid">
          {DAYS.map(d => {
            if (d === 12) {
              return (
                <button
                  key={d}
                  type="button"
                  className={`rsv-day${day === 12 ? ' rsv-day-sel' : ''}`}
                  data-t="day-12"
                >
                  12
                </button>
              );
            }
            const cls =
              d < 11 ? 'rsv-day rsv-day-past' : d === 11 ? 'rsv-day rsv-day-today' : 'rsv-day';
            return (
              <button key={d} type="button" className={cls}>
                {d}
              </button>
            );
          })}
        </div>

        <div className="rsv-divider" />

        <p className="rsv-tz">
          Las horas corresponden a la siguiente zona horaria:{' '}
          <span className="rsv-tz-accent">GMT-6</span>.
        </p>

        {day === null ? (
          <p className="rsv-slots-hint">Selecciona un día para ver horarios</p>
        ) : (
          <>
            <h3 className="rsv-date-h">viernes, 12 de junio</h3>

            <p className="rsv-slot-group">Mañana</p>
            <div className="rsv-slots">
              {MORNING.map(t =>
                t === '11:30' ? (
                  <button
                    key={t}
                    type="button"
                    className={`rsv-slot${slot === '11:30' ? ' rsv-slot-sel' : ''}`}
                    data-t="slot-1130"
                  >
                    11:30
                  </button>
                ) : (
                  <button key={t} type="button" className="rsv-slot">
                    {t}
                  </button>
                ),
              )}
            </div>

            <p className="rsv-slot-group">Tarde</p>
            <div className="rsv-slots">
              {AFTERNOON.map(t => (
                <button key={t} type="button" className="rsv-slot">
                  {t}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
