import { useState, useEffect } from 'react';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
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
    setShowBanner(false);
    setShowSettings(false);
  };

  const savePreferences = () => {
    const saved = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(saved));
    setShowBanner(false);
    setShowSettings(false);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {!showSettings ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">
                  🍪 Usamos cookies
                </h3>
                <p className="text-gray-300 text-sm">
                  Utilizamos cookies para mejorar tu experiencia, analizar el tráfico del sitio y personalizar el contenido.
                  Puedes aceptar todas las cookies o personalizar tus preferencias.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Personalizar
                </button>
                <button
                  onClick={rejectAll}
                  className="px-4 py-2 text-sm text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:border-gray-600 transition-colors"
                >
                  Rechazar todo
                </button>
                <button
                  onClick={acceptAll}
                  className="px-6 py-2 text-sm bg-[--color-avoqado-green] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
                >
                  Aceptar todo
                </button>
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
                      className="w-5 h-5 text-[--color-avoqado-green] bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-[--color-avoqado-green]"
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
                      className="w-5 h-5 text-[--color-avoqado-green] bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-[--color-avoqado-green] cursor-pointer"
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
                      className="w-5 h-5 text-[--color-avoqado-green] bg-gray-700 border-gray-600 rounded focus:ring-2 focus:ring-[--color-avoqado-green] cursor-pointer"
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
                  className="px-6 py-2 text-sm bg-[--color-avoqado-green] text-white rounded-lg hover:opacity-90 transition-opacity font-semibold"
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
