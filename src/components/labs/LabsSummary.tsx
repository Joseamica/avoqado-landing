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

interface RowProps {
  label: string;
  value: string | undefined;
  pending?: boolean;
}

function Row({ label, value, pending }: RowProps) {
  return (
    <div className="py-3 border-b border-[color:var(--labs-rule)] last:border-b-0">
      <div className="text-[10px] uppercase tracking-widest text-[color:var(--labs-ink-muted)] mb-1">
        {label}
      </div>
      <div
        className={`text-sm leading-snug ${
          pending ? 'text-[color:var(--labs-ink-muted)] italic' : 'text-[color:var(--labs-ink)]'
        }`}
      >
        {pending ? 'pendiente' : value}
      </div>
    </div>
  );
}

export default function LabsSummary({ fields, canSubmit, onSubmit }: Props) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start lg:h-fit">
      <div className="rounded-2xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] p-5 shadow-[var(--labs-shadow-soft)]">
        <div className="text-xs uppercase tracking-widest text-[color:var(--labs-accent)] font-semibold mb-3">
          Resumen vivo
        </div>

        <Row
          label="Tipo"
          value={
            fields.projectType === 'other' && fields.projectTypeFreeText
              ? `Otro: ${fields.projectTypeFreeText}`
              : fields.projectType
              ? projectTypeLabels[fields.projectType]
              : undefined
          }
          pending={!fields.projectType}
        />
        <Row label="Contexto" value={fields.businessContext} pending={!fields.businessContext} />
        <Row label="Funcionalidad" value={fields.coreFunctionality} pending={!fields.coreFunctionality} />
        <Row
          label="Integraciones"
          value={
            fields.integrations === undefined
              ? undefined
              : fields.integrations.length === 0
              ? 'ninguna'
              : fields.integrations.join(', ')
          }
          pending={fields.integrations === undefined}
        />
        <Row label="Diseño" value={fields.designReference} pending={!fields.designReference} />
        <Row
          label="Urgencia"
          value={fields.urgency ? urgencyLabels[fields.urgency] : undefined}
          pending={!fields.urgency}
        />
        <Row
          label="Contacto"
          value={fields.contact ? `${fields.contact.name} · ${fields.contact.email}` : undefined}
          pending={!fields.contact?.name || !fields.contact?.email}
        />

        <button
          onClick={onSubmit}
          disabled={!canSubmit}
          className={`w-full mt-4 px-4 py-3 rounded-full text-sm font-medium transition-all duration-200 ${
            canSubmit
              ? 'bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white shadow-[var(--labs-shadow-pop)] hover:-translate-y-0.5'
              : 'bg-[color:var(--labs-rule)] text-[color:var(--labs-ink-muted)] cursor-not-allowed'
          }`}
        >
          {canSubmit ? 'Enviar a Jose' : 'Faltan datos'}
        </button>
      </div>
    </aside>
  );
}
