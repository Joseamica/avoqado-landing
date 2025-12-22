import { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Avoqado margin on top of Blumon rates
const AVOQADO_MARGIN = 0.2; // 0.2% added to credit and debit
const AMEX_MARGIN = 0.3; // 0.3% added to amex

// Embedded pricing data (from Blumon)
const familiasTasas: Record<string, { credito: number; debito: number; internacional: number; amex: number }> = {
  "Beneficiencia": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Educación básica": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Guarderías": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Médicos y dentistas": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Misceláneas": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Refacciones y ferreterías": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Salones de belleza": { credito: 1.00, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Gasolineras": { credito: 1.60, debito: 1.05, internacional: 3.30, amex: 3.00 },
  "Gobierno": { credito: 1.70, debito: 1.28, internacional: 3.30, amex: 3.00 },
  "Estacionamientos": { credito: 1.58, debito: 1.55, internacional: 3.30, amex: 3.00 },
  "Colegios y universidades": { credito: 1.65, debito: 1.28, internacional: 3.30, amex: 3.00 },
  "Comida rápida": { credito: 1.70, debito: 1.35, internacional: 3.30, amex: 3.00 },
  "Entretenimiento": { credito: 1.70, debito: 1.63, internacional: 3.30, amex: 3.00 },
  "Peaje": { credito: 1.70, debito: 1.53, internacional: 3.30, amex: 3.00 },
  "Transporte Terrestre de pasajeros": { credito: 1.70, debito: 1.65, internacional: 3.30, amex: 3.00 },
  "Telecomunicaciones": { credito: 1.98, debito: 1.68, internacional: 3.30, amex: 3.00 },
  "Transporte Aéreo": { credito: 2.05, debito: 1.28, internacional: 3.30, amex: 3.00 },
  "Hospitales": { credito: 2.05, debito: 1.68, internacional: 3.30, amex: 3.00 },
  "Otros": { credito: 2.05, debito: 1.68, internacional: 3.30, amex: 3.00 },
  "Supermercados": { credito: 2.05, debito: 1.63, internacional: 3.30, amex: 3.00 },
  "Ventas al menudeo": { credito: 2.05, debito: 1.68, internacional: 3.30, amex: 3.00 },
  "Aseguradoras": { credito: 2.08, debito: 1.70, internacional: 3.30, amex: 3.00 },
  "Agencias de viajes": { credito: 2.20, debito: 1.85, internacional: 3.30, amex: 3.00 },
  "Hoteles": { credito: 2.10, debito: 1.63, internacional: 3.30, amex: 3.00 },
  "Renta de autos": { credito: 2.10, debito: 1.64, internacional: 3.30, amex: 3.00 },
  "Restaurantes": { credito: 2.30, debito: 1.68, internacional: 3.30, amex: 3.00 },
  "Agregadores": { credito: 2.30, debito: 1.68, internacional: 3.30, amex: 3.00 },
  "Farmacias": { credito: 1.28, debito: 1.00, internacional: 3.30, amex: 3.00 },
  "Ventas al detalle (Retail)": { credito: 1.53, debito: 1.15, internacional: 3.30, amex: 3.00 },
};

// Business synonyms for lookup
const businessSynonyms: Record<string, { familia: string; nota: string }> = {
  "gimnasio": { familia: "Entretenimiento", nota: "Clubes deportivos" },
  "gym": { familia: "Entretenimiento", nota: "Clubes deportivos" },
  "crossfit": { familia: "Entretenimiento", nota: "Clubes deportivos" },
  "yoga": { familia: "Entretenimiento", nota: "Estudios de yoga" },
  "pilates": { familia: "Entretenimiento", nota: "Estudios de pilates" },
  "fitness": { familia: "Entretenimiento", nota: "Centros de fitness" },
  "restaurante": { familia: "Restaurantes", nota: "Restaurantes y cafeterías" },
  "cafeteria": { familia: "Restaurantes", nota: "Cafeterías" },
  "cafe": { familia: "Restaurantes", nota: "Cafés" },
  "taqueria": { familia: "Restaurantes", nota: "Taquerías" },
  "pizzeria": { familia: "Restaurantes", nota: "Pizzerías" },
  "sushi": { familia: "Restaurantes", nota: "Restaurantes de sushi" },
  "bar": { familia: "Restaurantes", nota: "Bares y cantinas" },
  "antro": { familia: "Restaurantes", nota: "Centros nocturnos" },
  "comida rapida": { familia: "Comida rápida", nota: "Fast food" },
  "fast food": { familia: "Comida rápida", nota: "Comida rápida" },
  "hamburguesas": { familia: "Comida rápida", nota: "Hamburgueserías" },
  "food truck": { familia: "Comida rápida", nota: "Food trucks" },
  "spa": { familia: "Salones de belleza", nota: "Spas" },
  "salon": { familia: "Salones de belleza", nota: "Salones de belleza" },
  "estetica": { familia: "Salones de belleza", nota: "Estéticas" },
  "peluqueria": { familia: "Salones de belleza", nota: "Peluquerías" },
  "barberia": { familia: "Salones de belleza", nota: "Barberías" },
  "dentista": { familia: "Médicos y dentistas", nota: "Consultorios dentales" },
  "medico": { familia: "Médicos y dentistas", nota: "Consultorios médicos" },
  "doctor": { familia: "Médicos y dentistas", nota: "Consultorios médicos" },
  "veterinaria": { familia: "Médicos y dentistas", nota: "Veterinarias" },
  "hospital": { familia: "Hospitales", nota: "Hospitales" },
  "clinica": { familia: "Hospitales", nota: "Clínicas" },
  "farmacia": { familia: "Farmacias", nota: "Farmacias" },
  "hotel": { familia: "Hoteles", nota: "Hoteles" },
  "hostal": { familia: "Hoteles", nota: "Hostales" },
  "airbnb": { familia: "Hoteles", nota: "Hospedaje" },
  "tienda": { familia: "Ventas al detalle (Retail)", nota: "Tiendas" },
  "retail": { familia: "Ventas al detalle (Retail)", nota: "Retail" },
  "boutique": { familia: "Ventas al detalle (Retail)", nota: "Boutiques" },
  "joyeria": { familia: "Ventas al detalle (Retail)", nota: "Joyerías" },
  "supermercado": { familia: "Supermercados", nota: "Supermercados" },
  "minisuper": { familia: "Ventas al detalle (Retail)", nota: "Tiendas de conveniencia" },
  "gasolinera": { familia: "Gasolineras", nota: "Gasolineras" },
  "estacionamiento": { familia: "Estacionamientos", nota: "Estacionamientos" },
  "cine": { familia: "Entretenimiento", nota: "Cines" },
  "teatro": { familia: "Entretenimiento", nota: "Teatros" },
  "boliche": { familia: "Entretenimiento", nota: "Boliches" },
  "universidad": { familia: "Colegios y universidades", nota: "Universidades" },
  "escuela": { familia: "Educación básica", nota: "Escuelas" },
  "guarderia": { familia: "Guarderías", nota: "Guarderías" },
  "ferreteria": { familia: "Refacciones y ferreterías", nota: "Ferreterías" },
  "panaderia": { familia: "Ventas al detalle (Retail)", nota: "Panaderías" },
  "pasteleria": { familia: "Ventas al detalle (Retail)", nota: "Pastelerías" },
};

// Normalize text for comparison
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

interface LookupResult {
  found: boolean;
  familia?: string;
  rates?: {
    credito: number;
    debito: number;
    internacional: number;
    amex: number;
  };
  nota?: string;
  confidence: number;
}

function lookupRates(businessName: string): LookupResult {
  const normalized = normalizeText(businessName);

  if (normalized.length < 2) {
    return { found: false, confidence: 0 };
  }

  // Check direct familia match
  for (const [familiaName, rates] of Object.entries(familiasTasas)) {
    if (normalizeText(familiaName) === normalized) {
      return {
        found: true,
        familia: familiaName,
        rates: {
          credito: rates.credito + AVOQADO_MARGIN,
          debito: rates.debito + AVOQADO_MARGIN,
          internacional: rates.internacional,
          amex: rates.amex + AMEX_MARGIN,
        },
        nota: familiaName,
        confidence: 100,
      };
    }
  }

  // Check exact synonym match
  if (businessSynonyms[normalized]) {
    const match = businessSynonyms[normalized];
    const baseRates = familiasTasas[match.familia];
    if (baseRates) {
      return {
        found: true,
        familia: match.familia,
        rates: {
          credito: baseRates.credito + AVOQADO_MARGIN,
          debito: baseRates.debito + AVOQADO_MARGIN,
          internacional: baseRates.internacional,
          amex: baseRates.amex + AMEX_MARGIN,
        },
        nota: match.nota,
        confidence: 100,
      };
    }
  }

  // Check partial word match
  const words = normalized.split(' ').filter(w => w.length > 0);
  for (const word of words) {
    if (word.length >= 3 && businessSynonyms[word]) {
      const match = businessSynonyms[word];
      const baseRates = familiasTasas[match.familia];
      if (baseRates) {
        return {
          found: true,
          familia: match.familia,
          rates: {
            credito: baseRates.credito + AVOQADO_MARGIN,
            debito: baseRates.debito + AVOQADO_MARGIN,
            internacional: baseRates.internacional,
            amex: baseRates.amex + AMEX_MARGIN,
          },
          nota: match.nota,
          confidence: 85,
        };
      }
    }
  }

  // Fuzzy match
  for (const [key, value] of Object.entries(businessSynonyms)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const baseRates = familiasTasas[value.familia];
      if (baseRates) {
        return {
          found: true,
          familia: value.familia,
          rates: {
            credito: baseRates.credito + AVOQADO_MARGIN,
            debito: baseRates.debito + AVOQADO_MARGIN,
            internacional: baseRates.internacional,
            amex: baseRates.amex + AMEX_MARGIN,
          },
          nota: value.nota,
          confidence: 70,
        };
      }
    }
  }

  // Default to "Otros"
  const defaultRates = familiasTasas["Otros"];
  return {
    found: false,
    familia: "Otros",
    rates: {
      credito: defaultRates.credito + AVOQADO_MARGIN,
      debito: defaultRates.debito + AVOQADO_MARGIN,
      internacional: defaultRates.internacional,
      amex: defaultRates.amex + AMEX_MARGIN,
    },
    nota: "Categoria general",
    confidence: 0,
  };
}

// Get suggestions based on input
function getSuggestions(input: string): string[] {
  if (input.length < 2) return [];
  const normalized = normalizeText(input);
  const matches = Object.keys(businessSynonyms)
    .filter(key => key.includes(normalized) || normalized.includes(key))
    .slice(0, 5);
  return matches;
}

export default function PricingCalculator() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => getSuggestions(searchTerm), [searchTerm]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      const lookupResult = lookupRates(term);
      setResult(lookupResult);
    } else {
      setResult(null);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    const lookupResult = lookupRates(suggestion);
    setResult(lookupResult);
  };

  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-black">
            Calcula tu comision
          </h1>
        </div>

        {/* Search Input */}
        <div ref={containerRef} className="relative max-w-xl mx-auto mb-8">
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                handleSearch(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              placeholder="Ej: Restaurante, Gimnasio, Tienda de ropa..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-avoqado-green focus:outline-none transition-colors bg-white shadow-sm"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Suggestions Dropdown */}
          <AnimatePresence>
            {showSuggestions && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-10 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full px-6 py-3 text-left hover:bg-gray-50 transition-colors flex items-center gap-3 capitalize"
                  >
                    <span className="text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <span className="text-gray-700">{suggestion}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results */}
        <AnimatePresence mode="wait">
          {result && result.rates && (
            <motion.div
              key={result.familia}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-black text-white px-6 py-4 flex items-center justify-between">
                <p className="text-lg font-semibold">Categoria detectada</p>
                {result.found && (
                  <div className="flex items-center gap-2 text-avoqado-green">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-medium">Encontrado</span>
                  </div>
                )}
              </div>

              {/* Rates Grid */}
              <div className="p-6">
                <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                  {/* Debit */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Debito</p>
                    <p className="text-2xl font-bold text-black">
                      {result.rates.debito.toFixed(2)}%
                    </p>
                  </div>

                  {/* Credit */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">Credito</p>
                    <p className="text-2xl font-bold text-black">
                      {result.rates.credito.toFixed(2)}%
                    </p>
                  </div>

                  {/* Amex */}
                  <div className="bg-gray-50 rounded-2xl p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-600 font-bold text-xs">AMEX</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">American Express</p>
                    <p className="text-2xl font-bold text-black">
                      {result.rates.amex.toFixed(2)}%
                    </p>
                  </div>
                </div>

                {/* Note */}
                {result.nota && (
                  <p className="text-center text-gray-500 text-sm mt-6">
                    {result.nota}
                  </p>
                )}

                {/* CTA */}
                <div className="mt-8 text-center">
                  <a
                    href="/contact"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white font-semibold rounded-full hover:bg-gray-800 transition-all hover:scale-105"
                  >
                    Obtener esta tasa
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State - Show starting rates */}
        {!result && (
          <div className="text-center py-6">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-sm text-gray-400">Desde</span>
              <span className="text-5xl md:text-6xl font-bold text-black">1.2%</span>
              <span className="text-2xl md:text-3xl font-bold text-gray-300">+ $3</span>
            </div>
          </div>
        )}

        {/* Popular categories */}
        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-2">
            {['Restaurante', 'Gimnasio', 'Tienda', 'Spa', 'Café', 'Bar', 'Hotel', 'Farmacia'].map((category) => (
              <button
                key={category}
                onClick={() => handleSuggestionClick(category.toLowerCase())}
                className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-avoqado-green hover:text-avoqado-green transition-colors"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
