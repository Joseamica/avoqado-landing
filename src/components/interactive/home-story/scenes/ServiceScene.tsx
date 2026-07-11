import { motion, useTransform, type MotionValue } from 'framer-motion';
import SceneFrame from '../SceneFrame';
import StoryPhotoSlot from '../StoryPhotoSlot';
import { STORY_FIXTURE } from '../story-fixture';
import type { StoryScene } from '../story';

export default function ServiceScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const agendaOpacity = useTransform(progress, [0.08, 0.34], [0.25, 1]);
  const agendaY = useTransform(progress, [0.08, 0.4], [24, 0]);
  const trackLength = useTransform(progress, [0.12, 0.78], [0, 1]);
  const desktopPulseX = useTransform(progress, [0, 0.16, 0.36, 0.58, 0.78, 1], [0, 28, 170, 430, 28, 0]);
  const desktopPulseY = useTransform(progress, [0, 0.16, 0.36, 0.58, 0.78, 1], [0, -104, -72, 54, -104, 0]);
  const mobilePulseX = useTransform(progress, [0, 0.18, 0.4, 0.68, 0.84, 1], [0, 14, 76, 230, 14, 0]);
  const mobilePulseY = useTransform(progress, [0, 0.18, 0.4, 0.68, 0.84, 1], [0, -48, 18, 88, -48, 0]);
  const pulseScale = useTransform(progress, [0.3, 0.42, 0.54], [0.94, 1.08, 1]);

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`La agenda confirma a las ${STORY_FIXTURE.appointmentTime} el servicio ${STORY_FIXTURE.service} para ${STORY_FIXTURE.customer}, atendida por ${STORY_FIXTURE.staff} en ${STORY_FIXTURE.venue}, con ${STORY_FIXTURE.product}. Disponible en POS iOS, POS Android, POS Desktop y Windows Service.`}
    >
      <div className="relative h-full min-h-0">
        <StoryPhotoSlot
          id="service-in-action"
          className="absolute right-0 top-0 h-[46%] w-[82%] rounded-[1.1rem] opacity-35 sm:h-[58%] sm:w-[70%] lg:inset-y-[3%] lg:h-[94%] lg:w-[76%] lg:rounded-[1.4rem] lg:opacity-25"
          imageClassName="saturate-[0.55] contrast-[1.08]"
          overlayClassName="bg-[linear-gradient(90deg,oklch(0.13_0.005_155_/_0.62),oklch(0.13_0.005_155_/_0.18))]"
        />

        <motion.div
          className="story-service-agenda absolute inset-x-[3%] bottom-[4%] z-10 overflow-hidden rounded-[1rem] border border-white/10 bg-neutral-900 shadow-[0_24px_70px_oklch(0.05_0.003_155_/_0.38)] sm:inset-x-[7%] sm:bottom-[6%] sm:rounded-[1.35rem] lg:inset-x-[5%] lg:bottom-[9%]"
          style={{ opacity: agendaOpacity, y: agendaY }}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2 sm:px-5 sm:py-3.5">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-neutral-500 sm:text-[0.65rem]">Agenda · hoy</span>
            <span className="flex items-center gap-2 text-[0.62rem] font-medium text-avoqado-green sm:text-xs">
              <span className="size-1.5 rounded-full bg-avoqado-green" />
              Confirmada
            </span>
          </div>

          <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 px-3.5 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5 sm:px-5 sm:py-5 lg:grid-cols-[8rem_minmax(0,1fr)] lg:px-6 lg:py-6">
            <div className="border-r border-white/10 pr-3 sm:pr-5">
              <p className="text-2xl font-light tabular-nums tracking-[-0.04em] text-neutral-50 sm:text-4xl lg:text-5xl">{STORY_FIXTURE.appointmentTime}</p>
              <p className="mt-1 text-[0.58rem] text-neutral-500 sm:mt-2 sm:text-xs">Cita de hoy</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium tracking-[-0.02em] text-neutral-50 sm:text-xl lg:text-2xl">{STORY_FIXTURE.service}</p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:mt-4 sm:gap-y-3">
                {[
                  ['Cliente', STORY_FIXTURE.customer],
                  ['Colaboradora', STORY_FIXTURE.staff],
                  ['Sucursal', STORY_FIXTURE.venue],
                  ['Producto', STORY_FIXTURE.product],
                ].map(([label, value]) => (
                  <p key={label} className="min-w-0">
                    <span className="block text-[0.5rem] uppercase tracking-[0.1em] text-neutral-600 sm:text-[0.58rem]">{label}</span>
                    <span className="story-service-context-value mt-0.5 block truncate text-[0.62rem] text-neutral-300 sm:text-xs lg:text-sm">{value}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="story-service-rail border-t border-white/8 px-3.5 py-2 text-[0.5rem] leading-relaxed tracking-[0.06em] text-neutral-500 sm:px-5 sm:py-3 sm:text-[0.62rem] lg:text-xs">
            <span>POS iOS · POS Android</span>
            <span>POS Desktop · Windows Service</span>
          </div>
        </motion.div>

        <svg className="pointer-events-none absolute inset-0 hidden size-full sm:block" viewBox="0 0 760 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 0 260 H 36 V 154 H 192 V 338 H 458" fill="none" stroke="oklch(0.38 0.006 155 / 0.34)" strokeWidth="1" />
          <motion.path d="M 0 260 H 36 V 154 H 192 V 338 H 458" fill="none" stroke="var(--color-avoqado-green)" strokeWidth="1" style={{ pathLength: trackLength }} />
        </svg>
        <motion.span
          data-story-primary-pulse
          className="story-primary-pulse pointer-events-none absolute left-0 top-1/2 z-20 hidden size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green sm:block"
          style={{ x: desktopPulseX, y: desktopPulseY, scale: pulseScale }}
        />
        <motion.span
          data-story-primary-pulse
          className="story-primary-pulse pointer-events-none absolute left-0 top-1/2 z-20 size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green sm:hidden"
          style={{ x: mobilePulseX, y: mobilePulseY, scale: pulseScale }}
        />
      </div>
    </SceneFrame>
  );
}
