# Homepage Scrollytelling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the homepage `/` as one continuous, causal scrollytelling journey from the customer's first action through payment, automation, finance, multi-branch management, and Avoqado MCP.

**Architecture:** Replace the current independent homepage islands with one SSR-rendered React island. A pure data layer owns the approved copy and one coherent business fixture; a static renderer provides reduced-motion/no-JavaScript access; an animated renderer maps one `useScroll` value into nine reversible scenes. Scene components remain passive and receive a normalized `MotionValue<number>` rather than reading global scroll state.

**Tech Stack:** Astro 5, React 18, TypeScript, Tailwind CSS 4, Framer Motion 12.23.26, Lucide React, Playwright 1.60.

## Global Constraints

- Scope is only `/`; `/demo` and `AvoqadoTour` must remain behaviorally unchanged.
- Active acquisition ICP is Mexican retail and appointment-service businesses, including owners with multiple branches.
- Brand direction is modern, premium, approachable, dark-first, cinematic, and Spanish-language.
- Use DM Sans and existing OKLCH/tinted-neutral tokens; no new font, animation, or icon dependency.
- One persistent green signal is the signature motion; no particles, bounce, elastic easing, or decorative infinite glow.
- Desktop and mobile must use different compositions; mobile cannot remove a primary promise.
- Reduced motion must render normal-flow static sections, not a long sticky with shortened durations.
- Hard cap: 14 viewports; target 10–12.
- Initial JavaScript ≤ 120 KiB gzip; total homepage JavaScript ≤ 160 KiB gzip; critical initial media ≤ 1 MiB.
- Use only transform, opacity, pathLength, and restrained color interpolation for scroll motion.
- Inventory and CFDI mockups carry a discreet `Premium` badge.
- Merchant routing copy must say manual `Cuenta de cobro` selection on compatible, configured TPVs; never claim intelligent routing or per-transaction bank-account selection.
- Multi-branch session switching is shown only in the web dashboard.
- Do not claim instant/guaranteed settlement or complete multi-RFC accounting.
- Preserve the unrelated `.gitignore` working-tree change and never stage it with this work.

---

## File Map

**Create**

- `playwright.config.ts` — local Chromium projects and Astro dev server.
- `tests/e2e/home-scrollytelling.spec.ts` — causal-order, motion, mobile, no-JS, and regression coverage.
- `src/components/interactive/home-story/story-fixture.ts` — one coherent sale/customer/branch/merchant fixture.
- `src/components/interactive/home-story/story.ts` — scene IDs, ranges, copy, active-scene resolution, and shared types.
- `src/components/interactive/home-story/HomepageStory.tsx` — reduced-motion switch and no-JS fallback.
- `src/components/interactive/home-story/ReducedMotionStory.tsx` — normal-flow semantic version.
- `src/components/interactive/home-story/AnimatedStory.tsx` — one global scroll root, active scene, completion analytics.
- `src/components/interactive/home-story/StoryStage.tsx` — scene composition registry.
- `src/components/interactive/home-story/StoryLayer.tsx` — normalized scene progress and reversible crossfade.
- `src/components/interactive/home-story/StoryProgress.tsx` — desktop rail and mobile progress line.
- `src/components/interactive/home-story/StoryPulse.tsx` — persistent green signal.
- `src/components/interactive/home-story/SceneFrame.tsx` — shared editorial copy/visual layout.
- `src/components/interactive/home-story/scenes/HeroScene.tsx`
- `src/components/interactive/home-story/scenes/ChannelsScene.tsx`
- `src/components/interactive/home-story/scenes/ServiceScene.tsx`
- `src/components/interactive/home-story/scenes/PaymentScene.tsx`
- `src/components/interactive/home-story/scenes/AftercareScene.tsx`
- `src/components/interactive/home-story/scenes/OperationsScene.tsx`
- `src/components/interactive/home-story/scenes/FinanceScene.tsx`
- `src/components/interactive/home-story/scenes/MultibranchScene.tsx`
- `src/components/interactive/home-story/scenes/AiScene.tsx`

**Modify**

- `package.json` — add Playwright scripts only; do not add packages.
- `src/pages/index.astro` — mount the single story, remove obsolete homepage islands/loaders, keep navbar/footer/chatbot.
- `src/styles/global.css` — shared header-height variables and pre-hydration reduced-motion guard.
- `src/components/interactive/NavigationMenu.tsx` — consume shared banner/header heights.
- `docs/scrollytelling-guide.md` — replace the stale homepage component inventory.

**Do not modify**

- `src/pages/demo.astro`
- `src/components/interactive/tour/**`
- Any backend, dashboard, POS, TPV, or MCP repository.

---

### Task 1: Establish the Playwright Harness

**Files:**

- Create: `playwright.config.ts`
- Create: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `package.json`

**Interfaces:**

- Produces: `npm run test:e2e` and Playwright projects named `chromium-desktop`, `chromium-mobile`, `chromium-small`, `chromium-reduced`, and `chromium-nojs`.
- Consumes: existing `npm run dev` and the already-installed `playwright` package/browser.

- [ ] **Step 1: Add the smoke-test configuration**

Create `playwright.config.ts`:

```ts
import { defineConfig } from 'playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4321';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  retries: 0,
  reporter: 'line',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : {
        command: 'npm run dev -- --host 127.0.0.1',
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      },
  projects: [
    {
      name: 'chromium-desktop',
      use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'chromium-mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'chromium-small',
      use: {
        browserName: 'chromium',
        viewport: { width: 320, height: 568 },
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'chromium-reduced',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        reducedMotion: 'reduce',
      },
    },
    {
      name: 'chromium-nojs',
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
        javaScriptEnabled: false,
      },
    },
  ],
});
```

- [ ] **Step 2: Add a passing baseline smoke test**

Create `tests/e2e/home-scrollytelling.spec.ts`:

```ts
import { expect, test } from 'playwright/test';

test('serves the homepage and keeps /demo independent', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Avoqado/);

  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Prueba Avoqado en 60 segundos',
  );
});
```

- [ ] **Step 3: Add package scripts**

Add these keys under `scripts` in `package.json`:

```json
"test:e2e": "playwright test",
"test:e2e:headed": "playwright test --headed",
"test:e2e:update": "playwright test --update-snapshots=all"
```

- [ ] **Step 4: Run the baseline test**

Run:

```bash
npm run test:e2e -- --project=chromium-desktop --workers=1
```

Expected: `1 passed`.

- [ ] **Step 5: Commit the harness**

```bash
git add package.json playwright.config.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "test(homepage): add scrollytelling browser harness"
```

---

### Task 2: Build the Semantic Story First

**Files:**

- Create: `src/components/interactive/home-story/story-fixture.ts`
- Create: `src/components/interactive/home-story/story.ts`
- Create: `src/components/interactive/home-story/ReducedMotionStory.tsx`
- Create: `src/components/interactive/home-story/HomepageStory.tsx`
- Modify: `src/pages/index.astro`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**

- Produces: `STORY_FIXTURE`, `STORY_SCENES`, `StoryScene`, `StorySceneId`, `getActiveSceneIndex()`, `<HomepageStory />`, and `<ReducedMotionStory />`.
- `STORY_SCENES` order is exactly `entry → channels → service → payment → aftercare → operations → finance → multibranch → ai`.

- [ ] **Step 1: Write the failing causal-order test**

Append to `tests/e2e/home-scrollytelling.spec.ts`:

```ts
const sceneOrder = [
  'entry',
  'channels',
  'service',
  'payment',
  'aftercare',
  'operations',
  'finance',
  'multibranch',
  'ai',
] as const;

test('cuenta la historia completa en orden causal', async ({ page }) => {
  await page.goto('/');

  const main = page.locator('main[data-scrollytelling]');
  await expect(main).toHaveCount(1);

  const scenes = main.locator('[data-story-mode="static"] [data-story-scene]');
  await expect(scenes).toHaveCount(sceneOrder.length);
  expect(await scenes.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-story-scene'))))
    .toEqual(sceneOrder);

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Un cliente hace una cosa',
  );
  await expect(main).toContainText('Cuenta de cobro');
  await expect(main).toContainText('Una sucursal o diez');
  await expect(main).toContainText('sólo pregunta');
  await expect(page.getByText('Continue scrolling...')).toHaveCount(0);
});
```

- [ ] **Step 2: Run RED and verify the expected failure**

Run:

```bash
npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  -g "cuenta la historia completa" \
  --project=chromium-desktop \
  --workers=1
```

Expected: FAIL because `main[data-scrollytelling]` does not exist.

- [ ] **Step 3: Create the single source of numerical truth**

Create `src/components/interactive/home-story/story-fixture.ts`:

```ts
export const STORY_FIXTURE = {
  organization: 'Estudio Lumina',
  venue: 'Sucursal Centro',
  comparisonVenue: 'Sucursal Norte',
  customer: 'María G.',
  staff: 'Ana Torres',
  service: 'Facial hidratante',
  product: 'Crema facial 50 ml',
  subtotal: '$295.00',
  tip: '$53.10',
  total: '$348.10',
  points: 29,
  commission: '$29.50',
  stockBefore: 8,
  stockAfter: 7,
  selectedMerchant: 'Operación diaria',
  alternateMerchant: 'Facturación',
} as const;

export type StoryFixture = typeof STORY_FIXTURE;
```

