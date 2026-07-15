# Homepage Copy and Five-Entry Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Explain Avoqado immediately in familiar Spanish, replace internal channel names with five real operation entries, and make five mosaic tiles complete the existing measured handoff without changing the rest of the scrollytelling story.

**Architecture:** Keep the current 17-tile opening, video transition, shared-tile measurement layer, channel ledger, and single reservation route. Add three optimized local image assets, make `OPENING_CHANNELS` the source of truth for all five public entries, and consume the active entry in animated and static summaries. Preserve the existing service-to-AI story scenes except for the shared selected-channel label.

**Tech Stack:** Astro, React, TypeScript, Tailwind CSS, Framer Motion, Playwright, built-in image generation, macOS `sips`.

## Global Constraints

- Work in `/Users/amieva/.codex/worktrees/avoqado-landing/homepage-scrollytelling` on branch `codex/homepage-scrollytelling`.
- Read `docs/superpowers/specs/2026-07-15-homepage-copy-five-entry-handoff-design.md` before implementation.
- Use the `imagegen` skill for the three new raster assets and generate each asset in a separate call.
- Keep the preview available at `http://127.0.0.1:4330/?motion=full`; when a server is not already running, start it with `npm run dev -- --host 127.0.0.1 --port 4330`.
- Do not edit the navbar, footer, chatbot, GTM payloads, CTA destinations, `/demo`, or the seven post-opening scene behaviors.
- Do not overwrite the existing 17 source tile files. The three selected generated outputs receive new descriptive filenames.
- Keep exactly 17 mosaic tiles, exactly five shared-tile sources/targets/overlays, and exactly one active operation route.
- Preserve all endpoint tolerances at `<= 3px`; do not weaken an assertion to make a test pass.
- Preserve the existing untracked `test-results/` directory and any unrelated user changes.

---

### Task 1: Generate and optimize three operation-entry assets

**Files:**

- Create: `src/assets/hero/hero-entry-online-booking.jpg`
- Create: `src/assets/hero/hero-entry-payment-link.jpg`
- Create: `src/assets/hero/hero-entry-point-of-sale.jpg`

- [ ] **Step 1: Generate the online-booking asset**

Use the built-in image-generation tool with no reference image and this complete prompt:

```text
Create one square photorealistic-natural image for a premium Mexican SaaS homepage mosaic. Scene: inside an authentic contemporary beauty salon or wellness clinic in Mexico, a real customer uses a smartphone to book an appointment. The phone is prominent and centered, held naturally with realistic hands; its screen shows a simple recognizable calendar grid and time-slot shapes, but absolutely no readable words, numbers, logos, brand marks, or floating interface elements. A staff member and the warm daylight business interior are softly visible in the background. Premium documentary commercial photography, candid rather than posed, realistic Mexican people and skin texture, warm natural daylight, crisp subject and device, moderate depth of field, enough contrast to remain understandable at a 48 by 40 pixel thumbnail. Safe crop space on all sides. No watermark, no invented branding, no exaggerated stock-photo smile, no distorted hands, no extra fingers, no hidden phone screen. Produce a single image, not a collage or contact sheet.
```

Inspect the returned image at original detail. Reject and regenerate it if the phone action is unclear at thumbnail scale, the screen contains legible text or branding, or either hand is malformed.

- [ ] **Step 2: Generate the payment-link asset**

Use a second independent image-generation call with this complete prompt:

```text
Create one square photorealistic-natural image for a premium Mexican SaaS homepage mosaic. Scene: in an authentic independent Mexican retail or food business, a customer opens a payment link received in a mobile conversation. The smartphone and the clear link-to-payment action are the centered visual focus, held naturally with realistic hands; the screen may show abstract message bubbles and one obvious payment-link card or button shape, but absolutely no readable private messages, no WhatsApp branding, no logos, no words, no numbers, and no floating interface outside the device. The business counter is visible but secondary. Premium documentary commercial photography, candid natural interaction, realistic Mexican people and materials, warm daylight, crisp phone, moderate depth of field, strong simple silhouette that stays understandable at a 48 by 40 pixel thumbnail. Safe crop space on all sides. No watermark, no invented branding, no exaggerated stock-photo smile, no distorted hands, no extra fingers, no obscured device. Produce a single image, not a collage or contact sheet.
```

Inspect the returned image at original detail. Reject and regenerate it if it resembles a generic social-media screenshot, exposes readable text, uses WhatsApp branding, or has malformed hands.

