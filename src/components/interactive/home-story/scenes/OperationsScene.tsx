import { motion, type MotionValue } from 'framer-motion';
import {
  BadgeDollarSign,
  Box,
  ChartNoAxesCombined,
  RotateCw,
  Star,
  type LucideIcon,
} from 'lucide-react';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import CascadeTimeline from '../CascadeTimeline';
import SceneFrame from '../SceneFrame';
import { useStepReveal } from '../story-motion';

function OperationRow({
  progress,
  threshold,
  stepId,
  icon: Icon,
  title,
  detail,
  status,
  premium = false,
}: {
  progress: MotionValue<number>;
  threshold: number;
  stepId: string;
  icon: LucideIcon;
  title: string;
  detail: string;
  status: string;
  premium?: boolean;
}) {
  const reveal = useStepReveal(progress, threshold, 24);

  return (
    <motion.li
      data-story-step={stepId}
      data-story-cascade-stage={title}
      className="relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-1 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:gap-3 sm:py-2"
      style={{ opacity: reveal.opacity, x: reveal.offset }}
    >
      <span
        data-story-cascade-node
        className="relative z-10 grid size-6 place-items-center rounded-full border border-white/12 bg-neutral-900 text-avoqado-green sm:size-7"
      >
        <Icon className="size-3 sm:size-3.5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <b
          data-story-panel-copy
          className="block text-[0.7rem] font-medium leading-tight text-white sm:text-xs"
        >
          {title}
        </b>
        <span
          data-story-panel-copy
          className="mt-0.5 block truncate text-[0.625rem] leading-tight text-neutral-400 sm:text-[0.7rem]"
        >
          {detail}
        </span>
      </span>
      <span
        data-story-panel-copy
        className={premium
          ? 'rounded-full bg-amber-300/12 px-1.5 py-0.5 text-[0.625rem] font-semibold text-amber-200 sm:px-2'
          : 'rounded-full bg-white/6 px-1.5 py-0.5 text-[0.625rem] font-medium text-neutral-300 sm:px-2'}
      >
        {status}
      </span>
    </motion.li>
  );
}

export default function OperationsScene({
  scene,
  progress,
}: {
  scene: StoryScene;
  progress: MotionValue<number>;
}) {
  const rows = [
    {
      icon: ChartNoAxesCombined,
      title: 'Venta registrada',
      detail: `${STORY_FIXTURE.total} · ${STORY_FIXTURE.staff}`,
      status: 'Registrada',
    },
    {
      icon: Box,
      title: 'Inventario',
      detail: `${STORY_FIXTURE.product} −1`,
      status: 'Premium',
      premium: true,
    },
    {
      icon: RotateCw,
      title: 'Reorden sugerido',
      detail: `Stock ${STORY_FIXTURE.stockBefore} → ${STORY_FIXTURE.stockAfter}`,
      status: 'Sugerido',
    },
    {
      icon: Star,
      title: 'CRM y lealtad',
      detail: `${STORY_FIXTURE.customer} +${STORY_FIXTURE.points} puntos`,
      status: `+${STORY_FIXTURE.points}`,
    },
    {
      icon: BadgeDollarSign,
      title: 'Equipo',
      detail: `${STORY_FIXTURE.staff} +${STORY_FIXTURE.commission}`,
      status: `+${STORY_FIXTURE.commission}`,
    },
  ] as const;
  const operationSteps = ['sale', 'inventory', 'reorder', 'crm', 'team'] as const;

  return (
    <SceneFrame
      scene={scene}
      progress={progress}
    >
      <div className="flex h-full items-center justify-center">
        <div
          data-story-panel="operations"
          className="relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-900 p-2.5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-5"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-4">
            <div>
              <p data-story-panel-copy className="text-[0.625rem] text-neutral-400 sm:text-xs">
                Actividad de esta venta
              </p>
              <p
                data-story-panel-copy
                className="mt-0.5 text-sm font-medium text-white sm:mt-1 sm:text-lg"
              >
                {STORY_FIXTURE.total} · ahora
              </p>
              <p data-payment-reference className="mt-1 text-[0.625rem] text-neutral-500">
                Referencia {STORY_FIXTURE.paymentReference}
              </p>
            </div>
            <span
              data-story-panel-copy
              className="rounded-full bg-white/6 px-2 py-1 text-[0.625rem] font-medium text-neutral-300"
            >
              En cascada
            </span>
          </div>
          <CascadeTimeline progress={progress} thresholds={scene.stepThresholds} tone="dark">
            <ol className="relative">
              {rows.map((row, index) => (
                <OperationRow
                  key={row.title}
                  {...row}
                  progress={progress}
                  stepId={operationSteps[index]}
                  threshold={scene.stepThresholds[index]}
                />
              ))}
            </ol>
          </CascadeTimeline>
        </div>
      </div>
    </SceneFrame>
  );
}