- [ ] **Step 4: Create scene data and active-index resolution**

Create `src/components/interactive/home-story/story.ts`:

```ts
export const STORY_SCENE_IDS = [
  'entry',
  'channels',
  'service',
  'payment',
  'aftercare',
  'operations',
  'finance',
  'multibranch',
  'ai',
] as const;

export type StorySceneId = (typeof STORY_SCENE_IDS)[number];

export interface StoryScene {
  id: StorySceneId;
  eyebrow: string;
  title: string;
  body: string;
  range: readonly [number, number];
  progressLabel: string;
  theme: 'dark' | 'light';
}

export const STORY_SCENES: readonly StoryScene[] = [
  {
    id: 'entry',
    eyebrow: 'Toda tu operación, conectada',
    title: 'Un cliente hace una cosa. Avoqado mueve todo lo demás.',
    body: 'Una reserva, una compra o un cobro se convierte en ventas, inventario, clientes, finanzas y decisiones — sin volver a capturar nada.',
    range: [0, 0.11],
    progressLabel: 'Inicio',
    theme: 'dark',
  },
  {
    id: 'channels',
    eyebrow: 'Una sola entrada de verdad',
    title: 'Tu cliente empieza como prefiera.',
    body: 'Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.',
    range: [0.10, 0.21],
    progressLabel: 'Canales',
    theme: 'light',
  },
  {
    id: 'service',
    eyebrow: 'Contexto compartido',
    title: 'Tu equipo recibe el contexto completo.',
    body: 'Cliente, servicio, productos, colaborador y sucursal llegan juntos.',
    range: [0.20, 0.31],
    progressLabel: 'Servicio',
    theme: 'dark',
  },
  {
    id: 'payment',
    eyebrow: 'Cobro trazable',
    title: 'Cobra por el canal correcto. Conserva el hilo del dinero.',
    body: 'TPV, ecommerce, liga o efectivo: Avoqado registra cómo ocurrió cada pago y, en TPV compatibles, permite elegir la Cuenta de cobro habilitada.',
    range: [0.30, 0.43],
    progressLabel: 'Cobro',
    theme: 'dark',
  },
  {
    id: 'aftercare',
    eyebrow: 'Después del servicio',
    title: 'La experiencia termina bien. El trabajo apenas empieza.',
    body: 'Recibo digital, reseña de Google y facturación desde el recibo, cuando la sucursal lo tiene configurado.',
    range: [0.42, 0.53],
    progressLabel: 'Cliente',
    theme: 'light',
  },
  {
    id: 'operations',
    eyebrow: 'Automatización operativa',
    title: 'Una venta. Seis sistemas actualizados.',
    body: 'Ventas, inventario, compras, CRM, puntos, turnos y comisiones avanzan desde el mismo evento.',
    range: [0.52, 0.67],
    progressLabel: 'Operación',
    theme: 'dark',
  },
  {
    id: 'finance',
    eyebrow: 'Del cobro a los libros',
    title: 'El dinero no se pierde entre sistemas.',
    body: 'Costo, liquidación esperada, conciliación, banca y contabilidad conservan la referencia del pago.',
    range: [0.66, 0.77],
    progressLabel: 'Finanzas',
    theme: 'light',
  },
  {
    id: 'multibranch',
    eyebrow: 'Control multi-sucursal',
    title: 'Una sucursal o diez. Una sola operación.',
    body: 'Cambia de sucursal sin cerrar sesión y entiende la organización completa desde el dashboard web.',
    range: [0.76, 0.89],
    progressLabel: 'Sucursales',
    theme: 'dark',
  },
  {
    id: 'ai',
    eyebrow: 'Avoqado MCP',
    title: 'Y si quieres saber cómo vas, sólo pregunta.',
    body: 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.',
    range: [0.88, 1],
    progressLabel: 'IA',
    theme: 'dark',
  },
] as const;

export function getActiveSceneIndex(progress: number): number {
  for (let index = STORY_SCENES.length - 1; index >= 0; index -= 1) {
    if (progress >= STORY_SCENES[index].range[0]) return index;
  }
  return 0;
}
```

- [ ] **Step 5: Create the semantic normal-flow renderer**

Create `src/components/interactive/home-story/ReducedMotionStory.tsx`:

```tsx
import { pushEvent, trackGetStarted } from '../../../lib/gtm';
import { STORY_SCENES } from './story';

interface Props {
  mode?: 'static' | 'noscript';
}

export default function ReducedMotionStory({ mode = 'static' }: Props) {
  return (
    <div
      data-story-mode={mode}
      className="bg-neutral-950 text-neutral-50"
    >
      {STORY_SCENES.map((scene, index) => {
        const Heading = index === 0 ? 'h1' : 'h2';
        const light = scene.theme === 'light';

        return (
          <section
            key={scene.id}
            data-story-scene={scene.id}
            className={light ? 'bg-neutral-50 text-neutral-950' : 'bg-neutral-950 text-neutral-50'}
          >
            <div className="mx-auto flex min-h-[70dvh] max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
              <p className={light ? 'text-sm font-medium text-green-800' : 'text-sm font-medium text-avoqado-green'}>
                {scene.eyebrow}
              </p>
              <Heading className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">
                {scene.title}
              </Heading>
              <p className={light ? 'mt-6 max-w-2xl text-lg text-neutral-600' : 'mt-6 max-w-2xl text-lg text-neutral-300'}>
                {scene.body}
              </p>
              {index === 0 || scene.id === 'ai' ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <a
                    href={`/wa?src=${index === 0 ? 'homepage_story_hero' : 'homepage_story_final'}&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: index === 0 ? 'homepage_story_hero' : 'homepage_story_final' })}
                    className={light ? 'inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white' : 'inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-50 px-6 text-sm font-semibold text-neutral-950'}
                  >
                    {index === 0 ? 'Agenda por WhatsApp' : 'Quiero verlo en mi negocio'}
                  </a>
                  <a href="https://dashboard.avoqado.io/signup" onClick={event => trackGetStarted(event, index === 0 ? 'homepage_story_hero' : 'homepage_story_final')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-current/20 px-6 text-sm font-semibold">Comienza gratis</a>
                </div>
              ) : null}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Create the first static HomepageStory**

Create `src/components/interactive/home-story/HomepageStory.tsx`:

```tsx
import ReducedMotionStory from './ReducedMotionStory';

export default function HomepageStory() {
  return <ReducedMotionStory />;
}
```

- [ ] **Step 7: Replace the homepage composition and loader experiment**

In `src/pages/index.astro`, keep the existing `<head>` metadata but replace the imports with:

```astro
---
import '../styles/global.css';
import Navbar from '../components/layout/Navbar.astro';
import HomepageStory from '../components/interactive/home-story/HomepageStory';
import Footer from '../components/layout/Footer.astro';
import FloatingChatbot from '../components/interactive/FloatingChatbot';
---
```

Replace everything inside `<body>` with:

```astro
<body class="m-0 w-full bg-neutral-950 p-0">
  <Navbar position="fixed" transparentOnTop={true} />
  <main data-scrollytelling>
    <HomepageStory client:load />
  </main>
  <Footer />
  <FloatingChatbot client:idle />
</body>
```

Delete the old loading variants, `avoqado-ready` listener, loader timeout, manual intersection observer, and old island wrappers from this page only.

- [ ] **Step 8: Run GREEN**

Run:

```bash
npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --project=chromium-desktop \
  --workers=1
npm run build
```

Expected: `2 passed`; Astro build exits `0`.

- [ ] **Step 9: Commit the semantic baseline**

```bash
git add src/pages/index.astro src/components/interactive/home-story tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): establish causal story structure"
```

---

### Task 3: Add One Reversible Scroll Engine

**Files:**

- Create: `src/components/interactive/home-story/AnimatedStory.tsx`
- Create: `src/components/interactive/home-story/StoryStage.tsx`
- Create: `src/components/interactive/home-story/StoryLayer.tsx`
- Create: `src/components/interactive/home-story/StoryProgress.tsx`
- Create: `src/components/interactive/home-story/StoryPulse.tsx`
- Modify: `src/components/interactive/home-story/HomepageStory.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**

- `AnimatedStory` owns the sole `useScroll` call.
- `StoryLayer` produces `localProgress: MotionValue<number>` normalized to the scene range.
- `StoryStage` receives `progress` and `activeIndex`; scene components never access `window.scrollY`.

- [ ] **Step 1: Write the failing scene-activation test**

Append:

```ts
test('activa escenas al avanzar y retroceder el scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  await expect(root).toBeVisible();

  for (const [progress, id] of [
    [0.04, 'entry'],
    [0.34, 'payment'],
    [0.79, 'multibranch'],
    [0.93, 'ai'],
    [0.34, 'payment'],
  ] as const) {
    await root.evaluate((element, value) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);
    await expect(root).toHaveAttribute('data-active-scene', id);
  }
});
```

- [ ] **Step 2: Run RED**

Run the named test. Expected: FAIL because animated mode does not exist.

- [ ] **Step 3: Implement the layer contract**

Create `StoryLayer.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { useEffect, useRef, type ReactNode } from 'react';
import type { StoryScene } from './story';

