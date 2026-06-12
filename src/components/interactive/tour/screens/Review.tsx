/**
 * 2. Review — "Calificación": 5 estrellas que se llenan en cascada
 * (timers del engine) al tocar la 5ª, fiel al TPV real: estrellas en
 * primary #E8E8E8 (no doradas), caption "N de 5 estrellas" reservado
 * bajo las estrellas, y "Saltar" como botón outlined full-width
 * (AvoqadoSecondaryButton) en el footer.
 */
import TopBar from './TopBar';
import { DEMO_BASE_LABEL } from '../flows';

interface Props {
  starsFilled: number;
}

const STAR_PATH =
  'M12 2.6l2.92 5.92 6.54.95-4.73 4.61 1.12 6.51L12 17.52l-5.85 3.07 1.12-6.51-4.73-4.61 6.54-.95z';

const STARS = [1, 2, 3, 4, 5] as const;

export default function Review({ starsFilled }: Props) {
  return (
    <section className="tpv-screen" data-screen="review">
      <TopBar title="Calificación" subtitle={`Paso 1 de 3 · ${DEMO_BASE_LABEL}`} />
      <div className="review-body">
        <div>
          <div className="stars">
            {STARS.map(n => (
              <button
                key={n}
                type="button"
                className={`star${starsFilled >= n ? ' filled' : ''}`}
                data-t={n === 5 ? 'star5' : undefined}
                aria-label={n === 1 ? '1 estrella' : `${n} estrellas`}
              >
                <svg viewBox="0 0 24 24">
                  <path d={STAR_PATH} />
                </svg>
              </button>
            ))}
          </div>
          {/* caption siempre reserva su línea, como AvoqadoRatingInput */}
          <div className="stars-caption">{starsFilled > 0 ? `${starsFilled} de 5 estrellas` : ' '}</div>
        </div>
      </div>
      <div className="review-footer">
        <button type="button" className="btn btn-outline">
          Saltar
        </button>
      </div>
    </section>
  );
}
