# Homepage Persistent Narrative Hierarchy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved persistent-anchor narrative to the operation-entry handoff and all seven post-opening scenes so visitors read one idea, watch the interface prove it, and retain a visible result.

**Architecture:** Centralize copy, story references, ranges, and step thresholds in typed data; render them through one `NarrativeAnchor` driven exclusively by each scene's `MotionValue`. Keep product mockups responsible for their own scroll-scrubbed steps, while `SceneFrame` owns shared hierarchy and visual emphasis. Preserve the existing video/mosaic opening, measured connectors, product claims, reduced/no-JS paths, illustrated chatbot endcap, and `/demo` isolation.

**Tech Stack:** Astro 5, React 18, TypeScript, Framer Motion 12.23.26, Tailwind CSS 4, Playwright 1.60.

## Global Constraints

- Apply `idea → thread → demonstration → result` to `ChannelHandoff` plus `service`, `payment`, `aftercare`, `operations`, `finance`, `multibranch`, and `ai`.
- Preserve the approved hero copy, video, 17-tile mosaic, five public inputs, three animated opening results, one measured opening connector, and the illustrated `FAQ` endcap.
- Use one H1 in the hero; all explanatory chapter headings remain H2.
- Animate only `transform`, `opacity`, `pathLength`, and color. Do not animate font size, width, height, spacing, or line breaks.
- Derive every narrative state from scroll. Do not introduce timers, autoplay, or duration-based story transitions.
- Keep Payment and Aftercare free of routes and `data-story-primary-pulse`; their green thread marker is a static 7px dot.
- Preserve manual `Cuenta de cobro` selection only for configured compatible TPVs, conditional receipt invoicing, expected—not guaranteed—settlement, Premium labels, and MCP's read-context limits.
- Use `900vh` for the post-opening story on mobile and `1000vh` on desktop; keep the opening and `FAQ` heights unchanged.
- Animated, reduced-motion, and no-JavaScript modes must expose the same causal copy and result.
- No new dependency and no changes to `/demo`, Navbar, Footer, FloatingChatbot, backend, POS, TPV, Dashboard, or MCP.
- Required viewport matrix: `1440×900`, `1024×768`, `910×691`, `887×502`, `787×701`, `390×844`, and `320×568`.

---

## File Structure

### Create

- `src/components/interactive/home-story/story-motion.ts` — shared narrative phase constants, smoothstep easing, and deterministic step windows.
- `src/components/interactive/home-story/NarrativeAnchor.tsx` — persistent semantic heading, eyebrow/thread crossfade, result, and result-gated actions.
- `src/components/interactive/home-story/StoryStaticEvidence.tsx` — final-state evidence for reduced-motion/no-JS scenes.
- `tests/e2e/helpers/home-story-scroll.ts` — shared range-aware scrolling helpers and frame settling.
- `tests/e2e/home-narrative-hierarchy.spec.ts` — cross-scene contract, reverse-scroll, plateau, responsive, and continuity tests.

### Modify

- `src/components/interactive/home-story/story.ts` — `NarrativeBeat`, exact copy, threads, results, step thresholds, and approved ranges.
- `src/components/interactive/home-story/story-fixture.ts` — payment reference and branch-ticket evidence.
- `src/components/interactive/home-story/SceneFrame.tsx` — compose `NarrativeAnchor` and shared visual emphasis.
- `src/components/interactive/home-story/StoryLayer.tsx` — local relative crossfades.
- `src/components/interactive/home-story/AnimatedStory.tsx` — approved story heights.
- `src/components/interactive/home-story/StoryProgress.tsx` — restore the `service` milestone.
- `src/components/interactive/home-story/ReducedMotionStory.tsx` — body, thread, result, final evidence, and IA actions.
- `src/components/interactive/home-story/CascadeTimeline.tsx` — threshold-driven five-node route.
- `src/components/interactive/home-story/home-story.css` — stable 41/59 and 38/62 narrative layouts.
- `src/components/interactive/home-opening/opening-channel-results.ts` — opening narrative data and deterministic three-result resolver.
- `src/components/interactive/home-opening/ChannelHandoff.tsx` — shared narrative anchor and scrubbed result changes.
- `src/components/interactive/home-opening/ReducedMotionOpening.tsx` — static opening result.
- All seven files under `src/components/interactive/home-story/scenes/` — pass local progress, add stable step hooks, and remap product steps.
- `tests/e2e/home-opening.spec.ts` — new opening checkpoints and shared anchor assertions.
- `tests/e2e/home-scrollytelling.spec.ts` — replace stale hardcoded ranges/copy while retaining all existing regressions.

---

### Task 1: Establish the typed narrative truth and static rendering

**Files:**
- Create: `tests/e2e/helpers/home-story-scroll.ts`
- Create: `tests/e2e/home-narrative-hierarchy.spec.ts`
- Modify: `src/components/interactive/home-story/story.ts`
- Modify: `src/components/interactive/home-story/story-fixture.ts`
- Modify: `src/components/interactive/home-story/ReducedMotionStory.tsx`

**Interfaces:**
- Produces: `NarrativeBeat`, enriched `StoryScene`, `STORY_SCENES`, `STORY_FIXTURE.paymentReference`, ticket fields, `settleFrames`, `scrollStoryGlobalTo`, and `scrollStorySceneTo`.
- Consumes: existing `StorySceneId`, Playwright projects, and `ReducedMotionStory` rendering modes.

- [ ] **Step 1: Write the shared scroll helper and failing static-truth test**

Create `tests/e2e/helpers/home-story-scroll.ts`:

```ts
import type { Page } from 'playwright/test';
import { STORY_SCENES, type StorySceneId } from '../../../src/components/interactive/home-story/story';

export async function settleFrames(page: Page) {
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));
}

export async function scrollStorySceneTo(
  page: Page,
  sceneId: StorySceneId,
  localProgress: number,
) {
  const scene = STORY_SCENES.find(item => item.id === sceneId);
  if (!scene) throw new Error(`Unknown story scene: ${sceneId}`);
  const globalProgress = scene.range[0]
    + localProgress * (scene.range[1] - scene.range[0]);
  await scrollStoryGlobalTo(page, globalProgress);
}

export async function scrollStoryGlobalTo(page: Page, globalProgress: number) {
  const root = page.locator('[data-story-mode="animated"]');
  await root.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await settleFrames(page);
}

export async function scrollOpeningNarrativeTo(page: Page, localProgress: number) {
  const opening = page.locator('[data-opening-mode="animated"]');
  const globalProgress = 0.60 + localProgress * (0.98 - 0.60);
  await opening.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await settleFrames(page);
}
```

Create the first test in `tests/e2e/home-narrative-hierarchy.spec.ts`:

```ts
import { expect, test } from 'playwright/test';

const staticTruth = [
  ['service', 'La reservación llega con todo el contexto.', 'María, su servicio, la colaboradora, la sucursal y el producto llegan juntos.', 'María G. · 11:30 · Facial hidratante', 'Tu equipo sabe a quién atender y qué preparar.'],
  ['payment', 'El pago conserva de dónde vino.', 'TPV, tienda en línea, liga o efectivo quedan ligados a la misma visita. En TPV compatibles, el operador elige manualmente una Cuenta de cobro habilitada.', 'Misma visita · María G. · $348.10', 'Siempre sabes cómo entró el dinero.'],
  ['aftercare', 'El recibo hace más que confirmar el pago.', 'María recibe su comprobante y, si la sucursal lo tiene configurado, puede reseñar o facturar desde ahí.', 'Mismo pago · $348.10 · Recibo enviado', 'El siguiente paso comienza desde el mismo recibo.'],
  ['operations', 'Una venta pone toda la operación en movimiento.', 'El mismo evento actualiza venta, inventario, reorden, cliente y equipo.', 'Misma venta · María G. · $348.10', 'Tu negocio avanza sin capturar lo mismo otra vez.'],
  ['finance', 'Ese mismo pago llega identificado hasta tus libros.', 'Costo, liquidación esperada, conciliación y póliza conservan la misma referencia.', 'Misma referencia · AVQ-34810', 'La referencia acompaña al dinero.'],
  ['multibranch', 'Cada sucursal cuenta en la misma vista.', 'Compara Centro, Roma y Norte sin salir de Estudio Lumina.', 'Estudio Lumina · 3 sucursales', 'Cambias de sucursal sin perder el panorama.'],
  ['ai', 'Para entender tu negocio, solo pregunta.', 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.', 'Mismo contexto · Estudio Lumina', 'ChatGPT o Claude responden con el contexto de Avoqado.'],
] as const;

test('mantiene la narrativa completa en reduced motion y no-JS', async ({ page }, testInfo) => {
  test.skip(!['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const mode = testInfo.project.name === 'chromium-reduced' ? 'static' : 'noscript';
  const story = page.locator(`[data-story-mode="${mode}"]`);

  for (const [id, title, body, thread, result] of staticTruth) {
    const scene = story.locator(`[data-story-scene="${id}"]`);
    await expect(scene.getByRole('heading', { level: 2 })).toHaveText(title);
    await expect(scene.locator('[data-narrative-body]')).toHaveText(body);
    await expect(scene.locator('[data-narrative-thread]')).toHaveText(thread);
    await expect(scene.locator('[data-narrative-result]')).toHaveText(result);
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(story.getByRole('heading', { level: 2 })).toHaveCount(7);
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-reduced --project=chromium-nojs --grep "narrativa completa"
```

Expected: FAIL because current static scenes do not render `data-narrative-thread` or `data-narrative-result`, and current headings use the old copy.

- [ ] **Step 3: Add the narrative fields, fixture evidence, exact copy, and approved ranges**

Update `story-fixture.ts` with these additional fields inside `STORY_FIXTURE`:

```ts
paymentReference: 'AVQ-34810',
organizationTicket: '$192',
comparisonVenueTicket: '$184',
comparisonVenueTicketChange: '-8%',
```

Replace the shared interfaces in `story.ts` with:

```ts
export interface NarrativeBeat {
  eyebrow: string;
  title: string;
  thread: string;
  result: string;
  body: string;
  stepThresholds: readonly number[];
}

export interface StoryScene extends NarrativeBeat {
  id: StorySceneId;
  range: readonly [number, number];
  progressLabel: string;
  theme: 'dark' | 'light';
}
```

Import `STORY_FIXTURE` and replace `STORY_SCENES` with the exact values below:

```ts
export const STORY_SCENES: readonly StoryScene[] = [
  {
    id: 'service',
    eyebrow: 'Todo empieza con una reservación',
    title: 'La reservación llega con todo el contexto.',
    thread: `${STORY_FIXTURE.customer} · ${STORY_FIXTURE.appointmentTime} · ${STORY_FIXTURE.service}`,
    result: 'Tu equipo sabe a quién atender y qué preparar.',
    body: 'María, su servicio, la colaboradora, la sucursal y el producto llegan juntos.',
    stepThresholds: [0.30, 0.43, 0.56, 0.68],
    range: [0, 0.15],
    progressLabel: 'Servicio',
    theme: 'dark',
  },
  {
    id: 'payment',
    eyebrow: 'Al terminar el servicio',
    title: 'El pago conserva de dónde vino.',
    thread: `Misma visita · ${STORY_FIXTURE.customer} · ${STORY_FIXTURE.total}`,
    result: 'Siempre sabes cómo entró el dinero.',
    body: 'TPV, tienda en línea, liga o efectivo quedan ligados a la misma visita. En TPV compatibles, el operador elige manualmente una Cuenta de cobro habilitada.',
    stepThresholds: [0.32, 0.50, 0.67],
    range: [0.14, 0.30],
    progressLabel: 'Cobro',
    theme: 'dark',
  },
  {
    id: 'aftercare',
    eyebrow: 'Después del cobro',
    title: 'El recibo hace más que confirmar el pago.',
    thread: `Mismo pago · ${STORY_FIXTURE.total} · Recibo enviado`,
    result: 'El siguiente paso comienza desde el mismo recibo.',
    body: 'María recibe su comprobante y, si la sucursal lo tiene configurado, puede reseñar o facturar desde ahí.',
    stepThresholds: [0.32, 0.50, 0.67],
    range: [0.29, 0.44],
    progressLabel: 'Cliente',
    theme: 'light',
  },
  {
    id: 'operations',
    eyebrow: 'Mientras María recibe su recibo',
    title: 'Una venta pone toda la operación en movimiento.',
    thread: `Misma venta · ${STORY_FIXTURE.customer} · ${STORY_FIXTURE.total}`,
    result: 'Tu negocio avanza sin capturar lo mismo otra vez.',
    body: 'El mismo evento actualiza venta, inventario, reorden, cliente y equipo.',
    stepThresholds: [0.30, 0.40, 0.50, 0.60, 0.68],
    range: [0.43, 0.62],
    progressLabel: 'Operación',
    theme: 'dark',
  },
  {
    id: 'finance',
    eyebrow: 'Después del cobro',
    title: 'Ese mismo pago llega identificado hasta tus libros.',
    thread: `Misma referencia · ${STORY_FIXTURE.paymentReference}`,
    result: 'La referencia acompaña al dinero.',
    body: 'Costo, liquidación esperada, conciliación y póliza conservan la misma referencia.',
    stepThresholds: [0.30, 0.40, 0.50, 0.60, 0.70],
    range: [0.61, 0.76],
    progressLabel: 'Finanzas',
    theme: 'light',
  },
  {
    id: 'multibranch',
    eyebrow: 'Ahora abre el panorama',
    title: 'Cada sucursal cuenta en la misma vista.',
    thread: `${STORY_FIXTURE.organization} · 3 sucursales`,
    result: 'Cambias de sucursal sin perder el panorama.',
    body: 'Compara Centro, Roma y Norte sin salir de Estudio Lumina.',
    stepThresholds: [0.30, 0.40, 0.50, 0.56, 0.66],
    range: [0.75, 0.90],
    progressLabel: 'Sucursales',
    theme: 'dark',
  },
  {
    id: 'ai',
    eyebrow: 'Con todo conectado',
    title: 'Para entender tu negocio, solo pregunta.',
    thread: `Mismo contexto · ${STORY_FIXTURE.organization}`,
    result: 'ChatGPT o Claude responden con el contexto de Avoqado.',
    body: 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.',
    stepThresholds: [0.32, 0.52, 0.68],
    range: [0.89, 1],
    progressLabel: 'IA',
    theme: 'dark',
  },
] as const;
```