interface Props {
  scene: StoryScene;
  index: number;
  total: number;
  progress: MotionValue<number>;
  active: boolean;
  children: (localProgress: MotionValue<number>) => ReactNode;
}

export default function StoryLayer({ scene, index, total, progress, active, children }: Props) {
  const layerRef = useRef<HTMLElement>(null);
  const [start, end] = scene.range;
  const localProgress = useTransform(progress, [start, end], [0, 1], { clamp: true });
  const values = index === 0
    ? [1, 1, 1, 0]
    : index === total - 1
      ? [0, 1, 1, 1]
      : [0, 1, 1, 0];
  const opacity = useTransform(
    progress,
    [start, Math.min(start + 0.018, end), Math.max(end - 0.018, start), end],
    values,
  );
  const y = useTransform(localProgress, [0, 0.18, 0.82, 1], [24, 0, 0, -18]);

  useEffect(() => {
    layerRef.current?.toggleAttribute('inert', !active);
  }, [active]);

  return (
    <motion.section
      ref={layerRef}
      data-story-scene={scene.id}
      data-active={active ? 'true' : 'false'}
      aria-hidden={!active}
      className="absolute inset-0"
      style={{ opacity, y, pointerEvents: active ? 'auto' : 'none' }}
    >
      {children(localProgress)}
    </motion.section>
  );
}
```

- [ ] **Step 4: Implement progress and the persistent pulse**

Create `StoryProgress.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { STORY_SCENES } from './story';

interface Props {
  progress: MotionValue<number>;
  activeIndex: number;
}

export default function StoryProgress({ progress, activeIndex }: Props) {
  const mobileScale = useTransform(progress, [0, 1], [0, 1]);
  const milestones = STORY_SCENES.filter(scene => ['entry', 'payment', 'operations', 'multibranch', 'ai'].includes(scene.id));
  const activeStart = STORY_SCENES[activeIndex].range[0];
  const activeMilestone = milestones.reduce((current, scene, index) => scene.range[0] <= activeStart ? index : current, 0);

  return (
    <>
      <nav aria-label="Progreso de la historia" className="absolute left-6 top-1/2 z-40 hidden -translate-y-1/2 lg:block">
        <ol className="space-y-3 border-l border-white/10 pl-4">
          {milestones.map((scene, index) => (
            <li key={scene.id} className={index === activeMilestone ? 'text-xs text-white' : 'text-xs text-neutral-500'}>
              {scene.progressLabel}
            </li>
          ))}
        </ol>
      </nav>
      <div className="absolute inset-x-0 bottom-0 z-40 h-px bg-white/10 lg:hidden" aria-hidden="true">
        <motion.div className="h-px origin-left bg-avoqado-green" style={{ scaleX: mobileScale }} />
      </div>
    </>
  );
}
```

Create `StoryPulse.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';

export default function StoryPulse({ progress }: { progress: MotionValue<number> }) {
  const y = useTransform(progress, [0, 1], ['-38dvh', '38dvh']);
  const scale = useTransform(progress, [0, 0.5, 1], [0.8, 1.15, 0.8]);

  return (
    <div className="pointer-events-none absolute left-[38%] top-1/2 z-30 hidden h-[76dvh] w-px -translate-y-1/2 bg-white/8 lg:block" aria-hidden="true">
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <motion.span className="block size-3 rounded-full bg-avoqado-green shadow-[0_0_24px_rgb(122_221_44_/_0.45)]" style={{ y, scale }} />
      </span>
    </div>
  );
}
```

- [ ] **Step 5: Implement the stage and scroll root**

Create `StoryStage.tsx`:

```tsx
import type { MotionValue } from 'framer-motion';
import { STORY_SCENES } from './story';
import StoryLayer from './StoryLayer';

interface Props {
  progress: MotionValue<number>;
  activeIndex: number;
}

export default function StoryStage({ progress, activeIndex }: Props) {
  return (
    <div className="relative h-full w-full">
      {STORY_SCENES.map((scene, index) => (
        <StoryLayer
          key={scene.id}
          scene={scene}
          index={index}
          total={STORY_SCENES.length}
          progress={progress}
          active={index === activeIndex}
        >
          {() => (
            <div className={`flex h-full items-center ${scene.theme === 'light' ? 'bg-neutral-50 text-neutral-950' : 'bg-neutral-950 text-neutral-50'}`}>
              <div className="mx-auto w-full max-w-6xl px-6 md:px-10 lg:pl-32">
                <p className="text-sm font-medium text-avoqado-green">{scene.eyebrow}</p>
                {index === 0 ? (
                  <h1 className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-6xl lg:text-7xl">{scene.title}</h1>
                ) : (
                  <h2 className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-6xl lg:text-7xl">{scene.title}</h2>
                )}
                <p className="mt-6 max-w-2xl text-lg opacity-70">{scene.body}</p>
              </div>
            </div>
          )}
        </StoryLayer>
      ))}
    </div>
  );
}
```

Create `AnimatedStory.tsx`:

```tsx
import { useRef, useState } from 'react';
import { useMotionValueEvent, useScroll } from 'framer-motion';
import { pushEvent } from '../../../lib/gtm';
import { getActiveSceneIndex, STORY_SCENES } from './story';
import StoryProgress from './StoryProgress';
import StoryPulse from './StoryPulse';
import StoryStage from './StoryStage';

