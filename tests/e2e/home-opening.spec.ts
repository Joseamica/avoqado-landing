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