- [ ] **Step 3: Generate the point-of-sale asset**

Use a third independent image-generation call with this complete prompt:

```text
Create one square photorealistic-natural image for a premium Mexican SaaS homepage mosaic. Scene: at the counter of an authentic Mexican small business, a staff member records a customer's sale on a countertop tablet or fixed POS screen. The tablet, staff hand, and customer interaction are centered and easy to read; the screen shows an abstract product grid and sale total structure with no readable words, numbers, logos, or invented brands. Make it unmistakably a sale being registered on a countertop point-of-sale system, not a handheld payment terminal or card-tap transaction. Premium documentary commercial photography, candid working moment, realistic Mexican people and skin texture, warm natural daylight, crisp tablet and action, moderate depth of field, simple composition that remains legible at a 48 by 40 pixel thumbnail. Safe crop space on all sides. No watermark, no floating UI, no staged stock-photo smile, no distorted hands, no extra fingers, no hidden screen. Produce a single image, not a collage or contact sheet.
```

Inspect the returned image at original detail. Reject and regenerate it if the device reads as a handheld card terminal, the sale-registration action is unclear, or anatomy is malformed.

- [ ] **Step 4: Copy the selected outputs into the project and optimize them**

For each accepted result, assign the exact absolute local path returned in the image tool's `output_hint` to `BOOKING_SOURCE`, `PAYMENT_LINK_SOURCE`, or `POS_SOURCE`. Then convert each selected source without modifying the generated original:

```bash
sips -s format jpeg -s formatOptions 82 "$BOOKING_SOURCE" --out src/assets/hero/hero-entry-online-booking.jpg
sips -s format jpeg -s formatOptions 82 "$PAYMENT_LINK_SOURCE" --out src/assets/hero/hero-entry-payment-link.jpg
sips -s format jpeg -s formatOptions 82 "$POS_SOURCE" --out src/assets/hero/hero-entry-point-of-sale.jpg
```

Do not guess or shorten those source values; copy each one from its completed image-generation result.

- [ ] **Step 5: Verify dimensions, byte size, and final appearance**

Run:

```bash
for file in src/assets/hero/hero-entry-online-booking.jpg src/assets/hero/hero-entry-payment-link.jpg src/assets/hero/hero-entry-point-of-sale.jpg; do
  sips -g pixelWidth -g pixelHeight "$file"
  test "$(stat -f%z "$file")" -le 307200
done
```

Expected: every file is square, every dimension is at least `1024 x 1024`, and every file is at most `307200` bytes. If only the byte-size assertion fails, rerun the corresponding quality-72 line below and then rerun the same checks:

```bash
sips -s format jpeg -s formatOptions 72 "$BOOKING_SOURCE" --out src/assets/hero/hero-entry-online-booking.jpg
sips -s format jpeg -s formatOptions 72 "$PAYMENT_LINK_SOURCE" --out src/assets/hero/hero-entry-payment-link.jpg
sips -s format jpeg -s formatOptions 72 "$POS_SOURCE" --out src/assets/hero/hero-entry-point-of-sale.jpg
```

Inspect all three final project files at original detail and at a 48-by-40-equivalent thumbnail. Confirm that each action remains distinct and that no text, logos, watermark, or hand defects were introduced by the selected output.

- [ ] **Step 6: Commit only the generated assets**

```bash
git add src/assets/hero/hero-entry-online-booking.jpg src/assets/hero/hero-entry-payment-link.jpg src/assets/hero/hero-entry-point-of-sale.jpg
git diff --cached --check
git commit -m "feat(homepage): add operation entry imagery"
```

---

### Task 2: Replace the opening promise in every rendering mode

**Files:**

- Modify: `src/components/interactive/home-opening/OpeningVideo.tsx`
- Modify: `src/components/interactive/home-opening/ReducedMotionOpening.tsx`
- Test: `tests/e2e/home-opening.spec.ts`
- Test: `tests/e2e/home-scrollytelling.spec.ts`

- [ ] **Step 1: Add failing cross-mode copy assertions**

In `tests/e2e/home-opening.spec.ts`, add constants near the import:

```ts
const HERO_EYEBROW = 'PARA TODO TIPO DE NEGOCIO';
const HERO_HEADING = 'El primer sistema todo en uno en México para cobrar, administrar y hacer crecer tu negocio.';
const HERO_SUPPORT = 'Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad y reportes — todo conectado en tiempo real.';
```

