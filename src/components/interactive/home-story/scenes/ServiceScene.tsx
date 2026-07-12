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

const ROUTE_TIMES = [0, 0.08, 0.2, 0.3, 0.48, 0.58, 0.72, 0.8, 0.88, 0.94, 1] as const;

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
  const agendaRef = useRef<HTMLDivElement>(null);
  const confirmationRef = useRef<HTMLSpanElement>(null);
  const geometry = useMotionValue<RouteGeometry>({
    x: Array.from({ length: ROUTE_TIMES.length }, () => 5),
    y: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    pathLength: Array.from({ length: ROUTE_TIMES.length }, () => 0),
  });
  const [route, setRoute] = useState({ width: 1, height: 1, path: 'M 5 0' });
  const agendaOpacity = useTransform(progress, [0.08, 0.34], [0.25, 1]);
  const agendaY = useTransform(progress, [0.08, 0.4], [24, 0]);
  const trackLength = useTransform(() => interpolateRoute(progress.get(), geometry.get().pathLength));
  const routeGuideOpacity = useTransform(progress, [0.36, 0.4], [0, 1]);
  const pulseX = useTransform(() => interpolateRoute(progress.get(), geometry.get().x));
  const pulseY = useTransform(() => interpolateRoute(progress.get(), geometry.get().y));
  const pulseScale = useTransform(
    progress,
    [0, 0.08, 0.2, 0.54, 0.58, 0.72, 0.76, 0.94, 1],
    [0.75, 0.75, 1, 1, 1.18, 1.18, 1, 0.75, 0.75],
  );

  useEffect(() => {
    const visual = visualRef.current;
    const agenda = agendaRef.current;
    const confirmation = confirmationRef.current;
    if (!visual || !agenda || !confirmation) return;

    const measure = () => {
      let targetX = confirmation.offsetWidth / 2;
      let targetY = confirmation.offsetHeight / 2;
      let current: HTMLElement | null = confirmation;
      while (current && current !== visual) {
        targetX += current.offsetLeft;
        targetY += current.offsetTop;
        current = current.offsetParent as HTMLElement | null;
      }
      if (current !== visual) return;

      const width = Math.max(visual.clientWidth, 1);
      const height = Math.max(visual.clientHeight, 1);
      const dock = { x: 5, y: height / 2 };
      const railX = Math.max(dock.x, agenda.offsetLeft - 12);
      const railY = Math.max(8, agenda.offsetTop - 10);
      const topLeft = { x: railX, y: railY };
      const topTarget = { x: targetX, y: railY };
      const target = { x: targetX, y: targetY };
      const toRail = Math.abs(railX - dock.x);
      const toTop = Math.abs(dock.y - railY);
      const acrossTop = Math.abs(targetX - railX);
      const toTarget = Math.abs(targetY - railY);
      const routeLength = Math.max(toRail + toTop + acrossTop + toTarget, 1);
      const points = [
        dock,
        dock,
        { x: railX, y: dock.y },
        topLeft,
        topTarget,
        target,
        target,
        topTarget,
        topLeft,
        { x: railX, y: dock.y },
        dock,
      ];

      geometry.set({
        x: points.map(point => point.x),
        y: points.map(point => point.y - dock.y),
        pathLength: [
          0,
          0,
          toRail / routeLength,
          (toRail + toTop) / routeLength,
          (toRail + toTop + acrossTop) / routeLength,
          1,
          1,
          1,
          1,
          1,
          1,
        ],
      });
      setRoute({
        width,
        height,
        path: `M ${dock.x} ${dock.y} H ${railX} V ${railY} H ${targetX} V ${targetY}`,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(visual);
    observer.observe(agenda);
    observer.observe(confirmation);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [geometry]);

  return (
    <SceneFrame
      scene={scene}
      accessibleSummary={`La cita está confirmada a las ${STORY_FIXTURE.appointmentTime}: ${STORY_FIXTURE.service} para ${STORY_FIXTURE.customer}, atendida por ${STORY_FIXTURE.staff} en ${STORY_FIXTURE.venue}, con ${STORY_FIXTURE.product}. Disponible en POS iOS, POS Android, POS Desktop y Windows Service.`}
    >
      <div ref={visualRef} className="relative h-full min-h-0">
        <StoryPhotoSlot
          id="service-in-action"
          className="absolute right-0 top-0 h-[46%] w-[82%] rounded-[1.1rem] opacity-35 sm:h-[58%] sm:w-[70%] lg:inset-y-[3%] lg:h-[94%] lg:w-[76%] lg:rounded-[1.4rem] lg:opacity-25"
          imageClassName="saturate-[0.55] contrast-[1.08]"
          overlayClassName="bg-[linear-gradient(90deg,oklch(0.13_0.005_155_/_0.62),oklch(0.13_0.005_155_/_0.18))]"
        />

        <motion.div
          ref={agendaRef}
          className="story-service-agenda absolute inset-x-[3%] bottom-[4%] z-10 overflow-hidden rounded-[1rem] border border-white/10 bg-neutral-900 shadow-[0_24px_70px_oklch(0.05_0.003_155_/_0.38)] sm:inset-x-[7%] sm:bottom-[6%] sm:rounded-[1.35rem] lg:inset-x-[5%] lg:bottom-[9%]"
          style={{ opacity: agendaOpacity, y: agendaY }}
        >
          <div className="flex items-center justify-between border-b border-white/8 px-3.5 py-2 sm:px-5 sm:py-3.5">
            <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-neutral-500 sm:text-[0.65rem]">Agenda · hoy</span>
            <span className="flex items-center gap-2 text-[0.62rem] font-medium text-avoqado-green sm:text-xs">
              <span
                ref={confirmationRef}
                data-service-pulse-target
                className="inline-flex size-2.5 shrink-0 items-center justify-center rounded-full"
              >
                <span className="size-1.5 rounded-full bg-avoqado-green" />
              </span>
              Confirmada
            </span>
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

        <svg
          className="pointer-events-none absolute inset-0 z-20 size-full"
          viewBox={`0 0 ${route.width} ${route.height}`}
          preserveAspectRatio="none"
          aria-hidden="true"
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
            style={{ opacity: routeGuideOpacity }}
          />
          <motion.path
            d={route.path}
            fill="none"
            stroke="var(--color-avoqado-green)"
            strokeWidth="1"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ pathLength: trackLength }}
          />
        </svg>
        <motion.span
          data-story-primary-pulse
          aria-hidden="true"
          className="story-primary-pulse pointer-events-none absolute left-0 top-1/2 z-30 -ml-[0.3125rem] -mt-[0.3125rem] size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green outline outline-[4px] outline-avoqado-green/10"
          style={{ x: pulseX, y: pulseY, scale: pulseScale }}
        />
      </div>
    </SceneFrame>
  );
}
