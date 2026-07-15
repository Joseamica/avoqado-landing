# Video–Mosaic–Channel Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restore the original full-screen video-to-mosaic opening on `/`, turn four mosaic tiles into the four channel rows, and carry `Booking Widget` through one measured connector to `Reserva confirmada` before the existing service-to-AI story continues.

**Architecture:** Keep one React island, but split it into two consecutive scroll roots: `OpeningJourney` owns video, mosaic, shared-tile handoff, and channels; `AnimatedStory` owns the seven existing scenes from `service` through `ai`. Refactor the old `SquareHero` into reusable opening components, move the already-correct measured connector into `ChannelHandoff`, and use DOMRect/ResizeObserver geometry for both the four shared tiles and the channel route.

**Tech Stack:** Astro 5, React 18, TypeScript, Framer Motion 12.23.26, Tailwind CSS 4, Playwright 1.60, native `ResizeObserver`, FFmpeg for the poster asset.

## Global Constraints

- Work only in `/Users/amieva/.codex/worktrees/avoqado-landing/homepage-scrollytelling` on branch `codex/homepage-scrollytelling`.
- Preserve the existing uncommitted `ChannelsScene.tsx` and `home-scrollytelling.spec.ts` transform-remeasurement fix; never reset, overwrite, or fold unrelated `test-results/` artifacts into a commit.
- `/demo` must remain unchanged and `/scrollytelling` must keep its video → mosaic behavior without the new channel handoff.
- Keep `/video4.webm`, all 17 existing hero assets, all approved copy, CTA destinations, and GTM events.
- Use exactly `300vh` for the animated opening on desktop and `260vh` on mobile; use `800vh` and `700vh` respectively for the seven-scene story that follows.
- The selected channel assets are fixed: Consumer App `hero-tile-02.jpg`, Booking Widget `hero-tile-07.jpg`, Online `hero-tile-12.jpg`, and Punto de venta `hero-tile-10.jpg`.
- Animate only `transform`, `opacity`, `pathLength`, and punctual color changes; do not animate layout properties.
- All source/target travel geometry must come from measured DOM anchors, never breakpoint-specific travel coordinates.
- The poster path is `public/video4-poster.webp` and its size must be at most 153,600 bytes.
- Reduced motion must not autoplay video or mount a long sticky; no-JS must expose the same semantic story.
- No new runtime dependency, API request, generated stock image, scroll analytics event, or decorative connector.
- Required visual viewports: `1440×900`, `910×691`, `787×701`, `887×502`, `390×844`, and `320×568`.

---

## File Map

**Create**

- `public/video4-poster.webp` — lightweight still generated from the approved video.
- `src/components/interactive/home-opening/opening-tiles.ts` — single source of truth for 17 tile positions and the four channel mappings.
- `src/components/interactive/home-opening/OpeningVideo.tsx` — full-screen video, original H1/support/CTAs, and shrink transforms.
- `src/components/interactive/home-opening/OpeningMosaic.tsx` — desktop/mobile grid, staggered tile entrance, stable mosaic copy, and shared-tile source anchors.
- `src/components/interactive/home-opening/OpeningJourney.tsx` — the `useScroll` root and normalized phase orchestration.
- `src/components/interactive/home-opening/ChannelHandoff.tsx` — four channel rows, reservation card, and the migrated measured route.
- `src/components/interactive/home-opening/SharedTileLayer.tsx` — four measured overlay images moving from mosaic cells to channel placeholders.
- `src/components/interactive/home-opening/ReducedMotionOpening.tsx` — semantic static opening for reduced motion and no-JS.
- `tests/e2e/home-opening.spec.ts` — opening-specific behavior, geometry, reverse-scroll, reduced-motion, and viewport coverage.

**Modify**

- `src/components/interactive/SquareHero.tsx` — compatibility wrapper around `OpeningJourney variant="mosaic-only"`.
- `src/components/interactive/home-story/HomepageStory.tsx` — compose opening + post-opening story and select animated/static mode.
- `src/components/interactive/home-story/AnimatedStory.tsx` — shorten to seven scenes and retain completion analytics.
- `src/components/interactive/home-story/story.ts` — remove `entry`/`channels` from the post-opening ranges.
- `src/components/interactive/home-story/StoryStage.tsx` — stop mounting `HeroScene` and `ChannelsScene`.
- `src/components/interactive/home-story/ReducedMotionStory.tsx` — render only `service` through `ai`, all as H2 sections.
- `tests/e2e/home-scrollytelling.spec.ts` — redirect channel assertions to the opening and update the seven-scene timeline.

**Delete after migration**

- `src/components/interactive/home-story/scenes/HeroScene.tsx` — superseded by the restored video opening.
- `src/components/interactive/home-story/scenes/ChannelsScene.tsx` — migrated to `home-opening/ChannelHandoff.tsx` after preserving its measured geometry.

---

### Task 1: Checkpoint the already-validated connector remeasurement fix

**Files:**
- Modify (already dirty): `src/components/interactive/home-story/scenes/ChannelsScene.tsx`
- Test (already dirty): `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**
- Consumes: current `ChannelsScene` route refs and `progress: MotionValue<number>`.
- Produces: committed transform-aware `centerWithinVisual()` measurement and `MutationObserver` behavior that Task 3 will migrate intact.

- [ ] **Step 1: Confirm that only the known connector changes are in these two files**

Run:

```bash
git diff -- src/components/interactive/home-story/scenes/ChannelsScene.tsx tests/e2e/home-scrollytelling.spec.ts
```

Expected: the diff imports Framer Motion `frame/cancelFrame`, measures transformed offset parents, observes row/event `style` transforms, and adds only `remide el origen después de un cambio de transform`.

- [ ] **Step 2: Run the focused regression test**

Run:

```bash
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "remide el origen" --workers=1
```

Expected: `1 passed`.

- [ ] **Step 3: Run all current channel connector tests before moving the code**

Run:

```bash
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "Booking Widget|conector dentro|remide el origen" --workers=1
```

Expected: all selected tests pass; no hydration or console failure.

- [ ] **Step 4: Commit only the two known files**

```bash
git add src/components/interactive/home-story/scenes/ChannelsScene.tsx tests/e2e/home-scrollytelling.spec.ts
git commit -m "fix(homepage): remeasure transformed channel anchors"
```

Expected: `test-results/` and this plan remain unstaged.

---

### Task 2: Refactor the original SquareHero into reusable opening primitives

**Files:**
- Create: `public/video4-poster.webp`
- Create: `src/components/interactive/home-opening/opening-tiles.ts`
- Create: `src/components/interactive/home-opening/OpeningVideo.tsx`
- Create: `src/components/interactive/home-opening/OpeningMosaic.tsx`
- Create: `src/components/interactive/home-opening/OpeningJourney.tsx`
- Modify: `src/components/interactive/SquareHero.tsx`
- Create/Test: `tests/e2e/home-opening.spec.ts`

**Interfaces:**
- Produces: `OpeningJourney({ variant, autoplay })`, where `variant: 'mosaic-only' | 'channel-handoff'` and `autoplay: boolean`.
- Produces: `OPENING_TILES`, `OPENING_CHANNELS`, `OpeningChannelId`, and `OpeningTile` from `opening-tiles.ts`.
- Preserves: default `SquareHero()` export used by `src/pages/scrollytelling.astro`.

- [ ] **Step 1: Write the failing compatibility test**

Create `tests/e2e/home-opening.spec.ts` with:

```ts
import { expect, test, type Page } from 'playwright/test';

