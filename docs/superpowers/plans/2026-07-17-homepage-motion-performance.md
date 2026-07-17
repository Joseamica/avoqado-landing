# Homepage Motion Profiles and Scroll Performance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the complete homepage story available under every motion preference while removing progress-driven layout measurement and reducing startup contention.

**Architecture:** Resolve an explicit motion profile and an independent media profile at the `HomepageStory` boundary. Full motion keeps the approved visual experience but animates cached geometry; reduced motion presents the same narrative as viewport-sized static chapters. Root-only analytics loading and a lighter opening video keep third-party and media work out of the critical hydration path.

**Tech Stack:** Astro 5, React 18, TypeScript, Framer Motion 12, Tailwind CSS 4, Playwright 1.60, Cloudflare middleware, ffmpeg/ffprobe.

## Global Constraints

- `/legacy` remains unchanged.
- Preserve all approved homepage copy, scene order, CTAs, FAQ, footer, chatbot, navigation, and illustrated closing.
- Do not infer device quality from RAM or device model.
- `prefers-reduced-motion` changes animation intensity, not story content.
- Save-Data and `slow-2g`/`2g` change media delivery only.
- `?motion=full` and `?motion=reduced` are explicit overrides.
- Geometry may be measured after mount, font readiness, layout changes, resize, or active-channel changes; never on every scroll-progress change.
- Keep regional consent behavior and attribution data intact.
- Run scroll-heavy Playwright suites with `--workers=1`.

---

## File map

- Create `src/components/interactive/home-story/experience-profile.ts`: pure profile resolution and browser connection types.
- Modify `src/components/interactive/home-story/HomepageStory.tsx`: select and expose the motion/media profiles.
- Modify `src/components/interactive/home-opening/ReducedMotionOpening.tsx`: split the opening into sequential reduced-motion chapters.
- Modify `src/components/interactive/home-story/ReducedMotionStory.tsx`: expose reduced chapters consistently.
- Modify `src/components/interactive/home-opening/OpeningJourney.tsx`: accept and forward the media profile.
- Modify `src/components/interactive/home-opening/OpeningVideo.tsx`: omit video in lite-media mode.
- Modify `src/components/interactive/home-opening/SharedTileLayer.tsx`: cache stable tile geometry.
- Modify `src/components/interactive/home-opening/ChannelHandoff.tsx`: cache route geometry per active channel.
- Modify `src/middleware.ts`: defer root-only external analytics bootstrap without changing consent defaults.
- Replace `public/video4.webm`: remove audio and reduce transfer size.
- Create `tests/e2e/home-motion-profiles.spec.ts`: profile selection and reduced-story coverage.
- Create `tests/e2e/home-opening-performance.spec.ts`: geometry-read and media regressions.
- Create `tests/e2e/home-analytics-loading.spec.ts`: deferred root analytics behavior.

---

### Task 1: Explicit motion and media profiles

**Files:**
- Create: `src/components/interactive/home-story/experience-profile.ts`
- Modify: `src/components/interactive/home-story/HomepageStory.tsx`
- Create: `tests/e2e/home-motion-profiles.spec.ts`

**Interfaces:**
- Produces: `MotionProfile = 'full' | 'reduced'`
- Produces: `MediaProfile = 'standard' | 'lite'`
- Produces: `resolveMotionProfile(input: MotionProfileInput): MotionProfile`
- Produces: `resolveMediaProfile(connection?: ConnectionHint): MediaProfile`
- Produces DOM attributes: `data-home-motion-profile` and `data-home-media-profile`

- [ ] **Step 1: Write failing profile-selection tests**

Create `tests/e2e/home-motion-profiles.spec.ts`:

```ts
import { expect, test } from 'playwright/test';

const sceneOrder = [
  'service',
  'payment',
  'aftercare',
  'operations',
  'finance',
  'multibranch',
  'ai',
];

test('bare homepage keeps the complete story with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const experience = page.locator('[data-home-motion-profile]');
  await expect(experience).toHaveAttribute('data-home-motion-profile', 'reduced');
  await expect(experience.locator('[data-story-mode="static"] [data-story-scene]'))
    .toHaveCount(sceneOrder.length);
  expect(await experience.locator('[data-story-mode="static"] [data-story-scene]')
    .evaluateAll(nodes => nodes.map(node => node.getAttribute('data-story-scene'))))
    .toEqual(sceneOrder);
});

test('motion=full overrides a reduced browser preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?motion=full');
  await expect(page.locator('[data-home-motion-profile]'))
    .toHaveAttribute('data-home-motion-profile', 'full');
  await expect(page.locator('[data-story-mode="animated"]')).toBeVisible();
});

test('motion=reduced overrides a normal browser preference', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?motion=reduced');
  await expect(page.locator('[data-home-motion-profile]'))
    .toHaveAttribute('data-home-motion-profile', 'reduced');
  await expect(page.locator('[data-story-mode="static"]')).toBeVisible();
});

test('save-data selects lite media without changing the story mode', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '4g' },
    });
  });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?motion=full');

  const experience = page.locator('[data-home-motion-profile]');
  await expect(experience).toHaveAttribute('data-home-motion-profile', 'full');
  await expect(experience).toHaveAttribute('data-home-media-profile', 'lite');
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
npx playwright test tests/e2e/home-motion-profiles.spec.ts --project=chromium-desktop --workers=1
```

