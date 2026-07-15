# Homepage Three-Result Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the five-entry opening ledger into a brief scroll-controlled proof of reservation, payment-link, and physical-terminal results while keeping one measured connector and making every row result readable.

**Architecture:** Add one typed content model for the three demonstrations, derive the active demonstration and its local route progress from a dedicated scroll motion value, and let the existing measured SVG retarget to the active row. Keep the card shell and destination anchor stable, reserve a real source gutter in side-by-side rows, and expose the same three examples statically in reduced-motion/no-JavaScript modes.

**Tech Stack:** Astro 5, React 18, TypeScript, Framer Motion 12, Tailwind CSS 4, Playwright 1.60

## Global Constraints

- Keep exactly five public entry rows in this order: `Reservación en línea`, `Tienda en línea`, `Liga de pago`, `Punto de venta`, `Terminal de cobro`.
- Animate only `Reservación en línea → Reserva confirmada`, `Liga de pago → Pago recibido`, and `Terminal de cobro → Cobro aprobado`.
- Keep exactly one measured SVG route, one active stroke, one source dot, one destination dot, and one primary pulse.
- Route endpoints must remain within `3px` of the current real source and stable real target.
- Side-by-side row result text and the source dot must remain separated by at least `6px`.
- Required viewports are `1440×900`, `910×691`, `787×701`, `887×502`, `390×844`, and `320×568`.
- Reduced-motion and no-JavaScript modes must expose the three examples statically without a traveling point.
- Do not add images, a sixth entry, controls, timers, provider logos, or changes to `/demo` and the seven later story scenes.
- Preserve the current five-tile measured mosaic handoff, CTA/GTM behavior, video fallback, and noninteractive `pointer-events-none` channel surface.

## File structure

- Create `src/components/interactive/home-opening/opening-channel-results.ts`: typed public content and the pure scroll-segment resolver for the three demonstrations.
- Modify `src/components/interactive/home-opening/opening-tiles.ts`: remove the obsolete static `active` flag; keep only five-entry identity, copy, tile binding, and image data.
- Modify `src/components/interactive/home-opening/ReducedMotionOpening.tsx`: render the three approved examples from the shared result model.
- Modify `src/components/interactive/home-opening/OpeningJourney.tsx`: preserve the old opening pacing with a remapped base motion value, allocate the added sticky-scroll tail, and provide sequence progress.
- Modify `src/components/interactive/home-opening/ChannelHandoff.tsx`: derive the active row/card from sequence progress, retarget measurement when the active id changes, and animate only the content group.
- Modify `src/components/interactive/home-story/home-story.css`: create the desktop/tablet connector gutter and compact responsive spacing.
- Modify `tests/e2e/home-opening.spec.ts`: cover static truth, three active checkpoints, copy, reverse scroll, result/source spacing, and six-viewport overflow.
- Modify `tests/e2e/home-scrollytelling.spec.ts`: replace the single-reservation connector assumptions with three-source measured-route checks while preserving later-scene coverage.

---

### Task 1: Shared demonstration content and static fallbacks

**Files:**
- Create: `src/components/interactive/home-opening/opening-channel-results.ts`
- Modify: `src/components/interactive/home-opening/opening-tiles.ts:30-36,63-69`
- Modify: `src/components/interactive/home-opening/ReducedMotionOpening.tsx:1-54`
- Test: `tests/e2e/home-opening.spec.ts:258-302`

**Interfaces:**
- Consumes: `OpeningChannelId`, `OPENING_CHANNELS`, and `STORY_FIXTURE`.
- Produces: `OpeningChannelDemonstration`, `OPENING_CHANNEL_DEMONSTRATIONS`, and `openingChannelById(id)` for animated and static renderers.

- [ ] **Step 1: Write the failing static-truth test**

Add this near the existing reduced-motion and no-JavaScript tests in `tests/e2e/home-opening.spec.ts`:

