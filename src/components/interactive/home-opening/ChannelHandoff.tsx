import {
  cancelFrame,
  frame,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { useEffect, useRef, useState, type Ref } from 'react';
import NarrativeAnchor from '../home-story/NarrativeAnchor';
import '../home-story/home-story.css';
import { smoothstep, useNarrativeVisualMotion } from '../home-story/story-motion';
import {
  OPENING_CHANNEL_DEMONSTRATIONS,
  OPENING_CHANNEL_NARRATIVE,
  openingChannelById,
  resolveOpeningChannelSequence,
  type OpeningChannelDemonstration,
} from './opening-channel-results';
import { OPENING_CHANNELS, OPENING_TILES, type OpeningChannelId } from './opening-tiles';

interface RoutePoint { x: number; y: number }
interface RouteGeometry { x: number[]; y: number[]; pathLength: number[] }

const ROUTE_TIMES = [0, 0.30, 0.40, 0.52, 0.62, 1] as const;
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

function ChannelTarget({ channel, progress }: {
  channel: (typeof OPENING_CHANNELS)[number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [0.795, 0.805], [0, 1]);
  const tile = OPENING_TILES.find(item => item.id === channel.tileId)!;

  return (
    <motion.span
      data-shared-tile-target={channel.id}
      style={{ opacity }}
      className="block h-10 w-12 overflow-hidden rounded-lg bg-neutral-200"
      aria-hidden="true"
    >
      <img src={tile.src} alt="" className="size-full object-cover" />
    </motion.span>
  );
}

function ChannelRow({ channel, index, progress, openingProgress, active, sourceRef }: {
  channel: (typeof OPENING_CHANNELS)[number];
  index: number;
  progress: MotionValue<number>;
  openingProgress: MotionValue<number>;
  active: boolean;
  sourceRef?: Ref<HTMLSpanElement>;
}) {
  const start = 0.06 + index * 0.08;
  const opacity = useTransform(progress, [start, start + 0.18], [0.35, 1]);
  const x = useTransform(progress, [start, start + 0.18], [-14, 0]);

  return (
    <motion.li
      data-channel-id={channel.id}
      data-channel-active={active ? 'true' : undefined}
      style={{ opacity, x }}
      className={active
        ? 'story-channel-row relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 bg-green-100/70 py-3 text-green-950'
        : 'story-channel-row relative grid grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-black/8 py-3 text-neutral-700'}
    >
      <ChannelTarget channel={channel} progress={openingProgress} />
      <strong>{channel.label}</strong>
      <span className="story-channel-result text-right leading-tight">{channel.result}</span>
      {active ? (
        <span
          ref={sourceRef}
          data-channel-route-source
          aria-hidden="true"
          className="story-channel-route-source absolute z-20 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-50"
        />
      ) : null}
    </motion.li>
  );
}

const CHANNEL_EVENT_OPACITY = [
  { input: [0, 0.28, 0.32, 0.39, 0.43], output: [0, 0, 1, 1, 0] },
  { input: [0.43, 0.47, 0.54, 0.58], output: [0, 1, 1, 0] },
  { input: [0.58, 0.62, 1], output: [0, 1, 1] },
] as const;

function useChannelOpacity(progress: MotionValue<number>, index: number) {
  const ranges = CHANNEL_EVENT_OPACITY[index];
  return useTransform(progress, [...ranges.input], [...ranges.output], { ease: smoothstep });
}

function ChannelThreadContent({ demonstration, index, activeIndex, progress }: {
  demonstration: OpeningChannelDemonstration;
  index: number;
  activeIndex: number;
  progress: MotionValue<number>;
}) {
  const opacity = useChannelOpacity(progress, index);
  const channel = openingChannelById(demonstration.channelId);
  return (
    <motion.span
      data-channel-thread={demonstration.channelId}
      data-active={index === activeIndex ? 'true' : 'false'}
      aria-hidden={index === activeIndex ? undefined : 'true'}
      className="col-start-1 row-start-1"
      style={{ opacity }}
    >
      {channel.label} → {channel.result}
    </motion.span>
  );
}

function ChannelEventContent({
  demonstration,
  index,
  activeIndex,
  progress,
}: {
  demonstration: OpeningChannelDemonstration;
  index: number;
  activeIndex: number;
  progress: MotionValue<number>;
}) {
  const opacity = useChannelOpacity(progress, index);
  const channel = openingChannelById(demonstration.channelId);

  return (
    <motion.div
      data-channel-event-content={demonstration.channelId}
      data-active={index === activeIndex ? 'true' : 'false'}
      data-story-step={demonstration.channelId === 'online-booking'
        ? 'booking'
        : demonstration.channelId === 'payment-link'
          ? 'payment-link'
          : 'terminal'}
      className="absolute inset-0"
      style={{ opacity, pointerEvents: 'none' }}
    >
      <div className="story-channel-event-header flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 sm:pb-3">
        <span data-channel-route-summary className="text-[0.52rem] font-semibold uppercase leading-tight tracking-[0.08em] text-avoqado-green sm:text-[0.6rem]">
          {channel.label} → {channel.result}
        </span>
        <span className="shrink-0 text-[0.65rem] text-neutral-400 sm:text-xs">
          {demonstration.status}
        </span>
      </div>
      <p data-channel-event-primary className="story-channel-event-service mt-3 text-base font-medium tracking-[-0.02em] sm:mt-5 sm:text-xl">
        {demonstration.primary}
      </p>
      <p data-channel-event-detail className="mt-1 text-xs text-neutral-300 sm:text-sm">
        {demonstration.detail}
      </p>
      <p data-channel-event-context className="story-channel-event-venue mt-2 w-fit text-[0.65rem] text-neutral-500 sm:mt-4 sm:text-xs">
        {demonstration.context}
      </p>
    </motion.div>
  );
}

export default function ChannelHandoff({ openingProgress, progress, sequenceProgress, ready }: {
  openingProgress: MotionValue<number>;
  progress: MotionValue<number>;
  sequenceProgress: MotionValue<number>;
  ready: boolean;
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const sourceRef = useRef<HTMLSpanElement>(null);
  const targetRef = useRef<HTMLSpanElement>(null);
  const initialSequence = resolveOpeningChannelSequence(sequenceProgress.get());
  const [activeIndex, setActiveIndex] = useState(initialSequence.index);
  const routeProgress = useMotionValue(initialSequence.routeProgress);
  const routeOpacity = useMotionValue(initialSequence.routeOpacity);
  const [routeStarted, setRouteStarted] = useState(initialSequence.started);
  const visualMotion = useNarrativeVisualMotion(sequenceProgress);
  const activeDemonstration = OPENING_CHANNEL_DEMONSTRATIONS[activeIndex];
  const activeChannel = openingChannelById(activeDemonstration.channelId);
  const geometry = useMotionValue<RouteGeometry>({
    x: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    y: Array.from({ length: ROUTE_TIMES.length }, () => 0),
    pathLength: Array.from({ length: ROUTE_TIMES.length }, () => 0),
  });
  const [route, setRoute] = useState({
    width: 1,
    height: 1,
    path: 'M 0 0',
    ready: false,
    channelId: null as OpeningChannelId | null,
  });
  const [channelActive, setChannelActive] = useState(() => progress.get() > 0.05);
  const openingVisible = useInView(sectionRef, { amount: 0.1 });
  const trackLength = useTransform(() => interpolateRoute(routeProgress.get(), geometry.get().pathLength));
  const pulseX = useTransform(() => interpolateRoute(routeProgress.get(), geometry.get().x));
  const pulseY = useTransform(() => interpolateRoute(routeProgress.get(), geometry.get().y));
  const pulseScale = useTransform(routeProgress, [0.30, 0.56, 0.62, 0.72], [0.9, 1, 1.16, 1]);

  useMotionValueEvent(progress, 'change', value => {
    const active = value > 0.05;
    setChannelActive(current => current === active ? current : active);
  });

  useEffect(() => {
    setChannelActive(progress.get() > 0.05);
  }, [progress]);

  useMotionValueEvent(sequenceProgress, 'change', value => {
    const next = resolveOpeningChannelSequence(value);
    routeProgress.set(next.routeProgress);
    routeOpacity.set(next.routeOpacity);
    setRouteStarted(current => current === next.started ? current : next.started);
    setActiveIndex(current => current === next.index ? current : next.index);
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

    setRoute(current => ({ ...current, ready: false }));

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
        current.width === width
          && current.height === height
          && current.path === path
          && current.ready
          && current.channelId === activeDemonstration.channelId
          ? current
          : {
              width,
              height,
              path,
              ready: true,
              channelId: activeDemonstration.channelId,
            }
      ));
    };

    const scheduleMeasure = () => {
      if (active) frame.postRender(measure);
    };

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
    const stopMeasuringProgress = sequenceProgress.on('change', scheduleMeasure);
    void document.fonts?.ready.then(scheduleMeasure);
    return () => {
      active = false;
      stopMeasuringProgress();
      cancelFrame(scheduleMeasure);
      cancelFrame(measure);
      observer.disconnect();
      transformObserver.disconnect();
    };
  }, [activeDemonstration.channelId, geometry, routeProgress, sequenceProgress]);

  const surfaceOpacity = useTransform(progress, [0, 0.12], [0, 1]);
  const activeThread = (
    <span className="inline-grid min-w-0">
      {OPENING_CHANNEL_DEMONSTRATIONS.map((demonstration, index) => (
        <ChannelThreadContent
          key={demonstration.channelId}
          demonstration={demonstration}
          index={index}
          activeIndex={activeIndex}
          progress={sequenceProgress}
        />
      ))}
    </span>
  );

  return (
    <motion.section
      ref={sectionRef}
      data-opening-channel-handoff
      data-story-scene="channels"
      data-channel-demo-index={activeIndex}
      data-channel-route-started={routeStarted ? 'true' : 'false'}
      data-active={channelActive && openingVisible ? 'true' : 'false'}
      aria-labelledby="opening-channels-title"
      style={{
        opacity: ready ? surfaceOpacity : 0,
        visibility: channelActive ? 'visible' : 'hidden',
      }}
      className="pointer-events-none absolute inset-0 z-30 bg-neutral-50 text-neutral-950"
    >
      <div className="mx-auto grid h-full max-w-7xl content-center gap-6 px-5 pb-8 pt-[calc(var(--site-header-height)+1rem)] md:grid-cols-[minmax(220px,.7fr)_minmax(0,1.3fr)] md:items-center md:gap-10 md:px-10">
        <NarrativeAnchor
          narrative={OPENING_CHANNEL_NARRATIVE}
          progress={sequenceProgress}
          thread={activeThread}
          headingId="opening-channels-title"
          light
        />
        <motion.div
          ref={visualRef}
          data-narrative-visual
          className="story-channel-visual relative grid h-full min-h-0 content-center gap-3 sm:grid-cols-[minmax(260px,1.05fr)_minmax(220px,0.8fr)] sm:items-center sm:gap-8"
          style={visualMotion}
        >
          <div className="story-channel-ledger relative border-y border-black/10 bg-neutral-50">
            <p className="border-b border-black/8 px-3 py-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-neutral-400 sm:py-3 sm:text-[0.65rem]">
              Entradas de la operación
            </p>
            <ol>
              {OPENING_CHANNELS.map((channel, index) => {
                const active = channel.id === activeChannel.id;
                return (
                  <ChannelRow
                    key={channel.id}
                    channel={channel}
                    index={index}
                    progress={progress}
                    openingProgress={openingProgress}
                    active={active}
                    sourceRef={active ? sourceRef : undefined}
                  />
                );
              })}
            </ol>
          </div>

          <div
            className="story-channel-event relative border border-white/8 bg-neutral-950 px-4 py-3.5 text-neutral-50 shadow-[0_20px_60px_oklch(0.13_0.005_155_/_0.16)] sm:px-5 sm:py-5"
          >
            <span
              ref={targetRef}
              data-channel-route-target
              aria-hidden="true"
              className="story-channel-route-target absolute z-20 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-950"
            />
            <div className="relative min-h-[7.5rem] sm:min-h-[9rem]">
              {OPENING_CHANNEL_DEMONSTRATIONS.map((demonstration, index) => (
                <ChannelEventContent
                  key={demonstration.channelId}
                  demonstration={demonstration}
                  index={index}
                  activeIndex={activeIndex}
                  progress={sequenceProgress}
                />
              ))}
            </div>
          </div>

          {route.ready && route.channelId === activeDemonstration.channelId ? (
            <>
              <motion.svg
                data-channel-route
                className="pointer-events-none absolute inset-0 z-20 size-full"
                viewBox={`0 0 ${route.width} ${route.height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
                style={{ opacity: routeOpacity, visibility: routeStarted ? 'visible' : 'hidden' }}
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
                style={{ x: pulseX, y: pulseY, scale: pulseScale, opacity: routeOpacity, visibility: routeStarted ? 'visible' : 'hidden' }}
              />
            </>
          ) : null}
        </motion.div>
      </div>
      <p className="sr-only">
        {OPENING_CHANNEL_DEMONSTRATIONS.map(demonstration => {
          const channel = openingChannelById(demonstration.channelId);
          return `${channel.label} produce ${channel.result}. `;
        })}
      </p>
    </motion.section>
  );
}
