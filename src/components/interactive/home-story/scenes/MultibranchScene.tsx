import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Building2, ChevronDown, MapPin, Store } from 'lucide-react';
import SceneFrame from '../SceneFrame';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import { smoothstep, stepWindow, useStepReveal } from '../story-motion';

function BranchNode({
  progress,
  threshold,
  stepId,
  name,
  revenue,
}: {
  progress: MotionValue<number>;
  threshold: number;
  stepId: string;
  name: string;
  revenue: string;
}) {
  const reveal = useStepReveal(progress, threshold);

  return (
    <motion.div
      data-story-step={stepId}
      className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-0.5 rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center sm:gap-2 sm:rounded-xl sm:px-3 sm:py-2"
      style={{ opacity: reveal.opacity, y: reveal.offset }}
    >
      <span className="flex min-w-0 items-center gap-1.5 text-white sm:gap-2">
        <Store className="hidden size-3 shrink-0 text-avoqado-green min-[360px]:block sm:size-3.5" aria-hidden="true" />
        <span data-story-panel-copy className="truncate text-[0.625rem] leading-tight sm:text-xs">
          {name}
        </span>
      </span>
      <span data-story-panel-copy className="text-[0.625rem] leading-tight text-neutral-500 sm:text-[0.7rem]">
        {revenue}
      </span>
    </motion.div>
  );
}