```ts
test('exposes the three concise operation results in static modes', async ({ page }, testInfo) => {
  test.skip(!['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');

  const mode = testInfo.project.name === 'chromium-reduced' ? 'static' : 'noscript';
  const opening = page.locator(`[data-opening-mode="${mode}"]`);

  for (const [id, summary, primary, detail, context] of [
    ['online-booking', 'Reservación en línea → Reserva confirmada', 'Facial hidratante', 'María G. · 11:30', 'Sucursal Centro'],
    ['payment-link', 'Liga de pago → Pago recibido', '$1,250', 'Liga enviada por WhatsApp', 'Pago con tarjeta'],
    ['payment-terminal', 'Terminal de cobro → Cobro aprobado', '$348', 'Pago sin contacto', 'Terminal física · Sucursal Centro'],
  ] as const) {
    const result = opening.locator(`[data-channel-static-result="${id}"]`);
    await expect(result).toHaveCount(1);
    await expect(result).toContainText(summary);
    await expect(result).toContainText(primary);
    await expect(result).toContainText(detail);
    await expect(result).toContainText(context);
  }
});
```

- [ ] **Step 2: Run the test and verify the missing static result model fails**

Run:

```bash
npm run test:e2e -- tests/e2e/home-opening.spec.ts --project=chromium-reduced --project=chromium-nojs -g "exposes the three concise operation results"
```

Expected: FAIL because `[data-channel-static-result="online-booking"]` and the other result articles do not exist.

- [ ] **Step 3: Create the shared content model**

Create `src/components/interactive/home-opening/opening-channel-results.ts` with:

```ts
import { STORY_FIXTURE } from '../home-story/story-fixture';
import { OPENING_CHANNELS, type OpeningChannelId } from './opening-tiles';

export interface OpeningChannelDemonstration {
  channelId: OpeningChannelId;
  primary: string;
  detail: string;
  context: string;
  status: string;
}

export const OPENING_CHANNEL_DEMONSTRATIONS = [
  {
    channelId: 'online-booking',
    primary: STORY_FIXTURE.service,
    detail: `${STORY_FIXTURE.customer} · ${STORY_FIXTURE.appointmentTime}`,
    context: STORY_FIXTURE.venue,
    status: STORY_FIXTURE.appointmentTime,
  },
  {
    channelId: 'payment-link',
    primary: '$1,250',
    detail: 'Liga enviada por WhatsApp',
    context: 'Pago con tarjeta',
    status: 'Recibido',
  },
  {
    channelId: 'payment-terminal',
    primary: '$348',
    detail: 'Pago sin contacto',
    context: `Terminal física · ${STORY_FIXTURE.venue}`,
    status: 'Aprobado',
  },
] as const satisfies readonly OpeningChannelDemonstration[];

export function openingChannelById(id: OpeningChannelId) {
  const channel = OPENING_CHANNELS.find(item => item.id === id);
  if (!channel) throw new Error(`Unknown opening channel: ${id}`);
  return channel;
}
```

- [ ] **Step 4: Remove the obsolete static active flag from entry data**

Change the `OpeningChannel` interface and replace the full `OPENING_CHANNELS` value in `opening-tiles.ts` with:

```ts
export interface OpeningChannel {
  id: OpeningChannelId;
  label: string;
  result: string;
  tileId: OpeningTile['id'];
}

export const OPENING_CHANNELS: readonly OpeningChannel[] = [
  { id: 'online-booking', label: 'Reservación en línea', result: 'Reserva confirmada', tileId: 'tile-7' },
  { id: 'online-store', label: 'Tienda en línea', result: 'Pedido recibido', tileId: 'tile-12' },
  { id: 'payment-link', label: 'Liga de pago', result: 'Pago recibido', tileId: 'tile-2' },
  { id: 'point-of-sale', label: 'Punto de venta', result: 'Venta registrada', tileId: 'tile-15' },
  { id: 'payment-terminal', label: 'Terminal de cobro', result: 'Cobro aprobado', tileId: 'tile-10' },
] as const;
```

- [ ] **Step 5: Render all three examples in reduced-motion and no-JavaScript modes**

Replace the `activeChannel` lookup and the single `data-channel-route-summary` block in `ReducedMotionOpening.tsx`. Import the shared model and render:

```tsx
import {
  OPENING_CHANNEL_DEMONSTRATIONS,
  openingChannelById,
} from './opening-channel-results';
```