export default function AnimatedStory() {
  const rootRef = useRef<HTMLDivElement>(null);
  const completedRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollYProgress } = useScroll({
    target: rootRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', value => {
    const nextIndex = getActiveSceneIndex(value);
    setActiveIndex(current => current === nextIndex ? current : nextIndex);
    if (value >= 0.9 && !completedRef.current) {
      completedRef.current = true;
      pushEvent('homepage_story_complete');
    }
  });

  return (
    <div
      ref={rootRef}
      data-story-mode="animated"
      data-active-scene={STORY_SCENES[activeIndex].id}
      className="relative h-[900vh] bg-neutral-950 lg:h-[1000vh]"
    >
      <div
        className="sticky overflow-hidden"
        style={{
          top: 'var(--site-header-height)',
          height: 'calc(100dvh - var(--site-header-height))',
        }}
      >
        <StoryProgress progress={scrollYProgress} activeIndex={activeIndex} />
        <StoryPulse progress={scrollYProgress} />
        <StoryStage progress={scrollYProgress} activeIndex={activeIndex} />
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Switch by actual reduced-motion preference and add no-JS copy**

Replace `HomepageStory.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import AnimatedStory from './AnimatedStory';
import ReducedMotionStory from './ReducedMotionStory';

export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <>
      {mounted && reduceMotion ? <ReducedMotionStory /> : <AnimatedStory />}
      <noscript>
        <ReducedMotionStory mode="noscript" />
      </noscript>
    </>
  );
}
```

Update the causal-order test signature and scene locator so the same assertion follows the mode of each project:

```ts
test('cuenta la historia completa en orden causal', async ({ page }, testInfo) => {
  await page.goto('/');
  const main = page.locator('main[data-scrollytelling]');
  await expect(main).toHaveCount(1);
  const mode = testInfo.project.name === 'chromium-reduced'
    ? 'static'
    : testInfo.project.name === 'chromium-nojs'
      ? 'noscript'
      : 'animated';
  const scenes = main.locator(`[data-story-mode="${mode}"] [data-story-scene]`);
  await expect(scenes).toHaveCount(sceneOrder.length);
  expect(await scenes.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-story-scene')))).toEqual(sceneOrder);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Un cliente hace una cosa');
  await expect(main).toContainText('Cuenta de cobro');
  await expect(main).toContainText('Una sucursal o diez');
  await expect(main).toContainText('sólo pregunta');
  await expect(page.getByText('Continue scrolling...')).toHaveCount(0);
});
```

- [ ] **Step 7: Run GREEN and regression build**

Run the named activation test, then the full desktop file and `npm run build`.

Expected: activation follows down/up scroll; no hydration errors; build exits `0`.

- [ ] **Step 8: Commit the engine**

```bash
git add src/components/interactive/home-story tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): add continuous scroll story engine"
```

---

### Task 4: Design Hero Through Customer Aftercare

**Files:**

- Create: `src/components/interactive/home-story/SceneFrame.tsx`
- Create: `src/components/interactive/home-story/scenes/HeroScene.tsx`
- Create: `src/components/interactive/home-story/scenes/ChannelsScene.tsx`
- Create: `src/components/interactive/home-story/scenes/ServiceScene.tsx`
- Create: `src/components/interactive/home-story/scenes/PaymentScene.tsx`
- Create: `src/components/interactive/home-story/scenes/AftercareScene.tsx`
- Modify: `src/components/interactive/home-story/StoryStage.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**

- All scenes consume `{ scene: StoryScene; progress: MotionValue<number> }`.
- `SceneFrame` owns the 34/66 desktop layout and mobile copy/visual stack.
- Payment scene exposes exact visible text `Cuenta de cobro`, `Operación diaria`, and `TPV compatible`.

- [ ] **Step 1: Write the failing truth-boundary test**

Append:

```ts
test('presenta canales y routing sin prometer routing bancario inteligente', async ({ page }, testInfo) => {
  test.skip(['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const story = page.locator('main[data-scrollytelling]');

  await expect(story).toContainText('Consumer App');
  await expect(story).toContainText('Booking Widget');
  await expect(story).toContainText('POS iOS');
  await expect(story).toContainText('POS Android');
  await expect(story).toContainText('POS Desktop');
  await expect(story).toContainText('Cuenta de cobro');
  await expect(story).toContainText('Operación diaria');
  await expect(story).toContainText('TPV compatible');
  await expect(story).not.toContainText('routing inteligente');
  await expect(story).not.toContainText('elige tu cuenta bancaria');
});
```

- [ ] **Step 2: Run RED**

Expected: FAIL on the missing frontend and merchant labels.

- [ ] **Step 3: Implement the shared frame**

Create `SceneFrame.tsx`:

```tsx
import type { ReactNode } from 'react';
import type { StoryScene } from './story';

interface Props {
  scene: StoryScene;
  headingLevel?: 1 | 2;
  children: ReactNode;
}

export default function SceneFrame({ scene, headingLevel = 2, children }: Props) {
  const Heading = headingLevel === 1 ? 'h1' : 'h2';
  const light = scene.theme === 'light';

  return (
    <div className={light ? 'h-full bg-neutral-50 text-neutral-950' : 'h-full bg-neutral-950 text-neutral-50'}>
      <div className="mx-auto grid h-full max-w-[1400px] grid-rows-[auto_1fr] gap-8 px-6 pb-8 pt-10 md:px-10 lg:grid-cols-[minmax(280px,0.34fr)_minmax(0,0.66fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-20 lg:py-12">
        <header className="relative z-20 self-center lg:pl-12">
          <p className={light ? 'text-xs font-semibold uppercase tracking-[0.18em] text-green-800' : 'text-xs font-semibold uppercase tracking-[0.18em] text-avoqado-green'}>
            {scene.eyebrow}
          </p>
          <Heading className="mt-4 text-[clamp(2.25rem,4.3vw,5.5rem)] font-light leading-[0.96] tracking-[-0.055em]">
            {scene.title}
          </Heading>
          <p className={light ? 'mt-5 max-w-xl text-base leading-relaxed text-neutral-600' : 'mt-5 max-w-xl text-base leading-relaxed text-neutral-300'}>
            {scene.body}
          </p>
        </header>
        <div className="relative min-h-0 self-stretch lg:min-h-[560px]">{children}</div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Implement the five scenes**

Create each scene below. Use Lucide icons with `aria-hidden="true"`.

`HeroScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { pushEvent, trackGetStarted } from '../../../../lib/gtm';
import img1 from '../../../../assets/hero/hero-tile-01.jpg';
import img2 from '../../../../assets/hero/hero-tile-02.jpg';
import img4 from '../../../../assets/hero/hero-tile-04.jpg';
import img5 from '../../../../assets/hero/hero-tile-05.jpg';
import type { StoryScene } from '../story';
import SceneFrame from '../SceneFrame';

export default function HeroScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const scale = useTransform(progress, [0, 1], [1, 0.94]);
  const imageY = useTransform(progress, [0, 1], [24, -18]);
  const images = [img1.src, img2.src, img4.src, img5.src];

  return (
    <SceneFrame scene={scene} headingLevel={1}>
      <motion.div className="relative h-full overflow-hidden rounded-[2rem] bg-neutral-900" style={{ scale }}>
        <div className="grid h-full grid-cols-2 gap-2 p-2">
          {images.map((src, index) => (
            <motion.img key={src} src={src} alt="" aria-hidden="true" className="h-full min-h-0 w-full rounded-[1.4rem] object-cover opacity-75" style={{ y: index % 2 ? imageY : 0 }} />
          ))}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,oklch(0.13_0.005_155_/_0.15),oklch(0.13_0.005_155_/_0.62))]" />
        <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3 sm:flex-row">
          <a href="/wa?src=homepage_story_hero&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio" target="_blank" rel="noopener noreferrer" onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'homepage_story_hero' })} className="inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-50 px-6 text-sm font-semibold text-neutral-950 transition-transform duration-200 hover:scale-[1.02]">Agenda por WhatsApp</a>
          <a href="https://dashboard.avoqado.io/signup" onClick={event => trackGetStarted(event, 'homepage_story_hero')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-neutral-950/65 px-6 text-sm font-semibold text-white transition-colors hover:bg-neutral-900">Comienza gratis</a>
        </div>
      </motion.div>
    </SceneFrame>
  );
}
```

Create `ChannelsScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { CalendarDays, Link2, ShoppingBag, Smartphone, type LucideIcon } from 'lucide-react';
import type { StoryScene } from '../story';
import SceneFrame from '../SceneFrame';

function ChannelRow({ progress, start, icon: Icon, label, detail }: {
  progress: MotionValue<number>;
  start: number;
  icon: LucideIcon;
  label: string;
  detail: string;
}) {
  const opacity = useTransform(progress, [start, start + 0.2], [0, 1]);
  const x = useTransform(progress, [start, start + 0.2], [-28, 0]);
  return (
    <motion.li className="flex items-center gap-3 border-b border-black/6 py-4 last:border-0" style={{ opacity, x }}>
      <span className="grid size-10 place-items-center rounded-full bg-green-100 text-green-900"><Icon className="size-4" aria-hidden="true" /></span>
      <span><b className="block text-sm font-semibold">{label}</b><span className="text-xs text-neutral-500">{detail}</span></span>
    </motion.li>
  );
}

export default function ChannelsScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const centralScale = useTransform(progress, [0.35, 0.72], [0.82, 1]);
  const centralOpacity = useTransform(progress, [0.28, 0.52], [0, 1]);
  const channels = [
    { start: 0.08, icon: Smartphone, label: 'Consumer App', detail: 'Reserva o clase' },
    { start: 0.20, icon: CalendarDays, label: 'Booking Widget', detail: 'Cita y depósito' },
    { start: 0.32, icon: Link2, label: 'Ecommerce · Checkout · Liga / QR', detail: 'Compra o pago' },
    { start: 0.44, icon: ShoppingBag, label: 'Compra en sucursal', detail: 'Venta presencial' },
  ] as const;

  return (
    <SceneFrame scene={scene}>
      <div className="grid h-full items-center gap-5 lg:grid-cols-[1fr_auto]">
        <ul className="rounded-[1.75rem] border border-black/6 bg-white p-5 shadow-[0_24px_80px_rgb(20_35_25_/_0.10)]">
          {channels.map(channel => <ChannelRow key={channel.label} progress={progress} {...channel} />)}
        </ul>
        <motion.div className="mx-auto grid size-44 place-items-center rounded-full bg-neutral-950 p-6 text-center text-sm font-medium text-white shadow-[0_24px_70px_rgb(20_35_25_/_0.22)]" style={{ opacity: centralOpacity, scale: centralScale }}>
          Reserva · compra · depósito · venta
        </motion.div>
      </div>
    </SceneFrame>
  );
}
```

Create `ServiceScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { CalendarDays, CircleUserRound, MapPin, Package } from 'lucide-react';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import SceneFrame from '../SceneFrame';

export default function ServiceScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0.12, 0.52], [0, 1]);
  const y = useTransform(progress, [0.12, 0.52], [30, 0]);
  const apps = ['POS iOS', 'POS Android', 'POS Desktop', 'Windows Service'];
  return (
    <SceneFrame scene={scene}>
      <motion.div className="flex h-full flex-col justify-center gap-4" style={{ opacity, y }}>
        <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-white/8 px-5 py-4"><span className="text-xs uppercase tracking-[0.18em] text-neutral-500">Agenda · hoy</span><span className="size-2 rounded-full bg-avoqado-green" /></div>
          <div className="grid gap-4 p-5 sm:grid-cols-[110px_1fr]">
            <div className="rounded-2xl bg-white/5 p-4 text-center"><p className="text-3xl font-light text-white">11:30</p><p className="mt-1 text-xs text-neutral-500">Confirmada</p></div>
            <div className="space-y-3">
              <p className="text-lg font-medium text-white">{STORY_FIXTURE.service}</p>
              <div className="grid gap-2 text-xs text-neutral-300 sm:grid-cols-2">
                <span className="flex items-center gap-2"><CircleUserRound className="size-4 text-avoqado-green" aria-hidden="true" />{STORY_FIXTURE.customer}</span>
                <span className="flex items-center gap-2"><CalendarDays className="size-4 text-avoqado-green" aria-hidden="true" />{STORY_FIXTURE.staff}</span>
                <span className="flex items-center gap-2"><MapPin className="size-4 text-avoqado-green" aria-hidden="true" />{STORY_FIXTURE.venue}</span>
                <span className="flex items-center gap-2"><Package className="size-4 text-avoqado-green" aria-hidden="true" />{STORY_FIXTURE.product}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">{apps.map(app => <span key={app} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-300">{app}</span>)}</div>
      </motion.div>
    </SceneFrame>
  );
}
```

Create `PaymentScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Check, CreditCard, Link2, WalletCards, type LucideIcon } from 'lucide-react';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import SceneFrame from '../SceneFrame';

export default function PaymentScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const terminalY = useTransform(progress, [0.08, 0.48], [32, 0]);
  const terminalOpacity = useTransform(progress, [0.08, 0.38], [0, 1]);
  const routeScale = useTransform(progress, [0.45, 0.72], [0.96, 1]);
  const routes: Array<{ label: string; icon: LucideIcon }> = [
    { label: 'Tarjeta en TPV', icon: CreditCard },
    { label: 'Ecommerce', icon: WalletCards },
    { label: 'Liga de pago', icon: Link2 },
    { label: 'Efectivo', icon: WalletCards },
  ];
  return (
    <SceneFrame scene={scene}>
      <div className="grid h-full items-center gap-5 sm:grid-cols-[minmax(240px,0.8fr)_1fr]">
        <motion.div className="mx-auto w-full max-w-[320px] rounded-[2rem] border border-white/12 bg-neutral-900 p-4 shadow-2xl shadow-black/40" style={{ opacity: terminalOpacity, y: terminalY }}>
          <div className="rounded-[1.45rem] bg-neutral-50 p-4 text-neutral-950">
            <p className="text-center text-xs text-neutral-500">Total</p><p className="mt-1 text-center text-4xl font-light">{STORY_FIXTURE.total}</p>
            <p className="mb-2 mt-5 text-xs font-semibold">Cuenta de cobro</p>
            {[STORY_FIXTURE.selectedMerchant, STORY_FIXTURE.alternateMerchant].map((merchant, index) => (
              <div key={merchant} className={index === 0 ? 'mb-2 flex items-center justify-between rounded-xl bg-green-100 p-3 text-green-950' : 'mb-2 flex items-center justify-between rounded-xl border border-black/8 p-3 text-neutral-600'}>
                <span className="text-sm font-medium">{merchant}</span>{index === 0 ? <Check className="size-4" aria-hidden="true" /> : null}
              </div>
            ))}
            <p className="mt-4 text-center text-[11px] text-neutral-500">TPV compatible · selección manual</p>
          </div>
        </motion.div>
        <motion.div className="space-y-3" style={{ scale: routeScale }}>
          {routes.map(({ label, icon: Icon }) => (
            <div key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"><span className="grid size-9 place-items-center rounded-full bg-white/6 text-avoqado-green"><Icon className="size-4" aria-hidden="true" /></span><span className="text-sm text-white">{label}</span></div>
          ))}
          <p className="pt-2 text-xs leading-relaxed text-neutral-500">Defaults por organización · ajustes por sucursal o terminal</p>
        </motion.div>
      </div>
    </SceneFrame>
  );
}
```

Create `AftercareScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { FileCheck2, MailCheck, Star } from 'lucide-react';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import SceneFrame from '../SceneFrame';

const qrCells = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1];

export default function AftercareScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const receiptOpacity = useTransform(progress, [0.08, 0.36], [0, 1]);
  const outcomesOpacity = useTransform(progress, [0.32, 0.62], [0, 1]);
  return (
    <SceneFrame scene={scene}>
      <div className="grid h-full items-center gap-4 sm:grid-cols-[0.8fr_1.2fr]">
        <motion.div className="mx-auto w-full max-w-[280px] rounded-[2rem] border border-black/8 bg-white p-5 shadow-[0_24px_80px_rgb(20_35_25_/_0.14)]" style={{ opacity: receiptOpacity }}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-400">Recibo digital</p><p className="mt-6 text-4xl font-light">{STORY_FIXTURE.total}</p><p className="mt-2 text-sm text-neutral-500">{STORY_FIXTURE.service}</p><div className="my-5 border-t border-dashed border-black/15" /><p className="flex items-center gap-2 text-xs text-green-800"><MailCheck className="size-4" aria-hidden="true" />Enviado a {STORY_FIXTURE.customer}</p>
        </motion.div>
        <motion.div className="space-y-4" style={{ opacity: outcomesOpacity }}>
          <div className="rounded-[1.5rem] border border-black/6 bg-white p-5"><p className="text-xs text-neutral-500">¿Cómo fue tu experiencia?</p><div className="mt-3 flex gap-1">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="size-5 fill-amber-400 text-amber-400" aria-hidden="true" />)}</div><p className="mt-3 text-sm font-medium">Comparte tu reseña en Google</p></div>
          <div className="grid grid-cols-[auto_1fr] items-center gap-4 rounded-[1.5rem] bg-neutral-950 p-5 text-white"><div className="grid size-16 grid-cols-4 gap-1 rounded-lg bg-white p-2">{qrCells.map((filled, index) => <span key={index} className={filled ? 'bg-neutral-950' : 'bg-white'} />)}</div><div><div className="flex items-center gap-2"><FileCheck2 className="size-4 text-avoqado-green" aria-hidden="true" /><p className="text-sm font-medium">Factúrate desde tu recibo</p><span className="rounded-full bg-amber-300/12 px-2 py-1 text-[10px] text-amber-200">Premium</span></div><p className="mt-2 text-xs text-neutral-400">Tu cliente captura sus datos y recibe su CFDI.</p></div></div>
        </motion.div>
      </div>
    </SceneFrame>
  );
}
```

- [ ] **Step 5: Register scenes without changing the remaining four yet**

Replace `StoryStage.tsx` with:

```tsx
import type { MotionValue } from 'framer-motion';
import SceneFrame from './SceneFrame';
import StoryLayer from './StoryLayer';
import { STORY_SCENES, type StoryScene } from './story';
import AftercareScene from './scenes/AftercareScene';
import ChannelsScene from './scenes/ChannelsScene';
import HeroScene from './scenes/HeroScene';
import PaymentScene from './scenes/PaymentScene';
import ServiceScene from './scenes/ServiceScene';

function renderScene(scene: StoryScene, progress: MotionValue<number>) {
  switch (scene.id) {
    case 'entry': return <HeroScene scene={scene} progress={progress} />;
    case 'channels': return <ChannelsScene scene={scene} progress={progress} />;
    case 'service': return <ServiceScene scene={scene} progress={progress} />;
    case 'payment': return <PaymentScene scene={scene} progress={progress} />;
    case 'aftercare': return <AftercareScene scene={scene} progress={progress} />;
    default:
      return <SceneFrame scene={scene}><div className="h-full" /></SceneFrame>;
  }
}

export default function StoryStage({ progress, activeIndex }: { progress: MotionValue<number>; activeIndex: number }) {
  return (
    <div className="relative h-full w-full">
      {STORY_SCENES.map((scene, index) => (
        <StoryLayer key={scene.id} scene={scene} index={index} total={STORY_SCENES.length} progress={progress} active={index === activeIndex}>
          {localProgress => renderScene(scene, localProgress)}
        </StoryLayer>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Run GREEN, build, and inspect screenshots**

Run the truth-boundary test and desktop smoke test. Start the dev server and capture `/tmp/home-entry.png`, `/tmp/home-payment.png`, and `/tmp/home-aftercare.png` at their scene scroll positions with Playwright. Inspect them at 1440×900 and 390×844.

Expected: all labels are visible; no bank-routing implication; image media loaded under 1 MiB; no horizontal overflow.

- [ ] **Step 7: Commit the first half**

```bash
git add src/components/interactive/home-story tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): visualize customer journey and payment"
```

---

### Task 5: Visualize the Operational and Financial Cascade

**Files:**

- Create: `src/components/interactive/home-story/scenes/OperationsScene.tsx`
- Create: `src/components/interactive/home-story/scenes/FinanceScene.tsx`
- Modify: `src/components/interactive/home-story/StoryStage.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**

- Operations uses only values from `STORY_FIXTURE`.
- Finance displays `Pago → Costo → Liquidación esperada → Conciliación → Póliza` and never `Liquidación garantizada`.

- [ ] **Step 1: Write the failing cascade test**

Append:

```ts
test('mantiene una venta coherente desde operación hasta contabilidad', async ({ page }, testInfo) => {
  test.skip(['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const story = page.locator('main[data-scrollytelling]');

  await expect(story).toContainText('$348.10');
  await expect(story).toContainText('Crema facial 50 ml −1');
  await expect(story).toContainText('María G. +29 puntos');
  await expect(story).toContainText('Ana Torres +$29.50');
  await expect(story).toContainText('Reorden sugerido');
  await expect(story).toContainText('Liquidación esperada');
  await expect(story).toContainText('Conciliación');
  await expect(story).toContainText('Póliza');
  await expect(story).not.toContainText('Liquidación garantizada');
});
```

- [ ] **Step 2: Run RED**

Expected: FAIL on missing operational detail labels.

- [ ] **Step 3: Implement OperationsScene**

Create `OperationsScene.tsx` with an `OperationRow` child:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { BadgeDollarSign, Box, ChartNoAxesCombined, RotateCw, Star, type LucideIcon } from 'lucide-react';
import type { StoryScene } from '../story';
import { STORY_FIXTURE } from '../story-fixture';
import SceneFrame from '../SceneFrame';

function OperationRow({ progress, start, icon: Icon, title, detail, premium = false }: {
  progress: MotionValue<number>;
  start: number;
  icon: LucideIcon;
  title: string;
  detail: string;
  premium?: boolean;
}) {
  const opacity = useTransform(progress, [start, start + 0.18], [0, 1]);
  const x = useTransform(progress, [start, start + 0.18], [24, 0]);
  return (
    <motion.li className="grid grid-cols-[auto_1fr_auto] items-center gap-3 border-b border-white/8 py-4" style={{ opacity, x }}>
      <span className="grid size-9 place-items-center rounded-full bg-white/6 text-avoqado-green"><Icon className="size-4" aria-hidden="true" /></span>
      <span><b className="block text-sm font-medium text-white">{title}</b><span className="text-xs text-neutral-400">{detail}</span></span>
      {premium ? <span className="rounded-full bg-amber-300/12 px-2 py-1 text-[10px] font-semibold text-amber-200">Premium</span> : null}
    </motion.li>
  );
}

export default function OperationsScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const rows = [
    { start: 0.08, icon: ChartNoAxesCombined, title: 'Venta registrada', detail: `${STORY_FIXTURE.total} · ${STORY_FIXTURE.staff}` },
    { start: 0.22, icon: Box, title: 'Inventario', detail: `${STORY_FIXTURE.product} −1`, premium: true },
    { start: 0.36, icon: RotateCw, title: 'Reorden sugerido', detail: `Stock ${STORY_FIXTURE.stockBefore} → ${STORY_FIXTURE.stockAfter}` },
    { start: 0.50, icon: Star, title: 'CRM y lealtad', detail: `${STORY_FIXTURE.customer} +${STORY_FIXTURE.points} puntos` },
    { start: 0.64, icon: BadgeDollarSign, title: 'Equipo', detail: `${STORY_FIXTURE.staff} +${STORY_FIXTURE.commission}` },
  ] as const;

  return (
    <SceneFrame scene={scene}>
      <div className="flex h-full items-center justify-center">
        <div className="w-full max-w-2xl overflow-hidden rounded-[1.75rem] border border-white/10 bg-neutral-900 p-6 shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-white/10 pb-4"><div><p className="text-xs text-neutral-500">Actividad de esta venta</p><p className="mt-1 text-lg font-medium text-white">{STORY_FIXTURE.total} · ahora</p></div><span className="size-2 rounded-full bg-avoqado-green" /></div>
          <ul>{rows.map(row => <OperationRow key={row.title} progress={progress} {...row} />)}</ul>
        </div>
      </div>
    </SceneFrame>
  );
}
```

- [ ] **Step 4: Implement FinanceScene**

Create `FinanceScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import type { StoryScene } from '../story';
import SceneFrame from '../SceneFrame';

interface Stage {
  title: string;
  value: string;
  detail: string;
  start: number;
  premium?: boolean;
}

function FinanceStage({ stage, progress, index }: { stage: Stage; progress: MotionValue<number>; index: number }) {
  const opacity = useTransform(progress, [stage.start, stage.start + 0.2], [0, 1]);
  const y = useTransform(progress, [stage.start, stage.start + 0.2], [20, 0]);
  return (
    <motion.li className="relative flex-1 border-l border-black/10 py-3 pl-5 first:border-l-0 first:pl-0 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-6" style={{ opacity, y }}>
      <span className="absolute -left-[5px] top-5 size-2 rounded-full bg-neutral-400 first:hidden lg:-top-[5px] lg:left-0 lg:block" aria-hidden="true" />
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-neutral-500">0{index + 1} · {stage.title}</p>
      <p className="mt-2 text-lg font-medium text-neutral-950">{stage.value}</p>
      <p className="mt-1 text-xs leading-relaxed text-neutral-500">{stage.detail}</p>
      {stage.premium ? <span className="mt-3 inline-flex rounded-full bg-amber-100 px-2 py-1 text-[10px] font-semibold text-amber-900">CFDI · Premium</span> : null}
    </motion.li>
  );
}

export default function FinanceScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const stages: Stage[] = [
    { title: 'Pago', value: '$348.10', detail: 'merchant: Operación diaria', start: 0.05 },
    { title: 'Costo', value: 'Calculado', detail: 'procesador y comisión', start: 0.18 },
    { title: 'Liquidación esperada', value: 'En seguimiento', detail: 'fecha y monto neto', start: 0.31 },
    { title: 'Conciliación', value: 'Referencia ligada', detail: 'saldo y movimientos', start: 0.44 },
    { title: 'Póliza', value: 'Lista para libros', detail: 'IVA · ISR · contabilidad', start: 0.57, premium: true },
  ];
  return (
    <SceneFrame scene={scene}>
      <div className="flex h-full items-center">
        <div className="w-full rounded-[1.75rem] border border-black/6 bg-white p-6 shadow-[0_24px_80px_rgb(20_35_25_/_0.10)] sm:p-8">
          <div className="flex items-center justify-between border-b border-black/6 pb-5"><div><p className="text-xs text-neutral-500">Ruta financiera del pago</p><p className="mt-1 text-xl font-medium">Referencia AVQ-34810</p></div><span className="rounded-full bg-neutral-100 px-3 py-1 text-[10px] font-medium text-neutral-600">Trazable</span></div>
          <ol className="mt-5 flex flex-col lg:flex-row lg:gap-4">{stages.map((stage, index) => <FinanceStage key={stage.title} stage={stage} progress={progress} index={index} />)}</ol>
        </div>
      </div>
    </SceneFrame>
  );
}
```

The neutral dots are intentional: do not replace them with green checks that could imply confirmed or guaranteed settlement.

- [ ] **Step 5: Register both scenes and run GREEN**

Add these imports to `StoryStage.tsx`:

```tsx
import FinanceScene from './scenes/FinanceScene';
import OperationsScene from './scenes/OperationsScene';
```

Add these cases before `default` and remove the now-unused `SceneFrame` import:

```tsx
case 'operations': return <OperationsScene scene={scene} progress={progress} />;
case 'finance': return <FinanceScene scene={scene} progress={progress} />;
```

Run the named test, all desktop tests, and `npm run build`.

- [ ] **Step 6: Commit**

```bash
git add src/components/interactive/home-story tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): show operational and financial cascade"
```

---

### Task 6: Add Multi-Branch Zoom-Out and AI Close

**Files:**

- Create: `src/components/interactive/home-story/scenes/MultibranchScene.tsx`
- Create: `src/components/interactive/home-story/scenes/AiScene.tsx`
- Modify: `src/components/interactive/home-story/StoryStage.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**

- Multi-branch renders `Organización → Zonas → Sucursales`, dashboard switcher, and consolidated KPIs.
- AI final CTA routes WhatsApp through `/wa?src=homepage_story_final` and signup through `trackGetStarted(..., 'homepage_story_final')`.

- [ ] **Step 1: Write the failing owner-outcome test**

Append:

```ts
test('cierra con control multi-sucursal y una pregunta accionable', async ({ page }, testInfo) => {
  test.skip(['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const story = page.locator('main[data-scrollytelling]');

  await expect(story).toContainText('Organización');
  await expect(story).toContainText('Zonas');
  await expect(story).toContainText('Sucursal Centro');
  await expect(story).toContainText('Sucursal Norte');
  await expect(story).toContainText('Cambia de sucursal sin cerrar sesión');
  await expect(story).toContainText('¿Qué sucursal bajó su ticket');
  await expect(story.getByRole('link', { name: 'Quiero verlo en mi negocio' })).toHaveAttribute(
    'href',
    /\/wa\?src=homepage_story_final/,
  );
});
```

- [ ] **Step 2: Run RED**

Expected: FAIL on hierarchy, AI question, and final CTA.

- [ ] **Step 3: Implement MultibranchScene**

Create `MultibranchScene.tsx`:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { Building2, ChevronDown, MapPin, Store } from 'lucide-react';
import type { StoryScene } from '../story';
import SceneFrame from '../SceneFrame';

function BranchNode({ progress, start, name, revenue }: { progress: MotionValue<number>; start: number; name: string; revenue: string }) {
  const opacity = useTransform(progress, [start, start + 0.16], [0, 1]);
  const scale = useTransform(progress, [start, start + 0.16], [0.9, 1]);
  return <motion.div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-3 py-2" style={{ opacity, scale }}><span className="flex items-center gap-2 text-xs text-white"><Store className="size-3.5 text-avoqado-green" aria-hidden="true" />{name}</span><span className="text-[11px] text-neutral-500">{revenue}</span></motion.div>;
}

export default function MultibranchScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const hierarchyOpacity = useTransform(progress, [0, 0.46, 0.58], [1, 1, 0]);
  const hierarchyScale = useTransform(progress, [0, 0.46, 0.58], [1, 0.94, 0.88]);
  const dashboardOpacity = useTransform(progress, [0.50, 0.64], [0, 1]);
  const centerOpacity = useTransform(progress, [0.66, 0.76], [1, 0]);
  const northOpacity = useTransform(progress, [0.70, 0.80], [0, 1]);
  const kpis = [['Ingresos', '$60,050'], ['Ventas', '312'], ['Ticket', '$192'], ['Pagos', '298']] as const;
  return (
    <SceneFrame scene={scene}>
      <div className="relative h-full min-h-[500px]">
        <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: hierarchyOpacity, scale: hierarchyScale }}>
          <div className="w-full max-w-2xl rounded-[1.75rem] border border-white/10 bg-neutral-900 p-5 shadow-2xl shadow-black/40">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">Organización → Zonas → Sucursales</p>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-avoqado-green p-4 text-neutral-950"><Building2 className="size-5" aria-hidden="true" /><div><p className="text-xs opacity-60">Organización</p><p className="font-semibold">Estudio Lumina</p></div></div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 p-3"><p className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-300"><MapPin className="size-3.5" aria-hidden="true" />Zona Centro</p><div className="space-y-2"><BranchNode progress={progress} start={0.10} name="Sucursal Centro" revenue="$24,850" /><BranchNode progress={progress} start={0.20} name="Sucursal Roma" revenue="$18,420" /></div></div>
              <div className="rounded-2xl border border-white/8 p-3"><p className="mb-3 flex items-center gap-2 text-xs font-medium text-neutral-300"><MapPin className="size-3.5" aria-hidden="true" />Zona Norte</p><BranchNode progress={progress} start={0.30} name="Sucursal Norte" revenue="$16,780" /></div>
            </div>
          </div>
        </motion.div>
        <motion.div className="absolute inset-0 flex items-center justify-center" style={{ opacity: dashboardOpacity }}>
          <div className="w-full max-w-3xl rounded-[1.75rem] border border-white/10 bg-neutral-900 p-5 shadow-2xl shadow-black/40">
            <div className="flex items-center justify-between border-b border-white/8 pb-4"><div><p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">Dashboard web consolidado</p><p className="mt-1 text-base font-medium text-white">Estudio Lumina</p></div><div className="relative min-w-40 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-white"><motion.span style={{ opacity: centerOpacity }}>Sucursal Centro</motion.span><motion.span className="absolute left-4" style={{ opacity: northOpacity }}>Sucursal Norte</motion.span><ChevronDown className="ml-auto inline size-3" aria-hidden="true" /></div></div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{kpis.map(([label, value]) => <div key={label} className="rounded-2xl bg-white/5 p-3"><p className="text-[10px] text-neutral-500">{label}</p><p className="mt-1 text-lg font-medium text-white">{value}</p></div>)}</div>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">{['1 · Centro', '2 · Roma', '3 · Norte'].map(branch => <div key={branch} className="rounded-xl border border-white/8 px-3 py-3 text-xs text-neutral-300">{branch}</div>)}</div>
            <div className="mt-5 flex flex-col justify-between gap-2 border-t border-white/8 pt-4 text-[11px] text-neutral-500 sm:flex-row"><span>Cambia de sucursal sin cerrar sesión · Sin cerrar sesión</span><span>Roles, permisos y defaults por organización · ajustes por sucursal</span></div>
          </div>
        </motion.div>
      </div>
    </SceneFrame>
  );
}
```

- [ ] **Step 4: Implement AiScene**

Create `AiScene.tsx` with scroll-driven message blocks:

```tsx
import { motion, useTransform, type MotionValue } from 'framer-motion';
import { pushEvent, trackGetStarted } from '../../../../lib/gtm';
import type { StoryScene } from '../story';
import SceneFrame from '../SceneFrame';

