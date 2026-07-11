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
import SceneFrame from '../SceneFrame';

function OperationRow({
  progress,
  start,
  icon: Icon,
  title,
  detail,
  premium = false,
}: {
  progress: MotionValue<number>;
  start: number;
  icon: LucideIcon;
  title: string;
  detail: string;
  premium?: boolean;
}) {
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  const x = useTransform(progress, [start, start + 0.18], [24, 0]);

  return (
    <motion.li
      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 border-b border-white/8 py-1.5 sm:gap-3 sm:py-4"
      style={{ opacity, x }}
    >
      <span className="grid size-7 place-items-center rounded-full bg-white/6 text-avoqado-green sm:size-9">
        <Icon className="size-3.5 sm:size-4" aria-hidden="true" />
      </span>
      <span>
        <b className="block text-[0.68rem] font-medium leading-tight text-white sm:text-sm">
          {title}
        </b>
        <span className="block text-[0.6rem] leading-tight text-neutral-400 sm:text-xs">
          {detail}
        </span>
      </span>
      {premium ? (
        <span className="rounded-full bg-amber-300/12 px-1.5 py-0.5 text-[8px] font-semibold text-amber-200 sm:px-2 sm:py-1 sm:text-[10px]">
          Premium
        </span>
      ) : null}
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
    },
    {
      start: 0.22,
      icon: Box,
      title: 'Inventario',
      detail: `${STORY_FIXTURE.product} −1`,
      premium: true,
    },
    {
      start: 0.36,
      icon: RotateCw,
      title: 'Reorden sugerido',
      detail: `Stock ${STORY_FIXTURE.stockBefore} → ${STORY_FIXTURE.stockAfter}`,
    },
    {
      start: 0.50,
      icon: Star,
      title: 'CRM y lealtad',
      detail: `${STORY_FIXTURE.customer} +${STORY_FIXTURE.points} puntos`,
    },
    {
      start: 0.64,
      icon: BadgeDollarSign,
      title: 'Equipo',
      detail: `${STORY_FIXTURE.staff} +${STORY_FIXTURE.commission}`,
    },
  ] as const;

  return (
    <SceneFrame scene={scene}>
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900 p-3 shadow-2xl shadow-black/30 sm:p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 sm:pb-4">
            <div>
              <p className="text-[0.6rem] text-neutral-500 sm:text-xs">Actividad de esta venta</p>
              <p className="mt-0.5 text-sm font-medium text-white sm:mt-1 sm:text-lg">
                {STORY_FIXTURE.total} · ahora
              </p>
            </div>
            <span className="size-2 rounded-full bg-avoqado-green" />
          </div>
          <ul>
            {rows.map(row => (
              <OperationRow key={row.title} progress={progress} {...row} />
            ))}
          </ul>
        </div>
      </div>
    </SceneFrame>
  );
}