```tsx
<div data-channel-static-results className="mt-6 grid gap-3 sm:grid-cols-3">
  {OPENING_CHANNEL_DEMONSTRATIONS.map(demonstration => {
    const channel = openingChannelById(demonstration.channelId);
    return (
      <article
        key={demonstration.channelId}
        data-channel-static-result={demonstration.channelId}
        className="border border-black/10 bg-white p-4"
      >
        <strong className="block text-sm font-semibold text-green-800">
          {channel.label} → {channel.result}
        </strong>
        <span className="mt-3 block text-lg font-medium">{demonstration.primary}</span>
        <span className="mt-1 block text-sm text-neutral-600">{demonstration.detail}</span>
        <span className="mt-2 block text-xs text-neutral-500">{demonstration.context}</span>
      </article>
    );
  })}
</div>
```

Do not keep a static `activeChannel` variable after this replacement.

- [ ] **Step 6: Run the focused static tests**

Run the command from Step 2 again.

Expected: 2 passed, 0 failed for the named test across `chromium-reduced` and `chromium-nojs`.

- [ ] **Step 7: Commit the shared truth**

```bash
git add src/components/interactive/home-opening/opening-channel-results.ts src/components/interactive/home-opening/opening-tiles.ts src/components/interactive/home-opening/ReducedMotionOpening.tsx tests/e2e/home-opening.spec.ts
git commit -m "feat(homepage): define three operation results"
```

---

### Task 2: Scroll-driven active result and measured-route retargeting

**Files:**
- Modify: `src/components/interactive/home-opening/opening-channel-results.ts`
- Modify: `src/components/interactive/home-opening/OpeningJourney.tsx:1-76`
- Modify: `src/components/interactive/home-opening/ChannelHandoff.tsx:1-323`
- Test: `tests/e2e/home-opening.spec.ts:72-97`

**Interfaces:**
- Consumes: `OPENING_CHANNEL_DEMONSTRATIONS`, `openingChannelById`, and the existing measured source/target route.
- Produces: `resolveOpeningChannelSequence(progress): { index: number; routeProgress: number }`, `sequenceProgress: MotionValue<number>`, one dynamic `[data-channel-active="true"]`, and card data attributes used by geometry tests.

- [ ] **Step 1: Add the failing three-checkpoint and reverse-scroll test**

Add these constants and helper below `scrollOpeningTo` in `tests/e2e/home-opening.spec.ts`:

```ts
const CHANNEL_SEQUENCE_START = 0.60;
const CHANNEL_SEQUENCE_END = 0.98;

async function scrollChannelSequenceTo(page: Page, progress: number) {
  await scrollOpeningTo(
    page,
    CHANNEL_SEQUENCE_START + progress * (CHANNEL_SEQUENCE_END - CHANNEL_SEQUENCE_START),
  );
}
```

Add this test after the main opening test:

```ts
test('shows reservation, payment-link, and terminal results as scroll advances and reverses', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  const scene = page.locator('[data-opening-channel-handoff]');
  const checkpoints = [
    [0.16, 'online-booking', 'Reservación en línea → Reserva confirmada', 'Facial hidratante', 'María G. · 11:30', 'Sucursal Centro'],
    [0.49, 'payment-link', 'Liga de pago → Pago recibido', '$1,250', 'Liga enviada por WhatsApp', 'Pago con tarjeta'],
    [0.82, 'payment-terminal', 'Terminal de cobro → Cobro aprobado', '$348', 'Pago sin contacto', 'Terminal física · Sucursal Centro'],
  ] as const;

  for (const [progress, id, summary, primary, detail, context] of checkpoints) {
    await scrollChannelSequenceTo(page, progress);
    await expect(scene.locator('[data-channel-active="true"]')).toHaveAttribute('data-channel-id', id);
    await expect(scene.locator('[data-channel-event-content]')).toHaveAttribute('data-channel-event-content', id);
    await expect(scene.locator('[data-channel-route-summary]:visible')).toHaveText(summary);
    await expect(scene.locator('[data-channel-event-primary]:visible')).toHaveText(primary);
    await expect(scene.locator('[data-channel-event-detail]:visible')).toHaveText(detail);
    await expect(scene.locator('[data-channel-event-context]:visible')).toHaveText(context);
  }

  for (const [progress, id] of [
    [0.82, 'payment-terminal'],
    [0.49, 'payment-link'],
    [0.16, 'online-booking'],
  ] as const) {
    await scrollChannelSequenceTo(page, progress);
    await expect(scene.locator('[data-channel-active="true"]')).toHaveAttribute('data-channel-id', id);
    await expect(scene.locator('[data-channel-event-content]')).toHaveAttribute('data-channel-event-content', id);
  }
});
```