Expected: FAIL because the profile attributes and `motion=reduced` override do not exist.

- [ ] **Step 3: Add pure profile resolution**

Create `src/components/interactive/home-story/experience-profile.ts`:

```ts
export type MotionProfile = 'full' | 'reduced';
export type MediaProfile = 'standard' | 'lite';

export interface MotionProfileInput {
  override: string | null;
  prefersReducedMotion: boolean;
}

export interface ConnectionHint {
  saveData?: boolean;
  effectiveType?: string;
}

export function resolveMotionProfile({
  override,
  prefersReducedMotion,
}: MotionProfileInput): MotionProfile {
  if (override === 'full') return 'full';
  if (override === 'reduced') return 'reduced';
  return prefersReducedMotion ? 'reduced' : 'full';
}

export function resolveMediaProfile(connection?: ConnectionHint): MediaProfile {
  if (connection?.saveData) return 'lite';
  return connection?.effectiveType === 'slow-2g' || connection?.effectiveType === '2g'
    ? 'lite'
    : 'standard';
}
```

- [ ] **Step 4: Resolve and expose profiles at the homepage boundary**

Update `HomepageStory.tsx` so the component owns the profile and passes media intent
downward:

```tsx
import {
  resolveMediaProfile,
  resolveMotionProfile,
  type MediaProfile,
  type MotionProfile,
} from './experience-profile';

interface NavigatorWithConnection extends Navigator {
  connection?: {
    saveData?: boolean;
    effectiveType?: string;
  };
}

export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [motionProfile, setMotionProfile] = useState<MotionProfile>('full');
  const [mediaProfile, setMediaProfile] = useState<MediaProfile>('standard');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMotionProfile(resolveMotionProfile({
      override: params.get('motion'),
      prefersReducedMotion: Boolean(reduceMotion),
    }));
    setMediaProfile(resolveMediaProfile(
      (navigator as NavigatorWithConnection).connection,
    ));
    setMounted(true);
  }, [reduceMotion]);

  return (
    <div
      data-home-motion-profile={motionProfile}
      data-home-media-profile={mediaProfile}
    >
      {motionProfile === 'reduced' ? (
        <>
          <ReducedMotionOpening />
          <ReducedMotionStory />
        </>
      ) : (
        <>
          <OpeningJourney
            variant="channel-handoff"
            autoplay={mounted}
          />
          <AnimatedStory />
        </>
      )}
      <noscript>
        <style dangerouslySetInnerHTML={{
          __html: '[data-opening-mode="animated"], [data-story-mode="animated"] { display: none !important; }',
        }} />
        <ReducedMotionOpening mode="noscript" />
        <ReducedMotionStory mode="noscript" />
      </noscript>
    </div>
  );
}
```

Do not remove the `noscript` styles or semantic fallback.

- [ ] **Step 5: Run profile tests and the existing override test**

Run:

```bash
npx playwright test \
  tests/e2e/home-motion-profiles.spec.ts \
  tests/e2e/home-scrollytelling.spec.ts \
  --project=chromium-reduced \
  --workers=1
```

Expected: profile tests PASS; existing reduced-motion and explicit-full tests PASS.

- [ ] **Step 6: Commit**

```bash
git add \
  src/components/interactive/home-story/experience-profile.ts \
  src/components/interactive/home-story/HomepageStory.tsx \
  tests/e2e/home-motion-profiles.spec.ts
git commit -m "feat(homepage): resolve motion and media profiles"
```

---

### Task 2: Chapter-based reduced-motion opening

**Files:**
- Modify: `src/components/interactive/home-opening/ReducedMotionOpening.tsx`
- Modify: `src/components/interactive/home-story/ReducedMotionStory.tsx`
- Modify: `tests/e2e/home-motion-profiles.spec.ts`

**Interfaces:**
- Consumes: `data-home-motion-profile="reduced"` from Task 1.
- Produces: `data-reduced-opening-chapter="hero|mosaic|channels"`
- Produces: `data-reduced-story-chapter="<scene-id>"`

- [ ] **Step 1: Add a failing reduced-story pacing test**

Append to `tests/e2e/home-motion-profiles.spec.ts`:

```ts
test('reduced motion advances through viewport-sized chapters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const chapters = page.locator('[data-reduced-opening-chapter]');
  await expect(chapters).toHaveCount(3);
  expect(await chapters.evaluateAll(nodes => nodes.map(node => (
    node.getAttribute('data-reduced-opening-chapter')
  )))).toEqual(['hero', 'mosaic', 'channels']);

  for (const chapter of await chapters.all()) {
    const height = await chapter.evaluate(element => element.getBoundingClientRect().height);
    expect(height).toBeGreaterThanOrEqual(0.8 * await page.evaluate(() => innerHeight));
  }

  await expect(page.locator('[data-home-motion-profile="reduced"] video')).toHaveCount(0);
  await expect(page.locator('[data-reduced-story-chapter]')).toHaveCount(7);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
npx playwright test tests/e2e/home-motion-profiles.spec.ts \
  --project=chromium-reduced --workers=1
```

Expected: FAIL because the chapter markers do not exist.

- [ ] **Step 3: Split the reduced opening into three chapters**

Replace `ReducedMotionOpening.tsx` with:

```tsx
import { pushEvent, trackGetStarted } from '../../../lib/gtm';
import { OPENING_CHANNELS, OPENING_TILES } from './opening-tiles';
import {
  OPENING_CHANNEL_DEMONSTRATIONS,
  openingChannelById,
} from './opening-channel-results';

export default function ReducedMotionOpening({
  mode = 'static',
}: {
  mode?: 'static' | 'noscript';
}) {
  return (
    <section data-opening-mode={mode} className="bg-neutral-950 text-neutral-50">
      <div
        data-reduced-opening-chapter="hero"
        className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center"
      >
        <img
          src="/video4-poster.webp"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 size-full object-cover opacity-45"
        />
        <div className="relative z-10">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-sm">
            Cobra, administra y crece.
          </p>
          <h1 className="mx-auto max-w-6xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">
            El primer sistema
            <br className="hidden md:block" />{' '}
            todo-en-uno en México
          </h1>
          <p className="mx-auto mt-6 max-w-5xl text-base text-neutral-200 sm:text-lg">
            Pagos y terminales, punto de venta, tienda en línea, reservaciones,
            inventario, clientes, facturación, contabilidad, reportes, conexión con
            ChatGPT y Claude. Todo conectado en tiempo real.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="/wa?src=hero_demo&text=Hola%2C%20me%20interesa%20una%20demo%20de%20Avoqado%20de%2015%20minutos"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => pushEvent('demo_request', {
                demo_type: 'whatsapp',
                location: 'hero',
              })}
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 font-semibold text-black"
            >
              Agenda por WhatsApp
            </a>
            <a
              href="https://dashboard.avoqado.io/signup"
              onClick={event => trackGetStarted(event, 'hero')}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-6 font-semibold text-white"
            >
              Comienza gratis
            </a>
          </div>
        </div>
      </div>

      <div
        data-reduced-opening-chapter="mosaic"
        className="flex min-h-[100dvh] items-center bg-neutral-50 px-6 py-24 text-neutral-950"
      >
        <div className="mx-auto w-full max-w-6xl">
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            {OPENING_TILES.map(tile => (
              <img
                key={tile.id}
                src={tile.src}
                alt=""
                loading="lazy"
                className="aspect-square size-full rounded-lg object-cover"
              />
            ))}
          </div>
          <h2 className="mx-auto mt-12 max-w-4xl text-3xl font-light tracking-[-0.03em] sm:text-5xl">
            Tiendas, gyms, estéticas, clínicas y más.
            <br />
            Cobra, organiza y crece desde un solo lugar.
          </h2>
        </div>
      </div>

      <div
        data-reduced-opening-chapter="channels"
        className="flex min-h-[100dvh] items-center bg-neutral-50 px-6 py-24 text-neutral-950"
      >
        <div className="mx-auto w-full max-w-3xl">
          <p
            data-narrative-eyebrow
            className="text-xs font-semibold uppercase tracking-[0.18em] text-green-800"
          >
            UNA SOLA OPERACIÓN
          </p>
          <h2
            data-narrative-title
            className="mt-3 text-3xl font-light tracking-[-0.03em] sm:text-5xl"
          >
            Tu cliente reserva, compra o paga como prefiera.
          </h2>
          <p data-narrative-body className="mt-4 text-neutral-600">
            Desde una reservación o liga de pago hasta el punto de venta o la terminal
            física: todo llega conectado a Avoqado.
          </p>
          <ol className="mt-8 border-y border-black/10">
            {OPENING_CHANNELS.map(channel => (
              <li
                key={channel.id}
                data-channel-id={channel.id}
                className="flex items-center justify-between border-b border-black/8 py-3 last:border-b-0"
              >
                <strong>{channel.label}</strong>
                <span>{channel.result}</span>
              </li>
            ))}
          </ol>
          <p
            data-narrative-thread
            className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-700"
          >
            <span
              aria-hidden="true"
              className="size-[7px] rounded-full bg-avoqado-green"
            />
            Reservación en línea → Reserva confirmada
          </p>
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
                  <span className="mt-3 block text-lg font-medium">
                    {demonstration.primary}
                  </span>
                  <span className="mt-1 block text-sm text-neutral-600">
                    {demonstration.detail}
                  </span>
                  <span className="mt-2 block text-xs text-neutral-500">
                    {demonstration.context}
                  </span>
                </article>
              );
            })}
          </div>
          <p data-narrative-result className="mt-8 text-xl font-medium text-neutral-950">
            Todo llega conectado al mismo negocio.
          </p>
        </div>
      </div>
    </section>
  );
}
```

