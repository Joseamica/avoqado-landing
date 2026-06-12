/**
 * A1. FastPaymentEntry — "Pago Rápido": amount display + CustomKeyboard
 * replica faithful to the real geometry (CustomKeyboard.kt): a 3-column
 * digit grid with bottom row [C 0 .] PLUS a right action column with
 * backspace on top and a TALL confirm (#E8E8E8, dark check) spanning the
 * remaining rows. The guided sequence spotlights keys via data-key.
 *
 * Note: this screen ships with the `active` class so the terminal paints
 * before hydration; the engine owns the class imperatively afterwards
 * (the JSX string never changes, so React never patches it back).
 */
import TopBar from './TopBar';

interface Props {
  amount: string;
  popKey: number;
}

/* Real bottom row is C 0 . — C is a normal key, no red accent. */
const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '.'];

export default function FastPaymentEntry({ amount, popKey }: Props) {
  const amountClass = `fast-amount${amount === '$0' ? ' zero' : ''}${popKey > 0 ? ' pop' : ''}`;

  return (
    <section className="tpv-screen active" data-screen="fast">
      <TopBar title="Pago Rápido" />
      <p className="fast-instruction">Ingresa el monto del pago</p>
      <div className="fast-amount-wrap">
        {/* keyed by popKey so each keypress replays the pop animation */}
        <div key={popKey} className={amountClass}>
          {amount}
        </div>
      </div>
      <div className="keypad">
        <div className="keypad-digits">
          {DIGIT_KEYS.map(k => (
            <button key={k} type="button" className="key" data-key={k}>
              {k}
            </button>
          ))}
        </div>
        <div className="keypad-actions">
          <button type="button" className="key key-del" data-key="del" aria-label="Borrar">
            {/* Material Backspace, filled — like the real app */}
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.11c.36.53.9.89 1.59.89h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" />
            </svg>
          </button>
          <button type="button" className="key key-confirm" data-t="key-confirm" aria-label="Confirmar">
            &#10003;
          </button>
        </div>
      </div>
    </section>
  );
}