- [ ] **Step 2: Run the sequence test and verify it fails on the fixed reservation**

Run:

```bash
npm run test:e2e -- tests/e2e/home-opening.spec.ts --project=chromium-desktop -g "shows reservation, payment-link, and terminal results"
```

Expected: FAIL at the payment-link checkpoint because the active row and card remain `online-booking`.

- [ ] **Step 3: Add a pure sequence resolver to the shared model**

Append this to `opening-channel-results.ts`:

```ts
const ROUTE_DRAW_FRACTION = 0.44;

export function resolveOpeningChannelSequence(progress: number) {
  const clamped = Math.min(Math.max(progress, 0), 1 - Number.EPSILON);
  const scaled = clamped * OPENING_CHANNEL_DEMONSTRATIONS.length;
  const index = Math.min(Math.floor(scaled), OPENING_CHANNEL_DEMONSTRATIONS.length - 1);
  const localProgress = scaled - index;
  return {
    index,
    routeProgress: Math.min(localProgress / ROUTE_DRAW_FRACTION, 1),
  };
}
```

This makes the three equal scroll segments deterministic. The route draws during the first 44% of each segment and holds during the remaining 56%.

- [ ] **Step 4: Allocate the extra scroll tail without slowing the existing opening**

Replace `OpeningJourney.tsx` with:

