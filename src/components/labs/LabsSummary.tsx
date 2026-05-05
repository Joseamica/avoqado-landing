import { useEffect, useId, useRef, useState } from 'react';
import type { ExtractedFields, ProjectType, Urgency } from '../../lib/labs/types';

interface Props {
  fields: ExtractedFields;
  canSubmit: boolean;
  onSubmit: () => void;
}

const projectTypeLabels: Record<ProjectType, string> = {
  'web-app': 'Web App',
  'mobile-app': 'App Móvil',
  dashboard: 'Dashboard',
  automation: 'Automatización',
  'ai-agent': 'Agente AI',
  integration: 'Integración',
  report: 'Reporte',
  other: 'Otro',
};

const urgencyLabels: Record<Urgency, string> = {
  hoy: 'Hoy',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mes',
  'sin-prisa': 'Sin prisa',
};

interface FieldRow {
  label: string;
  value: string | undefined;
  done: boolean;
}

function buildRows(f: ExtractedFields): FieldRow[] {
  const projectTypeValue =
    f.projectType === 'other' && f.projectTypeFreeText
      ? `Otro: ${f.projectTypeFreeText}`
      : f.projectType
      ? projectTypeLabels[f.projectType]
      : undefined;

  const integrationsValue =
    f.integrations === undefined
      ? undefined
      : f.integrations.length === 0
      ? 'ninguna'
      : f.integrations.join(', ');

  const contactValue = f.contact?.name && f.contact?.email ? `${f.contact.name} · ${f.contact.email}` : undefined;

  return [
    { label: 'Tipo', value: projectTypeValue, done: !!f.projectType && (f.projectType !== 'other' || !!f.projectTypeFreeText) },
    { label: 'Contexto', value: f.businessContext, done: !!f.businessContext },
    { label: 'Funcionalidad', value: f.coreFunctionality, done: !!f.coreFunctionality },
    { label: 'Integraciones', value: integrationsValue, done: f.integrations !== undefined },
    { label: 'Diseño', value: f.designReference, done: !!f.designReference },
    { label: 'Urgencia', value: f.urgency ? urgencyLabels[f.urgency] : undefined, done: !!f.urgency },
    { label: 'Contacto', value: contactValue, done: !!(f.contact?.name && f.contact?.email) },
  ];
}

interface RowProps {
  row: FieldRow;
}

function Row({ row }: RowProps) {
  // Pulse the row briefly when its value changes from pending → filled.
  // Helps users notice that the conversation just unlocked a new field.
  const [justFilled, setJustFilled] = useState(false);
  const prevDone = useRef(row.done);
  useEffect(() => {
    if (!prevDone.current && row.done) {
      setJustFilled(true);
      const t = setTimeout(() => setJustFilled(false), 1200);
      prevDone.current = row.done;
      return () => clearTimeout(t);
    }
    prevDone.current = row.done;
  }, [row.done]);

  return (
    <div
      className={`py-3 px-2 -mx-2 rounded-md border-b border-[color:var(--labs-rule)] last:border-b-0 transition-colors duration-700 motion-reduce:transition-none ${
        justFilled ? 'bg-[color:var(--labs-accent-soft)]' : ''
      }`}
    >
      <dt className="text-[10px] uppercase tracking-widest text-[color:var(--labs-ink-muted)] mb-1">{row.label}</dt>
      <dd
        className={`text-sm leading-snug ${
          row.done ? 'text-[color:var(--labs-ink)]' : 'text-[color:var(--labs-ink-muted)] italic'
        }`}
      >
        {row.done ? row.value : <>pendiente<span className="sr-only"> — aún sin completar</span></>}
      </dd>
    </div>
  );
}

export default function LabsSummary({ fields, canSubmit, onSubmit }: Props) {
  const headingId = useId();
  const missingId = useId();
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const rows = buildRows(fields);
  const completed = rows.filter(r => r.done).length;
  const total = rows.length;
  const missing = rows.filter(r => !r.done).map(r => r.label.toLowerCase());
  const progressPct = (completed / total) * 100;

  return (
    <aside aria-labelledby={headingId} className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-2xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] p-5 shadow-[var(--labs-shadow-soft)]">
        {/* Mobile collapsible header — clickable to expand/collapse */}
        <button
          type="button"
          onClick={() => setMobileExpanded(v => !v)}
          aria-expanded={mobileExpanded}
          aria-controls={`${headingId}-body`}
          className="lg:hidden w-full flex items-center justify-between gap-3 -m-1 p-1 rounded-md"
        >
          <div className="text-left">
            <h2
              id={headingId}
              className="text-xs uppercase tracking-widest text-[color:var(--labs-accent)] font-semibold"
            >
              Resumen vivo
            </h2>
            <div className="text-sm text-[color:var(--labs-ink-muted)] mt-0.5">
              <span className="text-[color:var(--labs-ink)] font-medium">{completed}</span> de {total} completos
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Progress ring approximation: linear bar */}
            <div className="w-16 h-1.5 rounded-full bg-[color:var(--labs-rule)] overflow-hidden" aria-hidden="true">
              <div
                className="h-full bg-[color:var(--labs-accent)] transition-[width] duration-500 motion-reduce:transition-none"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <svg
              className={`w-4 h-4 text-[color:var(--labs-ink-muted)] transition-transform duration-300 motion-reduce:transition-none ${
                mobileExpanded ? 'rotate-180' : ''
              }`}
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="M5 7.5l5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </button>

        {/* Desktop heading — always visible */}
        <h2
          id={`${headingId}-desktop`}
          className="hidden lg:block text-xs uppercase tracking-widest text-[color:var(--labs-accent)] font-semibold mb-3"
        >
          Resumen vivo
        </h2>

        {/* Body — collapsible on mobile, always shown on lg+ */}
        <div
          id={`${headingId}-body`}
          className={`${mobileExpanded ? 'block' : 'hidden'} lg:block ${mobileExpanded ? 'mt-4 lg:mt-0' : ''}`}
        >
          <dl>
            {rows.map(row => (
              <Row key={row.label} row={row} />
            ))}
          </dl>

          {!canSubmit && (
            <p id={missingId} className="mt-3 text-xs text-[color:var(--labs-ink-muted)] leading-relaxed">
              Falta: <span className="text-[color:var(--labs-ink)]">{missing.join(', ')}</span>.
            </p>
          )}

          <button
            type="button"
            onClick={onSubmit}
            disabled={!canSubmit}
            aria-disabled={!canSubmit}
            aria-describedby={!canSubmit ? missingId : undefined}
            className={`w-full mt-4 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 motion-reduce:transition-none ${
              canSubmit
                ? 'bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white shadow-[var(--labs-shadow-pop)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0'
                : 'bg-[color:var(--labs-rule)] text-[color:var(--labs-ink)]/60 cursor-not-allowed'
            }`}
          >
            {canSubmit ? 'Enviar a Jose' : `Completa el brief para enviar`}
          </button>
        </div>
      </div>
    </aside>
  );
}
