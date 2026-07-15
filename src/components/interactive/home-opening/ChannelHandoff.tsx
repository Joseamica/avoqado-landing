import { cancelFrame, frame, motion, useInView, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type Ref } from 'react';
import '../home-story/home-story.css';
import { STORY_FIXTURE } from '../home-story/story-fixture';
import { OPENING_CHANNELS, OPENING_TILES } from './opening-tiles';

interface RoutePoint { x: number; y: number }
interface RouteGeometry { x: number[]; y: number[]; pathLength: number[] }

const ROUTE_TIMES = [0, 0.30, 0.40, 0.52, 0.62, 1] as const;
const ROUTE_RESET_PROGRESS = 0.20;

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

function routeFractions(points: RoutePoint[]) {
  const cumulative = [0];
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    cumulative.push(cumulative[index - 1] + Math.hypot(current.x - previous.x, current.y - previous.y));
  }
  const total = Math.max(cumulative.at(-1) ?? 0, 1);
  return cumulative.map(length => length / total);
}

function ChannelRow({ channel, index, progress, sourceRef }: {
  channel: (typeof OPENING_CHANNELS)[number];
  index: number;
  progress: MotionValue<number>;
  sourceRef?: Ref<HTMLSpanElement>;
}) {
  const start = 0.06 + index * 0.08;
  const opacity = useTransform(progress, [start, start + 0.18], [0.35, 1]);
  const x = useTransform(progress, [start, start + 0.18], [-14, 0]);
  const tile = OPENING_TILES.find(item => item.id === channel.tileId)!;

  return (
    <motion.li
      data-channel-id={channel.id}
      data-channel-active={channel.active ? 'true' : undefined}
      style={{ opacity, x }}
      className={channel.active ? 'story-channel-row relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 bg-green-100/70 py-3 text-green-950' : 'story-channel-row relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-black/8 py-3 text-neutral-700'}
    >
      <span data-shared-tile-target={channel.id} className="block h-10 w-12 overflow-hidden rounded-lg bg-neutral-200" aria-hidden="true">
        <img src={tile.src} alt="" className="size-full object-cover" />
      </span>
      <strong>{channel.label}</strong>
      <span>{channel.result}</span>
      {channel.active ? <span ref={sourceRef} data-channel-route-source aria-hidden="true" className="story-channel-route-source absolute z-20 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-50" /> : null}
    </motion.li>
  );
}