export async function scrollOpeningTo(page: Page, progress: number) {
  const opening = page.locator('[data-opening-mode="animated"]');
  await opening.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, progress);
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
}

test('keeps the legacy SquareHero as a video-to-mosaic-only variant', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/scrollytelling');

  const opening = page.locator('[data-opening-mode="animated"]');
  await expect(opening).toHaveAttribute('data-opening-variant', 'mosaic-only');
  await expect(opening.locator('video[src="/video4.webm"]')).toHaveCount(1);
  await expect(opening.getByRole('heading', { level: 1 })).toContainText(
    'Tu tienda, tu gym, tu estética',
  );

  await scrollOpeningTo(page, 0.72);
  await expect(opening.locator('[data-opening-tile]')).toHaveCount(17);
  await expect(opening).toContainText('Cobra, organiza y crece desde un solo lugar');
  await expect(opening.locator('[data-opening-channel-handoff]')).toHaveCount(0);
  await expect(page.getByText('Continue scrolling...')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the compatibility test and verify the new contract is missing**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop --workers=1
```

Expected: FAIL because `[data-opening-mode="animated"]` does not exist yet.

- [ ] **Step 3: Generate the approved poster and enforce its byte budget**

Run:

```bash
ffmpeg -y -ss 00:00:01 -i public/video4.webm -frames:v 1 -vf "scale=1280:-2" -c:v libwebp -quality 60 -compression_level 6 public/video4-poster.webp
test "$(stat -f%z public/video4-poster.webp)" -le 153600
```

Expected: both commands exit `0`. If the size check fails, rerun exactly with `-quality 50`; do not change dimensions or the 153,600-byte limit.

- [ ] **Step 4: Create exact tile and channel metadata**

Create `src/components/interactive/home-opening/opening-tiles.ts`. Import `hero-tile-01.jpg` through `hero-tile-17.jpg`, then define:

```ts
export const OPENING_CHANNEL_IDS = [
  'consumer-app',
  'booking-widget',
  'online',
  'point-of-sale',
] as const;

export type OpeningChannelId = (typeof OPENING_CHANNEL_IDS)[number];

export interface OpeningTile {
  id: `tile-${number}`;
  src: string;
  desktop: { col: number; row: number };
  mobile: { col: number; row: number } | null;
  channelId?: OpeningChannelId;
}

export interface OpeningChannel {
  id: OpeningChannelId;
  label: string;
  result: string;
  tileId: OpeningTile['id'];
  active: boolean;
}

export const OPENING_TILES: readonly OpeningTile[] = [
  { id: 'tile-1', src: img1.src, desktop: { col: 2, row: 1 }, mobile: { col: 1, row: 1 } },
  { id: 'tile-2', src: img2.src, desktop: { col: 4, row: 1 }, mobile: { col: 2, row: 1 }, channelId: 'consumer-app' },
  { id: 'tile-3', src: img3.src, desktop: { col: 6, row: 1 }, mobile: { col: 3, row: 1 } },
  { id: 'tile-4', src: img4.src, desktop: { col: 8, row: 1 }, mobile: null },
  { id: 'tile-5', src: img5.src, desktop: { col: 1, row: 2 }, mobile: { col: 1, row: 2 } },
  { id: 'tile-6', src: img6.src, desktop: { col: 3, row: 2 }, mobile: null },
  { id: 'tile-7', src: img7.src, desktop: { col: 5, row: 2 }, mobile: { col: 3, row: 2 }, channelId: 'booking-widget' },
  { id: 'tile-8', src: img8.src, desktop: { col: 7, row: 2 }, mobile: null },
  { id: 'tile-9', src: img9.src, desktop: { col: 9, row: 2 }, mobile: null },
  { id: 'tile-10', src: img10.src, desktop: { col: 1, row: 4 }, mobile: { col: 1, row: 4 }, channelId: 'point-of-sale' },
  { id: 'tile-11', src: img11.src, desktop: { col: 3, row: 4 }, mobile: { col: 2, row: 4 } },
  { id: 'tile-12', src: img12.src, desktop: { col: 7, row: 4 }, mobile: { col: 3, row: 4 }, channelId: 'online' },
  { id: 'tile-13', src: img13.src, desktop: { col: 9, row: 4 }, mobile: null },
  { id: 'tile-14', src: img14.src, desktop: { col: 2, row: 5 }, mobile: { col: 1, row: 5 } },
  { id: 'tile-15', src: img15.src, desktop: { col: 4, row: 5 }, mobile: { col: 2, row: 5 } },
  { id: 'tile-16', src: img16.src, desktop: { col: 6, row: 5 }, mobile: { col: 3, row: 5 } },
  { id: 'tile-17', src: img17.src, desktop: { col: 8, row: 5 }, mobile: null },
];

export const OPENING_CHANNELS: readonly OpeningChannel[] = [
  { id: 'consumer-app', label: 'Consumer App', result: 'Reserva', tileId: 'tile-2', active: false },
  { id: 'booking-widget', label: 'Booking Widget', result: 'Seleccionado', tileId: 'tile-7', active: true },
  { id: 'online', label: 'Online', result: 'Pago', tileId: 'tile-12', active: false },
  { id: 'point-of-sale', label: 'Punto de venta', result: 'Venta presencial', tileId: 'tile-10', active: false },
] as const;
```

- [ ] **Step 5: Extract the original video and mosaic markup without changing its copy or destinations**

Create `OpeningVideo.tsx` with this public contract and the current `SquareHero` markup inside the returned `motion.div`:

```tsx
interface Props {
  progress: MotionValue<number>;
  isMobile: boolean;
  autoplay: boolean;
}

export default function OpeningVideo({ progress, isMobile, autoplay }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scale = useTransform(progress, [0, 0.38], [1, isMobile ? 0.31 : 0.105]);
  const borderRadius = useTransform(progress, [0, 0.38], [0, 16]);
  const x = useTransform(progress, [0, 0.38], ['0%', isMobile ? '34.5%' : '44%']);
  const y = useTransform(progress, [0, 0.38], ['0px', isMobile ? '23%' : '65%']);
  const clipPath = useTransform(progress, [0, 0.38], [
    'inset(0% 0% 0% 0%)',
    isMobile ? 'inset(25% 0% 25% 0%)' : 'inset(0% 0% 0% 0%)',
  ]);
  const textOpacity = useTransform(progress, [0, 0.08], [1, 0]);

  useEffect(() => {
    if (autoplay) void videoRef.current?.play().catch(() => undefined);
    else videoRef.current?.pause();
  }, [autoplay]);

  return (
    <motion.div data-opening-video style={{ scale, x, y, borderRadius, clipPath }} className="absolute inset-0 z-20 origin-top-left overflow-hidden bg-black shadow-2xl">
      <video ref={videoRef} src="/video4.webm" poster="/video4-poster.webp" loop muted playsInline preload="metadata" className="absolute inset-0 size-full object-cover" />
      <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 bg-black/50" />
      <motion.div style={{ opacity: textOpacity }} className="absolute inset-0 z-30 flex flex-col items-center justify-center px-4 text-center md:px-8">
        <h1 className="mb-6 max-w-5xl text-center text-2xl font-light tracking-tight text-white sm:text-3xl md:mb-10 md:text-5xl lg:text-7xl">Tu tienda, tu gym, tu estética.<br />Un solo sistema.</h1>
        <p className="mb-8 max-w-2xl text-center text-sm text-gray-300 sm:text-base md:mb-12 md:text-lg lg:text-xl">Punto de venta, cobros, citas, inventario y reportes — todo en una app.<br className="hidden sm:block" />Más barato que lo que ya pagas en pedacitos.</p>
        <div className="flex flex-col items-center gap-4 sm:flex-row md:gap-6">
          <a
            href="/wa?src=hero_demo&text=Hola%2C%20me%20interesa%20una%20demo%20de%20Avoqado%20de%2015%20minutos"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'hero' })}
            className="cursor-pointer rounded-full bg-white px-6 py-3 text-lg font-bold text-black transition-transform hover:scale-105 md:px-10 md:py-4 md:text-2xl"
          >
            Agenda por WhatsApp
          </a>
          <a
            href="https://dashboard.avoqado.io/signup"
            onClick={event => trackGetStarted(event, 'hero')}
            className="cursor-pointer rounded-full border-2 border-white/30 bg-black/60 px-6 py-3 text-lg font-bold text-white transition-transform hover:scale-105 md:px-10 md:py-4 md:text-2xl"
          >
            Comienza gratis
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

Create `OpeningMosaic.tsx` with `progress`, `variant`, and `isMobile`. Render only the active desktop or mobile grid so every selected channel has exactly one measurable source node. Render every cell with `data-opening-tile={tile.id}` and selected sources with `data-shared-tile-source={tile.channelId}`. Replace the 17 top-level hook bundles with a child component so hooks are legal:

```tsx
function OpeningTileCell({ tile, index, progress, mobile }: {
  tile: OpeningTile;
  index: number;
  progress: MotionValue<number>;
  mobile: boolean;
}) {
  const start = 0.18 + index * 0.012;
  const scale = useTransform(progress, [start, Math.min(start + 0.22, 0.50)], [0.25, 1]);
  const opacity = useTransform(progress, [start, Math.min(start + 0.14, 0.47)], [0, 1]);
  const y = useTransform(progress, [start, Math.min(start + 0.22, 0.50)], [50, 0]);
  const position = mobile ? tile.mobile : tile.desktop;
  if (!position) return null;
  return (
    <motion.div
      data-opening-tile={tile.id}
      data-shared-tile-source={tile.channelId}
      style={{ gridColumn: position.col, gridRow: position.row, scale, opacity, y }}
      className="overflow-hidden rounded-lg bg-gray-100 md:rounded-xl lg:rounded-2xl"
    >
      <img src={tile.src} alt="" loading="lazy" className="size-full object-cover" />
    </motion.div>
  );
}
```

The component shell must keep the header offset and render both responsive grids from the same metadata:

```tsx
export default function OpeningMosaic({ progress, variant, isMobile }: {
  progress: MotionValue<number>;
  variant: 'mosaic-only' | 'channel-handoff';
  isMobile: boolean;
}) {
  const gridOpacity = useTransform(progress, [0.18, 0.35], [0, 1]);
  const copyOpacity = useTransform(progress, [0.35, 0.50], [0, 1]);

  const renderCopy = () => (
    <motion.h2 style={{ opacity: copyOpacity }} className="relative text-center text-base font-light leading-snug text-black sm:text-lg md:text-2xl lg:text-4xl xl:text-5xl">
      Tiendas, gyms, estéticas, clínicas y más.<br />
      Cobra, organiza y crece desde un solo lugar.
    </motion.h2>
  );

  return (
    <div data-opening-mosaic={variant} className="absolute inset-x-0 bottom-0 top-[100px] overflow-hidden bg-white">
      <motion.div style={{ opacity: gridOpacity }} className={isMobile ? 'absolute inset-0 size-full p-3' : 'absolute inset-0 size-full p-4 md:p-6 lg:p-8'}>
        <div className={isMobile ? 'grid size-full grid-cols-3 grid-rows-5 gap-2' : 'grid size-full grid-cols-9 grid-rows-5 gap-3 lg:gap-4'}>
          {OPENING_TILES.map((tile, index) => <OpeningTileCell key={tile.id} tile={tile} index={index} progress={progress} mobile={isMobile} />)}
          <div className={isMobile ? 'relative z-20 col-span-3 col-start-1 row-start-3 flex items-center justify-center px-2' : 'relative z-20 col-span-9 col-start-1 row-start-3 flex items-center justify-center px-4'}>
            <div className="relative"><div className={isMobile ? 'absolute -inset-x-4 -inset-y-2 rounded-lg bg-white/90 backdrop-blur-sm' : 'absolute -inset-x-6 -inset-y-3 rounded-xl bg-white/90 backdrop-blur-sm'} />{renderCopy()}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
```

- [ ] **Step 6: Add the reusable scroll root and make SquareHero a compatibility wrapper**

Create `OpeningJourney.tsx`:

```tsx
export interface OpeningJourneyProps {
  variant?: 'mosaic-only' | 'channel-handoff';
  autoplay?: boolean;
}

export default function OpeningJourney({ variant = 'channel-handoff', autoplay = true }: OpeningJourneyProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ['start start', 'end end'] });

  useEffect(() => {
    const media = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(media.matches);
    update();
    media.addEventListener('change', update);
    window.dispatchEvent(new CustomEvent('avoqado-ready'));
    return () => media.removeEventListener('change', update);
  }, []);

  return (
    <div
      ref={rootRef}
      data-opening-mode="animated"
      data-opening-variant={variant}
      className={variant === 'mosaic-only' ? 'relative h-[180vh] bg-black' : 'relative h-[260vh] bg-black md:h-[300vh]'}
    >
      <div className="sticky left-0 top-0 h-screen w-full overflow-hidden">
        <OpeningVideo progress={scrollYProgress} isMobile={isMobile} autoplay={autoplay} />
        <OpeningMosaic progress={scrollYProgress} variant={variant} isMobile={isMobile} />
      </div>
    </div>
  );
}
```

Replace `SquareHero.tsx` with:

```tsx
import OpeningJourney from './home-opening/OpeningJourney';

export default function SquareHero() {
  return <OpeningJourney variant="mosaic-only" autoplay />;
}
```

Do not recreate the old `Continue scrolling...` spacer.

- [ ] **Step 7: Run the compatibility test and build**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop --workers=1
npm run build
```

Expected: the new test passes and Astro build exits `0`.

- [ ] **Step 8: Commit the reusable opening**

```bash
git add public/video4-poster.webp src/components/interactive/SquareHero.tsx src/components/interactive/home-opening/opening-tiles.ts src/components/interactive/home-opening/OpeningVideo.tsx src/components/interactive/home-opening/OpeningMosaic.tsx src/components/interactive/home-opening/OpeningJourney.tsx tests/e2e/home-opening.spec.ts
git commit -m "refactor(homepage): extract reusable video mosaic opening"
```

---

### Task 3: Replace homepage entry and channels with the continuous opening

**Files:**
- Create: `src/components/interactive/home-opening/ChannelHandoff.tsx`
- Create: `src/components/interactive/home-opening/ReducedMotionOpening.tsx`
- Modify: `src/components/interactive/home-opening/OpeningJourney.tsx`
- Modify: `src/components/interactive/home-opening/OpeningMosaic.tsx`
- Modify: `src/components/interactive/home-story/HomepageStory.tsx`
- Modify: `src/components/interactive/home-story/AnimatedStory.tsx`
- Modify: `src/components/interactive/home-story/story.ts`
- Modify: `src/components/interactive/home-story/StoryStage.tsx`
- Modify: `src/components/interactive/home-story/ReducedMotionStory.tsx`
- Delete after move: `src/components/interactive/home-story/scenes/HeroScene.tsx`
- Delete after move: `src/components/interactive/home-story/scenes/ChannelsScene.tsx`
- Test: `tests/e2e/home-opening.spec.ts`
- Test: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**
- Consumes: `OpeningJourney variant="channel-handoff"`, `OPENING_CHANNELS`, `STORY_FIXTURE`, and the Task 1 measured route.
- Produces: `[data-opening-channel-handoff]`, four `[data-channel-id]` rows, `[data-channel-route-*]`, and a post-opening `STORY_SCENES` array containing exactly seven scenes.

- [ ] **Step 1: Add failing homepage composition tests**

Append to `tests/e2e/home-opening.spec.ts`:

```ts
test('restores the approved homepage opening and hands off directly to service', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  const opening = page.locator('[data-opening-mode="animated"]');
  await expect(opening).toHaveAttribute('data-opening-variant', 'channel-handoff');
  await expect(opening.getByRole('heading', { level: 1 })).toContainText('Tu tienda, tu gym, tu estética');
  await expect(opening.locator('[data-opening-tile]')).toHaveCount(17);

  await scrollOpeningTo(page, 0.97);
  const channels = opening.locator('[data-opening-channel-handoff]');
  await expect(channels).toContainText('Tu cliente empieza como prefiera');
  await expect(channels.locator('[data-channel-id]')).toHaveCount(4);
  await expect(channels.locator('[data-channel-id="booking-widget"]')).toContainText('Seleccionado');
  await expect(channels).toContainText('Booking Widget → Reserva confirmada');

  await expect(page.getByText('Un cliente hace una cosa. Avoqado mueve todo lo demás.')).toHaveCount(0);
  const story = page.locator('[data-story-mode="animated"]');
  await expect(story.locator('[data-story-scene]')).toHaveCount(7);
  await expect(story.locator('[data-story-scene]').first()).toHaveAttribute('data-story-scene', 'service');
});
```

Update the opening of `tests/e2e/home-scrollytelling.spec.ts` to:

```ts
const sceneOrder = [
  'service',
  'payment',
  'aftercare',
  'operations',
  'finance',
  'multibranch',
  'ai',
] as const;
```

Move assertions for `Booking Widget → Reserva confirmada` from `[data-story-scene="channels"]` to `[data-opening-channel-handoff]`, and change the H1 expectation to `Tu tienda, tu gym, tu estética`.

- [ ] **Step 2: Run the new composition test and verify the old homepage fails it**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop --grep "restores the approved" --workers=1
```

