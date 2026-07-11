import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { StoryScene } from '../story';
import SceneFrame from '../SceneFrame';

interface Stage {
  title: string;
  value: string;
  detail: string;
  start: number;
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
      className="relative flex-1 border-l border-black/10 py-0 pl-3 first:border-l-0 first:pl-0 sm:py-3 sm:pl-5 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6"
      style={{ opacity, y }}
    >
      <span
        className="absolute -left-[5px] top-5 size-2 rounded-full bg-neutral-400 first:hidden lg:-top-[5px] lg:left-0 lg:block"
        aria-hidden="true"
      />
      <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-neutral-500 sm:text-[10px]">
        0{index + 1} · {stage.title}
      </p>
      <p className="mt-0.5 text-xs font-medium leading-tight text-neutral-950 sm:mt-2 sm:text-lg">
        {stage.value}
      </p>
      <p className="text-[8px] leading-tight text-neutral-500 sm:mt-1 sm:text-xs sm:leading-relaxed">
        {stage.detail}
      </p>
      {stage.premium ? (
        <span className="mt-1 inline-flex rounded-full bg-amber-100 px-1.5 py-0.5 text-[8px] font-semibold text-amber-900 sm:mt-3 sm:px-2 sm:py-1 sm:text-[10px]">
          CFDI · Premium
        </span>
      ) : null}
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
    { title: 'Pago', value: '$348.10', detail: 'merchant: Operación diaria', start: 0.05 },
    { title: 'Costo', value: 'Calculado', detail: 'procesador y comisión', start: 0.18 },
    {
      title: 'Liquidación esperada',
      value: 'En seguimiento',
      detail: 'fecha y monto neto',
      start: 0.31,
    },
    {
      title: 'Conciliación',
      value: 'Referencia ligada',
      detail: 'saldo y movimientos',
      start: 0.44,
    },
    {
      title: 'Póliza',
      value: 'Lista para libros',
      detail: 'IVA · ISR · contabilidad',
      start: 0.57,
      premium: true,
    },
  ];

  return (
    <SceneFrame scene={scene}>
      <div className="flex h-full items-center">
        <div className="w-full rounded-[1.75rem] border border-black/6 bg-white p-2.5 shadow-[0_24px_80px_rgb(20_35_25_/_0.10)] sm:p-8">
          <div className="flex items-center justify-between border-b border-black/6 pb-2 sm:pb-5">
            <div>
              <p className="text-[0.6rem] text-neutral-500 sm:text-xs">Ruta financiera del pago</p>
              <p className="mt-0.5 text-sm font-medium sm:mt-1 sm:text-xl">
                Referencia AVQ-34810
              </p>
            </div>
            <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[8px] font-medium text-neutral-600 sm:px-3 sm:py-1 sm:text-[10px]">
              Trazable
            </span>
          </div>
          <ol className="mt-2 flex flex-col sm:mt-5 lg:flex-row lg:gap-4">
            {stages.map((stage, index) => (
              <FinanceStage key={stage.title} stage={stage} progress={progress} index={index} />
            ))}
          </ol>
        </div>
      </div>
    </SceneFrame>
  );
}