export default function MultibranchScene({
  scene,
  progress,
}: {
  scene: StoryScene;
  progress: MotionValue<number>;
}) {
  const [centerAt, romaAt, northAt, dashboardAt, northSelectorAt] = scene.stepThresholds;
  const dashboardWindow = stepWindow(dashboardAt);
  const northSelectorWindow = stepWindow(northSelectorAt);
  const hierarchyOpacity = useTransform(progress, [0, dashboardWindow[0], dashboardWindow[1]], [1, 1, 0], { ease: smoothstep });
  const hierarchyScale = useTransform(progress, dashboardWindow, [1, 0.88], { ease: smoothstep });
  const dashboardOpacity = useTransform(progress, dashboardWindow, [0, 1], { ease: smoothstep });
  const dashboardY = useTransform(progress, dashboardWindow, [6, 0], { ease: smoothstep });
  const organizationTicketOpacity = useTransform(progress, northSelectorWindow, [1, 0], { ease: smoothstep });
  const northTicketOpacity = useTransform(progress, northSelectorWindow, [0, 1], { ease: smoothstep });
  const northSelection = useStepReveal(progress, northSelectorAt);
  const branchSteps = ['center', 'roma', 'north', 'dashboard', 'north-selector'] as const;
  const kpis = [
    ['Ingresos', '$60,050'],
    ['Ventas', '312'],
    ['Ticket', STORY_FIXTURE.organizationTicket],
    ['Pagos', '298'],
  ] as const;

  return (
    <SceneFrame
      scene={scene}
      progress={progress}
    >
      <div className="relative h-full min-h-0">
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: hierarchyOpacity, scale: hierarchyScale }}
        >
          <div
            data-story-panel="multibranch-hierarchy"
            className="w-full max-w-2xl overflow-hidden rounded-[1.25rem] border border-white/10 bg-neutral-900 p-2.5 shadow-2xl shadow-black/35 sm:rounded-[1.75rem] lg:p-5"
          >
            <p data-story-panel-copy className="text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-neutral-500">
              Organización → Zonas → Sucursales
            </p>
            <div className="mt-2 flex items-center gap-2 rounded-xl bg-avoqado-green px-2.5 py-2 text-neutral-950 sm:gap-3 sm:rounded-2xl lg:mt-4 lg:p-4">
              <Building2 className="size-4 shrink-0 sm:size-5" aria-hidden="true" />
              <div className="min-w-0">
                <p data-story-panel-copy className="text-[0.625rem] leading-tight opacity-65 sm:text-xs">Organización</p>
                <p data-story-panel-copy className="truncate text-xs font-semibold sm:text-base">{STORY_FIXTURE.organization}</p>
              </div>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 lg:mt-4 lg:gap-4">
              <div className="min-w-0 rounded-xl border border-white/8 p-2 sm:rounded-2xl sm:p-3">
                <p data-story-panel-copy className="mb-1.5 flex items-center gap-1.5 truncate text-[0.625rem] font-medium text-neutral-300 sm:mb-3 sm:gap-2 sm:text-xs">
                  <MapPin className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
                  Zona Centro
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  <BranchNode progress={progress} threshold={centerAt} stepId={branchSteps[0]} name={STORY_FIXTURE.venue} revenue="$24,850" />
                  <BranchNode progress={progress} threshold={romaAt} stepId={branchSteps[1]} name="Sucursal Roma" revenue="$18,420" />
                </div>
              </div>
              <div className="min-w-0 rounded-xl border border-white/8 p-2 sm:rounded-2xl sm:p-3">
                <p data-story-panel-copy className="mb-1.5 flex items-center gap-1.5 truncate text-[0.625rem] font-medium text-neutral-300 sm:mb-3 sm:gap-2 sm:text-xs">
                  <MapPin className="size-3 shrink-0 sm:size-3.5" aria-hidden="true" />
                  Zona Norte
                </p>
                <BranchNode progress={progress} threshold={northAt} stepId={branchSteps[2]} name={STORY_FIXTURE.comparisonVenue} revenue="$16,780" />
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          data-story-step={branchSteps[3]}
          className="absolute inset-0 flex items-center justify-center"
          style={{ opacity: dashboardOpacity, y: dashboardY }}
        >
          <div
            data-story-panel="multibranch-dashboard"
            className="w-full max-w-3xl overflow-hidden rounded-[1.25rem] border border-white/10 bg-neutral-900 p-2.5 shadow-2xl shadow-black/35 sm:rounded-[1.75rem] lg:p-5"
          >
            <div className="grid grid-cols-[minmax(0,1fr)_7.25rem] items-center gap-2 border-b border-white/8 pb-2 sm:grid-cols-[minmax(0,1fr)_10rem] sm:gap-4 lg:pb-4">
              <div className="min-w-0">
                <p data-story-panel-copy className="truncate text-[0.625rem] uppercase tracking-[0.14em] text-neutral-500">
                  Dashboard web consolidado
                </p>
                <p data-story-panel-copy className="mt-0.5 truncate text-xs font-medium text-white sm:mt-1 sm:text-base">
                  {STORY_FIXTURE.organization}
                </p>
              </div>
              <div className="grid h-8 min-w-0 grid-cols-[minmax(0,1fr)_0.75rem] items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 text-[0.625rem] text-white sm:h-9 sm:px-4 sm:text-xs">
                <span className="relative block min-w-0">
                  <motion.span data-story-panel-copy className="block truncate" style={{ opacity: organizationTicketOpacity }}>
                    {STORY_FIXTURE.venue}
                  </motion.span>
                  <motion.span data-story-panel-copy className="absolute inset-0 block truncate" style={{ opacity: northTicketOpacity }}>
                    {STORY_FIXTURE.comparisonVenue}
                  </motion.span>
                </span>
                <ChevronDown className="size-3" aria-hidden="true" />
              </div>
            </div>

            <motion.div
              data-story-step={branchSteps[4]}
              className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-lg border border-avoqado-green/20 bg-avoqado-green/8 px-2.5 py-2 sm:rounded-xl lg:mt-4 lg:px-3 lg:py-2.5"
              style={{ opacity: northSelection.opacity, y: northSelection.offset }}
            >
              <p data-branch-breadcrumb data-story-panel-copy className="truncate text-[0.625rem] font-medium text-neutral-200 sm:text-xs">
                {STORY_FIXTURE.organization} → {STORY_FIXTURE.comparisonVenue}
              </p>
              <p data-branch-ticket data-story-panel-copy className="shrink-0 text-[0.625rem] font-semibold text-avoqado-green sm:text-xs">
                Ticket {STORY_FIXTURE.comparisonVenueTicket} · {STORY_FIXTURE.comparisonVenueTicketChange}
              </p>
            </motion.div>

            <div className="mt-2 grid grid-cols-4 gap-1.5 lg:mt-5 lg:gap-3">
              {kpis.map(([label, value]) => (
                <div key={label} className="min-w-0 rounded-lg bg-white/5 p-1.5 sm:rounded-2xl lg:p-3">
                  <p data-story-panel-copy className="truncate text-[0.625rem] leading-tight text-neutral-500">{label}</p>
                  {label === 'Ticket' ? (
                    <p data-story-panel-copy className="relative mt-1 truncate text-[0.7rem] font-medium leading-none text-white min-[360px]:text-sm lg:text-lg">
                      <motion.span className="block" style={{ opacity: organizationTicketOpacity }}>{value}</motion.span>
                      <motion.span className="absolute inset-0 block" style={{ opacity: northTicketOpacity }}>{STORY_FIXTURE.comparisonVenueTicket}</motion.span>
                    </p>
                  ) : (
                    <p data-story-panel-copy className="mt-1 truncate text-[0.7rem] font-medium leading-none text-white min-[360px]:text-sm lg:text-lg">{value}</p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-2 grid grid-cols-3 gap-1.5 lg:mt-4 lg:gap-2">
              {[
                ['1', STORY_FIXTURE.venue.replace('Sucursal ', '')],
                ['2', 'Roma'],
                ['3', STORY_FIXTURE.comparisonVenue.replace('Sucursal ', '')],
              ].map(([index, branch]) => (
                <div key={branch} className="min-w-0 rounded-lg border border-white/8 px-1.5 py-2 text-center sm:rounded-xl sm:px-3 sm:text-left lg:py-3">
                  <span data-story-panel-copy className="block truncate text-[0.625rem] leading-tight text-neutral-300 sm:text-xs">
                    {index} · {branch}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/8 pt-2 lg:mt-5 lg:pt-4">
              <span data-story-panel-copy className="text-[0.625rem] leading-tight text-neutral-400 sm:text-[0.7rem]">
                Cambia de sucursal sin cerrar sesión
              </span>
              <span data-story-panel-copy className="hidden shrink-0 rounded-full bg-white/6 px-2 py-1 text-[0.625rem] font-medium text-neutral-300 min-[360px]:inline-flex">
                Dashboard web
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </SceneFrame>
  );
}
