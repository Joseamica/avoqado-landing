import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';

interface Geometry {
  spineX: number;
  nodeY: number[];
}

const ROUTE_TIMES = [0, 0.04, 0.26, 0.4, 0.54, 0.68, 0.82, 0.86, 0.92, 1] as const;

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

export default function CascadeTimeline({
  progress,
  tone,
  children,
}: {
  progress: MotionValue<number>;
  tone: 'dark' | 'light';
  children: ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const geometry = useMotionValue<Geometry>({ spineX: 0, nodeY: [0, 0, 0, 0, 0] });

  useEffect(() => {
    const container = containerRef.current;
    const panel = container?.closest<HTMLElement>('[data-story-panel]');
    if (!container || !panel) return;

    const measure = () => {
      const nodes = Array.from(
        container.querySelectorAll<HTMLElement>('[data-story-cascade-node]'),
      );
      if (nodes.length === 0) return;

      const centers = nodes.map(node => {
        let x = node.offsetWidth / 2;
        let y = node.offsetHeight / 2;
        let current: HTMLElement | null = node;
        while (current && current !== panel) {
          x += current.offsetLeft;
          y += current.offsetTop;
          current = current.offsetParent as HTMLElement | null;
        }
        return current === panel ? { x, y } : null;
      });
      if (centers.some(center => center === null)) return;
      const layoutCenters = centers as Array<{ x: number; y: number }>;
      geometry.set({
        spineX: layoutCenters[0].x - 5,
        nodeY: layoutCenters.map(center => center.y - panel.clientHeight / 2),
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    observer.observe(panel);
    void document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, [geometry]);

  const x = useTransform(() => {
    const { spineX } = geometry.get();
    return interpolateRoute(progress.get(), [0, 0, spineX, spineX, spineX, spineX, spineX, spineX, 0, 0]);
  });
  const y = useTransform(() => {
    const { nodeY } = geometry.get();
    return interpolateRoute(progress.get(), [
      0,
      0,
      nodeY[0] ?? 0,
      nodeY[1] ?? 0,
      nodeY[2] ?? 0,
      nodeY[3] ?? 0,
      nodeY[4] ?? 0,
      nodeY[4] ?? 0,
      0,
      0,
    ]);
  });
  const scale = useTransform(progress, [0, 0.04, 0.12, 0.84, 0.92, 1], [0.75, 0.75, 1, 1, 0.75, 0.75]);
  const connectorWidth = useTransform(() => Math.max(geometry.get().spineX, 0));
  const pathClass = tone === 'dark' ? 'bg-white/12' : 'bg-black/10';

  return (
    <div className="mt-1.5 sm:mt-2">
      <div ref={containerRef} className="relative">
        <span
          data-story-cascade-path
          aria-hidden="true"
          className={`pointer-events-none absolute bottom-3 left-[0.72rem] top-3 w-px sm:left-[0.84rem] ${pathClass}`}
        />
        {children}
      </div>
      <motion.span
        aria-hidden="true"
        className={`pointer-events-none absolute left-[0.3125rem] top-1/2 h-px -translate-y-1/2 ${pathClass}`}
        style={{ width: connectorWidth }}
      />
      <motion.span
        data-story-primary-pulse
        aria-hidden="true"
        className="story-primary-pulse pointer-events-none absolute left-0 top-1/2 z-20 -mt-[0.3125rem] size-2.5 rounded-full border border-avoqado-green/30 bg-avoqado-green outline outline-[4px] outline-avoqado-green/10"
        style={{ x, y, scale }}
      />
    </div>
  );
}