export default function AiScene({ scene, progress }: { scene: StoryScene; progress: MotionValue<number> }) {
  const questionOpacity = useTransform(progress, [0.14, 0.34], [0, 1]);
  const answerOpacity = useTransform(progress, [0.38, 0.64], [0, 1]);
  const ctaOpacity = useTransform(progress, [0.68, 0.88], [0, 1]);

  return (
    <SceneFrame scene={scene}>
      <div className="flex h-full flex-col justify-center gap-5">
        <div className="rounded-[1.75rem] border border-white/10 bg-neutral-900 p-5 sm:p-7">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-neutral-500">Avoqado MCP · Claude / ChatGPT</p>
          <motion.div className="ml-auto mt-5 max-w-[85%] rounded-2xl rounded-br-md bg-neutral-50 px-4 py-3 text-sm text-neutral-950" style={{ opacity: questionOpacity }}>
            ¿Qué sucursal bajó su ticket y qué debo reordenar?
          </motion.div>
          <motion.div className="mt-4 max-w-[92%] rounded-2xl rounded-bl-md bg-white/6 px-4 py-3 text-sm leading-relaxed text-neutral-200" style={{ opacity: answerOpacity }}>
            Sucursal Norte bajó 8% esta semana. Crema facial está en 7 piezas y llegará a stock crítico en 5 días. La venta y el reorden ya aparecen en tu operación.
          </motion.div>
        </div>
        <motion.div className="rounded-[1.75rem] bg-avoqado-green p-5 text-neutral-950 sm:p-7" style={{ opacity: ctaOpacity }}>
          <p className="text-xl font-medium sm:text-2xl">Así se ve cuando todo tu negocio habla el mismo idioma.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <a href="/wa?src=homepage_story_final&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio" target="_blank" rel="noopener noreferrer" onClick={() => pushEvent('demo_request', { demo_type: 'whatsapp', location: 'homepage_story_final' })} className="inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white transition-transform hover:scale-[1.02]">Quiero verlo en mi negocio</a>
            <a href="https://dashboard.avoqado.io/signup" onClick={event => trackGetStarted(event, 'homepage_story_final')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-950/20 px-6 text-sm font-semibold text-neutral-950 transition-colors hover:bg-neutral-950/8">Comienza gratis</a>
          </div>
        </motion.div>
      </div>
    </SceneFrame>
  );
}
```

- [ ] **Step 5: Register scenes and run GREEN**

Add these imports to `StoryStage.tsx`:

```tsx
import AiScene from './scenes/AiScene';
import MultibranchScene from './scenes/MultibranchScene';
```

Add these cases before `default`:

```tsx
case 'multibranch': return <MultibranchScene scene={scene} progress={progress} />;
case 'ai': return <AiScene scene={scene} progress={progress} />;
```

Replace the temporary semantic fallback with an explicit error so an unregistered future scene cannot silently render blank:

```tsx
default: throw new Error(`Unregistered homepage story scene: ${scene.id}`);
```

Run the named test, then all desktop tests and build.

- [ ] **Step 6: Commit**

```bash
git add src/components/interactive/home-story tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): add multi-branch and AI finale"
```

---

### Task 7: Harden Responsive, Reduced Motion, No-JS, and Header Geometry

**Files:**

- Modify: `src/styles/global.css`
- Modify: `src/components/interactive/NavigationMenu.tsx`
- Modify: `src/components/interactive/home-story/HomepageStory.tsx`
- Modify: `src/components/interactive/home-story/ReducedMotionStory.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`

**Interfaces:**

- CSS variables: `--site-banner-height`, `--site-nav-height`, `--site-header-height`.
- Reduced project exposes `data-story-mode="static"` and no sticky-positioned descendant.
- No-JS project exposes the full scene order from `data-story-mode="noscript"`.

- [ ] **Step 1: Write failing resilience tests**

Append:

```ts
test('reduced motion usa flujo normal sin sticky prolongado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-reduced');
  await page.goto('/');
  await expect(page.locator('[data-story-mode="static"]')).toBeVisible();
  await expect(page.locator('[data-story-mode="animated"]')).toHaveCount(0);
  const stickyCount = await page.locator('[data-story-mode="static"] *').evaluateAll(nodes =>
    nodes.filter(node => getComputedStyle(node).position === 'sticky').length,
  );
  expect(stickyCount).toBe(0);
});

