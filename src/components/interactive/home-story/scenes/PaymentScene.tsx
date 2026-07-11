import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Banknote, Check, CreditCard, Link2, type LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const visualRef = useRef<HTMLDivElement>(null);
  const selectedMerchantRef = useRef<HTMLDivElement>(null);
  const [mobileMerchantOffset, setMobileMerchantOffset] = useState(0);
  const selectorOpacity = useTransform(progress, [0.08, 0.32], [0.2, 1]);
  const selectorY = useTransform(progress, [0.08, 0.4], [22, 0]);
  const referenceOpacity = useTransform(progress, [0.18, 0.42], [0.72, 1]);
  const pathLength = useTransform(progress, [0.14, 0.68], [0, 1]);
  const desktopPulseX = useTransform(progress, [0, 0.16, 0.48, 0.8, 1], [0, 26, 265, 26, 0]);
  const desktopPulseY = useTransform(progress, [0, 0.16, 0.48, 0.8, 1], [0, -44, 28, -44, 0]);
  const mobilePulseX = useTransform(progress, [0, 0.12, 0.22, 0.78, 0.9, 1], [0, 16, 188, 188, 16, 0]);
  const mobilePulseY = useTransform(progress, [0, 0.12, 0.22, 0.78, 0.9, 1], [0, 0, mobileMerchantOffset, mobileMerchantOffset, 0, 0]);
  const pulseScale = useTransform(progress, [0.4, 0.52, 0.64], [0.94, 1.08, 1]);
  const references: PaymentReference[] = [
    { label: 'TPV', detail: 'Cuenta seleccionada', icon: CreditCard, active: true },
    { label: 'Online', detail: 'ecommerce + liga', icon: Link2 },
    { label: 'Efectivo', detail: 'Registro manual', icon: Banknote },
  ];

  useEffect(() => {
    const measureMerchantOffset = () => {
      const visual = visualRef.current;
      const selectedMerchant = selectedMerchantRef.current;
      if (!visual || !selectedMerchant) return;
      let center = selectedMerchant.offsetTop + selectedMerchant.offsetHeight / 2;
      let offsetParent = selectedMerchant.offsetParent as HTMLElement | null;
      while (offsetParent && offsetParent !== visual) {
        center += offsetParent.offsetTop;
        offsetParent = offsetParent.offsetParent as HTMLElement | null;
      }
      setMobileMerchantOffset(center - visual.clientHeight / 2);
    };

    measureMerchantOffset();
    const observer = new ResizeObserver(measureMerchantOffset);
    if (visualRef.current) observer.observe(visualRef.current);
    if (selectedMerchantRef.current) observer.observe(selectedMerchantRef.current);
    window.addEventListener('resize', measureMerchantOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measureMerchantOffset);
    };
  }, []);

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`El total es ${STORY_FIXTURE.total}. En una TPV compatible, la Cuenta de cobro se selecciona manualmente entre ${STORY_FIXTURE.selectedMerchant}, elegida, y ${STORY_FIXTURE.alternateMerchant}, disponible. También se registran pagos online y en efectivo.`}
    >
      <div ref={visualRef} className="story-payment-visual relative grid h-full min-h-0 content-center gap-2.5 sm:grid-cols-[minmax(250px,0.88fr)_minmax(190px,1.12fr)] sm:items-center sm:gap-8 lg:grid-cols-[minmax(280px,44fr)_minmax(260px,56fr)] lg:gap-12">
        <motion.div
          className="relative mx-auto w-full max-w-[360px] overflow-hidden rounded-[1.2rem] border border-white/10 bg-neutral-900 p-2.5 shadow-[0_24px_70px_oklch(0.05_0.003_155_/_0.4)] sm:rounded-[1.55rem] sm:p-3 lg:p-4"
          style={{ opacity: selectorOpacity, y: selectorY }}
        >
          <div className="rounded-[0.85rem] bg-neutral-50 px-3.5 py-3 text-neutral-950 sm:rounded-[1.15rem] sm:px-4 sm:py-4 lg:px-5 lg:py-5">
            <div className="flex items-end justify-between border-b border-black/8 pb-2.5 sm:pb-3.5">
              <div>
                <p className="text-[0.58rem] font-medium uppercase tracking-[0.14em] text-neutral-500 sm:text-[0.65rem]">Total</p>
                <p className="mt-0.5 text-[1.8rem] font-light tabular-nums tracking-[-0.05em] sm:text-4xl lg:text-5xl">{STORY_FIXTURE.total}</p>
              </div>
              <span className="pb-1 text-[0.58rem] text-neutral-500 sm:text-[0.65rem]">MXN</span>
            </div>

            <div className="mb-2 mt-2.5 flex items-center justify-between sm:mb-3 sm:mt-4">
              <p className="text-sm font-semibold tracking-[-0.02em] sm:text-base lg:text-lg">Cuenta de cobro</p>
              <span className="text-[0.5rem] uppercase tracking-[0.1em] text-neutral-500 sm:text-[0.58rem]">Selección manual</span>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <div ref={selectedMerchantRef} data-merchant-selected className="flex items-center justify-between rounded-[0.7rem] bg-green-100 px-3 py-2 text-green-950 sm:px-3.5 sm:py-2.5">
                <span>
                  <strong className="block text-[0.7rem] font-semibold sm:text-sm">{STORY_FIXTURE.selectedMerchant}</strong>
                  <span className="story-payment-merchant-detail mt-0.5 block text-[0.52rem] text-green-900/70 sm:text-[0.62rem]">Merchant habilitado</span>
                </span>
                <span className="grid size-6 place-items-center rounded-full bg-green-900 text-green-100 sm:size-7">
                  <Check className="size-3.5" aria-hidden="true" />
                </span>
              </div>
              <div data-merchant-alternate className="flex items-center justify-between rounded-[0.7rem] border border-black/10 px-3 py-2 text-neutral-700 sm:px-3.5 sm:py-2.5">
                <span>
                  <strong className="block text-[0.7rem] font-medium sm:text-sm">{STORY_FIXTURE.alternateMerchant}</strong>
                  <span className="story-payment-merchant-detail mt-0.5 block text-[0.52rem] text-neutral-500 sm:text-[0.62rem]">Disponible</span>
                </span>
                <span className="size-2 rounded-full border border-neutral-400" />
              </div>
            </div>

            <p className="mt-2.5 border-t border-black/8 pt-2.5 text-center text-[0.625rem] font-medium text-neutral-600 sm:mt-3.5 sm:pt-3 sm:text-[0.68rem]">
              <span data-payment-compatibility className="story-payment-compatibility inline-block">TPV compatible · selección manual</span>
            </p>
          </div>
        </motion.div>

        <motion.div className="story-payment-reference-grid grid grid-cols-3 border-y border-white/10 sm:block" style={{ opacity: referenceOpacity }}>
          {references.map(({ label, detail, icon: Icon, active }, index) => (
            <div
              key={label}
              data-payment-reference={label.toLowerCase()}
              className={`relative flex min-w-0 flex-col gap-1.5 px-2 py-2.5 sm:grid sm:grid-cols-[2rem_minmax(0,1fr)_3.5rem] sm:items-center sm:gap-3 sm:border-b sm:border-white/8 sm:px-1 sm:py-4 sm:last:border-b-0 lg:grid-cols-[2.25rem_minmax(0,1fr)_5rem] lg:py-5 ${index > 0 ? 'border-l border-white/8 sm:border-l-0' : ''}`}
            >
              <span className={active ? 'grid size-7 place-items-center text-avoqado-green sm:size-8' : 'grid size-7 place-items-center text-neutral-500 sm:size-8'}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <strong className={active ? 'block text-[0.65rem] font-semibold text-neutral-50 sm:text-sm' : 'block text-[0.65rem] font-medium text-neutral-300 sm:text-sm'}>{label}</strong>
                <span className="story-payment-reference-detail mt-0.5 block text-[0.5rem] leading-tight text-neutral-400 sm:text-xs">{detail}</span>
              </span>
              <span className={active ? 'hidden h-px origin-left bg-avoqado-green sm:block' : 'hidden h-px bg-white/10 sm:block'} />
            </div>
          ))}
        </motion.div>
        <p className="story-payment-reference-summary hidden border-y border-white/10 py-2 text-center text-[0.62rem] leading-snug text-neutral-400">
          TPV compatible · selección manual · Online (ecommerce + liga) · Efectivo
        </p>

        <svg className="pointer-events-none absolute inset-0 hidden size-full sm:block" viewBox="0 0 760 520" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 0 260 H 38 V 216 H 290" fill="none" stroke="oklch(0.38 0.006 155 / 0.32)" strokeWidth="1" />
          <motion.path d="M 0 260 H 38 V 216 H 290" fill="none" stroke="var(--color-avoqado-green)" strokeWidth="1" style={{ pathLength }} />
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
