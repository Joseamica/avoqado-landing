import type { APIRoute } from 'astro';
import type { SubmitResponse } from '../../../lib/labs/types';

export const prerender = false;

const API_BASE = 'https://api.avoqado.io/api/v1/public';

// Cloudflare Pages Functions cannot use nodemailer (no raw TCP sockets even with
// nodejs_compat). We proxy to avoqado-server which sends via Resend over HTTP.
export const POST: APIRoute = async ({ request }) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    const r: SubmitResponse = { success: false, message: 'JSON inválido' };
    return new Response(JSON.stringify(r), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const upstream = await fetch(`${API_BASE}/labs/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const text = await upstream.text();
    const contentType = upstream.headers.get('content-type') || 'application/json';
    return new Response(text, {
      status: upstream.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    console.error('[labs/submit] upstream fetch failed', err);
    const r: SubmitResponse = {
      success: false,
      message: 'No se pudo conectar con el servidor. Tu brief no se envió; intenta de nuevo o escribe a hola@avoqado.io.',
    };
    return new Response(JSON.stringify(r), { status: 502, headers: { 'Content-Type': 'application/json' } });
  }
};