In `ReducedMotionStory.tsx`, replace the eyebrow/title/body block with:

```tsx
<p data-narrative-eyebrow className={light ? 'text-sm font-medium text-green-800' : 'text-sm font-medium text-avoqado-green'}>
  {scene.eyebrow}
</p>
<h2 data-narrative-title className="mt-4 max-w-4xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">
  {scene.title}
</h2>
<p data-narrative-thread className={light ? 'mt-5 text-sm font-semibold text-neutral-700' : 'mt-5 text-sm font-semibold text-neutral-300'}>
  {scene.thread}
</p>
<p data-narrative-body className={light ? 'mt-4 max-w-2xl text-lg text-neutral-600' : 'mt-4 max-w-2xl text-lg text-neutral-300'}>
  {scene.body}
</p>
<p data-narrative-result className="mt-6 max-w-2xl text-xl font-medium">
  {scene.result}
</p>
```

- [ ] **Step 4: Run reduced-motion and no-JS tests**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts tests/e2e/home-scrollytelling.spec.ts --project=chromium-reduced --project=chromium-nojs --grep "narrativa completa|historia completa"
```

Expected: PASS with one H1, seven story H2s, exact body/thread/result copy, and no JavaScript dependency.

- [ ] **Step 5: Commit the typed narrative truth**

```bash
git add tests/e2e/helpers/home-story-scroll.ts tests/e2e/home-narrative-hierarchy.spec.ts src/components/interactive/home-story/story.ts src/components/interactive/home-story/story-fixture.ts src/components/interactive/home-story/ReducedMotionStory.tsx
git commit -m "feat(homepage): define persistent narrative truth"
```

---

### Task 2: Build the reusable persistent anchor and shared frame

**Files:**
- Create: `src/components/interactive/home-story/story-motion.ts`
- Create: `src/components/interactive/home-story/NarrativeAnchor.tsx`
- Modify: `src/components/interactive/home-story/SceneFrame.tsx`
- Modify: `src/components/interactive/home-story/home-story.css`
- Modify: all seven files in `src/components/interactive/home-story/scenes/`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- Consumes: `NarrativeBeat`, `StoryScene`, and each scene's existing local `MotionValue<number>`.
- Produces: `STORY_PHASES`, `stepWindow`, `useStepReveal`, `useNarrativeVisualMotion`, `NarrativeAnchor`, and stable `data-narrative-*` hooks.

- [ ] **Step 1: Add the failing persistent-heading test**

Append to `home-narrative-hierarchy.spec.ts`:

```ts
import { STORY_SCENES } from '../../src/components/interactive/home-story/story';
import { scrollStorySceneTo } from './helpers/home-story-scroll';

test('mantiene un solo titular ancla durante idea, demostración y resultado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const scene of STORY_SCENES) {
    await scrollStorySceneTo(page, scene.id, 0.10);
    const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
    const heading = root.locator('[data-narrative-title]');
    const handle = await heading.elementHandle();
    if (!handle) throw new Error(`Missing heading for ${scene.id}`);
    const intro = await root.evaluate(element => {
      const title = element.querySelector<HTMLElement>('[data-narrative-title]')!;
      const lineRange = document.createRange();
      lineRange.selectNodeContents(title);
      return {
        text: title.textContent,
        fontSize: getComputedStyle(title).fontSize,
        width: title.offsetWidth,
        height: title.offsetHeight,
        lines: lineRange.getClientRects().length,
        threadOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-thread]')!).opacity),
        resultOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity),
        visualOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-visual]')!).opacity),
      };
    });
    expect(intro.threadOpacity).toBeLessThanOrEqual(0.05);
    expect(intro.resultOpacity).toBeLessThanOrEqual(0.05);
    expect(intro.visualOpacity).toBeCloseTo(0.14, 1);

    await scrollStorySceneTo(page, scene.id, 0.55);
    expect(await heading.evaluate((node, first) => node === first, handle)).toBe(true);
    const demo = await heading.evaluate(element => ({
      text: element.textContent,
      fontSize: getComputedStyle(element).fontSize,
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
      lines: (() => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getClientRects().length;
      })(),
      scale: new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
    }));
    expect(demo).toMatchObject({
      text: intro.text,
      fontSize: intro.fontSize,
      width: intro.width,
      height: intro.height,
      lines: intro.lines,
    });
    expect(demo.scale).toBeCloseTo(0.72, 1);
    await expect(root.locator('[data-narrative-thread]')).toHaveCSS('opacity', '1');

    await scrollStorySceneTo(page, scene.id, 0.86);
    await expect(root.locator('[data-narrative-result]')).toHaveCSS('opacity', '1');
    expect(await root.locator('[data-narrative-visual]').evaluate(element => (
      Number.parseFloat(getComputedStyle(element).opacity)
    ))).toBeCloseTo(0.65, 1);
  }
});
```

- [ ] **Step 2: Run the test and verify it fails**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "un solo titular ancla"
```

Expected: FAIL because `data-narrative-visual` does not exist and current headings/body/mockups appear simultaneously.

- [ ] **Step 3: Implement the shared scroll-motion primitives**

Create `story-motion.ts`:

```ts
import { useTransform, type MotionValue } from 'framer-motion';

export type MotionRange = [number, number];

export const STORY_PHASES: {
  compact: MotionRange;
  result: MotionRange;
  hold: MotionRange;
  exit: MotionRange;
  layerEnter: MotionRange;
  stepHalfWindow: number;
} = {
  compact: [0.18, 0.38],
  result: [0.73, 0.84],
  hold: [0.84, 0.93],
  exit: [0.93, 1],
  layerEnter: [0, 0.07],
  stepHalfWindow: 0.02,
};

export function smoothstep(value: number) {
  return value * value * (3 - 2 * value);
}

export function stepWindow(threshold: number): MotionRange {
  return [threshold - STORY_PHASES.stepHalfWindow, threshold + STORY_PHASES.stepHalfWindow];
}

export function useStepReveal(
  progress: MotionValue<number>,
  threshold: number,
  distance = 14,
) {
  const window = stepWindow(threshold);
  return {
    opacity: useTransform(progress, window, [0, 1], { ease: smoothstep }),
    offset: useTransform(progress, window, [distance, 0], { ease: smoothstep }),
  };
}

export function useNarrativeVisualMotion(progress: MotionValue<number>) {
  const demo = useTransform(progress, STORY_PHASES.compact, [0, 1], { ease: smoothstep });
  const result = useTransform(progress, STORY_PHASES.result, [0, 1], { ease: smoothstep });
  return {
    opacity: useTransform(() => (0.14 + 0.86 * demo.get()) * (1 - 0.35 * result.get())),
    y: useTransform(() => 14 * (1 - demo.get())),
    scale: useTransform(() => 0.987 + 0.013 * demo.get()),
  };
}
```

- [ ] **Step 4: Implement `NarrativeAnchor`**

Create `NarrativeAnchor.tsx` with the exact public contract and stable hooks:

```tsx
import { motion, useMotionValueEvent, useTransform, type MotionValue } from 'framer-motion';
import { useCallback, useEffect, useRef, type ReactNode } from 'react';
import type { NarrativeBeat } from './story';
import { smoothstep, STORY_PHASES } from './story-motion';

interface NarrativeAnchorProps {
  narrative: NarrativeBeat;
  progress: MotionValue<number>;
  thread?: ReactNode;
  headingLevel?: 1 | 2;
  headingId?: string;
  actions?: ReactNode;
  light?: boolean;
}

export default function NarrativeAnchor({
  narrative,
  progress,
  thread = narrative.thread,
  headingLevel = 2,
  headingId,
  actions,
  light = false,
}: NarrativeAnchorProps) {
  const Heading = headingLevel === 1 ? motion.h1 : motion.h2;
  const actionsRef = useRef<HTMLDivElement>(null);
  const compact = useTransform(progress, STORY_PHASES.compact, [0, 1], { ease: smoothstep });
  const headingScale = useTransform(compact, [0, 1], [1, 0.72]);
  const copyY = useTransform(compact, [0, 1], [0, -14]);
  const eyebrowOpacity = useTransform(compact, [0, 1], [1, 0]);
  const threadOpacity = useTransform(compact, [0, 1], [0, 1]);
  const resultOpacity = useTransform(progress, STORY_PHASES.result, [0, 1], { ease: smoothstep });
  const resultY = useTransform(progress, STORY_PHASES.result, [14, 0], { ease: smoothstep });

  const syncActions = useCallback((value: number) => {
    actionsRef.current?.toggleAttribute('inert', value < 0.95);
  }, []);

  useMotionValueEvent(resultOpacity, 'change', syncActions);
  useEffect(() => syncActions(resultOpacity.get()), [resultOpacity, syncActions]);

  return (
    <header data-narrative-anchor className="story-narrative-anchor relative z-20 min-h-0 self-center">
      <motion.div style={{ y: copyY }}>
        <div className="story-narrative-meta relative h-4">
          <motion.p
            data-narrative-eyebrow
            style={{ opacity: eyebrowOpacity }}
            className={light ? 'absolute inset-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-green-800 sm:text-xs' : 'absolute inset-0 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-xs'}
          >
            {narrative.eyebrow}
          </motion.p>
          <motion.p
            data-narrative-thread
            style={{ opacity: threadOpacity }}
            className={light ? 'absolute inset-0 flex items-center gap-2 text-[0.68rem] font-semibold text-neutral-600 sm:text-xs' : 'absolute inset-0 flex items-center gap-2 text-[0.68rem] font-semibold text-neutral-400 sm:text-xs'}
          >
            <span data-narrative-thread-marker aria-hidden="true" className="size-[7px] shrink-0 rounded-full bg-avoqado-green" />
            {thread}
          </motion.p>
        </div>
        <Heading
          id={headingId}
          data-narrative-title
          className="story-narrative-title mt-3 max-w-[13ch] origin-left-top text-[clamp(2.25rem,10vw,3rem)] font-medium leading-[0.98] tracking-[-0.052em] lg:text-[clamp(2.875rem,4.4vw,4.375rem)]"
          style={{ scale: headingScale }}
        >
          {narrative.title}
        </Heading>
        <p data-narrative-body className="sr-only">{narrative.body}</p>
        <motion.div
          data-narrative-result
          style={{ opacity: resultOpacity, y: resultY }}
          className="story-narrative-result mt-7 max-w-[32ch]"
        >
          <p className={light ? 'text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-green-800' : 'text-[0.625rem] font-semibold uppercase tracking-[0.17em] text-avoqado-green'}>
            Resultado
          </p>
          <strong className="mt-2 block text-[clamp(1rem,1.5vw,1.375rem)] font-medium leading-[1.35] tracking-[-0.025em]">
            {narrative.result}
          </strong>
          {actions ? <div ref={actionsRef} {...{ inert: '' }} className="story-frame-actions mt-5">{actions}</div> : null}
        </motion.div>
      </motion.div>
    </header>
  );
}
```

