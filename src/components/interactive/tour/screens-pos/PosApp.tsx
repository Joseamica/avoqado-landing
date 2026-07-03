/**
 * PosApp (p-pos) — el POS completo tras la fusión: catálogo con categorías a
 * la izquierda, ticket vivo a la derecha, y el sheet "¿Cómo cobras?" que
 * manda el cobro a la terminal. Presentacional puro; el engine controla todo
 * vía PosState.
 *
 * Precios EXACTOS del flujo B (no cambiar sin cuadrar todo el demo):
 * Playera $195.00 + Gorra $100.00 = $295.00; la propina se elige en el PAX.
 * Cliente = María G. (la misma de la pantalla de lealtad del flujo TPV).
 * Targets del tour SIEMPRE montados — solo se gatean clases (regla engine).
 */
import type { ReactNode } from 'react';
import type { PosState } from '../flows-pos';

const CATEGORIES = ['Todos', 'Ropa', 'Accesorios', 'Servicios'];

interface Product {
  id: string;
  name: string;
  price: string;
  dataT?: string;
  icon: ReactNode;
}

const PRODUCTS: Product[] = [
  {
    id: 'playera',
    name: 'Playera básica blanca',
    price: '$195.00',
    dataT: 'pos-prod-playera',
    icon: <path d="M5.5 3.5 8 2.5l2.5 1 3 2-1.5 2.5-1-.7V13a.5.5 0 0 1-.5.5h-5A.5.5 0 0 1 5 13V7.3l-1 .7L2.5 5.5Z" />,
  },
  {
    id: 'gorra',
    name: 'Gorra logo',
    price: '$100.00',
    dataT: 'pos-prod-gorra',
    icon: (
      <>
        <path d="M3 9a5 5 0 0 1 10 0v1.5H3Z" />
        <path d="M13 10.5c1.4 0 1.8 1.3.6 2-.9.5-2.4.8-4 .3" />
      </>
    ),
  },
  {
    id: 'taza',
    name: 'Taza logo',
    price: '$120.00',
    icon: (
      <>
        <path d="M4 4.5h7V12a1.5 1.5 0 0 1-1.5 1.5H5.5A1.5 1.5 0 0 1 4 12Z" />
        <path d="M11 6h1.2a1.8 1.8 0 0 1 0 3.6H11" />
      </>
    ),
  },
  {
    id: 'sesion',
    name: 'Sesión de fotos',
    price: '$350.00',
    icon: (
      <>
        <rect x="2" y="5" width="12" height="8.5" rx="1.5" />
        <path d="M5.5 5 6.5 3.4h3L10.5 5" />
        <circle cx="8" cy="9" r="2.1" />
      </>
    ),
  },
  {
    id: 'album',
    name: 'Álbum 20 páginas',
    price: '$890.00',
    icon: (
      <>
        <rect x="3" y="2.8" width="10" height="10.5" rx="1.2" />
        <path d="M6 2.8v10.5" />
      </>
    ),
  },
  {
    id: 'marco',
    name: 'Marco 20×25',
    price: '$240.00',
    icon: (
      <>
        <rect x="3" y="3" width="10" height="10" rx="1" />
        <rect x="5.4" y="5.4" width="5.2" height="5.2" />
      </>
    ),
  },
];

function Pic({ p }: { p: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {p}
    </svg>
  );
}

interface Props {
  state: PosState;
}

