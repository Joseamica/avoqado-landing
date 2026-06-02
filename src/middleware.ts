import type { MiddlewareHandler } from 'astro';

// Google Tag Manager container ID.
const GTM_ID = 'GTM-PBD8C8RM';

// Consent Mode v2 defaults — MUST run before the GTM container so no Google tag
// stores data before the user has chosen. Repeat visitors get their previously
// stored choice (localStorage `cookieConsent`) applied immediately. The runtime
// `consent` 'update' is fired from the CookieConsent island via src/lib/gtm.ts.
const GTM_CONSENT_DEFAULT = `<!-- Consent Mode v2 defaults -->
<script>(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var c={analytics:false,marketing:false};try{var s=JSON.parse(localStorage.getItem('cookieConsent')||'null');if(s){c.analytics=!!s.analytics;c.marketing=!!s.marketing;}}catch(e){}gtag('consent','default',{ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied',analytics_storage:c.analytics?'granted':'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});})();</script>`;

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
		html = html.replace('<head>', () => `<head>\n${GTM_CONSENT_DEFAULT}\n${GTM_HEAD}`);
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
