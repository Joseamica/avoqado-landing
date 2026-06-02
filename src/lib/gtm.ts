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
	}
}

type DataLayerParams = Record<string, unknown>;

/** Push a custom event to the GTM dataLayer. No-op during SSR. */
export function pushEvent(event: string, params: DataLayerParams = {}): void {
	if (typeof window === 'undefined') return;
	window.dataLayer = window.dataLayer || [];
	window.dataLayer.push({ event, ...params });
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
}
