import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

// Image imports
import foodImg from '../../assets/industry/food.png';
import retailImg from '../../assets/industry/retail.png';
import beautyImg from '../../assets/industry/beauty.png';
import servicesImg from '../../assets/industry/services.png';

// Industry data
const industries = [
  {
    id: 'food',
    title: 'Alimentos y Bebidas',
    image: foodImg.src,
    cursorText: 'Alimentos',
    description: 'Soluciones escalables para restaurantes de todos los tamaños.',
    link: '#',
    color: 'from-orange-500/20 to-orange-900/40',
    font: "'Permanent Marker', cursive", // Estilo graffiti para Food
    rotation: -8,
    cursorSize: 'w-44' // 176px
  },
  {
    id: 'retail',
    title: 'Retail',
    image: retailImg.src,
    cursorText: 'Retail',
    description: 'Todo lo que necesitas para administrar tu tienda.',
    link: '#',
    color: 'from-blue-500/20 to-blue-900/40',
    font: "'Bungee Shade', sans-serif", // Estilo chunky fragmentado
    rotation: 5,
    cursorImage: '/retail.png',
    cursorSize: 'w-44' // 176px
  },
  {
    id: 'beauty',
    title: 'Belleza',
    image: beautyImg.src,
    cursorText: 'Belleza',
    description: 'Reservas y pagos para salones y spas.',
    link: '#',
    color: 'from-pink-500/20 to-pink-900/40',
    font: "'Monoton', monospace", // Estilo elegante con líneas
    rotation: -5,
    cursorImage: '/beauty.png',
    cursorSize: 'w-64' // 256px - MÁS GRANDE
  },
  {
    id: 'services',
    title: 'Servicios Profesionales',
    image: servicesImg.src,
    cursorText: 'Servicios',
    description: 'Herramientas para gestión eficiente de servicios.',
    link: '#',
    color: 'from-indigo-500/20 to-indigo-900/40',
    font: "'Special Elite', serif", // Estilo typewriter
    rotation: 3,
    cursorImage: '/services.png',
    cursorSize: 'w-96' // 384px - MUCHO MÁS GRANDE
  }
];

