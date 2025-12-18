import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const features = [
  {
    id: 'tables',
    title: 'Gestión de Mesas',
    description: 'Visualiza tu sala en tiempo real. Asigna mesas, divide cuentas y mueve comensales con un toque.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ) // Placeholder icon
  },
  {
    id: 'menu',
    title: 'Menú Dinámico',
    description: '¿Se acabó el aguacate? Pausa productos al instante. Cambia precios y modifica ingredientes desde la terminal.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    )
  },
  {
    id: 'staff',
    title: 'Personal y Propinas',
    description: 'Cada mesero tiene su perfil. Calcula propinas automáticamente y cierra turnos sin errores de caja.',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    )
  }
];

export default function RestaurantFeatures() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
      
      {/* Content Side */}
      <div className="space-y-8">
        {features.map((feature) => (
          <div 
            key={feature.id}
            className={`p-6 rounded-3xl cursor-pointer transition-all duration-300 border ${
                activeFeature.id === feature.id 
                ? 'bg-[#1a1a1a] border-gray-700' 
                : 'bg-transparent border-transparent hover:bg-[#111]'
            }`}
            onClick={() => setActiveFeature(feature)}
          >
            <h3 className={`text-2xl font-bold mb-3 transition-colors ${
                activeFeature.id === feature.id ? 'text-white' : 'text-gray-500'
            }`}>
                {feature.title}
            </h3>
            <p className={`text-lg leading-relaxed transition-colors ${
                 activeFeature.id === feature.id ? 'text-gray-300' : 'text-gray-600'
            }`}>
                {feature.description}
            </p>
          </div>
        ))}
      </div>

      {/* Visual Side (Simulated TPV Screen) */}
      <div className="relative h-[600px] bg-black border border-gray-800 rounded-[3rem] p-4 lg:p-8 flex items-center justify-center shadow-2xl overflow-hidden">
         {/* Background Glow */}
         <div className="absolute inset-0 bg-gradient-to-tr from-avoqado-green/10 via-transparent to-transparent opacity-50"></div>
         
         <AnimatePresence mode="wait">
            <motion.div 
                key={activeFeature.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="relative z-10 w-full max-w-[350px] aspect-[9/16] bg-gray-900 rounded-[2.5rem] border-4 border-gray-800 shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Status Bar */}
                <div className="h-8 bg-black flex items-center justify-between px-4 text-[10px] text-white">
                    <span>9:41</span>
                    <div className="flex gap-1">
                         <div className="w-4 h-2 bg-white rounded-full"></div>
                    </div>
                </div>

                {/* Dynamic Screen Content */}
                <div className="flex-1 p-6 relative">
                    
                    {activeFeature.id === 'tables' && (
                        <>
                            <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-bold text-lg">Sala Principal</h4>
                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black text-xs font-bold">+</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="aspect-square bg-gray-800 rounded-xl border border-green-500/50 flex flex-col items-center justify-center">
                                    <span className="text-white font-bold">Mesa 1</span>
                                    <span className="text-green-500 text-xs">Ocupada</span>
                                </div>
                                <div className="aspect-square bg-gray-800 rounded-xl flex flex-col items-center justify-center opacity-50">
                                    <span className="text-white font-bold">Mesa 2</span>
                                    <span className="text-gray-500 text-xs">Libre</span>
                                </div>
                                 <div className="aspect-square bg-gray-800 rounded-xl flex flex-col items-center justify-center opacity-50">
                                    <span className="text-white font-bold">Mesa 3</span>
                                    <span className="text-gray-500 text-xs">Libre</span>
                                </div>
                                 <div className="aspect-square bg-gray-800 rounded-xl border border-green-500/50 flex flex-col items-center justify-center">
                                    <span className="text-white font-bold">Mesa 4</span>
                                    <span className="text-green-500 text-xs text-center px-1">Pagando...</span>
                                </div>
                            </div>
                        </>
                    )}

                    {activeFeature.id === 'menu' && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-bold text-lg">Editar Menú</h4>
                            </div>
                            <div className="space-y-3">
                                <div className="bg-gray-800 p-3 rounded-xl flex justify-between items-center">
                                    <span className="text-white text-sm">Tacos Pastor</span>
                                    <div className="w-10 h-5 bg-green-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-0.5"></div></div>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-xl flex justify-between items-center opacity-50">
                                    <span className="text-white text-sm">Guacamole</span>
                                    <div className="w-10 h-5 bg-gray-600 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute left-1 top-0.5"></div></div>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-xl flex justify-between items-center">
                                    <span className="text-white text-sm">Refrescos</span>
                                    <div className="w-10 h-5 bg-green-500 rounded-full relative"><div className="w-4 h-4 bg-white rounded-full absolute right-1 top-0.5"></div></div>
                                </div>
                            </div>
                            <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Precio Tacos</p>
                                <p className="text-2xl font-bold text-white">$45.00</p>
                            </div>
                        </>
                    )}

                     {activeFeature.id === 'staff' && (
                        <>
                             <div className="flex justify-between items-center mb-6">
                                <h4 className="text-white font-bold text-lg">Turno Actual</h4>
                            </div>
                             <div className="bg-gray-800 p-4 rounded-xl mb-4 text-center">
                                <div className="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-2"></div>
                                <p className="text-white font-bold">Juan Pérez</p>
                                <p className="text-green-500 text-sm">En turno: 4h 20m</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-gray-800 p-3 rounded-xl text-center">
                                    <p className="text-xs text-gray-500">Ventas</p>
                                    <p className="text-white font-bold">$3,450</p>
                                </div>
                                <div className="bg-gray-800 p-3 rounded-xl text-center">
                                    <p className="text-xs text-gray-500">Propinas</p>
                                    <p className="text-white font-bold">$420</p>
                                </div>
                            </div>
                             <button className="w-full bg-red-500/10 text-red-500 font-bold py-3 rounded-xl mt-6 text-sm">
                                Cerrar Corte
                            </button>
                        </>
                    )}

                </div>

            </motion.div>
         </AnimatePresence>
      </div>
    </div>
  );
}
