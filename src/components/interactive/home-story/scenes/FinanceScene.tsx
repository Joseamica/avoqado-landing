import { motion, type MotionValue } from 'framer-motion';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import CascadeTimeline from '../CascadeTimeline';
import SceneFrame from '../SceneFrame';
import { useStepReveal } from '../story-motion';

interface Stage {
  title: string;
  value: string;
  detail: string;
  status: string;
  premium?: boolean;
}

function FinanceStage({
  stage,
  progress,
  index,
  threshold,
  stepId,
}: {
  stage: Stage;
  progress: MotionValue<number>;
  index: number;
  threshold: number;
  stepId: string;
}) {
  const reveal = useStepReveal(progress, threshold, 20);

  return (
    <motion.li
      data-story-step={stepId}
      data-story-cascade-stage={stage.title}
      className="relative grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-2 py-1 sm:grid-cols-[1.75rem_minmax(0,1fr)_auto] sm:gap-3 sm:py-2"
      style={{ opacity: reveal.opacity, y: reveal.offset }}
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
      status: 'Registrado',
    },
    {
      title: 'Costo',
      value: 'Calculado',
      detail: 'procesador y comisión',
      status: 'Calculado',
    },
    {
      title: 'Liquidación esperada',
      value: 'En seguimiento',
      detail: 'fecha y monto neto',
      status: 'Esperada',
    },
    {
      title: 'Conciliación',
      value: 'Referencia ligada',
      detail: 'saldo y movimientos',
      status: 'Ligada',
    },
    {
      title: 'Póliza',
      value: 'Lista para libros',
      detail: 'IVA · ISR · contabilidad',
      status: 'Premium',
      premium: true,
    },
  ];
  const financeSteps = ['payment', 'cost', 'settlement', 'reconciliation', 'policy'] as const;

  return (
    <SceneFrame
      scene={scene}
      progress={progress}
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
                Referencia {STORY_FIXTURE.paymentReference}
              </p>
            </div>
            <span
              data-story-panel-copy
              className="rounded-full bg-neutral-100 px-2 py-1 text-[0.625rem] font-medium text-neutral-600"
            >
              Trazable
            </span>
          </div>
          <CascadeTimeline progress={progress} thresholds={scene.stepThresholds} tone="light">
            <ol className="relative">
              {stages.map((stage, index) => (
                <FinanceStage
                  key={stage.title}
                  stage={stage}
                  progress={progress}
                  index={index}
                  stepId={financeSteps[index]}
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
