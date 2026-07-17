# Channels Measured Connector Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore one meaningful green line and pulse that travel from the selected `Booking Widget` row to `Reserva confirmada` without detaching, reversing, or overflowing at any supported viewport.

**Architecture:** `ChannelsScene` will measure two real DOM anchors relative to its visual container with `ResizeObserver`, build one orthogonal SVG path, and derive both the active stroke length and pulse transforms from the same sampled route geometry. Desktop uses the gap between side-by-side panels; mobile uses the free left rail between the selected row and the stacked event card. The static reduced-motion and no-JS stories remain unchanged.

**Tech Stack:** Astro, React 19, TypeScript, Framer Motion, Tailwind CSS, Playwright.

## Global Constraints

- Scope is only `Channels` on homepage `/`; do not modify `/demo`, Payment, Aftercare, scene ordering, or global scroll ranges.
- Visible truth remains exactly `Booking Widget → Reserva confirmada` and the active row remains `Seleccionado`.
- The connector has one source anchor, one target anchor, one SVG route, and one primary pulse.
- The pulse moves once toward the destination and remains there; it never reverses.
- Motion uses only `transform`, `opacity`, and SVG `pathLength`.
- Reduced motion and no-JS retain the existing static relationship without a traveling pulse.
- Required viewports: `1440×900`, `910×691`, `787×701`, `887×502`, `390×844`, and `320×568`.
- Endpoint and pulse alignment tolerance is at most `3px`.

---

### Task 1: Restore a measured, one-way Channels connector

**Files:**
- Modify: `tests/e2e/home-scrollytelling.spec.ts:164-337`
- Modify: `src/components/interactive/home-story/scenes/ChannelsScene.tsx:1-96`
- Modify: `src/components/interactive/home-story/home-story.css:1-61`

**Interfaces:**
- Consumes: `progress: MotionValue<number>`, the existing `ChannelRow`, `STORY_FIXTURE.selectedChannel`, and the `story-channel-visual` responsive grid.
- Produces: `[data-channel-route-source]`, `[data-channel-route-target]`, `[data-channel-route-path]`, `[data-channel-route-active]`, and one `[data-story-primary-pulse]` inside the active Channels scene.

- [ ] **Step 1: Replace the obsolete zero-route assertions with a failing geometry contract**

Rename `confirma la reserva sin rutas ni puntos decorativos` to `conecta Booking Widget con la reserva en un solo sentido`. Keep its existing `moveToLocalProgress` helper and relation/event-opacity assertions, then replace the zero-pulse/zero-route checks with:

```ts
const source = scene.locator('[data-channel-route-source]');
const target = scene.locator('[data-channel-route-target]');
const pulse = scene.locator('[data-story-primary-pulse]:visible');
const route = scene.locator('[data-channel-route-path]');
const activeRoute = scene.locator('[data-channel-route-active]');

await moveToLocalProgress(0.30);
await expect(source).toHaveCount(1);
await expect(target).toHaveCount(1);
await expect(pulse).toHaveCount(1);
await expect(route).toHaveCount(1);
await expect(activeRoute).toHaveCount(1);
await expect(scene.locator('.story-channel-row span.h-px')).toHaveCount(0);
await expect(scene.getByText('Ruta activa', { exact: true })).toHaveCount(0);
await expect(scene.locator('[data-channel-route-summary]:visible'))
  .toHaveText('Booking Widget → Reserva confirmada');

const readPulseDistance = async (destination: typeof source) => pulse.evaluate(
  (pulseElement, destinationElement) => {
    const pulseRect = pulseElement.getBoundingClientRect();
    const destinationRect = (destinationElement as HTMLElement).getBoundingClientRect();
    return Math.hypot(
      pulseRect.left + pulseRect.width / 2 - (destinationRect.left + destinationRect.width / 2),
      pulseRect.top + pulseRect.height / 2 - (destinationRect.top + destinationRect.height / 2),
    );
  },
  await destination.elementHandle(),
);

expect(await readPulseDistance(source)).toBeLessThanOrEqual(3);

const endpoints = await route.evaluate((routeElement, anchors) => {
  const path = routeElement as SVGPathElement;
  const matrix = path.getScreenCTM();
  if (!matrix) throw new Error('Missing channel route matrix');
  const toScreen = (point: DOMPoint) => ({
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  });
  const center = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };
  const start = toScreen(path.getPointAtLength(0));
  const end = toScreen(path.getPointAtLength(path.getTotalLength()));
  const sourceCenter = center(anchors.source as HTMLElement);
  const targetCenter = center(anchors.target as HTMLElement);
  return {
    source: Math.hypot(start.x - sourceCenter.x, start.y - sourceCenter.y),
    target: Math.hypot(end.x - targetCenter.x, end.y - targetCenter.y),
  };
}, {
  source: await source.elementHandle(),
  target: await target.elementHandle(),
});
expect.soft(endpoints.source).toBeLessThanOrEqual(3);
expect.soft(endpoints.target).toBeLessThanOrEqual(3);

const targetDistances: number[] = [];
for (const localProgress of [0.30, 0.40, 0.52, 0.62]) {
  await moveToLocalProgress(localProgress);
  targetDistances.push(await readPulseDistance(target));
  const activeEndpointDistance = await pulse.evaluate((pulseElement, routeElement) => {
    const pulseRect = pulseElement.getBoundingClientRect();
    const pulseCenter = {
      x: pulseRect.left + pulseRect.width / 2,
      y: pulseRect.top + pulseRect.height / 2,
    };
    const path = routeElement as SVGPathElement;
    const matrix = path.getScreenCTM();
    if (!matrix) throw new Error('Missing active channel route matrix');
    const drawnLength = Number.parseFloat(getComputedStyle(path).strokeDasharray);
    const point = path.getPointAtLength(path.getTotalLength() * Math.min(Math.max(drawnLength, 0), 1));
    const endpoint = {
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    };
    return Math.hypot(pulseCenter.x - endpoint.x, pulseCenter.y - endpoint.y);
  }, await activeRoute.elementHandle());
  expect.soft(activeEndpointDistance).toBeLessThanOrEqual(3);
}

for (let index = 1; index < targetDistances.length; index += 1) {
  expect.soft(targetDistances[index]).toBeLessThanOrEqual(targetDistances[index - 1] + 3);
}

for (const localProgress of [0.62, 0.75, 0.88]) {
  await moveToLocalProgress(localProgress);
  expect.soft(await readPulseDistance(target)).toBeLessThanOrEqual(3);
}
```