- [ ] **Step 5: Refactor `SceneFrame` and pass local progress from all scenes**

Replace `SceneFrame`'s props and layout with:

```tsx
import { motion, type MotionValue } from 'framer-motion';
import type { ReactNode } from 'react';
import NarrativeAnchor from './NarrativeAnchor';
import { useNarrativeVisualMotion } from './story-motion';
import type { StoryScene } from './story';
import './home-story.css';

interface Props {
  scene: StoryScene;
  progress: MotionValue<number>;
  actions?: ReactNode;
  children: ReactNode;
}

export default function SceneFrame({ scene, progress, actions, children }: Props) {
  const visualMotion = useNarrativeVisualMotion(progress);
  const light = scene.theme === 'light';

  return (
    <div data-scene-frame={scene.id} className={light ? 'story-frame--scene h-full overflow-hidden bg-neutral-50 text-neutral-950' : 'story-frame--scene h-full overflow-hidden bg-neutral-950 text-neutral-50'}>
      <div className="story-frame-grid mx-auto grid h-full max-w-[1320px] grid-rows-[minmax(220px,38fr)_minmax(0,62fr)] gap-3 px-6 pb-6 pt-7 lg:grid-cols-[minmax(280px,41fr)_minmax(500px,59fr)] lg:grid-rows-1 lg:items-center lg:gap-14 lg:px-16 lg:py-12">
        <NarrativeAnchor
          narrative={scene}
          progress={progress}
          actions={actions}
          light={light}
        />
        <motion.div
          data-narrative-visual
          aria-hidden="true"
          {...{ inert: '' }}
          className="story-frame-visual relative min-h-0 self-stretch lg:min-h-[500px]"
          style={visualMotion}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
```

In every scene, add `progress={progress}` to its existing `SceneFrame` opening tag and remove the old inline `accessibleSummary` prop. `scene.body` is now the single semantic summary rendered by `NarrativeAnchor`; the product visual remains `aria-hidden` and must not duplicate that narration. For `AiScene`, keep its existing `actions={actions}` on the same tag.

- [ ] **Step 6: Replace obsolete frame CSS with stable narrative rules**

Add to `home-story.css` and remove obsolete `.story-frame-body` sizing rules:

```css
.story-narrative-result {
  min-height: 5.5rem;
}

@media (max-width: 767px) {
  .story-narrative-title {
    max-width: 14ch;
    font-size: clamp(2.25rem, 10vw, 3rem);
  }
}

@media (max-width: 479px) and (max-height: 640px) {
  .story-frame-grid {
    grid-template-rows: minmax(220px, 38fr) minmax(0, 62fr) !important;
    gap: 0.25rem !important;
    padding: 0.75rem 1.5rem 0.5rem !important;
  }

  .story-narrative-title {
    font-size: 2.25rem;
    line-height: 0.98;
  }

  .story-narrative-result {
    min-height: 3.75rem;
    margin-top: 0.75rem;
  }
}
```

- [ ] **Step 7: Run the anchor test and existing scene geometry tests**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "un solo titular ancla"
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "sticky|dentro de su panel"
```

Expected: PASS; the exact same heading node keeps its text, font size, offset box, and line count while only its transform changes.

- [ ] **Step 8: Commit the shared narrative frame**

```bash
git add src/components/interactive/home-story/story-motion.ts src/components/interactive/home-story/NarrativeAnchor.tsx src/components/interactive/home-story/SceneFrame.tsx src/components/interactive/home-story/home-story.css src/components/interactive/home-story/scenes tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "feat(homepage): add persistent narrative frame"
```

---

### Task 3: Apply the persistent narrative to operation entries

**Files:**
- Modify: `src/components/interactive/home-opening/opening-channel-results.ts`
- Modify: `src/components/interactive/home-opening/ChannelHandoff.tsx`
- Modify: `src/components/interactive/home-opening/ReducedMotionOpening.tsx`
- Modify: `src/components/interactive/home-story/home-story.css`
- Modify: `tests/e2e/home-opening.spec.ts`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- Consumes: `NarrativeBeat`, `NarrativeAnchor`, `useNarrativeVisualMotion`, existing five channels, measured route geometry, and `sequenceProgress`.
- Produces: `OPENING_CHANNEL_NARRATIVE` and `resolveOpeningChannelSequence(progress): { index; routeProgress; routeOpacity; started }`.

- [ ] **Step 1: Update the opening checkpoints and add the failing anchor assertion**

Separate content checkpoints from connector checkpoints:

- use `0.36/0.52/0.66` for visible content, active thread, compact layout, and reverse-order assertions;
- use `0.32/0.47/0.62` for fully docked connector geometry and responsive panel checks;
- replace the first-route lifecycle samples with source `0.28`, forward `0.29/0.30/0.31/0.32`, reverse `0.31/0.30/0.29/0.28/0.27/0.25/0`, and replay `0.30`.

Because three event blocks remain mounted, change content selectors to `[data-channel-event-content][data-active="true"]`; use their computed opacity, not Playwright `:visible`, during the two crossfade windows.

In the lifecycle assertions, require route/pulse/event opacity `≤0.05` at `0.28`, monotonically increasing draw and decreasing target distance through `0.32`, full draw/dock at `0.32`, the symmetric reverse through `0.28`, and all three opacities `≤0.05` at `0.27` and below. Remove the obsolete `eventTranslateY ≥ 7` assertion because the event no longer has a clock-driven vertical transition.

Append this test:

```ts
test('mantiene el titular de Entradas mientras demuestra tres canales', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const scene = page.locator('[data-opening-channel-handoff]');

  for (const [progress, thread] of [
    [0.36, 'Reservación en línea → Reserva confirmada'],
    [0.52, 'Liga de pago → Pago recibido'],
    [0.66, 'Terminal de cobro → Cobro aprobado'],
  ] as const) {
    await scrollOpeningNarrativeTo(page, progress);
    await expect(scene.locator('[data-narrative-title]')).toHaveText('Tu cliente reserva, compra o paga como prefiera.');
    await expect(scene.locator('[data-channel-thread][data-active="true"]')).toHaveText(thread);
  }

  await scrollOpeningNarrativeTo(page, 0.86);
  await expect(scene.locator('[data-narrative-result]')).toContainText('Todo llega conectado al mismo negocio.');
});
```

Also append the static-mode assertion:

```ts
test('conserva idea, hilo, demostraciones y resultado de Entradas sin scrub', async ({ page }, testInfo) => {
  test.skip(!['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const mode = testInfo.project.name === 'chromium-reduced' ? 'static' : 'noscript';
  const opening = page.locator(`[data-opening-mode="${mode}"]`);
  await expect(opening.locator('[data-narrative-title]')).toHaveText('Tu cliente reserva, compra o paga como prefiera.');
  await expect(opening.locator('[data-narrative-body]')).toHaveText('Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.');
  await expect(opening.locator('[data-narrative-thread]')).toHaveText('Reservación en línea → Reserva confirmada');
  await expect(opening.locator('[data-channel-static-result]')).toHaveCount(3);
  await expect(opening.locator('[data-narrative-result]')).toHaveText('Todo llega conectado al mismo negocio.');
});
```

Add `1024×768` to both existing opening viewport arrays (`keeps every opening checkpoint...` and `docks all five shared tiles...`). Then append these two animated regressions:

```ts
test('cruza canales sin saltar ruta, evento ni hilo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const scene = page.locator('[data-opening-channel-handoff]');
  const readMaximumOpacity = async (selector: string) => scene.locator(selector).evaluateAll(nodes => (
    Math.max(0, ...nodes.map(node => Number.parseFloat(getComputedStyle(node).opacity)))
  ));

  for (const [before, boundary, after] of [[0.42, 0.43, 0.44], [0.57, 0.58, 0.59]] as const) {
    await scrollOpeningNarrativeTo(page, before);
    expect(await readMaximumOpacity('[data-channel-event-content]')).toBeGreaterThan(0.05);
    expect(await readMaximumOpacity('[data-channel-thread]')).toBeGreaterThan(0.05);

    await scrollOpeningNarrativeTo(page, boundary);
    expect(await readMaximumOpacity('[data-channel-event-content]')).toBeLessThanOrEqual(0.05);
    expect(await readMaximumOpacity('[data-channel-thread]')).toBeLessThanOrEqual(0.05);
    expect(await readMaximumOpacity('[data-channel-route], [data-story-primary-pulse]')).toBeLessThanOrEqual(0.05);

    await scrollOpeningNarrativeTo(page, after);
    expect(await readMaximumOpacity('[data-channel-event-content]')).toBeGreaterThan(0.05);
    expect(await readMaximumOpacity('[data-channel-thread]')).toBeGreaterThan(0.05);
  }
});

test('mantiene la jerarquía de Entradas en los siete viewports y al restaurar scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  test.setTimeout(180_000);
  const viewports = [
    { width: 1440, height: 900 }, { width: 1024, height: 768 },
    { width: 910, height: 691 }, { width: 887, height: 502 },
    { width: 787, height: 701 }, { width: 390, height: 844 },
    { width: 320, height: 568 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/?motion=full');
    await page.evaluate(async () => { await document.fonts.ready; });
    let titleInvariant: { text: string | null; width: number; height: number; lines: number } | undefined;

    for (const progress of [0.10, 0.55, 0.86] as const) {
      await scrollOpeningNarrativeTo(page, progress);
      const scene = page.locator('[data-opening-channel-handoff]');
      const geometry = await scene.evaluate(element => {
        const title = element.querySelector<HTMLElement>('[data-narrative-title]')!;
        const visual = element.querySelector<HTMLElement>('[data-narrative-visual]')!;
        const event = element.querySelector<HTMLElement>('.story-channel-event')!;
        const range = document.createRange();
        range.selectNodeContents(title);
        const inside = (rect: DOMRect) => rect.left >= -1 && rect.right <= innerWidth + 1
          && rect.top >= -1 && rect.bottom <= innerHeight + 1;
        return {
          title: { text: title.textContent, width: title.offsetWidth, height: title.offsetHeight, lines: range.getClientRects().length },
          titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
          titleInside: inside(title.getBoundingClientRect()),
          visualInside: inside(visual.getBoundingClientRect()),
          eventInside: inside(event.getBoundingClientRect()),
          eventHeight: event.getBoundingClientRect().height,
          eyebrowOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-eyebrow]')!).opacity),
          threadOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-thread]')!).opacity),
          resultOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity),
        };
      });
      expect(geometry.titleInside && geometry.visualInside && geometry.eventInside).toBe(true);
      expect(geometry.eventHeight).toBeGreaterThanOrEqual(120);
      if (viewport.width < 768) expect(geometry.titleFontSize).toBeGreaterThanOrEqual(36);
      if (progress === 0.10) expect(geometry.eyebrowOpacity).toBeGreaterThanOrEqual(0.95);
      if (progress === 0.55) expect(geometry.threadOpacity).toBeGreaterThanOrEqual(0.95);
      if (progress === 0.86) expect(geometry.resultOpacity).toBeGreaterThanOrEqual(0.95);
      titleInvariant ??= geometry.title;
      expect(geometry.title).toEqual(titleInvariant);
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?motion=full');
  await scrollOpeningNarrativeTo(page, 0.52);
  await page.reload();
  const restored = page.locator('[data-opening-channel-handoff]');
  await expect.poll(() => restored.getAttribute('data-active')).toBe('true');
  await expect(restored).toHaveCSS('visibility', 'visible');
  await expect(restored.locator('[data-channel-thread][data-active="true"]')).toHaveText('Liga de pago → Pago recibido');
});
```

- [ ] **Step 2: Run the opening anchor test and verify it fails**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "titular de Entradas|cruza canales|siete viewports|reservation, payment-link"
```

Expected: FAIL because `ChannelHandoff` still renders a separate heading/body, swaps content on a timer, starts its first route immediately, restores hidden, and forces the opening H2 below `36px` at `320×568`.

