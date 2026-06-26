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
