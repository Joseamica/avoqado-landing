/**
 * Google Tag Manager dataLayer helpers.
 *
 * The GTM container snippet and the Consent Mode v2 *defaults* are injected
 * server-side in `src/middleware.ts` (so they run before any tag fires, on every
 * page). This module only emits *runtime* signals from React islands:
 *   - `pushEvent`     — custom conversion events for GTM triggers
 *   - `updateConsent` — Consent Mode v2 updates when the user picks cookies
 *
 * All functions are SSR-safe (no-op when `window` is undefined).
 */

declare global {
	interface Window {
		dataLayer?: unknown[];
		// Defined by the inline Consent Mode script in middleware.ts.
		gtag?: (...args: unknown[]) => void;
		// Defined by the inline PostHog snippet in middleware.ts (stubbed before the
		// CDN bundle loads, so these are always safe to call — queued until ready).
		posthog?: {
			capture: (event: string, properties?: Record<string, unknown>) => void;
			identify: (id: string, properties?: Record<string, unknown>) => void;
			opt_in_capturing: () => void;
			opt_out_capturing: () => void;
		};
	}
}

type DataLayerParams = Record<string, unknown>;

/**
 * Push a custom event to the GTM dataLayer AND mirror it to PostHog. No-op during SSR.
 *
 * One call feeds both stacks: GTM/GA4/Google Ads (ad measurement) and PostHog
 * (product-analytics funnel + session replay). The PostHog mirror is a no-op until
 * the visitor grants analytics consent — PostHog starts opted-out (see middleware.ts) —
 * so this never captures anything the GTM Consent Mode path wouldn't also gate.
 */
export function pushEvent(event: string, params: DataLayerParams = {}): void {
	if (typeof window === 'undefined') return;
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event, ...params });
	try {
		window.posthog?.capture(event, params);
	} catch {
		/* PostHog optional / blocked — never break the GTM path. */
	}
}

/**
 * Track a signup-intent CTA click (`Empieza ahora` / `Comienza…`) as
 * `get_started_click` and — for plain same-tab clicks — hold the navigation
 * just long enough for the hit to leave the page.
 *
 * Why: these CTAs navigate to dashboard.avoqado.io (another subdomain), and a
 * bare dataLayer.push loses the race against the unload — GA4 recorded ZERO
 * `sign_up_start` in 14 days while the target="_blank" WhatsApp CTAs arrived
 * fine — so ad-driven signup intent never counted. Same cure as the /wa
 * bridge: eventCallback + a hard timeout, capped below a perceivable delay.
 *
 * Modified clicks (cmd/ctrl/shift/alt, middle button) and target="_blank"
 * anchors keep their default behavior — the page stays alive, no race to win.
 *
 * `source` identifies the CTA placement (ad_popup / navbar / mobile_menu /
 * hero / pricing_hero / pricing_plans / pricing_page / chatbot_cta).
 */
export function trackGetStarted(
	e: MeasuredClickEvent,
	source: string,
	extra: DataLayerParams = {},
): void {
	if (typeof window === 'undefined') return;
	const params = { source, ...extra };
	// Legacy PostHog mirror: the onboarding funnel predates get_started_click —
	// keep feeding its original step name so the funnel doesn't go dark.
	try {
		window.posthog?.capture('sign_up_start', params);
	} catch {
		/* PostHog optional */
	}
	pushEventBeforeNav(e, 'get_started_click', params);
}

/** Structural click-event type (React MouseEvent satisfies it; no React dep). */
export type MeasuredClickEvent = {
	preventDefault: () => void;
	currentTarget: EventTarget | null;
	metaKey?: boolean;
	ctrlKey?: boolean;
	shiftKey?: boolean;
	altKey?: boolean;
	button?: number;
};

