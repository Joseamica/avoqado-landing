import type { MiddlewareHandler } from 'astro';

// Google Tag Manager container ID.
const GTM_ID = 'GTM-PBD8C8RM';

// GEO-GATE for the cookie banner. Regions where a prior-consent (opt-in) cookie
// banner is legally required: EEA (GDPR/ePrivacy) + UK (UK GDPR) + Switzerland
// (FADP). México (LFPDPPP) and the rest of LATAM/US follow an opt-out model, so
// those visitors get NO blocking banner — just the Aviso de Privacidad link in
// the footer — keeping the funnel fold clean. Cloudflare hands us the visitor's
// country for free via the `cf-ipcountry` edge header. For those visitors we
// stamp <body data-consent-required="true"> and the CookieConsent island reads
// it; everyone else never mounts the banner. This is the Stripe/Square pattern.
const CONSENT_REQUIRED_COUNTRIES = new Set([
	// EU-27
	'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 'DE', 'GR', 'HU',
	'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE',
	// EEA (non-EU) + UK + Switzerland
	'IS', 'LI', 'NO', 'GB', 'CH',
]);

// Consent Mode v2 defaults — MUST run before the GTM container so no Google tag
// stores data before the user has chosen. Repeat visitors get their previously
// stored choice (localStorage `cookieConsent`) applied immediately. The runtime
// `consent` 'update' is fired from the CookieConsent island via src/lib/gtm.ts.
//
// HYBRID consent (México / LFPDPPP opt-out model): visitors arriving from a paid
// ad (gclid/gbraid/wbraid/fbclid/msclkid/li_fat_id/wa=1/utm_medium=cpc…) default to
// GRANTED so paid-campaign conversions attribute with cookies (not modeled);
// organic visitors keep denied-by-default + the cookie banner. This is what lets
// Google Ads count the real WhatsApp conversations from the test.
const GTM_CONSENT_DEFAULT = `<!-- Consent Mode v2 defaults -->
<script>(function(){window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;var c={analytics:false,marketing:false};try{var s=JSON.parse(localStorage.getItem('cookieConsent')||'null');if(s){c.analytics=!!s.analytics;c.marketing=!!s.marketing;}}catch(e){}try{if(/[?&](gclid|gbraid|wbraid|fbclid|msclkid|li_fat_id|wa)=/.test(location.search)||/[?&]utm_medium=(cpc|ppc|paid|paidsocial|paid_social|display)/i.test(location.search)){c.analytics=true;c.marketing=true;}}catch(e){}gtag('consent','default',{ad_storage:c.marketing?'granted':'denied',ad_user_data:c.marketing?'granted':'denied',ad_personalization:c.marketing?'granted':'denied',analytics_storage:c.analytics?'granted':'denied',functionality_storage:'granted',security_storage:'granted',wait_for_update:500});})();</script>`;

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

// PostHog (product analytics + session replay) — loaded site-wide alongside GTM
// so the marketing funnel (ad → prompt → signup) is captured everywhere, then
// stitches to the dashboard's onboarding funnel (same PostHog project).
//
// Privacy: capture is gated behind the SAME analytics consent as the Google tags.
// PostHog inits *opted-out* (`opt_out_capturing_by_default: true`) and only opts in
// when the visitor's stored `cookieConsent.analytics` is true — or at runtime when
// the CookieConsent island grants it (src/lib/gtm.ts → posthog.opt_in_capturing()).
// Session replay masks all inputs, so anything typed into a form is never recorded.
const POSTHOG_KEY = 'phc_ywJ2xb3rYnXnaipgNQ6tbqS5pZK8HamLUNo4bUMsingG';
const POSTHOG_SNIPPET = `<!-- PostHog -->
<script>
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('${POSTHOG_KEY}',{api_host:'https://us.i.posthog.com',person_profiles:'identified_only',capture_pageview:true,capture_pageleave:true,autocapture:true,cross_subdomain_cookie:true,opt_out_capturing_by_default:true,session_recording:{maskAllInputs:true},loaded:function(ph){try{var c=JSON.parse(localStorage.getItem('cookieConsent')||'null');var ad=/[?&](gclid|gbraid|wbraid|fbclid|msclkid|li_fat_id|wa)=/.test(location.search)||/[?&]utm_medium=(cpc|ppc|paid|paidsocial|paid_social|display)/i.test(location.search);if((c&&c.analytics)||ad){ph.opt_in_capturing();}}catch(e){}}});
</script>
<!-- End PostHog -->`;

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
	// Skip the /wa bridge: it fires its OWN direct gtag conversion (fast, before the
	// redirect). Injecting the full GTM container there would double-config gtag and
	// double-count the conversion — so /wa is intentionally self-contained.
	const path = url.pathname.replace(/\/$/, '');
	if (!contentType.includes('text/html') || url.pathname.startsWith('/export-stage') || path === '/wa') {
		return response;
	}

	let html = await response.text();

	// Visitor country from Cloudflare's edge header. `?_cc=DE` overrides it for
	// QA / local dev (harmless in prod — real traffic never sends it). Empty in
	// local dev → no banner, which matches México's opt-out behaviour.
	const country = (url.searchParams.get('_cc') || context.request.headers.get('cf-ipcountry') || '').toUpperCase();
	const consentRequired = CONSENT_REQUIRED_COUNTRIES.has(country);

	// Inject once. The guard prevents double-loading GTM if the snippet is ever
	// already present in the rendered HTML.
	if (!html.includes(GTM_ID)) {
		html = html.replace('<head>', () => `<head>\n${GTM_CONSENT_DEFAULT}\n${GTM_HEAD}\n${POSTHOG_SNIPPET}`);
		// Stamp data-consent-required on <body> for EEA/UK/CH visitors only, then
		// append the GTM noscript. Preserves any attributes the page already set
		// (e.g. data-skip-consent-for-ads, data-floating-cta).
		html = html.replace(/<body([^>]*)>/i, (_match, attrs) => {
			const bodyTag =
				consentRequired && !/data-consent-required/i.test(attrs)
					? `<body${attrs} data-consent-required="true">`
					: `<body${attrs}>`;
			return `${bodyTag}\n${GTM_BODY}`;
		});
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