- [ ] **Step 3: Define opening narrative data and deterministic result windows**

In `opening-channel-results.ts`, add:

```ts
import type { NarrativeBeat } from '../home-story/story';
import { smoothstep, stepWindow } from '../home-story/story-motion';

export const OPENING_CHANNEL_NARRATIVE = {
  eyebrow: 'Una sola operación',
  title: 'Tu cliente reserva, compra o paga como prefiera.',
  thread: 'Reservación en línea → Reserva confirmada',
  result: 'Todo llega conectado al mismo negocio.',
  body: 'Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.',
  stepThresholds: [0.30, 0.45, 0.60],
} as const satisfies NarrativeBeat;

function channelRouteWindow(index: number, threshold: number, fadeOutStart: number, switchAt: number) {
  const [start, end] = stepWindow(threshold);
  return { index, threshold, start, end, fadeOutStart, switchAt };
}

const CHANNEL_ROUTE_WINDOWS = [
  channelRouteWindow(0, 0.30, 0.39, 0.43),
  channelRouteWindow(1, 0.45, 0.54, 0.58),
  channelRouteWindow(2, 0.60, 1, 1),
] as const;

const clamp01 = (value: number) => Math.min(Math.max(value, 0), 1);

export function resolveOpeningChannelSequence(progress: number) {
  const value = clamp01(progress);
  const index = value < 0.43 ? 0 : value < 0.58 ? 1 : 2;
  const window = CHANNEL_ROUTE_WINDOWS[index];
  const draw = smoothstep(clamp01((value - window.start) / (window.end - window.start)));
  const fade = index === 2
    ? 1
    : 1 - smoothstep(clamp01((value - window.fadeOutStart) / (window.switchAt - window.fadeOutStart)));
  return {
    index,
    routeProgress: draw,
    routeOpacity: draw * fade,
    started: value >= window.start,
  };
}
```

- [ ] **Step 4: Compose `NarrativeAnchor` in `ChannelHandoff` and remove timed swaps**

Remove `AnimatePresence`. Import `NarrativeAnchor`, `OPENING_CHANNEL_NARRATIVE`, and `{ smoothstep, useNarrativeVisualMotion }` from the shared story-motion module. Compute:

```tsx
const visualMotion = useNarrativeVisualMotion(sequenceProgress);
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
```

Replace `channelHeading` with:

```tsx
<NarrativeAnchor
  narrative={OPENING_CHANNEL_NARRATIVE}
  progress={sequenceProgress}
  thread={activeThread}
  headingId="opening-channels-title"
  light
/>
```

Apply `data-narrative-visual` and `style={visualMotion}` to `story-channel-visual`. Add a child component whose `index` is stable for its lifetime:

```tsx
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
```

Import `type OpeningChannelDemonstration` with the existing opening-result imports. Render all three `OPENING_CHANNEL_DEMONSTRATIONS` through that child inside a `relative min-h-[7.5rem] sm:min-h-[9rem]` event-content wrapper; the sizing belongs to this in-flow wrapper because its three children are absolute. Remove `AnimatePresence`, its React key, and every `initial/animate/exit/transition` prop. Keep one shared route target outside the three blocks, so the existing `ResizeObserver`, SVG path, source/target anchors, tile handoff, and `data-story-primary-pulse` remain measured from the active source row to the same destination.

Initialize `routeStarted` from `initialSequence.started`, `routeOpacity` with `useMotionValue(initialSequence.routeOpacity)`, and `channelActive` with `useState(() => progress.get() > 0.05)`. Add this mount synchronization while retaining the existing progress subscription for subsequent changes:

```tsx
useEffect(() => {
  setChannelActive(progress.get() > 0.05);
}, [progress]);
```

Update `routeStarted`, `routeOpacity`, `activeIndex`, and `routeProgress` together in `useMotionValueEvent(sequenceProgress, ...)`; remove the old `connectorOpacity = useTransform(routeProgress, ...)` declaration and use `routeOpacity` as the SVG/pulse opacity. Add `data-channel-route` to the route's outer `motion.svg` so tests read the element that actually owns that opacity. Keep the existing `route.ready && route.channelId === activeDemonstration.channelId` mount condition so reverse tests can still inspect the measured elements. Add `visibility: routeStarted ? 'visible' : 'hidden'` beside `opacity: routeOpacity` on the route and pulse, and expose `data-channel-route-started={routeStarted ? 'true' : 'false'}` on the handoff section. At `.43` and `.58`, the prior route/event/thread has faded to zero before `activeIndex` switches, so remeasurement cannot create a visible jump.

In the existing compact opening media query in `home-story.css`, replace the higher-specificity override directly—do not add a competing class rule:

```css
[data-opening-channel-handoff] h2 {
  margin-top: 0.25rem;
  font-size: 2.25rem;
  line-height: 0.98;
}
```

Keep at least `24px` horizontal padding. Simplify or hide only secondary ledger/event details if the `320×568` bounds test requires space; do not reduce the title, active thread, result, five channel rows, or event's primary fact.

Do not add CSS `transition` or a Framer `transition` duration to any story-controlled channel element.

- [ ] **Step 5: Add the full narrative contract to static opening modes**

In `ReducedMotionOpening.tsx`, add `data-narrative-eyebrow` to `UNA SOLA OPERACIÓN`, `data-narrative-title` to its following H2, and `data-narrative-body` to its explanatory paragraph. Directly before `data-channel-static-results`, add:

```tsx
<p data-narrative-thread className="mt-6 flex items-center gap-2 text-sm font-semibold text-neutral-700">
  <span aria-hidden="true" className="size-[7px] rounded-full bg-avoqado-green" />
  Reservación en línea → Reserva confirmada
</p>
```

After the three static channel demonstrations, add:

```tsx
<p data-narrative-result className="mt-8 text-xl font-medium text-neutral-950">
  Todo llega conectado al mismo negocio.
</p>
```

- [ ] **Step 6: Run every opening regression**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts --project=chromium-desktop
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "connector|conector|canales"
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-reduced --project=chromium-nojs --grep "Entradas|reduced|no-JS|static"
```

Expected: PASS for video, poster, 17 tiles, five shared-tile docks, three reversible results, measured connector geometry, static/no-JS truth, and the persistent opening heading.

- [ ] **Step 7: Commit the opening narrative**

```bash
git add src/components/interactive/home-opening/opening-channel-results.ts src/components/interactive/home-opening/ChannelHandoff.tsx src/components/interactive/home-opening/ReducedMotionOpening.tsx src/components/interactive/home-story/home-story.css tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "feat(homepage): pace operation entry narrative"
```

---

### Task 4: Remap Service, Payment, and Aftercare to cumulative product steps

**Files:**
- Modify: `src/components/interactive/home-story/scenes/ServiceScene.tsx`
- Modify: `src/components/interactive/home-story/scenes/PaymentScene.tsx`
- Modify: `src/components/interactive/home-story/scenes/AftercareScene.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- Consumes: each scene's `scene.stepThresholds`, `useStepReveal`, the existing measured Service route, and the existing Payment/Aftercare product panels.
- Produces: stable `data-story-step` hooks and cumulative, fully reversible demonstration states that finish by local progress `0.72`.

- [ ] **Step 1: Add the failing cumulative-step and reverse-scroll test**

Append to `home-narrative-hierarchy.spec.ts`:

```ts
const simpleStepContracts = {
  service: [
    { id: 'reservation', minimumOpacity: 0.95 },
    { id: 'route', minimumOpacity: 0.35 },
    { id: 'agenda', minimumOpacity: 0.95 },
    { id: 'context', minimumOpacity: 0.95 },
  ],
  payment: ['channel', 'selector', 'account'].map(id => ({ id, minimumOpacity: 0.95 })),
  aftercare: ['receipt', 'review', 'invoice'].map(id => ({ id, minimumOpacity: 0.95 })),
} as const;

test('acumula Servicio, Cobro y Cliente antes del resultado y los revierte', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const [sceneId, steps] of Object.entries(simpleStepContracts)) {
    await scrollStorySceneTo(page, sceneId as keyof typeof simpleStepContracts, 0.72);
    const scene = page.locator(`[data-story-scene="${sceneId}"][data-active="true"]`);
    for (const step of steps) {
      const element = scene.locator(`[data-story-step="${step.id}"]`);
      await expect(element).toHaveCount(1);
      expect(await element.evaluate(node => Number.parseFloat(getComputedStyle(node).opacity)))
        .toBeGreaterThanOrEqual(step.minimumOpacity);
    }

    await scrollStorySceneTo(page, sceneId as keyof typeof simpleStepContracts, 0.10);
    for (const step of steps) {
      expect(await scene.locator(`[data-story-step="${step.id}"]`).evaluate(node => (
        Number.parseFloat(getComputedStyle(node).opacity)
      ))).toBeLessThanOrEqual(0.05);
    }
  }
});

test('Cobro y Cliente conservan marcador estático y cero pulsos o rutas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const sceneId of ['payment', 'aftercare'] as const) {
    await scrollStorySceneTo(page, sceneId, 0.55);
    const scene = page.locator(`[data-story-scene="${sceneId}"][data-active="true"]`);
    await expect(scene.locator('[data-narrative-thread-marker]')).toHaveCount(1);
    await expect(scene.locator('[data-story-primary-pulse]')).toHaveCount(0);
    await expect(scene.locator('[data-story-cascade-path], [data-story-service-connector]')).toHaveCount(0);
  }
});
```

- [ ] **Step 2: Run the tests and verify they fail**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "acumula Servicio|cero pulsos"
```

Expected: FAIL because the stable step hooks do not exist and current animations start during the title-reading phase.

- [ ] **Step 3: Remap Service without replacing its measured route**

In `ServiceScene.tsx`, delete the old `agendaOpacity`, `sourceOpacity`, `destinationOpacity`, and `connectorOpacity` declarations. Import `useStepReveal` and bind the four exact thresholds:

```tsx
const [reservationAt, routeAt, agendaAt, contextAt] = scene.stepThresholds;
const reservation = useStepReveal(progress, reservationAt);
const agenda = useStepReveal(progress, agendaAt);
const context = useStepReveal(progress, contextAt);
```

Apply `data-story-step="reservation"` with `style={{ opacity: reservation.opacity, y: reservation.offset }}` to the existing reservation source card. Apply `data-story-step="agenda"` with the same bindings from `agenda` to the agenda panel. Replace the inner context-field grid opening/closing tags with this complete block:

```tsx
<motion.div
  data-story-step="context"
  className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:mt-4 sm:gap-y-3"
  style={{ opacity: context.opacity, y: context.offset }}
>
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
</motion.div>
```

Apply `style={{ opacity: context.opacity }}` to the existing `Contexto listo` `motion.span`, so the label and four fields arrive together without adding a second `data-story-step="context"` hook.

Keep the current `ResizeObserver`, SVG geometry, pulse, source, destination, and dock coordinates. Replace only the route progress input with:

```tsx
const routeProgress = useTransform(progress, [routeAt - 0.02, routeAt + 0.02], [0, 1], { ease: smoothstep });
const connectorOpacity = useTransform(
  progress,
  [routeAt - 0.02, routeAt + 0.02, routeAt + 0.04, 0.93, 1],
  [0, 1, 0.42, 0.42, 0],
  { ease: smoothstep },
);
```

Import `smoothstep` beside `useStepReveal`. Use `routeProgress` in the existing `interpolateRoute` calls. Add `data-story-step="route"` and `data-story-service-connector` to the existing SVG connector group, and apply `opacity: connectorOpacity` while preserving the connector's `pathLength`. The route therefore draws completely inside `0.41–0.45`, stays at `0.42` opacity after arriving, docks through the hold, and reverses from scroll alone.

- [ ] **Step 4: Remap Payment and keep account selection manual**

Remove its current `referencesOpacity/referencesY`, `selectorOpacity/selectorY`, and `selectionOpacity/selectionX` transforms. Replace them with:

```tsx
const [channelAt, selectorAt, accountAt] = scene.stepThresholds;
const channel = useStepReveal(progress, channelAt);
const selector = useStepReveal(progress, selectorAt);
const account = useStepReveal(progress, accountAt, 8);
```

Keep the compact summary and the full reference grid under one persistent step wrapper, because the full grid is intentionally `display:none` at `320×568`. Immediately before the current `.story-payment-reference-grid`, open this wrapper:

```tsx
<motion.div
  data-story-step="channel"
  className="story-payment-channel min-w-0 self-center"
  style={{ opacity: channel.opacity, y: channel.offset }}