Do not add transition, transform, autoplay, route, or pulse animation to these chapters.

- [ ] **Step 4: Mark every reduced story chapter**

In `ReducedMotionStory.tsx`, add the marker and change only the minimum height:

```tsx
<section
  key={scene.id}
  data-story-scene={scene.id}
  data-reduced-story-chapter={scene.id}
  className={
    light
      ? 'bg-neutral-50 text-neutral-950'
      : 'bg-neutral-950 text-neutral-50'
  }
>
  <div className="mx-auto flex min-h-[90dvh] max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
```

Leave the current children and closing tags of this section unchanged. This step adds
one data attribute and replaces `min-h-[70dvh]` with `min-h-[90dvh]`; it does not
alter any narrative JSX.

- [ ] **Step 5: Run reduced and no-JavaScript coverage**

Run:

```bash
npx playwright test \
  tests/e2e/home-motion-profiles.spec.ts \
  tests/e2e/home-narrative-hierarchy.spec.ts \
  --project=chromium-reduced \
  --project=chromium-nojs \
  --workers=1
```

Expected: PASS with all chapters in causal order and no duplicate visible `h1`.

- [ ] **Step 6: Commit**

```bash
git add \
  src/components/interactive/home-opening/ReducedMotionOpening.tsx \
  src/components/interactive/home-story/ReducedMotionStory.tsx \
  tests/e2e/home-motion-profiles.spec.ts
git commit -m "feat(homepage): pace the reduced motion story"
```

---

### Task 3: Cache shared-tile geometry

**Files:**
- Modify: `src/components/interactive/home-opening/SharedTileLayer.tsx`
- Create: `tests/e2e/home-opening-performance.spec.ts`

**Interfaces:**
- Produces: `boxWithin(root: HTMLElement, element: HTMLElement): Box`
- Produces: geometry state that changes only after layout events.
- Removes: progress-driven geometry measurement.

- [ ] **Step 1: Add browser geometry-read instrumentation**

Create `tests/e2e/home-opening-performance.spec.ts`:

```ts
import { expect, test, type Page } from 'playwright/test';

declare global {
  interface Window {
    __avoqadoOpeningRectReads: number;
  }
}

async function installRectCounter(page: Page) {
  await page.addInitScript(() => {
    const original = Element.prototype.getBoundingClientRect;
    window.__avoqadoOpeningRectReads = 0;
    Element.prototype.getBoundingClientRect = function (...args) {
      if (
        this instanceof Element
        && (this.matches('[data-opening-mode="animated"]')
          || this.closest('[data-opening-mode="animated"]'))
      ) {
        window.__avoqadoOpeningRectReads += 1;
      }
      return original.apply(this, args as []);
    };
  });
}

async function scrollOpeningRange(page: Page, start: number, end: number) {
  await page.locator('[data-opening-mode="animated"]').evaluate(
    async (element, range) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - innerHeight;
      const started = performance.now();
      await new Promise<void>(resolve => {
        const tick = (now: number) => {
          const progress = Math.min((now - started) / 1800, 1);
          const storyProgress = range.start + (range.end - range.start) * progress;
          scrollTo(0, top + distance * storyProgress);
          if (progress < 1) requestAnimationFrame(tick);
          else resolve();
        };
        requestAnimationFrame(tick);
      });
    },
    { start, end },
  );
}

test('early opening does not measure shared tiles on every frame', async ({ page }) => {
  await installRectCounter(page);
  await page.goto('/?motion=full');
  await page.evaluate(() => { window.__avoqadoOpeningRectReads = 0; });
  await scrollOpeningRange(page, 0.05, 0.55);

  expect(await page.evaluate(() => window.__avoqadoOpeningRectReads))
    .toBeLessThan(200);
});
```

- [ ] **Step 2: Run the geometry test and verify RED**

Run:

```bash
npx playwright test tests/e2e/home-opening-performance.spec.ts \
  --project=chromium-desktop --workers=1
```

Expected: FAIL with geometry reads in the thousands.

- [ ] **Step 3: Make tile coordinates independent of transforms**

