import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import type { SubmitPayload, SubmitResponse } from '../../../lib/labs/types';
import { renderBriefEmail } from '../../../lib/labs/emailTemplate';

export const prerender = false;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(p: unknown): p is SubmitPayload {
  if (typeof p !== 'object' || p === null) return false;
  const o = p as Record<string, unknown>;
  if (typeof o.sessionId !== 'string') return false;
  if (typeof o.fields !== 'object' || o.fields === null) return false;
  const f = o.fields as Record<string, unknown>;
  if (typeof f.projectType !== 'string') return false;
  if (typeof f.businessContext !== 'string' || f.businessContext.trim().length === 0) return false;
  if (typeof f.coreFunctionality !== 'string' || f.coreFunctionality.trim().length === 0) return false;
  if (!Array.isArray(f.integrations)) return false;
  if (typeof f.designReference !== 'string') return false;
  if (typeof f.urgency !== 'string') return false;
  if (typeof f.contact !== 'object' || f.contact === null) return false;
  const c = f.contact as Record<string, unknown>;
  if (typeof c.name !== 'string' || c.name.trim().length === 0) return false;
  if (typeof c.email !== 'string' || !EMAIL_RE.test(c.email)) return false;
  if (!Array.isArray(o.transcript)) return false;
  return true;
}

export const POST: APIRoute = async ({ request, locals }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const r: SubmitResponse = { success: false, message: 'JSON inválido' };
    return new Response(JSON.stringify(r), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  if (!validate(body)) {
    const r: SubmitResponse = { success: false, message: 'Faltan campos requeridos o son inválidos' };
    return new Response(JSON.stringify(r), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const payload = body as SubmitPayload;

  const runtimeEnv = (locals as { runtime?: { env?: Record<string, string> } })?.runtime?.env;
  const readEnv = (key: string) => runtimeEnv?.[key] || import.meta.env[key];

  const smtpUser = readEnv('SMTP_USER');
  const smtpPass = readEnv('SMTP_PASS');
  const smtpHost = readEnv('SMTP_HOST') || 'smtpout.secureserver.net';
  const smtpPort = parseInt(readEnv('SMTP_PORT') || '587');
  const notifyEmail = readEnv('LABS_NOTIFY_EMAIL') || smtpUser;

  if (!smtpUser || !smtpPass) {
    console.error('Labs submit: SMTP credentials missing');
    const r: SubmitResponse = { success: false, message: 'Error de configuración del servidor' };
    return new Response(JSON.stringify(r), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: false,
    auth: { user: smtpUser, pass: smtpPass },
    tls: { rejectUnauthorized: false },
  });

  const html = renderBriefEmail(payload);
  const projectLabel = payload.fields.projectType;
  const subject = `[Labs] ${projectLabel} — ${payload.fields.contact.name} (${payload.fields.urgency})`;

  try {
    await transporter.sendMail({
      from: smtpUser,
      to: notifyEmail,
      replyTo: payload.fields.contact.email,
      subject,
      html,
      attachments: [
        {
          filename: `brief-${payload.sessionId}.json`,
          content: JSON.stringify(payload, null, 2),
          contentType: 'application/json',
        },
      ],
    });

    await transporter.sendMail({
      from: smtpUser,
      to: payload.fields.contact.email,
      subject: 'Recibimos tu brief — Avoqado Labs',
      html: `
        <h2>Hola ${payload.fields.contact.name},</h2>
        <p>Recibimos tu brief para Avoqado Labs. Jose lo revisa personalmente y te confirma timeline y costo en menos de 24 horas.</p>
        <p>Mientras tanto, si quieres agregar algo, responde a este correo.</p>
        <p style="color:#888;font-size:13px;">— El equipo de Avoqado Labs</p>
      `,
    });

    const r: SubmitResponse = { success: true, message: 'Brief enviado' };
    return new Response(JSON.stringify(r), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error('Labs submit error:', err);
    const r: SubmitResponse = { success: false, message: 'No pudimos enviar el brief. Intenta de nuevo.' };
    return new Response(JSON.stringify(r), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