>
```

Change only the current grid's outer `motion.div`/closing tag to a plain `div`, remove its old motion style, preserve every reference row, and keep the existing `.story-payment-reference-summary` paragraph immediately after it. Close the new `motion.div` immediately after that summary paragraph. The one `data-story-step="channel"` hook now always has a visible full or compact representation.

Apply the remaining exact hooks and bindings to the existing selector and selected-account nodes:

```tsx
data-story-step="selector" style={{ opacity: selector.opacity, y: selector.offset }}
data-story-step="account"  style={{ opacity: account.opacity, x: account.offset }}
```

The `channel` block retains TPV, tienda en línea, liga, and efectivo; `selector` retains the label `Cuenta de cobro`; `account` retains `Operación diaria` selected and `Facturación` available. Preserve the exact `scene.body`, which states that selection is manual and limited to compatible, configured TPVs. Do not add a route, SVG connector, moving dot, or `data-story-primary-pulse`.

- [ ] **Step 5: Remap Aftercare and state the configuration limit visibly**

Remove the current receipt/context/review/invoice transforms and replace them with:

```tsx
const [receiptAt, reviewAt, invoiceAt] = scene.stepThresholds;
const receipt = useStepReveal(progress, receiptAt);
const review = useStepReveal(progress, reviewAt);
const invoice = useStepReveal(progress, invoiceAt);
```

Apply the exact hooks:

```tsx
data-story-step="receipt" style={{ opacity: receipt.opacity, y: receipt.offset }}
data-story-step="review"  style={{ opacity: review.opacity, y: review.offset }}
data-story-step="invoice" style={{ opacity: invoice.opacity, y: invoice.offset }}
```

Keep the receipt visible as the source of both actions. Under `Factúrate desde tu recibo`, replace the existing secondary copy with:

```tsx
<p data-story-panel-copy className="mt-1 text-[0.625rem] text-neutral-500 sm:text-xs">
  Disponible cuando tu sucursal la configura.
</p>
```

Add the shared reference under the receipt header:

```tsx
<p data-payment-reference className="mt-1 text-[0.55rem] text-neutral-400 sm:text-xs">
  Referencia {STORY_FIXTURE.paymentReference}
</p>
```

Apply `style={{ opacity: receipt.opacity, y: receipt.offset }}` to the existing `.story-aftercare-context` block, without adding a second `data-story-step="receipt"`, so `Desde este recibo` follows the receipt threshold instead of remaining visible during intro. Keep the existing Google review and CFDI controls, the exact configuration-qualified `scene.body`, and the zero-pulse/zero-route implementation.

- [ ] **Step 6: Update stale global range constants in the regression suite**

In `home-scrollytelling.spec.ts`, replace Service's `localProgress * 0.14` with `localProgress * 0.15` and replace both Payment helpers' `0.13 + localProgress * (0.30 - 0.13)` with `0.14 + localProgress * (0.30 - 0.14)`. Aftercare already uses `0.29–0.44`; leave it unchanged. Do not relax any geometry tolerance or product-claim assertion.

- [ ] **Step 7: Run scene, geometry, and claim regressions**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "acumula Servicio|cero pulsos"
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "reserva web|explica el cobro|cobro dentro de su panel|post-servicio"
```

Expected: PASS; all steps finish by `0.72`, reverse at `0.10`, Service keeps one measured route, and Payment/Aftercare keep none.

- [ ] **Step 8: Commit the first three product narratives**

```bash
git add src/components/interactive/home-story/scenes/ServiceScene.tsx src/components/interactive/home-story/scenes/PaymentScene.tsx src/components/interactive/home-story/scenes/AftercareScene.tsx tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "feat(homepage): pace service and payment narrative"
```

---

### Task 5: Make Operations and Finance cumulative cascades

**Files:**
- Modify: `src/components/interactive/home-story/CascadeTimeline.tsx`
- Modify: `src/components/interactive/home-story/scenes/OperationsScene.tsx`
- Modify: `src/components/interactive/home-story/scenes/FinanceScene.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- `CascadeTimeline` becomes `{ progress; thresholds; tone; children }` and requires exactly five thresholds.
- Each cascade row receives one threshold and one stable semantic step id; the measured pulse visits those five existing nodes and returns to its dock only during `0.93–1.00`.

- [ ] **Step 1: Add the failing cascade contract**

Append:

```ts
const cascadeContracts = {
  operations: ['sale', 'inventory', 'reorder', 'crm', 'team'],
  finance: ['payment', 'cost', 'settlement', 'reconciliation', 'policy'],
} as const;

test('acumula las dos cascadas y conserva el pulso en el último nodo durante la pausa', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const [sceneId, steps] of Object.entries(cascadeContracts)) {
    await scrollStorySceneTo(page, sceneId as keyof typeof cascadeContracts, 0.72);
    const sceneLayer = page.locator(`[data-story-scene="${sceneId}"]`);
    await expect(sceneLayer).toHaveAttribute('data-active', 'true');
    for (const step of steps) {
      expect(await sceneLayer.locator(`[data-story-step="${step}"]`).evaluate(node => (
        Number.parseFloat(getComputedStyle(node).opacity)
      ))).toBeGreaterThanOrEqual(0.95);
    }

    const finalNode = sceneLayer.locator('[data-story-cascade-node]').last();
    const pulse = sceneLayer.locator('[data-story-primary-pulse]');
    const atResult = await Promise.all([finalNode.boundingBox(), pulse.boundingBox()]);
    expect(atResult[0]).not.toBeNull();
    expect(atResult[1]).not.toBeNull();
    expect(Math.abs((atResult[0]!.y + atResult[0]!.height / 2) - (atResult[1]!.y + atResult[1]!.height / 2)))
      .toBeLessThanOrEqual(8);

    const exitDistances = [];
    for (const localProgress of [0.93, 0.96, 0.99, 1]) {
      await scrollStorySceneTo(page, sceneId as keyof typeof cascadeContracts, localProgress);
      exitDistances.push(await pulse.evaluate(node => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
        return Math.hypot(matrix.m41, matrix.m42);
      }));
    }
    for (let index = 1; index < exitDistances.length; index += 1) {
      expect(exitDistances[index]).toBeLessThanOrEqual(exitDistances[index - 1] + 0.5);
    }
    expect(exitDistances.at(-1)).toBeLessThanOrEqual(1);
  }
});
```

- [ ] **Step 2: Run the cascade test and verify it fails**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "dos cascadas"
```

Expected: FAIL because cascade rows use old `start` values and do not expose the narrative step ids.

- [ ] **Step 3: Make `CascadeTimeline` threshold-driven**

Replace the global `ROUTE_TIMES` and `interpolateRoute` signature with:

```ts
function interpolateRoute(progress: number, times: readonly number[], values: readonly number[]) {
  for (let index = 1; index < times.length; index += 1) {
    if (progress <= times[index]) {
      const start = times[index - 1];
      const end = times[index];
      const segmentProgress = smoothstep(Math.min(Math.max((progress - start) / (end - start), 0), 1));
      return values[index - 1] + (values[index] - values[index - 1]) * segmentProgress;
    }
  }
  return values.at(-1) ?? 0;
}
```

Extend the props with `thresholds: readonly number[]`, throw `new Error('CascadeTimeline requires five thresholds')` whenever `thresholds.length !== 5`, and compute:

```tsx
const routeTimes = [
  0,
  thresholds[0] - 0.02,
  thresholds[0] + 0.02,
  thresholds[1] - 0.02,
  thresholds[1] + 0.02,
  thresholds[2] - 0.02,
  thresholds[2] + 0.02,
  thresholds[3] - 0.02,
  thresholds[3] + 0.02,
  thresholds[4] - 0.02,
  thresholds[4] + 0.02,
  0.93,
  1,
] as const;

const x = useTransform(() => {
  const { spineX } = geometry.get();
  return interpolateRoute(progress.get(), routeTimes, [0, 0, spineX, spineX, spineX, spineX, spineX, spineX, spineX, spineX, spineX, spineX, 0]);
});
const y = useTransform(() => {
  const { nodeY } = geometry.get();
  return interpolateRoute(progress.get(), routeTimes, [
    0,
    0,
    nodeY[0] ?? 0,
    nodeY[0] ?? 0,
    nodeY[1] ?? 0,
    nodeY[1] ?? 0,
    nodeY[2] ?? 0,
    nodeY[2] ?? 0,
    nodeY[3] ?? 0,
    nodeY[3] ?? 0,
    nodeY[4] ?? 0,
    nodeY[4] ?? 0,
    0,
  ]);
});
const scale = useTransform(
  progress,
  [0, thresholds[0] - 0.02, thresholds[0] + 0.02, 0.93, 1],
  [0.75, 0.75, 1, 1, 0.75],
  { ease: smoothstep },
);
```

Import `smoothstep` from `story-motion`. Keep all existing `ResizeObserver`, offset-parent measurement, connector width, path, node, and `data-story-primary-pulse` code unchanged. Repeated node values make every plateau motionless; the pulse moves only inside each centered `0.04` step window and during the explicit `0.93–1.00` return.

- [ ] **Step 4: Map Operations to five cumulative facts**

Change `OperationRow` to receive `threshold` and `stepId`, call `useStepReveal(progress, threshold)`, and render:

```tsx
<motion.li
  data-story-step={stepId}
  data-story-cascade-stage={title}
  style={{ opacity: reveal.opacity, x: reveal.offset }}
>
```

Remove every `start` property from the existing five row objects. Define the ids and pass each row its corresponding threshold in the existing render loop:

```ts
const operationSteps = ['sale', 'inventory', 'reorder', 'crm', 'team'] as const;
```

```tsx
{rows.map((row, index) => (
  <OperationRow
    key={row.title}
    {...row}
    progress={progress}
    stepId={operationSteps[index]}
    threshold={scene.stepThresholds[index]}
  />
))}
```

Pass `thresholds={scene.stepThresholds}` to `CascadeTimeline`. Keep the exact five product facts and Premium marker; do not reintroduce a claim about a fixed number of systems.

Under `{STORY_FIXTURE.total} · ahora` in the Operations panel header, add:

```tsx
<p data-payment-reference className="mt-1 text-[0.625rem] text-neutral-500">
  Referencia {STORY_FIXTURE.paymentReference}
</p>
```

- [ ] **Step 5: Map Finance to the same payment reference**

Change `FinanceStage` from `start` to `threshold` and `stepId`, use `useStepReveal`, and remove every `start` property from the existing five stage objects. Define:

```ts
const financeSteps = ['payment', 'cost', 'settlement', 'reconciliation', 'policy'] as const;
```

In the existing `stages.map`, pass `stepId={financeSteps[index]}` and `threshold={scene.stepThresholds[index]}` to `FinanceStage` alongside `stage`, `progress`, and `index`.

Replace the hardcoded panel reference with:

```tsx
Referencia {STORY_FIXTURE.paymentReference}
```

Pass `thresholds={scene.stepThresholds}` to `CascadeTimeline`. Preserve `Liquidación esperada`, `Póliza` as Premium, the exact `scene.body`, and all existing financial qualification copy.

- [ ] **Step 6: Update Finance's stale range and run route geometry regressions**

In `home-scrollytelling.spec.ts`, replace the Finance sample `0.61 + 0.54 * (0.75 - 0.61)` with `0.61 + 0.54 * (0.76 - 0.61)` and replace any other Finance helper end of `0.75` with `0.76`; preserve every pulse-to-node and in-panel tolerance.

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "dos cascadas"
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "un solo pulso primario|venta coherente"
```

Expected: PASS; each route visits five measured nodes, stays on node five through the result/hold, and returns only during exit.

- [ ] **Step 7: Commit the cumulative cascades**

```bash
git add src/components/interactive/home-story/CascadeTimeline.tsx src/components/interactive/home-story/scenes/OperationsScene.tsx src/components/interactive/home-story/scenes/FinanceScene.tsx tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "feat(homepage): accumulate operation and finance steps"
```

---

### Task 6: Establish branch-to-AI evidence continuity

**Files:**
- Modify: `src/components/interactive/home-story/scenes/MultibranchScene.tsx`
- Modify: `src/components/interactive/home-story/scenes/AiScene.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- Consumes: `STORY_FIXTURE.organizationTicket`, `comparisonVenueTicket`, `comparisonVenueTicketChange`, `product`, and `stockAfter`.
- Produces: a visible Norte comparison before the AI question, exact question/answer continuity, and result-gated IA actions.

