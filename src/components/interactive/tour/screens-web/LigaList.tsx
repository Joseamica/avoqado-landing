/**
 * LigaList — pantalla "Ligas de pago" (lista) del dashboard web.
 * Mockup fiel del feature PaymentLinks real de avoqado-web-dashboard
 * para el tour guiado en avoqado.io/demo (venue demo: Estudio Lumina).
 * Puramente presentacional — el engine del tour controla todo via props.
 */
import type { ReactNode } from 'react';
import DashShell from '../screens-dash/DashShell';

interface Props {
  saved: boolean;
  waOpen: boolean;
  waSent: boolean;
  paid: boolean;
  toast: string | null;
}

function Ic({ p, size = 15 }: { p: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {p}
    </svg>
  );
}

const ic = {
  inicio: <path d="M3 8.2 8 3.6l5 4.6V13a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 3 13Z" />,
  menu: (
    <>
      <path d="M2.5 4.5h11" />
      <path d="M2.5 8h11" />
      <path d="M2.5 11.5h11" />
    </>
  ),
  ventas: (
    <>
      <rect x="2" y="4.5" width="12" height="7" rx="1.5" />
      <circle cx="8" cy="8" r="1.7" />
    </>
  ),
  reservas: (
    <>
      <rect x="2.5" y="3.5" width="11" height="10" rx="1.5" />
      <path d="M2.5 6.5h11M5.5 2.2v2.2M10.5 2.2v2.2" />
    </>
  ),
  equipo: (
    <>
      <circle cx="6" cy="5.8" r="2.1" />
      <path d="M2.6 13c.4-2 1.7-3 3.4-3s3 1 3.4 3" />
      <path d="M10.4 7.6a2 2 0 1 0-1.2-3.7" />
      <path d="M11 10.3c1.3.4 2.1 1.3 2.4 2.7" />
    </>
  ),
  reportes: (
    <>
      <path d="M3.5 13.5v-4" />
      <path d="M8 13.5v-8" />
      <path d="M12.5 13.5v-6" />
    </>
  ),
  config: (
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2.6v1.6M8 11.8v1.6M2.6 8h1.6M11.8 8h1.6M4.2 4.2l1.1 1.1M10.7 10.7l1.1 1.1M11.8 4.2l-1.1 1.1M5.3 10.7l-1.1 1.1" />
    </>
  ),
  link: (
    <>
      <path d="M6.7 9.3a2.4 2.4 0 0 0 3.4 0l1.7-1.7a2.4 2.4 0 0 0-3.4-3.4l-.8.8" />
      <path d="M9.3 6.7a2.4 2.4 0 0 0-3.4 0L4.2 8.4a2.4 2.4 0 0 0 3.4 3.4l.8-.8" />
    </>
  ),
  copy: (
    <>
      <rect x="6" y="6" width="7.5" height="7.5" rx="1.5" />
      <path d="M3.8 10H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v.8" />
    </>
  ),
};

const ROWS = [
  { t: 'Anticipo boda Carla', m: '$2,500.00', open: false, p: '3', c: '3 jun' },
  { t: 'Donación taller', m: 'El cliente ingresa el monto', open: true, p: '9', c: '28 may' },
];

function Actions({ waTarget }: { waTarget?: boolean }) {
  return (
    <span className="lg-actions">
      <button type="button" className="lg-icon-btn" aria-label="Copiar liga">
        <Ic p={ic.copy} size={13} />
      </button>
      <button
        type="button"
        className="lg-icon-btn"
        aria-label="Compartir por WhatsApp"
        {...(waTarget ? { 'data-t': 'liga-wa' } : {})}
      >
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 2.2a5.6 5.6 0 0 0-4.8 8.5l-.7 2.8 2.9-.7A5.6 5.6 0 1 0 8 2.2Z" fill="#25D366" />
          <path
            d="M6.1 5.4c.2-.5.8-.6 1.1-.2l.5.8c.2.3.1.6-.1.9.3.6.8 1.1 1.4 1.4.3-.2.6-.3.9-.1l.8.5c.4.3.3.9-.2 1.1-1.7.7-5-2.7-4.4-4.4Z"
            fill="#fff"
          />
        </svg>
      </button>
      <button type="button" className="lg-icon-btn" aria-label="Más opciones">
        ⋯
      </button>
    </span>
  );
}