export default function IndustryAccordion() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [isHoveringSection, setIsHoveringSection] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mouse move handler for custom cursor
  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setCursorPos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    }
  };

  return (
    <section 
        className="relative w-full bg-white py-20 px-4 md:px-10 overflow-hidden cursor-none"
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHoveringSection(true)}
        onMouseLeave={() => {
            setIsHoveringSection(false);
            setHoveredIndex(null);
        }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
            <p className="!text-black text-sm tracking-widest uppercase mb-2 font-medium">Construido para Cada Industria</p>
            <h2 className="!text-black text-5xl md:text-6xl font-thin leading-tight">
                Mantén tu negocio <br/> creciendo
            </h2>
        </div>

        <div className="flex flex-col md:flex-row h-[600px] gap-2 md:gap-4">
            {industries.map((industry, index) => (
                <IndustryPanel 
                    key={industry.id}
                    industry={industry}
                    isHovered={hoveredIndex === index}
                    isAnyHovered={hoveredIndex !== null}
                    onHover={() => setHoveredIndex(index)}
                />
            ))}
        </div>
      </div>

      {/* ========== Custom Cursor: Imagen o Texto según industria ========== */}
       <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50"
            animate={{
                x: cursorPos.x + (containerRef.current?.getBoundingClientRect().left || 0) - 75,
                y: cursorPos.y + (containerRef.current?.getBoundingClientRect().top || 0) - 75,
                scale: isHoveringSection ? 1 : 0,
                opacity: isHoveringSection ? 1 : 0,
                rotate: hoveredIndex !== null ? industries[hoveredIndex].rotation : 0
            }}
            transition={{
                 x: { type: "tween", duration: 0, ease: "linear" }, // Instantáneo en X
                 y: { type: "tween", duration: 0, ease: "linear" }, // Instantáneo en Y
                 scale: { type: "spring", damping: 20, stiffness: 300, mass: 0.5 }, // Spring solo para aparecer/desaparecer
                 opacity: { duration: 0.2 },
                 rotate: { type: "spring", damping: 20, stiffness: 200 }
            }}
            style={{ position: 'fixed' }}
        >
            {/* Si la industria tiene cursorImage, mostrar imagen; sino, mostrar texto */}
            {hoveredIndex !== null && industries[hoveredIndex].cursorImage ? (
                <img
                    src={industries[hoveredIndex].cursorImage}
                    alt={industries[hoveredIndex].cursorText}
                    className={`${industries[hoveredIndex].cursorSize || 'w-44'} h-auto`}
                />
            ) : (
                <div
                    className="text-4xl text-white uppercase leading-none"
                    style={{
                        fontFamily: hoveredIndex !== null ? industries[hoveredIndex].font : "'Permanent Marker', cursive",
                        textShadow: `
                            -1px -1px 0px #000,
                            1px -1px 0px #000,
                            -1px 1px 0px #000,
                            1px 1px 0px #000
                        `,
                        WebkitTextStroke: '2px black',
                        letterSpacing: '0.05em'
                    }}
                >
                    {hoveredIndex !== null ? industries[hoveredIndex].cursorText : 'Ver'}
                </div>
            )}
        </motion.div>

      {/* ========== OPCIÓN 2: Texto Neón Verde (Descomenta para usar) ==========
       <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50"
            animate={{
                x: cursorPos.x + (containerRef.current?.getBoundingClientRect().left || 0) - 100,
                y: cursorPos.y + (containerRef.current?.getBoundingClientRect().top || 0) - 30,
                scale: isHoveringSection ? 1 : 0,
                opacity: isHoveringSection ? 1 : 0
            }}
            transition={{
                 type: "spring",
                 damping: 30,
                 stiffness: 250,
                 mass: 0.8
            }}
            style={{ position: 'fixed' }}
        >
            <div
                className="text-7xl  text-avoqado-green uppercase leading-none font-black"
                style={{
                    textShadow: '0 0 10px #69E185, 0 0 20px #69E185, 0 0 30px #69E185, 0 0 40px #69E185, 3px 3px 0px rgba(0,0,0,0.8)',
                    filter: 'drop-shadow(0 0 10px #69E185)'
                }}
            >
                {hoveredIndex !== null ? industries[hoveredIndex].cursorText : 'Ver'}
            </div>
        </motion.div>
      */}

      {/* ========== OPCIÓN 3: Texto Blanco Limpio con Sombra Suave (Descomenta para usar) ==========
       <motion.div
            className="pointer-events-none fixed top-0 left-0 z-50"
            animate={{
                x: cursorPos.x + (containerRef.current?.getBoundingClientRect().left || 0) - 100,
                y: cursorPos.y + (containerRef.current?.getBoundingClientRect().top || 0) - 30,
                scale: isHoveringSection ? 1 : 0,
                opacity: isHoveringSection ? 1 : 0,
                rotate: isHoveringSection ? [-5, 5] : 0
            }}
            transition={{
                 type: "spring",
                 damping: 30,
                 stiffness: 250,
                 mass: 0.8,
                 rotate: { repeat: Infinity, duration: 0.5, ease: "easeInOut" }
            }}
            style={{ position: 'fixed' }}
        >
            <div
                className="text-8xl  text-white uppercase leading-none tracking-tighter"
                style={{
                    textShadow: '4px 4px 8px rgba(0, 0, 0, 0.9), 0 0 30px rgba(105, 225, 133, 0.6)',
                }}
            >
                {hoveredIndex !== null ? industries[hoveredIndex].cursorText : 'Ver'}
            </div>
        </motion.div>
      */}
    </section>
  );
}

function IndustryPanel({ industry, isHovered, isAnyHovered, onHover }: { 
    industry: typeof industries[0], 
    isHovered: boolean, 
    isAnyHovered: boolean,
    onHover: () => void 
}) {
    return (
        <motion.div
            className="relative h-full rounded-2xl overflow-hidden cursor-none"
            onMouseEnter={onHover}
            animate={{
                flex: isHovered ? 3 : 1,
                opacity: isAnyHovered && !isHovered ? 0.7 : 1
            }}
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        >
            {/* Background Image */}
            <div className="absolute inset-0 bg-gray-800">
                <img 
                    src={industry.image} 
                    alt={industry.title}
                    className={`w-full h-full object-cover transition-all duration-700 hover:scale-105 ${isHovered ? 'opacity-100' : 'opacity-90'}`}
                />
                
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-br transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-30'} bg-black`} />
                <div className={`absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent ${isHovered ? 'opacity-60' : 'opacity-80'}`} />
            </div>

            {/* Content */}
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
                 <motion.div
                    initial={false}
                    animate={{ y: isHovered ? 0 : 20 }}
                    transition={{ duration: 0.4 }}
                 >
                    <h3 className="text-white text-3xl mb-3 leading-none">
                        {industry.title}
                    </h3>
                    
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                            height: isHovered ? 'auto' : 0,
                            opacity: isHovered ? 1 : 0
                        }}
                        transition={{ duration: 0.4 }}
                        className="overflow-hidden"
                    >
                        <p className="text-gray-300 text-lg font-medium leading-relaxed pb-2">
                            {industry.description}
                        </p>
                        <span className="inline-flex items-center text-white font-bold text-sm mt-4 group">
                            Conocer más
                            <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                        </span>
                    </motion.div>
                 </motion.div>
            </div>
        </motion.div>
    );
}