- [ ] **Step 1: Add the failing continuity and action-gating test**

Append:

```ts
test('Sucursales prueba el dato que IA explica después', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  await scrollStorySceneTo(page, 'multibranch', 0.72);
  const branches = page.locator('[data-story-scene="multibranch"][data-active="true"]');
  await expect(branches.locator('[data-story-step="north-selector"]')).toContainText('Sucursal Norte');
  await expect(branches.locator('[data-branch-breadcrumb]')).toHaveText('Estudio Lumina → Sucursal Norte');
  await expect(branches.locator('[data-branch-ticket]')).toHaveText('Ticket $184 · -8%');

  await scrollStorySceneTo(page, 'ai', 0.55);
  const ai = page.locator('[data-story-scene="ai"][data-active="true"]');
  await expect(ai.locator('[data-story-step="question"]')).toContainText('¿Qué sucursal bajó su ticket y qué debo reordenar?');
  await expect(ai.locator('[data-story-step="answer"]')).toContainText('Sucursal Norte bajó su ticket a $184 (-8%).');
  expect(await ai.locator('.story-frame-actions').evaluate(element => element.inert)).toBe(true);

  await scrollStorySceneTo(page, 'ai', 0.86);
  expect(await ai.locator('.story-frame-actions').evaluate(element => element.inert)).toBe(false);
  await expect(ai.locator('[data-narrative-result]')).toHaveCSS('opacity', '1');

  await page.reload();
  await expect.poll(async () => page.locator('[data-story-mode="animated"]').getAttribute('data-active-scene')).toBe('ai');
  const restoredActions = page.locator('[data-story-scene="ai"][data-active="true"] .story-frame-actions');
  expect(await restoredActions.evaluate(element => element.inert)).toBe(false);
});
```

- [ ] **Step 2: Run the continuity test and verify it fails**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "Sucursales prueba"
```

Expected: FAIL because the current branch panel does not show Norte's `$184 · -8%` evidence and IA actions are not tied to the result phase.

- [ ] **Step 3: Remap Multibranch into five cumulative states**

Import `useStepReveal`, destructure the five scene thresholds, and use these exact ids:

```ts
const branchSteps = ['center', 'roma', 'north', 'dashboard', 'north-selector'] as const;
```

Map Centro, Roma, and Norte hierarchy rows to the first three reveals and add `data-story-step={branchSteps[index]}` to each of those three existing row roots. Map the dashboard transformation to `dashboardAt`, add the single hook `data-story-step="dashboard"` to its existing outer dashboard root, and keep its transform scrubbed within `stepWindow(dashboardAt)`. Map the explicit Norte selection to the last reveal. Do not put a second step hook on an inner label. When `north-selector` reaches completion, retain:

```tsx
<motion.div
  data-story-step="north-selector"
  style={{ opacity: northSelection.opacity, y: northSelection.offset }}
>
  <p data-branch-breadcrumb>
    {STORY_FIXTURE.organization} → Sucursal Norte
  </p>
  <p data-branch-ticket>
    Ticket {STORY_FIXTURE.comparisonVenueTicket} · {STORY_FIXTURE.comparisonVenueTicketChange}
  </p>
</motion.div>
```

Before that selection, the organization dashboard continues to show `Ticket {STORY_FIXTURE.organizationTicket}`. Use a scroll-scrubbed opacity crossfade in `stepWindow(northSelectorAt)`; do not replace either value with React state or a timer. Preserve the existing organization/venue hierarchy and panel geometry; `scene.body` remains its single semantic summary.

- [ ] **Step 4: Remap IA and use only facts already shown**

Import `useStepReveal`, bind `questionAt`, `answerAt`, and `contextAt`, and apply:

```tsx
data-story-step="question" style={{ opacity: question.opacity, y: question.offset }}
data-story-step="answer"   style={{ opacity: answer.opacity, y: answer.offset }}
data-story-step="context"  style={{ opacity: context.opacity, y: context.offset }}
```

Use the exact question:

```text
¿Qué sucursal bajó su ticket y qué debo reordenar?
```

Use the exact answer assembled from fixture values:

```tsx
{`Sucursal Norte bajó su ticket a ${STORY_FIXTURE.comparisonVenueTicket} (${STORY_FIXTURE.comparisonVenueTicketChange}). ${STORY_FIXTURE.product} quedó en ${STORY_FIXTURE.stockAfter} piezas y tiene un reorden sugerido.`}
```

The context block keeps `Contexto conectado` and the current ChatGPT/Claude labels. Remove any scene-local opacity or timing from the CTA wrapper; pass actions only through `SceneFrame`, so `NarrativeAnchor` reveals and enables them during `0.73–0.84`.

Inside the `data-story-step="context"` block, replace the secondary `Pregunta y actúa` label with:

```tsx
<span data-payment-reference className="shrink-0 text-[0.625rem] font-semibold uppercase tracking-[0.12em] opacity-60">
  Referencia {STORY_FIXTURE.paymentReference}
</span>
```

Keep the `answer` variable as the exact fixture-composed string above. Remove the old inline `accessibleSummary`; `scene.body` is the semantic summary and the fixture-composed answer remains the visible proof.

Append this continuity assertion to the test from Step 1 after the IA result checks:

```ts
for (const sceneId of ['aftercare', 'operations', 'finance', 'ai'] as const) {
  await scrollStorySceneTo(page, sceneId, 0.72);
  await expect(page.locator(`[data-story-scene="${sceneId}"]`)).toContainText('AVQ-34810');
}
```

- [ ] **Step 5: Run continuity, claims, CTA, and final-scene tests**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "Sucursales prueba"
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "historia completa|control multi-sucursal|pregunta accionable|asistente"
```

Expected: PASS; Norte's comparison precedes the question, the answer uses only established facts, the MCP claim remains read-context only, and IA actions are unavailable before the result.

- [ ] **Step 6: Commit the branch-to-AI continuity**

```bash
git add src/components/interactive/home-story/scenes/MultibranchScene.tsx src/components/interactive/home-story/scenes/AiScene.tsx tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "feat(homepage): connect branch evidence to ai"
```

---

### Task 7: Replace global snap-like fades with local pacing

**Files:**
- Modify: `src/components/interactive/home-story/StoryLayer.tsx`
- Modify: `src/components/interactive/home-story/AnimatedStory.tsx`
- Modify: `src/components/interactive/home-story/StoryProgress.tsx`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- Consumes: the approved scene ranges and `STORY_PHASES.layerEnter/hold/exit`.
- Produces: local relative scene fades, `900vh/1000vh` duration, a real Service milestone, one active/inert layer, and unchanged analytics.

- [ ] **Step 1: Add failing duration, layer, rail, and plateau assertions**

Extend the helper import in `home-narrative-hierarchy.spec.ts` to include `scrollStoryGlobalTo`, then append:

```ts
test('usa 9/10 viewports y transiciones relativas a cada escena', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const root = page.locator('[data-story-mode="animated"]');

  expect(await root.evaluate(element => element.offsetHeight / window.innerHeight)).toBeCloseTo(10, 1);
  await scrollStorySceneTo(page, 'operations', 0.03);
  const entering = root.locator('[data-story-scene="operations"]');
  const enteringOpacity = await entering.evaluate(node => Number.parseFloat(getComputedStyle(node).opacity));
  expect(enteringOpacity).toBeGreaterThan(0.20);
  expect(enteringOpacity).toBeLessThan(0.80);

  await scrollStorySceneTo(page, 'operations', 0.50);
  await expect(root).toHaveAttribute('data-active-scene', 'operations');
  await expect(root.locator('[data-story-scene][data-active="true"]')).toHaveCount(1);
  await expect(root.locator('[data-story-scene][aria-hidden="false"]')).toHaveCount(1);
  expect(await root.locator('[data-story-scene][data-active="false"]').evaluateAll(nodes => (
    nodes.every(node => (node as HTMLElement).inert)
  ))).toBe(true);

  const rail = page.getByRole('navigation', { name: 'Progreso de la historia' });
  await expect(rail).toContainText('Servicio');
  await expect(rail).not.toContainText('Entrada');
});

test('mantiene estados estables dentro de intro, demo y resultado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  const demoPlateaus = {
    service: [0.34, 0.39],
    payment: [0.36, 0.46],
    aftercare: [0.36, 0.46],
    operations: [0.33, 0.37],
    finance: [0.33, 0.37],
    multibranch: [0.33, 0.37],
    ai: [0.36, 0.48],
  } as const;

  for (const scene of STORY_SCENES) {
    const samples = [
      [0.08, 0.14],
      demoPlateaus[scene.id],
      [0.85, 0.91],
    ] as const;
    for (const [first, second] of samples) {
      await scrollStorySceneTo(page, scene.id, first);
      const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
      const before = await root.evaluate(element => ({
        title: element.querySelector('[data-narrative-title]')?.textContent,
        resultVisible: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity) >= 0.95,
        completeSteps: Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]'))
          .filter(node => Number.parseFloat(getComputedStyle(node).opacity) >= 0.95)
          .map(node => node.dataset.storyStep),
      }));
      await scrollStorySceneTo(page, scene.id, second);
      const after = await root.evaluate(element => ({
        title: element.querySelector('[data-narrative-title]')?.textContent,
        resultVisible: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity) >= 0.95,
        completeSteps: Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]'))
          .filter(node => Number.parseFloat(getComputedStyle(node).opacity) >= 0.95)
          .map(node => node.dataset.storyStep),
      }));
      expect(after).toEqual(before);
    }
  }
});

test('termina todos los pasos antes de introducir el resultado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const scene of STORY_SCENES) {
    await scrollStorySceneTo(page, scene.id, 0.72);
    const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
    const before = await root.locator('[data-story-step]').evaluateAll(nodes => nodes.map(node => (
      Number.parseFloat(getComputedStyle(node).opacity).toFixed(3)
    )));
    await scrollStorySceneTo(page, scene.id, 0.74);
    const after = await root.locator('[data-story-step]').evaluateAll(nodes => nodes.map(node => (
      Number.parseFloat(getComputedStyle(node).opacity).toFixed(3)
    )));
    expect(after).toEqual(before);
    expect(await root.locator('[data-narrative-result]').evaluate(node => (
      Number.parseFloat(getComputedStyle(node).opacity)
    ))).toBeGreaterThan(0);
  }
});

test('registra una sola vez la historia completa aunque el usuario regrese', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await page.evaluate(() => { window.dataLayer = []; });

  await scrollStoryGlobalTo(page, 0.91);
  await scrollStoryGlobalTo(page, 0.70);
  await scrollStoryGlobalTo(page, 0.95);

  const completions = await page.evaluate(() => (window.dataLayer ?? []).filter(entry => (
    typeof entry === 'object'
    && entry !== null
    && 'event' in entry
    && entry.event === 'homepage_story_complete'
  )));
  expect(completions).toHaveLength(1);
});
```

- [ ] **Step 2: Run the pacing tests and verify they fail**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "9/10 viewports|estados estables|todos los pasos|una sola vez"
```

Expected: FAIL because the story is `800vh`, the layer fade uses a global `0.018` window, and the progress rail filters for the nonexistent `entry` scene.

- [ ] **Step 3: Make `StoryLayer` relative and remove its competing translation**

Replace the current global-progress opacity and `y` blocks with:

```tsx
const opacityInput = index === 0
  ? [0, 0.93, 1]
  : index === total - 1
    ? [0, 0.07, 1]
    : [0, 0.07, 0.93, 1];
const opacityOutput = index === 0
  ? [1, 1, 0]
  : index === total - 1
    ? [0, 1, 1]
    : [0, 1, 1, 0];