/**
 * Push an event and — for a plain same-tab anchor click — hold the navigation
 * until GTM confirms the tags ran (eventCallback) or an 800ms cap, whichever
 * comes first. This is the generic engine behind `trackGetStarted`; use it for
 * ANY measured CTA that navigates away in the same tab (`get_started_click`,
 * `tour_cta_click`, …) — a bare push + navigation loses the unload race and
 * the event never reaches GA4.
 *
 * Modified clicks (cmd/ctrl/shift/alt, middle button) and target="_blank"
 * anchors keep their default behavior — the page stays alive, no race to win.
 */
export function pushEventBeforeNav(e: MeasuredClickEvent, event: string, params: DataLayerParams = {}): void {
	if (typeof window === 'undefined') return;
	const anchor = e.currentTarget instanceof HTMLAnchorElement ? e.currentTarget : null;
	const href = anchor?.href;
	const modified = Boolean(e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) || (e.button ?? 0) !== 0;
	if (!href || modified || anchor?.target === '_blank') {
		// Page stays alive (new tab / no navigation) — plain push is safe.
		pushEvent(event, params);
		return;
	}
	e.preventDefault();
	let navigated = false;
	const go = () => {
		if (navigated) return;
		navigated = true;
		window.location.href = href;
	};
	window.dataLayer = window.dataLayer || [];
	// eventTimeout: GTM invokes eventCallback after N ms even if a tag hangs.
	window.dataLayer.push({ event, ...params, eventCallback: go, eventTimeout: 800 });
	try {
		window.posthog?.capture(event, params);
	} catch {
		/* PostHog optional */
	}
	// Hard fallback: GTM blocked / not yet loaded → eventCallback never runs.
	window.setTimeout(go, 800);
}

/**
 * Detect whether the visitor arrived from a paid ad, and from which platform.
 * Auto-detects the click IDs / utm params the ad platforms add, plus a manual
 * `?wa=1` override (with optional `?src=`) for testing or explicit campaigns.
 *
 * Same signals `middleware.ts` uses to auto-grant Consent Mode defaults for ad
 * traffic (hybrid consent) — keep both in sync if the detection rules change.
 */
export function detectAdVisitor(params: URLSearchParams): { ad: boolean; source: string } {
	if (params.get('wa') === '1') return { ad: true, source: params.get('src') || 'manual' };
	if (params.get('gclid') || params.get('gbraid') || params.get('wbraid')) return { ad: true, source: 'googleads' };
	if (params.get('fbclid')) return { ad: true, source: 'meta' };
	if (params.get('li_fat_id')) return { ad: true, source: 'linkedin' };
	if (params.get('msclkid')) return { ad: true, source: 'microsoft' };
	const medium = (params.get('utm_medium') || '').toLowerCase();
	if (['cpc', 'ppc', 'paid', 'paidsocial', 'paid_social', 'display'].includes(medium)) {
		return { ad: true, source: params.get('utm_source') || 'utm' };
	}
	return { ad: false, source: '' };
}

export interface ConsentChoice {
	analytics: boolean;
	marketing: boolean;
}

/**
 * Push a Consent Mode v2 update reflecting the user's cookie choice.
 *
 * Uses the global `gtag` (defined in the middleware head script) because GTM's
 * consent API expects the `arguments` object form — a plain array pushed to the
 * dataLayer would NOT be recognized as a consent command.
 */
export function updateConsent({ analytics, marketing }: ConsentChoice): void {
	if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;
	window.gtag('consent', 'update', {
		ad_storage: marketing ? 'granted' : 'denied',
		ad_user_data: marketing ? 'granted' : 'denied',
		ad_personalization: marketing ? 'granted' : 'denied',
		analytics_storage: analytics ? 'granted' : 'denied',
	});

	// Mirror the analytics choice to PostHog (separate SDK with its own opt-in
	// store). Granting analytics starts capture + session replay; revoking stops it.
	try {
		if (analytics) window.posthog?.opt_in_capturing();
		else window.posthog?.opt_out_capturing();
	} catch {
		/* ignore — PostHog optional */
	}
}
