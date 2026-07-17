import { useEffect, useRef, useState } from 'react';
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { pushEvent, trackGetStarted } from '../../../lib/gtm';

interface Props {
  progress: MotionValue<number>;
  isMobile: boolean;
  autoplay: boolean;
}

export default function OpeningVideo({ progress, isMobile, autoplay }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const scale = useTransform(progress, [0, 0.38], [1, isMobile ? 0.31 : 0.105]);
  const borderRadius = useTransform(progress, [0, 0.38], [0, 16]);
  const x = useTransform(progress, [0, 0.38], ['0%', isMobile ? '34.5%' : '44%']);
  const y = useTransform(progress, [0, 0.38], ['0px', isMobile ? '23%' : '65%']);
  const clipPath = useTransform(progress, [0, 0.38], [
    'inset(0% 0% 0% 0%)',
    isMobile ? 'inset(25% 0% 25% 0%)' : 'inset(0% 0% 0% 0%)',
  ]);
  const textOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  useEffect(() => {
    const video = videoRef.current;

    if (video?.error) {
      video.pause();
      if (!videoFailed) setVideoFailed(true);
      return;
    }

    if (!autoplay || videoFailed) {
      video?.pause();
      return;
    }

    void video?.play().catch(() => undefined);
  }, [autoplay, videoFailed]);

  return (
    <motion.div
      data-opening-video
      style={{ scale, x, y, borderRadius, clipPath }}
      className="absolute inset-0 z-20 origin-top-left overflow-hidden bg-black shadow-2xl"
    >
      <img
        data-opening-video-fallback
        src="/video4-poster.webp"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 size-full object-cover"
      />
      {!videoFailed ? (
        <video
          ref={videoRef}
          src="/video4.webm"
          poster="/video4-poster.webp"
          loop
          muted
          playsInline
          preload="metadata"
          onError={() => setVideoFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      ) : null}
      <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 bg-black/50" />
      <motion.div
        style={{ opacity: textOpacity }}
        className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center md:px-8"
      >
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-sm">
          Cobra, administra y crece.
        </p>
        <h1 className="mb-6 max-w-6xl text-center text-2xl font-light tracking-tight text-white sm:text-3xl md:mb-8 md:text-4xl lg:text-6xl">
          El primer sistema
          <br className="hidden md:block" />{' '}
          todo-en-uno en México
        </h1>
        <p className="mb-8 max-w-5xl text-center text-sm text-gray-200 sm:text-base md:mb-10 md:text-lg xl:text-xl">
          Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad, reportes, conexión con ChatGPT y Claude. Todo conectado en tiempo real.
        </p>
        <div className="flex flex-col items-center gap-4 sm:flex-row md:gap-6">
          <a
            href="/wa?src=hero_demo&text=Hola%2C%20me%20interesa%20una%20demo%20de%20Avoqado%20de%2015%20minutos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'hero' })}
            className="cursor-pointer rounded-full bg-white px-6 py-3 text-lg font-bold text-black transition-transform hover:scale-105 md:px-10 md:py-4 md:text-2xl"
          >
            Agenda por WhatsApp
          </a>
          <a
            href="https://dashboard.avoqado.io/signup"
            onClick={event => trackGetStarted(event, 'hero')}
            className="cursor-pointer rounded-full border-2 border-white/30 bg-black/60 px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-105 md:px-10 md:py-4 md:text-2xl"
          >
            Comienza gratis
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