const opacity = useTransform(localProgress, opacityInput, opacityOutput, { ease: smoothstep });
```

Import `smoothstep` from `story-motion`. Remove `preservesCascadeDock`, the layer-level `y` transform, and `y` from the section style. Keep `localProgress`, simultaneous mounting, `data-active`, `aria-hidden`, `inert`, and active-only pointer events:

```tsx
style={{ opacity, pointerEvents: active ? 'auto' : 'none' }}
```

The only copy/visual movement now belongs to `NarrativeAnchor`, each product demonstration, and the local exit—not to the whole layer.

- [ ] **Step 4: Increase the narrative distance and restore the first milestone**

In `AnimatedStory.tsx`, replace the root classes with:

```tsx
className="relative h-[900vh] bg-neutral-950 lg:h-[1000vh]"
```

Do not change the sticky top/height, `useScroll` offsets, active-index logic, or the one-shot `homepage_story_complete` event at `0.9`.

In `StoryProgress.tsx`, replace the filter with:

```ts
const milestones = STORY_SCENES.filter(scene => (
  ['service', 'payment', 'operations', 'multibranch', 'ai'].includes(scene.id)
));
```

- [ ] **Step 5: Replace every stale range literal in existing E2E helpers**

Use this exact mapping in `home-scrollytelling.spec.ts`; keep the same local checkpoints and assertions:

```text
Service      0.00–0.14 → 0.00–0.15
Payment      0.13–0.30 → 0.14–0.30
Aftercare    0.29–0.44 → 0.29–0.44 (unchanged)
Operations   0.43–0.62 → 0.43–0.62 (unchanged)
Finance      0.61–0.75 → 0.61–0.76
Multibranch  0.74–0.90 → 0.75–0.90
AI           0.89–1.00 → 0.89–1.00 (unchanged)
```

Tasks 4 and 5 already update the Service, Payment, and Finance helpers. In this task, update every remaining Multibranch helper that begins at `0.74` to begin at `0.75`.

In the existing primary-pulse handoff test, keep `readCascadePulse(0.525, 'operations')` for the active routed sample. Replace the two separate dock reads at `0.606/0.613` with one shared global handoff:

```ts
await scrollStoryGlobalTo(page, 0.62);
const readDock = async (sceneId: 'operations' | 'finance') => {
  const pulse = root.locator(`[data-story-scene="${sceneId}"] [data-story-primary-pulse]`);
  return pulse.evaluate(element => {
    const rect = element.getBoundingClientRect();
    return {
      center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
      inlineTop: (element as HTMLElement).style.top,
    };
  });
};
const operationsDock = await readDock('operations');
const financeDock = await readDock('finance');
```

Import `scrollStoryGlobalTo` into `home-scrollytelling.spec.ts`, keep the existing `≤4px` center-distance assertion and empty `inlineTop` assertions, and do not require either dock layer to be active at the shared boundary. Then run this stale-literal guard:

```bash
if rg -n "localProgress \* 0\\.14|0\\.13 \+ localProgress|0\\.75 - 0\\.61|0\\.74 \+" tests/e2e/home-scrollytelling.spec.ts; then echo 'Stale story range literal'; exit 1; fi
```

- [ ] **Step 6: Run pacing, active-layer, analytics, and rail regressions**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "9/10 viewports|estados estables|todos los pasos|una sola vez"
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --grep "activa escenas|historia completa|un solo pulso primario"
```

Expected: PASS; changes span meaningful local scroll windows, only one layer is interactive, and the existing completion event still fires once.

- [ ] **Step 7: Commit global pacing**

```bash
git add src/components/interactive/home-story/StoryLayer.tsx src/components/interactive/home-story/AnimatedStory.tsx src/components/interactive/home-story/StoryProgress.tsx tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "feat(homepage): slow narrative pacing"
```

---

### Task 8: Complete static evidence, responsive hierarchy, input QA, and final-arrow regression

**Files:**
- Create: `src/components/interactive/home-story/StoryStaticEvidence.tsx`
- Modify: `src/components/interactive/home-story/ReducedMotionStory.tsx`
- Modify: `src/components/interactive/home-story/home-story.css`
- Modify: `tests/e2e/home-scrollytelling.spec.ts`
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`

**Interfaces:**
- Produces: semantic final-state evidence in static/no-JS modes and deterministic responsive rules using the scene classes already present.
- Verifies: the seven required viewports at intro/demo/result, reverse traversal, fast wheel, small wheel, Page Down, console/hydration health, and the independent illustrated FAQ arrow.

- [ ] **Step 1: Add a failing final-evidence assertion for static modes**

Add this exact top-level evidence contract beside `staticTruth`:

```ts
const staticEvidence = {
  service: ['Reserva confirmada', 'María G. · 11:30', 'Facial hidratante · Ana Torres · Sucursal Centro'],
  payment: ['TPV reconocido', 'Cuenta de cobro', 'Operación diaria seleccionada manualmente'],
  aftercare: ['Recibo AVQ-34810 enviado', 'Reseña disponible', 'Facturación disponible cuando la sucursal la configura'],
  operations: ['Venta AVQ-34810 registrada', 'Inventario −1', 'Reorden sugerido', 'CRM y lealtad actualizado', 'Comisión de equipo registrada'],
  finance: ['Pago AVQ-34810', 'Costo calculado', 'Liquidación esperada', 'Conciliación ligada', 'Póliza Premium'],
  multibranch: ['Estudio Lumina → Sucursal Norte', 'Ticket $184 · -8%'],
  ai: ['Contexto AVQ-34810', 'Pregunta sobre ticket y reorden', 'Sucursal Norte · $184 · -8%', 'Crema facial 50 ml · 7 piezas · reorden sugerido'],
} as const;
```

Then extend the reduced/no-JS test from Task 1 by placing this assertion **inside its `for (const ... of staticTruth)` loop**, immediately after the existing `data-narrative-result` assertion while the block-scoped `scene` and union-typed `id` are still available:

```ts
await expect(scene.locator('[data-story-static-evidence]')).toHaveCount(1);
await expect(scene.locator('[data-story-static-evidence] li')).toHaveText([...staticEvidence[id]]);
```

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-reduced --project=chromium-nojs --grep "narrativa completa"
```

Expected: FAIL because reduced/no-JS currently includes copy but no semantic final product evidence.

- [ ] **Step 2: Implement exact static final-state evidence**

Create `StoryStaticEvidence.tsx`:

```tsx
import type { StorySceneId } from './story';
import { STORY_FIXTURE } from './story-fixture';

const STATIC_EVIDENCE: Record<StorySceneId, readonly string[]> = {
  service: ['Reserva confirmada', `${STORY_FIXTURE.customer} · ${STORY_FIXTURE.appointmentTime}`, `${STORY_FIXTURE.service} · ${STORY_FIXTURE.staff} · ${STORY_FIXTURE.venue}`],
  payment: ['TPV reconocido', 'Cuenta de cobro', 'Operación diaria seleccionada manualmente'],
  aftercare: [`Recibo ${STORY_FIXTURE.paymentReference} enviado`, 'Reseña disponible', 'Facturación disponible cuando la sucursal la configura'],
  operations: [`Venta ${STORY_FIXTURE.paymentReference} registrada`, 'Inventario −1', 'Reorden sugerido', 'CRM y lealtad actualizado', 'Comisión de equipo registrada'],
  finance: [`Pago ${STORY_FIXTURE.paymentReference}`, 'Costo calculado', 'Liquidación esperada', 'Conciliación ligada', 'Póliza Premium'],
  multibranch: [`${STORY_FIXTURE.organization} → Sucursal Norte`, `Ticket ${STORY_FIXTURE.comparisonVenueTicket} · ${STORY_FIXTURE.comparisonVenueTicketChange}`],
  ai: [`Contexto ${STORY_FIXTURE.paymentReference}`, 'Pregunta sobre ticket y reorden', `Sucursal Norte · ${STORY_FIXTURE.comparisonVenueTicket} · ${STORY_FIXTURE.comparisonVenueTicketChange}`, `${STORY_FIXTURE.product} · ${STORY_FIXTURE.stockAfter} piezas · reorden sugerido`],
};

export default function StoryStaticEvidence({ sceneId }: { sceneId: StorySceneId }) {
  return (
    <ul data-story-static-evidence className="mt-7 grid gap-2 text-sm sm:grid-cols-2">
      {STATIC_EVIDENCE[sceneId].map(item => (
        <li key={item} className="rounded-xl border border-neutral-500/20 px-4 py-3">
          {item}
        </li>
      ))}
    </ul>
  );
}
```

Import it in `ReducedMotionStory.tsx` and render `<StoryStaticEvidence sceneId={scene.id} />` directly after `data-narrative-result` in every scene. Do not animate it and do not duplicate it in the animated root.

- [ ] **Step 3: Add the responsive matrix test before changing CSS**

Append:

```ts
const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 910, height: 691 },
  { width: 887, height: 502 },
  { width: 787, height: 701 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
] as const;

test('mantiene jerarquía, saltos y límites en la matriz narrativa', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  test.setTimeout(180_000);

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/?motion=full');
    await page.evaluate(async () => { await document.fonts.ready; });
    expect(await page.locator('[data-story-mode="animated"]').evaluate(element => (
      element.offsetHeight / window.innerHeight
    ))).toBeCloseTo(viewport.width >= 1024 ? 10 : 9, 1);

    for (const scene of STORY_SCENES) {
      let titleInvariant: { text: string | null; fontSize: number; width: number; height: number; lines: number } | undefined;
      for (const progress of [0.10, 0.55, 0.86]) {
        await scrollStorySceneTo(page, scene.id, progress);
        const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
        const geometry = await root.evaluate(element => {
          const stageRect = element.getBoundingClientRect();
          const withinStage = (rect: DOMRect) => ({
            horizontal: rect.left >= stageRect.left - 1 && rect.right <= stageRect.right + 1,
            vertical: rect.top >= stageRect.top - 1 && rect.bottom <= stageRect.bottom + 1,
          });
          const isMeasurable = (node: HTMLElement) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return style.display !== 'none'
              && style.visibility !== 'hidden'
              && rect.width > 0.5
              && rect.height > 0.5;
          };
          const isVisiblyRendered = (node: HTMLElement) => (
            isMeasurable(node) && Number.parseFloat(getComputedStyle(node).opacity) > 0.05
          );
          const title = element.querySelector<HTMLElement>('[data-narrative-title]')!;
          const range = document.createRange();
          range.selectNodeContents(title);
          const titleRect = title.getBoundingClientRect();
          const visual = element.querySelector<HTMLElement>('[data-narrative-visual]')!;
          const visualRect = visual.getBoundingClientRect();
          const result = element.querySelector<HTMLElement>('[data-narrative-result]')!;
          const resultRect = result.getBoundingClientRect();
          const steps = Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]'));
          const visibleStepsInside = steps
            .filter(isVisiblyRendered)
            .map(node => withinStage(node.getBoundingClientRect()));
          const panels = Array.from(element.querySelectorAll<HTMLElement>('[data-story-panel]'))
            .filter(isMeasurable);
          const visualChildren = Array.from(visual.children)
            .filter((node): node is HTMLElement => node instanceof HTMLElement)
            .filter(isMeasurable);
          const contentNodes = panels.length > 0 ? panels : visualChildren;
          return {
            documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            title: {
              text: title.textContent,
              fontSize: Number.parseFloat(getComputedStyle(title).fontSize),
              width: title.offsetWidth,
              height: title.offsetHeight,
              lines: range.getClientRects().length,
            },
            titleInside: withinStage(titleRect),
            visualInside: withinStage(visualRect),
            resultInside: withinStage(resultRect),
            contentInside: contentNodes.map(node => withinStage(node.getBoundingClientRect())),
            stepCount: steps.length,
            visibleStepsInside,
            visualOpacity: Number.parseFloat(getComputedStyle(visual).opacity),
            resultOpacity: Number.parseFloat(getComputedStyle(result).opacity),
          };
        });
        expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
        expect(geometry.titleInside).toEqual({ horizontal: true, vertical: true });
        expect(geometry.visualInside).toEqual({ horizontal: true, vertical: true });
        expect(geometry.contentInside.length).toBeGreaterThan(0);
        expect(geometry.contentInside.every(bounds => bounds.horizontal && bounds.vertical)).toBe(true);
        expect(geometry.visibleStepsInside.every(bounds => bounds.horizontal && bounds.vertical)).toBe(true);
        if (viewport.width < 768) expect(geometry.title.fontSize).toBeGreaterThanOrEqual(36);
        if (progress === 0.10) expect(geometry.visualOpacity).toBeLessThanOrEqual(0.15);
        if (progress === 0.86) {
          expect(geometry.resultOpacity).toBeGreaterThanOrEqual(0.95);
          expect(geometry.resultInside).toEqual({ horizontal: true, vertical: true });
          expect(geometry.stepCount).toBe(scene.stepThresholds.length);
          expect(geometry.visibleStepsInside).toHaveLength(geometry.stepCount);
        }
        titleInvariant ??= geometry.title;
        expect(geometry.title).toEqual(titleInvariant);
      }
    }

    await scrollStorySceneTo(page, 'ai', 0.86);
    const activeAi = page.locator('[data-story-scene="ai"][data-active="true"]');
    const actions = activeAi.locator('.story-frame-actions a');
    const stageBox = await activeAi.boundingBox();
    expect(stageBox).not.toBeNull();
    await expect(actions).toHaveCount(2);
    for (const action of await actions.all()) {
      const box = await action.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(stageBox!.x - 1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(stageBox!.x + stageBox!.width + 1);
      expect(box!.y).toBeGreaterThanOrEqual(stageBox!.y - 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height + 1);
    }
  }
});
```

