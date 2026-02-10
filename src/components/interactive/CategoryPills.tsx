import { useState, useRef, useEffect } from 'react';

/**
 * CategoryPills - Premium scrolling category pills (Stripe inspired)
 */

interface CategoryPillsProps {
    categories: string[];
}

export default function CategoryPills({ categories }: CategoryPillsProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [showLeftFade, setShowLeftFade] = useState(false);
    const [showRightFade, setShowRightFade] = useState(true);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handleScroll = () => {
        if (!scrollRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        setShowLeftFade(scrollLeft > 10);
        setShowRightFade(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        handleScroll();
    }, []);

    return (
        <section className="py-6 bg-gradient-to-b from-slate-50/50 to-white">
            <div className="relative max-w-7xl mx-auto">
                {/* Left fade */}
                {showLeftFade && (
                    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none" />
                )}
                
                {/* Right fade */}
                {showRightFade && (
                    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none" />
                )}
                
                {/* Scrollable pills container */}
                <div 
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className="flex gap-3 overflow-x-auto scrollbar-hide px-8 py-3"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((category, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                            className={`
                                group relative flex-shrink-0 px-5 py-2.5 rounded-full text-sm font-medium font-inter
                                transition-all duration-300 whitespace-nowrap
                                ${activeIndex === index 
                                    ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20' 
                                    : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-400 hover:text-gray-900 hover:shadow-md hover:shadow-gray-200/50 hover:-translate-y-0.5'
                                }
                            `}
                        >
                            {category}
                            {/* Animated underline effect */}
                            <span className={`
                                absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-avoqado-green rounded-full
                                transition-all duration-300
                                ${activeIndex === index ? 'w-1/2' : 'group-hover:w-1/3'}
                            `} />
                        </button>
                    ))}
                </div>
            </div>
        </section>
    );
}