Expected: FAIL because `/` still mounts only `HomepageStory` with `entry` and `channels`.

- [ ] **Step 3: Migrate the measured connector before deleting ChannelsScene**

Run:

```bash
git mv src/components/interactive/home-story/scenes/ChannelsScene.tsx src/components/interactive/home-opening/ChannelHandoff.tsx
```

In `ChannelHandoff.tsx`:

- change the default component signature to `ChannelHandoff({ progress, connectorProgress }: { progress: MotionValue<number>; connectorProgress: MotionValue<number> })`;
- remove the `SceneFrame` wrapper/import;
- remove the local `Channel` interface, local `channels` array, and all Lucide imports; retain `ChannelRow` and adapt it to `(typeof OPENING_CHANNELS)[number]` so its staggered opacity/X transforms stay intact;
- import `OPENING_CHANNELS`/`OPENING_TILES` from `./opening-tiles` and `STORY_FIXTURE` from `../home-story/story-fixture`;
- import `../home-story/home-story.css` directly so the moved source/target anchor rules do not depend on another scene importing `SceneFrame` first;
- keep the entire Task 1 measurement effect, route interpolation, SVG, active path, and pulse; change only its progress subscription/dependency from `progress` to `connectorProgress` so row entrance and route travel use separate normalized clocks;
- replace icon cells with image placeholders from `OPENING_CHANNELS`;
- add `data-opening-channel-handoff`, `data-channel-id`, and `data-shared-tile-target` attributes;
- keep `data-channel-route-source`, `data-channel-route-target`, `data-channel-route-path`, `data-channel-route-active`, and `data-story-primary-pulse`.