Replace `boxWithin` in `SharedTileLayer.tsx` with stable offset geometry:

```ts
function boxWithin(root: HTMLElement, element: HTMLElement): Box {
  let left = element.offsetWidth / 2;
  let top = element.offsetHeight / 2;
  let current: HTMLElement | null = element;

  while (current && current !== root) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  if (current !== root) {
    const rootRect = root.getBoundingClientRect();
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left - rootRect.left,
      top: rect.top - rootRect.top,
      width: rect.width,
      height: rect.height,
    };
  }

  return {
    left: left - element.offsetWidth / 2,
    top: top - element.offsetHeight / 2,
    width: element.offsetWidth,
    height: element.offsetHeight,
  };
}
```

- [ ] **Step 4: Remove progress-driven measurement**

In `SharedTileLayer`, keep mount/font/layout-key/ResizeObserver scheduling, but remove:

```ts
const stopMeasuringProgress = progress.on('change', schedule);
```

and remove its cleanup call. Retain `progress` only as the `MotionValue` consumed by
`SharedTile` interpolation. Before calling `setGeometry(next)`, avoid a state update
when every source and target box equals the current cached geometry.

- [ ] **Step 5: Run the focused performance and opening tests**

Run:

```bash
npx playwright test \
  tests/e2e/home-opening-performance.spec.ts \
  tests/e2e/home-opening.spec.ts \
  --project=chromium-desktop \
  --workers=1
```

Expected: geometry test PASS under 200 reads; tile handoff visual and reverse-scroll
tests PASS.

- [ ] **Step 6: Commit**

```bash
git add \
  src/components/interactive/home-opening/SharedTileLayer.tsx \
  tests/e2e/home-opening-performance.spec.ts
git commit -m "perf(homepage): cache opening tile geometry"
```

---

### Task 4: Cache channel connector geometry

**Files:**
- Modify: `src/components/interactive/home-opening/ChannelHandoff.tsx`
- Modify: `tests/e2e/home-opening-performance.spec.ts`

**Interfaces:**
- Consumes: active channel index from the existing opening sequence.
- Produces: one cached route per active channel/layout state.
- Removes: sequence-progress and animated-style measurement subscriptions.

- [ ] **Step 1: Add a failing late-opening geometry test**

Append:

```ts
test('channel handoff does not measure its route on every frame', async ({ page }) => {
  await installRectCounter(page);
  await page.goto('/?motion=full');
  await page.evaluate(() => { window.__avoqadoOpeningRectReads = 0; });
  await scrollOpeningRange(page, 0.62, 0.98);

  expect(await page.evaluate(() => window.__avoqadoOpeningRectReads))
    .toBeLessThan(250);
});
```

- [ ] **Step 2: Run the late-opening test and verify RED**

Run:

```bash
npx playwright test tests/e2e/home-opening-performance.spec.ts \
  --project=chromium-desktop --workers=1 -g "channel handoff"
```

Expected: FAIL because `sequenceProgress` and style mutations schedule measurement.

- [ ] **Step 3: Remove animated transforms from route measurement**

In `ChannelHandoff.tsx`, replace `centerWithinVisual` with offset-only coordinates:

```ts
const centerWithinVisual = (element: HTMLElement): RoutePoint => {
  let x = element.offsetWidth / 2;
  let y = element.offsetHeight / 2;
  let current: HTMLElement | null = element;

  while (current && current !== visual) {
    x += current.offsetLeft;
    y += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }

  if (current === visual) return { x, y };
  const visualRect = visual.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left - visualRect.left + rect.width / 2,
    y: rect.top - visualRect.top + rect.height / 2,
  };
};
```

Do not call `getComputedStyle()` or add transform matrix offsets.

- [ ] **Step 4: Limit scheduling to real geometry changes**

Delete:

```ts
const transformObserver = new MutationObserver(scheduleMeasure);
transformObserver.observe(sourceRow, { attributes: true, attributeFilter: ['style'] });
transformObserver.observe(event, { attributes: true, attributeFilter: ['style'] });
const stopMeasuringProgress = sequenceProgress.on('change', scheduleMeasure);
```

and their cleanup calls. Keep:

- the initial `frame.postRender(scheduleMeasure)`;
- `ResizeObserver` for visual, ledger, event, source, and target;
- `document.fonts.ready`;
- `activeDemonstration.channelId` in the effect dependencies, which schedules a fresh
  measurement when the selected channel changes.

Also delete the now-unused `sourceRow` lookup and remove `!sourceRow` from the effect's
early-return guard.

- [ ] **Step 5: Run connector, reverse-scroll, and performance tests**

Run:

```bash
npx playwright test \
  tests/e2e/home-opening-performance.spec.ts \
  tests/e2e/home-opening.spec.ts \
  tests/e2e/home-scrollytelling.spec.ts \
  --project=chromium-desktop \
  --workers=1
```

