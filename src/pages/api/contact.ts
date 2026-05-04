import type { APIRoute } from 'astro';

export const prerender = false;

const API_BASE = 'https://api.avoqado.io/api/v1/public';

// Cloudflare Pages Functions cannot use nodemailer (no raw TCP sockets even with
// nodejs_compat). We proxy to avoqado-server which sends via Resend over HTTP.
export const POST: APIRoute = async ({ request }) => {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return new Response(
			JSON.stringify({ success: false, message: 'JSON inválido' }),
			{ status: 400, headers: { 'Content-Type': 'application/json' } },
		);
	}

	try {
		const upstream = await fetch(`${API_BASE}/contact`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body),
		});

		const text = await upstream.text();
		const contentType = upstream.headers.get('content-type') || 'application/json';
		// Pass-through whatever the API returned (JSON success/error envelopes).
		return new Response(text, {
			status: upstream.status,
			headers: { 'Content-Type': contentType },
		});
	} catch (err) {
		console.error('[contact] upstream fetch failed', err);
		return new Response(
			JSON.stringify({ success: false, message: 'No se pudo conectar con el servidor. Intenta de nuevo.' }),
			{ status: 502, headers: { 'Content-Type': 'application/json' } },
		);
	}
};
