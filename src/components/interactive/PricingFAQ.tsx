import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: '¿Hay costos ocultos?',
    answer: 'No. Nuestros precios son completamente transparentes. Solo pagas la comisión por transacción y, si eliges un plan de pago, la mensualidad correspondiente. No hay cargos de instalación, cancelación ni mínimos mensuales.',
  },
  {
    question: '¿Cuándo me cobran las comisiones?',
    answer: 'Las comisiones se descuentan automáticamente de cada transacción procesada. El monto neto se deposita en tu cuenta bancaria en 24-48 horas hábiles.',
  },
  {
    question: '¿Puedo cambiar de plan en cualquier momento?',
    answer: '¡Sí! Puedes subir o bajar de plan cuando quieras desde tu dashboard. Los cambios se aplican de inmediato y se prorratea el monto restante.',
  },
  {
    question: '¿Hay un período mínimo de contrato?',
    answer: 'No tenemos contratos de permanencia. Puedes cancelar tu suscripción en cualquier momento sin penalizaciones. Tu cuenta seguirá activa hasta el final del período pagado.',
  },
  {
    question: '¿Qué métodos de pago aceptan mis clientes?',
    answer: 'Tus clientes pueden pagar con todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express), así como con transferencias bancarias y pagos QR.',
  },
  {
    question: '¿Ofrecen descuentos por volumen?',
    answer: 'Sí. Para negocios con alto volumen de transacciones o múltiples sucursales, ofrecemos tasas preferenciales. Contacta a nuestro equipo de ventas para una cotización personalizada.',
  },
];

export default function PricingFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Preguntas frecuentes
          </h2>
          <p className="text-xl text-gray-600">
            Todo lo que necesitas saber sobre nuestros precios
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-lg text-black">
                  {faq.question}
                </span>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <svg
                    className="w-5 h-5 text-gray-500"
                    style={{ width: '20px', height: '20px' }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </motion.span>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            ¿Tienes más preguntas?
          </p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-black font-semibold hover:text-avoqado-green transition-colors"
          >
            Contacta a nuestro equipo
            <svg className="w-4 h-4" style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
