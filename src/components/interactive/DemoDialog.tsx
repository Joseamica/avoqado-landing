import { useState, useEffect } from 'react';

interface DemoDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoDialog({ isOpen, onClose }: DemoDialogProps) {
  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div
        className="relative bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">
            Conoce Avoqado
          </h2>
          <p className="text-gray-500">
            Elige como quieres explorar la plataforma
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Full demo with sales - RECOMMENDED */}
          <a
            href="/contact"
            className="group relative block p-6 bg-black rounded-2xl hover:bg-gray-900 transition-all"
          >
            {/* Recommended badge */}
            <span className="absolute -top-3 left-6 bg-avoqado-green text-black text-xs font-bold px-3 py-1 rounded-full">
              Recomendado
            </span>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-avoqado-green rounded-xl flex items-center justify-center text-black flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  Demo completo
                </h3>
                <p className="text-gray-400 text-sm mb-3">
                  Un experto te muestra toda la plataforma en vivo
                </p>
                {/* Product tags */}
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">TPV Movil</span>
                  <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">Dashboard</span>
                  <span className="text-xs bg-white/10 text-white px-2 py-1 rounded-full">QR Pagos</span>
                </div>
              </div>
              <svg className="w-5 h-5 text-gray-500 group-hover:text-avoqado-green group-hover:translate-x-1 transition-all mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          {/* Dashboard interactive demo */}
          <a
            href="https://demo.dashboard.avoqado.io"
            className="group block p-6 border-2 border-gray-200 rounded-2xl hover:border-avoqado-green hover:bg-avoqado-green/5 transition-all"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-avoqado-green/10 rounded-xl flex items-center justify-center text-avoqado-green flex-shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-1 group-hover:text-avoqado-green transition-colors">
                  Probar Dashboard
                </h3>
                <p className="text-gray-500 text-sm mb-2">
                  Crea tu propio negocio de prueba y explora todas las funciones
                </p>
                <p className="text-xs text-gray-400">
                  100% interactivo
                </p>
              </div>
              <svg className="w-5 h-5 text-gray-300 group-hover:text-avoqado-green group-hover:translate-x-1 transition-all mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-xs mt-6">
          Para ver TPV y QR en accion, agenda el demo completo
        </p>
      </div>
    </div>
  );
}
