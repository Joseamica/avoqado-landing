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
      <span className="relative z-10 grid size-6 place-items-center rounded-full border border-white/12 bg-neutral-900 text-avoqado-green sm:size-7">
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

  const pulseTop = useTransform(
    progress,
    [0.04, 0.22, 0.4, 0.58, 0.76, 0.94],
    ['6%', '22%', '40%', '58%', '76%', '94%'],
  );
  const pulseScale = useTransform(progress, [0, 0.08, 0.88, 1], [0.75, 1, 1, 0.75]);

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`La venta de ${STORY_FIXTURE.total} atendida por ${STORY_FIXTURE.staff} descuenta una unidad de ${STORY_FIXTURE.product}, cambia el stock de ${STORY_FIXTURE.stockBefore} a ${STORY_FIXTURE.stockAfter}, sugiere reorden, suma ${STORY_FIXTURE.points} puntos a ${STORY_FIXTURE.customer} y registra una comisión de ${STORY_FIXTURE.commission}.`}
    >
      <div className="flex h-full items-center justify-center">
        <div
          data-story-panel="operations"
          className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-white/10 bg-neutral-900 p-2.5 shadow-2xl shadow-black/30 sm:rounded-[1.75rem] sm:p-5"
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
              5 efectos
            </span>
          </div>
          <div className="relative mt-1.5 sm:mt-2">
            <span
              data-story-cascade-path
              aria-hidden="true"
              className="pointer-events-none absolute bottom-3 left-[0.72rem] top-3 w-px bg-white/12 sm:left-[0.84rem]"
            />
            <motion.span
              data-story-primary-pulse
              aria-hidden="true"
              className="story-primary-pulse pointer-events-none absolute left-[0.43rem] z-20 size-2.5 -translate-y-1/2 rounded-full border border-avoqado-green/30 bg-avoqado-green shadow-[0_0_0_4px_rgb(43_219_122_/_0.10)] sm:left-[0.55rem]"
              style={{ top: pulseTop, scale: pulseScale }}
            />
            <ol className="relative">
              {rows.map(row => (
                <OperationRow key={row.title} progress={progress} {...row} />
              ))}
            </ol>
          </div>
        </div>
      </div>
    </SceneFrame>
  );
}