Update the mobile truth test from `toHaveCount(0)` to `toHaveCount(1)` for the Channels primary pulse. Update the handoff tuple from `[0.105, 'channels', 0]` to `[0.15, 'channels', 1]` so the count is sampled while the connector is intentionally visible.

Rename `mantiene los canales dentro del panel en desktop compacto` to `mantiene el conector dentro del panel en todos los viewports` and replace its viewport list with:

```ts
for (const viewport of [
  { width: 1440, height: 900 },
  { width: 910, height: 691 },
  { width: 787, height: 701 },
  { width: 887, height: 502 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
]) {
```

After moving to Channels, wait for the route measurement:

```ts
await page.evaluate(() => new Promise<void>(resolve => {
  requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
}));
```

Replace the geometry evaluation with this complete contract:

```ts
const geometry = await scene.evaluate(element => {
  const rect = (selector: string) => element.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
  const visual = rect('.story-channel-visual');
  const ledger = rect('.story-channel-ledger');
  const event = rect('.story-channel-event');
  const source = rect('[data-channel-route-source]');
  const target = rect('[data-channel-route-target]');
  const pulse = rect('[data-story-primary-pulse]');
  const path = element.querySelector<SVGPathElement>('[data-channel-route-path]')!;
  const matrix = path.getScreenCTM();
  if (!matrix) throw new Error('Missing responsive channel route matrix');
  const toScreen = (point: DOMPoint) => ({
    x: matrix.a * point.x + matrix.c * point.y + matrix.e,
    y: matrix.b * point.x + matrix.d * point.y + matrix.f,
  });
  const center = (box: DOMRect) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
  const start = toScreen(path.getPointAtLength(0));
  const end = toScreen(path.getPointAtLength(path.getTotalLength()));
  const sourceCenter = center(source);
  const targetCenter = center(target);
  return {
    visual: { top: visual.top, right: visual.right, bottom: visual.bottom, left: visual.left },
    ledger: { top: ledger.top, right: ledger.right, bottom: ledger.bottom, left: ledger.left },
    event: { top: event.top, right: event.right, bottom: event.bottom, left: event.left },
    sourceCenter,
    targetCenter,
    pulseCenter: center(pulse),
    sourceDistance: Math.hypot(start.x - sourceCenter.x, start.y - sourceCenter.y),
    targetDistance: Math.hypot(end.x - targetCenter.x, end.y - targetCenter.y),
    documentWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  };
});

for (const panel of [geometry.ledger, geometry.event]) {
  expect.soft(panel.top).toBeGreaterThanOrEqual(geometry.visual.top - 1);
  expect.soft(panel.bottom).toBeLessThanOrEqual(geometry.visual.bottom + 1);
  expect.soft(panel.left).toBeGreaterThanOrEqual(geometry.visual.left - 1);
  expect.soft(panel.right).toBeLessThanOrEqual(geometry.visual.right + 1);
}
for (const point of [geometry.sourceCenter, geometry.targetCenter, geometry.pulseCenter]) {
  expect.soft(point.x).toBeGreaterThanOrEqual(geometry.visual.left - 1);
  expect.soft(point.x).toBeLessThanOrEqual(geometry.visual.right + 1);
  expect.soft(point.y).toBeGreaterThanOrEqual(geometry.visual.top - 1);
  expect.soft(point.y).toBeLessThanOrEqual(geometry.visual.bottom + 1);
}
expect.soft(geometry.sourceDistance).toBeLessThanOrEqual(3);
expect.soft(geometry.targetDistance).toBeLessThanOrEqual(3);
expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
if (viewport.width < 1024) {
  await expect(page.locator('button[aria-label="Abrir chat de ayuda"]')).toBeHidden();
} else {
  await expect(page.locator('button[aria-label="Abrir chat de ayuda"]')).toBeVisible();
}
```

