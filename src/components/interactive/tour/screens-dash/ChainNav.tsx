/**
 * ChainNav — shared left-nav for the "cadena post-venta" dash-* screens
 * (Inventario → Facturación → Equipo → Clientes → Reportes → Asistente IA).
 * Rendered inside DashShell's `nav` slot. Reuses the `Ic` helper + icon path
 * pattern from LigaList.tsx (ventas/equipo/reportes/config already existed
 * there); inventory/invoice/AI are new minimal-style SVG icons, no emojis.
 */
import type { ReactNode } from 'react';

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
  inventario: (
    <>
      <path d="M2.5 5.2 8 2.5l5.5 2.7L8 7.9Z" />
      <path d="M2.5 5.2v5.6L8 13.5l5.5-2.7V5.2" />
      <path d="M8 7.9v5.6" />
    </>
  ),
  factura: (
    <>
      <path d="M4 2.5h6l2.5 2.5v8a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-10A.5.5 0 0 1 4 2.5Z" />
      <path d="M5.6 6.2h4.8M5.6 8.4h4.8M5.6 10.6h3" />
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
  clientes: (
    <>
      <circle cx="8" cy="5.6" r="2.4" />
      <path d="M3.2 13.4c.5-2.6 2.2-4 4.8-4s4.3 1.4 4.8 4" />
    </>
  ),
  reportes: (
    <>
      <path d="M3.5 13.5v-4" />
      <path d="M8 13.5v-8" />
      <path d="M12.5 13.5v-6" />
    </>
  ),
  ia: (
    <>
      <path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2" />
      <rect x="5.2" y="5.2" width="5.6" height="5.6" rx="1.6" />
      <circle cx="6.7" cy="7.7" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="9.3" cy="7.7" r="0.6" fill="currentColor" stroke="none" />
    </>
  ),
  config: (
    <>
      <circle cx="8" cy="8" r="2" />
      <path d="M8 2.6v1.6M8 11.8v1.6M2.6 8h1.6M11.8 8h1.6M4.2 4.2l1.1 1.1M10.7 10.7l1.1 1.1M11.8 4.2l-1.1 1.1M5.3 10.7l-1.1 1.1" />
    </>
  ),
};

interface NavEntry {
  id: string;
  label: string;
  icon: ReactNode;
  dataT?: string;
}

const ITEMS: NavEntry[] = [
  { id: 'inicio', label: 'Inicio', icon: ic.inicio },
  { id: 'ventas', label: 'Ventas', icon: ic.ventas, dataT: 'nav-ventas' },
  { id: 'reservas', label: 'Reservaciones', icon: ic.reservas },
  { id: 'inventario', label: 'Inventario', icon: ic.inventario, dataT: 'nav-inv' },
  { id: 'facturacion', label: 'Facturación', icon: ic.factura, dataT: 'nav-cfdi' },
  { id: 'equipo', label: 'Equipo', icon: ic.equipo, dataT: 'nav-equipo' },
  { id: 'clientes', label: 'Clientes', icon: ic.clientes, dataT: 'nav-clientes' },
  { id: 'reportes', label: 'Reportes', icon: ic.reportes, dataT: 'nav-reportes' },
  { id: 'ia', label: 'Asistente IA', icon: ic.ia, dataT: 'nav-ia' },
  { id: 'config', label: 'Configuración', icon: ic.config },
];

interface ChainNavProps {
  /** data-t value (or id) of the currently active item. */
  active: string;
}

export default function ChainNav({ active }: ChainNavProps) {
  return (
    <>
      {ITEMS.map(item => (
        <span
          key={item.id}
          className={`lg-nav-item${item.dataT === active || item.id === active ? ' active' : ''}`}
          {...(item.dataT ? { 'data-t': item.dataT } : {})}
        >
          <Ic p={item.icon} />
          {item.label}
        </span>
      ))}
    </>
  );
}
