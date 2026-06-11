/**
 * A1. FastPaymentEntry — "Pago Rápido": amount display + CustomKeyboard
 * replica (0-9, punto, C, ◄, ✓ verde). The guided sequence spotlights
 * individual keys via their data-key attribute.
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

const DIGIT_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'];

export default function FastPaymentEntry({ amount, popKey }: Props) {
  const amountClass = `fast-amount${amount === '$0.00' ? ' zero' : ''}${popKey > 0 ? ' pop' : ''}`;

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
        {DIGIT_KEYS.map(k => (
          <button key={k} type="button" className="key" data-key={k}>
            {k}
          </button>
        ))}
        <button type="button" className="key key-del" data-key="del" aria-label="Borrar">
          &#9668;
        </button>
        <button type="button" className="key key-clear" data-key="C">
          C
        </button>
        <button type="button" className="key key-confirm" data-t="key-confirm" aria-label="Confirmar">
          &#10003;
        </button>
      </div>
    </section>
  );
}
