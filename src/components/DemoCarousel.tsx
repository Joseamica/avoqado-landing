import { useState } from 'react';

const screenshots = [
	{
		title: 'Dashboard Principal',
		description: 'Ve todas tus métricas importantes en un solo lugar',
		image: '/demo/dashboard.jpg', // Placeholder - agregar imagen real
	},
	{
		title: 'Vista de Transacciones',
		description: 'Monitorea cada pago en tiempo real',
		image: '/demo/transactions.jpg', // Placeholder
	},
	{
		title: 'Reportes y Analytics',
		description: 'Insights profundos para tomar mejores decisiones',
		image: '/demo/analytics.jpg', // Placeholder
	},
	{
		title: 'Gestión de Clientes',
		description: 'Base de datos completa con historial de cada cliente',
		image: '/demo/customers.jpg', // Placeholder
	},
];

export default function DemoCarousel() {
	const [currentSlide, setCurrentSlide] = useState(0);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % screenshots.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + screenshots.length) % screenshots.length);
	};

	return (
		<section className="py-20 bg-[var(--color-background-alt)]" id="demo">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="text-center mb-12">
					<h2 className="text-4xl md:text-5xl font-semibold mb-4 text-white">
						Ve Avoqado en <span style={{ color: 'var(--color-avoqado-green)' }}>acción</span>
					</h2>
					<p className="text-xl text-gray-400 max-w-3xl mx-auto">
						Explora nuestro dashboard y descubre lo fácil que es gestionar tu restaurante
					</p>
				</div>

				<div className="relative max-w-5xl mx-auto">
					{/* Main carousel */}
					<div className="relative aspect-video bg-gray-100 rounded-2xl overflow-hidden shadow-2xl">
						{/* Placeholder image - replace with real screenshots */}
						<div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
							<div className="text-center space-y-4">
								<div className="text-6xl">📊</div>
								<h3 className="text-2xl font-semibold">{screenshots[currentSlide].title}</h3>
								<p className="text-gray-600 max-w-md mx-auto">{screenshots[currentSlide].description}</p>
								<p className="text-sm text-gray-500 italic">Imagen de demo - agregar screenshot real</p>
							</div>
						</div>

						{/* Navigation arrows */}
						<button
							onClick={prevSlide}
							className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
							aria-label="Previous slide"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<button
							onClick={nextSlide}
							className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-lg"
							aria-label="Next slide"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
							</svg>
						</button>
					</div>

					{/* Indicators */}
					<div className="flex justify-center mt-6 space-x-2">
						{screenshots.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentSlide(index)}
								className={`w-3 h-3 rounded-full transition-all ${
									index === currentSlide
										? 'bg-[var(--color-avoqado-green)] w-8'
										: 'bg-gray-300 hover:bg-gray-400'
								}`}
								aria-label={`Go to slide ${index + 1}`}
							/>
						))}
					</div>
				</div>

				{/* CTA below carousel */}
				<div className="text-center mt-12">
					<a
						href="#contact"
						className="inline-block px-8 py-4 bg-[var(--color-avoqado-green)] text-white text-lg font-semibold rounded-full hover:opacity-90 transition-opacity"
					>
						Solicita una demo personalizada
					</a>
				</div>
			</div>
		</section>
	);
}