Replace `ChannelRow` and its call site with:

```tsx
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

{OPENING_CHANNELS.map((channel, index) => (
  <ChannelRow key={channel.id} channel={channel} index={index} progress={progress} sourceRef={channel.active ? sourceRef : undefined} />
))}
```

Use the normalized `progress` for row/event entrance and `connectorProgress` for the existing one-way route behavior. Keep all route transforms on the latter.

Replace only the outer `SceneFrame` tags with a `motion.section`. Keep the migrated `<div ref={visualRef} className="story-channel-visual relative grid h-full min-h-0 content-center gap-3 sm:grid-cols-[minmax(260px,1.05fr)_minmax(220px,0.8fr)] sm:items-center sm:gap-8">` as the second child of the new grid; inside it, apply the row-loop replacement above and leave the reservation card, SVG paths, anchors, and pulse unchanged. Insert this heading block as the first child:

```tsx
const surfaceOpacity = useTransform(progress, [0, 0.12], [0, 1]);
const channelHeading = (
  <div>
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-800">Una sola entrada de verdad</p>
    <h2 id="opening-channels-title" className="mt-3 text-3xl font-light tracking-[-0.04em] sm:text-5xl lg:text-6xl">Tu cliente empieza como prefiera.</h2>
    <p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.</p>
  </div>
);
```

The new outer section must carry `data-opening-channel-handoff`, `data-story-scene="channels"`, `aria-labelledby="opening-channels-title"`, `style={{ opacity: surfaceOpacity }}`, and `className="absolute inset-0 z-30 bg-neutral-50 text-neutral-950"`. Wrap `channelHeading` plus the unchanged visual in `className="mx-auto grid h-full max-w-7xl content-center gap-6 px-5 pb-8 pt-[calc(var(--site-header-height)+1rem)] md:grid-cols-[minmax(220px,.7fr)_minmax(0,1.3fr)] md:items-center md:gap-10 md:px-10"`, then append `<p className="sr-only">Booking Widget produce una reserva confirmada para {STORY_FIXTURE.customer}, con servicio, hora y sucursal.</p>` before closing the section.

- [ ] **Step 4: Mount ChannelHandoff in the last phase of OpeningJourney**

Before the return in `OpeningJourney`, create two normalized clocks:

```tsx
const channelProgress = useTransform(scrollYProgress, [0.76, 0.91], [0, 1], { clamp: true });
const connectorProgress = useTransform(scrollYProgress, [0.84, 0.94], [0, 1], { clamp: true });
```

