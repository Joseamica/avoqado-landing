import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

/**
 * Square-like Hero Animation
 * 
 * Grid Structure (matches Square):
 * - 9 columns, 5 rows
 * - Rows 1 & 2: Top cards
 * - Row 3: Center text
 * - Rows 4 & 5: Bottom cards
 */

// Grid item data with positions matching Square's layout
const gridItems = [
  // Row 1
  { col: 2, row: 1, img: "/1.png", isIcon: false },
  { col: 4, row: 1, img: "/2.png", isIcon: false },
  { col: 6, row: 1, img: "/3.png", isIcon: false },
  { col: 8, row: 1, img: "/4.png", isIcon: false }, // Was 📱 emoji
  // Row 2
  { col: 1, row: 2, img: "/5.png", isIcon: false },
  { col: 3, row: 2, img: "/6.png", isIcon: false }, // Was 🏪 emoji
  { col: 5, row: 2, img: "/7.png", isIcon: false },
  { col: 7, row: 2, img: "/8.png", isIcon: false },
  { col: 9, row: 2, img: "/9.png", isIcon: false },
  // Row 4 (col 5 is empty - hero lands there)
  { col: 1, row: 4, img: "/10.png", isIcon: false },
  { col: 3, row: 4, img: "/11.png", isIcon: false },
  { col: 7, row: 4, img: "/12.png", isIcon: false }, // Was 🛍️ emoji
  { col: 9, row: 4, img: "/13.png", isIcon: false },
  // Row 5
  { col: 2, row: 5, img: "/14.png", isIcon: false },
  { col: 4, row: 5, img: "/15.png", isIcon: false }, // Was ✨ emoji
  { col: 6, row: 5, img: "/16.png", isIcon: false },
  { col: 8, row: 5, img: "/17.png", isIcon: false },
];

