import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Check, FileCheck2, MailCheck, Star } from 'lucide-react';
import SceneFrame from '../SceneFrame';
import { STORY_FIXTURE } from '../story-fixture';
import type { StoryScene } from '../story';

const qrCells = [
  1, 1, 1, 0, 1,
  1, 0, 1, 1, 0,
  1, 1, 1, 0, 1,
  0, 1, 0, 1, 1,
  1, 0, 1, 1, 1,
] as const;

export default function AftercareScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const receiptOpacity = useTransform(progress, [0.06, 0.28], [0.3, 1]);
  const receiptY = useTransform(progress, [0.06, 0.32], [18, 0]);
  const outcomesOpacity = useTransform(progress, [0.28, 0.52], [0.2, 1]);
  const outcomesX = useTransform(progress, [0.28, 0.58], [18, 0]);
  const branchLength = useTransform(progress, [0.3, 0.76], [0, 1]);
  const endpointOpacity = useTransform(progress, [0.5, 0.72], [0, 1]);
  const desktopPulseX = useTransform(progress, [0, 0.16, 0.38, 0.7, 0.84, 1], [0, 24, 240, 500, 24, 0]);
  const desktopPulseY = useTransform(progress, [0, 0.16, 0.38, 0.7, 0.84, 1], [0, 0, 0, 92, 0, 0]);
  const mobilePulseY = useTransform(progress, [0, 0.16, 0.4, 0.72, 0.86, 1], [0, 18, 116, 232, 18, 0]);
  const pulseScale = useTransform(progress, [0.34, 0.46, 0.58], [0.94, 1.08, 1]);

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`El recibo de ${STORY_FIXTURE.customer} por ${STORY_FIXTURE.total} se envía y permite compartir una reseña en Google. Si la sucursal tiene facturación configurada, el cliente captura sus datos y recibe su CFDI desde el recibo.`}
    >
      <div className="story-aftercare-visual relative grid h-full min-h-0 grid-rows-[minmax(100px,0.82fr)_minmax(0,1.18fr)] content-center gap-2.5 sm:grid-cols-[38fr_62fr] sm:grid-rows-1 sm:items-center sm:gap-8 lg:gap-12">
        <motion.div
          className="story-aftercare-receipt relative mx-auto flex h-full max-h-[190px] w-full max-w-[280px] flex-col bg-white px-4 py-3 text-neutral-950 shadow-[0_24px_70px_oklch(0.13_0.005_155_/_0.15)] sm:max-h-[390px] sm:min-h-[300px] sm:px-6 sm:py-6 lg:min-h-[350px] lg:px-7 lg:py-7"
          style={{ opacity: receiptOpacity, y: receiptY }}
        >
          <div className="flex items-start justify-between border-b border-dashed border-black/15 pb-2 sm:pb-4">
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-neutral-400 sm:text-xs">Recibo digital</p>
              <p className="mt-0.5 text-[0.62rem] text-neutral-600 sm:mt-1 sm:text-xs">{STORY_FIXTURE.organization}</p>
            </div>
            <span className="text-[0.55rem] text-neutral-400 sm:text-xs">{STORY_FIXTURE.venue}</span>
          </div>
          <div className="flex flex-1 items-center justify-between gap-4 py-2 sm:block sm:py-5">
            <div>
              <p className="text-[0.64rem] text-neutral-500 sm:text-sm">{STORY_FIXTURE.service}</p>
              <p className="mt-0.5 text-[0.58rem] text-neutral-400 sm:mt-1 sm:text-xs">{STORY_FIXTURE.customer}</p>
            </div>
            <p className="text-2xl font-light tabular-nums tracking-[-0.05em] sm:mt-5 sm:text-5xl">{STORY_FIXTURE.total}</p>
          </div>
          <div className="hidden border-y border-dashed border-black/15 py-3 text-xs text-neutral-500 sm:block">
            <p className="flex justify-between"><span>Subtotal</span><span>{STORY_FIXTURE.subtotal}</span></p>
            <p className="mt-1.5 flex justify-between"><span>Propina</span><span>{STORY_FIXTURE.tip}</span></p>
          </div>
          <p className="story-aftercare-receipt-status mt-auto flex items-center gap-2 pt-2 text-[0.6rem] font-medium text-green-800 sm:pt-4 sm:text-xs">
            <MailCheck className="size-3.5" aria-hidden="true" />
            Enviado a {STORY_FIXTURE.customer}
          </p>
          <span className="absolute -right-1 top-1/2 size-2 rounded-full border border-avoqado-green/30 bg-avoqado-green" />
        </motion.div>

        <motion.div className="story-aftercare-outcomes relative grid min-h-0 gap-2 sm:gap-3" style={{ opacity: outcomesOpacity, x: outcomesX }}>
          <div className="flex items-center justify-between border-b border-black/10 px-2 py-1.5 sm:px-3 sm:py-3">
            <span className="flex items-center gap-2 text-xs font-medium text-green-900 sm:text-sm">
              <span className="grid size-5 place-items-center rounded-full bg-green-100 sm:size-6"><Check className="size-3" aria-hidden="true" /></span>
              Recibo enviado
            </span>
            <span className="text-xs text-neutral-500">{STORY_FIXTURE.customer}</span>
          </div>

          <div className="story-aftercare-review border border-black/8 bg-white px-3 py-2.5 sm:px-4 sm:py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="story-aftercare-review-question text-xs text-neutral-500">¿Cómo fue tu experiencia?</p>
                <p className="mt-1 text-xs font-semibold text-neutral-900 sm:text-sm">Comparte tu reseña en Google</p>
              </div>
              <div className="flex shrink-0 gap-0.5 text-amber-500">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-3.5 fill-current sm:size-4" aria-hidden="true" />)}
              </div>
            </div>
          </div>

          <div className="story-aftercare-invoice grid grid-cols-[3.4rem_minmax(0,1fr)] items-center gap-3 bg-neutral-950 px-3 py-2.5 text-neutral-50 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4 sm:px-4 sm:py-4">
            <div className="grid aspect-square grid-cols-5 gap-0.5 bg-neutral-50 p-1.5 sm:p-2" aria-hidden="true">
              {qrCells.map((filled, index) => <span key={index} className={filled ? 'bg-neutral-950' : 'bg-neutral-50'} />)}
            </div>
            <div className="min-w-0">
              <div className="story-aftercare-invoice-header flex flex-wrap items-center gap-2">
                <FileCheck2 className="size-3.5 shrink-0 text-avoqado-green sm:size-4" aria-hidden="true" />
                <p className="story-aftercare-invoice-title text-xs font-semibold sm:text-sm">Factúrate desde tu recibo</p>
                <span className="story-aftercare-premium rounded-full bg-amber-300/12 px-2 py-0.5 text-xs font-medium text-amber-200">Premium</span>
              </div>
              <p className="mt-1.5 text-xs leading-snug text-neutral-400">Tu cliente captura sus datos y recibe su CFDI.</p>
            </div>
          </div>
        </motion.div>

        <svg className="pointer-events-none absolute inset-0 hidden size-full sm:block" viewBox="0 0 760 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 0 260 H 278 M 278 260 H 350 V 126 H 510 M 350 260 H 548 M 350 260 V 392 H 510" fill="none" stroke="oklch(0.48 0.006 155 / 0.3)" strokeWidth="1" />
          <motion.path d="M 0 260 H 278" fill="none" stroke="var(--color-avoqado-green)" strokeOpacity="0.58" strokeWidth="1" style={{ pathLength: branchLength }} />
          <motion.path d="M 278 260 H 332 V 126 H 382 M 332 260 H 410 M 332 260 V 392 H 382" fill="none" stroke="var(--color-avoqado-green)" strokeOpacity="0.48" strokeWidth="1" style={{ pathLength: branchLength }} />
        </svg>
        <motion.span className="pointer-events-none absolute right-[29%] top-[24%] hidden size-1.5 rounded-full bg-avoqado-green sm:block" style={{ opacity: endpointOpacity }} />
        <motion.span className="pointer-events-none absolute right-[25%] top-1/2 hidden size-1.5 rounded-full bg-avoqado-green sm:block" style={{ opacity: endpointOpacity }} />
        <motion.span className="pointer-events-none absolute right-[29%] top-[76%] hidden size-1.5 rounded-full bg-avoqado-green sm:block" style={{ opacity: endpointOpacity }} />
        <motion.span
          className="pointer-events-none absolute left-0 top-1/2 z-20 hidden size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green sm:block"
          style={{ x: desktopPulseX, y: desktopPulseY, scale: pulseScale }}
        />
        <div className="pointer-events-none absolute left-2 top-0 h-full w-px bg-black/10 sm:hidden" />
        <motion.span
          className="pointer-events-none absolute left-[0.22rem] top-0 z-20 size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green sm:hidden"
          style={{ y: mobilePulseY, scale: pulseScale }}
        />
      </div>
    </SceneFrame>
  );
}
