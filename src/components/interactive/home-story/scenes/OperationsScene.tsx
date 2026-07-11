import { motion, useTransform, type MotionValue } from 'framer-motion';
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

function OperationRow({
  progress,
  start,
  icon: Icon,
  title,
  detail,
  status,
  premium = false,
}: {
  progress: MotionValue<number>;
  start: number;
  icon: LucideIcon;
  title: string;
  detail: string;
  status: string;
  premium?: boolean;
}) {
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  const x = useTransform(progress, [start, start + 0.18], [24, 0]);

  return (
    <motion.li
      data-story-cascade-stage={title}
      className="relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-1 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:gap-3 sm:py-2"
      style={{ opacity, x }}
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
      start: 0.08,
      icon: ChartNoAxesCombined,
      title: 'Venta registrada',
      detail: `${STORY_FIXTURE.total} · ${STORY_FIXTURE.staff}`,
      status: 'Registrada',
    },
    {
      start: 0.22,
      icon: Box,
      title: 'Inventario',
      detail: `${STORY_FIXTURE.product} −1`,
      status: 'Premium',
      premium: true,
    },
    {
      start: 0.36,
      icon: RotateCw,
      title: 'Reorden sugerido',
      detail: `Stock ${STORY_FIXTURE.stockBefore} → ${STORY_FIXTURE.stockAfter}`,
      status: 'Sugerido',
    },
    {
      start: 0.50,
      icon: Star,
      title: 'CRM y lealtad',
      detail: `${STORY_FIXTURE.customer} +${STORY_FIXTURE.points} puntos`,
      status: `+${STORY_FIXTURE.points}`,
    },
    {
      start: 0.64,
      icon: BadgeDollarSign,
      title: 'Equipo',
      detail: `${STORY_FIXTURE.staff} +${STORY_FIXTURE.commission}`,
      status: `+${STORY_FIXTURE.commission}`,
    },
  ] as const;

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`La venta de ${STORY_FIXTURE.total} atendida por ${STORY_FIXTURE.staff} descuenta una unidad de ${STORY_FIXTURE.product}, cambia el stock de ${STORY_FIXTURE.stockBefore} a ${STORY_FIXTURE.stockAfter}, sugiere reorden, suma ${STORY_FIXTURE.points} puntos a ${STORY_FIXTURE.customer} y registra una comisión de ${STORY_FIXTURE.commission}.`}
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
            </div>
            <span
              data-story-panel-copy
              className="rounded-full bg-white/6 px-2 py-1 text-[0.625rem] font-medium text-neutral-300"
            >
              En cascada
            </span>
          </div>
          <CascadeTimeline progress={progress} tone="dark">
            <ol className="relative">
              {rows.map(row => (
                <OperationRow key={row.title} progress={progress} {...row} />
              ))}
            </ol>
          </CascadeTimeline>
        </div>
      </div>
    </SceneFrame>
  );
}