- [ ] **Step 2: Run the focused tests and verify RED**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro" \
  --project chromium-desktop
```

Expected: FAIL because `[data-channel-route-source]`, `[data-channel-route-path]`, and the Channels primary pulse do not exist; the old tuple also reports zero visible pulses.

- [ ] **Step 3: Add shared route geometry derived from real anchors**

In `ChannelsScene.tsx`, replace the first import and add the React import exactly as follows:

```ts
import { motion, useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, useState, type Ref } from 'react';
```

Add these exact route primitives above `ChannelRow`:

```ts
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
```

Replace the `ChannelRow` signature with:

```ts
function ChannelRow({ channel, index, progress, sourceRef }: {
  channel: Channel;
  index: number;
  progress: MotionValue<number>;
  sourceRef?: Ref<HTMLSpanElement>;
}) {
```

Render this only for the active row, immediately before the closing `</motion.li>`:

```tsx
{channel.active ? (
  <span
    ref={sourceRef}
    data-channel-route-source
    aria-hidden="true"
    className="story-channel-route-source absolute z-20 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-50"
  />
) : null}
```

Inside `ChannelsScene`, add the following state, transforms, and complete measurement effect before the channel data:

```ts
const visualRef = useRef<HTMLDivElement>(null);
const sourceRef = useRef<HTMLSpanElement>(null);
const targetRef = useRef<HTMLSpanElement>(null);
const geometry = useMotionValue<RouteGeometry>({
  x: Array.from({ length: ROUTE_TIMES.length }, () => 0),
  y: Array.from({ length: ROUTE_TIMES.length }, () => 0),
  pathLength: Array.from({ length: ROUTE_TIMES.length }, () => 0),
});
const [route, setRoute] = useState({ width: 1, height: 1, path: 'M 0 0', ready: false });
const eventOpacity = useTransform(progress, [0.46, 0.68], [0, 1]);
const eventY = useTransform(progress, [0.46, 0.70], [14, 0]);
const connectorOpacity = useTransform(progress, [0.24, 0.30], [0, 1]);
const trackLength = useTransform(() => interpolateRoute(progress.get(), geometry.get().pathLength));
const pulseX = useTransform(() => interpolateRoute(progress.get(), geometry.get().x));
const pulseY = useTransform(() => interpolateRoute(progress.get(), geometry.get().y));
const pulseScale = useTransform(progress, [0.30, 0.56, 0.62, 0.72], [0.9, 1, 1.16, 1]);

useEffect(() => {
  const visual = visualRef.current;
  const source = sourceRef.current;
  const target = targetRef.current;
  if (!visual || !source || !target) return;

  let active = true;
  const measure = () => {
    if (!active) return;
    const visualRect = visual.getBoundingClientRect();
    const centerWithinVisual = (element: HTMLElement): RoutePoint => {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left - visualRect.left + rect.width / 2,
        y: rect.top - visualRect.top + rect.height / 2,
      };
    };
    const start = centerWithinVisual(source);
    const destination = centerWithinVisual(target);
    const sideBySide = destination.x - start.x > 80;
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
    setRoute({
      width,
      height,
      path: sideBySide
        ? `M ${start.x} ${start.y} H ${midpointX} V ${destination.y} H ${destination.x}`
        : `M ${start.x} ${start.y} V ${destination.y} H ${destination.x}`,
      ready: true,
    });
  };

  measure();
  const observer = new ResizeObserver(measure);
  observer.observe(visual);
  observer.observe(source);
  observer.observe(target);
  void document.fonts?.ready.then(measure);
  return () => {
    active = false;
    observer.disconnect();
  };
}, [geometry]);
```

Attach `ref={visualRef}` to `.story-channel-visual` and pass `sourceRef={channel.active ? sourceRef : undefined}` to `ChannelRow`. Use the measured route only when `route.ready` is true. Render exactly this conditional block after the event card:

```tsx
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
```

Add the target anchor as a direct child of the event card:

```tsx
<span
  ref={targetRef}
  data-channel-route-target
  aria-hidden="true"
  className="story-channel-route-target absolute z-20 size-2.5 rounded-full border border-avoqado-green/45 bg-neutral-950"
