import { expect, test, type Page } from 'playwright/test';

const HERO_EYEBROW = 'PARA TODO TIPO DE NEGOCIO';
const HERO_HEADING = 'El primer sistema todo en uno en México para cobrar, administrar y hacer crecer tu negocio.';
const HERO_SUPPORT = 'Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad y reportes — todo conectado en tiempo real.';

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
  await expect(opening).toContainText(HERO_EYEBROW);
  await expect(opening.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING);
  await expect(opening).toContainText(HERO_SUPPORT);
  await expect(opening).not.toContainText('Tu tienda, tu gym, tu estética.');

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
  await expect(opening).toContainText(HERO_EYEBROW);
  await expect(opening.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING);
  await expect(opening).toContainText(HERO_SUPPORT);
  await expect(opening).not.toContainText('Tu tienda, tu gym, tu estética.');
  await expect(opening.locator('[data-opening-tile]')).toHaveCount(17);

  await scrollOpeningTo(page, 0.97);
  const channels = opening.locator('[data-opening-channel-handoff]');
  await expect(channels).toContainText('Tu cliente reserva, compra o paga como prefiera');
  await expect(channels.locator('[data-channel-id]')).toHaveCount(5);
  await expect(channels.locator('[data-channel-id="online-booking"]')).toContainText('Reserva confirmada');
  await expect(channels.locator('[data-channel-active="true"]')).toHaveCount(1);
  await expect(channels.locator('[data-channel-route-summary]:visible'))
    .toHaveText('Reservación en línea → Reserva confirmada');

  await expect(page.getByText('Un cliente hace una cosa. Avoqado mueve todo lo demás.')).toHaveCount(0);
  const story = page.locator('[data-story-mode="animated"]');
  await expect(story.locator('[data-story-scene]')).toHaveCount(7);
  await expect(story.locator('[data-story-scene]').first()).toHaveAttribute('data-story-scene', 'service');
});

test('moves the five mosaic tiles continuously into their operation rows', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  await expect(page.locator('[data-shared-tile-overlay]')).toHaveCount(5);
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
  for (let index = 0; index < 5; index += 1) {
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
  await expect(selectedSources).toHaveCount(5);
  for (const source of await selectedSources.all()) {
    await expect(source).toBeVisible();
    expect(Number.parseFloat(await source.evaluate(element => getComputedStyle(element).opacity))).toBeCloseTo(1, 2);
  }
  await expect(page.locator('[data-opening-channel-handoff]')).toBeHidden();
});

test('keeps every opening checkpoint inside the viewport at all required sizes', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  const viewports = [
    { width: 1440, height: 900 },
    { width: 910, height: 691 },
    { width: 787, height: 701 },
    { width: 887, height: 502 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ];
  const checkpoints = [0.02, 0.55, 0.70, 0.82, 0.97];
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/?motion=full');
    for (const progress of checkpoints) {
      await scrollOpeningTo(page, progress);
      const geometry = await page.locator('[data-opening-mode="animated"] > div').evaluate(element => {
        const rects = [...element.querySelectorAll<HTMLElement>('[data-opening-tile], [data-shared-tile-overlay], [data-opening-channel-handoff], [data-channel-route-source], [data-channel-route-target]')]
          .filter(node => {
            const style = getComputedStyle(node);
            return style.display !== 'none' && Number.parseFloat(style.opacity || '1') > 0.05;
          })
          .map(node => node.getBoundingClientRect());
        return {
          overflowX: document.documentElement.scrollWidth - window.innerWidth,
          outside: rects.filter(rect => rect.left < -3 || rect.right > window.innerWidth + 3 || rect.top < -3 || rect.bottom > window.innerHeight + 3).length,
        };
      });
      expect(geometry.overflowX).toBeLessThanOrEqual(1);
      expect(geometry.outside).toBe(0);
      await testInfo.attach(`opening-${viewport.width}x${viewport.height}-${Math.round(progress * 100)}`, {
        body: await page.screenshot({ fullPage: false }),
        contentType: 'image/png',
      });
    }
  }

  expect(errors).toEqual([]);
});

test('uses a static semantic opening for reduced motion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-reduced');
  await page.goto('/');
  const opening = page.locator('[data-opening-mode="static"]');
  await expect(opening).toBeVisible();
  await expect(page.locator('[data-opening-mode="animated"]')).toHaveCount(0);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(opening).toContainText(HERO_EYEBROW);
  await expect(opening.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING);
  await expect(opening).toContainText(HERO_SUPPORT);
  await expect(opening).not.toContainText('Tu tienda, tu gym, tu estética.');
  await expect(opening).toContainText('Reservación en línea → Reserva confirmada');
});

test('keeps the same opening truth without JavaScript', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-nojs');
  await page.goto('/');
  const opening = page.locator('[data-opening-mode="noscript"]');
  await expect(opening).toBeVisible();
  await expect(opening).toContainText(HERO_EYEBROW);
  await expect(opening.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING);
  await expect(opening).toContainText(HERO_SUPPORT);
  await expect(opening).not.toContainText('Tu tienda, tu gym, tu estética.');
  await expect(opening).toContainText('Reservación en línea → Reserva confirmada');
});

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

test('keeps the poster visible when video playback fails', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.addInitScript(() => {
    const originalPlay = HTMLMediaElement.prototype.play;
    const state = window as Window & { __openingVideoPlayCalls: number };
    state.__openingVideoPlayCalls = 0;
    HTMLMediaElement.prototype.play = function () {
      if (this instanceof HTMLVideoElement && this.getAttribute('src') === '/video4.webm') {
        state.__openingVideoPlayCalls += 1;
      }
      return originalPlay.call(this);
    };
  });
  await page.route('**/video4.webm', route => route.abort('failed'));
  await page.goto('/?motion=full');
  const fallback = page.locator('[data-opening-video-fallback]');
  await expect(fallback).toBeVisible();
  await expect(fallback).toHaveAttribute('src', '/video4-poster.webp');
  await expect(fallback.locator('xpath=ancestor::astro-island')).not.toHaveAttribute('ssr', '');
  await expect(page.locator('video[src="/video4.webm"]')).toHaveCount(0);
  expect(await page.evaluate(() => (
    window as Window & { __openingVideoPlayCalls: number }
  ).__openingVideoPlayCalls)).toBe(0);
});
