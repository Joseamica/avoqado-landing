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

test('keeps both opening calls to action hit-testable at progress zero', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await scrollOpeningTo(page, 0);

  const video = page.locator('[data-opening-video]');
  const whatsapp = video.getByRole('link', { name: 'Agenda por WhatsApp' });
  const signup = video.getByRole('link', { name: 'Comienza gratis' });

  await expect(whatsapp).toHaveAttribute(
    'href',
    '/wa?src=hero_demo&text=Hola%2C%20me%20interesa%20una%20demo%20de%20Avoqado%20de%2015%20minutos',
  );
  await expect(signup).toHaveAttribute('href', 'https://dashboard.avoqado.io/signup');

  for (const cta of [whatsapp, signup]) {
    expect(await cta.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return hit === element || element.contains(hit);
    })).toBe(true);
    await cta.evaluate(element => {
      element.addEventListener('click', event => event.preventDefault(), { capture: true, once: true });
    });
  }

  await page.evaluate(() => { window.dataLayer = []; });
  await whatsapp.click({ modifiers: ['Meta'] });
  await signup.click({ modifiers: ['Meta'] });

  const events = await page.evaluate(() => window.dataLayer ?? []);
  expect(events).toEqual(expect.arrayContaining([
    expect.objectContaining({ event: 'demo_request', demo_type: 'whatsapp', location: 'hero' }),
    expect.objectContaining({ event: 'get_started_click', source: 'hero' }),
  ]));
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

test('moves the four mosaic tiles continuously into their channel rows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  const distances: number[][] = [];
  for (const progress of [0.64, 0.71, 0.80]) {
    await scrollOpeningTo(page, progress);
    distances.push(await page.locator('[data-shared-tile-overlay]').evaluateAll(nodes => nodes.map(node => {
      const id = node.getAttribute('data-shared-tile-overlay');
      const target = document.querySelector<HTMLElement>(`[data-shared-tile-target="${id}"]`)!;
      const a = node.getBoundingClientRect();
      const b = target.getBoundingClientRect();
      return Math.hypot((a.left + a.width / 2) - (b.left + b.width / 2), (a.top + a.height / 2) - (b.top + b.height / 2));
    })));
  }

  expect(distances).toHaveLength(3);
  for (let index = 0; index < 4; index += 1) {
    expect(distances[1][index]).toBeLessThan(distances[0][index]);
    expect(distances[2][index]).toBeLessThan(distances[1][index]);
    expect(distances[2][index]).toBeLessThanOrEqual(3);
  }
});

test('restores the mosaic when scrolling the shared tiles backwards', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await scrollOpeningTo(page, 0.80);
  await scrollOpeningTo(page, 0.61);

  const selectedSources = page.locator('[data-shared-tile-source]');
  await expect(selectedSources).toHaveCount(4);
  for (const source of await selectedSources.all()) await expect(source).toBeVisible();
  await expect(page.locator('[data-opening-channel-handoff]')).toBeHidden();
});
