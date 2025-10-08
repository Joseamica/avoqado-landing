import { useState } from 'react';

interface FormErrors {
	name?: string;
	phone?: string;
	email?: string;
	restaurant?: string;
}

export default function ContactForm() {
	const [formData, setFormData] = useState({
		name: '',
		phone: '',
		email: '',
		restaurant: '',
	});
	const [errors, setErrors] = useState<FormErrors>({});
	const [touched, setTouched] = useState<Record<string, boolean>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

	const validateField = (name: string, value: string): string | undefined => {
		switch (name) {
			case 'name':
				if (!value.trim()) return 'El nombre es requerido';
				if (value.trim().length < 2) return 'El nombre debe tener al menos 2 caracteres';
				break;
			case 'phone':
				if (!value.trim()) return 'El teléfono es requerido';
				if (!/^[\d\s\-\+\(\)]+$/.test(value)) return 'Formato de teléfono inválido';
				break;
			case 'email':
				if (!value.trim()) return 'El email es requerido';
				if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Formato de email inválido';
				break;
			case 'restaurant':
				if (!value.trim()) return 'El nombre del restaurante es requerido';
				break;
		}
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};
		Object.keys(formData).forEach((key) => {
			const error = validateField(key, formData[key as keyof typeof formData]);
			if (error) newErrors[key as keyof FormErrors] = error;
		});
		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setMessage(null);

		if (!validateForm()) {
			setMessage({
				type: 'error',
				text: 'Por favor, corrige los errores en el formulario.',
			});
			return;
		}

		setIsSubmitting(true);

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
				setTouched({});
				setErrors({});
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
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});

		// Validate on change if field has been touched
		if (touched[name]) {
			const error = validateField(name, value);
			setErrors((prev) => ({
				...prev,
				[name]: error,
			}));
		}
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setTouched((prev) => ({ ...prev, [name]: true }));

		const error = validateField(name, value);
		setErrors((prev) => ({
			...prev,
			[name]: error,
		}));
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-5" noValidate>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label htmlFor="name" className="sr-only">Nombre completo</label>
					<input
						id="name"
						type="text"
						name="name"
						placeholder="Nombre completo *"
						required
						value={formData.name}
						onChange={handleChange}
						onBlur={handleBlur}
						aria-invalid={errors.name ? 'true' : 'false'}
						aria-describedby={errors.name ? 'name-error' : undefined}
						className={`w-full px-6 py-4 rounded-full border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${
							errors.name && touched.name
								? 'border-red-500 focus:border-red-500'
								: 'border-gray-200 focus:border-avoqado-green'
						} focus:outline-none`}
					/>
					{errors.name && touched.name && (
						<p id="name-error" className="text-red-600 text-sm mt-1 ml-4" role="alert">
							{errors.name}
						</p>
					)}
				</div>

				<div>
					<label htmlFor="phone" className="sr-only">Teléfono</label>
					<input
						id="phone"
						type="tel"
						name="phone"
						placeholder="Teléfono *"
						required
						value={formData.phone}
						onChange={handleChange}
						onBlur={handleBlur}
						aria-invalid={errors.phone ? 'true' : 'false'}
						aria-describedby={errors.phone ? 'phone-error' : undefined}
						className={`w-full px-6 py-4 rounded-full border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${
							errors.phone && touched.phone
								? 'border-red-500 focus:border-red-500'
								: 'border-gray-200 focus:border-avoqado-green'
						} focus:outline-none`}
					/>
					{errors.phone && touched.phone && (
						<p id="phone-error" className="text-red-600 text-sm mt-1 ml-4" role="alert">
							{errors.phone}
						</p>
					)}
				</div>
			</div>

			<div>
				<label htmlFor="email" className="sr-only">Email</label>
				<input
					id="email"
					type="email"
					name="email"
					placeholder="Email *"
					required
					value={formData.email}
					onChange={handleChange}
					onBlur={handleBlur}
					aria-invalid={errors.email ? 'true' : 'false'}
					aria-describedby={errors.email ? 'email-error' : undefined}
					className={`w-full px-6 py-4 rounded-full border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${
						errors.email && touched.email
							? 'border-red-500 focus:border-red-500'
							: 'border-gray-200 focus:border-avoqado-green'
					} focus:outline-none`}
				/>
				{errors.email && touched.email && (
					<p id="email-error" className="text-red-600 text-sm mt-1 ml-4" role="alert">
						{errors.email}
					</p>
				)}
			</div>

			<div>
				<label htmlFor="restaurant" className="sr-only">Nombre de tu restaurante</label>
				<input
					id="restaurant"
					type="text"
					name="restaurant"
					placeholder="Nombre de tu restaurante *"
					required
					value={formData.restaurant}
					onChange={handleChange}
					onBlur={handleBlur}
					aria-invalid={errors.restaurant ? 'true' : 'false'}
					aria-describedby={errors.restaurant ? 'restaurant-error' : undefined}
					className={`w-full px-6 py-4 rounded-full border-2 transition-colors text-gray-900 placeholder:text-gray-500 ${
						errors.restaurant && touched.restaurant
							? 'border-red-500 focus:border-red-500'
							: 'border-gray-200 focus:border-avoqado-green'
					} focus:outline-none`}
				/>
				{errors.restaurant && touched.restaurant && (
					<p id="restaurant-error" className="text-red-600 text-sm mt-1 ml-4" role="alert">
						{errors.restaurant}
					</p>
				)}
			</div>

			<button
				type="submit"
				disabled={isSubmitting}
				aria-busy={isSubmitting}
				className="w-full px-8 py-5 bg-black text-white text-lg font-semibold rounded-full hover:bg-gray-900 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
			>
				{isSubmitting ? 'Enviando...' : 'Solicitar demo gratuita →'}
			</button>

			{message && (
				<div
					role={message.type === 'error' ? 'alert' : 'status'}
					aria-live="polite"
					className={`text-sm text-center p-4 rounded-full ${
						message.type === 'success'
							? 'bg-green-50 text-green-700'
							: 'bg-red-50 text-red-700'
					}`}
				>
					{message.text}
				</div>
			)}

			<p className="text-sm text-gray-500 text-center">
				✓ Sin compromiso • ✓ 14 días de prueba gratis • ✓ Setup en 15 minutos
			</p>
		</form>
	);
}