Add inside the opening sticky, after `OpeningMosaic`:

```tsx
{variant === 'channel-handoff' ? (
  <ChannelHandoff progress={channelProgress} connectorProgress={connectorProgress} />
) : null}
```

In `OpeningMosaic`, pass `handoff={variant === 'channel-handoff'}` into every `OpeningTileCell`. Rename its entrance opacity to `entranceOpacity`, then compose entrance/exit without losing the stagger:

```tsx
const exitOpacity = useTransform(
  progress,
  handoff && !tile.channelId ? [0.62, 0.72] : [0, 1],
  handoff && !tile.channelId ? [1, 0] : [1, 1],
);
const opacity = useTransform(() => Math.min(entranceOpacity.get(), exitOpacity.get()));
```

Compose the mosaic copy with the same exit clock:

```tsx
const copyEntranceOpacity = useTransform(progress, [0.35, 0.50], [0, 1]);
const copyExitOpacity = useTransform(progress, handoff ? [0.62, 0.72] : [0, 1], handoff ? [1, 0] : [1, 1]);
const copyOpacity = useTransform(() => Math.min(copyEntranceOpacity.get(), copyExitOpacity.get()));
```

Keep the four selected source cells visible for Task 4; do not hard-code their travel.

- [ ] **Step 5: Define the seven post-opening scenes and remove old scene mounts**

In `story.ts`, set the scene order/ranges to:

```ts
export const STORY_SCENE_IDS = [
  'service',
  'payment',
  'aftercare',
  'operations',
  'finance',
  'multibranch',
  'ai',
] as const;

export const STORY_SCENES: readonly StoryScene[] = [
  {
    id: 'service',
    eyebrow: 'Contexto compartido',
    title: 'Tu equipo recibe el contexto completo.',
    body: 'Cliente, servicio, productos, colaborador y sucursal llegan juntos.',
    range: [0, 0.14], progressLabel: 'Servicio', theme: 'dark',
  },
  {
    id: 'payment',
    eyebrow: 'Cobro trazable',
    title: 'Cobra por el canal correcto. Conserva el hilo del dinero.',
    body: 'TPV, ecommerce, liga o efectivo: Avoqado registra cómo ocurrió cada pago y, en TPV compatibles, permite elegir la Cuenta de cobro habilitada.',
    range: [0.13, 0.30], progressLabel: 'Cobro', theme: 'dark',
  },
  {
    id: 'aftercare',
    eyebrow: 'Después del servicio',
    title: 'La experiencia termina bien. El trabajo apenas empieza.',
    body: 'Recibo digital, reseña de Google y facturación desde el recibo, cuando la sucursal lo tiene configurado.',
    range: [0.29, 0.44], progressLabel: 'Cliente', theme: 'light',
  },
  {
    id: 'operations',
    eyebrow: 'Automatización operativa',
    title: 'Una venta. Seis sistemas actualizados.',
    body: 'Ventas, inventario, compras, CRM, puntos, turnos y comisiones avanzan desde el mismo evento.',
    range: [0.43, 0.62], progressLabel: 'Operación', theme: 'dark',
  },
  {
    id: 'finance',
    eyebrow: 'Del cobro a los libros',
    title: 'El dinero no se pierde entre sistemas.',
    body: 'Costo, liquidación esperada, conciliación, banca y contabilidad conservan la referencia del pago.',
    range: [0.61, 0.75], progressLabel: 'Finanzas', theme: 'light',
  },
  {
    id: 'multibranch',
    eyebrow: 'Control multi-sucursal',
    title: 'Una sucursal o diez. Una sola operación.',
    body: 'Cambia de sucursal sin cerrar sesión y entiende la organización completa desde el dashboard web.',
    range: [0.74, 0.90], progressLabel: 'Sucursales', theme: 'dark',
  },
  {
    id: 'ai',
    eyebrow: 'Avoqado MCP',
    title: 'Y si quieres saber cómo vas, sólo pregunta.',
    body: 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.',
    range: [0.89, 1], progressLabel: 'IA', theme: 'dark',
  },
] as const;
```

In `StoryStage.tsx`, delete the `HeroScene`/`ChannelsScene` imports and cases. Keep only the seven exhaustive cases; the `default` must continue throwing for an unregistered id.

In `AnimatedStory.tsx`, change the root height to:

```tsx
className="relative h-[700vh] bg-neutral-950 lg:h-[800vh]"
```

Delete `HeroScene.tsx` after `StoryStage` has no import.

- [ ] **Step 6: Add the semantic static opening and compose HomepageStory**

Create `ReducedMotionOpening.tsx` with the complete static structure below:

```tsx
import { pushEvent, trackGetStarted } from '../../../lib/gtm';
import { OPENING_CHANNELS, OPENING_TILES } from './opening-tiles';

export default function ReducedMotionOpening({ mode = 'static' }: { mode?: 'static' | 'noscript' }) {
  return (
    <section data-opening-mode={mode} className="bg-neutral-950 text-neutral-50">
      <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
        <img src="/video4-poster.webp" alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover opacity-45" />
        <div className="relative z-10">
          <h1 className="text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">Tu tienda, tu gym, tu estética.<br />Un solo sistema.</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-200">Punto de venta, cobros, citas, inventario y reportes — todo en una app. Más barato que lo que ya pagas en pedacitos.</p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a href="/wa?src=hero_demo&text=Hola%2C%20me%20interesa%20una%20demo%20de%20Avoqado%20de%2015%20minutos" target="_blank" rel="noopener noreferrer" onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'hero' })} className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 font-semibold text-black">Agenda por WhatsApp</a>
            <a href="https://dashboard.avoqado.io/signup" onClick={event => trackGetStarted(event, 'hero')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-6 font-semibold text-white">Comienza gratis</a>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 px-6 py-20 text-neutral-950">
        <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 md:grid-cols-6">
          {OPENING_TILES.map(tile => <img key={tile.id} src={tile.src} alt="" loading="lazy" className="aspect-square size-full rounded-lg object-cover" />)}
        </div>
        <div className="mx-auto mt-12 max-w-3xl">
          <h2 className="text-3xl font-light tracking-[-0.03em] sm:text-5xl">Tiendas, gyms, estéticas, clínicas y más.<br />Cobra, organiza y crece desde un solo lugar.</h2>
          <div className="my-14 h-px bg-black/10" aria-hidden="true" />
          <h2 className="text-3xl font-light tracking-[-0.03em] sm:text-5xl">Tu cliente empieza como prefiera.</h2>
          <p className="mt-4 text-neutral-600">Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.</p>
          <ol className="mt-8 border-y border-black/10">
            {OPENING_CHANNELS.map(channel => <li key={channel.id} data-channel-id={channel.id} className="flex items-center justify-between border-b border-black/8 py-3 last:border-b-0"><strong>{channel.label}</strong><span>{channel.result}</span></li>)}
          </ol>
          <div data-channel-route-summary className="mt-6 border-y border-black/10 py-4">
            <strong className="block text-lg font-semibold text-green-800">Booking Widget → Reserva confirmada</strong>
            <span className="mt-1 block text-sm text-neutral-600">La cita entra con cliente, servicio, hora y sucursal.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
```

Replace `HomepageStory.tsx` with this composition:

