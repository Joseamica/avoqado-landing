import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FAQItem = {
  question: string;
  answer: string;
  category: string;
};

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: '¿Qué es Avoqado?',
    answer: 'Avoqado es una plataforma integral de gestión para comercios que unifica punto de venta, pagos, reservas y administración en una sola solución elegante y fácil de usar.'
  },
  {
    category: 'General',
    question: '¿Cuáles son las características principales?',
    answer: 'Incluye TPV móvil, dashboard administrativo web, pagos con QR, gestión de inventario, y herramientas de marketing para fidelización de clientes.'
  },
  {
    category: 'Precios',
    question: '¿Cúales son los costos?',
    answer: 'Ofrecemos planes flexibles adaptados al tamaño de tu negocio. Contáctanos para una cotización personalizada.'
  },
  {
    category: 'Precios',
    question: '¿Hay comisiones ocultas?',
    answer: 'No. Creemos en la transparencia total. Todas las comisiones se acuerdan previamente y no hay cargos sorpresa.'
  },
  {
    category: 'Seguridad',
    question: '¿Mis datos están seguros?',
    answer: 'Sí, utilizamos encriptación de grado bancario y cumplimos con los estándares internacionales de seguridad de datos (PCI-DSS) para proteger tu información y la de tus clientes.'
  },
  {
    category: 'Soporte',
    question: '¿Qué tipo de soporte ofrecen?',
    answer: 'Ofrecemos soporte técnico 24/7 a través de chat en vivo, correo electrónico y línea telefónica prioritaria para cuentas empresariales.'
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleIndex = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full py-24 px-4 md:px-10 bg-black text-white">
      <div className="max-w-4xl mx-auto">
        <div className="mb-16 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-avoqado-green text-sm tracking-widest uppercase mb-4 font-medium"
          >
            Preguntas Frecuentes
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-baby mb-6"
          >
            Todo lo que necesitas saber
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-400 max-w-2xl mx-auto font-light"
          >
            Resolvemos tus dudas para que puedas enfocarte en lo que importa: tu negocio.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`border-b border-white/10 ${activeIndex === index ? 'bg-white/5' : 'hover:bg-white/5'} transition-colors duration-300 rounded-lg overflow-hidden`}
            >
              <button
                onClick={() => toggleIndex(index)}
                className="w-full text-left p-6 flex justify-between items-center group cursor-pointer focus:outline-none"
              >
                <div>
                  <span className="text-xs font-mono text-avoqado-green/70 mb-1 block uppercase tracking-wider">{faq.category}</span>
                  <span className="text-xl md:text-2xl font-light group-hover:text-avoqado-green transition-colors duration-300">{faq.question}</span>
                </div>
                <span className="ml-4 flex-shrink-0 text-2xl font-thin text-white/50 group-hover:text-white transition-colors duration-300">
                  {activeIndex === index ? '−' : '+'}
                </span>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 text-gray-400 leading-relaxed text-lg font-light">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-16 text-center"
        >
            <p className="text-gray-500 mb-4">¿No encuentras lo que buscas?</p>
            <a href="/contact" className="inline-block border border-white/20 hover:border-avoqado-green text-white hover:text-avoqado-green px-8 py-3 rounded-full transition-all duration-300 transform hover:scale-105">
                Contáctanos
            </a>
        </motion.div>
      </div>
    </section>
  );
}
