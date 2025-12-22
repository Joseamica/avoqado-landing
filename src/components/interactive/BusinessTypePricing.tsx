import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type BusinessType = 'restaurants' | 'retail' | 'services' | 'beauty';

// Avoqado margin on top of Blumon rates
const AVOQADO_MARGIN = 0.2;
const PRO_DISCOUNT = 0.1; // Pro plans get 0.1% less

// Base rates by business type (from Blumon)
const baseRatesByType: Record<BusinessType, { credito: number; debito: number }> = {
  restaurants: { credito: 2.30, debito: 1.68 }, // Restaurantes
  retail: { credito: 1.53, debito: 1.15 },      // Ventas al detalle (Retail)
  services: { credito: 2.05, debito: 1.68 },    // Otros (general services)
  beauty: { credito: 1.00, debito: 1.00 },      // Salones de belleza
};

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
  tierDiscount: number; // Discount from base rate
}

interface BusinessPricing {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
}

const pricingData: Record<BusinessType, BusinessPricing> = {
  restaurants: {
    title: 'Alimentos y Bebidas',
    subtitle: 'Soluciones completas para restaurantes, cafes y bares',
    plans: [
      {
        name: 'QR Pagos',
        price: '$0',
        period: '/mes',
        description: 'Ideal para empezar',
        tierDiscount: 0,
        features: [
          'Pagos con QR ilimitados',
          'Menu digital basico',
          'Dashboard de reportes',
          'Propinas digitales',
          'Soporte por email',
        ],
        cta: 'Comenzar gratis',
      },
      {
        name: 'Pro',
        price: '$599',
        period: '/mes',
        description: 'Para restaurantes en crecimiento',
        tierDiscount: PRO_DISCOUNT,
        features: [
          'Todo de QR Pagos +',
          'TPV Movil completo',
          'Gestion de mesas',
          'Inventario basico',
          'Integraciones POS',
          'Soporte prioritario 24/7',
        ],
        cta: 'Prueba 14 dias gratis',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Para cadenas y grupos',
        tierDiscount: -1, // -1 means "Negociable"
        features: [
          'Todo de Pro +',
          'Multi-sucursal',
          'API personalizada',
          'Account manager dedicado',
          'SLA garantizado',
          'Integraciones custom',
        ],
        cta: 'Contactar ventas',
      },
    ],
  },
  retail: {
    title: 'Tiendas',
    subtitle: 'Punto de venta y gestion para comercios',
    plans: [
      {
        name: 'Basico',
        price: '$0',
        period: '/mes',
        description: 'Para pequenos comercios',
        tierDiscount: 0,
        features: [
          'Pagos con tarjeta',
          'Catalogo de productos',
          'Reportes basicos',
          'Recibos digitales',
          'Soporte por email',
        ],
        cta: 'Comenzar gratis',
      },
      {
        name: 'Pro',
        price: '$499',
        period: '/mes',
        description: 'Para tiendas en crecimiento',
        tierDiscount: PRO_DISCOUNT,
        features: [
          'Todo de Basico +',
          'Control de inventario',
          'Gestion de empleados',
          'Programa de lealtad',
          'Integraciones e-commerce',
          'Soporte 24/7',
        ],
        cta: 'Prueba 14 dias gratis',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Multi-tienda',
        tierDiscount: -1,
        features: [
          'Todo de Pro +',
          'Multi-sucursal',
          'Reportes consolidados',
          'API avanzada',
          'Account manager',
          'SLA garantizado',
        ],
        cta: 'Contactar ventas',
      },
    ],
  },
  services: {
    title: 'Servicios',
    subtitle: 'Gestion de citas y pagos para profesionales',
    plans: [
      {
        name: 'Basico',
        price: '$0',
        period: '/mes',
        description: 'Para profesionales independientes',
        tierDiscount: 0,
        features: [
          'Agenda de citas',
          'Pagos con tarjeta',
          'Recordatorios SMS',
          'Perfil de negocio',
          'Soporte por email',
        ],
        cta: 'Comenzar gratis',
      },
      {
        name: 'Pro',
        price: '$399',
        period: '/mes',
        description: 'Para equipos pequenos',
        tierDiscount: PRO_DISCOUNT,
        features: [
          'Todo de Basico +',
          'Multiples calendarios',
          'Gestion de clientes',
          'Facturacion automatica',
          'Reportes avanzados',
          'Soporte prioritario',
        ],
        cta: 'Prueba 14 dias gratis',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Para empresas',
        tierDiscount: -1,
        features: [
          'Todo de Pro +',
          'Multi-ubicacion',
          'Integraciones custom',
          'API completa',
          'Account manager',
          'SLA garantizado',
        ],
        cta: 'Contactar ventas',
      },
    ],
  },
  beauty: {
    title: 'Belleza',
    subtitle: 'Software para salones, spas y esteticas',
    plans: [
      {
        name: 'Basico',
        price: '$0',
        period: '/mes',
        description: 'Para estilistas independientes',
        tierDiscount: 0,
        features: [
          'Reservas online',
          'Pagos con tarjeta',
          'Recordatorios automaticos',
          'Catalogo de servicios',
          'Soporte por email',
        ],
        cta: 'Comenzar gratis',
      },
      {
        name: 'Pro',
        price: '$449',
        period: '/mes',
        description: 'Para salones',
        tierDiscount: PRO_DISCOUNT,
        features: [
          'Todo de Basico +',
          'Gestion de empleados',
          'Control de comisiones',
          'Inventario de productos',
          'Marketing por email',
          'Soporte 24/7',
        ],
        cta: 'Prueba 14 dias gratis',
        highlighted: true,
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: '',
        description: 'Multi-sucursal',
        tierDiscount: -1,
        features: [
          'Todo de Pro +',
          'Multi-ubicacion',
          'Reportes consolidados',
          'API avanzada',
          'Account manager',
          'SLA garantizado',
        ],
        cta: 'Contactar ventas',
      },
    ],
  },
};

