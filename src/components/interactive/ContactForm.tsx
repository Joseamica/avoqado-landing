import { useState } from 'react';

export default function ContactForm() {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		restaurant: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setMessage(null);

		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(formData),
			});

			const data = await response.json();

			if (data.success) {
				setMessage({
					type: 'success',
					text: '¡Gracias! Te contactaremos pronto.',
				});
				setFormData({ name: '', phone: '', email: '', restaurant: '' });
			} else {
				setMessage({
					type: 'error',
					text: data.message || 'Error al enviar. Intenta de nuevo.',
				});
			}
		} catch (error) {
			setMessage({
				type: 'error',
				text: 'Error al enviar. Intenta de nuevo.',
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<input
					type="text"
					name="name"
					placeholder="Nombre completo"
					required
					value={formData.name}
					onChange={handleChange}
					className="px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[var(--color-avoqado-green)] focus:outline-none transition-colors text-gray-900 placeholder:text-gray-500"
				/>
				<input
					type="tel"
					name="phone"
					placeholder="Teléfono"
					required
					value={formData.phone}
					onChange={handleChange}
					className="px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[var(--color-avoqado-green)] focus:outline-none transition-colors text-gray-900 placeholder:text-gray-500"
				/>
			</div>

			<input
				type="email"
				name="email"
				placeholder="Email"
				required
				value={formData.email}
				onChange={handleChange}
				className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[var(--color-avoqado-green)] focus:outline-none transition-colors text-gray-900 placeholder:text-gray-500"
			/>

			<input
				type="text"
				name="restaurant"
				placeholder="Nombre de tu restaurante"
				required
				value={formData.restaurant}
				onChange={handleChange}
				className="w-full px-6 py-4 rounded-full border-2 border-gray-200 focus:border-[var(--color-avoqado-green)] focus:outline-none transition-colors text-gray-900 placeholder:text-gray-500"
			/>

			<button
				type="submit"
				disabled={isSubmitting}
				className="w-full px-8 py-5 bg-black text-white text-lg font-semibold rounded-full hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSubmitting ? 'Enviando...' : 'Solicitar demo gratuita →'}
			</button>

			{message && (
				<p
					className={`text-sm text-center mt-4 ${
						message.type === 'success' ? 'text-green-600' : 'text-red-600'
					}`}
				>
					{message.text}
				</p>
			)}

			<p className="text-sm text-gray-500 mt-4 text-center">
				✓ Sin compromiso • ✓ 14 días de prueba gratis • ✓ Setup en 15 minutos
			</p>
		</form>
	);
}