```tsx
import { useEffect, useRef, useState } from 'react';
import { useScroll, useTransform } from 'framer-motion';
import ChannelHandoff from './ChannelHandoff';
import OpeningMosaic from './OpeningMosaic';
import OpeningVideo from './OpeningVideo';
import SharedTileLayer from './SharedTileLayer';

export interface OpeningJourneyProps {
  variant?: 'mosaic-only' | 'channel-handoff';
  autoplay?: boolean;
}

export default function OpeningJourney({
  variant = 'channel-handoff',
  autoplay = true,
}: OpeningJourneyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [sharedTilesReady, setSharedTilesReady] = useState(false);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    window.dispatchEvent(new CustomEvent('avoqado-ready'));
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setSharedTilesReady(false);
  }, [isMobile]);

  const legacyEnd = isMobile ? 0.52 : 0.56;
  const remappedOpeningProgress = useTransform(
    scrollYProgress,
    [0, legacyEnd],
    [0, 0.84],
    { clamp: true },
  );
  const openingProgress = variant === 'channel-handoff'
    ? remappedOpeningProgress
    : scrollYProgress;
  const channelProgress = useTransform(scrollYProgress, [0.50, 0.62], [0, 1], { clamp: true });
  const sequenceProgress = useTransform(scrollYProgress, [0.60, 0.98], [0, 1], { clamp: true });

  return (
    <div
      ref={rootRef}
      data-opening-mode="animated"
      data-opening-variant={variant}
      className={variant === 'mosaic-only'
        ? 'relative h-[180vh] bg-black'
        : 'relative h-[360vh] bg-black md:h-[400vh]'}
    >
      <div ref={stageRef} className="sticky left-0 top-0 h-screen w-full overflow-hidden">
        <OpeningVideo progress={openingProgress} isMobile={isMobile} autoplay={autoplay} />
        <OpeningMosaic
          progress={openingProgress}
          variant={variant}
          isMobile={isMobile}
          handoffReady={variant === 'channel-handoff' ? sharedTilesReady : false}
        />
        {variant === 'channel-handoff' ? (
          <>
            <ChannelHandoff
              openingProgress={openingProgress}
              progress={channelProgress}
              sequenceProgress={sequenceProgress}
              ready={sharedTilesReady}
            />
            <SharedTileLayer
              rootRef={stageRef}
              progress={openingProgress}
              layoutKey={isMobile ? 'mobile' : 'desktop'}
              onReadyChange={setSharedTilesReady}
            />
          </>
        ) : null}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Make rows consume a dynamic active id**

In `ChannelHandoff.tsx`, import `AnimatePresence`, the shared model, and remove the direct `STORY_FIXTURE` import:

```tsx
import {
  AnimatePresence,
  cancelFrame,
  frame,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import {
  OPENING_CHANNEL_DEMONSTRATIONS,
  openingChannelById,
  resolveOpeningChannelSequence,
} from './opening-channel-results';
import { OPENING_CHANNELS, OPENING_TILES, type OpeningChannelId } from './opening-tiles';
```

Replace `ChannelRow` with:

```tsx
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
```

- [ ] **Step 6: Derive active content and local route progress from scroll**

Change the `ChannelHandoff` prop from `connectorProgress` to `sequenceProgress`, then initialize state immediately after the refs:

```tsx
export default function ChannelHandoff({ openingProgress, progress, sequenceProgress, ready }: {
  openingProgress: MotionValue<number>;
  progress: MotionValue<number>;
  sequenceProgress: MotionValue<number>;
  ready: boolean;
}) {
```

```tsx
  const initialSequence = resolveOpeningChannelSequence(sequenceProgress.get());
  const [activeIndex, setActiveIndex] = useState(initialSequence.index);
  const routeProgress = useMotionValue(initialSequence.routeProgress);
  const activeDemonstration = OPENING_CHANNEL_DEMONSTRATIONS[activeIndex];
  const activeChannel = openingChannelById(activeDemonstration.channelId);
```

Remove the old `const routeProgress = useMotionValue(0)` declaration. Replace the route
state so a measured path records which source row produced it:

```tsx
  const [route, setRoute] = useState({
    width: 1,
    height: 1,
    path: 'M 0 0',
    ready: false,
    channelId: null as OpeningChannelId | null,
  });
```

Then add:

```tsx
  useMotionValueEvent(sequenceProgress, 'change', value => {
    const next = resolveOpeningChannelSequence(value);
    routeProgress.set(next.routeProgress);
    setActiveIndex(current => current === next.index ? current : next.index);
  });
```

Use these transforms instead of the old route/card/connector opacity transforms:

```tsx
  const eventOpacity = useTransform(sequenceProgress, [0, 0.04], [0, 1]);
  const eventY = useTransform(sequenceProgress, [0, 0.04], [8, 0]);
  const connectorOpacity = useTransform(routeProgress, [0, 0.08], [0, 1]);
```

Keep `trackLength`, `pulseX`, `pulseY`, and `pulseScale` derived from the same `routeProgress` and measured geometry.

- [ ] **Step 7: Retarget the measurement effect safely**

At the start of the route measurement effect, after source/target validation, invalidate the old path:

```tsx
    setRoute(current => ({ ...current, ready: false }));
```

Replace the existing `setRoute` call inside `measure` with:

```tsx
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
```

Delete `updateRouteProgress`, its initial call, and the `connectorProgress.on('change', ...)` subscription. Subscribe only for layout remeasurement:

```tsx
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
```

The cleanup continues calling `stopMeasuringProgress()`. Change the effect dependencies to:

```tsx
  }, [activeDemonstration.channelId, geometry, routeProgress, sequenceProgress]);
```

This dependency forces the ref and measured source row to change together. Because
`routeProgress` resets to zero at each segment boundary, the stale path is invisible while
the new geometry is measured.

- [ ] **Step 8: Render the dynamic row source and stable card shell**

Pass dynamic state in the ledger map:

```tsx
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
```

Add `data-channel-demo-index={activeIndex}` to the section. Inside the existing black `.story-channel-event` shell, keep the target span fixed and replace the header/detail paragraphs with:

```tsx
<AnimatePresence initial={false} mode="wait">
  <motion.div
    key={activeDemonstration.channelId}
    data-channel-event-content={activeDemonstration.channelId}
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -4 }}
    transition={{ duration: 0.16, ease: 'easeOut' }}
    className="min-h-[7.5rem] sm:min-h-[9rem]"
  >
    <div className="story-channel-event-header flex items-center justify-between gap-3 border-b border-white/10 pb-2.5 sm:pb-3">
      <span data-channel-route-summary className="text-[0.52rem] font-semibold uppercase leading-tight tracking-[0.08em] text-avoqado-green sm:text-[0.6rem]">
        {activeChannel.label} → {activeChannel.result}
      </span>
      <span className="shrink-0 text-[0.65rem] text-neutral-400 sm:text-xs">
        {activeDemonstration.status}
      </span>
    </div>
    <p data-channel-event-primary className="story-channel-event-service mt-3 text-base font-medium tracking-[-0.02em] sm:mt-5 sm:text-xl">
      {activeDemonstration.primary}
    </p>
    <p data-channel-event-detail className="mt-1 text-xs text-neutral-300 sm:text-sm">
      {activeDemonstration.detail}
    </p>
    <p data-channel-event-context className="story-channel-event-venue mt-2 w-fit text-[0.65rem] text-neutral-500 sm:mt-4 sm:text-xs">
      {activeDemonstration.context}
    </p>
  </motion.div>