```tsx
export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  const [forceMotion, setForceMotion] = useState(false);

  useEffect(() => {
    setForceMotion(new URLSearchParams(window.location.search).get('motion') === 'full');
    setMounted(true);
  }, []);

  const staticMode = mounted && reduceMotion && !forceMotion;

  return (
    <>
      {staticMode ? (
        <>
          <ReducedMotionOpening />
          <ReducedMotionStory />
        </>
      ) : (
        <>
          <OpeningJourney variant="channel-handoff" autoplay={mounted && (!reduceMotion || forceMotion)} />
          <AnimatedStory />
        </>
      )}
      <noscript>
        <style dangerouslySetInnerHTML={{ __html: '[data-opening-mode="animated"], [data-story-mode="animated"] { display: none !important; }' }} />
        <ReducedMotionOpening mode="noscript" />
        <ReducedMotionStory mode="noscript" />
      </noscript>
    </>
  );
}
```

In `ReducedMotionStory`, render only `STORY_SCENES`, make every scene heading `h2`, and preserve the payment summary and final CTA. Remove the channels-specific branch and first-scene hero CTA branch.

- [ ] **Step 7: Update timeline helpers in existing E2E tests**

Replace old animated progress expectations with:

```ts
for (const [progress, id] of [
  [0.04, 'service'],
  [0.22, 'payment'],
  [0.80, 'multibranch'],
  [0.94, 'ai'],
  [0.22, 'payment'],
] as const) {
  await root.evaluate((element, value) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, progress);
  await expect(root).toHaveAttribute('data-active-scene', id);
}
```

Move all connector selectors in tests at lines currently covering `channels` to:

```ts
const opening = page.locator('[data-opening-mode="animated"]');
await scrollOpeningTo(page, 0.90);
const scene = opening.locator('[data-opening-channel-handoff]');
```

Remove `channels` from multi-scene pulse loops; its one pulse is now asserted separately in `home-opening.spec.ts`.

- [ ] **Step 8: Run composition, story, reduced-motion, and no-JS tests**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --project=chromium-reduced --project=chromium-nojs --workers=1
npm run build
```

Expected: all selected tests pass, one H1 is visible in every mode, and build exits `0`.

- [ ] **Step 9: Commit the new homepage composition**

```bash
git add src/components/interactive/home-opening src/components/interactive/home-story/HomepageStory.tsx src/components/interactive/home-story/AnimatedStory.tsx src/components/interactive/home-story/story.ts src/components/interactive/home-story/StoryStage.tsx src/components/interactive/home-story/ReducedMotionStory.tsx src/components/interactive/home-story/scenes/HeroScene.tsx src/components/interactive/home-story/scenes/ChannelsScene.tsx tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): restore video mosaic channel opening"
```

---

### Task 4: Move the four selected tiles through measured shared-element geometry

**Files:**
- Create: `src/components/interactive/home-opening/SharedTileLayer.tsx`
- Modify: `src/components/interactive/home-opening/OpeningJourney.tsx`
- Modify: `src/components/interactive/home-opening/OpeningMosaic.tsx`
- Modify: `src/components/interactive/home-opening/ChannelHandoff.tsx`
- Test: `tests/e2e/home-opening.spec.ts`

**Interfaces:**
- Consumes: source nodes `[data-shared-tile-source="<channel-id>"]`, target nodes `[data-shared-tile-target="<channel-id>"]`, `OPENING_CHANNELS`, and opening `scrollYProgress`.
- Produces: one `[data-shared-tile-overlay="<channel-id>"]` image per channel, `onReadyChange(ready: boolean)`, and no duplicated visible source/target during travel.

- [ ] **Step 1: Add failing monotonic-travel and endpoint tests**

Append:

```ts
test('moves the four mosaic tiles continuously into their channel rows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  const distances: number[][] = [];
  for (const progress of [0.64, 0.71, 0.80]) {
    await scrollOpeningTo(page, progress);
    distances.push(await page.locator('[data-shared-tile-overlay]').evaluateAll(nodes => nodes.map(node => {
      const id = node.getAttribute('data-shared-tile-overlay');
      const target = document.querySelector<HTMLElement>(`[data-shared-tile-target="${id}"]`)!;
      const a = node.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      return Math.hypot((a.left + a.width / 2) - (b.left + b.width / 2), (a.top + a.height / 2) - (b.top + b.height / 2));
    })));
  }

  expect(distances).toHaveLength(3);
  for (let index = 0; index < 4; index += 1) {
    expect(distances[1][index]).toBeLessThan(distances[0][index]);
    expect(distances[2][index]).toBeLessThan(distances[1][index]);
    expect(distances[2][index]).toBeLessThanOrEqual(3);
  }
});

test('restores the mosaic when scrolling the shared tiles backwards', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await scrollOpeningTo(page, 0.80);
  await scrollOpeningTo(page, 0.61);

  const selectedSources = page.locator('[data-shared-tile-source]');
  await expect(selectedSources).toHaveCount(4);
  for (const source of await selectedSources.all()) await expect(source).toBeVisible();
  await expect(page.locator('[data-opening-channel-handoff]')).toBeHidden();
});
```

- [ ] **Step 2: Run the travel test and verify overlays are absent**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop --grep "moves the four|restores the mosaic" --workers=1
```

Expected: FAIL because `[data-shared-tile-overlay]` has count `0`.

- [ ] **Step 3: Implement one measured overlay component per channel**

Create `SharedTileLayer.tsx` with these types and measurement behavior:

```tsx
interface Box { left: number; top: number; width: number; height: number }
interface Geometry { source: Box; target: Box }
type GeometryMap = Partial<Record<OpeningChannelId, Geometry>>;

function boxWithin(root: HTMLElement, element: HTMLElement): Box {
  let left = 0;
  let top = 0;
  let current: HTMLElement | null = element;
  while (current && current !== root) {
    left += current.offsetLeft;
    top += current.offsetTop;
    current = current.offsetParent as HTMLElement | null;
  }
  if (current === root) return { left, top, width: element.offsetWidth, height: element.offsetHeight };
  const rootRect = root.getBoundingClientRect();
  const rect = element.getBoundingClientRect();
  return { left: rect.left - rootRect.left, top: rect.top - rootRect.top, width: rect.width, height: rect.height };
}

function SharedTile({ channel, geometry, progress }: {
  channel: (typeof OPENING_CHANNELS)[number];
  geometry: Geometry;
  progress: MotionValue<number>;
}) {
  const travel = useTransform(progress, [0.62, 0.80], [0, 1], { clamp: true });
  const opacity = useTransform(progress, [0.615, 0.625, 0.795, 0.805], [0, 1, 1, 0]);
  const x = useTransform(travel, value => (geometry.target.left - geometry.source.left) * value);
  const y = useTransform(travel, value => (geometry.target.top - geometry.source.top) * value);
  const scaleX = useTransform(travel, value => 1 + ((geometry.target.width / geometry.source.width) - 1) * value);
  const scaleY = useTransform(travel, value => 1 + ((geometry.target.height / geometry.source.height) - 1) * value);
  const tile = OPENING_TILES.find(item => item.id === channel.tileId)!;

  return (
    <motion.img
      data-shared-tile-overlay={channel.id}
      src={tile.src}
      alt=""
      aria-hidden="true"
      className="pointer-events-none absolute z-40 origin-top-left rounded-lg object-cover"
      style={{ left: geometry.source.left, top: geometry.source.top, width: geometry.source.width, height: geometry.source.height, x, y, scaleX, scaleY, opacity }}
    />
  );
}
```

