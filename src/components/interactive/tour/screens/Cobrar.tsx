/**
 * B. "Cobrar" — réplica fiel del módulo unificado real del TPV:
 * top bar izquierdo, SearchBarView (píldora Buscar + refrescar + escanear),
 * tabs con indicador subrayado (Teclado | Shortcuts | Todos los productos |
 * Configurar), teclado fantasma con quick-amounts y fila C 0 +, catálogo de
 * 3 columnas con iniciales sobre tinte de categoría (sin badges: el feedback
 * real es el label del botón Cobrar), botón Cobrar píldora primary #E8E8E8,
 * y CartDetailsSheet antes del cobro definitivo.
 */
import TopBar from './TopBar';

interface Props {
  view: 'teclado' | 'productos';
  cartPlayera: boolean;
  cartGorra: boolean;
  cartItems: number;
  cartButtonLabel: string;
  cartSheetOpen: boolean;
}

const PAD_ROWS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '+'];
const QUICK_AMOUNTS = ['$50', '$100', '$200', '$500'];

const PRODUCTS = [
  { id: 'playera', name: 'Playera básica blanca', price: '$195.00', initials: 'PL', tint: '#2563eb', target: 'prod-playera' },
  { id: 'gorra', name: 'Gorra logo', price: '$100.00', initials: 'GO', tint: '#d97706', target: 'prod-gorra' },
  { id: 'sudadera', name: 'Sudadera premium', price: '$450.00', initials: 'SU', tint: '#7c3aed' },
  { id: 'lentes', name: 'Lentes de sol', price: '$250.00', initials: 'LE', tint: '#0d9488' },
  { id: 'termo', name: 'Termo 600ml', price: '$320.00', initials: 'TE', tint: '#be185d' },
  { id: 'llavero', name: 'Llavero metálico', price: '$80.00', initials: 'LL', tint: '#4f46e5' },
] as const;

export default function Cobrar({ view, cartPlayera, cartGorra, cartItems, cartButtonLabel, cartSheetOpen }: Props) {
  const inCart = (id: string) => (id === 'playera' && cartPlayera) || (id === 'gorra' && cartGorra);

  return (
    <section className="tpv-screen" data-screen="cobrar">
      <TopBar title="Cobrar" align="left" />
      <div className="cobrar-body">
        {/* SearchBarView real: Buscar + refrescar + escanear QR */}
        <div className="cobrar-search" aria-hidden="true">
          <div className="search-pill">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.8" />
              <path d="m16.5 16.5 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            Buscar
          </div>
          <span className="icon-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 11a8 8 0 1 0-2.3 5.7M20 11V5m0 6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="icon-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4h4v4H4V4zm12 0h4v4h-4V4zM4 16h4v4H4v-4zm8-12h2v2h-2V4zm0 6h2v4h-2v-4zm6 6h4v4h-4v-4zm-6 2h2v2h-2v-2z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </span>
        </div>

        {/* tabs reales: ScrollableTabRow con indicador subrayado */}
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
          <button type="button" className="cobrar-tab">
            Configurar
          </button>
        </div>

        {/* vista Teclado (default del módulo real) */}
        <div className={`cobrar-view${view === 'teclado' ? ' active' : ''}`}>
          <div className="mini-amount">$0.00</div>
          <div className="quick-row" aria-hidden="true">
            {QUICK_AMOUNTS.map(q => (
              <span key={q}>{q}</span>
            ))}
          </div>
          <div className="mini-pad" aria-hidden="true">
            {PAD_ROWS.map(k => (
              <span key={k} className={k === '+' ? 'plus' : undefined}>
                {k}
              </span>
            ))}
          </div>
        </div>

        {/* vista Todos los productos (3 columnas, iniciales sobre tinte de categoría) */}
        <div className={`cobrar-view${view === 'productos' ? ' active' : ''}`}>
          <div className="prod-grid">
            {PRODUCTS.map(p => (
              <button
                key={p.id}
                type="button"
                className={`prod-card${inCart(p.id) ? ' added' : ''}`}
                data-t={'target' in p && p.target ? p.target : undefined}
              >
                <div className="thumb" style={{ background: p.tint }}>
                  <span>{p.initials}</span>
                </div>
                <div className="pn">{p.name}</div>
                <div className="pp">{p.price}</div>
              </button>
            ))}
          </div>
        </div>

        {/* panel real: solo divisor + botón píldora (label = feedback del carrito) */}
        <div className="cart-panel">
          <button type="button" className={`btn-cobrar${cartItems === 0 ? ' empty' : ''}`} data-t="btn-cobrar-cart">
            {cartButtonLabel}
          </button>
        </div>

        {/* CartDetailsSheet real: resumen del carrito antes del cobro definitivo */}
        <div className={`cart-sheet${cartSheetOpen ? ' open' : ''}`} aria-hidden={!cartSheetOpen}>
          <div className="sheet-grab" />
          <div className="sheet-head">
            <b>Carrito</b>
            <span>Cliente general</span>
          </div>
          <div className="sheet-item">
            <span className="qty">1</span>
            <span className="name">Playera básica blanca</span>
            <span className="price">$195.00</span>
          </div>
          <div className="sheet-item">
            <span className="qty">1</span>
            <span className="name">Gorra logo</span>
            <span className="price">$100.00</span>
          </div>
          <div className="sheet-total">
            <span>Total</span>
            <b>$295.00</b>
          </div>
          <button type="button" className="btn-cobrar" data-t="sheet-cobrar">
            Cobrar $295.00
          </button>
        </div>
      </div>
    </section>
  );
}