</AnimatePresence>
```

Finally, change the existing SVG/pulse condition from `route.ready` to:

```tsx
{route.ready && route.channelId === activeDemonstration.channelId ? (
```

Keep the existing SVG and pulse children and closing `) : null}` unchanged. This ownership
check prevents the previous row's valid path from flashing for one frame if the scroll jumps
directly into the middle of another segment.

Replace the reservation-only screen-reader paragraph with:

```tsx
<p className="sr-only">
  {OPENING_CHANNEL_DEMONSTRATIONS.map(demonstration => {
    const channel = openingChannelById(demonstration.channelId);
    return `${channel.label} produce ${channel.result}. `;
  })}
</p>
```

- [ ] **Step 9: Run the sequence test and the existing main-opening test**

Run:

```bash
npm run test:e2e -- tests/e2e/home-opening.spec.ts --project=chromium-desktop -g "shows reservation, payment-link, and terminal results|restores the approved homepage opening"
```

Expected: both named tests pass. Update the main-opening assertion at its final `0.97` checkpoint to expect `Terminal de cobro → Cobro aprobado`, because the final readable plateau is now the terminal result.

- [ ] **Step 10: Commit the scroll-controlled result sequence**

```bash
git add src/components/interactive/home-opening/opening-channel-results.ts src/components/interactive/home-opening/OpeningJourney.tsx src/components/interactive/home-opening/ChannelHandoff.tsx tests/e2e/home-opening.spec.ts
git commit -m "feat(homepage): sequence three channel results"
```

---

### Task 3: Connector gutter and three-source geometry coverage

**Files:**
- Modify: `src/components/interactive/home-story/home-story.css:5-25,52-70,129-170,426-454`
- Modify: `tests/e2e/home-opening.spec.ts:143-258`
- Modify: `tests/e2e/home-scrollytelling.spec.ts:286-503,510-640`

**Interfaces:**
- Consumes: dynamic `data-channel-active`, `data-channel-route-source`, stable `data-channel-route-target`, and the one measured SVG from Task 2.
- Produces: at least `6px` result/source separation on side-by-side layouts and `≤3px` route/pulse geometry at all three demonstration checkpoints.

- [ ] **Step 1: Replace the single-reservation geometry test with a failing three-source matrix**

In `tests/e2e/home-scrollytelling.spec.ts`, replace the test named `conecta la reservación en línea con la reserva en un solo sentido` with:

```ts
test('retargets one measured connector across the three opening results', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/?motion=full');

  const opening = page.locator('[data-opening-mode="animated"]');
  const scene = opening.locator('[data-opening-channel-handoff]');
  const sequenceStart = 0.60;
  const sequenceEnd = 0.98;
  const moveTo = async (progress: number) => {
    await scrollOpeningTo(page, sequenceStart + progress * (sequenceEnd - sequenceStart));
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
  };

  for (const [progress, id] of [
    [0.16, 'online-booking'],
    [0.49, 'payment-link'],
    [0.82, 'payment-terminal'],
    [0.49, 'payment-link'],
    [0.16, 'online-booking'],
  ] as const) {
    await moveTo(progress);
    const activeRow = scene.locator('[data-channel-active="true"]');
    const source = scene.locator('[data-channel-route-source]');
    const target = scene.locator('[data-channel-route-target]');
    const route = scene.locator('[data-channel-route-path]');
    const activeRoute = scene.locator('[data-channel-route-active]');
    const pulse = scene.locator('[data-story-primary-pulse]:visible');

    await expect(activeRow).toHaveAttribute('data-channel-id', id);
    await expect(source).toHaveCount(1);
    await expect(target).toHaveCount(1);
    await expect(route).toHaveCount(1);
    await expect(activeRoute).toHaveCount(1);
    await expect(pulse).toHaveCount(1);

    const distances = await route.evaluate((routeElement, anchors) => {
      const path = routeElement as SVGPathElement;
      const active = document.querySelector<SVGPathElement>('[data-channel-route-active]')!;
      const pulseElement = document.querySelector<HTMLElement>('[data-opening-channel-handoff] [data-story-primary-pulse]')!;
      const matrix = path.getScreenCTM();
      const activeMatrix = active.getScreenCTM();
      if (!matrix || !activeMatrix) throw new Error('Missing opening route matrix');
      const center = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      };
      const screenPoint = (point: DOMPoint, transform: DOMMatrix) => ({
        x: transform.a * point.x + transform.c * point.y + transform.e,
        y: transform.b * point.x + transform.d * point.y + transform.f,
      });
      const sourceCenter = center(anchors.source as HTMLElement);
      const targetCenter = center(anchors.target as HTMLElement);
      const pulseCenter = center(pulseElement);
      const start = screenPoint(path.getPointAtLength(0), matrix);
      const end = screenPoint(path.getPointAtLength(path.getTotalLength()), matrix);
      const drawn = Math.min(Math.max(Number.parseFloat(getComputedStyle(active).strokeDasharray), 0), 1);
      const activeEnd = screenPoint(active.getPointAtLength(active.getTotalLength() * drawn), activeMatrix);
      return {
        source: Math.hypot(start.x - sourceCenter.x, start.y - sourceCenter.y),
        target: Math.hypot(end.x - targetCenter.x, end.y - targetCenter.y),
        activeTarget: Math.hypot(activeEnd.x - targetCenter.x, activeEnd.y - targetCenter.y),
        pulseActive: Math.hypot(pulseCenter.x - activeEnd.x, pulseCenter.y - activeEnd.y),
      };
    }, {
      source: await source.elementHandle(),
      target: await target.elementHandle(),
    });

    expect.soft(distances.source, `${id} source`).toBeLessThanOrEqual(3);
    expect.soft(distances.target, `${id} target`).toBeLessThanOrEqual(3);
    expect.soft(distances.activeTarget, `${id} active route docks`).toBeLessThanOrEqual(3);
    expect.soft(distances.pulseActive, `${id} pulse follows active route`).toBeLessThanOrEqual(3);
  }
});
```

- [ ] **Step 2: Add the failing result/source separation assertion**

Inside the six-viewport test `mantiene el conector dentro del panel en todos los viewports`, iterate the three sequence checkpoints instead of one reservation checkpoint. Add `result` to the evaluated geometry:

```ts
const result = rect('[data-channel-active="true"] .story-channel-result');
```

Return `result: { top, right, bottom, left }` and assert on side-by-side viewports:

```ts
if (viewport.width >= 640) {
  expect.soft(
    geometry.sourceCenter.x - geometry.result.right,
    `${viewport.width}×${viewport.height} result/source gutter`,
  ).toBeGreaterThanOrEqual(6);
}
```

Before the CSS change, expected: FAIL because the current source dot overlaps or sits immediately against the result's right edge.

- [ ] **Step 3: Reserve a real route gutter on side-by-side rows**

Update the top-level source rules in `home-story.css` to:

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
  .story-channel-row {
    padding-right: 1.5rem;
  }

  .story-channel-route-source {
    left: auto;
    right: 0.25rem;
  }

  .story-channel-route-target {
    left: -0.3125rem;
    top: 50%;
    transform: translateY(-50%);
  }
}
```

