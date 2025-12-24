import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

import img1 from '../../assets/hero/hero-tile-01.jpg';
import img2 from '../../assets/hero/hero-tile-02.jpg';
import img3 from '../../assets/hero/hero-tile-03.jpg';
import img4 from '../../assets/hero/hero-tile-04.jpg';
import img5 from '../../assets/hero/hero-tile-05.jpg';
import img6 from '../../assets/hero/hero-tile-06.jpg';
import img7 from '../../assets/hero/hero-tile-07.jpg';
import img8 from '../../assets/hero/hero-tile-08.jpg';
import img9 from '../../assets/hero/hero-tile-09.jpg';
import img10 from '../../assets/hero/hero-tile-10.jpg';
import img11 from '../../assets/hero/hero-tile-11.jpg';
import img12 from '../../assets/hero/hero-tile-12.jpg';
import img13 from '../../assets/hero/hero-tile-13.jpg';
import img14 from '../../assets/hero/hero-tile-14.jpg';
import img15 from '../../assets/hero/hero-tile-15.jpg';
import img16 from '../../assets/hero/hero-tile-16.jpg';
import img17 from '../../assets/hero/hero-tile-17.jpg';

/**
 * Square-like Hero Animation - Mobile Responsive
 * 
 * Simple approach: All items rendered, CSS handles visibility and positioning
 */

// Grid items - Position specified for 9-column desktop grid
// mobilePos: position in 3-column mobile grid (col, row), null = hidden on mobile
const gridItems = [
  // Row 1
  { col: 2, row: 1, img: img1.src, mobilePos: { col: 1, row: 1 } },
  { col: 4, row: 1, img: img2.src, mobilePos: { col: 2, row: 1 } },
  { col: 6, row: 1, img: img3.src, mobilePos: { col: 3, row: 1 } },
  { col: 8, row: 1, img: img4.src, mobilePos: null },
  // Row 2 - center reserved for video on mobile (col 2)
  { col: 1, row: 2, img: img5.src, mobilePos: { col: 1, row: 2 } },
  { col: 3, row: 2, img: img6.src, mobilePos: null }, // Reserved for video
  { col: 5, row: 2, img: img7.src, mobilePos: { col: 3, row: 2 } },
  { col: 7, row: 2, img: img8.src, mobilePos: null },
  { col: 9, row: 2, img: img9.src, mobilePos: null },
  // Row 4
  { col: 1, row: 4, img: img10.src, mobilePos: { col: 1, row: 4 } },
  { col: 3, row: 4, img: img11.src, mobilePos: { col: 2, row: 4 } },
  { col: 7, row: 4, img: img12.src, mobilePos: { col: 3, row: 4 } },
  { col: 9, row: 4, img: img13.src, mobilePos: null },
  // Row 5
  { col: 2, row: 5, img: img14.src, mobilePos: { col: 1, row: 5 } },
  { col: 4, row: 5, img: img15.src, mobilePos: { col: 2, row: 5 } },
  { col: 6, row: 5, img: img16.src, mobilePos: { col: 3, row: 5 } },
  { col: 8, row: 5, img: img17.src, mobilePos: null },
];

