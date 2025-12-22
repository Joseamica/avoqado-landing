interface Addon {
  name: string;
  description: string;
  price: number;
  icon: string;
}

const addons: Addon[] = [
  {
    name: 'Chatbot Inteligente',
    description: 'Chatbot con IA para atencion automatica de clientes 24/7',
    price: 399,
    icon: 'chat',
  },
  {
    name: 'Analiticas Avanzadas',
    description: 'Reportes detallados, tendencias de ventas, y analisis predictivo',
    price: 499,
    icon: 'chart',
  },
  {
    name: 'Control de Inventario',
    description: 'Gestion FIFO de inventario, recetas, y alertas de stock bajo',
    price: 299,
    icon: 'inventory',
  },
  {
    name: 'Programa de Lealtad',
    description: 'Sistema de puntos y recompensas para clientes frecuentes',
    price: 599,
    icon: 'loyalty',
  },
  {
    name: 'Sistema de Reservas',
    description: 'Gestion de reservas de mesas con confirmacion automatica',
    price: 399,
    icon: 'calendar',
  },
  {
    name: 'Pedidos en Linea',
    description: 'Permite a los clientes ordenar desde la web o app con QR',
    price: 799,
    icon: 'phone',
  },
];

const icons: Record<string, JSX.Element> = {
  chat: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  chart: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  inventory: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  loyalty: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  phone: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

export default function PricingAddons() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
            Potencia tu negocio
          </h2>
          <p className="text-xl text-gray-600">
            Modulos adicionales para llevar tu operacion al siguiente nivel
          </p>
        </div>

        {/* Addons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addons.map((addon) => (
            <div
              key={addon.name}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:bg-black hover:border-black hover:shadow-lg transition-all duration-300"
            >
              {/* Icon */}
              <div className="w-12 h-12 bg-avoqado-green/10 rounded-xl flex items-center justify-center text-avoqado-green group-hover:bg-avoqado-green group-hover:text-black mb-4 transition-colors duration-300">
                {icons[addon.icon]}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-black group-hover:text-white mb-2 transition-colors duration-300">{addon.name}</h3>
              <p className="text-gray-500 group-hover:text-gray-400 text-sm mb-4 transition-colors duration-300">{addon.description}</p>

              {/* Price */}
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-black group-hover:text-white transition-colors duration-300">${addon.price}</span>
                <span className="text-gray-500 group-hover:text-gray-400 transition-colors duration-300">/mes</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Todos los precios en MXN. Los modulos se pueden agregar o quitar en cualquier momento.
        </p>
      </div>
    </section>
  );
}