The exported `SharedTileLayer` receives `rootRef: RefObject<HTMLDivElement>` and `progress`. Implement the measurement and cleanup exactly as follows:

```tsx
export default function SharedTileLayer({ rootRef, progress, layoutKey, onReadyChange }: {
  rootRef: RefObject<HTMLDivElement>;
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
        const source = root.querySelector<HTMLElement>(`[data-shared-tile-source="${channel.id}"]`);
        const target = root.querySelector<HTMLElement>(`[data-shared-tile-target="${channel.id}"]`);
        if (!source || !target) continue;
        const sourceBox = boxWithin(root, source);
        const targetBox = boxWithin(root, target);
        if (sourceBox.width <= 0 || sourceBox.height <= 0 || targetBox.width <= 0 || targetBox.height <= 0) continue;
        next[channel.id] = { source: sourceBox, target: targetBox };
      }
      if (Object.keys(next).length === OPENING_CHANNELS.length) setGeometry(next);
    };

    const schedule = () => frame.postRender(measure);
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    for (const channel of OPENING_CHANNELS) {
      const source = root.querySelector<HTMLElement>(`[data-shared-tile-source="${channel.id}"]`);
      const target = root.querySelector<HTMLElement>(`[data-shared-tile-target="${channel.id}"]`);
      if (source) observer.observe(source);
      if (target) observer.observe(target);
    }
    schedule();
    void document.fonts?.ready.then(schedule);
    return () => {
      active = false;
      cancelFrame(schedule);
      cancelFrame(measure);
      observer.disconnect();
    };
  }, [layoutKey, onReadyChange, rootRef]);

  useEffect(() => {
    onReadyChange(Object.keys(geometry).length === OPENING_CHANNELS.length);
  }, [geometry, onReadyChange]);

  return (
    <div className="pointer-events-none absolute inset-0 z-40" aria-hidden="true">
      {OPENING_CHANNELS.map(channel => geometry[channel.id] ? (
        <SharedTile key={channel.id} channel={channel} geometry={geometry[channel.id]!} progress={progress} />
      ) : null)}
    </div>
  );
}
```

In `OpeningJourney`, add `const [sharedTilesReady, setSharedTilesReady] = useState(false)` and reset it with `useEffect(() => setSharedTilesReady(false), [isMobile])`. Pass `layoutKey={isMobile ? 'mobile' : 'desktop'}` and `onReadyChange={setSharedTilesReady}` to `SharedTileLayer`, pass `handoffReady={sharedTilesReady}` to `OpeningMosaic`, and pass `ready={sharedTilesReady}` to `ChannelHandoff`. When `variant === 'mosaic-only'`, keep `handoffReady={false}` and do not mount either handoff component.

In `OpeningMosaic`, gate all Task 3/4 exit ranges with `handoff && handoffReady`; until geometry is ready, all 17 tiles and mosaic copy remain in their last coherent state. In `ChannelHandoff`, add `ready: boolean` and set the root style to `style={{ opacity: ready ? surfaceOpacity : 0 }}`.

- [ ] **Step 4: Coordinate source, overlay, and target opacity**

In `OpeningMosaic`, update the `exitOpacity` ranges inside `OpeningTileCell` so selected cells hand off to the overlay while non-selected cells retain Task 3 behavior:

```tsx
const exitRange = !handoff ? [0, 1] : tile.channelId ? [0.615, 0.625] : [0.62, 0.72];
const exitValues = !handoff ? [1, 1] : [1, 0];
const exitOpacity = useTransform(progress, exitRange, exitValues);
const opacity = useTransform(() => Math.min(entranceOpacity.get(), exitOpacity.get()));
```

In `ChannelHandoff`, add `openingProgress: MotionValue<number>` to the props. Add the same prop to `ChannelRow`, pass it from the `OPENING_CHANNELS.map` call, keep hooks out of the row loop by extracting this target component, and replace the Task 3 target `<span>` with `<ChannelTarget channel={channel} progress={openingProgress} />`:

```tsx
function ChannelTarget({ channel, progress }: {
  channel: (typeof OPENING_CHANNELS)[number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, [0.795, 0.805], [0, 1]);
  const tile = OPENING_TILES.find(item => item.id === channel.tileId)!;
  return (
    <motion.span data-shared-tile-target={channel.id} style={{ opacity }} className="block h-10 w-12 overflow-hidden rounded-lg bg-neutral-200" aria-hidden="true">
      <img src={tile.src} alt="" className="size-full object-cover" />
    </motion.span>
  );
}
```

Update the `OpeningJourney` mount to:

```tsx
<ChannelHandoff
  openingProgress={scrollYProgress}
  progress={channelProgress}
  connectorProgress={connectorProgress}
/>
```

Keep the target placeholder laid out at all times so measurement never depends on opacity.

In `OpeningJourney`, put a ref on the sticky stage and mount:

```tsx
{variant === 'channel-handoff' ? (
  <SharedTileLayer rootRef={stageRef} progress={scrollYProgress} layoutKey={isMobile ? 'mobile' : 'desktop'} onReadyChange={setSharedTilesReady} />
) : null}
```

- [ ] **Step 5: Run travel, resize, connector, and reverse tests**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "four mosaic tiles|restores the mosaic|Booking Widget|remide el origen" --workers=1
```

Expected: all selected tests pass; endpoint errors are `≤ 3px`.

- [ ] **Step 6: Commit the measured tile bridge**

```bash
git add src/components/interactive/home-opening/SharedTileLayer.tsx src/components/interactive/home-opening/OpeningJourney.tsx src/components/interactive/home-opening/OpeningMosaic.tsx src/components/interactive/home-opening/ChannelHandoff.tsx tests/e2e/home-opening.spec.ts
git commit -m "feat(homepage): bridge mosaic tiles into channels"
```

---

### Task 5: Lock reduced motion, no-JS, video failure, semantics, and analytics

**Files:**
- Modify: `src/components/interactive/home-opening/OpeningVideo.tsx`
- Modify: `src/components/interactive/home-opening/ReducedMotionOpening.tsx`
- Modify: `src/components/interactive/home-story/HomepageStory.tsx`
- Test: `tests/e2e/home-opening.spec.ts`
- Test: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**
- Consumes: `autoplay` from `HomepageStory`, `mode` on `ReducedMotionOpening`, existing CTA handlers.
- Produces: no autoplay under reduced motion, poster persistence after `video.error`, one semantic H1, and unchanged GTM payloads.

- [ ] **Step 1: Add failing resilience tests**

Append:

```ts
test('uses a static semantic opening for reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-reduced');
  await page.goto('/');
  await expect(page.locator('[data-opening-mode="static"]')).toBeVisible();
  await expect(page.locator('[data-opening-mode="animated"]')).toHaveCount(0);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu tienda, tu gym, tu estética');
  await expect(page.locator('[data-opening-mode="static"]')).toContainText('Booking Widget → Reserva confirmada');
});

