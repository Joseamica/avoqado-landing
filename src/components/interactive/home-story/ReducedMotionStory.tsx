import { pushEvent, trackGetStarted } from '../../../lib/gtm';
import { STORY_SCENES } from './story';

interface Props {
  mode?: 'static' | 'noscript';
}

export default function ReducedMotionStory({ mode = 'static' }: Props) {
  return (
    <div
      data-story-mode={mode}
      className="bg-neutral-950 text-neutral-50"
    >
      {STORY_SCENES.map(scene => {
        const light = scene.theme === 'light';

        return (
          <section
            key={scene.id}
            data-story-scene={scene.id}
            className={light ? 'bg-neutral-50 text-neutral-950' : 'bg-neutral-950 text-neutral-50'}
          >
            <div className="mx-auto flex min-h-[70dvh] max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
              <p className={light ? 'text-sm font-medium text-green-800' : 'text-sm font-medium text-avoqado-green'}>
                {scene.eyebrow}
              </p>
              <h2 className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                {scene.title}
              </h2>
              <p className={light ? 'mt-6 max-w-2xl text-lg text-neutral-600' : 'mt-6 max-w-2xl text-lg text-neutral-300'}>
                {scene.body}
              </p>
              {scene.id === 'payment' ? (
                <div className="mt-6 max-w-md border-y border-white/10 py-4" data-payment-route-summary>
                  <strong className="block text-lg font-semibold text-avoqado-green">
                    TPV → Operación diaria
                  </strong>
                  <span className="mt-1 block text-sm text-neutral-400">
                    Ejemplo en TPV compatible · selección manual de la Cuenta de cobro
                  </span>
                </div>
              ) : null}
              {scene.id === 'ai' ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="/wa?src=homepage_story_final&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'homepage_story_final' })}
                    className={light ? 'inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white' : 'inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-50 px-6 text-sm font-semibold text-neutral-950'}
                  >
                    Quiero verlo en mi negocio
                  </a>
                  <a href="https://dashboard.avoqado.io/signup" onClick={event => trackGetStarted(event, 'homepage_story_final')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-current/20 px-6 text-sm font-semibold">Comienza gratis</a>
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