Update the `/scrollytelling`, homepage animated, reduced-motion, and no-JavaScript tests so each active opening asserts:

```ts
await expect(opening).toContainText(HERO_EYEBROW);
await expect(opening.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING);
await expect(opening).toContainText(HERO_SUPPORT);
await expect(opening).not.toContainText('Tu tienda, tu gym, tu estética.');
```

For the tests where `opening` is not currently declared, scope it to the active `[data-opening-mode]` locator rather than the whole page. Add the following constant near the import in `tests/e2e/home-scrollytelling.spec.ts`, then use it for the single-H1 assertion:

```ts
const HERO_HEADING = 'El primer sistema todo en uno en México para cobrar, administrar y hacer crecer tu negocio.';
```

- [ ] **Step 2: Run the copy tests and confirm the red state**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --grep "legacy SquareHero|restores the approved homepage opening|static semantic opening|same opening truth|cuenta la historia completa" --workers=1
```

Expected: failures show the new eyebrow, H1, and support copy are absent; unrelated CTA or page-load assertions must not fail.

- [ ] **Step 3: Implement the animated hero copy**

In `OpeningVideo.tsx`, replace only the text block above the existing CTA container with:

```tsx
<p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-sm">
  PARA TODO TIPO DE NEGOCIO
</p>
<h1 className="mb-6 max-w-6xl text-center text-2xl font-light tracking-tight text-white sm:text-3xl md:mb-8 md:text-4xl lg:text-6xl">
  El primer sistema todo en uno en México
  <br className="hidden md:block" />{' '}
  para cobrar, administrar
  <br className="hidden md:block" />{' '}
  y hacer crecer tu negocio.
</h1>
<p className="mb-8 max-w-4xl text-center text-sm text-gray-200 sm:text-base md:mb-10 md:text-lg lg:text-xl">
  Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad y reportes — todo conectado en tiempo real.
</p>
```

Do not change the video, poster, `textOpacity`, CTA links, click handlers, or hit-testing classes.

- [ ] **Step 4: Implement the reduced-motion and no-JavaScript hero copy**

In the first content block of `ReducedMotionOpening.tsx`, replace the old H1 and paragraph with:

```tsx
<p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-avoqado-green sm:text-sm">
  PARA TODO TIPO DE NEGOCIO
</p>
<h1 className="mx-auto max-w-6xl text-4xl font-light tracking-[-0.04em] sm:text-5xl lg:text-7xl">
  El primer sistema todo en uno en México
  <br className="hidden md:block" />{' '}
  para cobrar, administrar
  <br className="hidden md:block" />{' '}
  y hacer crecer tu negocio.
</h1>
<p className="mx-auto mt-6 max-w-4xl text-base text-neutral-200 sm:text-lg">
  Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad y reportes — todo conectado en tiempo real.
</p>
```

Leave both CTAs and their analytics behavior unchanged.

- [ ] **Step 5: Run focused tests, type/build validation, and commit**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --grep "legacy SquareHero|restores the approved homepage opening|static semantic opening|same opening truth|cuenta la historia completa|calls to action|poster visible" --workers=1
npm run build
git diff --check
git add src/components/interactive/home-opening/OpeningVideo.tsx src/components/interactive/home-opening/ReducedMotionOpening.tsx tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): clarify all-in-one opening promise"
```

Expected: focused Playwright tests and `astro build` pass; exactly one visible H1 remains in each mode.

---

### Task 3: Make five understandable entries the single source of truth

**Files:**

- Modify: `src/components/interactive/home-opening/opening-tiles.ts`
- Modify: `src/components/interactive/home-opening/ChannelHandoff.tsx`
- Modify: `src/components/interactive/home-opening/ReducedMotionOpening.tsx`
- Modify: `src/components/interactive/home-story/story-fixture.ts`
- Test: `tests/e2e/home-opening.spec.ts`
- Test: `tests/e2e/home-scrollytelling.spec.ts`

- [ ] **Step 1: Change the public-entry tests first**

Update `tests/e2e/home-opening.spec.ts` so the animated composition test requires:

```ts
await expect(channels).toContainText('Tu cliente reserva, compra o paga como prefiera');
await expect(channels.locator('[data-channel-id]')).toHaveCount(5);
await expect(channels.locator('[data-channel-id="online-booking"]')).toContainText('Reserva confirmada');
await expect(channels.locator('[data-channel-active="true"]')).toHaveCount(1);
await expect(channels.locator('[data-channel-route-summary]:visible'))
  .toHaveText('Reservación en línea → Reserva confirmada');
```

