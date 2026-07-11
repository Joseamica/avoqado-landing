import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import CascadeTimeline from '../CascadeTimeline';
import SceneFrame from '../SceneFrame';

interface Stage {
  title: string;
  value: string;
  detail: string;
  start: number;
  status: string;
  premium?: boolean;
}

function FinanceStage({
  stage,
  progress,
  index,
}: {
  stage: Stage;
  progress: MotionValue<number>;
  index: number;
}) {
  const opacity = useTransform(progress, [stage.start, stage.start + 0.2], [0, 1]);
  const y = useTransform(progress, [stage.start, stage.start + 0.2], [20, 0]);

  return (
    <motion.li
      data-story-cascade-stage={stage.title}
      className="relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-1 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:gap-3 sm:py-2"
      style={{ opacity, y }}
    >
      <span
        data-story-cascade-node
        className="relative z-10 grid size-6 place-items-center rounded-full border border-black/10 bg-white text-[0.625rem] font-semibold text-neutral-600 sm:size-7"
        aria-hidden="true"
      >
        0{index + 1}
      </span>
      <span className="min-w-0">
        <b
          data-story-panel-copy
          className="block text-[0.7rem] font-semibold leading-tight text-neutral-950 sm:text-xs"
        >
          {stage.title}
        </b>
        <span className="mt-0.5 flex min-w-0 items-baseline gap-x-2 leading-tight">
          <span
            data-story-panel-copy
            className="shrink-0 text-[0.625rem] font-medium text-neutral-800 sm:text-[0.7rem]"
          >
            {stage.value}
          </span>
          <span
            data-story-panel-copy
            className="truncate text-[0.625rem] text-neutral-500 sm:text-[0.7rem]"
          >
            {stage.detail}
          </span>
        </span>
      </span>
      <span
        data-story-panel-copy
        className={stage.premium
          ? 'rounded-full bg-amber-100 px-1.5 py-0.5 text-[0.625rem] font-semibold text-amber-900 sm:px-2'
          : 'rounded-full bg-neutral-100 px-1.5 py-0.5 text-[0.625rem] font-medium text-neutral-600 sm:px-2'}
      >
        {stage.status}
      </span>
    </motion.li>
  );
}

export default function FinanceScene({
  scene,
  progress,
}: {
  scene: StoryScene;
  progress: MotionValue<number>;
}) {
  const stages: Stage[] = [
    {
      title: 'Pago',
      value: STORY_FIXTURE.total,
      detail: `merchant: ${STORY_FIXTURE.selectedMerchant}`,
      start: 0.05,
      status: 'Registrado',
    },
    {
      title: 'Costo',
      value: 'Calculado',
      detail: 'procesador y comisión',
      start: 0.18,
      status: 'Calculado',
    },
    {
      title: 'Liquidación esperada',
      value: 'En seguimiento',
      detail: 'fecha y monto neto',
      start: 0.31,
      status: 'Esperada',
    },
    {
      title: 'Conciliación',
      value: 'Referencia ligada',
      detail: 'saldo y movimientos',
      start: 0.44,
      status: 'Ligada',
    },
    {
      title: 'Póliza',
      value: 'Lista para libros',
      detail: 'IVA · ISR · contabilidad',
      start: 0.57,
      status: 'Premium',
      premium: true,
    },
  ];

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`El pago de ${STORY_FIXTURE.total} en ${STORY_FIXTURE.selectedMerchant} sigue la ruta Costo, Liquidación esperada, Conciliación y Póliza; la liquidación se presenta como esperada, no garantizada.`}
    >
      <div className="flex h-full items-center justify-center">
        <div
          data-story-panel="finance"
          className="relative w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-black/6 bg-white p-2.5 shadow-[0_24px_80px_rgb(20_35_25_/_0.10)] sm:rounded-[1.75rem] sm:p-5"
        >
          <div className="flex items-center justify-between border-b border-black/6 pb-2 sm:pb-5">
            <div>
              <p data-story-panel-copy className="text-[0.625rem] text-neutral-500 sm:text-xs">
                Ruta financiera del pago
              </p>
              <p
                data-story-panel-copy
                className="mt-0.5 text-sm font-medium text-neutral-950 sm:mt-1 sm:text-lg"
              >
                Referencia AVQ-34810
              </p>
            </div>
            <span
              data-story-panel-copy
              className="rounded-full bg-neutral-100 px-2 py-1 text-[0.625rem] font-medium text-neutral-600"
            >
              Trazable
            </span>
          </div>
          <CascadeTimeline progress={progress} tone="light">
            <ol className="relative">
              {stages.map((stage, index) => (
                <FinanceStage key={stage.title} stage={stage} progress={progress} index={index} />
              ))}
            </ol>
          </CascadeTimeline>
        </div>
      </div>
    </SceneFrame>
  );
}