Keep `.story-channel-result` right-aligned and allow natural wrapping at narrow ledger widths. Do not use `white-space: nowrap`, which would break the `787×701` and compact-height layouts.

- [ ] **Step 4: Update compact layout rules without removing the gutter**

Where compact media queries override `.story-channel-row`, preserve the existing vertical padding/grid sizing but do not reset `padding-right` for widths `>=640px`. For widths `<640px`, add:

```css
@media (max-width: 639px) {
  [data-opening-channel-handoff] .story-channel-row {
    padding-right: 0;
  }
}
```

The mobile source stays on the left rail; the result remains on the right and needs no right-side gutter.

- [ ] **Step 5: Update opening viewport checkpoints for the remapped timeline**

In `tests/e2e/home-opening.spec.ts`, change opening viewport checkpoints to:

```ts
const checkpoints = [0.02, 0.36, 0.48, 0.56, 0.66, 0.79, 0.97];
```

Change the shared-tile travel samples from `[0.64, 0.71, 0.80]` to `[0.43, 0.48, 0.54]`, and dock the six-viewport shared-tile test at `0.54`. These raw values correspond to the preserved virtual ranges `[0.62, 0.71, 0.80]` after the desktop `0 → 0.56` to `0 → 0.84` remap.

- [ ] **Step 6: Run the dynamic connector and viewport tests**

