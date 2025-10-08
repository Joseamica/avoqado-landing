import { useState, useEffect, useRef } from 'react';

interface HeroCarouselProps {
	slides: { src: string; width: number; height: number }[];
	aspectRatio?: string;
}

export default function HeroCarousel({ slides, aspectRatio = '4/3' }: HeroCarouselProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [currentX, setCurrentX] = useState(0);
	const carouselRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!isDragging) {
				setCurrentSlide((prev) => (prev + 1) % slides.length);
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [isDragging]);

	const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
		e.preventDefault();
		setIsDragging(true);
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		setStartX(clientX);
		setCurrentX(clientX);
	};

	const handleDragMove = (e: React.MouseEvent | React.TouchEvent) => {
		if (!isDragging) return;
		const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
		setCurrentX(clientX);
	};

	const handleDragEnd = () => {
		if (!isDragging) return;

		const diff = startX - currentX;
		const threshold = 50;

		if (Math.abs(diff) > threshold) {
			if (diff > 0) {
				// Swiped left - next slide
				setCurrentSlide((prev) => (prev + 1) % slides.length);
			} else {
				// Swiped right - previous slide
				setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
			}
		}

		setIsDragging(false);
		setStartX(0);
		setCurrentX(0);
	};

	return (
		<div className="relative w-full h-full">
			{/* Slides */}
			<div
				ref={carouselRef}
				className={`relative w-full rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none`}
				style={{ aspectRatio }}
				onMouseDown={handleDragStart}
				onMouseMove={handleDragMove}
				onMouseUp={handleDragEnd}
				onMouseLeave={handleDragEnd}
				onTouchStart={handleDragStart}
				onTouchMove={handleDragMove}
				onTouchEnd={handleDragEnd}
			>
				{slides.map((slide, index) => (
					<div
						key={index}
						className={`absolute inset-0 transition-opacity duration-1000 ${
							index === currentSlide ? 'opacity-100' : 'opacity-0'
						}`}
					>
						<img
							src={slide.src}
							alt={`Slide ${index + 1}`}
							className="w-full h-full object-contain"
							draggable={false}
						/>
					</div>
				))}
			</div>

			{/* Indicators */}
			<div className="flex justify-center mt-6 space-x-2">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentSlide(index)}
						className={`h-2 rounded-full transition-all ${
							index === currentSlide
								? 'bg-[var(--color-avoqado-green)] w-8'
								: 'bg-gray-600 w-2 hover:bg-gray-500'
						}`}
						aria-label={`Go to slide ${index + 1}`}
					/>
				))}
			</div>
		</div>
	);
}
