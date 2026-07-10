import { expect, test } from 'playwright/test';

test('serves the homepage and keeps /demo independent', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Avoqado/);

  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Prueba Avoqado en 60 segundos',
  );
});

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

test('cuenta la historia completa en orden causal', async ({ page }, testInfo) => {
  await page.goto('/');

  if (testInfo.project.name === 'chromium-reduced') {
    expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);
  }

  const main = page.locator('main[data-scrollytelling]');
  await expect(main).toHaveCount(1);

  const mode = testInfo.project.name === 'chromium-reduced'
    ? 'static'
    : testInfo.project.name === 'chromium-nojs'
      ? 'noscript'
      : 'animated';
  const scenes = main.locator(`[data-story-mode="${mode}"] [data-story-scene]`);
  await expect(scenes).toHaveCount(sceneOrder.length);
  expect(await scenes.evaluateAll(nodes => nodes.map(node => node.getAttribute('data-story-scene'))))
    .toEqual(sceneOrder);

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Un cliente hace una cosa',
  );
  if (testInfo.project.name === 'chromium-nojs') {
    await expect(main.locator('h1:visible')).toHaveCount(1);
  }
  await expect(main).toContainText('Cuenta de cobro');
  await expect(main).toContainText('Una sucursal o diez');
  await expect(main).toContainText('sólo pregunta');
  await expect(page.getByText('Continue scrolling...')).toHaveCount(0);
});

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

test('resuelve la geometría sticky contra el viewport', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  const shell = root.locator(':scope > div').first();
  await expect(shell).toHaveCount(1);

  const geometry = await shell.evaluate((element) => {
    const styles = getComputedStyle(element);
    return {
      position: styles.position,
      top: styles.top,
      height: element.getBoundingClientRect().height,
      viewportHeight: window.innerHeight,
    };
  });

  expect(geometry.position).toBe('sticky');
  expect(geometry.top).not.toBe('auto');
  expect(geometry.height).toBeGreaterThan(0);
  expect(Math.abs(Number.parseFloat(geometry.top) + geometry.height - geometry.viewportHeight))
    .toBeLessThanOrEqual(1);
});