test('sin JavaScript conserva toda la narrativa', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-nojs');
  await page.goto('/');
  const scenes = page.locator('[data-story-mode="noscript"] [data-story-scene]');
  await expect(scenes).toHaveCount(sceneOrder.length);
  await expect(page.getByText('Quiero verlo en mi negocio')).toBeVisible();
});

test('móvil no tiene overflow horizontal ni CTA tapado', async ({ page }, testInfo) => {
  test.skip(!['chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await page.locator('[data-story-mode="animated"]').evaluate(element => {
    window.scrollTo({ top: element.scrollHeight - window.innerHeight, behavior: 'auto' });
  });
  await expect(page.getByRole('link', { name: 'Quiero verlo en mi negocio' })).toBeVisible();
});
```

- [ ] **Step 2: Run each project and verify RED**

Expected failures: no-JS noscript data is not reliably exposed yet; header variables do not exist; mobile may overlap the 36 px banner + nav.

- [ ] **Step 3: Add shared geometry and pre-hydration guard**

Add to `:root` in `global.css`:

```css
:root {
  --site-banner-height: 36px;
  --site-nav-height: 60px;
  --site-header-height: calc(var(--site-banner-height) + var(--site-nav-height));
  --ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);
}

@media (max-width: 1023px) {
  :root {
    --site-nav-height: 52px;
  }
}