export default function SquareHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const SHRINK_END = 0.5;

  // --- HERO TRANSFORMS ---
  // Hero shrinks and moves to land in the center-left area of the grid
  const heroScale = useTransform(scrollYProgress, [0, SHRINK_END], [1, 0.105]);
  const heroBorderRadius = useTransform(scrollYProgress, [0, SHRINK_END], [0, 16]);
  // Position: lands roughly at col 5, row 4 area (center of grid)
  const heroX = useTransform(scrollYProgress, [0, SHRINK_END], ["0%", "44%"]);
  const heroY = useTransform(scrollYProgress, [0, SHRINK_END], ["0px", "60%"]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // --- GRID & TEXT TRANSFORMS ---
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  // Text animations trigger near the end of scroll (70% - 95%)
  // First line: "Sin importar tu tipo de negocio,"
  const textLine1Opacity = useTransform(scrollYProgress, [0.7, 0.82], [0, 1]);
  const textLine1Y = useTransform(scrollYProgress, [0.7, 0.82], ["40px", "0px"]);
  const textLine1BlurValue = useTransform(scrollYProgress, [0.7, 0.82], [10, 0]);
  const textLine1Blur = useTransform(textLine1BlurValue, (value) => `blur(${value}px)`);

  // Second line: "comienza y crece a tu manera." (appears after first line)
  const textLine2Opacity = useTransform(scrollYProgress, [0.78, 0.92], [0, 1]);
  const textLine2Y = useTransform(scrollYProgress, [0.78, 0.92], ["40px", "0px"]);
  const textLine2BlurValue = useTransform(scrollYProgress, [0.78, 0.92], [10, 0]);
  const textLine2Blur = useTransform(textLine2BlurValue, (value) => `blur(${value}px)`);

  // Create staggered animations for each grid item
  const getItemTransforms = (index: number) => {
    const baseDelay = 0.08 + (index * 0.015);
    return {
      scale: useTransform(scrollYProgress, [baseDelay, baseDelay + 0.35], [0.25, 1]),
      opacity: useTransform(scrollYProgress, [baseDelay, baseDelay + 0.2], [0, 1]),
      y: useTransform(scrollYProgress, [baseDelay, baseDelay + 0.35], ["50px", "0px"]),
    };
  };

  return (
    <div ref={containerRef} className="relative h-[250vh] bg-white">
      
      {/* STICKY VIEWPORT */}
      <div className="sticky top-0 left-0 h-screen w-screen overflow-hidden bg-white">

        {/* --- CSS GRID (9 columns, 5 rows) --- */}
        <motion.div 
          style={{ opacity: gridOpacity }}
          className="absolute inset-0 z-10 w-full h-full p-4 md:p-8"
        >
          <div 
            className="w-full h-full grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(9, minmax(140px, 1fr))',
              gridTemplateRows: 'repeat(5, minmax(140px, 1fr))',
            }}
          >
            {/* Grid Items - Rows 1, 2, 4, 5 */}
            {gridItems.map((item, index) => {
              const transforms = getItemTransforms(index);
              return (
                <motion.div
                  key={index}
                  style={{
                    gridColumn: item.col,
                    gridRow: item.row,
                    scale: transforms.scale,
                    opacity: transforms.opacity,
                    y: transforms.y,
                    aspectRatio: '1', // Force square shape
                  }}
                  className="rounded-2xl overflow-hidden bg-gray-100"
                >
                  <img 
                    src={`${item.img}?v=${Date.now()}`} 
                    className="w-full h-full object-cover"
                    style={{ 
                      // "Perspective hack" to force high-quality anti-aliasing on downscaled images
                      transform: 'perspective(1px) translateZ(0)',
                      backfaceVisibility: 'hidden'
                    }}
                    alt=""
                    loading="lazy"
                  />
                </motion.div>
              );
            })}

            {/* Row 3: Center Text (spans full width) */}
            <div
              style={{
                gridColumn: '1 / -1',
                gridRow: 3,
              }}
              className="flex items-center justify-center px-4"
            >
              <h2
                className="text-3xl md:text-5xl lg:text-6xl text-center text-black leading-snug"
                style={{ fontWeight: 300 }}
              >
                {/* First line with independent animation */}
                <motion.span
                  style={{
                    opacity: textLine1Opacity,
                    y: textLine1Y,
                    filter: textLine1Blur,
                    display: 'inline-block',
                    willChange: 'transform, opacity, filter'
                  }}
                  className="text-black"
                >
                  Sin importar tu tipo de negocio,
                </motion.span>
                <br/>
                {/* Second line with delayed animation */}
                <motion.span
                  style={{
                    opacity: textLine2Opacity,
                    y: textLine2Y,
                    filter: textLine2Blur,
                    display: 'inline-block',
                    willChange: 'transform, opacity, filter'
                  }}
                  className="text-black"
                >
                  comienza y crece a tu manera.
                </motion.span>
              </h2>
            </div>
          </div>
        </motion.div>

        {/* --- THE HERO (Full Width -> Shrinks into grid) --- */}
        <motion.div
          style={{
            scale: heroScale,
            x: heroX,
            y: heroY,
            borderRadius: heroBorderRadius,
          }}
          className="absolute top-0 left-0 z-20 w-full h-screen overflow-hidden bg-black shadow-2xl origin-top-left"
        >
          <video
            src="/video.webm"
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />

          <motion.div style={{ opacity: heroTextOpacity }} className="absolute inset-0 bg-black/50" />

        <motion.div 
            style={{ opacity: heroTextOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center z-30 px-8 text-center"
          >
            {/* <img 
              src="/imagotipo-white.png" 
              alt="Avoqado" 
              className="w-48 md:w-64 mb-12"
            /> */}
            <h1
              className="text-4xl md:text-7xl text-white tracking-tight mb-6 text-center px-4 max-w-5xl"
              style={{ fontWeight: 300, fontFamily: "'DM Sans', sans-serif" }}
            >
              Empezó en tu barrio.<br/>
              Terminó en todo México.
            </h1>
            {/* <p className="text-2xl md:text-3xl text-avoqado-green mb-8 text-center font-light">
              Domina tus calles. Piensa en grande.
            </p> */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <a href="/signup" className="bg-black text-white px-10 py-4 rounded-full font-bold text-2xl hover:scale-105 transition-transform cursor-pointer font-baby">
                Comienza gratis
              </a>
              <a href="/contact" className="bg-transparent border-2 bg-white text-black px-10 py-4 rounded-full font-bold text-2xl hover:scale-105 transition-transform cursor-pointer ">
                Contáctanos
              </a>
            </div>
          </motion.div>
        </motion.div>

      </div>

      {/* More content below */}
      <div className="h-screen w-full bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-2xl">Continue scrolling...</p>
      </div>

    </div>
  );
}
