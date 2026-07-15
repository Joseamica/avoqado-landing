import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import SceneFrame from '../SceneFrame';
import StoryPhotoSlot from '../StoryPhotoSlot';
import { STORY_FIXTURE } from '../story-fixture';
import type { StoryScene } from '../story';

interface RouteGeometry {
  x: number[];
  y: number[];
  pathLength: number[];
}

const ROUTE_TIMES = [0, 0.12, 0.3, 0.48, 0.58, 0.88, 1] as const;

function interpolateRoute(progress: number, values: number[]) {
  for (let index = 1; index < ROUTE_TIMES.length; index += 1) {
    if (progress <= ROUTE_TIMES[index]) {
      const start = ROUTE_TIMES[index - 1];
      const end = ROUTE_TIMES[index];
      const segmentProgress = (progress - start) / (end - start);
      return values[index - 1] + (values[index] - values[index - 1]) * segmentProgress;
    }
  }
  return values.at(-1) ?? 0;
}

export default function ServiceScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const visualRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const confirmationRef = useRef<HTMLSpanElement>(null);
  const geometry = useMotionValue<RouteGeometry>({
    x: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    y: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    pathLength: Array.from({ length: ROUTE_TIMES.length }, () => 0),
  });
  const [route, setRoute] = useState({ width: 1, height: 1, path: 'M 0 0' });
  const agendaOpacity = useTransform(progress, [0.08, 0.34], [0.25, 1]);
  const sourceOpacity = useTransform(progress, [0, 0.64, 0.82], [1, 1, 0.42]);
  const destinationOpacity = useTransform(progress, [0.38, 0.58], [0.45, 1]);
  const connectorOpacity = useTransform(progress, [0, 0.82, 0.9], [1, 1, 0]);
  const trackLength = useTransform(() => interpolateRoute(progress.get(), geometry.get().pathLength));
  const pulseX = useTransform(() => interpolateRoute(progress.get(), geometry.get().x));
  const pulseY = useTransform(() => interpolateRoute(progress.get(), geometry.get().y));
  const pulseScale = useTransform(
    progress,
    [0, 0.1, 0.12, 0.52, 0.58, 0.7, 1],
    [0.78, 0.78, 1, 1, 1.18, 1, 1],
  );

  useEffect(() => {
    const visual = visualRef.current;
    const source = sourceRef.current;
    const confirmation = confirmationRef.current;
    if (!visual || !source || !confirmation) return;

    const measure = () => {
      const centerWithinVisual = (element: HTMLElement) => {
        let x = element.offsetWidth / 2;
        let y = element.offsetHeight / 2;
        let current: HTMLElement | null = element;
        while (current && current !== visual) {
          x += current.offsetLeft;
          y += current.offsetTop;
          current = current.offsetParent as HTMLElement | null;
        }
        return current === visual ? { x, y } : null;
      };

      const start = centerWithinVisual(source);
      const target = centerWithinVisual(confirmation);
      if (!start || !target) return;

      const width = Math.max(visual.clientWidth, 1);
      const height = Math.max(visual.clientHeight, 1);
      const elbowY = start.y + (target.y - start.y) * 0.56;
      const sourceElbow = { x: start.x, y: elbowY };
      const targetElbow = { x: target.x, y: elbowY };
      const toSourceElbow = Math.abs(sourceElbow.y - start.y);
      const across = Math.abs(targetElbow.x - sourceElbow.x);
      const toTarget = Math.abs(target.y - targetElbow.y);
      const routeLength = Math.max(toSourceElbow + across + toTarget, 1);
      const points = [
        start,
        start,
        sourceElbow,
        targetElbow,
        target,
        target,
        target,
      ];

      geometry.set({
        x: points.map(point => point.x),
        y: points.map(point => point.y - height / 2),
        pathLength: [
          0,
          0,
          toSourceElbow / routeLength,
          (toSourceElbow + across) / routeLength,
          1,
          1,
          1,
        ],
      });
      setRoute({
        width,
        height,
        path: `M ${start.x} ${start.y} V ${sourceElbow.y} H ${targetElbow.x} V ${target.y}`,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(visual);
    observer.observe(source);
    observer.observe(confirmation);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [geometry]);

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`La reserva web llega a la agenda como contexto listo. A las ${STORY_FIXTURE.appointmentTime}: ${STORY_FIXTURE.service} para ${STORY_FIXTURE.customer}, atendida por ${STORY_FIXTURE.staff} en ${STORY_FIXTURE.venue}, con ${STORY_FIXTURE.product}. Disponible en POS iOS, POS Android, POS Desktop y Windows Service.`}
    >
      <div ref={visualRef} className="relative h-full min-h-0">
        <StoryPhotoSlot
          id="service-in-action"
          className="absolute right-0 top-0 h-[46%] w-[82%] rounded-[1.1rem] opacity-35 sm:h-[58%] sm:w-[70%] lg:inset-y-[3%] lg:h-[94%] lg:w-[76%] lg:rounded-[1.4rem] lg:opacity-25"
          imageClassName="saturate-[0.55] contrast-[1.08]"
          overlayClassName="bg-[linear-gradient(90deg,oklch(0.13_0.005_155_/_0.62),oklch(0.13_0.005_155_/_0.18))]"
        />

        <motion.div
          data-service-source-card
          className="story-service-source absolute right-[5%] top-[2%] z-10 w-[9.25rem] border border-white/10 bg-neutral-950/95 px-2.5 py-2 shadow-[0_16px_44px_oklch(0.05_0.003_155_/_0.32)] sm:right-[7%] sm:top-[5%] sm:w-[11.5rem] sm:px-3 sm:py-2.5 lg:right-[6%] lg:top-[9%]"
          style={{ opacity: sourceOpacity }}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="whitespace-nowrap text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-neutral-300">Reserva web</span>
            <span className="story-service-source-channel whitespace-nowrap text-[0.5rem] text-neutral-500 sm:text-[0.55rem]">{STORY_FIXTURE.selectedChannel}</span>
          </div>
          <p className="story-service-source-detail mt-1 text-[0.62rem] font-medium text-neutral-100 sm:mt-1.5 sm:text-xs">
            {STORY_FIXTURE.customer} · {STORY_FIXTURE.appointmentTime}
          </p>
          <p className="story-service-source-detail mt-0.5 hidden truncate text-[0.6rem] text-neutral-500 sm:block">{STORY_FIXTURE.service}</p>
          <span
            ref={sourceRef}
            data-service-pulse-source
            className="absolute -bottom-[0.3125rem] right-5 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-950"
          />
        </motion.div>

        <motion.div
          className="story-service-agenda absolute inset-x-[3%] bottom-[4%] z-10 overflow-hidden rounded-[1rem] border border-white/10 bg-neutral-900 shadow-[0_24px_70px_oklch(0.05_0.003_155_/_0.38)] sm:inset-x-[7%] sm:bottom-[6%] sm:rounded-[1.35rem] lg:inset-x-[5%] lg:bottom-[9%]"
          style={{ opacity: agendaOpacity }}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2 sm:px-5 sm:py-3.5">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-neutral-500 sm:text-[0.65rem]">Agenda · hoy</span>
            <motion.span
              data-service-pulse-destination
              className="flex items-center gap-2 text-[0.62rem] font-medium text-avoqado-green sm:text-xs"
              style={{ opacity: destinationOpacity }}
            >
              <span
                ref={confirmationRef}
                data-service-pulse-target
                className="inline-flex size-2.5 shrink-0 items-center justify-center rounded-full"
              >
                <span className="size-1.5 rounded-full bg-avoqado-green" />
              </span>
              Contexto listo
            </motion.span>
          </div>

          <div className="grid grid-cols-[4rem_minmax(0,1fr)] gap-3 px-3.5 py-3 sm:grid-cols-[6.5rem_minmax(0,1fr)] sm:gap-5 sm:px-5 sm:py-5 lg:grid-cols-[8rem_minmax(0,1fr)] lg:px-6 lg:py-6">
            <div className="border-r border-white/10 pr-3 sm:pr-5">
              <p className="text-2xl font-light tabular-nums tracking-[-0.04em] text-neutral-50 sm:text-4xl lg:text-5xl">{STORY_FIXTURE.appointmentTime}</p>
              <p className="mt-1 text-[0.58rem] text-neutral-500 sm:mt-2 sm:text-xs">Cita de hoy</p>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium tracking-[-0.02em] text-neutral-50 sm:text-xl lg:text-2xl">{STORY_FIXTURE.service}</p>
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:mt-4 sm:gap-y-3">
                {[
                  ['Cliente', STORY_FIXTURE.customer],
                  ['Colaboradora', STORY_FIXTURE.staff],
                  ['Sucursal', STORY_FIXTURE.venue],
                  ['Producto', STORY_FIXTURE.product],
                ].map(([label, value]) => (
                  <p key={label} className="min-w-0">
                    <span className="block text-[0.5rem] uppercase tracking-[0.1em] text-neutral-600 sm:text-[0.58rem]">{label}</span>
                    <span className="story-service-context-value mt-0.5 block truncate text-[0.62rem] text-neutral-300 sm:text-xs lg:text-sm">{value}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="story-service-rail grid grid-cols-2 gap-x-2 border-t border-white/8 px-3.5 py-2 text-[0.5rem] leading-relaxed tracking-[0.06em] text-neutral-500 sm:px-5 sm:py-3 sm:text-[0.62rem] lg:text-xs">
            <span>POS iOS · POS Android</span>
            <span>POS Desktop · Windows Service</span>
          </div>
        </motion.div>

        <motion.svg
          className="pointer-events-none absolute inset-0 z-20 size-full"
          viewBox={`0 0 ${route.width} ${route.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
          style={{ opacity: connectorOpacity }}
        >
          <motion.path
            data-service-route-path
            d={route.path}
            fill="none"
            stroke="oklch(0.38 0.006 155 / 0.34)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <motion.path
            data-service-route-active
            d={route.path}
            fill="none"
            stroke="var(--color-avoqado-green)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: trackLength }}
          />
        </motion.svg>
        <motion.span
          data-story-primary-pulse
          aria-hidden="true"
          className="story-primary-pulse pointer-events-none absolute left-0 top-1/2 z-30 -ml-[0.3125rem] -mt-[0.3125rem] size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green outline outline-[4px] outline-avoqado-green/10"
          style={{ x: pulseX, y: pulseY, scale: pulseScale, opacity: connectorOpacity }}
        />
      </div>
    </SceneFrame>
  );
}