const tabs: { id: BusinessType; label: string }[] = [
  { id: 'restaurants', label: 'Restaurantes' },
  { id: 'retail', label: 'Tiendas' },
  { id: 'services', label: 'Servicios' },
  { id: 'beauty', label: 'Belleza' },
];

// Calculate transaction fee string based on business type and tier discount
// Shows the lowest rate (debit) with "desde" prefix
function getTransactionFee(businessType: BusinessType, tierDiscount: number): string {
  if (tierDiscount === -1) return 'Negociable';

  const baseRates = baseRatesByType[businessType];
  const debitRate = baseRates.debito + AVOQADO_MARGIN - tierDiscount;

  return `desde ${debitRate.toFixed(2)}% + $3`;
}

export default function BusinessTypePricing() {
  const [activeTab, setActiveTab] = useState<BusinessType>('restaurants');
  const currentPricing = pricingData[activeTab];

  return (
    <section id="plans" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Planes para cada negocio
          </h2>
          <p className="text-xl text-gray-600">
            Elige el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative px-6 py-3 rounded-full font-medium text-sm md:text-base transition-all ${
                activeTab === tab.id
                  ? 'text-white'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-black rounded-full"
                  transition={{ type: 'spring', duration: 0.5 }}
                />
              )}
              <span className="relative">
                {tab.label}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Subtitle */}
            <p className="text-center text-gray-500 mb-10">
              {currentPricing.subtitle}
            </p>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {currentPricing.plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-3xl p-8 transition-all ${
                    plan.highlighted
                      ? 'bg-black text-white shadow-2xl scale-[1.02]'
                      : 'bg-white text-black border border-gray-200 hover:shadow-lg'
                  }`}
                >
                  {plan.highlighted && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-avoqado-green text-black text-sm font-bold rounded-full">
                      Más popular
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <p className={plan.highlighted ? 'text-gray-400' : 'text-gray-500'}>
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">{plan.price}</span>
                      <span className={`text-lg ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                        {plan.period}
                      </span>
                    </div>
                    <p className={`text-sm mt-1 ${plan.highlighted ? 'text-gray-400' : 'text-gray-500'}`}>
                      + {getTransactionFee(activeTab, plan.tierDiscount)} por transaccion
                    </p>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 flex-shrink-0 mt-0.5 text-avoqado-green"
                          style={{ width: '20px', height: '20px', minWidth: '20px' }}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className={plan.highlighted ? 'text-gray-300' : 'text-gray-600'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <a
                    href="/contact"
                    className={`block w-full text-center py-3 px-6 rounded-full font-semibold transition-all ${
                      plan.highlighted
                        ? 'bg-white text-black hover:bg-gray-100'
                        : 'bg-black text-white hover:bg-gray-800'
                    }`}
                  >
                    {plan.cta}
                  </a>
                </div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
