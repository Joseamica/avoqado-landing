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
        && this.matches(
          '[data-shared-tile-source], [data-shared-tile-target], [data-shared-tile-overlay]',
        )
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
  await installRectCounter(page);
  await page.goto('/?motion=full');
  await expect(page.locator('[data-shared-tile-overlay]')).toHaveCount(5);
  await scrollOpeningRange(page, 0.05, 0.55);

  expect(await page.evaluate(() => window.__avoqadoOpeningRectReads))
    .toBeLessThan(200);

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
});
