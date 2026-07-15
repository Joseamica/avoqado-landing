import { cancelFrame, frame, motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useState, type RefObject } from 'react';
import { OPENING_CHANNELS, OPENING_TILES, type OpeningChannelId } from './opening-tiles';

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface Geometry {
  source: Box;
  target: Box;
}

type GeometryMap = Partial<Record<OpeningChannelId, Geometry>>;

function boxWithin(root: HTMLElement, element: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    left += current.offsetLeft;
    top += current.offsetTop;
    const transform = getComputedStyle(current).transform;
    if (transform !== 'none') {
      const matrix = new DOMMatrixReadOnly(transform);
      left += matrix.m41;
      top += matrix.m42;
    }
    current = current.offsetParent as HTMLElement | null;
  }
  if (current === root) {
    return {
      left,
      top,
      width: element.offsetWidth,
      height: element.offsetHeight,
    };
  }
  const rootRect = root.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    left: rect.left - rootRect.left,
    top: rect.top - rootRect.top,
    width: rect.width,
    height: rect.height,
  };
}

function SharedTile({
  channel,
  geometry,
  progress,
}: {
  channel: (typeof OPENING_CHANNELS)[number];
  geometry: Geometry;
  progress: MotionValue<number>;
}) {
  const travel = useTransform(progress, [0.62, 0.80], [0, 1], { clamp: true });
  const opacity = useTransform(progress, [0.615, 0.625, 0.795, 0.805], [0, 1, 1, 0]);
  const x = useTransform(travel, value => (geometry.target.left - geometry.source.left) * value);
  const y = useTransform(travel, value => (geometry.target.top - geometry.source.top) * value);
  const scaleX = useTransform(
    travel,
    value => 1 + ((geometry.target.width / geometry.source.width) - 1) * value,
  );
  const scaleY = useTransform(
    travel,
    value => 1 + ((geometry.target.height / geometry.source.height) - 1) * value,
  );
  const tile = OPENING_TILES.find(item => item.id === channel.tileId)!;

  return (
    <motion.img
      data-shared-tile-overlay={channel.id}
      src={tile.src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute z-40 origin-top-left rounded-lg object-cover"
      style={{
        left: geometry.source.left,
        top: geometry.source.top,
        width: geometry.source.width,
        height: geometry.source.height,
        x,
        y,
        scaleX,
        scaleY,
        opacity,
      }}
    />
  );
}

export default function SharedTileLayer({
  rootRef,
  progress,
  layoutKey,
  onReadyChange,
}: {
  rootRef: RefObject<HTMLDivElement | null>;
  progress: MotionValue<number>;
  layoutKey: 'desktop' | 'mobile';
  onReadyChange: (ready: boolean) => void;
}) {
  const [geometry, setGeometry] = useState<GeometryMap>({});

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    setGeometry({});
    onReadyChange(false);
    let active = true;

    const measure = () => {
      if (!active) return;
      const next: GeometryMap = {};
      for (const channel of OPENING_CHANNELS) {
        const source = root.querySelector<HTMLElement>(
          `[data-shared-tile-source="${channel.id}"]`,
        );
        const target = root.querySelector<HTMLElement>(
          `[data-shared-tile-target="${channel.id}"]`,
        );
        if (!source || !target) continue;
        const sourceBox = boxWithin(root, source);
        const targetBox = boxWithin(root, target);
        if (
          sourceBox.width <= 0
          || sourceBox.height <= 0
          || targetBox.width <= 0
          || targetBox.height <= 0
        ) continue;
        next[channel.id] = { source: sourceBox, target: targetBox };
      }
      if (Object.keys(next).length === OPENING_CHANNELS.length) setGeometry(next);
    };

    const schedule = () => frame.postRender(measure);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    for (const channel of OPENING_CHANNELS) {
      const source = root.querySelector<HTMLElement>(
        `[data-shared-tile-source="${channel.id}"]`,
      );
      const target = root.querySelector<HTMLElement>(
        `[data-shared-tile-target="${channel.id}"]`,
      );
      if (source) observer.observe(source);
      if (target) observer.observe(target);
    }
    schedule();
    const stopMeasuringProgress = progress.on('change', schedule);
    void document.fonts?.ready.then(schedule);
    return () => {
      active = false;
      stopMeasuringProgress();
      cancelFrame(schedule);
      cancelFrame(measure);
      observer.disconnect();
    };
  }, [layoutKey, onReadyChange, progress, rootRef]);

  useEffect(() => {
    onReadyChange(Object.keys(geometry).length === OPENING_CHANNELS.length);
  }, [geometry, onReadyChange]);

  return (
    <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
      {OPENING_CHANNELS.map(channel => geometry[channel.id] ? (
        <SharedTile
          key={channel.id}
          channel={channel}
          geometry={geometry[channel.id]!}
          progress={progress}
        />
      ) : null)}
    </div>
  );
}