export default function ChannelHandoff({ progress, connectorProgress }: {
  progress: MotionValue<number>;
  connectorProgress: MotionValue<number>;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const geometry = useMotionValue<RouteGeometry>({
    x: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    y: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    pathLength: Array.from({ length: ROUTE_TIMES.length }, () => 0),
  });
  const routeProgress = useMotionValue(0);
  const [route, setRoute] = useState({ width: 1, height: 1, path: 'M 0 0', ready: false });
  const [channelActive, setChannelActive] = useState(false);
  const openingVisible = useInView(sectionRef, { amount: 0.1 });
  const eventOpacity = useTransform(routeProgress, [0.46, 0.68], [0, 1]);
  const eventY = useTransform(routeProgress, [0.46, 0.70], [14, 0]);
  const connectorOpacity = useTransform(connectorProgress, [0.24, 0.30], [0, 1]);
  const trackLength = useTransform(() => interpolateRoute(routeProgress.get(), geometry.get().pathLength));
  const pulseX = useTransform(() => interpolateRoute(routeProgress.get(), geometry.get().x));
  const pulseY = useTransform(() => interpolateRoute(routeProgress.get(), geometry.get().y));
  const pulseScale = useTransform(routeProgress, [0.30, 0.56, 0.62, 0.72], [0.9, 1, 1.16, 1]);

  useMotionValueEvent(progress, 'change', value => {
    const active = value > 0.05;
    setChannelActive(current => current === active ? current : active);
  });

  useEffect(() => {
    const visual = visualRef.current;
    const source = sourceRef.current;
    const target = targetRef.current;
    if (!visual || !source || !target) return;
    const ledger = source.closest<HTMLElement>('.story-channel-ledger');
    const sourceRow = source.closest<HTMLElement>('.story-channel-row');
    const event = target.closest<HTMLElement>('.story-channel-event');
    if (!ledger || !sourceRow || !event) return;

    let active = true;
    const measure = () => {
      if (!active) return;
      const visualRect = visual.getBoundingClientRect();
      const centerWithinVisual = (element: HTMLElement): RoutePoint => {
        let x = element.offsetWidth / 2;
        let y = element.offsetHeight / 2;
        let current: HTMLElement | null = element;

        while (current && current !== visual) {
          x += current.offsetLeft;
          y += current.offsetTop;
          const transform = getComputedStyle(current).transform;
          if (transform !== 'none') {
            const matrix = new DOMMatrixReadOnly(transform);
            x += matrix.m41;
            y += matrix.m42;
          }
          current = current.offsetParent as HTMLElement | null;
        }

        if (current === visual) return { x, y };
        const rect = element.getBoundingClientRect();
        return {
          x: rect.left - visualRect.left + rect.width / 2,
          y: rect.top - visualRect.top + rect.height / 2,
        };
      };
      const start = centerWithinVisual(source);
      const destination = centerWithinVisual(target);
      const ledgerRect = ledger.getBoundingClientRect();
      const eventRect = event.getBoundingClientRect();
      const sideBySide = eventRect.left >= ledgerRect.right - 1;
      const midpointX = start.x + (destination.x - start.x) / 2;
      const midpointY = start.y + (destination.y - start.y) / 2;
      const firstElbow = sideBySide
        ? { x: midpointX, y: start.y }
        : { x: start.x, y: midpointY };
      const secondElbow = sideBySide
        ? { x: midpointX, y: destination.y }
        : { x: start.x, y: destination.y };
      const points = [start, start, firstElbow, secondElbow, destination, destination];
      const width = Math.max(visual.clientWidth, 1);
      const height = Math.max(visual.clientHeight, 1);

      geometry.set({
        x: points.map(point => point.x),
        y: points.map(point => point.y),
        pathLength: routeFractions(points),
      });
      const path = sideBySide
        ? `M ${start.x} ${start.y} H ${midpointX} V ${destination.y} H ${destination.x}`
        : `M ${start.x} ${start.y} V ${destination.y} H ${destination.x}`;
      setRoute(current => (
        current.width === width && current.height === height && current.path === path && current.ready
          ? current
          : { width, height, path, ready: true }
      ));
    };

    const updateRouteProgress = (value: number) => {
      if (value <= ROUTE_RESET_PROGRESS) {
        routeProgress.set(0);
      } else if (value > routeProgress.get()) {
        routeProgress.set(value);
      }
    };

    const scheduleMeasure = () => {
      if (active) frame.postRender(measure);
    };

    updateRouteProgress(connectorProgress.get());
    frame.postRender(scheduleMeasure);
    const observer = new ResizeObserver(scheduleMeasure);
    observer.observe(visual);
    observer.observe(ledger);
    observer.observe(event);
    observer.observe(source);
    observer.observe(target);
    const transformObserver = new MutationObserver(scheduleMeasure);
    transformObserver.observe(sourceRow, { attributes: true, attributeFilter: ['style'] });
    transformObserver.observe(event, { attributes: true, attributeFilter: ['style'] });
    const stopMeasuringProgress = connectorProgress.on('change', value => {
      updateRouteProgress(value);
      scheduleMeasure();
    });
    void document.fonts?.ready.then(scheduleMeasure);
    return () => {
      active = false;
      stopMeasuringProgress();
      cancelFrame(scheduleMeasure);
      cancelFrame(measure);
      observer.disconnect();
      transformObserver.disconnect();
    };
  }, [connectorProgress, geometry, routeProgress]);

  const surfaceOpacity = useTransform(progress, [0, 0.12], [0, 1]);
  const channelHeading = (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-800">Una sola entrada de verdad</p>
      <h2 id="opening-channels-title" className="mt-3 text-3xl font-light tracking-[-0.04em] sm:text-5xl lg:text-6xl">Tu cliente empieza como prefiera.</h2>
      <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.</p>
    </div>
  );

  return (
    <motion.section
      ref={sectionRef}
      data-opening-channel-handoff
      data-story-scene="channels"
      data-active={channelActive && openingVisible ? 'true' : 'false'}
      aria-labelledby="opening-channels-title"
      style={{ opacity: surfaceOpacity }}
      className="pointer-events-none absolute inset-0 z-30 bg-neutral-50 text-neutral-950"
    >
      <div className="mx-auto grid h-full max-w-7xl content-center gap-6 px-5 pb-8 pt-[calc(var(--site-header-height)+1rem)] md:grid-cols-[minmax(220px,.7fr)_minmax(0,1.3fr)] md:items-center md:gap-10 md:px-10">
        {channelHeading}
        <div ref={visualRef} className="story-channel-visual relative grid h-full min-h-0 content-center gap-3 sm:grid-cols-[minmax(260px,1.05fr)_minmax(220px,0.8fr)] sm:items-center sm:gap-8">
          <div className="story-channel-ledger relative border-y border-black/10 bg-neutral-50">
            <p className="border-b border-black/8 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:py-3 sm:text-[0.65rem]">
              Entradas de la operación
            </p>
            <ol>
              {OPENING_CHANNELS.map((channel, index) => (
                <ChannelRow key={channel.id} channel={channel} index={index} progress={progress} sourceRef={channel.active ? sourceRef : undefined} />
              ))}
            </ol>
          </div>

          <motion.div
            className="story-channel-event relative border border-white/8 bg-neutral-950 px-4 py-3.5 text-neutral-50 shadow-[0_20px_60px_oklch(0.13_0.005_155_/_0.16)] sm:px-5 sm:py-5"
            style={{ opacity: eventOpacity, y: eventY }}
          >
            <span
              ref={targetRef}
              data-channel-route-target
              aria-hidden="true"
              className="story-channel-route-target absolute z-20 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-950"
            />
            <div className="story-channel-event-header flex items-center justify-between border-b border-white/10 pb-2.5 sm:pb-3">
              <span data-channel-route-summary className="text-[0.52rem] font-semibold uppercase leading-tight tracking-[0.08em] text-avoqado-green sm:text-[0.6rem]">
                {STORY_FIXTURE.selectedChannel} → Reserva confirmada
              </span>
              <span className="text-[0.65rem] text-neutral-400 sm:text-xs">{STORY_FIXTURE.appointmentTime}</span>
            </div>
            <p className="story-channel-event-service mt-3 text-base font-medium tracking-[-0.02em] sm:mt-5 sm:text-xl">{STORY_FIXTURE.service}</p>
            <p className="mt-1 text-xs text-neutral-300 sm:text-sm">{STORY_FIXTURE.customer}</p>
            <p className="story-channel-event-venue mt-2 w-fit text-[0.65rem] text-neutral-500 sm:mt-4 sm:text-xs">{STORY_FIXTURE.venue}</p>
          </motion.div>

          {route.ready ? (
            <>
              <motion.svg
                className="pointer-events-none absolute inset-0 z-20 size-full"
                viewBox={`0 0 ${route.width} ${route.height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{ opacity: connectorOpacity }}
              >
                <motion.path data-channel-route-path d={route.path} fill="none"
                  stroke="oklch(0.38 0.006 155 / 0.24)" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <motion.path data-channel-route-active d={route.path} fill="none"
                  stroke="var(--color-avoqado-green)" strokeWidth="1"
                  strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"
                  style={{ pathLength: trackLength }} />
              </motion.svg>
              <motion.span
                data-story-primary-pulse
                aria-hidden="true"
                className="story-primary-pulse pointer-events-none absolute left-0 top-0 z-30 -ml-[0.3125rem] -mt-[0.3125rem] size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green outline outline-[4px] outline-avoqado-green/10"
                style={{ x: pulseX, y: pulseY, scale: pulseScale, opacity: connectorOpacity }}
              />
            </>
          ) : null}
        </div>
      </div>
      <p className="sr-only">Booking Widget produce una reserva confirmada para {STORY_FIXTURE.customer}, con servicio, hora y sucursal.</p>
    </motion.section>
  );
}
