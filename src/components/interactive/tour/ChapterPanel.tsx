/**
 * Chapter panel (Square-style): 3 value-copy chapters with the active one
 * pulsing, flow selector pills ("Pago rápido" | "Cobrar") and the final
 * CTA that unlocks when the tour completes (F2 wires it to the live
 * dashboard journey — for now it surfaces a "Próximamente" toast).
 */
import type { FlowId } from './engine';

interface Props {
  chapter: number;
  done: boolean;
  flow: FlowId;
  onSelectFlow: (flow: FlowId) => void;
  onCtaClick: () => void;
}

const CHAPTERS = [
  { n: 1, title: 'Cobra en segundos', detail: '— monto directo o desde tu catálogo' },
  { n: 2, title: 'Propina y calificación', detail: '— tu cliente opina en el momento' },
  { n: 3, title: 'Aprobado al instante', detail: '— y reflejado en tu dashboard en vivo' },
] as const;

const FLOW_PILLS: { id: FlowId; label: string }[] = [
  { id: 'A', label: 'Pago rápido' },
  { id: 'B', label: 'Cobrar' },
];

export default function ChapterPanel({ chapter, done, flow, onSelectFlow, onCtaClick }: Props) {
  return (
    <aside className="panel">
      <h2>Terminal Avoqado para retail</h2>

      <ol className="chapters">
        {CHAPTERS.map(({ n, title, detail }) => {
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

      <p className="flow-label">Flujo de cobro</p>
      <div className="flow-pills">
        {FLOW_PILLS.map(({ id, label }) => (
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

      <button type="button" className={`cta-next${done ? ' ready' : ''}`} disabled={!done} onClick={onCtaClick}>
        Siguiente: míralo en TU dashboard &rarr;
      </button>
    </aside>
  );
}
