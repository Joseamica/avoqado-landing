import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * FeatureAccordion - Square-style feature showcase
 * Clean accordion on left, lifestyle image on right
 */

interface Feature {
    title: string;
    description: string;
    image: string;
}

interface FeatureAccordionProps {
    features: Feature[];
    sectionTitle?: string;
}

export default function FeatureAccordion({ features, sectionTitle = "Crece. Sin perder el toque personal." }: FeatureAccordionProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    return (
        <section className="py-20 lg:py-32 px-6 bg-[#E8F4F8]">
            <div className="max-w-7xl mx-auto">
                {/* Section Title - Square style serif */}
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-center text-gray-900 mb-16 lg:mb-24 max-w-4xl mx-auto leading-tight">
                    {sectionTitle}
                </h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left: Clean Accordion */}
                    <div className="space-y-0">
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                className="border-t border-gray-300 last:border-b"
                            >
                                <button
                                    onClick={() => setActiveIndex(activeIndex === index ? -1 : index)}
                                    className="w-full py-5 flex items-center justify-between text-left group"
                                >
                                    <h3 className={`text-base md:text-lg font-medium transition-colors duration-200 ${
                                        activeIndex === index ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'
                                    }`}>
                                        {feature.title}
                                    </h3>
                                    
                                    <motion.span 
                                        className={`ml-4 text-2xl font-light transition-colors duration-200 ${
                                            activeIndex === index ? 'text-gray-900' : 'text-gray-400'
                                        }`}
                                        animate={{ rotate: activeIndex === index ? 45 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        +
                                    </motion.span>
                                </button>
                                
                                <AnimatePresence>
                                    {activeIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: 'easeOut' }}
                                            className="overflow-hidden"
                                        >
                                            <p className="text-gray-600 pb-5 text-sm md:text-base leading-relaxed max-w-md">
                                                {feature.description}
                                            </p>
                                            <a 
                                                href="#" 
                                                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 pb-5 transition-colors"
                                            >
                                                Más información
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </a>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                    
                    {/* Right: Image with subtle rounded corners */}
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                        <AnimatePresence mode="wait">
                            <motion.img
                                key={activeIndex}
                                src={features[activeIndex >= 0 ? activeIndex : 0].image}
                                alt={features[activeIndex >= 0 ? activeIndex : 0].title}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
}
