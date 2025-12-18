import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactSalesForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companyName: '',
    employees: '',
    revenue: ''
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
        const response = await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setStatus('success');
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                companyName: '',
                employees: '',
                revenue: ''
            });
            // Reset status after 3 seconds
            setTimeout(() => setStatus('idle'), 5000);
        } else {
            console.error(result.message);
            setStatus('error');
        }
    } catch (error) {
        console.error('Network error:', error);
        setStatus('error');
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto md:mx-0 pt-8">
        <AnimatePresence mode="wait">
            {status === 'success' ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center h-full py-12 text-center"
                >
                    <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="text-3xl font-medium text-black mb-4 font-baby">¡Mensaje enviado!</h3>
                    <p className="text-gray-600 max-w-xs mx-auto mb-8 text-lg">
                        Gracias por escribirnos. Nuestro equipo revisará tu solicitud y te contactará pronto.
                    </p>
                    <button 
                        onClick={() => setStatus('idle')}
                        className="text-sm font-bold underline text-black hover:text-gray-600 transition-colors"
                    >
                        Enviar otro mensaje
                    </button>
                </motion.div>
            ) : (
                <motion.form 
                    onSubmit={handleSubmit}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Nombre</label>
                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            required
                            className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent placeholder-gray-400 text-black"
                            placeholder="Jane"
                            onChange={handleChange}
                        />
                    </div>
                    <div className="group">
                        <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Apellido</label>
                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            required
                            className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent placeholder-gray-400 text-black"
                            placeholder="Doe"
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="mb-8 group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Correo electrónico</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        required
                        className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent placeholder-gray-400 text-black"
                        placeholder="jane@company.com"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-8 group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Teléfono</label>
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        required
                        className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent placeholder-gray-400 text-black"
                        placeholder="+52 55 1234 5678"
                        onChange={handleChange}
                    />
                </div>

                <div className="mb-8 group">
                    <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Nombre de la empresa</label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        required
                        className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent placeholder-gray-400 text-black"
                        placeholder="Mi Negocio Inc."
                        onChange={handleChange}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="group relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Tamaño de empresa</label>
                        <select
                            name="employees"
                            value={formData.employees}
                            required
                            className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent appearance-none text-black"
                            onChange={handleChange}
                        >
                            <option value="" disabled>Selecciona una opción</option>
                            <option value="1-10">1-10 empleados</option>
                            <option value="11-50">11-50 empleados</option>
                            <option value="51-200">51-200 empleados</option>
                            <option value="200+">200+ empleados</option>
                        </select>
                    </div>

                    <div className="group relative">
                        <label className="block text-sm font-medium text-gray-700 mb-1 transition-colors group-focus-within:text-black">Ingresos anuales</label>
                        <select
                            name="revenue"
                            value={formData.revenue}
                            required
                            className="w-full border-b border-gray-300 py-2 text-lg focus:outline-none focus:border-black focus-visible:!shadow-none focus-visible:border-black transition-colors bg-transparent appearance-none text-black"
                            onChange={handleChange}
                        >
                            <option value="" disabled>Selecciona una opción</option>
                            <option value="<500k">Menos de $500k</option>
                            <option value="500k-1m">$500k - $1M</option>
                            <option value="1m-5m">$1M - $5M</option>
                            <option value="5m+">$5M+</option>
                        </select>
                    </div>
                </div>

                {status === 'error' && (
                    <div className="mb-6 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                        Hubo un error al enviar tu solicitud. Por favor intenta de nuevo.
                    </div>
                )}

                <button
                    type="submit"
                    disabled={status === 'loading'}
                    className={`w-full bg-black text-white font-bold text-lg py-4 rounded-full transition-all shadow-lg
                        ${status === 'loading' ? 'opacity-70 cursor-wait' : 'hover:bg-gray-800 hover:scale-[1.01] active:scale-[0.99]'}
                    `}
                >
                    {status === 'loading' ? 'Enviando...' : 'Contactar a Ventas'}
                </button>

                <p className="text-xs text-gray-500 mt-6 text-center leading-relaxed">
                    Al enviar este formulario, aceptas que Avoqado te contacte sobre sus productos y servicios. 
                    Puedes darte de baja en cualquier momento. Revisa nuestra <a href="#" className="underline hover:text-black">Política de Privacidad</a>.
                </p>
                </motion.form>
            )}
        </AnimatePresence>
    </div>
  );
}
