import { useState, useEffect, useRef } from 'react';

interface HeroCarouselProps {
	slides: { src: string; width: number; height: number }[];
	aspectRatio?: string;
	priority?: boolean;
}

export default function HeroCarousel({ slides, aspectRatio = '4/3', priority = false }: HeroCarouselProps) {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isDragging, setIsDragging] = useState(false);
	const [startX, setStartX] = useState(0);
	const [currentX, setCurrentX] = useState(0);
	const [imagesLoaded, setImagesLoaded] = useState<boolean[]>(new Array(slides.length).fill(false));
	const carouselRef = useRef<HTMLDivElement>(null);

	// Preload all images on mount
	useEffect(() => {
		slides.forEach((slide, index) => {
			const img = new Image();
			img.onload = () => {
				setImagesLoaded((prev) => {
					const newState = [...prev];
					newState[index] = true;
					return newState;
				});
			};
			img.onerror = () => {
				console.error(`Failed to load image: ${slide.src}`);
				// Mark as loaded anyway to prevent infinite loading
				setImagesLoaded((prev) => {
					const newState = [...prev];
					newState[index] = true;
					return newState;
				});
			};
			img.src = slide.src;
		});
	}, [slides]);

	useEffect(() => {
		const interval = setInterval(() => {
			if (!isDragging) {
				setCurrentSlide((prev) => (prev + 1) % slides.length);
			}
		}, 5000);

		return () => clearInterval(interval);
	}, [isDragging, slides.length]);

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

	const handleImageLoad = (index: number) => {
		setImagesLoaded((prev) => {
			const newState = [...prev];
			newState[index] = true;
			return newState;
		});
	};

	return (
		<div className="relative w-full h-full">
			{/* Slides */}
			<div
				ref={carouselRef}
				className={`relative w-full rounded-3xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing select-none bg-gray-900`}
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
							alt={`Avoqado slide ${index + 1}`}
							width={slide.width}
							height={slide.height}
							loading={priority && index === 0 ? 'eager' : 'lazy'}
							decoding={index === currentSlide ? 'sync' : 'async'}
							className={`w-full h-full object-cover transition-opacity duration-300 ${
								imagesLoaded[index] ? 'opacity-100' : 'opacity-0'
							}`}
							draggable={false}
							onLoad={() => handleImageLoad(index)}
						/>
					</div>
				))}
			</div>

			{/* Indicators */}
			<div className="flex justify-center mt-6 space-x-2" role="tablist" aria-label="Carousel navigation">
				{slides.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentSlide(index)}
						role="tab"
						aria-selected={index === currentSlide}
						aria-controls={`slide-${index}`}
						className={`h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-avoqado-green)] ${
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