@media (prefers-reduced-motion: reduce) {
  [data-story-mode='animated'] {
    display: none;
  }
}
```

Replace `top-[36px]` on the `<nav>` in `NavigationMenu.tsx` with `top-[var(--site-banner-height)]`. Replace `top-[88px]` on `MobileDrawer` with `top-[var(--site-header-height)]`.

- [ ] **Step 4: Make noscript and reduced-motion markup deterministic**

Because React `<noscript>` hydration can differ by scripting mode, move the no-JS fallback to `index.astro` as plain Astro markup. Import the pure data array in frontmatter:

```astro
import { STORY_SCENES } from '../components/interactive/home-story/story';
```

Add this immediately after `<HomepageStory client:load />` inside `<main>`:

```astro
<noscript>
  <style>[data-story-mode='animated'] { display: none !important; }</style>
  <div data-story-mode="noscript" class="bg-neutral-950 text-neutral-50">
    {STORY_SCENES.map((scene, index) => (
      <section data-story-scene={scene.id} class={scene.theme === 'light' ? 'bg-neutral-50 text-neutral-950' : 'bg-neutral-950 text-neutral-50'}>
        <div class="mx-auto flex min-h-[70dvh] max-w-6xl flex-col justify-center px-6 py-24 md:px-10">
          <p class="text-sm font-medium text-avoqado-green">{scene.eyebrow}</p>
          {index === 0 ? (
            <h1 class="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">{scene.title}</h1>
          ) : (
            <h2 class="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">{scene.title}</h2>
          )}
          <p class="mt-6 max-w-2xl text-lg opacity-70">{scene.body}</p>
        </div>
      </section>
    ))}
    <div class="bg-avoqado-green px-6 py-16 text-center text-neutral-950">
      <p class="text-2xl font-medium">Así se ve cuando todo tu negocio habla el mismo idioma.</p>
      <div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <a class="inline-flex min-h-11 items-center justify-center rounded-full bg-neutral-950 px-6 text-sm font-semibold text-white" href="/wa?src=homepage_story_final&text=Hola%2C%20quiero%20ver%20Avoqado%20en%20mi%20negocio">Quiero verlo en mi negocio</a>
        <a class="inline-flex min-h-11 items-center justify-center rounded-full border border-neutral-950/20 px-6 text-sm font-semibold" href="https://dashboard.avoqado.io/signup">Comienza gratis</a>
      </div>
    </div>
  </div>