test('keeps the same opening truth without JavaScript', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-nojs');
  await page.goto('/');
  const opening = page.locator('[data-opening-mode="noscript"]');
  await expect(opening).toBeVisible();
  await expect(opening.getByRole('heading', { level: 1 })).toContainText('Tu tienda, tu gym, tu estética');
  await expect(opening).toContainText('Consumer App');
  await expect(opening).toContainText('Booking Widget → Reserva confirmada');
});

test('keeps the poster visible when video playback fails', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.route('**/video4.webm', route => route.abort('failed'));
  await page.goto('/?motion=full');
  const fallback = page.locator('[data-opening-video-fallback]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('src', '/video4-poster.webp');
});
```

- [ ] **Step 2: Run the resilience tests and verify the missing fallback behavior**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop --project=chromium-reduced --project=chromium-nojs --grep "static semantic|without JavaScript|playback fails" --workers=1
```

Expected: at least the playback-failure test fails before adding explicit fallback state.

- [ ] **Step 3: Make video fallback explicit without duplicating heavy media**

In `OpeningVideo`, add `const [videoFailed, setVideoFailed] = useState(false)` and render:

```tsx
<img
  data-opening-video-fallback
  src="/video4-poster.webp"
  alt=""
  aria-hidden="true"
  className="absolute inset-0 size-full object-cover"
/>
{!videoFailed ? (
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

The poster is lightweight; the WebM still occurs only once. Keep the `play()/pause()` effect from Task 2 and do not call `play()` when `autoplay` is false or `videoFailed` is true.

- [ ] **Step 4: Verify semantic and analytics invariants**

Keep the exact existing handlers in `OpeningVideo`:

```tsx
onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'hero' })}
onClick={event => trackGetStarted(event, 'hero')}
```

Add to the existing causal-story test:

```ts
await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
await expect(page.locator('a[href*="/wa?src=hero_demo"]')).toHaveCount(1);
await expect(page.locator('a[href="https://dashboard.avoqado.io/signup"]')).toHaveCount(2);
```

The two signup links are the opening and final CTA; no third duplicate is allowed.

- [ ] **Step 5: Run all mode-specific opening and story tests**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --project=chromium-reduced --project=chromium-nojs --workers=1
npm run build
```

Expected: all selected tests pass and build exits `0`.

- [ ] **Step 6: Commit resilience and semantic coverage**

```bash
git add src/components/interactive/home-opening/OpeningVideo.tsx src/components/interactive/home-opening/ReducedMotionOpening.tsx src/components/interactive/home-story/HomepageStory.tsx tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "fix(homepage): preserve opening across motion modes"
```

---

### Task 6: Prove responsive geometry, reverse scrolling, and production readiness

**Files:**
- Modify/Test: `tests/e2e/home-opening.spec.ts`
- Modify only if a test exposes a defect: `src/components/interactive/home-opening/*.tsx`
- Modify only if a post-opening regression appears: `src/components/interactive/home-story/*.tsx`

**Interfaces:**
- Consumes: all data attributes established in Tasks 2–5.
- Produces: automated six-viewport acceptance evidence and a clean production build/full E2E run.

- [ ] **Step 1: Add the six-viewport checkpoint matrix**

Append this desktop-project-only test so it can set all required viewport sizes itself:

```ts
test('keeps every opening checkpoint inside the viewport at all required sizes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  const viewports = [
    { width: 1440, height: 900 },
    { width: 910, height: 691 },
    { width: 787, height: 701 },
    { width: 887, height: 502 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ];
  const checkpoints = [0.02, 0.55, 0.70, 0.82, 0.97];

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/?motion=full');
    for (const progress of checkpoints) {
      await scrollOpeningTo(page, progress);
      const geometry = await page.locator('[data-opening-mode="animated"] > div').evaluate(element => {
        const rects = [...element.querySelectorAll<HTMLElement>('[data-opening-tile], [data-shared-tile-overlay], [data-opening-channel-handoff], [data-channel-route-source], [data-channel-route-target]')]
          .filter(node => {
            const style = getComputedStyle(node);
            return style.display !== 'none' && Number.parseFloat(style.opacity || '1') > 0.05;
          })
          .map(node => node.getBoundingClientRect());
        return {
          overflowX: document.documentElement.scrollWidth - window.innerWidth,
          outside: rects.filter(rect => rect.left < -3 || rect.right > window.innerWidth + 3 || rect.top < -3 || rect.bottom > window.innerHeight + 3).length,
        };
      });
      expect(geometry.overflowX).toBeLessThanOrEqual(1);
      expect(geometry.outside).toBe(0);
      await testInfo.attach(`opening-${viewport.width}x${viewport.height}-${Math.round(progress * 100)}`, {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      });
    }
  }
});
```

- [ ] **Step 2: Add console/hydration monitoring to the same matrix**

Before navigation, collect only real errors:

```ts
const errors: string[] = [];
page.on('console', message => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', error => errors.push(error.message));
```

After all loops, assert `expect(errors).toEqual([])`.

- [ ] **Step 3: Run the six-viewport matrix and fix only evidenced defects**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop --grep "all required sizes" --workers=1
```

Expected: PASS. If it fails, make the smallest breakpoint/layout correction in the responsible `home-opening` component, rerun this exact command, and do not relax the `3px`/overflow assertions.

- [ ] **Step 4: Run the complete homepage suites serially**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --workers=1
```

Expected: all relevant tests pass across desktop, mobile, small, reduced, and no-JS projects; project-specific skips are intentional.

- [ ] **Step 5: Run the entire E2E suite and production build**

Run:

```bash
npm run test:e2e -- --workers=1
npm run build
git diff --check
```

Expected: no failing tests, build exits `0`, and `git diff --check` prints nothing.

- [ ] **Step 6: Inspect the final diff for scope and artifact hygiene**

Run:

```bash
git status --short
git diff --stat 10d8a8f..HEAD
git diff --name-only 10d8a8f..HEAD
```

Expected: only the opening/story/test files, poster, spec, and plan are present. `test-results/`, `.gstack/`, `.superpowers/`, screenshots, and browser traces are not staged.

- [ ] **Step 7: Commit the final acceptance matrix and any evidence-driven fixes**

```bash
git add tests/e2e/home-opening.spec.ts src/components/interactive/home-opening src/components/interactive/home-story
git commit -m "test(homepage): verify opening handoff across viewports"
```

If `git status --short` shows no source changes beyond the test, commit only `tests/e2e/home-opening.spec.ts`. Never add `test-results/`.

---

## Final Verification Checklist

- [ ] `/` shows the original video hero, original H1/support, and original two CTAs.
- [ ] The full 17-item mosaic is readable before handoff.
- [ ] Exactly four approved assets move continuously into their matching channel rows.
- [ ] Exactly one point/route connects Booking Widget to Reserva confirmada within 3 px.
- [ ] Reverse scroll restores the mosaic without a visible backwards event animation.
- [ ] The next story scene is `service`; `entry` and standalone `channels` are absent.
- [ ] Reduced motion and no-JS show the complete static truth and do not autoplay video.
- [ ] `/scrollytelling` remains mosaic-only; `/demo` remains independent.
- [ ] All six required viewports have no overflow or out-of-stage visible elements.
- [ ] Navbar, Footer, FloatingChatbot, WhatsApp, signup, and GTM behavior remain intact.
- [ ] Full Playwright suite and `npm run build` pass.
