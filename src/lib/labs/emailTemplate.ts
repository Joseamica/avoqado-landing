import type { SubmitPayload } from './types';

const labelMap: Record<string, string> = {
  'web-app': 'Web App',
  'mobile-app': 'App Móvil',
  dashboard: 'Dashboard',
  automation: 'Automatización',
  'ai-agent': 'Agente AI',
  integration: 'Integración',
  report: 'Reporte',
  other: 'Otro',
};

const urgencyMap: Record<string, string> = {
  hoy: 'Hoy',
  'esta-semana': 'Esta semana',
  'este-mes': 'Este mes',
  'sin-prisa': 'Sin prisa',
};

function escape(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderBriefEmail(payload: SubmitPayload): string {
  const f = payload.fields;
  const transcriptHtml = payload.transcript
    .map(
      m =>
        `<div style="margin:8px 0;padding:8px 12px;border-left:3px solid ${
          m.role === 'user' ? '#c9712f' : '#888'
        };background:#fafafa;font-size:13px;">
          <strong>${m.role === 'user' ? 'Cliente' : 'Agente'}:</strong>
          <div style="white-space:pre-wrap;margin-top:4px;">${escape(m.content)}</div>
        </div>`
    )
    .join('');

  const projectTypeLabel =
    f.projectType === 'other' && f.projectTypeFreeText
      ? `Otro: ${escape(f.projectTypeFreeText)}`
      : labelMap[f.projectType] || f.projectType;

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<style>
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #222; max-width: 720px; margin: 0 auto; padding: 24px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  h2 { font-size: 14px; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin: 24px 0 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
  .field { margin: 8px 0; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #999; }
  .value { font-size: 15px; line-height: 1.5; }
  .pill { display: inline-block; background: #f5e8df; color: #c9712f; padding: 2px 10px; border-radius: 999px; font-size: 12px; margin: 0 4px 4px 0; }
  .meta { background: #fafafa; padding: 12px; border-radius: 8px; font-size: 12px; color: #666; margin-top: 24px; }
</style>
</head>
<body>
  <h1>Nuevo brief de Avoqado Labs</h1>
  <p style="color:#666;font-size:14px;margin:0 0 16px;">
    Sesión <code>${escape(payload.sessionId)}</code> · ${labelMap[f.projectType] || f.projectType} · Urgencia: ${
    urgencyMap[f.urgency] || f.urgency
  }
  </p>

  <h2>Contacto</h2>
  <div class="field"><div class="label">Nombre</div><div class="value">${escape(f.contact.name)}</div></div>
  <div class="field"><div class="label">Email</div><div class="value"><a href="mailto:${escape(f.contact.email)}">${escape(f.contact.email)}</a></div></div>
  ${f.contact.whatsapp ? `<div class="field"><div class="label">WhatsApp</div><div class="value">${escape(f.contact.whatsapp)}</div></div>` : ''}

  <h2>Proyecto</h2>
  <div class="field"><div class="label">Tipo</div><div class="value">${projectTypeLabel}</div></div>
  <div class="field"><div class="label">Contexto del negocio</div><div class="value">${escape(f.businessContext)}</div></div>
  <div class="field"><div class="label">Funcionalidad principal</div><div class="value">${escape(f.coreFunctionality)}</div></div>
  <div class="field">
    <div class="label">Integraciones</div>
    <div class="value">
      ${f.integrations.length === 0 ? 'ninguna' : f.integrations.map(i => `<span class="pill">${escape(i)}</span>`).join('')}
    </div>
  </div>
  <div class="field"><div class="label">Referencia de diseño</div><div class="value">${escape(f.designReference)}</div></div>
  <div class="field"><div class="label">Urgencia</div><div class="value">${urgencyMap[f.urgency] || f.urgency}</div></div>

  ${
    payload.additionalNotes
      ? `<h2>Notas adicionales del cliente</h2><div class="value" style="white-space:pre-wrap;">${escape(payload.additionalNotes)}</div>`
      : ''
  }

  <h2>Transcripción</h2>
  ${transcriptHtml}

  <div class="meta">
    Enviado desde avoqado.io/labs · ${new Date().toISOString()}
  </div>
</body>
</html>`;
}