function WaDialog({ sent }: { sent: boolean }) {
  return (
    <div className="lg-scrim">
      <div className="lg-dialog">
        {sent ? (
          <div className="lg-wa-done">
            <svg width="34" height="34" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" fill="#059669" />
              <path d="m7.8 12.4 2.7 2.7 5.7-5.9" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <b>Liga enviada</b>
            <span>Mensaje enviado vía WhatsApp Business · Plantilla aprobada por Meta</span>
          </div>
        ) : (
          <>
            <h3>Compartir por WhatsApp</h3>
            <p className="lg-dialog-desc">Envía la liga de pago al WhatsApp del cliente. El mensaje sale del número de Avoqado.</p>
            <span className="lg-flabel">Teléfono del cliente</span>
            <div className="lg-input filled">+52 · 55 1234 5678</div>
            <div className="lg-bubble">Paga aquí: Sesión de fotos — pay.avoqado.io/aB3k9x</div>
            <div className="lg-dialog-foot">
              <button type="button" className="lg-btn-ghost">Enviar desde mi WhatsApp</button>
              <button type="button" className="lg-btn-primary" data-t="wa-send">Enviar liga</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const ligaNav = (
  <>
    <span className="lg-nav-item"><Ic p={ic.inicio} />Inicio</span>
    <span className="lg-nav-item"><Ic p={ic.menu} />Menú</span>
    <span className="lg-nav-item active"><Ic p={ic.ventas} />Ventas</span>
    <div className="lg-subnav">
      <span className="lg-sub-item">Transacciones</span>
      <span className="lg-sub-item">Pedidos</span>
      <span className="lg-sub-item active">Ligas de Pago</span>
      <span className="lg-sub-item">Terminal Virtual</span>
    </div>
    <span className="lg-nav-item"><Ic p={ic.reservas} />Reservaciones</span>
    <span className="lg-nav-item"><Ic p={ic.equipo} />Equipo</span>
    <span className="lg-nav-item"><Ic p={ic.reportes} />Reportes</span>
    <span className="lg-nav-item"><Ic p={ic.config} />Configuración</span>
  </>
);

const ligaSideFoot = (
  <div className="lg-side-foot">
    <span className="lg-tile"><Ic p={ic.ventas} size={12} /></span>
    Aceptar pago
  </div>
);

export default function LigaList({ saved, waOpen, waSent, paid, toast }: Props) {
  return (
    <section className="web-screen lg" data-screen="l-list">
      <DashShell nav={ligaNav} sideFoot={ligaSideFoot}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Ligas de pago</h1>
            <p className="lg-subtitle">Crea y comparte ligas de pago con tus clientes</p>
          </div>
          <button type="button" className="lg-btn-primary" data-t="liga-create">+ Crear liga</button>
        </div>

        <div className="lg-pills">
          <span className="lg-pill active">Todas</span>
          <span className="lg-pill">Activas</span>
          <span className="lg-pill">Usadas</span>
          <span className="lg-pill">Pausadas</span>
        </div>

        <div className="lg-cards">
          <div className="lg-card"><span className="lg-card-label">Ligas</span><span className="lg-card-value">{saved ? '13' : '12'}</span></div>
          <div className="lg-card"><span className="lg-card-label">Cobrado</span><span className="lg-card-value">{paid ? '$18,800.00' : '$18,450.00'}</span></div>
          <div className="lg-card"><span className="lg-card-label">Tasa de uso</span><span className="lg-card-value">64%</span></div>
        </div>

        <div className="lg-table">
          <div className="lg-tr lg-th">
            <span>Título</span><span>Monto</span><span>Estado</span><span>Pagos</span><span>Creada</span><span />
          </div>
          {saved && (
            <div className="lg-tr lg-row-new">
              <span className="lg-tcell">
                <span className="lg-row-ic"><Ic p={ic.link} size={11} /></span>
                <b>Sesión de fotos</b>
              </span>
              <span>$350.00</span>
              <span><span className="lg-badge">Activa</span></span>
              <span>{paid ? '1' : '0'}</span>
              <span className="lg-date">Hoy</span>
              <Actions waTarget />
            </div>
          )}
          {ROWS.map(r => (
            <div className="lg-tr" key={r.t}>
              <span className="lg-tcell">
                <span className="lg-row-ic"><Ic p={ic.link} size={11} /></span>
                <b>{r.t}</b>
              </span>
              <span className={r.open ? 'lg-open' : ''}>{r.m}</span>
              <span><span className="lg-badge">Activa</span></span>
              <span>{r.p}</span>
              <span className="lg-date">{r.c}</span>
              <Actions />
            </div>
          ))}
        </div>
      </DashShell>

      {waOpen && <WaDialog sent={waSent} />}
      {toast && (
        <div className="lg-toast">
          {paid && <span className="lg-dot" />}
          {toast}
        </div>
      )}
    </section>
  );
}