Expected: both geometry tests PASS, all connector lifecycle tests PASS, and route
origins remain attached to the selected row.

- [ ] **Step 6: Commit**

```bash
git add \
  src/components/interactive/home-opening/ChannelHandoff.tsx \
  tests/e2e/home-opening-performance.spec.ts
git commit -m "perf(homepage): cache channel connector geometry"
```

---

### Task 5: Lite media mode and optimized opening video

**Files:**
- Modify: `src/components/interactive/home-story/HomepageStory.tsx`
- Modify: `src/components/interactive/home-opening/OpeningJourney.tsx`
- Modify: `src/components/interactive/home-opening/OpeningVideo.tsx`
- Modify: `public/video4.webm`
- Modify: `tests/e2e/home-motion-profiles.spec.ts`
- Modify: `tests/e2e/home-opening-performance.spec.ts`

**Interfaces:**
- Consumes: `mediaProfile: MediaProfile` from Task 1.
- Produces: `liteMedia: boolean` for `OpeningVideo`.
- Guarantees: no `<video>` and no `/video4.webm` request in lite mode.

- [ ] **Step 1: Add a failing network assertion for lite media**

Append to the Save-Data test:

```ts
const videoRequests: string[] = [];
page.on('request', request => {
  if (request.url().includes('/video4.webm')) videoRequests.push(request.url());
});

await expect(page.locator('[data-opening-video] video')).toHaveCount(0);
expect(videoRequests).toEqual([]);
```

- [ ] **Step 2: Run the Save-Data test and verify RED**

Run:

```bash
npx playwright test tests/e2e/home-motion-profiles.spec.ts \
  --project=chromium-desktop --workers=1 -g "save-data"
```

Expected: FAIL because `OpeningVideo` always renders and autoplays the video.

- [ ] **Step 3: Forward the media profile**

Pass the Task 1 state from `HomepageStory.tsx`:

```tsx
<OpeningJourney
  variant="channel-handoff"
  autoplay={mounted}
  mediaProfile={mediaProfile}
/>
```

Then add `mediaProfile?: MediaProfile` to `OpeningJourneyProps`, default it to
`standard`, and call:

```tsx
<OpeningVideo
  progress={openingProgress}
  isMobile={isMobile}
  autoplay={autoplay}
  liteMedia={mediaProfile === 'lite'}
/>
```

- [ ] **Step 4: Omit the video in lite mode**

Extend `OpeningVideo` props with `liteMedia: boolean`. Pause video when `liteMedia`
is true and render:

```tsx
{!videoFailed && !liteMedia ? (
  <video
    ref={videoRef}
    src="/video4.webm"
    poster="/video4-poster.webp"
    loop
    muted
    playsInline
    preload="metadata"
    onError={() => setVideoFailed(true)}
    className="absolute inset-0 size-full object-cover"
  />
) : null}
```

Include `liteMedia` in the playback effect dependencies.

- [ ] **Step 5: Re-encode the video without audio**

Run:

```bash
ffmpeg -y -i public/video4.webm \
  -an \
  -c:v libvpx-vp9 \
  -crf 35 \
  -b:v 0 \
  -deadline good \
  -cpu-used 2 \
  -row-mt 1 \
  -pix_fmt yuv420p \
  public/video4.optimized.webm

ffprobe -v error \
  -show_entries format=duration,size,bit_rate \
  -show_entries stream=codec_name,width,height,r_frame_rate \
  -of json \
  public/video4.optimized.webm
```

Expected: VP9, 1280×720, 30 fps, approximately 13.84 s, no Opus stream, and size at
or below 2,621,440 bytes. Visually inspect the first, middle, and final frames. If all
three are acceptable, replace `public/video4.webm` with the optimized file using
`mv public/video4.optimized.webm public/video4.webm`.

- [ ] **Step 6: Run media and opening tests**

Run:

```bash
npx playwright test \
  tests/e2e/home-motion-profiles.spec.ts \
  tests/e2e/home-opening.spec.ts \
  --project=chromium-desktop \
  --project=chromium-mobile \
  --workers=1
```

Expected: standard mode plays video, lite mode makes no video request, and the poster
remains visible in both profiles.

- [ ] **Step 7: Commit**

```bash
git add \
  public/video4.webm \
  src/components/interactive/home-story/HomepageStory.tsx \
  src/components/interactive/home-opening/OpeningJourney.tsx \
  src/components/interactive/home-opening/OpeningVideo.tsx \
  tests/e2e/home-motion-profiles.spec.ts \
  tests/e2e/home-opening-performance.spec.ts
git commit -m "perf(homepage): lighten opening media"
```

---

### Task 6: Defer root-only external analytics bootstrap

**Files:**
- Modify: `src/middleware.ts`
- Create: `tests/e2e/home-analytics-loading.spec.ts`