Run:

```bash
npm run test:e2e -- tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-opening.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-small -g "retargets one measured connector|mantiene el conector dentro|keeps every opening checkpoint|docks all five shared tiles"
```

Expected: all selected tests pass at all applicable projects; endpoint errors are `≤3px`, side-by-side text/dot gaps are `≥6px`, and document overflow is `≤1px`.

- [ ] **Step 7: Commit the readable measured connector**

```bash
git add src/components/interactive/home-story/home-story.css tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "fix(homepage): separate results from channel connector"
```

---

### Task 4: Regression reconciliation and final visual verification

**Files:**
- Modify: `tests/e2e/home-opening.spec.ts` only if stale single-reservation assertions remain
- Modify: `tests/e2e/home-scrollytelling.spec.ts` only if stale single-reservation assertions remain
- Verify: all files changed by Tasks 1–3

**Interfaces:**
- Consumes: the complete three-result handoff.
- Produces: a clean build, full E2E pass, verified desktop/mobile visuals, and no unrelated worktree changes.

- [ ] **Step 1: Find and replace stale single-reservation assumptions**

Run:

```bash
rg -n "activeChannel|channel\.active|connectorProgress|Reservación en línea → Reserva confirmada|Reserva confirmada" src/components/interactive/home-opening tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
```

Expected source result: no `channel.active` or `connectorProgress`. Reservation copy remains in the shared model and first-checkpoint assertions. Any assertion performed at final opening progress `0.97` must expect `Terminal de cobro → Cobro aprobado`; assertions that only check document truth may continue checking all three summaries.

- [ ] **Step 2: Run formatting/type/build validation**

Run:

```bash
git diff --check
npm run build
```

Expected: `git diff --check` exits `0`; Astro build exits `0` with no TypeScript or module errors.

- [ ] **Step 3: Run the complete E2E suite**

Run:

```bash
npm run test:e2e
```

Expected: every applicable Playwright test passes across desktop, mobile, small, reduced-motion, and no-JavaScript projects; project-specific skips remain intentional.

- [ ] **Step 4: Inspect the three approved desktop frames in the live preview**

With the existing development server on port `4330`, open `http://127.0.0.1:4330/?motion=full` and inspect sequence progress `0.16`, `0.49`, and `0.82`. Verify:

- `Reserva confirmada` is fully readable and separated from the point;
- the pale green row moves to `Liga de pago` and then `Terminal de cobro`;
- card text changes to the approved values without shell-size jumps;
- each new line begins at the active row and ends at the black card;
- no stale connector flashes during retargeting.

Repeat at `390×844` and `320×568`, confirming the left-side mobile route does not cross row copy.

- [ ] **Step 5: Review the final worktree boundary**

Run:

```bash
git status --short
git diff --stat HEAD~3..HEAD
```

Expected: only the planned source, CSS, tests, result model, spec/plan documents, and pre-existing untracked `test-results/` are present. Do not stage `test-results/`.

- [ ] **Step 6: Commit any assertion-only reconciliation if Step 1 changed tests**

If Step 1 required edits, run:

```bash
git add tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "test(homepage): cover three-result handoff regression"
```

If Step 1 required no edits, do not create an empty commit.
