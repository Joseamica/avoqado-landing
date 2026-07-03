/**
 * Chapter panel (Square-style): título + 3 capítulos de venta por flujo,
 * selector de demos agrupado (terminal / navegador) y el CTA de ventas —
 * SIEMPRE activo (founder: no condicionar el contacto a terminar el demo;
 * quien quiere hablar con ventas a mitad del tour es el lead más caliente).
 */
import type { FlowId } from './engine';

interface Props {
  chapter: number;
  done: boolean;
  flow: FlowId;
  onSelectFlow: (flow: FlowId) => void;
  waHref: string;
  /** Receives the click event — the handler holds the same-tab navigation
   *  until tour_cta_click leaves the page (see trackTourBeforeNav). */
  onPrimaryCta: (e: import('react').MouseEvent<HTMLAnchorElement>) => void;
}

interface FlowMeta {
  title: string;
  chapters: readonly { n: number; title: string; detail: string }[];
}

const TPV_CHAPTERS = [
  { n: 1, title: 'Cobra en segundos', detail: '— monto directo o desde tu catálogo' },
  { n: 2, title: 'Propina y calificación', detail: '— tu cliente opina en el momento' },
  { n: 3, title: 'Aprobado al instante', detail: '— y reflejado en tu dashboard en vivo' },
  { n: 4, title: 'Todo se dispara solo', detail: '— inventario, factura, comisiones y puntos' },
  { n: 5, title: 'Pregúntale a tu negocio', detail: '— tu IA responde con tus datos' },
] as const;

const FLOW_META: Record<FlowId, FlowMeta> = {
  A: {
    title: 'Terminal Avoqado',
    chapters: TPV_CHAPTERS,
  },
  B: {
    title: 'Terminal Avoqado',
    chapters: TPV_CHAPTERS,
  },
  R: {
    title: 'Reservas en línea',
    chapters: [
      { n: 1, title: 'Tu cliente reserva solo', detail: '— desde tu página, Google o redes' },
      { n: 2, title: 'Horario y datos en segundos', detail: '— sin llamadas ni mensajes' },
      { n: 3, title: 'Directo a tu calendario', detail: '— con recordatorios por WhatsApp' },
      { n: 4, title: 'Llegó y cobraste', detail: '— la venta cae sola en tu dashboard' },
    ],
  },
  L: {
    title: 'Ligas de pago',
    chapters: [
      { n: 1, title: 'Crea tu liga', detail: '— monto fijo, abierto o un artículo' },
      { n: 2, title: 'Compártela', detail: '— WhatsApp, QR o link directo' },
      { n: 3, title: 'Cobra en línea', detail: '— y míralo reflejado al instante' },
    ],
  },
};

/** Primary CTA label is fixed/shared across all flows (WhatsApp handoff). */
const PRIMARY_CTA_LABEL = 'Contactar a ventas →';

const FLOW_GROUPS: { label: string; pills: { id: FlowId; label: string }[] }[] = [
  {
    label: 'En tu terminal',
    pills: [
      { id: 'A', label: 'Pago rápido' },
      { id: 'B', label: 'Cobrar' },
    ],
  },
  {
    label: 'En tu navegador',
    pills: [
      { id: 'R', label: 'Reserva en línea' },
      { id: 'L', label: 'Liga de pago' },
    ],
  },
];

export default function ChapterPanel({ chapter, done, flow, onSelectFlow, waHref, onPrimaryCta }: Props) {
  const meta = FLOW_META[flow];

  return (
    <aside className="panel">
      <h2>{meta.title}</h2>

      <ol className="chapters">
        {meta.chapters.map(({ n, title, detail }) => {
          const isDone = done || n < chapter;
          const isActive = !done && n === chapter;
          return (
            <li key={n} className={`chapter${isActive ? ' active' : ''}${isDone ? ' done' : ''}`}>
              <span className="ch-num">{isDone ? '✓' : n}</span>
              <p className="ch-copy">
                <b>{title}</b> <span>{detail}</span>
              </p>
            </li>
          );
        })}
      </ol>

      {FLOW_GROUPS.map(group => (
        <div key={group.label}>
          <p className="flow-label">{group.label}</p>
          <div className="flow-pills">
            {group.pills.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`flow-pill${flow === id ? ' active' : ''}`}
                onClick={() => onSelectFlow(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="cta-group">
        <a className="cta-next ready cta-wa" href={waHref} onClick={onPrimaryCta}>
          {PRIMARY_CTA_LABEL}
        </a>
      </div>
    </aside>
  );
}
