import type { MiddlewareHandler } from 'astro';

// Google Tag Manager container ID.
const GTM_ID = 'GTM-PBD8C8RM';

// Head snippet — injected as high in <head> as possible (GTM requirement).
const GTM_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');</script>
<!-- End Google Tag Manager -->`;

// Noscript fallback — injected immediately after the opening <body> tag.
const GTM_BODY = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${GTM_ID}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

export const onRequest: MiddlewareHandler = async (context, next) => {
	const url = new URL(context.request.url);
	const hostname = url.hostname;

	// Resolve the response for this request. Subdomains are rewritten to their
	// canonical page; everything else renders normally. We capture the Response
	// in every branch so GTM can be injected uniformly below.
	let response: Response;
	if (hostname === 'links.avoqado.io' && url.pathname === '/') {
		// links.avoqado.io subdomain → /links
		response = await context.rewrite('/links');
	} else if (hostname === 'tpv.avoqado.io' && url.pathname === '/') {
		// tpv.avoqado.io subdomain → /productos/tpv
		response = await context.rewrite('/productos/tpv');
	} else {
		response = await next();
	}

	// Only inject GTM into HTML page responses. Skip API/JSON responses,
	// redirects, and the internal /export-stage capture page (noindex, driven by
	// the Playwright asset-export script — analytics there would be noise).
	const contentType = response.headers.get('content-type') ?? '';
	if (!contentType.includes('text/html') || url.pathname.startsWith('/export-stage')) {
		return response;
	}

	let html = await response.text();

	// Inject once. The guard prevents double-loading GTM if the snippet is ever
	// already present in the rendered HTML.
	if (!html.includes(GTM_ID)) {
		html = html.replace('<head>', () => `<head>\n${GTM_HEAD}`);
		html = html.replace(/<body[^>]*>/i, (match) => `${match}\n${GTM_BODY}`);
	}

	// Body length changed — drop the stale content-length so the platform
	// recomputes it.
	const headers = new Headers(response.headers);
	headers.delete('content-length');

	return new Response(html, {
		status: response.status,
		statusText: response.statusText,
		headers,
	});
};
