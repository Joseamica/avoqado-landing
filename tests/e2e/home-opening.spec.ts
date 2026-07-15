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
