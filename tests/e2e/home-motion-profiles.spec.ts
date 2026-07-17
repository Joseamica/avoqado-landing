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
