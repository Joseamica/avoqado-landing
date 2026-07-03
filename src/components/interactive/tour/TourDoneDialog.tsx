/**
 * TourDoneDialog — completion dialog (founder request): when a flow finishes,
 * the conversion moment stops being "a button quietly unlocked in the panel"
 * and becomes an unmissable dialog with a SINGLE ask: contact sales
 * (WhatsApp via the /wa bridge, so the Google Ads / Meta conversions keep
 * firing). Dismissible — the panel CTA stays available behind it.
 *
 * Measurement: the OPEN is tracked by the caller (tour_done_dialog_view on
 * the dataLayer → GTM can fan it out to GA4/Ads/Meta); the <a> reuses the
 * exact same waHref + trackTourBeforeNav handler as the panel CTA
 * (tour_cta_click{tour_cta:'whatsapp'} beacon before same-tab nav).
 *
 * Follows the repo's modal rules (see DemoDialog.tsx): React portal +
 * position:fixed body lock that preserves the scroll position.
 */
import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { createPortal } from 'react-dom';
import type { FlowId } from './engine';

interface Props {
  open: boolean;
  flow: FlowId;
  waHref: string;
  onPrimaryCta: (e: ReactMouseEvent<HTMLAnchorElement>) => void;
  onClose: () => void;
}

/** Subtítulo por flujo — el payoff que el visitante ACABA de ver, no un
 *  genérico (la cadena post-venta solo corre en los flujos TPV). */
const SUBTITLE: Record<FlowId, string> = {
  A: 'Una venta disparó inventario, factura, comisiones, puntos, bancos y a tu IA — sin capturar nada dos veces.',
  B: 'Una venta disparó inventario, factura, comisiones, puntos, bancos y a tu IA — sin capturar nada dos veces.',
  R: 'Tu cliente reservó solo y la venta cayó en tu dashboard — sin llamadas ni captura.',
  L: 'Vendiste un servicio con una liga por WhatsApp y el cobro cayó solo en tu dashboard.',
  P: 'El mismo POS en computadora, tablet o celular — y el cobro salió directo a tu terminal.',
};

export default function TourDoneDialog({ open, flow, waHref, onPrimaryCta, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Escape to close + scroll lock without breaking scroll-linked animations
  // (same pattern as DemoDialog.tsx — the repo's reference modal).
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      scrollYRef.current = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      if (scrollYRef.current > 0) {
        window.scrollTo(0, scrollYRef.current);
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const dialogContent = (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Dialog */}
      <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-black transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-avoqado-green/15">
          <svg className="h-7 w-7 text-avoqado-green" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="10" fill="currentColor" />
            <path d="m8 12.4 2.8 2.8L16.2 9" stroke="#17300A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </div>

        <h2 className="mb-2 text-2xl font-bold text-black">Así de fácil. Todo en uno.</h2>
        <p className="mb-7 text-gray-500">{SUBTITLE[flow]}</p>

        <a
          href={waHref}
          onClick={onPrimaryCta}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-full bg-avoqado-green px-6 py-3.5 font-semibold text-black transition-transform hover:-translate-y-0.5"
        >
          <svg className="h-5 w-5" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 1.6a6.2 6.2 0 0 0-5.3 9.4L1.9 14l3.2-.8A6.2 6.2 0 1 0 8 1.6Z" fill="currentColor" opacity="0.9" />
            <path
              d="M5.9 5.1c.2-.5.9-.7 1.2-.2l.6.9c.2.3.1.7-.1 1 .3.7.9 1.2 1.6 1.6.3-.3.7-.4 1-.2l.9.6c.5.3.3 1-.2 1.2-1.9.8-5.6-3-5-4.9Z"
              fill="#fff"
            />
          </svg>
          Contactar a ventas
        </a>

        <button type="button" onClick={onClose} className="text-sm text-gray-400 underline underline-offset-2 hover:text-gray-600">
          Seguir viendo el demo
        </button>
      </div>
    </div>
  );

  return createPortal(dialogContent, document.body);
}