Rename the travel test to `moves the five mosaic tiles continuously into their operation rows`, change its overlay count to 5, and change its per-tile loop bound to 5. Change the reverse-restoration selected-source count to 5.

Add this terminology test to `home-opening.spec.ts`:

```ts
test('uses understandable operation entry names in every rendering mode', async ({ page }, testInfo) => {
  await page.goto(testInfo.project.name === 'chromium-desktop' ? '/?motion=full' : '/');
  const mode = testInfo.project.name === 'chromium-reduced'
    ? 'static'
    : testInfo.project.name === 'chromium-nojs'
      ? 'noscript'
      : 'animated';
  const opening = page.locator(`[data-opening-mode="${mode}"]`);
  if (mode === 'animated') await scrollOpeningTo(page, 0.97);

  for (const [label, result] of [
    ['Reservación en línea', 'Reserva confirmada'],
    ['Tienda en línea', 'Pedido recibido'],
    ['Liga de pago', 'Pago recibido'],
    ['Punto de venta', 'Venta registrada'],
    ['Terminal de cobro', 'Cobro aprobado'],
  ] as const) {
    await expect(opening).toContainText(label);
    await expect(opening).toContainText(result);
  }
  await expect(opening).not.toContainText('Consumer App');
  await expect(opening).not.toContainText('Booking Widget');
  await expect(opening.getByText('Online', { exact: true })).toHaveCount(0);
});
```

Update `tests/e2e/home-scrollytelling.spec.ts` as follows:

- Replace opening route expectations with `Reservación en línea → Reserva confirmada`.
- Rename `conecta Booking Widget con la reserva en un solo sentido` to `conecta la reservación en línea con la reserva en un solo sentido`.
- In the mobile truth test, expect the active row to contain `Reserva confirmada` instead of `Seleccionado`.
- In the channel/routing claims test, remove the requirements for `Consumer App` and `Booking Widget`; require the five new labels instead and assert the old terms are absent from the entire homepage narrative with:

```ts
await expect(story).not.toContainText('Consumer App');
await expect(story).not.toContainText('Booking Widget');
await expect(story.getByText('Online', { exact: true })).toHaveCount(0);
```
- Keep the `POS iOS`, `POS Android`, and `POS Desktop` assertions because they describe supported downstream products, not operation-entry labels.

- [ ] **Step 2: Run the public-entry tests and confirm the red state**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --grep "restores the approved homepage opening|five mosaic tiles|restores the mosaic|understandable operation entry names|presenta canales|conecta la reservación|verdad crítica" --workers=1
```

Expected: failures report four instead of five entries and the old internal terms.

- [ ] **Step 3: Replace ids, image imports, and channel metadata**

In `opening-tiles.ts`, add:

```ts
import bookingImg from '../../../assets/hero/hero-entry-online-booking.jpg';
import paymentLinkImg from '../../../assets/hero/hero-entry-payment-link.jpg';
import posImg from '../../../assets/hero/hero-entry-point-of-sale.jpg';
```

Replace `OPENING_CHANNEL_IDS` with:

```ts
export const OPENING_CHANNEL_IDS = [
  'online-booking',
  'online-store',
  'payment-link',
  'point-of-sale',
  'payment-terminal',
] as const;
```

Keep all 17 tile positions unchanged. Change only these five `src`/`channelId` mappings:

```ts
{ id: 'tile-2', src: paymentLinkImg.src, desktop: { col: 4, row: 1 }, mobile: { col: 2, row: 1 }, channelId: 'payment-link' },
{ id: 'tile-7', src: bookingImg.src, desktop: { col: 5, row: 2 }, mobile: { col: 3, row: 2 }, channelId: 'online-booking' },
{ id: 'tile-10', src: img10.src, desktop: { col: 1, row: 4 }, mobile: { col: 1, row: 4 }, channelId: 'payment-terminal' },
{ id: 'tile-12', src: img12.src, desktop: { col: 7, row: 4 }, mobile: { col: 3, row: 4 }, channelId: 'online-store' },
{ id: 'tile-15', src: posImg.src, desktop: { col: 4, row: 5 }, mobile: { col: 2, row: 5 }, channelId: 'point-of-sale' },
```

Replace `OPENING_CHANNELS` with this exact order and copy:

```ts
export const OPENING_CHANNELS: readonly OpeningChannel[] = [
  { id: 'online-booking', label: 'Reservación en línea', result: 'Reserva confirmada', tileId: 'tile-7', active: true },
  { id: 'online-store', label: 'Tienda en línea', result: 'Pedido recibido', tileId: 'tile-12', active: false },
  { id: 'payment-link', label: 'Liga de pago', result: 'Pago recibido', tileId: 'tile-2', active: false },
  { id: 'point-of-sale', label: 'Punto de venta', result: 'Venta registrada', tileId: 'tile-15', active: false },
  { id: 'payment-terminal', label: 'Terminal de cobro', result: 'Cobro aprobado', tileId: 'tile-10', active: false },
] as const;
```

- [ ] **Step 4: Make the active entry drive all summaries**

In `ChannelHandoff.tsx`, define this inside `ChannelHandoff`, before the returned JSX:

```ts
const activeChannel = OPENING_CHANNELS.find(channel => channel.active)!;
```

Replace the section copy with:

```tsx
<p className="text-xs font-semibold uppercase tracking-[0.18em] text-green-800">UNA SOLA OPERACIÓN</p>
<h2 id="opening-channels-title" className="mt-3 text-3xl font-light tracking-[-0.04em] sm:text-5xl lg:text-6xl">
  Tu cliente reserva, compra o paga como prefiera.
