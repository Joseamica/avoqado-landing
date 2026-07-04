import type { APIRoute } from 'astro';

export const prerender = false;

// El CI de avoqado-desktop sobreescribe este objeto en R2 en cada push a main,
// así que esta URL siempre entrega la última versión publicada.
const OBJECT_KEY = 'AvoqadoPOS-windows-portable.zip';

export const GET: APIRoute = async ({ locals }) => {
  // Binding R2 declarado en wrangler.jsonc → solo existe en Cloudflare (no en dev local).
  const bucket = (locals as any).runtime?.env?.DOWNLOADS;
  const obj = await bucket?.get(OBJECT_KEY);

  if (!obj) {
    return new Response('Descarga no disponible por el momento. Escríbenos a hola@avoqado.io', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new Response(obj.body, {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Length': String(obj.size),
      'Content-Disposition': `attachment; filename="${OBJECT_KEY}"`,
      'ETag': obj.httpEtag,
      // Sin caché: el objeto cambia con cada release y siempre debe bajar la última.
      'Cache-Control': 'no-store',
    },
  });
};