export default function PosApp({ state }: Props) {
  const { playeraAdded, gorraAdded, customerSet, sheetOpen, terminalSelected, cobrarLabel } = state;
  const items = (playeraAdded ? 1 : 0) + (gorraAdded ? 1 : 0);

  return (
    <section className="web-screen pos p-pos" data-screen="p-pos">
      {/* Barra superior del POS */}
      <header className="pos-topbar">
        <span className="pos-venue">
          <b>Estudio Lumina</b> · Caja 1
        </span>
        <span className="pos-topbar-right">
          <span className="pos-shift">Turno abierto</span>
          <span className="pos-sync">
            <i />
            En línea
          </span>
        </span>
      </header>

      <div className="pos-body">
        {/* Catálogo */}
        <div className="pos-catalog">
          <div className="pos-cats">
            {CATEGORIES.map((c, i) => (
              <span key={c} className={`pos-cat${i === 0 ? ' active' : ''}`}>
                {c}
              </span>
            ))}
          </div>
          <div className="pos-grid">
            {PRODUCTS.map(p => (
              <button key={p.id} type="button" className="pos-prod" {...(p.dataT ? { 'data-t': p.dataT } : {})}>
                <span className="pos-prod-ic">
                  <Pic p={p.icon} />
                </span>
                <b>{p.name}</b>
                <span className="pos-prod-price">{p.price}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Ticket */}
        <aside className="pos-ticket">
          <div className="pos-ticket-head">
            <b>Ticket</b>
            <span>{items === 0 ? 'Nuevo' : `${items} ${items === 1 ? 'artículo' : 'artículos'}`}</span>
          </div>

          <button type="button" className={`pos-cust${customerSet ? ' set' : ''}`} data-t="pos-customer">
            {customerSet ? (
              <>
                <span className="pos-cust-avatar">MG</span>
                <span className="pos-cust-copy">
                  <b>María G.</b>
                  <span>1,240 pts · suma con esta venta</span>
                </span>
              </>
            ) : (
              <>
                <span className="pos-cust-plus">+</span>
                Asignar cliente
              </>
            )}
          </button>

          <div className="pos-lines">
            <div className={`pos-line${playeraAdded ? ' in' : ''}`} aria-hidden={!playeraAdded}>
              <span>1 · Playera básica blanca</span>
              <b>$195.00</b>
            </div>
            <div className={`pos-line${gorraAdded ? ' in' : ''}`} aria-hidden={!gorraAdded}>
              <span>1 · Gorra logo</span>
              <b>$100.00</b>
            </div>
            {items === 0 && <p className="pos-empty">Toca un producto para agregarlo</p>}
          </div>

          <div className="pos-total">
            <span>Total</span>
            <b>{items === 2 ? '$295.00' : items === 1 ? '$195.00' : '$0.00'}</b>
          </div>

          <button type="button" className={`pos-cobrar${items > 0 ? ' ready' : ''}`} data-t="pos-cobrar">
            {cobrarLabel}
          </button>
        </aside>
      </div>

      {/* Sheet "¿Cómo cobras?" — siempre montado, gateado por clase */}
      <div className={`pos-sheet-scrim${sheetOpen ? ' open' : ''}`} aria-hidden={!sheetOpen}>
        <div className="pos-sheet">
          <b className="pos-sheet-title">¿Cómo cobras $295.00?</b>
          <button type="button" className={`pos-method${terminalSelected ? ' selected' : ''}`} data-t="pos-pay-terminal">
            <span className="pos-method-ic">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="4.5" y="1.8" width="7" height="12.4" rx="1.4" />
                <path d="M6.2 4h3.6M6.2 11.6h3.6" />
              </svg>
            </span>
            <span className="pos-method-copy">
              <b>Terminal Avoqado</b>
              <span>El cobro brinca solo a tu PAX</span>
            </span>
          </button>
          <button type="button" className="pos-method">
            <span className="pos-method-ic">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="1.8" y="4" width="12.4" height="8" rx="1.4" />
                <circle cx="8" cy="8" r="1.8" />
              </svg>
            </span>
            <span className="pos-method-copy">
              <b>Efectivo</b>
              <span>Registra y calcula el cambio</span>
            </span>
          </button>
          <button type="button" className="pos-method">
            <span className="pos-method-ic">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M6.7 9.3a2.4 2.4 0 0 0 3.4 0l1.7-1.7a2.4 2.4 0 0 0-3.4-3.4l-.8.8" />
                <path d="M9.3 6.7a2.4 2.4 0 0 0-3.4 0L4.2 8.4a2.4 2.4 0 0 0 3.4 3.4l.8-.8" />
              </svg>
            </span>
            <span className="pos-method-copy">
              <b>Liga de pago</b>
              <span>Cóbrale a distancia por WhatsApp</span>
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
