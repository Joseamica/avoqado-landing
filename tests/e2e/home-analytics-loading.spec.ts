import { expect, test } from 'playwright/test';

const externalAnalytics = /googletagmanager\.com\/gtm\.js|posthog.*\/static\/array\.js/;

declare global {
  interface Window {
    __avoqadoLoadAt: number;
    __avoqadoPreIdleCheckpoint: Promise<void>;
    __avoqadoPreIdleCheckpointAt: number;
  }
}

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name === 'chromium-nojs', 'requires JavaScript');
});

test('homepage defers external analytics until interaction or idle delay', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.goto('/?motion=full', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);

  await page.locator('body').dispatchEvent('pointerdown');
  await expect.poll(() => requests).toHaveLength(2);
});

test('homepage starts deferred analytics from touch only once', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);

  await page.locator('body').dispatchEvent('touchstart');
  await expect.poll(() => requests).toHaveLength(2);

  for (const type of ['pointerdown', 'touchstart', 'keydown']) {
    await page.locator('body').dispatchEvent(type);
  }
  await page.waitForTimeout(250);
  expect(requests).toHaveLength(2);
});

test('homepage starts deferred analytics from keyboard only once', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);
  expect(requests).toEqual([]);

  await page.locator('body').dispatchEvent('keydown');
  await expect.poll(() => requests).toHaveLength(2);

  for (const type of ['pointerdown', 'touchstart', 'keydown']) {
    await page.locator('body').dispatchEvent(type);
  }
  await page.waitForTimeout(250);
  expect(requests).toHaveLength(2);
});

test('homepage starts deferred analytics after the post-load idle delay', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.addInitScript(() => {
    window.__avoqadoLoadAt = 0;
    window.__avoqadoPreIdleCheckpointAt = 0;
    window.__avoqadoPreIdleCheckpoint = new Promise(resolve => {
      addEventListener('load', () => {
        window.__avoqadoLoadAt = performance.now();
        setTimeout(() => {
          window.__avoqadoPreIdleCheckpointAt = performance.now();
          resolve();
        }, 2_250);
      }, { once: true });
    });
  });
  await page.goto('/', { waitUntil: 'load' });
  const checkpointAfterLoad = await page.evaluate(async () => {
    await window.__avoqadoPreIdleCheckpoint;
    return window.__avoqadoPreIdleCheckpointAt - window.__avoqadoLoadAt;
  });
  expect(checkpointAfterLoad).toBeGreaterThanOrEqual(2_250);
  expect(requests).toEqual([]);

  await expect.poll(() => requests, { timeout: 5_000 }).toHaveLength(2);
});

test('non-homepage routes retain immediate analytics bootstrap', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', request => {
    if (externalAnalytics.test(request.url())) requests.push(request.url());
  });

  await page.goto('/pricing', { waitUntil: 'domcontentloaded' });
  await expect.poll(() => requests.length).toBeGreaterThan(0);
});

for (const hostname of ['links.avoqado.io', 'tpv.avoqado.io']) {
  test(`${hostname} rewritten root retains immediate analytics bootstrap`, async ({ request }) => {
    const response = await request.get('/', { headers: { host: hostname } });
    const html = await response.text();

    expect(response.ok()).toBe(true);
    expect(html).toContain('googletagmanager.com/gtm.js');
    expect(html).not.toContain("['pointerdown','touchstart','keydown']");
  });
}

test('homepage keeps consent defaults ahead of deferred vendors', async ({ page }) => {
  await page.goto('/?_cc=DE', { waitUntil: 'domcontentloaded' });
  expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
  await expect(page.locator('body')).toHaveAttribute('data-consent-required', 'true');
});
