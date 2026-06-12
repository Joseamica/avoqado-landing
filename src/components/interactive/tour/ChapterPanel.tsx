/**
 * Chapter panel (Square-style): título + 3 capítulos de venta por flujo,
 * selector de demos agrupado (terminal / navegador) y el CTA final que se
 * desbloquea al completar el tour.
 */
import type { FlowId } from './engine';

interface Props {
  chapter: number;
  done: boolean;
  flow: FlowId;
  onSelectFlow: (flow: FlowId) => void;
  onCtaClick: () => void;
}

interface FlowMeta {
  title: string;
  chapters: readonly { n: 1 | 2 | 3; title: string; detail: string }[];
  cta: string;
}

const TPV_CHAPTERS = [
  { n: 1, title: 'Cobra en segundos', detail: '— monto directo o desde tu catálogo' },
  { n: 2, title: 'Propina y calificación', detail: '— tu cliente opina en el momento' },
  { n: 3, title: 'Aprobado al instante', detail: '— y reflejado en tu dashboard en vivo' },
] as const;

const FLOW_META: Record<FlowId, FlowMeta> = {
  A: {
    title: 'Terminal Avoqado',
    chapters: TPV_CHAPTERS,
    cta: 'Siguiente: míralo en tu dashboard →',
  },
  B: {
    title: 'Terminal Avoqado',
    chapters: TPV_CHAPTERS,
    cta: 'Siguiente: míralo en tu dashboard →',
  },
  R: {
    title: 'Reservas en línea',
    chapters: [
      { n: 1, title: 'Tu cliente reserva solo', detail: '— desde tu página, Google o redes' },
      { n: 2, title: 'Horario y datos en segundos', detail: '— sin llamadas ni mensajes' },
      { n: 3, title: 'Directo a tu calendario', detail: '— con recordatorios por WhatsApp' },
    ],
    cta: 'Siguiente: explora tu dashboard demo →',
  },
  L: {
    title: 'Ligas de pago',
    chapters: [
      { n: 1, title: 'Crea tu liga', detail: '— monto fijo, abierto o un artículo' },
      { n: 2, title: 'Compártela', detail: '— WhatsApp, QR o link directo' },
      { n: 3, title: 'Cobra en línea', detail: '— y míralo reflejado al instante' },
    ],
    cta: 'Siguiente: explora tu dashboard demo →',
  },
};

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

export default function ChapterPanel({ chapter, done, flow, onSelectFlow, onCtaClick }: Props) {
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

      <button type="button" className={`cta-next${done ? ' ready' : ''}`} disabled={!done} onClick={onCtaClick}>
        {meta.cta}
      </button>
    </aside>
  );
}