**Interfaces:**
- Preserves: synchronous Consent Mode defaults and `window.dataLayer`.
- Produces: root-only deferred GTM and PostHog external bootstrap.
- Preserves: immediate analytics behavior on non-root HTML routes.
- Starts root analytics on pointer/touch/keyboard interaction, or 2.5 s after `load`
  during browser idle.

- [ ] **Step 1: Add failing request-timing tests**

Create `tests/e2e/home-analytics-loading.spec.ts`:

```ts
import { expect, test } from 'playwright/test';

const externalAnalytics = /googletagmanager\.com\/gtm\.js|posthog.*\/static\/array\.js/;

test('homepage defers external analytics until interaction or idle delay', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.goto('/?motion=full', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);

  await page.locator('body').dispatchEvent('pointerdown');
  await expect.poll(() => requests.length).toBeGreaterThan(0);
});

test('non-homepage routes retain immediate analytics bootstrap', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requests.length).toBeGreaterThan(0);
});

test('homepage keeps consent defaults ahead of deferred vendors', async ({ page }) => {
  await page.goto('/?_cc=DE', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
  await expect(page.locator('body')).toHaveAttribute('data-consent-required', 'true');
});
```

- [ ] **Step 2: Run tests and verify RED**

Run:

```bash
npx playwright test tests/e2e/home-analytics-loading.spec.ts \
  --project=chromium-desktop --workers=1
```

Expected: first test FAIL because GTM and PostHog start immediately.

- [ ] **Step 3: Extract executable bootstrap bodies**

Refactor the existing middleware constants without changing their JavaScript bodies:

```ts
const GTM_BOOTSTRAP = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

const immediateScript = (code: string) => `<script>${code}</script>`;

const deferredScript = (code: string) => `<script>
(function(){
  var started=false;
  function start(){
    if(started)return;
    started=true;
    ${code}
  }
  ['pointerdown','touchstart','keydown'].forEach(function(type){
    addEventListener(type,start,{once:true,passive:true,capture:true});
  });
  addEventListener('load',function(){
    setTimeout(function(){
      if('requestIdleCallback' in window){
        requestIdleCallback(start,{timeout:2000});
      }else{
        setTimeout(start,0);
      }
    },2500);
  },{once:true});
})();
</script>`;
```

Keep `gtmConsentDefault()` synchronous because it establishes regional defaults and
`window.dataLayer` before any vendor script.

- [ ] **Step 4: Make PostHog bootstrap deferrable**

Split the current `posthogSnippet()` into a JavaScript-body function and a wrapper:

```ts
const posthogBootstrap = (grantedByDefault: boolean) => `
!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
posthog.init('${POSTHOG_KEY}',{
  api_host:'https://us.i.posthog.com',
  person_profiles:'identified_only',
  capture_pageview:true,
  capture_pageleave:true,
  autocapture:true,
  cross_subdomain_cookie:true,
  opt_out_capturing_by_default:true,
  session_recording:{maskAllInputs:true},
  loaded:function(ph){
    try{
      var lh=/^(localhost|127\\.0\\.0\\.1)$/.test(location.hostname);
      if(lh)return;
      var c=JSON.parse(localStorage.getItem('cookieConsent')||'null');
      var ad=/[?&](gclid|gbraid|wbraid|fbclid|msclkid|li_fat_id|wa)=/.test(location.search)
        ||/[?&]utm_medium=(cpc|ppc|paid|paidsocial|paid_social|display)/i.test(location.search);
      var allow=ad||(c?!!c.analytics:${grantedByDefault});
      if(allow){ph.opt_in_capturing();}
    }catch(e){}
  }
});`;
```

- [ ] **Step 5: Apply deferral to `/` only**

At injection time:

```ts
const isHomepage = path === '';
const gtmScript = isHomepage
  ? deferredScript(GTM_BOOTSTRAP)
  : immediateScript(GTM_BOOTSTRAP);
const posthogScript = isHomepage
  ? deferredScript(posthogBootstrap(!consentRequired))
  : immediateScript(posthogBootstrap(!consentRequired));

html = html.replace(
  '<head>',
  () => `<head>\n${gtmConsentDefault(!consentRequired)}\n${gtmScript}\n${posthogScript}`,
);
```

Keep the existing GTM `noscript` body injection unchanged.

- [ ] **Step 6: Run analytics, CTA, consent, and story-event coverage**

Run:

```bash
npx playwright test \
  tests/e2e/home-analytics-loading.spec.ts \
  tests/e2e/home-scrollytelling.spec.ts \
  --project=chromium-desktop \
  --workers=1
```

Expected: analytics timing tests PASS; navigation, CTA, story-complete, chatbot, and
closing tests PASS.

- [ ] **Step 7: Commit**

