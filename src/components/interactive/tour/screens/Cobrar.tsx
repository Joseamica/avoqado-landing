/**
 * B. "Cobrar" — réplica del módulo unificado real del TPV (flow B):
 * tabs Teclado | Shortcuts | Todos los productos | ⚙, vista teclado
 * fantasma, catálogo retail 2 columnas con qty badges, y panel de
 * carrito (CartPanelView) con "N artículos" + botón "Cobrar $X.XX".
 */
import TopBar from './TopBar';

interface Props {
  view: 'teclado' | 'productos';
  cartPlayera: boolean;
  cartGorra: boolean;
  cartItems: number;
  cartButtonLabel: string;
}

const MINI_PAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '◀'];

export default function Cobrar({ view, cartPlayera, cartGorra, cartItems, cartButtonLabel }: Props) {
  return (
    <section className="tpv-screen" data-screen="cobrar">
      <TopBar title="Cobrar" />
      <div className="cobrar-body">
        <div className="cobrar-tabs">
          <button type="button" className={`cobrar-tab${view === 'teclado' ? ' active' : ''}`}>
            Teclado
          </button>
          <button type="button" className="cobrar-tab">
            Shortcuts
          </button>
          <button type="button" className={`cobrar-tab${view === 'productos' ? ' active' : ''}`} data-t="tab-productos">
            Todos los productos
          </button>
          <button type="button" className="cobrar-tab" aria-label="Configurar">
            &#9881;
          </button>
        </div>

        {/* vista Teclado (default del módulo real) */}
        <div className={`cobrar-view${view === 'teclado' ? ' active' : ''}`}>
          <div className="mini-amount">$0.00</div>
          <div className="mini-pad" aria-hidden="true">
            {MINI_PAD_KEYS.map(k => (
              <span key={k}>{k}</span>
            ))}
          </div>
        </div>

        {/* vista Todos los productos (catálogo retail) */}
        <div className={`cobrar-view${view === 'productos' ? ' active' : ''}`}>
          <div className="prod-grid">
            <button type="button" className={`prod-card${cartPlayera ? ' added' : ''}`} data-t="prod-playera">
              <span className="qty-badge">1</span>
              <div className="thumb">&#128085;</div>
              <div className="pn">Playera básica blanca</div>
              <div className="pp">$195.00</div>
            </button>
            <button type="button" className={`prod-card${cartGorra ? ' added' : ''}`} data-t="prod-gorra">
              <span className="qty-badge">1</span>
              <div className="thumb">&#129506;</div>
              <div className="pn">Gorra logo</div>
              <div className="pp">$100.00</div>
            </button>
            <button type="button" className="prod-card">
              <span className="qty-badge" />
              <div className="thumb">&#128087;</div>
              <div className="pn">Sudadera premium</div>
              <div className="pp">$450.00</div>
            </button>
            <button type="button" className="prod-card">
              <span className="qty-badge" />
              <div className="thumb">&#128083;</div>
              <div className="pn">Lentes de sol</div>
              <div className="pp">$250.00</div>
            </button>
          </div>
        </div>

        {/* panel de carrito (CartPanelView real: "N artículos" + "Cobrar $X.XX") */}
        <div className="cart-panel">
          <div className="cart-meta">
            <b>
              {cartItems} {cartItems === 1 ? 'artículo' : 'artículos'}
            </b>
            <span />
          </div>
          <button type="button" className="btn btn-green" data-t="btn-cobrar-cart">
            {cartButtonLabel}
          </button>
        </div>
      </div>
    </section>
  );
}