</noscript>
```

Keep React `HomepageStory` responsible only for animated vs reduced-motion rendering.

Replace `HomepageStory.tsx` with:

```tsx
import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import AnimatedStory from './AnimatedStory';
import ReducedMotionStory from './ReducedMotionStory';

export default function HomepageStory() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && reduceMotion) return <ReducedMotionStory />;
  return <AnimatedStory />;
}
```

The Astro noscript fallback must include the final WhatsApp and signup links. Do not introduce a second visible H1 when JavaScript is enabled; content inside `<noscript>` is ignored in scripting mode.

- [ ] **Step 5: Adapt scene density for mobile**

For `<768px`:

- `SceneFrame` uses copy above visual and caps copy to 42% of available story viewport.
- Operations shows four visible cascade rows and a fifth summary `+ compras, transferencias y más`.
- Multibranch renders three branch nodes maximum.
- `StoryPulse` stays hidden; `StoryProgress` mobile line is the progress signature.
- All CTA anchors remain ≥44 px tall and use `pb-[max(1.5rem,env(safe-area-inset-bottom))]` on the final scene.

- [ ] **Step 6: Run GREEN across resilience projects**

```bash
npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --project=chromium-mobile \
  --project=chromium-small \
  --project=chromium-reduced \
  --project=chromium-nojs \
  --workers=1
npm run build
```

Expected: all pass, no overflow, no sticky in reduced mode, full no-JS copy.

- [ ] **Step 7: Commit**

```bash
git add src/styles/global.css src/components/interactive/NavigationMenu.tsx src/pages/index.astro src/components/interactive/home-story tests/e2e/home-scrollytelling.spec.ts
git commit -m "fix(homepage): harden story accessibility and responsive flow"
```

---

### Task 8: Final QA, Performance Pass, and Documentation

**Files:**

- Modify: `docs/scrollytelling-guide.md`
- Modify: story files only if a failing test or visual inspection identifies a concrete issue.

**Interfaces:**

- Produces: verified `/` at 1440×900, 390×844, 320×568, reduced motion, and no-JS.
- Preserves: `/demo`, Navbar, Footer, FloatingChatbot, WhatsApp bridge, signup tracking.

- [ ] **Step 1: Add console and full-scroll regression coverage**

Append:

```ts
test('scroll completo no produce errores de consola ni hidratación', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile'].includes(testInfo.project.name));
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  await page.goto('/');
  const root = page.locator('[data-story-mode="animated"]');
  const height = await root.evaluate(element => element.scrollHeight);
  for (let offset = 0; offset <= height; offset += Math.max(300, Math.floor(height / 24))) {
    await page.evaluate(value => window.scrollTo({ top: value, behavior: 'auto' }), offset);
  }
  await page.waitForTimeout(250);
  expect(errors).toEqual([]);
});
```

- [ ] **Step 2: Run the complete suite three times**

```bash
npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --project=chromium-desktop \
  --project=chromium-mobile \
  --project=chromium-small \
  --project=chromium-reduced \
  --project=chromium-nojs \
  --repeat-each=3 \
  --workers=1
```

Expected: all repetitions pass with no flaky active-scene threshold.

- [ ] **Step 3: Build and inspect bundle/media output**

```bash
npm run build
du -sh dist
find dist -type f \( -name '*.js' -o -name '*.css' -o -name '*.jpg' -o -name '*.webp' \) -print0 | xargs -0 ls -lhS | head -n 30
```

Expected: build `0`; no `video4.webm` request on `/`; critical hero images total under 1 MiB. If the initial story chunk exceeds 120 KiB gzip, move scene registries for scenes 4–8 behind React lazy imports only if SSR output remains intact; otherwise reduce icon/component duplication first.

- [ ] **Step 4: Browser visual review**

Capture and inspect screenshots at progress `0.04`, `0.34`, `0.58`, `0.80`, and `0.94` for desktop and mobile. Verify:

- one dominant visual per scene;
- copy never overlaps the founders banner/navbar;
- `Cuenta de cobro` is readable and no bank is shown as the routing target;
- cascade order is legible without reading every secondary label;
- multi-branch zoom-out is the strongest late-page reveal;
- final CTA is visible without additional dead scroll;
- reverse scrolling restores earlier scenes cleanly;
- no pure-black/pure-white surfaces beyond existing brand assets; tinted neutrals dominate;
- no generic repeated card grid or decorative icon-above-heading layout.

- [ ] **Step 5: Update the internal guide**

Replace the stale `Landing Page Scroll Sequence` in `docs/scrollytelling-guide.md` with:

```text
HomepageStory (900vh mobile / 1000vh desktop)
├── entry
├── channels
├── service
├── payment
├── aftercare
├── operations
├── finance
├── multibranch
└── ai + conversion CTA

Footer
FloatingChatbot
```

Document `--site-header-height`, `useReducedMotion → ReducedMotionStory`, and the rule that `/demo` mockups may inform visual design but its engine/CSS are not mounted by `/`.

- [ ] **Step 6: Inspect the final diff and unrelated changes**

```bash
git status --short
git diff --check
git diff --stat HEAD~7..HEAD
git diff HEAD~7..HEAD -- src/pages/demo.astro src/components/interactive/tour
```

Expected: `.gitignore` remains modified but unstaged/uncommitted; the `/demo` diff is empty.

- [ ] **Step 7: Commit documentation/polish**

```bash
git add docs/scrollytelling-guide.md src/components/interactive/home-story src/pages/index.astro src/styles/global.css src/components/interactive/NavigationMenu.tsx tests/e2e/home-scrollytelling.spec.ts
git commit -m "docs(homepage): document continuous story architecture"
```

## Self-Review Checklist

- Spec coverage: every approved scene maps to Tasks 2, 4, 5, or 6.
- Frontend coverage: Consumer App, Widget, Checkout/links, iOS, Android, Desktop, TPV, Windows Service, Dashboard, and MCP appear by purpose.
- Claim boundaries: merchant, banking, fiscal, settlement, and web-only multi-branch limitations are covered by assertions.
- Accessibility: semantic SSR, reduced motion, no-JS, focusable CTAs, mobile safe area, and no sticky reduced mode are covered.
- Performance: current 5 MiB autoplay video is removed; explicit JS/media/viewports budgets are checked.
- Regression: `/demo` and tour directories are protected by test and final diff check.
- Placeholder scan: implementation steps require visible copy and complete surfaces; no production `TODO`/`TBD` is permitted.
- Type consistency: every scene consumes `StoryScene` + `MotionValue<number>`; `StoryLayer` supplies normalized progress.
