import { useState, useEffect } from 'react';

const words = ['confianza', 'rotación', 'diversión', 'seguridad', 'finanzas'];

export default function RotatingText() {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	useEffect(() => {
		const interval = setInterval(() => {
			setIsAnimating(true);
			setTimeout(() => {
				setCurrentIndex((prev) => (prev + 1) % words.length);
				setIsAnimating(false);
			}, 500);
		}, 2000);

		return () => clearInterval(interval);
	}, []);

	return (
		<span
			className={`text-avoqado-green inline-block transition-all duration-500 ${
				isAnimating ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
			}`}
		>
			{words[currentIndex]}
		</span>
	);
}