/>
```

Keep event reveal monotonic and begin it during the route: `eventOpacity [0.46, 0.68]`, `eventY [0.46, 0.70]`.

- [ ] **Step 4: Position anchors responsively without animating layout**

Add to `home-story.css`:

```css
.story-channel-route-source {
  left: -0.3125rem;
  top: 50%;
  transform: translateY(-50%);
}

.story-channel-route-target {
  left: 1rem;
  top: -0.3125rem;
}

@media (min-width: 640px) {
  .story-channel-route-source {
    left: auto;
    right: -0.3125rem;
  }

  .story-channel-route-target {
    left: -0.3125rem;
    top: 50%;
    transform: translateY(-50%);
  }
}
```

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro"
```

Expected: the Channels geometry test passes on desktop, mobile, and small; the other projects skip animation-only assertions; no primary-pulse count regression.

- [ ] **Step 6: Commit the measured connector**

```bash
git add \
  src/components/interactive/home-story/scenes/ChannelsScene.tsx \
  src/components/interactive/home-story/home-story.css \
  tests/e2e/home-scrollytelling.spec.ts
git commit -m "fix(homepage): restore measured channel connector"
```

---

### Task 2: Prove responsive containment and release readiness

**Files:**
- Verify: `src/components/interactive/home-story/scenes/ChannelsScene.tsx`
- Verify: `src/components/interactive/home-story/ReducedMotionStory.tsx`
- Verify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**
- Consumes: route/source/target/pulse selectors produced by Task 1.
- Produces: final visual evidence and release verification; no new production interface.

- [ ] **Step 1: Re-run the responsive contract in isolation**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "mantiene el conector dentro del panel" \
  --project chromium-desktop
```

Expected: PASS for all six explicit viewports with zero horizontal overflow and aligned endpoints.

- [ ] **Step 2: Capture final visual checkpoints**

Run this Playwright capture script against `http://127.0.0.1:4330/?motion=full`; it saves generated QA images under `/tmp` and does not add them to git:

```bash
node --input-type=module <<'NODE'
import { chromium } from 'playwright';

const cases = [
  ...[0.30, 0.46, 0.62, 0.88].map(local => ({ width: 910, height: 691, local })),
  ...[
    [1440, 900], [787, 701], [887, 502], [390, 844], [320, 568],
  ].map(([width, height]) => ({ width, height, local: 0.72 })),
];
const browser = await chromium.launch({ headless: true });
for (const item of cases) {
  const page = await browser.newPage({ viewport: { width: item.width, height: item.height } });
  await page.goto('http://127.0.0.1:4330/?motion=full', { waitUntil: 'networkidle' });
  const root = page.locator('[data-story-mode="animated"]');
  await root.evaluate((element, localProgress) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const globalProgress = 0.10 + localProgress * (0.21 - 0.10);
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({
      top: top + (element.scrollHeight - window.innerHeight) * globalProgress,
      behavior: 'auto',
    });
  }, item.local);
  await page.waitForFunction(() =>
    document.querySelector('[data-story-mode="animated"]')?.getAttribute('data-active-scene') === 'channels');
  await page.waitForTimeout(200);
  const suffix = `${item.width}x${item.height}-p${String(item.local).replace('.', '')}`;
  await page.screenshot({ path: `/tmp/channels-measured-${suffix}.png` });
  await page.close();
}
await browser.close();
NODE
```

Inspect each image and require:

- the point touches the selected row at `0.30`;
- the active green line ends exactly under the point while traveling;
- no segment crosses row copy or card copy;
- the point stays on the reservation anchor at `0.62` and `0.88`;
- the route remains inside the sticky visual on all six viewports.

- [ ] **Step 3: Run the full verification gate**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-scrollytelling.spec.ts
npm run build
git diff --check
git status --short
```

Expected: all runnable Playwright tests pass, intentional project skips remain skips, Astro build exits `0` with only the existing Cloudflare/Sentry/prerender warnings, `git diff --check` emits no output, and `git status --short` is clean after the Task 1 commit.
