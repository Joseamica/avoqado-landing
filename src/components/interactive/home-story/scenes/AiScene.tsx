import { motion, useTransform, type MotionValue } from 'framer-motion';
import { pushEvent, trackGetStarted } from '../../../../lib/gtm';
import SceneFrame from '../SceneFrame';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';

export default function AiScene({
  scene,
  progress,
}: {
  scene: StoryScene;
  progress: MotionValue<number>;
}) {
  const questionOpacity = useTransform(progress, [0.14, 0.34], [0, 1]);
  const questionY = useTransform(progress, [0.14, 0.34], [12, 0]);
  const answerOpacity = useTransform(progress, [0.38, 0.64], [0, 1]);
  const answerY = useTransform(progress, [0.38, 0.64], [12, 0]);
  const closeOpacity = useTransform(progress, [0.68, 0.88], [0, 1]);
  const answer = `${STORY_FIXTURE.comparisonVenue} aparece con menor ticket esta semana. ${STORY_FIXTURE.product} quedó en ${STORY_FIXTURE.stockAfter} piezas y tiene un reorden sugerido.`;
  const actions = (
    <div className="grid gap-2.5 sm:flex sm:flex-wrap lg:gap-3">
      <a
        href="/wa?src=homepage_story_final&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'homepage_story_final' })}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-avoqado-green px-4 text-center text-xs font-semibold leading-tight text-neutral-950 transition-transform duration-200 hover:scale-[1.02] sm:px-6 sm:text-sm"
      >
        Quiero verlo en mi negocio
      </a>
      <a
        href="https://dashboard.avoqado.io/signup"
        onClick={event => trackGetStarted(event, 'homepage_story_final')}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-4 text-center text-xs font-semibold text-neutral-50 transition-colors duration-200 hover:border-white/35 hover:bg-white/5 sm:px-6 sm:text-sm"
      >
        Comienza gratis
      </a>
    </div>
  );

  return (
    <SceneFrame
      scene={scene}
      actions={actions}
      accessibleSummary={`Pregunta a Avoqado MCP: ¿Qué sucursal bajó su ticket y qué debo reordenar? Respuesta ilustrativa basada en esta historia: ${answer}`}
    >
      <div className="flex h-full min-h-0 min-w-0 items-center justify-center">
        <div
          data-story-panel="ai"
          className="w-full min-w-0 max-w-full overflow-hidden rounded-[1.25rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/35 sm:max-w-2xl sm:rounded-[1.75rem]"
        >
          <div className="p-2.5 sm:p-6 lg:p-7">
            <div className="flex min-w-0 items-center justify-between gap-3">
              <p data-story-panel-copy className="truncate text-[0.625rem] font-medium uppercase tracking-[0.16em] text-neutral-500 sm:text-xs">
                Avoqado MCP · Claude / ChatGPT
              </p>
              <span data-story-panel-copy className="hidden shrink-0 rounded-full bg-white/6 px-2 py-1 text-[0.625rem] text-neutral-400 min-[360px]:inline-flex">
                Contexto conectado
              </span>
            </div>

            <motion.div
              data-story-panel-copy
              className="ml-auto mt-2.5 max-w-[92%] rounded-xl rounded-br-sm bg-neutral-50 px-3 py-2 text-[0.7rem] leading-[1.35] text-neutral-950 sm:mt-5 sm:max-w-[85%] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm"
              style={{ opacity: questionOpacity, y: questionY }}
            >
              ¿Qué sucursal bajó su ticket y qué debo reordenar?
            </motion.div>
            <motion.div
              data-story-panel-copy
              className="mt-2 max-w-[96%] rounded-xl rounded-bl-sm bg-white/6 px-3 py-2 text-[0.625rem] leading-[1.4] text-neutral-200 sm:mt-4 sm:max-w-[92%] sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm sm:leading-relaxed"
              style={{ opacity: answerOpacity, y: answerY }}
            >
              {answer}
            </motion.div>
          </div>

          <motion.div
            className="flex items-center justify-between gap-3 bg-avoqado-green px-3 py-2.5 text-neutral-950 sm:px-6 sm:py-4"
            style={{ opacity: closeOpacity }}
          >
            <p data-story-panel-copy className="max-w-[34ch] text-[0.7rem] font-medium leading-tight sm:text-base">
              Todo tu negocio, en el mismo contexto.
            </p>
            <span data-story-panel-copy className="hidden shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.12em] opacity-60 sm:inline">
              Pregunta y actúa
            </span>
          </motion.div>
        </div>
      </div>
    </SceneFrame>
  );
}
