import { motion, useTransform, type MotionValue } from 'framer-motion';
import { pushEvent, trackGetStarted } from '../../../../lib/gtm';
import SceneFrame from '../SceneFrame';
import StoryPhotoSlot from '../StoryPhotoSlot';
import type { StoryScene } from '../story';

interface Props {
  scene: StoryScene;
  progress: MotionValue<number>;
}

export default function HeroScene({ scene, progress }: Props) {
  const customerY = useTransform(progress, [0, 1], [12, -6]);
  const paymentY = useTransform(progress, [0, 1], [-8, 8]);
  const ownerY = useTransform(progress, [0, 1], [10, -6]);
  const pulseX = useTransform(progress, [0, 0.28, 0.82, 1], [112, 112, 16, 0]);
  const pulseY = useTransform(progress, [0, 0.28, 0.82, 1], [-92, -92, -12, 0]);
  const pulseScale = useTransform(progress, [0, 0.22, 0.34, 1], [0.94, 1.08, 1, 1]);

  const actions = (
    <div className="grid gap-2.5 sm:flex sm:flex-wrap lg:gap-3">
      <a
        href="/wa?src=homepage_story_hero&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'homepage_story_hero' })}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-50 px-5 text-center text-xs font-semibold text-neutral-950 transition-transform duration-200 hover:scale-[1.02] sm:px-6 sm:text-sm"
      >
        Agenda por WhatsApp
      </a>
      <a
        href="https://dashboard.avoqado.io/signup"
        onClick={event => trackGetStarted(event, 'homepage_story_hero')}
        className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 text-center text-xs font-semibold text-neutral-50 transition-colors duration-200 hover:border-white/35 hover:bg-white/5 sm:px-6 sm:text-sm"
      >
        Comienza gratis
      </a>
    </div>
  );

  return (
    <SceneFrame
      scene={scene}
      headingLevel={1}
      actions={actions}
      accessibleSummary="Cuatro espacios fotográficos temporales representan el servicio, la interacción del cliente, el cobro y la vista del dueño."
    >
      <div className="relative h-full min-h-0 overflow-hidden rounded-[1.35rem] bg-neutral-900 p-1.5 sm:rounded-[1.6rem] lg:rounded-[1.75rem]">
        <StoryPhotoSlot
          id="service-in-action"
          showStatus
          className="absolute inset-y-[3%] left-[17%] z-10 h-[94%] w-[62%] rounded-[1rem] border-[6px] border-neutral-900 sm:inset-y-[6%] sm:left-[21%] sm:h-[88%] sm:w-[54%] sm:rounded-[1.25rem] lg:left-[20%] lg:w-[52%]"
          imageClassName="saturate-[0.82] contrast-[1.03]"
          overlayClassName="bg-[linear-gradient(180deg,transparent_62%,oklch(0.13_0.005_155_/_0.42))]"
        />

        <motion.div
          className="absolute left-0 top-[4%] z-20 h-[42%] w-[36%] sm:left-[1%] sm:top-[7%] sm:h-[38%] sm:w-[30%]"
          style={{ y: customerY }}
        >
          <StoryPhotoSlot
            id="customer-mobile"
            className="size-full rounded-[1rem] border-[6px] border-neutral-900 sm:rounded-[1.2rem]"
            imageClassName="saturate-[0.78]"
            overlayClassName="bg-neutral-950/10"
          />
        </motion.div>

        <motion.div
          className="absolute right-0 top-0 z-30 hidden h-[40%] w-[40%] min-[360px]:block sm:w-[38%]"
          style={{ y: paymentY }}
        >
          <StoryPhotoSlot
            id="payment-handoff"
            className="size-full rounded-[1rem] border-[6px] border-neutral-900 sm:rounded-[1.2rem]"
            imageClassName="saturate-[0.78]"
            overlayClassName="bg-neutral-950/12"
          />
        </motion.div>

        <motion.div
          className="absolute bottom-[2%] right-[1%] z-30 hidden h-[30%] w-[35%] min-[360px]:block sm:w-[34%]"
          style={{ y: ownerY }}
        >
          <StoryPhotoSlot
            id="owner-overview"
            className="size-full rounded-[1rem] border-[6px] border-neutral-900 sm:rounded-[1.2rem]"
            imageClassName="saturate-[0.72]"
            overlayClassName="bg-neutral-950/18"
          />
        </motion.div>

        <div className="absolute left-0 top-1/2 z-40 h-px w-8 bg-avoqado-green/55" />
        <motion.span
          className="absolute left-0 top-1/2 z-50 size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green"
          style={{ x: pulseX, y: pulseY, scale: pulseScale }}
        />
      </div>
    </SceneFrame>
  );
}
