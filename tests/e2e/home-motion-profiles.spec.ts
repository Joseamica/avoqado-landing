import { expect, test } from 'playwright/test';

test('bare homepage forces full motion despite a reduced browser preference', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-nojs');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');

  const experience = page.locator('[data-home-motion-profile]');
  await expect(experience).toHaveAttribute('data-home-motion-profile', 'full');
  await expect(experience.locator('[data-story-mode="animated"]')).toBeVisible();
  await expect(experience.locator('[data-story-mode="static"]')).toHaveCount(0);
});

test('motion=full overrides a reduced browser preference', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-nojs');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?motion=full');
  await expect(page.locator('[data-home-motion-profile]'))
    .toHaveAttribute('data-home-motion-profile', 'full');
  await expect(page.locator('[data-story-mode="animated"]')).toBeVisible();
});

test('motion=reduced overrides a normal browser preference', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-nojs');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/?motion=reduced');
  await expect(page.locator('[data-home-motion-profile]'))
    .toHaveAttribute('data-home-motion-profile', 'reduced');
  await expect(page.locator('[data-story-mode="static"]')).toBeVisible();
});

test('save-data selects lite media without changing the story mode', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-nojs');
  const videoRequests: string[] = [];
  page.on('request', request => {
    if (request.url().includes('/video4.webm')) videoRequests.push(request.url());
  });
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
  await expect(page.locator('[data-opening-video-fallback]')).toBeVisible();
  await expect(page.locator('[data-opening-video-fallback]'))
    .toHaveAttribute('src', '/video4-poster.webp');
  await expect(page.locator('[data-opening-video] video')).toHaveCount(0);
  expect(videoRequests).toEqual([]);
});

test('reduced motion advances through viewport-sized chapters', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?motion=reduced');

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
