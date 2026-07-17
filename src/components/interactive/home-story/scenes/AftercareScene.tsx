import { motion, type MotionValue } from 'framer-motion';
import { FileCheck2, MailCheck, Star } from 'lucide-react';
import SceneFrame from '../SceneFrame';
import { useStepReveal } from '../story-motion';
import { STORY_FIXTURE } from '../story-fixture';
import type { StoryScene } from '../story';

export default function AftercareScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const [receiptAt, reviewAt, invoiceAt] = scene.stepThresholds;
  const receipt = useStepReveal(progress, receiptAt);
  const review = useStepReveal(progress, reviewAt);
  const invoice = useStepReveal(progress, invoiceAt);

  return (
    <SceneFrame
      scene={scene}
      progress={progress}
    >
      <div className="story-aftercare-visual relative grid h-full min-h-0 grid-rows-[minmax(100px,0.82fr)_minmax(0,1.18fr)] content-center gap-2.5 sm:grid-cols-[38fr_62fr] sm:grid-rows-1 sm:items-center sm:gap-8 lg:gap-12">
        <motion.div
          data-story-step="receipt"
          className="story-aftercare-receipt relative mx-auto flex h-full max-h-[190px] w-full max-w-[280px] flex-col bg-white px-4 py-3 text-neutral-950 shadow-[0_24px_70px_oklch(0.13_0.005_155_/_0.15)] sm:max-h-[390px] sm:px-6 sm:py-6 lg:px-7 lg:py-7"
          style={{ opacity: receipt.opacity, y: receipt.offset }}
        >
          <div className="story-aftercare-receipt-header flex items-start justify-between border-b border-dashed border-black/15 pb-2 sm:pb-4">
            <div>
              <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-neutral-400 sm:text-xs">Recibo digital</p>
              <p className="mt-0.5 text-[0.62rem] text-neutral-600 sm:mt-1 sm:text-xs">{STORY_FIXTURE.organization}</p>
            </div>
            <span className="text-[0.55rem] text-neutral-400 sm:text-xs">{STORY_FIXTURE.venue}</span>
          </div>
          <p data-payment-reference className="mt-1 text-[0.55rem] text-neutral-400 sm:text-xs">
            Referencia {STORY_FIXTURE.paymentReference}
          </p>
          <div className="story-aftercare-receipt-service flex flex-1 items-center justify-between gap-4 py-2 sm:block sm:py-5">
            <div>
              <p className="text-[0.64rem] text-neutral-500 sm:text-sm">{STORY_FIXTURE.service}</p>
              <p className="mt-0.5 text-[0.58rem] text-neutral-400 sm:mt-1 sm:text-xs">{STORY_FIXTURE.customer}</p>
            </div>
            <p className="story-aftercare-receipt-total text-2xl font-light tabular-nums tracking-[-0.05em] sm:mt-5 sm:text-5xl">{STORY_FIXTURE.total}</p>
          </div>
          <div className="story-aftercare-receipt-details hidden border-y border-dashed border-black/15 py-3 text-xs text-neutral-500 sm:block">
            <p className="flex justify-between"><span>Subtotal</span><span>{STORY_FIXTURE.subtotal}</span></p>
            <p className="mt-1.5 flex justify-between"><span>Propina</span><span>{STORY_FIXTURE.tip}</span></p>
          </div>
          <p className="story-aftercare-receipt-status mt-auto flex items-center gap-2 pt-2 text-[0.6rem] font-medium text-green-800 sm:pt-4 sm:text-xs">
            <MailCheck className="size-3.5" aria-hidden="true" />
            Enviado a {STORY_FIXTURE.customer}
          </p>
        </motion.div>

        <div className="story-aftercare-outcomes relative grid min-h-0 gap-2 sm:gap-3">
          <motion.div
            className="story-aftercare-context border-b border-black/10 px-2 py-1.5 sm:px-3 sm:py-3"
            style={{ opacity: receipt.opacity, y: receipt.offset }}
          >
            <p className="text-[0.58rem] font-semibold uppercase tracking-[0.16em] text-green-800 sm:text-xs">Desde este recibo</p>
            <p className="story-aftercare-context-copy mt-0.5 text-xs text-neutral-500 sm:mt-1 sm:text-sm">La experiencia continúa.</p>
          </motion.div>

          <motion.div
            data-story-step="review"
            className="story-aftercare-review border border-black/8 bg-white px-3 py-2.5 sm:px-4 sm:py-4"
            style={{ opacity: review.opacity, y: review.offset }}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="story-aftercare-review-question text-xs text-neutral-500">¿Cómo fue tu experiencia?</p>
                <p className="mt-1 text-xs font-semibold text-neutral-900 sm:text-sm">Reseña en Google</p>
              </div>
              <div className="flex shrink-0 gap-0.5 text-amber-500">
                {Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-3.5 fill-current sm:size-4" aria-hidden="true" />)}
              </div>
            </div>
          </motion.div>

          <motion.div
            data-story-step="invoice"
            className="story-aftercare-invoice flex items-center gap-3 bg-neutral-950 px-3 py-2.5 text-neutral-50 sm:gap-4 sm:px-4 sm:py-4"
            style={{ opacity: invoice.opacity, y: invoice.offset }}
          >
            <div className="story-aftercare-invoice-icon grid size-9 shrink-0 place-items-center border border-avoqado-green/25 bg-avoqado-green/10 sm:size-11" aria-hidden="true">
              <FileCheck2 className="size-4 text-avoqado-green sm:size-5" />
            </div>
            <div className="min-w-0">
              <div className="story-aftercare-invoice-header flex flex-wrap items-center gap-2">
                <p className="story-aftercare-invoice-title text-xs font-semibold sm:text-sm">Factúrate desde tu recibo</p>
                <span className="story-aftercare-premium rounded-full bg-amber-300/12 px-2 py-0.5 text-xs font-medium text-amber-200">Premium</span>
              </div>
              <p data-story-panel-copy className="mt-1 text-[0.625rem] text-neutral-500 sm:text-xs">
                Disponible cuando tu sucursal la configura.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </SceneFrame>
  );
}
