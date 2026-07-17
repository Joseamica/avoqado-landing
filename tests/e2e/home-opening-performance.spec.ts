import { expect, test, type Page } from 'playwright/test';

declare global {
  interface Window {
    __avoqadoOpeningLayoutReads: number;
  }
}

async function installLayoutReadCounter(page: Page) {
  await page.addInitScript(() => {
    const sharedTileSelector =
      '[data-shared-tile-source], [data-shared-tile-target], [data-shared-tile-overlay]';
    const track = (element: unknown) => {
      if (element instanceof Element && element.matches(sharedTileSelector)) {
        window.__avoqadoOpeningLayoutReads += 1;
      }
    };

    window.__avoqadoOpeningLayoutReads = 0;

    const rectDescriptor = Object.getOwnPropertyDescriptor(
      Element.prototype,
      'getBoundingClientRect',
    )!;
    const originalRect = rectDescriptor.value as typeof Element.prototype.getBoundingClientRect;
    Object.defineProperty(Element.prototype, 'getBoundingClientRect', {
      ...rectDescriptor,
      value: function (...args: []) {
        track(this);
        return originalRect.apply(this, args);
      },
    });

    for (const property of [
      'offsetWidth',
      'offsetHeight',
      'offsetLeft',
      'offsetTop',
    ] as const) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, property)!;
      const originalGet = descriptor.get!;
      Object.defineProperty(HTMLElement.prototype, property, {
        ...descriptor,
        get: function () {
          track(this);
          return originalGet.call(this);
        },
      });
    }
  });
}

async function scrollOpeningRange(page: Page, start: number, end: number) {
  await page.locator('[data-opening-mode="animated"]').evaluate(
    async (element, range) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
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
  await installLayoutReadCounter(page);
  await page.goto('/?motion=full');
  await expect(page.locator('[data-shared-tile-overlay]')).toHaveCount(5);
  await scrollOpeningRange(page, 0.05, 0.55);

  const dockingDistances = await page.locator('[data-shared-tile-overlay]').evaluateAll(
    overlays => overlays.map(overlay => {
      const id = overlay.getAttribute('data-shared-tile-overlay');
      const target = document.querySelector<HTMLElement>(`[data-shared-tile-target="${id}"]`)!;
      const overlayRect = overlay.getBoundingClientRect();
      const targetRect = target.getBoundingClientRect();
      return Math.hypot(
        (overlayRect.left + overlayRect.width / 2)
          - (targetRect.left + targetRect.width / 2),
        (overlayRect.top + overlayRect.height / 2)
          - (targetRect.top + targetRect.height / 2),
      );
    }),
  );
  expect(Math.max(...dockingDistances)).toBeLessThanOrEqual(3);

  await scrollOpeningRange(page, 0.55, 0.35);
  const sourceOpacities = await page.locator('[data-shared-tile-source]').evaluateAll(
    sources => sources.map(source => Number.parseFloat(getComputedStyle(source).opacity)),
  );
  expect(Math.min(...sourceOpacities)).toBeGreaterThan(0.95);

  const layoutReads = await page.evaluate(() => window.__avoqadoOpeningLayoutReads);
  console.log(`opening shared-tile layout reads: ${layoutReads}`);
  expect(layoutReads).toBeLessThan(300);
});