export default function SquareHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const SHRINK_END = 0.5;

  // Hero transforms - different values for mobile vs desktop
  // Now sticky container is h-screen (top-0), video needs to end at correct position
  // Desktop: scale 0.105, ends at ~65% to fit in row 3 area (accounting for navbar offset)
  // Mobile: scale 0.14, ends at ~22% to fit above row 3
  const heroScale = useTransform(scrollYProgress, [0, SHRINK_END], [1, isMobile ? 0.31 : 0.105]);
  const heroBorderRadius = useTransform(scrollYProgress, [0, SHRINK_END], [0, 16]);
  const heroX = useTransform(scrollYProgress, [0, SHRINK_END], ["0%", isMobile ? "34.5%" : "44%"]);
  const heroY = useTransform(scrollYProgress, [0, SHRINK_END], ["0px", isMobile ? "23%" : "65%"]);
  // Mobile only: Clip top/bottom to make video less tall and fit in grid cell without covering text
  const heroClip = useTransform(scrollYProgress, [0, SHRINK_END], ["inset(0% 0% 0% 0%)", isMobile ? "inset(25% 0% 25% 0%)" : "inset(0% 0% 0% 0%)"]);
  const heroTextOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  // Grid opacity
  const gridOpacity = useTransform(scrollYProgress, [0.1, 0.35], [0, 1]);

  // Pre-compute ALL 17 item transforms at the top level
  const t0 = { scale: useTransform(scrollYProgress, [0.08, 0.43], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.08, 0.28], [0, 1]), y: useTransform(scrollYProgress, [0.08, 0.43], ["50px", "0px"]) };
  const t1 = { scale: useTransform(scrollYProgress, [0.095, 0.445], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.095, 0.295], [0, 1]), y: useTransform(scrollYProgress, [0.095, 0.445], ["50px", "0px"]) };
  const t2 = { scale: useTransform(scrollYProgress, [0.11, 0.46], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.11, 0.31], [0, 1]), y: useTransform(scrollYProgress, [0.11, 0.46], ["50px", "0px"]) };
  const t3 = { scale: useTransform(scrollYProgress, [0.125, 0.475], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.125, 0.325], [0, 1]), y: useTransform(scrollYProgress, [0.125, 0.475], ["50px", "0px"]) };
  const t4 = { scale: useTransform(scrollYProgress, [0.14, 0.49], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.14, 0.34], [0, 1]), y: useTransform(scrollYProgress, [0.14, 0.49], ["50px", "0px"]) };
  const t5 = { scale: useTransform(scrollYProgress, [0.155, 0.505], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.155, 0.355], [0, 1]), y: useTransform(scrollYProgress, [0.155, 0.505], ["50px", "0px"]) };
  const t6 = { scale: useTransform(scrollYProgress, [0.17, 0.52], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.17, 0.37], [0, 1]), y: useTransform(scrollYProgress, [0.17, 0.52], ["50px", "0px"]) };
  const t7 = { scale: useTransform(scrollYProgress, [0.185, 0.535], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.185, 0.385], [0, 1]), y: useTransform(scrollYProgress, [0.185, 0.535], ["50px", "0px"]) };
  const t8 = { scale: useTransform(scrollYProgress, [0.2, 0.55], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.2, 0.4], [0, 1]), y: useTransform(scrollYProgress, [0.2, 0.55], ["50px", "0px"]) };
  const t9 = { scale: useTransform(scrollYProgress, [0.215, 0.565], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.215, 0.415], [0, 1]), y: useTransform(scrollYProgress, [0.215, 0.565], ["50px", "0px"]) };
  const t10 = { scale: useTransform(scrollYProgress, [0.23, 0.58], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.23, 0.43], [0, 1]), y: useTransform(scrollYProgress, [0.23, 0.58], ["50px", "0px"]) };
  const t11 = { scale: useTransform(scrollYProgress, [0.245, 0.595], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.245, 0.445], [0, 1]), y: useTransform(scrollYProgress, [0.245, 0.595], ["50px", "0px"]) };
  const t12 = { scale: useTransform(scrollYProgress, [0.26, 0.61], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.26, 0.46], [0, 1]), y: useTransform(scrollYProgress, [0.26, 0.61], ["50px", "0px"]) };
  const t13 = { scale: useTransform(scrollYProgress, [0.275, 0.625], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.275, 0.475], [0, 1]), y: useTransform(scrollYProgress, [0.275, 0.625], ["50px", "0px"]) };
  const t14 = { scale: useTransform(scrollYProgress, [0.29, 0.64], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.29, 0.49], [0, 1]), y: useTransform(scrollYProgress, [0.29, 0.64], ["50px", "0px"]) };
  const t15 = { scale: useTransform(scrollYProgress, [0.305, 0.655], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.305, 0.505], [0, 1]), y: useTransform(scrollYProgress, [0.305, 0.655], ["50px", "0px"]) };
  const t16 = { scale: useTransform(scrollYProgress, [0.32, 0.67], [0.25, 1]), opacity: useTransform(scrollYProgress, [0.32, 0.52], [0, 1]), y: useTransform(scrollYProgress, [0.32, 0.67], ["50px", "0px"]) };
  
  const itemTransforms = [t0, t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16];

  // Text animations
  const textLine1Opacity = useTransform(scrollYProgress, [0.45, 0.58], [0, 1]);
  const textLine1Y = useTransform(scrollYProgress, [0.45, 0.58], ["30px", "0px"]);
  const textLine1BlurValue = useTransform(scrollYProgress, [0.45, 0.58], [8, 0]);
  const textLine1Blur = useTransform(textLine1BlurValue, (v) => `blur(${v}px)`);

  const textLine2Opacity = useTransform(scrollYProgress, [0.52, 0.68], [0, 1]);
  const textLine2Y = useTransform(scrollYProgress, [0.52, 0.68], ["30px", "0px"]);
  const textLine2BlurValue = useTransform(scrollYProgress, [0.52, 0.68], [8, 0]);
  const textLine2Blur = useTransform(textLine2BlurValue, (v) => `blur(${v}px)`);

  return (
    <div ref={containerRef} className="relative h-[180vh] bg-black z-0">
      {/* Sticky container - starts at top-0 but has padding for navbar */}
      <div className="sticky top-0 left-0 h-screen w-full overflow-hidden z-10">
        {/* HERO VIDEO - Covers full screen including navbar area */}
        <motion.div
          style={{
            scale: heroScale,
            x: heroX,
            y: heroY,
            borderRadius: heroBorderRadius,
            clipPath: heroClip,
          }}
          className="absolute top-0 left-0 z-20 w-full h-full overflow-hidden bg-black shadow-2xl origin-top-left"
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
            className="absolute inset-0 flex flex-col items-center justify-center z-30 px-4 md:px-8 text-center"
          >
            <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-7xl text-white tracking-tight mb-4 md:mb-6 text-center max-w-5xl font-light">
              Empezó en tu barrio.<br/>
              Terminó en todo México.
            </h1>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-center">
              <a href="https://dashboardv2.avoqado.io/signup" className="bg-black text-white px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-lg md:text-2xl hover:scale-105 transition-transform cursor-pointer font-baby">
                Comienza gratis
              </a>
              <a href="/contact" className="bg-white text-black px-6 md:px-10 py-3 md:py-4 rounded-full font-bold text-lg md:text-2xl hover:scale-105 transition-transform cursor-pointer border-2">
                Contáctanos
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Grid content - offset by navbar height */}
        <div className="absolute top-16 left-0 right-0 bottom-0 overflow-hidden bg-white">

        {/* CSS GRID - Desktop (9 cols) */}
        <motion.div
          style={{ opacity: gridOpacity }}
          className="absolute inset-0 z-10 w-full h-full p-4 md:p-6 lg:p-8 hidden md:block"
        >
          <div
            className="w-full h-full grid gap-3 lg:gap-4"
            style={{
              gridTemplateColumns: 'repeat(9, 1fr)',
              gridTemplateRows: 'repeat(5, 1fr)',
            }}
          >
            {gridItems.map((item, index) => {
              const transforms = itemTransforms[index];
              return (
                <motion.div
                  key={index}
                  style={{
                    gridColumn: item.col,
                    gridRow: item.row,
                    scale: transforms.scale,
                    opacity: transforms.opacity,
                    y: transforms.y,
                  }}
                  className="rounded-xl lg:rounded-2xl overflow-hidden bg-gray-100"
                >
                  <img
                    src={item.img}
                    className="w-full h-full object-cover"
                    alt=""
                    loading="lazy"
                  />
                </motion.div>
              );
            })}

            {/* Center Text Row - spans full width */}
            <div
              style={{ gridColumn: '1 / -1', gridRow: 3 }}
              className="flex items-center justify-center px-4 relative z-20"
            >
              <div className="relative">
                <div className="absolute inset-0 -inset-x-6 -inset-y-3 bg-white/90 backdrop-blur-sm rounded-xl" />
                <h2 className="relative text-2xl lg:text-4xl xl:text-5xl text-center text-black leading-snug font-light">
                  <motion.span
                    style={{ opacity: textLine1Opacity, y: textLine1Y, filter: textLine1Blur, display: 'inline-block' }}
                  >
                    Sin importar tu tipo de negocio,
                  </motion.span>
                  <br/>
                  <motion.span
                    style={{ opacity: textLine2Opacity, y: textLine2Y, filter: textLine2Blur, display: 'inline-block' }}
                  >
                    comienza y crece a tu manera.
                  </motion.span>
                </h2>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CSS GRID - Mobile (3 cols, fewer images) */}
        <motion.div
          style={{ opacity: gridOpacity }}
          className="absolute inset-0 z-10 w-full h-full p-3 md:hidden"
        >
          <div
            className="w-full h-full grid gap-2"
            style={{
              gridTemplateColumns: 'repeat(3, 1fr)',
              gridTemplateRows: 'repeat(5, 1fr)',
            }}
          >
            {gridItems.map((item, index) => {
              if (!item.mobilePos) return null;
              const transforms = itemTransforms[index];
              return (
                <motion.div
                  key={index}
                  style={{
                    gridColumn: item.mobilePos.col,
                    gridRow: item.mobilePos.row,
                    scale: transforms.scale,
                    opacity: transforms.opacity,
                    y: transforms.y,
                  }}
                  className="rounded-lg overflow-hidden bg-gray-100"
                >
                  <img
                    src={item.img}
                    className="w-full h-full object-cover"
                    alt=""
                    loading="lazy"
                  />
                </motion.div>
              );
            })}

            {/* Center Text Row - Mobile */}
            <div
              style={{ gridColumn: '1 / -1', gridRow: 3 }}
              className="flex items-center justify-center px-2 relative z-20"
            >
              <div className="relative">
                <div className="absolute inset-0 -inset-x-4 -inset-y-2 bg-white/90 backdrop-blur-sm rounded-lg" />
                <h2 className="relative text-base sm:text-lg text-center text-black leading-snug font-light">
                  <motion.span
                    style={{ opacity: textLine1Opacity, y: textLine1Y, filter: textLine1Blur, display: 'inline-block' }}
                  >
                    Sin importar tu negocio,
                  </motion.span>
                  <br/>
                  <motion.span
                    style={{ opacity: textLine2Opacity, y: textLine2Y, filter: textLine2Blur, display: 'inline-block' }}
                  >
                    crece a tu manera.
                  </motion.span>
                </h2>
              </div>
            </div>
          </div>
        </motion.div>

        </div>
      </div>

      {/* Spacer */}
      <div className="h-screen w-full bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400 text-xl md:text-2xl">Continue scrolling...</p>
      </div>
    </div>
  );
}