```bash
git add src/middleware.ts tests/e2e/home-analytics-loading.spec.ts
git commit -m "perf(homepage): defer external analytics bootstrap"
```

---

### Task 7: Full regression and production-performance handoff

**Files:**
- Test: `tests/e2e/home-opening-performance.spec.ts`
- Modify: `docs/superpowers/plans/2026-07-17-homepage-motion-performance.md`

**Interfaces:**
- Consumes all behavior and performance guarantees from Tasks 1–6.
- Produces a verified production candidate with recorded before/after measurements.

- [ ] **Step 1: Build and statically verify output**

Run:

```bash
npm run build
git diff --check
test "$(stat -f '%z' public/video4.webm)" -le 2621440
```

Expected: build succeeds, no whitespace errors, video size check succeeds. The existing
Astro prerender warning for `src/pages/help.astro` may remain; new errors may not.

- [ ] **Step 2: Run the complete homepage matrix serially**

Run:

```bash
npx playwright test \
  tests/e2e/home-motion-profiles.spec.ts \
  tests/e2e/home-opening-performance.spec.ts \
  tests/e2e/home-analytics-loading.spec.ts \
  tests/e2e/home-opening.spec.ts \
  tests/e2e/home-narrative-hierarchy.spec.ts \
  tests/e2e/home-scrollytelling.spec.ts \
  tests/e2e/home-legacy.spec.ts \
  --workers=1
```

Expected: all applicable desktop, mobile, small, reduced, and no-JavaScript checks pass;
project-specific skips remain intentional.

- [ ] **Step 3: Repeat production-style scroll measurements locally**

Use Chrome DevTools Performance on the built candidate with `?motion=full`:

1. Reload and record LCP.
2. Scroll the opening from progress `0` to `1` over 8 seconds.
3. Record maximum frame interval, intervals over 20 ms, intervals over 50 ms, and
   opening `getBoundingClientRect()` count.
4. Repeat with reduced motion and Save-Data.

Expected:

- no application-caused interval above 50 ms in the unthrottled desktop run;
- geometry reads at least 10× below the 1,470-per-second baseline;
- no `/video4.webm` request in Save-Data;
- complete narrative in reduced motion.

Append a `## Verification results` section to this plan containing the exact build
status, Playwright totals, video byte size, LCP, maximum frame interval, counts over
20 ms and 50 ms, geometry reads per second, and Save-Data request result.

- [ ] **Step 4: Confirm repository hygiene**

Run:

```bash
git status --short --branch
git log --oneline --decorate -8
```

Expected: only pre-existing untracked local artifacts remain; no test output, trace,
or optimized temporary video is staged.

- [ ] **Step 5: Commit verification notes**

```bash
git add docs/superpowers/plans/2026-07-17-homepage-motion-performance.md
git commit -m "docs(homepage): record motion performance verification"
```

- [ ] **Step 6: Merge, push, and verify production only after approval**

After explicit approval to ship:

1. Merge `codex/homepage-motion-performance` into `main`.
2. Push `main`.
3. Poll `https://avoqado.io/` until the deployed commit appears.
4. Run focused motion-profile, performance, and legacy canary tests against production.
5. Repeat the 8-second live opening trace.

Rollback target: production commit `058e4fdd03fecfae898bc8d34b279d851d026800`.

## Verification results

Verified locally on 2026-07-17 from the production build served with
`wrangler pages dev dist` at 1440×900 in Playwright Chromium.

- Build: PASS. Only the pre-existing Cloudflare/Sentry/Astro prerender warnings
  remained.
- Static checks: `git diff --check` PASS; `public/video4.webm` is 2,362,617 bytes
  (limit 2,621,440 bytes).
- Complete serial homepage matrix: 148 passed, 192 intentionally skipped, 0 failed
  in 4.4 minutes across desktop, mobile, small, reduced-motion, and no-JavaScript
  projects.
- Full-motion initial LCP: 1,000 ms. LCP was captured after the initial hero settled
  and before the scripted scroll.
- Eight-second full-motion opening scroll: maximum frame interval 34.2 ms;
  20 intervals above 20 ms; 0 intervals above 50 ms; 0 long tasks above 50 ms.
- Opening `getBoundingClientRect()` activity during the eight-second scroll:
  12 reads total, or 1.5 reads/second. This is 980× below the measured
  1,470 reads/second baseline.
- Reduced motion: PASS with profile `reduced`, 3 opening chapters, 7 story chapters,
  and no video element.
- Save-Data: PASS with profile `lite`, complete animated story present, no video
  element, and zero requests for `/video4.webm`.

The frame and geometry measurements use a reproducible Playwright script under the
ignored `.superpowers/sdd/` workspace. Frame intervals come from `requestAnimationFrame`;
application long tasks come from `PerformanceObserver`; LCP is observed before the
programmatic scroll so later chapters cannot replace the initial candidate.
