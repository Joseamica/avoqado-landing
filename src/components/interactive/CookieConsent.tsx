import { useState, useEffect } from 'react';
import { updateConsent, detectAdVisitor } from '../../lib/gtm';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [isPrimary, setIsPrimary] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasFloatingCta, setHasFloatingCta] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Singleton guard: this component is rendered from both Layout.astro and
    // Footer.astro, so some pages mount it twice. Only the first instance to
    // claim the global flag renders the banner — the rest no-op.
    const w = window as Window & { __avoCookieConsentClaimed?: boolean };
    if (w.__avoCookieConsentClaimed) return;
    w.__avoCookieConsentClaimed = true;
    setIsPrimary(true);

    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // GEO-GATE: only visitors from a region that legally requires a
      // prior-consent (opt-in) banner see it — EEA + UK + Switzerland.
      // middleware.ts reads Cloudflare's cf-ipcountry and stamps <body
      // data-consent-required="true"> for those visitors only. México
      // (LFPDPPP, opt-out) and the rest of LATAM/US get NO banner — just the
      // Aviso de Privacidad link in the footer — so the funnel fold stays
      // clean. This is the Stripe/Square pattern.
      const consentRequired = document.body.dataset.consentRequired === 'true';

      // Pages that land ad traffic (e.g. /demo) mark <body
      // data-skip-consent-for-ads="true"> server-side. For that traffic,
      // middleware.ts already auto-grants Consent Mode defaults (hybrid
      // consent — see reference_gtm_api_access) BEFORE this banner ever mounts,
      // so even an EEA ad visitor isn't re-prompted. Nothing is written to
      // localStorage here — this only skips the banner for THIS page load.
      const skipForAds = document.body.dataset.skipConsentForAds === 'true';
      const { ad } = skipForAds ? detectAdVisitor(new URLSearchParams(window.location.search)) : { ad: false };
      if (consentRequired && !(skipForAds && ad)) {
        setShowBanner(true);
      }
    }

    // Pages with their own fixed bottom CTA (e.g. /demo's floating "Contactar
    // a ventas" pill) mark <body data-floating-cta="true"> server-side — read
    // synchronously so there's no hydration race. Lifts the banner above the
    // pill on mobile instead of covering it (was blocking "Aceptar todo").
    if (document.body.dataset.floatingCta === 'true') {
      setHasFloatingCta(true);
    }

    return () => {
      w.__avoCookieConsentClaimed = false;
    };
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    updateConsent({ analytics: true, marketing: true });
    setShowBanner(false);
    setShowSettings(false);
  };

  const rejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    updateConsent({ analytics: false, marketing: false });
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = () => {
    const saved = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(saved));
    updateConsent({ analytics: preferences.analytics, marketing: preferences.marketing });
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!isPrimary || !showBanner) return null;

  return (
    <>
      {/* Cookie Banner — compact corner card (shown only to EEA/UK/CH visitors) */}
      <div
        className={`fixed z-[60] bottom-4 left-4 right-4 sm:right-auto sm:max-w-sm ${
          hasFloatingCta ? 'max-[879px]:bottom-[calc(72px+env(safe-area-inset-bottom,0px))]' : ''
        }`}
      >
        <div className="bg-gray-900 border border-gray-800 rounded-2xl shadow-2xl p-4">
          {!showSettings ? (
            <div>
              <h3 className="text-white font-semibold text-sm mb-1">
                Usamos cookies
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed mb-3">
                Mejoran tu experiencia y nos ayudan a medir el tráfico.{' '}
                <a href="/privacy" className="text-gray-300 underline hover:text-white">
                  Más información
                </a>
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={acceptAll}
                  className="w-full px-4 py-2 text-sm bg-avoqado-green text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  Aceptar todo
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={rejectAll}
                    className="flex-1 px-3 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex-1 px-3 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                  >
                    Personalizar
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold text-lg">
                  Preferencias de cookies
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-gray-400 hover:text-white"
                  aria-label="Cerrar configuración"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-3">
                {/* Necessary Cookies */}
                <div className="flex items-start justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">
                      Cookies necesarias
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Estas cookies son esenciales para el funcionamiento del sitio web y no se pueden desactivar.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="w-5 h-5 text-avoqado-green bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-avoqado-green"
                    />
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-start justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">
                      Cookies analíticas
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Nos ayudan a entender cómo interactúas con el sitio para mejorar tu experiencia.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      className="w-5 h-5 text-avoqado-green bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-avoqado-green cursor-pointer"
                    />
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-start justify-between p-3 bg-gray-800 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium mb-1">
                      Cookies de marketing
                    </h4>
                    <p className="text-gray-400 text-sm">
                      Se utilizan para mostrarte anuncios relevantes y medir la efectividad de nuestras campañas.
                    </p>
                  </div>
                  <div className="ml-4">
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      className="w-5 h-5 text-avoqado-green bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-avoqado-green cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Rechazar todo
                </button>
                <button
                  onClick={savePreferences}
                  className="px-6 py-2 text-sm bg-avoqado-green text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  Guardar preferencias
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