</h2>
<p className="mt-4 max-w-xl text-sm text-neutral-600 sm:text-base">
  Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.
</p>
```

Change the visible summary to:

```tsx
{activeChannel.label} → {activeChannel.result}
```

Change the final screen-reader sentence to:

```tsx
<p className="sr-only">
  {activeChannel.label} produce una reserva confirmada para {STORY_FIXTURE.customer}, con servicio, hora y sucursal.
</p>
```

In `story-fixture.ts`, make the one permitted narrative-label change:

```ts
selectedChannel: 'Reservación en línea',
```

- [ ] **Step 5: Mirror the five-entry truth in static and no-JavaScript output**

At the start of `ReducedMotionOpening`, before `return`, add:

```ts
const activeChannel = OPENING_CHANNELS.find(channel => channel.active)!;
```

Replace the channel heading and support paragraph with the approved section copy from Step 4. Keep mapping `OPENING_CHANNELS` into the ordered list. Replace the hard-coded static summary with:

```tsx
<strong className="block text-lg font-semibold text-green-800">
  {activeChannel.label} → {activeChannel.result}
</strong>
```

Keep the existing detail sentence `La cita entra con cliente, servicio, hora y sucursal.`

- [ ] **Step 6: Run focused behavior tests and commit**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts --grep "restores the approved homepage opening|five mosaic tiles|restores the mosaic|understandable operation entry names|presenta canales|conecta la reservación|verdad crítica|cuenta la historia completa" --workers=1
npm run build
git diff --check
git add src/components/interactive/home-opening/opening-tiles.ts src/components/interactive/home-opening/ChannelHandoff.tsx src/components/interactive/home-opening/ReducedMotionOpening.tsx src/components/interactive/home-story/story-fixture.ts tests/e2e/home-opening.spec.ts tests/e2e/home-scrollytelling.spec.ts
git commit -m "feat(homepage): explain five operation entry channels"
```

Expected: five overlays move monotonically, the reservation entry alone is active, old public terms are gone, reduced/no-JavaScript output matches, and the build passes.

---

### Task 4: Verify five-entry geometry and responsive fit at every acceptance viewport

**Files:**

- Modify if evidence requires it: `src/components/interactive/home-story/home-story.css`
- Test: `tests/e2e/home-opening.spec.ts`

- [ ] **Step 1: Add a six-viewport endpoint acceptance test**

Add a desktop-only test to `home-opening.spec.ts` named `docks all five shared tiles at every required viewport`. Reuse the six viewports already listed in `keeps every opening checkpoint inside the viewport at all required sizes`. For each viewport:

1. Set the viewport and open `/?motion=full`.
2. Scroll the opening to `0.80`.
3. Assert exactly five `[data-shared-tile-overlay]` elements and five `[data-shared-tile-target]` elements.
4. For each overlay, find the target with the matching `data-shared-tile-*` id.
5. Calculate center-to-center distance with `getBoundingClientRect()` and assert every distance is `<= 3`.
6. Assert `document.documentElement.scrollWidth <= window.innerWidth + 1`.

Use this evaluation body so the geometry calculation stays identical for all entries:

