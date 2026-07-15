import { pushEvent, trackGetStarted } from '../../../lib/gtm';
import { OPENING_CHANNELS, OPENING_TILES } from './opening-tiles';

export default function ReducedMotionOpening({ mode = 'static' }: { mode?: 'static' | 'noscript' }) {
  return (
    <section data-opening-mode={mode} className="bg-neutral-950 text-neutral-50">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <img src="/video4-poster.webp" alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-45" />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-sm">
            PARA TODO TIPO DE NEGOCIO
          </p>
          <h1 className="mx-auto max-w-6xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">
            El primer sistema todo en uno en México
            <br className="hidden md:block" />{' '}
            para cobrar, administrar
            <br className="hidden md:block" />{' '}
            y hacer crecer tu negocio.
          </h1>
          <p className="mx-auto mt-6 max-w-4xl text-base text-neutral-200 sm:text-lg">
            Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad y reportes — todo conectado en tiempo real.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/wa?src=hero_demo&text=Hola%2C%20me%20interesa%20una%20demo%20de%20Avoqado%20de%2015%20minutos" target="_blank" rel="noopener noreferrer" onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'hero' })} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 font-semibold text-black">Agenda por WhatsApp</a>
            <a href="https://dashboard.avoqado.io/signup" onClick={event => trackGetStarted(event, 'hero')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-6 font-semibold text-white">Comienza gratis</a>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-6 py-20 text-neutral-950">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 md:grid-cols-6">
          {OPENING_TILES.map(tile => <img key={tile.id} src={tile.src} alt="" loading="lazy" className="aspect-square size-full rounded-lg object-cover" />)}
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-3xl font-light tracking-[-0.03em] sm:text-5xl">Tiendas, gyms, estéticas, clínicas y más.<br />Cobra, organiza y crece desde un solo lugar.</h2>
          <div className="my-14 h-px bg-black/10" aria-hidden="true" />
          <h2 className="text-3xl font-light tracking-[-0.03em] sm:text-5xl">Tu cliente empieza como prefiera.</h2>
          <p className="mt-4 text-neutral-600">Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.</p>
          <ol className="mt-8 border-y border-black/10">
            {OPENING_CHANNELS.map(channel => <li key={channel.id} data-channel-id={channel.id} className="flex items-center justify-between border-b border-black/8 py-3 last:border-b-0"><strong>{channel.label}</strong><span>{channel.result}</span></li>)}
          </ol>
          <div data-channel-route-summary className="mt-6 border-y border-black/10 py-4">
            <strong className="block text-lg font-semibold text-green-800">Booking Widget → Reserva confirmada</strong>
            <span className="mt-1 block text-sm text-neutral-600">La cita entra con cliente, servicio, hora y sucursal.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
