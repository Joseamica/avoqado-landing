import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const EarlyAccessCTA: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación - aquí irías a tu endpoint real
    await new Promise(resolve => setTimeout(resolve, 1000));

    setSubmitted(true);
    setIsSubmitting(false);
    setEmail('');
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 py-32" style={{ backgroundColor: '#000000' }}>
      <div className="max-w-4xl w-full">
        {/* Main Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2
            className="text-6xl md:text-8xl font-bold mb-8"
            style={{
              color: '#ffffff',
              lineHeight: '1.05',
              letterSpacing: '-0.02em'
            }}
          >
            Acceso anticipado
          </h2>
          <p
            className="text-2xl md:text-3xl max-w-2xl mx-auto"
            style={{
              color: '#86868b',
              lineHeight: '1.4',
              fontWeight: '400'
            }}
          >
            Únete a los primeros 100 negocios que darán forma al futuro de Avoqado
          </p>
        </motion.div>

        {/* Benefits List - Clean Typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-20"
        >
          <div className="space-y-8 max-w-2xl mx-auto">
            <div className="border-t" style={{ borderColor: '#1d1d1f' }} />

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                Influencia directa en el producto
              </h3>
              <p className="text-lg" style={{ color: '#86868b' }}>
                Tu feedback ayuda a definir las funcionalidades que construimos
              </p>
            </div>

            <div className="border-t" style={{ borderColor: '#1d1d1f' }} />

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                Soporte prioritario
              </h3>
              <p className="text-lg" style={{ color: '#86868b' }}>
                Atención personalizada con canal directo a nuestro equipo
              </p>
            </div>

            <div className="border-t" style={{ borderColor: '#1d1d1f' }} />

            <div className="py-6">
              <h3 className="text-xl font-semibold mb-3" style={{ color: '#ffffff' }}>
                Funcionalidades a medida
              </h3>
              <p className="text-lg" style={{ color: '#86868b' }}>
                Desarrollamos features específicas para tu negocio sin costo adicional
              </p>
            </div>

            <div className="border-t" style={{ borderColor: '#1d1d1f' }} />
          </div>
        </motion.div>

        {/* Email Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          {submitted ? (
            <div className="text-center py-12">
              <h3 className="text-3xl font-semibold mb-4" style={{ color: '#ffffff' }}>
                Solicitud recibida
              </h3>
              <p className="text-xl" style={{ color: '#86868b' }}>
                Te contactaremos pronto con más detalles
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="flex-1 px-5 py-4 rounded-xl text-base outline-none transition-all duration-200"
                  style={{
                    backgroundColor: '#1d1d1f',
                    color: '#ffffff',
                    border: '1px solid #2d2d2f',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3d3d3f'}
                  onBlur={(e) => e.target.style.borderColor = '#2d2d2f'}
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 rounded-xl text-base font-medium transition-all duration-150 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: '#ffffff',
                    color: '#000000',
                  }}
                >
                  {isSubmitting ? 'Enviando...' : 'Solicitar acceso'}
                </button>
              </div>
            </form>
          )}
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-16"
        >
          <p className="text-sm" style={{ color: '#555555' }}>
            Sin costo ni compromiso
          </p>
        </motion.div>
      </div>
    </div>
  );
};
