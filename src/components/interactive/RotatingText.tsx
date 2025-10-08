import { useState, useEffect } from 'react';

interface RotatingTextProps {
	words: string[];
	suffix?: string;
}

export default function RotatingText({ words, suffix }: RotatingTextProps) {
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
	}, [words.length]);

	return (
		<span className="inline-flex items-baseline gap-1 sm:gap-2">
			<span className="relative inline-grid">
				{words.map((word, index) => (
					<span
						key={word}
						className={`text-avoqado-green col-start-1 row-start-1 transition-all duration-500 font-baby text-left ${
							index === currentIndex
								? 'opacity-100 translate-y-0'
								: 'opacity-0 -translate-y-2 pointer-events-none'
						}`}
					>
						{word}
					</span>
				))}
			</span>
			{suffix && <span className="text-white font-baby">{suffix}</span>}
		</span>
	);
}
