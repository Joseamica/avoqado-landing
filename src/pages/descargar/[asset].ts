import type { APIRoute } from 'astro';

export const prerender = false;

// El CI de avoqado-desktop sobreescribe estos objetos en R2 en cada push a main,
// así que estas URLs siempre entregan la última versión publicada.
const ASSETS: Record<string, { key: string; contentType: string; inline?: boolean }> = {
  // Instalador (doble clic, sin permisos de admin) — descarga principal.
  windows: { key: 'AvoqadoPOS-Setup.exe', contentType: 'application/octet-stream' },
  // App-image portable (USB, sin instalación).
  'windows-portable': { key: 'AvoqadoPOS-windows-portable.zip', contentType: 'application/zip' },
  // Manifiesto de builds (lo publica el CI de avoqado-desktop en cada push); el POS
  // instalado lo consulta cada hora para avisar que hay versión nueva.
  'version.json': { key: 'version.json', contentType: 'application/json; charset=utf-8', inline: true },
};

export const GET: APIRoute = async ({ params, locals }) => {
  const asset = ASSETS[params.asset ?? ''];
  if (!asset) {
    return new Response('Not found', { status: 404 });
  }

  // Binding R2 declarado en wrangler.jsonc → solo existe en Cloudflare (no en dev local).
  const bucket = (locals as any).runtime?.env?.DOWNLOADS;
  const obj = await bucket?.get(asset.key);

  if (!obj) {
    return new Response('Descarga no disponible por el momento. Escríbenos a hola@avoqado.io', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const headers: Record<string, string> = {
    'Content-Type': asset.contentType,
    'Content-Length': String(obj.size),
    'ETag': obj.httpEtag,
    // Sin caché: el objeto cambia con cada release y siempre debe bajar la última.
    'Cache-Control': 'no-store',
  };
  if (!asset.inline) headers['Content-Disposition'] = `attachment; filename="${asset.key}"`;
  return new Response(obj.body, { headers });
};