```ts
const state = await page.locator('[data-opening-mode="animated"]').evaluate(element => {
  const overlays = [...element.querySelectorAll<HTMLElement>('[data-shared-tile-overlay]')];
  return {
    overlays: overlays.map(overlay => {
      const id = overlay.dataset.sharedTileOverlay!;
      const target = element.querySelector<HTMLElement>(`[data-shared-tile-target="${id}"]`)!;
      const source = element.querySelector<HTMLElement>(`[data-shared-tile-source="${id}"]`)!;
      const a = overlay.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      return {
        id,
        sourcePresent: Boolean(source),
        distance: Math.hypot(
          a.left + a.width / 2 - (b.left + b.width / 2),
          a.top + a.height / 2 - (b.top + b.height / 2),
        ),
      };
    }),
    targets: element.querySelectorAll('[data-shared-tile-target]').length,
    overflowX: document.documentElement.scrollWidth - window.innerWidth,
  };
});
expect(state.overlays).toHaveLength(5);
expect(state.targets).toBe(5);
expect(state.overflowX).toBeLessThanOrEqual(1);
for (const overlay of state.overlays) {
  expect.soft(overlay.sourcePresent, `${overlay.id} has a measured source`).toBe(true);
  expect.soft(overlay.distance, `${overlay.id} docks at its row`).toBeLessThanOrEqual(3);
}
```

- [ ] **Step 2: Run the new acceptance test and the existing viewport matrix**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-opening.spec.ts --grep "docks all five shared tiles|every opening checkpoint" --project=chromium-desktop --workers=1
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- tests/e2e/home-scrollytelling.spec.ts --grep "mantiene el conector dentro del panel|remide el origen" --project=chromium-desktop --workers=1
```

Expected: all five endpoints are within 3px, the ledger and event fit the visual, no checkpoint leaves the viewport, and no browser errors appear.

- [ ] **Step 3: Apply the compact-height correction only if the matrix proves it is needed**

If and only if `320 x 568` fails because five ledger rows overflow vertically, modify the existing `@media (max-width: 639px) and (max-height: 640px)` rules in `home-story.css` to these tighter values:

```css
[data-opening-channel-handoff] .story-channel-ledger > p {
  padding-block: 0.1rem;
}

[data-opening-channel-handoff] .story-channel-row {
  grid-template-columns: 2.2rem minmax(0, 1fr) auto;
  gap: 0.35rem;
  padding-block: 0.1rem;
  font-size: 0.7rem;
}

[data-opening-channel-handoff] [data-shared-tile-target] {
  width: 2.2rem;
  height: 1.7rem;
}
```

Rerun both commands from Step 2. Do not change the route topology, scroll ranges, or endpoint thresholds. If the matrix already passes, leave `home-story.css` untouched.

- [ ] **Step 4: Run the complete regression suite and production build**

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- --workers=1
npm run build
git diff --check
for file in src/assets/hero/hero-entry-online-booking.jpg src/assets/hero/hero-entry-payment-link.jpg src/assets/hero/hero-entry-point-of-sale.jpg; do
  test "$(stat -f%z "$file")" -le 307200
done
git status --short
```

Expected: all five Playwright projects pass, `astro build` passes, the three new assets stay within budget, and status contains only the files intentionally changed plus the pre-existing untracked `test-results/` artifact.

- [ ] **Step 5: Commit the responsive acceptance coverage**

```bash
git add tests/e2e/home-opening.spec.ts
if ! git diff --quiet -- src/components/interactive/home-story/home-story.css; then
  git add src/components/interactive/home-story/home-story.css
fi
git diff --cached --check
git commit -m "test(homepage): verify five-entry handoff across viewports"
```

- [ ] **Step 6: Perform final visual review in the live preview**

At `http://127.0.0.1:4330/?motion=full`, verify the following in desktop and `320 x 568` emulation:

- The video opening still plays and collapses into the 17-image mosaic.
- The new eyebrow, H1, and support copy remain readable over the video.
- The three new images read as booking, payment link, and POS before and during movement.
- Exactly five images dock cleanly into their rows.
- The green point and connector originate only from `Reservación en línea` and finish at `Reserva confirmada`.
- Reverse scrolling restores the five mosaic sources and fades the route/card together.
- The story continues directly into the unchanged service scene.

Record any true visual defect with a screenshot and fix the cause without broadening scope. After a fix, rerun the focused affected test, the full E2E suite, and `npm run build` before reporting completion.
