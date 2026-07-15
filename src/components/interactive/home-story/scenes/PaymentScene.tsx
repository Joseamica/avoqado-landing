import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Banknote, Check, CreditCard, Link2, type LucideIcon } from 'lucide-react';
import SceneFrame from '../SceneFrame';
import { STORY_FIXTURE } from '../story-fixture';
import type { StoryScene } from '../story';

interface PaymentReference {
  label: string;
  detail: string;
  icon: LucideIcon;
  active?: boolean;
}

export default function PaymentScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const referencesOpacity = useTransform(progress, [0.06, 0.28], [0.25, 1]);
  const referencesY = useTransform(progress, [0.06, 0.32], [12, 0]);
  const selectorOpacity = useTransform(progress, [0.26, 0.5], [0.18, 1]);
  const selectorY = useTransform(progress, [0.26, 0.54], [18, 0]);
  const selectionOpacity = useTransform(progress, [0.44, 0.66], [0.35, 1]);
  const selectionX = useTransform(progress, [0.44, 0.68], [8, 0]);
  const references: PaymentReference[] = [
    { label: 'TPV', detail: `TPV → ${STORY_FIXTURE.selectedMerchant}`, icon: CreditCard, active: true },
    { label: 'Tienda en línea', detail: 'ecommerce + liga', icon: Link2 },
    { label: 'Efectivo', detail: 'Registro manual', icon: Banknote },
  ];

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`El total es ${STORY_FIXTURE.total}. En una TPV compatible, la Cuenta de cobro se selecciona manualmente entre ${STORY_FIXTURE.selectedMerchant}, elegida, y ${STORY_FIXTURE.alternateMerchant}, disponible. También se registran pagos online y en efectivo.`}
    >
      <div className="story-payment-visual relative grid h-full min-h-0 content-center gap-2.5 sm:grid-cols-[minmax(190px,0.88fr)_minmax(250px,1.12fr)] sm:grid-rows-[minmax(0,1fr)] sm:content-stretch sm:items-center sm:gap-8 lg:grid-cols-[minmax(260px,44fr)_minmax(280px,56fr)] lg:gap-12">
        <motion.div
          className="story-payment-reference-grid grid grid-cols-3 border-y border-white/10 sm:block"
          style={{ opacity: referencesOpacity, y: referencesY }}
        >
          {references.map(({ label, detail, icon: Icon, active }, index) => (
            <div
              key={label}
              data-payment-reference={label.toLowerCase()}
              className={`story-payment-reference-item relative flex min-w-0 flex-col gap-1.5 px-2 py-2.5 sm:grid sm:grid-cols-[2rem_minmax(0,1fr)] sm:items-center sm:gap-3 sm:border-b sm:border-white/8 sm:px-1 sm:py-4 sm:last:border-b-0 lg:grid-cols-[2.25rem_minmax(0,1fr)] lg:py-5 ${index > 0 ? 'border-l border-white/8 sm:border-l-0' : ''} ${active ? 'bg-white/[0.025]' : ''}`}
            >
              <span className={active ? 'grid size-7 place-items-center text-avoqado-green sm:size-8' : 'grid size-7 place-items-center text-neutral-500 sm:size-8'}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className={active ? 'block text-[0.65rem] font-semibold text-neutral-50 sm:text-sm' : 'block text-[0.65rem] font-medium text-neutral-300 sm:text-sm'}>{label}</strong>
                <span
                  data-payment-route-summary={active ? '' : undefined}
                  className={active ? 'story-payment-reference-detail mt-0.5 block text-[0.5rem] leading-tight text-avoqado-green sm:text-xs' : 'story-payment-reference-detail mt-0.5 block text-[0.5rem] leading-tight text-neutral-400 sm:text-xs'}
                >
                  {detail}
                </span>
              </span>
            </div>
          ))}
        </motion.div>
        <p className="story-payment-reference-summary hidden border-y border-white/10 py-2 text-center text-[0.62rem] leading-snug text-neutral-400">
          <span data-payment-route-summary className="block text-avoqado-green">TPV → {STORY_FIXTURE.selectedMerchant}</span>
          <span className="block">Tienda en línea + liga · Efectivo</span>
        </p>

        <motion.div
          data-payment-selector
          className="story-payment-selector relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[1.2rem] border border-white/10 bg-neutral-900 p-2.5 shadow-[0_24px_70px_oklch(0.05_0.003_155_/_0.4)] sm:rounded-[1.55rem] sm:p-3 lg:p-4"
          style={{ opacity: selectorOpacity, y: selectorY }}
        >
          <div className="story-payment-selector-panel rounded-[0.85rem] bg-neutral-50 px-3.5 py-3 text-neutral-950 sm:rounded-[1.15rem] sm:px-4 sm:py-4 lg:px-5 lg:py-5">
            <div className="story-payment-total-row flex items-end justify-between border-b border-black/8 pb-2.5 sm:pb-3.5">
              <div className="story-payment-total-copy">
                <p className="text-[0.58rem] font-medium uppercase tracking-[0.14em] text-neutral-500 sm:text-[0.65rem]">Total</p>
                <p className="story-payment-total-amount mt-0.5 text-[1.8rem] font-light tabular-nums tracking-[-0.05em] sm:text-4xl lg:text-5xl">{STORY_FIXTURE.total}</p>
              </div>
              <span className="pb-1 text-[0.58rem] text-neutral-500 sm:text-[0.65rem]">MXN</span>
            </div>

            <div className="story-payment-account-header mb-2 mt-2.5 flex items-center justify-between sm:mb-3 sm:mt-4">
              <p className="text-sm font-semibold tracking-[-0.02em] sm:text-base lg:text-lg">Cuenta de cobro</p>
              <span className="text-[0.5rem] uppercase tracking-[0.1em] text-neutral-500 sm:text-[0.58rem]">Selección manual</span>
            </div>

            <div className="story-payment-merchant-list space-y-1.5 sm:space-y-2">
              <motion.div
                data-merchant-selected
                className="story-payment-merchant-row relative flex items-center justify-between overflow-hidden rounded-[0.7rem] bg-green-100 px-3 py-2 text-green-950 sm:px-3.5 sm:py-2.5"
                style={{ opacity: selectionOpacity, x: selectionX }}
              >
                <span className="story-payment-merchant-copy">
                  <strong className="story-payment-merchant-name block text-[0.7rem] font-semibold sm:text-sm">{STORY_FIXTURE.selectedMerchant}</strong>
                  <span className="story-payment-merchant-detail mt-0.5 block text-[0.52rem] text-green-900/70 sm:text-[0.62rem]">Merchant habilitado</span>
                </span>
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-green-900 text-green-100 sm:size-7">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              </motion.div>
              <div data-merchant-alternate className="story-payment-merchant-row flex items-center justify-between rounded-[0.7rem] border border-black/10 px-3 py-2 text-neutral-700 sm:px-3.5 sm:py-2.5">
                <span className="story-payment-merchant-copy">
                  <strong className="story-payment-merchant-name block text-[0.7rem] font-medium sm:text-sm">{STORY_FIXTURE.alternateMerchant}</strong>
                  <span className="story-payment-merchant-detail mt-0.5 block text-[0.52rem] text-neutral-500 sm:text-[0.62rem]">Disponible</span>
                </span>
                <span className="size-2 rounded-full border border-neutral-400" />
              </div>
            </div>

            <p className="story-payment-selector-footer mt-2.5 border-t border-black/8 pt-2.5 text-center text-[0.625rem] font-medium text-neutral-600 sm:mt-3.5 sm:pt-3 sm:text-[0.68rem]">
              <span data-payment-compatibility className="story-payment-compatibility inline-block">TPV compatible · selección manual</span>
            </p>
          </div>
        </motion.div>
      </div>
    </SceneFrame>
  );
}