Run the new matrix before applying the CSS changes:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "matriz narrativa"
```

Expected: FAIL in at least one compact/tablet checkpoint because the current frame rules do not yet guarantee vertical containment or two 44px final actions across the full matrix.

- [ ] **Step 4: Apply deterministic tablet and compact-mobile rules**

Append these exact CSS rules after the base narrative rules. Retain the existing scene-specific compact selectors for `.story-service-*`, `.story-payment-*`, and `.story-aftercare-*`; they already hide only secondary details at `320×568`:

```css
.story-frame-actions a,
.story-frame-actions button {
  min-height: 44px;
}

@media (min-width: 768px) and (max-width: 1023px) {
  .story-frame-grid {
    grid-template-rows: minmax(210px, 36fr) minmax(0, 64fr);
    gap: 0.75rem;
    padding: 1.25rem 2.5rem 1.5rem;
  }

  .story-narrative-title {
    max-width: 13ch;
    font-size: clamp(2rem, 5.5vw, 3.25rem);
  }
}

@media (max-width: 767px) {
  .story-frame-grid {
    padding-left: max(1.5rem, env(safe-area-inset-left));
    padding-right: max(1.5rem, env(safe-area-inset-right));
  }

  .story-frame-visual {
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }
}

@media (max-width: 479px) and (max-height: 640px) {
  .story-narrative-meta {
    height: 0.75rem;
  }

  .story-narrative-result strong {
    font-size: 0.875rem;
    line-height: 1.25;
  }

  .story-frame-actions > div {
    grid-template-columns: 1fr 1fr;
    gap: 0.5rem;
  }
}
```

Do not reduce the title below `36px`, the CTA below `44px`, or remove any causal product step. If a current scene-specific CSS rule conflicts, replace that rule with these values instead of adding `!important` beyond the two explicit compact selectors above.

- [ ] **Step 5: Add reverse-order and input-method tests**

Extend the helper import at the top of `home-narrative-hierarchy.spec.ts` to:

```ts
import { scrollStoryGlobalTo, scrollStorySceneTo, settleFrames } from './helpers/home-story-scroll';
```

Then append:

```ts
test('reproduce el mismo recorrido al subir', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const sequence = [0.10, 0.50, 0.86, 0.50, 0.10] as const;

  for (const scene of STORY_SCENES) {
    const snapshots: Array<{ thread: string; result: string; steps: string[] }> = [];
    for (const progress of sequence) {
      await scrollStorySceneTo(page, scene.id, progress);
      snapshots.push(await page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`).evaluate(element => ({
        thread: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-thread]')!).opacity).toFixed(3),
        result: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity).toFixed(3),
        steps: Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]')).map(node => (
          Number.parseFloat(getComputedStyle(node).opacity).toFixed(3)
        )),
      })));
    }
    for (const snapshot of snapshots) {
      expect(snapshot.steps).toHaveLength(scene.stepThresholds.length);
    }
    expect(snapshots[3]).toEqual(snapshots[1]);
    expect(snapshots[4]).toEqual(snapshots[0]);
  }
});

test('tolera rueda lenta, rueda rápida y Page Down sin errores', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?motion=full');

  const root = page.locator('[data-story-mode="animated"]');
  await root.evaluate(element => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    element.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
  await settleFrames(page);
  const sceneIds = STORY_SCENES.map(scene => scene.id);
  const activeIndex = async () => sceneIds.indexOf(
    (await root.getAttribute('data-active-scene')) as (typeof sceneIds)[number],
  );
  const expectSingleActiveLayer = async () => {
    await expect(root.locator('[data-story-scene][data-active="true"]')).toHaveCount(1);
  };
  const scrollY = () => page.evaluate(() => window.scrollY);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Missing viewport for wheel-input test');
  await page.mouse.move(viewport.width / 2, viewport.height / 2);

  const start = await activeIndex();
  expect(start).toBeGreaterThanOrEqual(0);
  const beforeSmallWheelY = await scrollY();
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, 80);
    await settleFrames(page);
  }
  await expect.poll(scrollY).toBeGreaterThan(beforeSmallWheelY);
  await expect.poll(activeIndex).toBeGreaterThanOrEqual(start);
  await expectSingleActiveLayer();

  const afterSmallWheel = await activeIndex();
  const beforeFastWheelY = await scrollY();
  await page.mouse.wheel(0, 1400);
  await settleFrames(page);
  await expect.poll(scrollY).toBeGreaterThan(beforeFastWheelY);
  await expect.poll(activeIndex).toBeGreaterThan(afterSmallWheel);
  await expectSingleActiveLayer();

  const afterFastWheel = await activeIndex();
  const beforePageDownY = await scrollY();
  await page.keyboard.press('PageDown');
  await settleFrames(page);
  await expect.poll(scrollY).toBeGreaterThan(beforePageDownY);
  await expect.poll(activeIndex).toBeGreaterThanOrEqual(afterFastWheel);
  await expectSingleActiveLayer();

  const forwardPeak = await activeIndex();
  const beforeReverseY = await scrollY();
  await page.mouse.wheel(0, -1400);
  await settleFrames(page);
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, -80);
    await settleFrames(page);
  }
  await expect.poll(scrollY).toBeLessThan(beforeReverseY);
  await expect.poll(activeIndex).toBeLessThan(forwardPeak);
  await expectSingleActiveLayer();

  expect(await root.getAttribute('data-active-scene')).not.toBeNull();
  expect(errors).toEqual([]);
});

test('conserva navegación, CTAs, footer, chatbot y aislamiento de demo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await expect(page.locator('[data-site-navigation]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Agenda por WhatsApp' })).toHaveAttribute('href', /\/wa\?src=hero_demo/);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Abrir chat de ayuda' })).toHaveCount(1);

  await scrollStorySceneTo(page, 'ai', 0.86);
  const aiActions = page.locator('[data-story-scene="ai"][data-active="true"] .story-frame-actions');
  await expect(aiActions.getByRole('link', { name: 'Quiero verlo en mi negocio' })).toHaveAttribute('href', /\/wa\?src=homepage_story_final/);
  await expect(aiActions.getByRole('link', { name: 'Comienza gratis' })).toHaveAttribute('href', 'https://dashboard.avoqado.io/signup');

  await page.goto('/demo');
  await expect(page).toHaveURL(/\/demo\/?$/);
  await expect(page.locator('[data-story-mode], [data-opening-mode]')).toHaveCount(0);
});
```

- [ ] **Step 6: Protect the independent final illustrated invitation**

Add this structural assertion to the existing `recupera el cierre ilustrado` test:

```ts
expect(await page.locator('#faq-section').evaluate(element => (
  element.previousElementSibling?.matches('main[data-scrollytelling]') === true
))).toBe(true);
```

In `home-scrollytelling.spec.ts`, extend the shared helper import to include all three helpers used by the final regressions:

```ts
import { scrollStoryGlobalTo, scrollStorySceneTo, settleFrames } from './helpers/home-story-scroll';
```

Keep the existing exact reverse test (`0.20 → 0.50 → 0.92 → 0.50 → 0.20`) and its arrow/circle dash assertions. At the final `0.20`, the portal remains mounted but fully undrawn: the arrow has zero dash/opacity, while the circle has zero dash (its SVG node does not own an opacity transform). Then leave the FAQ by returning to the AI scene and only there assert unmounting:

```ts
await expect(page.locator('[data-chatbot-invitation-arrow]')).toHaveCount(1);
await expect(page.locator('[data-chatbot-invitation-circle]')).toHaveCount(1);
await expect(page.locator('[data-chatbot-invitation-arrow]')).toHaveCSS('opacity', '0');
await expect.poll(async () => page.locator('[data-chatbot-invitation-circle]').evaluate(element => (
  Number.parseFloat(getComputedStyle(element).strokeDasharray)
))).toBe(0);

await scrollStorySceneTo(page, 'ai', 0.94);
await settleFrames(page);
await expect(page.locator('[data-chatbot-invitation-arrow]')).toHaveCount(0);
await expect(page.locator('[data-chatbot-invitation-circle]')).toHaveCount(0);
await expect(page.locator('[data-site-navigation]')).toHaveCSS('opacity', '1');
await expect(page.locator('[data-founders-banner]')).toHaveCSS('opacity', '1');
```

Do not move `#faq-section`, its portal overlay, or `FloatingChatbot` into `HomepageStory` or `AiScene`.

- [ ] **Step 7: Run the full acceptance matrix for this task**

Run:

```bash
npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --project=chromium-reduced --project=chromium-nojs
npx playwright test tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop --project=chromium-mobile --project=chromium-small --project=chromium-reduced --project=chromium-nojs --grep "cierre ilustrado|dibujo del cierre|narrativa|overflow|viewport|responsive|chatbot"
```

Expected: PASS at all seven explicit viewport sizes, in both scroll directions, with every input method, static evidence, no console/hydration error, and a reversible final arrow that exists only in `FAQ`.

- [ ] **Step 8: Commit responsive and static completeness**

```bash
git add src/components/interactive/home-story/StoryStaticEvidence.tsx src/components/interactive/home-story/ReducedMotionStory.tsx src/components/interactive/home-story/home-story.css tests/e2e/home-scrollytelling.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts
git commit -m "test(homepage): verify narrative hierarchy across modes"
```

---

### Task 9: Run final homepage verification and inspect the diff

**Files:**
- Verify only: every file listed above
- Do not modify: `/demo`, Navbar, Footer, FloatingChatbot, backend, payment services, Dashboard, POS, TPV, or MCP

- [ ] **Step 1: Run the complete homepage E2E suite**

Run:

```bash
npx playwright test tests/e2e/home-opening.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts tests/e2e/home-scrollytelling.spec.ts
```

Expected: PASS in every configured Playwright project: desktop, mobile, small, reduced motion, and no-JavaScript.

- [ ] **Step 2: Build the production bundle**

Run:

```bash
npm run build
```

Expected: exit code `0`, with no TypeScript, Astro, hydration, or asset error.

- [ ] **Step 3: Inspect scope and whitespace**

Run:

```bash
git diff --check c295f1d..HEAD
git diff --stat c295f1d..HEAD
git status --short
```

Expected: `git diff --check` prints nothing; the stat contains this committed plan plus only the homepage files and tests enumerated here; status is clean after the task commits.

- [ ] **Step 4: Inspect protected behavior explicitly**

Run:

```bash
if git diff --name-only c295f1d..HEAD | rg '(^|/)(demo|Navbar|Footer|FloatingChatbot|server|dashboard|checkout|ios|mcp)'; then echo 'Protected scope changed'; exit 1; fi
if rg -n "data-story-primary-pulse" src/components/interactive/home-story/scenes/PaymentScene.tsx src/components/interactive/home-story/scenes/AftercareScene.tsx; then echo 'Unexpected pulse in Payment/Aftercare'; exit 1; fi
if rg -n "setTimeout|setInterval|transition=|transition:\\s*\\{" src/components/interactive/home-story src/components/interactive/home-opening/ChannelHandoff.tsx --glob '*.ts' --glob '*.tsx'; then echo 'Unexpected clock-driven narrative transition'; exit 1; fi
```

Expected: all three guards exit `0` without printing a match; protected files are unchanged, Payment/Aftercare contain no primary pulse, and narrative timing contains no timer or Framer duration transition. Existing unrelated CSS transitions outside the changed narrative selectors remain untouched.

- [ ] **Step 5: Record final evidence in the task handoff**

Report the three successful commands, the viewport/mode coverage, the exact branch/commit range, and the preview URL. Do not claim completion unless all required commands have exited `0`; if any command fails, keep the task open and include the failing project, test title, and artifact path.

---
