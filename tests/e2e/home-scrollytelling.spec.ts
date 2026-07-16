import { expect, test, type Page } from 'playwright/test';

const HERO_HEADING = 'El primer sistema todo en uno en México para cobrar, administrar y hacer crecer tu negocio.';

async function scrollOpeningTo(page: Page, progress: number) {
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

const CHANNEL_SEQUENCE_START = 0.60;
const CHANNEL_SEQUENCE_END = 0.98;

async function scrollChannelSequenceTo(page: Page, progress: number) {
  await scrollOpeningTo(
    page,
    CHANNEL_SEQUENCE_START + progress * (CHANNEL_SEQUENCE_END - CHANNEL_SEQUENCE_START),
  );
}

test('serves the homepage and keeps /demo independent', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Avoqado/);

  await page.goto('/demo');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(
    'Prueba Avoqado en 60 segundos',
  );
});

const sceneOrder = [
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

  const activeExperience = main.locator(
    `[data-opening-mode="${mode}"], [data-story-mode="${mode}"]`,
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(activeExperience.locator('a[href*="/wa?src=hero_demo"]')).toHaveCount(1);
  await expect(activeExperience.locator('a[href="https://dashboard.avoqado.io/signup"]')).toHaveCount(2);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(HERO_HEADING);
  if (testInfo.project.name === 'chromium-nojs') {
    await expect(main.locator('h1:visible')).toHaveCount(1);
  }
  await expect(main).toContainText('Cuenta de cobro');
  await expect(main.locator(`[data-opening-mode="${mode}"]`))
    .toContainText('Reservación en línea → Reserva confirmada');
  await expect(main.locator(`[data-story-mode="${mode}"] [data-story-scene="payment"]`))
    .toContainText('TPV → Operación diaria');
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
    [0.04, 'service'],
    [0.22, 'payment'],
    [0.80, 'multibranch'],
    [0.94, 'ai'],
    [0.22, 'payment'],
  ] as const) {
    await root.evaluate((element, value) => {
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);
    await expect(root).toHaveAttribute('data-active-scene', id);
  }
});

test('permite forzar la experiencia animada para previsualizarla', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-reduced');
  await page.goto('/?motion=full');

  expect(await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true);

  const root = page.locator('[data-story-mode="animated"]');
  await expect(root).toBeVisible();
  await expect(page.locator('[data-story-mode="static"]')).toHaveCount(0);

  await root.evaluate((element) => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * 0.22, behavior: 'auto' });
  });
  await expect(root).toHaveAttribute('data-active-scene', 'payment');
});

test('resuelve la geometría sticky contra el viewport', async ({ page }, testInfo) => {
  const visualProjects = ['chromium-desktop', 'chromium-mobile', 'chromium-small'];
  test.skip(!visualProjects.includes(testInfo.project.name));
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  const shell = root.locator(':scope > div').first();
  const navigation = page.locator('[data-site-navigation]');
  await expect(shell).toHaveCount(1);
  await expect(navigation).toBeVisible();
  await root.evaluate(element => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top, behavior: 'auto' });
  });
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));

  const geometry = await shell.evaluate((element, navigationElement) => {
    const shellStyles = getComputedStyle(element);
    const navigationRect = (navigationElement as HTMLElement).getBoundingClientRect();
    const shellRect = element.getBoundingClientRect();
    return {
      position: shellStyles.position,
      top: shellStyles.top,
      shellTop: shellRect.top,
      navigationBottom: navigationRect.bottom,
      height: shellRect.height,
      viewportHeight: window.innerHeight,
    };
  }, await navigation.elementHandle());

  expect(geometry.position).toBe('sticky');
  expect(geometry.top).not.toBe('auto');
  expect(geometry.height).toBeGreaterThan(0);
  expect(Math.abs(geometry.navigationBottom - geometry.shellTop)).toBeLessThanOrEqual(1);
  expect(Math.abs(Number.parseFloat(geometry.top) + geometry.height - geometry.viewportHeight))
    .toBeLessThanOrEqual(1);

  if (['chromium-mobile', 'chromium-small'].includes(testInfo.project.name)) {
    await navigation.locator('button:visible').last().click();
    const drawer = page.getByRole('dialog', { name: 'Menú de navegación' });
    await expect(drawer).toBeVisible();
    const drawerGeometry = await drawer.evaluate((element, navigationElement) => ({
      drawerTop: element.getBoundingClientRect().top,
      navigationBottom: (navigationElement as HTMLElement).getBoundingClientRect().bottom,
    }), await navigation.elementHandle());
    expect(Math.abs(drawerGeometry.navigationBottom - drawerGeometry.drawerTop)).toBeLessThanOrEqual(1);
  }
});

test('presenta canales y routing sin prometer routing bancario inteligente', async ({ page }, testInfo) => {
  test.skip(['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const story = page.locator('main[data-scrollytelling]');

  await expect(story).toContainText('Reservación en línea');
  await expect(story).toContainText('Tienda en línea');
  await expect(story).toContainText('Liga de pago');
  await expect(story).toContainText('Punto de venta');
  await expect(story).toContainText('Terminal de cobro');
  await expect(story).toContainText('POS iOS');
  await expect(story).toContainText('POS Android');
  await expect(story).toContainText('POS Desktop');
  await expect(story).toContainText('Cuenta de cobro');
  await expect(story).toContainText('Operación diaria');
  await expect(story).toContainText('TPV compatible');
  await expect(story).not.toContainText('routing inteligente');
  await expect(story).not.toContainText('elige tu cuenta bancaria');
  await expect(story).not.toContainText('Consumer App');
  await expect(story).not.toContainText('Booking Widget');
  await expect(story.getByText('Online', { exact: true })).toHaveCount(0);
});

test('mantiene la verdad crítica visible fuera del chatbot en móvil', async ({ page }, testInfo) => {
  test.skip(!['chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  const chat = page.locator('button[aria-label="Abrir chat de ayuda"]');
  await expect(chat).toBeVisible();

  const moveTo = async (progress: number, scene: string) => {
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);
    await expect(root).toHaveAttribute('data-active-scene', scene);
  };

  const expectClearOfChat = async (locator: ReturnType<typeof page.locator>, minimumFontSize = 0) => {
    await expect(locator).toBeVisible();
    const metrics = await locator.evaluate((element, chatElement) => {
      const rect = element.getBoundingClientRect();
      const chatRect = (chatElement as HTMLElement).getBoundingClientRect();
      const overlapWidth = Math.max(0, Math.min(rect.right, chatRect.right) - Math.max(rect.left, chatRect.left));
      const overlapHeight = Math.max(0, Math.min(rect.bottom, chatRect.bottom) - Math.max(rect.top, chatRect.top));
      return {
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
        insideViewport: rect.top >= 0 && rect.left >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
        overlapArea: overlapWidth * overlapHeight,
      };
    }, await chat.elementHandle());
    expect(metrics.insideViewport).toBe(true);
    expect(metrics.overlapArea).toBe(0);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(minimumFontSize);
  };

  const expectInsideViewport = async (locator: ReturnType<typeof page.locator>, minimumFontSize = 0) => {
    await expect(locator).toBeVisible();
    const metrics = await locator.evaluate(element => {
      const rect = element.getBoundingClientRect();
      return {
        fontSize: Number.parseFloat(getComputedStyle(element).fontSize),
        insideViewport: rect.top >= 0 && rect.left >= 0 && rect.right <= window.innerWidth && rect.bottom <= window.innerHeight,
      };
    });
    expect(metrics.insideViewport).toBe(true);
    expect(metrics.fontSize).toBeGreaterThanOrEqual(minimumFontSize);
  };

  const opening = page.locator('[data-opening-mode="animated"]');
  const channels = opening.locator('[data-opening-channel-handoff]');
  const channelRows = [
    ['online-booking', 'Reservación en línea', 'Reserva confirmada'],
    ['online-store', 'Tienda en línea', 'Pedido recibido'],
    ['payment-link', 'Liga de pago', 'Pago recibido'],
    ['point-of-sale', 'Punto de venta', 'Venta registrada'],
    ['payment-terminal', 'Terminal de cobro', 'Cobro aprobado'],
  ] as const;
  const channelCheckpoints = [
    [0.16, 'online-booking', 'Reservación en línea → Reserva confirmada', 'Facial hidratante', 'María G. · 11:30', 'Sucursal Centro'],
    [0.49, 'payment-link', 'Liga de pago → Pago recibido', '$1,250', 'Liga enviada por WhatsApp', 'Pago con tarjeta'],
    [0.82, 'payment-terminal', 'Terminal de cobro → Cobro aprobado', '$348', 'Pago sin contacto', 'Terminal física · Sucursal Centro'],
  ] as const;

  for (const [progress, id, summary, primary, detail, context] of channelCheckpoints) {
    await scrollChannelSequenceTo(page, progress);
    await expect(chat).toBeHidden();
    await expect(channels.locator('[data-story-primary-pulse]')).toHaveCount(1);

    const activeChannel = channels.locator('[data-channel-active="true"]');
    await expect(activeChannel).toHaveCount(1);
    await expect(activeChannel).toHaveAttribute('data-channel-id', id);

    for (const [rowId, label, result] of channelRows) {
      const row = channels.locator(`[data-channel-id="${rowId}"]`);
      await expect(row).toContainText(label);
      await expect(row).toContainText(result);
      await expectInsideViewport(row.locator('strong'));
      await expectInsideViewport(row.locator('.story-channel-result'));
    }

    const channelSummary = channels.locator('[data-channel-route-summary]:visible');
    const eventPrimary = channels.locator('[data-channel-event-primary]:visible');
    const eventDetail = channels.locator('[data-channel-event-detail]:visible');
    const eventContext = channels.locator('[data-channel-event-context]:visible');
    await expect(channelSummary).toHaveText(summary);
    await expect(eventPrimary).toHaveText(primary);
    await expect(eventDetail).toHaveText(detail);
    await expect(eventContext).toHaveText(context);
    await expectInsideViewport(channelSummary, 8);
    await expectInsideViewport(eventPrimary);
    await expectInsideViewport(eventDetail);
    await expectInsideViewport(eventContext);
  }

  await moveTo(0.07, 'service');
  const service = root.locator('[data-story-scene="service"][data-active="true"]');
  await expect(chat).toBeVisible();
  await expectClearOfChat(service.getByText('Crema facial 50 ml', { exact: true }), 10);
  await expectClearOfChat(service.getByText('POS Desktop · Windows Service', { exact: true }), 10);
  const railGap = await service.locator('.story-service-rail span').evaluateAll(elements => {
    const [first, second] = elements.map(element => element.getBoundingClientRect());
    return second.top > first.top + 1 ? second.top - first.bottom : second.left - first.right;
  });
  expect(railGap).toBeGreaterThanOrEqual(4);

  await moveTo(0.22, 'payment');
  const payment = root.locator('[data-story-scene="payment"][data-active="true"]');
  await expect(chat).toBeHidden();
  await expectInsideViewport(payment.locator('[data-payment-selector]'));
  await expectInsideViewport(payment.getByText('TPV compatible · selección manual', { exact: true }), 10);
  await expectInsideViewport(payment.getByText('Merchant habilitado', { exact: true }), 10);
  await expectInsideViewport(payment.getByText('Disponible', { exact: true }), 10);
  const routeTruth = testInfo.project.name === 'chromium-small'
    ? payment.locator('.story-payment-reference-summary')
    : payment.getByText('Registro manual', { exact: true });
  await expectInsideViewport(routeTruth, 10);

  const selectedMerchant = payment.locator('[data-merchant-selected]');
  const alternateMerchant = payment.locator('[data-merchant-alternate]');
  await expect(payment.locator('[data-story-primary-pulse]')).toHaveCount(0);
  await expect(payment.locator('[data-payment-route-summary]:visible')).toHaveText('TPV → Operación diaria');
  await expect(selectedMerchant).toHaveCount(1);
  await expect(alternateMerchant).toHaveCount(1);
});

test('retargets one measured connector across the three opening results', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/?motion=full');

  const opening = page.locator('[data-opening-mode="animated"]');
  const scene = opening.locator('[data-opening-channel-handoff]');
  const moveTo = async (progress: number) => {
    await scrollChannelSequenceTo(page, progress);
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
  };

  for (const [progress, id] of [
    [0.16, 'online-booking'],
    [0.49, 'payment-link'],
    [0.82, 'payment-terminal'],
    [0.49, 'payment-link'],
    [0.16, 'online-booking'],
  ] as const) {
    await moveTo(progress);
    const activeRow = scene.locator('[data-channel-active="true"]');
    const source = scene.locator('[data-channel-route-source]');
    const target = scene.locator('[data-channel-route-target]');
    const route = scene.locator('[data-channel-route-path]');
    const activeRoute = scene.locator('[data-channel-route-active]');
    const pulse = scene.locator('[data-story-primary-pulse]:visible');

    await expect(activeRow).toHaveAttribute('data-channel-id', id);
    await expect(source).toHaveCount(1);
    await expect(target).toHaveCount(1);
    await expect(route).toHaveCount(1);
    await expect(activeRoute).toHaveCount(1);
    await expect(pulse).toHaveCount(1);

    const distances = await route.evaluate((routeElement, anchors) => {
      const path = routeElement as SVGPathElement;
      const sceneElement = path.closest<HTMLElement>('[data-opening-channel-handoff]')!;
      const active = sceneElement.querySelector<SVGPathElement>('[data-channel-route-active]')!;
      const pulseElement = sceneElement.querySelector<HTMLElement>('[data-story-primary-pulse]')!;
      const matrix = path.getScreenCTM();
      const activeMatrix = active.getScreenCTM();
      if (!matrix || !activeMatrix) throw new Error('Missing opening route matrix');
      const center = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      };
      const screenPoint = (point: DOMPoint, transform: DOMMatrix) => ({
        x: transform.a * point.x + transform.c * point.y + transform.e,
        y: transform.b * point.x + transform.d * point.y + transform.f,
      });
      const sourceCenter = center(anchors.source as HTMLElement);
      const targetCenter = center(anchors.target as HTMLElement);
      const pulseCenter = center(pulseElement);
      const start = screenPoint(path.getPointAtLength(0), matrix);
      const end = screenPoint(path.getPointAtLength(path.getTotalLength()), matrix);
      const drawn = Math.min(Math.max(Number.parseFloat(getComputedStyle(active).strokeDasharray), 0), 1);
      const activeEnd = screenPoint(active.getPointAtLength(active.getTotalLength() * drawn), activeMatrix);
      return {
        source: Math.hypot(start.x - sourceCenter.x, start.y - sourceCenter.y),
        target: Math.hypot(end.x - targetCenter.x, end.y - targetCenter.y),
        activeTarget: Math.hypot(activeEnd.x - targetCenter.x, activeEnd.y - targetCenter.y),
        pulseActive: Math.hypot(pulseCenter.x - activeEnd.x, pulseCenter.y - activeEnd.y),
      };
    }, {
      source: await source.elementHandle(),
      target: await target.elementHandle(),
    });

    expect.soft(distances.source, `${id} source`).toBeLessThanOrEqual(3);
    expect.soft(distances.target, `${id} target`).toBeLessThanOrEqual(3);
    expect.soft(distances.activeTarget, `${id} active route docks`).toBeLessThanOrEqual(3);
    expect.soft(distances.pulseActive, `${id} pulse follows active route`).toBeLessThanOrEqual(3);
  }
});

test('replays the remapped opening connector lifecycle', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/?motion=full');

  const scene = page.locator('[data-opening-channel-handoff]');
  const moveTo = async (progress: number) => {
    await scrollChannelSequenceTo(page, progress);
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));
  };
  const readState = async () => scene.evaluate(element => {
    const source = element.querySelector<HTMLElement>('[data-channel-route-source]')!;
    const target = element.querySelector<HTMLElement>('[data-channel-route-target]')!;
    const pulse = element.querySelector<HTMLElement>('[data-story-primary-pulse]')!;
    const route = element.querySelector<SVGPathElement>('[data-channel-route-path]')!;
    const active = element.querySelector<SVGPathElement>('[data-channel-route-active]')!;
    const event = element.querySelector<HTMLElement>('.story-channel-event')!;
    const matrix = route.getScreenCTM();
    const activeMatrix = active.getScreenCTM();
    if (!matrix || !activeMatrix) throw new Error('Missing lifecycle route matrix');
    const center = (node: Element) => {
      const rect = node.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const screenPoint = (point: DOMPoint, transform: DOMMatrix) => ({
      x: transform.a * point.x + transform.c * point.y + transform.e,
      y: transform.b * point.x + transform.d * point.y + transform.f,
    });
    const distance = (first: { x: number; y: number }, second: { x: number; y: number }) =>
      Math.hypot(first.x - second.x, first.y - second.y);
    const sourceCenter = center(source);
    const targetCenter = center(target);
    const pulseCenter = center(pulse);
    const start = screenPoint(route.getPointAtLength(0), matrix);
    const end = screenPoint(route.getPointAtLength(route.getTotalLength()), matrix);
    const drawn = Math.min(Math.max(Number.parseFloat(getComputedStyle(active).strokeDasharray), 0), 1);
    const activeEnd = screenPoint(active.getPointAtLength(active.getTotalLength() * drawn), activeMatrix);
    const eventStyles = getComputedStyle(event);
    return {
      id: element.querySelector<HTMLElement>('[data-channel-active="true"]')!.dataset.channelId,
      drawn,
      sourceRoute: distance(start, sourceCenter),
      targetRoute: distance(end, targetCenter),
      pulseSource: distance(pulseCenter, sourceCenter),
      pulseTarget: distance(pulseCenter, targetCenter),
      activeSource: distance(activeEnd, sourceCenter),
      activeTarget: distance(activeEnd, targetCenter),
      pulseActive: distance(pulseCenter, activeEnd),
      eventOpacity: Number.parseFloat(eventStyles.opacity),
      eventTranslateY: new DOMMatrixReadOnly(eventStyles.transform).m42,
      routeOpacity: Number.parseFloat(getComputedStyle(active.parentElement!).opacity),
      pulseOpacity: Number.parseFloat(getComputedStyle(pulse).opacity),
    };
  });

  await moveTo(0.04);
  await expect(scene.locator('[data-channel-route-path]')).toHaveCount(1);
  const sourceStart = await readState();
  expect(sourceStart.id).toBe('online-booking');
  expect.soft(sourceStart.sourceRoute).toBeLessThanOrEqual(3);
  expect.soft(sourceStart.targetRoute).toBeLessThanOrEqual(3);
  expect.soft(sourceStart.pulseSource).toBeLessThanOrEqual(3);
  expect.soft(sourceStart.activeSource).toBeLessThanOrEqual(3);
  expect.soft(sourceStart.pulseActive).toBeLessThanOrEqual(3);
  expect.soft(sourceStart.drawn).toBeLessThanOrEqual(0.01);

  const forward = [];
  for (const progress of [0.04, 0.06, 0.08, 0.10]) {
    await moveTo(progress);
    forward.push({ progress, ...await readState() });
  }
  for (let index = 1; index < forward.length; index += 1) {
    expect.soft(forward[index].pulseTarget, `forward pulse approaches at ${forward[index].progress}`)
      .toBeLessThanOrEqual(forward[index - 1].pulseTarget + 3);
    expect.soft(forward[index].activeTarget, `forward stroke approaches at ${forward[index].progress}`)
      .toBeLessThanOrEqual(forward[index - 1].activeTarget + 3);
    expect.soft(forward[index].drawn, `forward stroke grows at ${forward[index].progress}`)
      .toBeGreaterThanOrEqual(forward[index - 1].drawn);
    expect.soft(forward[index].pulseActive, `pulse follows stroke at ${forward[index].progress}`)
      .toBeLessThanOrEqual(3);
  }
  expect.soft(forward[1].pulseTarget).toBeLessThan(forward[0].pulseTarget - 3);
  expect.soft(forward[1].pulseTarget).toBeGreaterThan(3);
  expect.soft(forward[1].drawn).toBeGreaterThan(forward[0].drawn + 0.01);
  expect.soft(forward.at(-1)!.pulseTarget).toBeLessThanOrEqual(3);
  expect.soft(forward.at(-1)!.activeTarget).toBeLessThanOrEqual(3);

  await moveTo(0.16);
  const docked = await readState();
  expect.soft(docked.pulseTarget).toBeLessThanOrEqual(3);
  expect.soft(docked.activeTarget).toBeLessThanOrEqual(3);
  expect.soft(docked.pulseActive).toBeLessThanOrEqual(3);
  expect.soft(docked.drawn).toBeGreaterThanOrEqual(0.98);

  const reverse = [];
  for (const progress of [0.10, 0.08, 0.06, 0.04, 0.03, 0.01, -0.05]) {
    await moveTo(progress);
    reverse.push({ progress, ...await readState() });
  }
  for (let index = 1; index < 4; index += 1) {
    expect.soft(reverse[index].pulseTarget, `reverse pulse returns at ${reverse[index].progress}`)
      .toBeGreaterThanOrEqual(reverse[index - 1].pulseTarget - 3);
    expect.soft(reverse[index].activeTarget, `reverse stroke returns at ${reverse[index].progress}`)
      .toBeGreaterThanOrEqual(reverse[index - 1].activeTarget - 3);
    expect.soft(reverse[index].pulseActive, `reverse pulse follows stroke at ${reverse[index].progress}`)
      .toBeLessThanOrEqual(3);
  }
  expect.soft(reverse[3].pulseSource).toBeLessThanOrEqual(3);
  expect.soft(reverse[3].activeSource).toBeLessThanOrEqual(3);

  const reverseFade = reverse.slice(4);
  for (let index = 1; index < reverseFade.length; index += 1) {
    expect.soft(reverseFade[index].eventOpacity, `event fades at ${reverseFade[index].progress}`)
      .toBeLessThanOrEqual(reverseFade[index - 1].eventOpacity + 0.02);
    expect.soft(reverseFade[index].routeOpacity, `route fades at ${reverseFade[index].progress}`)
      .toBeLessThanOrEqual(reverseFade[index - 1].routeOpacity + 0.02);
    expect.soft(reverseFade[index].pulseOpacity, `pulse fades at ${reverseFade[index].progress}`)
      .toBeLessThanOrEqual(reverseFade[index - 1].pulseOpacity + 0.02);
  }
  for (const sample of reverseFade) {
    expect.soft(sample.routeOpacity + 0.05, `route does not hide before event at ${sample.progress}`)
      .toBeGreaterThanOrEqual(sample.eventOpacity);
  }
  for (const sample of reverse) {
    if (sample.pulseOpacity > 0.05) {
      expect.soft(sample.pulseActive, `visible reverse pulse follows stroke at ${sample.progress}`)
        .toBeLessThanOrEqual(3);
    }
  }
  expect.soft(reverseFade[0].eventOpacity).toBeGreaterThan(0.5);
  expect.soft(reverseFade[0].eventOpacity).toBeLessThan(0.95);
  expect.soft(reverseFade[0].routeOpacity).toBeGreaterThanOrEqual(0.95);
  expect.soft(reverseFade[1].routeOpacity).toBeGreaterThan(reverseFade[1].eventOpacity + 0.25);

  const reset = reverseFade.at(-1)!;
  expect.soft(reset.eventOpacity).toBeLessThanOrEqual(0.05);
  expect.soft(reset.routeOpacity).toBeLessThanOrEqual(0.05);
  expect.soft(reset.pulseOpacity).toBeLessThanOrEqual(0.05);
  expect.soft(reset.pulseSource).toBeLessThanOrEqual(3);
  expect.soft(reset.activeSource).toBeLessThanOrEqual(3);
  expect.soft(reset.drawn).toBeLessThanOrEqual(0.01);
  expect.soft(reset.eventTranslateY).toBeGreaterThanOrEqual(7);

  await moveTo(0.04);
  const replay = await readState();
  expect(replay.id).toBe('online-booking');
  expect.soft(replay.pulseSource).toBeLessThanOrEqual(3);
  expect.soft(replay.activeSource).toBeLessThanOrEqual(3);
  expect.soft(replay.pulseActive).toBeLessThanOrEqual(3);
  expect.soft(replay.drawn).toBeLessThanOrEqual(0.01);
  expect.soft(replay.eventOpacity).toBeGreaterThanOrEqual(0.95);
  expect.soft(replay.routeOpacity).toBeGreaterThanOrEqual(0.95);
  expect.soft(replay.pulseOpacity).toBeGreaterThanOrEqual(0.95);
});

test('mantiene el conector dentro del panel en todos los viewports', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/');

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 910, height: 691 },
    { width: 787, height: 701 },
    { width: 887, height: 502 },
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    const opening = page.locator('[data-opening-mode="animated"]');
    const scene = opening.locator('[data-opening-channel-handoff]');
    for (const [progress, id] of [
      [0.16, 'online-booking'],
      [0.49, 'payment-link'],
      [0.82, 'payment-terminal'],
    ] as const) {
      await scrollChannelSequenceTo(page, progress);
      await page.evaluate(() => new Promise<void>(resolve => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      }));

      await expect(scene.locator('[data-channel-active="true"]')).toHaveAttribute('data-channel-id', id);
      const geometry = await scene.evaluate(element => {
        const rect = (selector: string) => element.querySelector<HTMLElement>(selector)!.getBoundingClientRect();
        const visual = rect('.story-channel-visual');
        const ledger = rect('.story-channel-ledger');
        const event = rect('.story-channel-event');
        const result = rect('[data-channel-active="true"] .story-channel-result');
        const source = rect('[data-channel-route-source]');
        const target = rect('[data-channel-route-target]');
        const pulse = rect('[data-story-primary-pulse]');
        const path = element.querySelector<SVGPathElement>('[data-channel-route-path]')!;
        const activePath = element.querySelector<SVGPathElement>('[data-channel-route-active]')!;
        const matrix = path.getScreenCTM();
        const activeMatrix = activePath.getScreenCTM();
        if (!matrix || !activeMatrix) throw new Error('Missing responsive channel route matrix');
        const toScreen = (point: DOMPoint) => ({
          x: matrix.a * point.x + matrix.c * point.y + matrix.e,
          y: matrix.b * point.x + matrix.d * point.y + matrix.f,
        });
        const activeToScreen = (point: DOMPoint) => ({
          x: activeMatrix.a * point.x + activeMatrix.c * point.y + activeMatrix.e,
          y: activeMatrix.b * point.x + activeMatrix.d * point.y + activeMatrix.f,
        });
        const center = (box: DOMRect) => ({ x: box.left + box.width / 2, y: box.top + box.height / 2 });
        const start = toScreen(path.getPointAtLength(0));
        const end = toScreen(path.getPointAtLength(path.getTotalLength()));
        const sourceCenter = center(source);
        const targetCenter = center(target);
        const pulseCenter = center(pulse);
        const drawnLength = Number.parseFloat(getComputedStyle(activePath).strokeDasharray);
        const activeEndpoint = activeToScreen(activePath.getPointAtLength(
          activePath.getTotalLength() * Math.min(Math.max(drawnLength, 0), 1),
        ));
        const routeTopology = (path.getAttribute('d')?.match(/[MHVL]/g) ?? []).join('');
        return {
          visual: { top: visual.top, right: visual.right, bottom: visual.bottom, left: visual.left },
          ledger: { top: ledger.top, right: ledger.right, bottom: ledger.bottom, left: ledger.left },
          event: { top: event.top, right: event.right, bottom: event.bottom, left: event.left },
          result: { top: result.top, right: result.right, bottom: result.bottom, left: result.left },
          source: { top: source.top, right: source.right, bottom: source.bottom, left: source.left },
          sourceCenter,
          targetCenter,
          pulseCenter,
          sourceDistance: Math.hypot(start.x - sourceCenter.x, start.y - sourceCenter.y),
          targetDistance: Math.hypot(end.x - targetCenter.x, end.y - targetCenter.y),
          pulseTargetDistance: Math.hypot(pulseCenter.x - targetCenter.x, pulseCenter.y - targetCenter.y),
          activeTargetDistance: Math.hypot(activeEndpoint.x - targetCenter.x, activeEndpoint.y - targetCenter.y),
          routeTopology,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: window.innerWidth,
        };
      });

      for (const panel of [geometry.ledger, geometry.event]) {
        expect.soft(panel.top).toBeGreaterThanOrEqual(geometry.visual.top - 1);
        expect.soft(panel.bottom).toBeLessThanOrEqual(geometry.visual.bottom + 1);
        expect.soft(panel.left).toBeGreaterThanOrEqual(geometry.visual.left - 1);
        expect.soft(panel.right).toBeLessThanOrEqual(geometry.visual.right + 1);
      }
      for (const point of [geometry.sourceCenter, geometry.targetCenter, geometry.pulseCenter]) {
        expect.soft(point.x).toBeGreaterThanOrEqual(geometry.visual.left - 1);
        expect.soft(point.x).toBeLessThanOrEqual(geometry.visual.right + 1);
        expect.soft(point.y).toBeGreaterThanOrEqual(geometry.visual.top - 1);
        expect.soft(point.y).toBeLessThanOrEqual(geometry.visual.bottom + 1);
      }
      expect.soft(geometry.sourceDistance).toBeLessThanOrEqual(3);
      expect.soft(geometry.targetDistance).toBeLessThanOrEqual(3);
      expect.soft(
        geometry.pulseTargetDistance,
        `${viewport.width}×${viewport.height} pulse reaches target`,
      ).toBeLessThanOrEqual(3);
      expect.soft(
        geometry.activeTargetDistance,
        `${viewport.width}×${viewport.height} active route reaches target`,
      ).toBeLessThanOrEqual(3);
      expect.soft(
        geometry.routeTopology,
        `${viewport.width}×${viewport.height} route follows the rendered panel layout`,
      ).toBe(viewport.width >= 640 ? 'MHVH' : 'MVH');
      if (viewport.width >= 640) {
        expect.soft(
          geometry.source.left - geometry.result.right,
          `${viewport.width}×${viewport.height} result/source gutter`,
        ).toBeGreaterThanOrEqual(6);
      }
      expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
    }

    if (viewport.width < 1024) {
      await expect(page.locator('button[aria-label="Abrir chat de ayuda"]')).toBeHidden();
    } else {
      await expect(page.locator('button[aria-label="Abrir chat de ayuda"]')).toBeVisible();
    }
  }
});

test('remide el origen después de un cambio de transform', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?motion=full');

  const opening = page.locator('[data-opening-mode="animated"]');
  await scrollOpeningTo(page, 0.84 + 0.52 * (0.94 - 0.84));
  const scene = opening.locator('[data-opening-channel-handoff]');
  const sourceRow = scene.locator('.story-channel-row[data-channel-active="true"]');
  await sourceRow.evaluate(element => {
    (element as HTMLElement).style.transform = 'translateX(-14px)';
  });
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }));

  const source = scene.locator('[data-channel-route-source]');
  const route = scene.locator('[data-channel-route-path]');
  const sourceDistance = await route.evaluate((routeElement, sourceElement) => {
    const path = routeElement as SVGPathElement;
    const matrix = path.getScreenCTM();
    if (!matrix) throw new Error('Missing restored channel route matrix');
    const start = path.getPointAtLength(0);
    const screenStart = {
      x: matrix.a * start.x + matrix.c * start.y + matrix.e,
      y: matrix.b * start.x + matrix.d * start.y + matrix.f,
    };
    const sourceRect = (sourceElement as HTMLElement).getBoundingClientRect();
    return Math.hypot(
      screenStart.x - (sourceRect.left + sourceRect.width / 2),
      screenStart.y - (sourceRect.top + sourceRect.height / 2),
    );
  }, await source.elementHandle());

  expect(sourceDistance).toBeLessThanOrEqual(3);
});

test('entrega la reserva web a la agenda en un solo sentido', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  await expect(root).toBeVisible();

  const moveToLocalProgress = async (localProgress: number) => {
    const globalProgress = localProgress * 0.14;
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, globalProgress);
    await expect(root).toHaveAttribute('data-active-scene', 'service');
  };

  const scene = root.locator('[data-story-scene="service"][data-active="true"]');
  const sourceCard = scene.locator('[data-service-source-card]');
  const source = scene.locator('[data-service-pulse-source]');
  const destination = scene.locator('[data-service-pulse-destination]');
  const target = scene.locator('[data-service-pulse-target]');
  const pulse = scene.locator('[data-story-primary-pulse]:visible');
  const route = scene.locator('[data-service-route-path]');
  const activeRoute = scene.locator('[data-service-route-active]');

  await moveToLocalProgress(0.12);
  await expect(sourceCard).toHaveCount(1);
  await expect(sourceCard).toContainText('Reserva web');
  await expect(sourceCard).toContainText('Reservación en línea');
  await expect(source).toHaveCount(1);
  await expect(destination).toContainText('Contexto listo');
  await expect(target).toHaveCount(1);
  await expect(pulse).toHaveCount(1);
  await expect(route).toHaveCount(1);
  await expect(activeRoute).toHaveCount(1);
  await expect(root.locator('[data-story-pulse-dock]:visible')).toHaveCount(0);

  const sourceAgendaGap = await sourceCard.evaluate((sourceElement, agendaElement) => {
    const sourceRect = sourceElement.getBoundingClientRect();
    const agendaRect = (agendaElement as HTMLElement).getBoundingClientRect();
    return agendaRect.top - sourceRect.bottom;
  }, await scene.locator('.story-service-agenda').elementHandle());
  expect.soft(sourceAgendaGap, 'named source remains clear of the agenda').toBeGreaterThanOrEqual(6);

  const readPulseDistance = async (destination: typeof source) => pulse.evaluate((pulseElement, destinationElement) => {
    const pulseRect = pulseElement.getBoundingClientRect();
    const targetRect = (destinationElement as HTMLElement).getBoundingClientRect();
    return Math.hypot(
      pulseRect.left + pulseRect.width / 2 - (targetRect.left + targetRect.width / 2),
      pulseRect.top + pulseRect.height / 2 - (targetRect.top + targetRect.height / 2),
    );
  }, await destination.elementHandle());
  expect(await readPulseDistance(source)).toBeLessThanOrEqual(3);

  const endpoints = await route.evaluate((routeElement, destinations) => {
    const path = routeElement as SVGPathElement;
    const matrix = path.getScreenCTM();
    if (!matrix) throw new Error('Missing service route matrix');
    const toScreen = (point: DOMPoint) => ({
      x: matrix.a * point.x + matrix.c * point.y + matrix.e,
      y: matrix.b * point.x + matrix.d * point.y + matrix.f,
    });
    const center = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const start = toScreen(path.getPointAtLength(0));
    const end = toScreen(path.getPointAtLength(path.getTotalLength()));
    const sourceCenter = center(destinations.source as HTMLElement);
    const targetCenter = center(destinations.target as HTMLElement);
    return {
      source: Math.hypot(start.x - sourceCenter.x, start.y - sourceCenter.y),
      target: Math.hypot(end.x - targetCenter.x, end.y - targetCenter.y),
    };
  }, {
    source: await source.elementHandle(),
    target: await target.elementHandle(),
  });
  expect.soft(endpoints.source, 'route begins at the named source').toBeLessThanOrEqual(3);
  expect.soft(endpoints.target, 'route ends at the context-ready state').toBeLessThanOrEqual(3);

  const targetDistances: number[] = [];
  for (const localProgress of [0.12, 0.24, 0.38, 0.5, 0.58]) {
    await moveToLocalProgress(localProgress);
    targetDistances.push(await readPulseDistance(target));

    const activeEndpointDistance = await pulse.evaluate((pulseElement, routeElement) => {
      const pulseRect = pulseElement.getBoundingClientRect();
      const pulseCenter = {
        x: pulseRect.left + pulseRect.width / 2,
        y: pulseRect.top + pulseRect.height / 2,
      };
      const path = routeElement as SVGPathElement;
      const matrix = path.getScreenCTM();
      if (!matrix) throw new Error('Missing active service route matrix');
      const drawnLength = Number.parseFloat(getComputedStyle(path).strokeDasharray);
      const point = path.getPointAtLength(path.getTotalLength() * Math.min(Math.max(drawnLength, 0), 1));
      const endpoint = {
        x: matrix.a * point.x + matrix.c * point.y + matrix.e,
        y: matrix.b * point.x + matrix.d * point.y + matrix.f,
      };
      return Math.hypot(pulseCenter.x - endpoint.x, pulseCenter.y - endpoint.y);
    }, await activeRoute.elementHandle());
    expect.soft(activeEndpointDistance, `pulse leads the route at ${localProgress}`).toBeLessThanOrEqual(3);
  }

  for (let index = 1; index < targetDistances.length; index += 1) {
    expect.soft(
      targetDistances[index],
      `pulse never reverses at sample ${index}`,
    ).toBeLessThanOrEqual(targetDistances[index - 1] + 3);
  }

  for (const localProgress of [0.58, 0.72, 0.88]) {
    await moveToLocalProgress(localProgress);
    expect.soft(await readPulseDistance(target), `pulse remains delivered at ${localProgress}`).toBeLessThanOrEqual(3);
  }

  if (testInfo.project.name === 'chromium-desktop') {
    await moveToLocalProgress(0.3);
    await page.setViewportSize({ width: 1180, height: 760 });
    await moveToLocalProgress(0.72);
    await expect.poll(() => readPulseDistance(target)).toBeLessThanOrEqual(3);
  }

  const railGap = await scene.locator('.story-service-rail span').evaluateAll(elements => {
    const [first, second] = elements.map(element => element.getBoundingClientRect());
    return second.top > first.top + 1 ? second.top - first.bottom : second.left - first.right;
  });
  expect(railGap).toBeGreaterThanOrEqual(6);
  expect(await scene.locator('.story-service-rail span').allTextContents()).toEqual([
    'POS iOS · POS Android',
    'POS Desktop · Windows Service',
  ]);

  const accessibleSummary = scene.locator('.sr-only');
  await expect(accessibleSummary).toContainText('La reserva web llega a la agenda');
  await expect(accessibleSummary).toContainText('POS iOS, POS Android, POS Desktop y Windows Service');
});

test('explica el cobro sin rutas ni puntos decorativos', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  const localProgress = 0.78;
  const globalProgress = 0.13 + localProgress * (0.30 - 0.13);
  await root.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await expect(root).toHaveAttribute('data-active-scene', 'payment');

  const scene = root.locator('[data-story-scene="payment"][data-active="true"]');
  await expect(scene.locator('.story-payment-visual > svg')).toHaveCount(0);
  await expect(scene.locator('[data-story-primary-pulse]')).toHaveCount(0);
  await expect(scene.locator('.story-payment-reference-grid span.h-px')).toHaveCount(0);
  await expect(scene.locator('[data-payment-route-summary]:visible')).toHaveText('TPV → Operación diaria');
  await expect(scene.getByText('TPV compatible · selección manual', { exact: true })).toBeVisible();
  await expect(scene.getByText('Merchant habilitado', { exact: true })).toBeVisible();
});

test('mantiene el cobro dentro de su panel en desktop compacto', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/');

  for (const viewport of [
    { width: 787, height: 701 },
    { width: 887, height: 502 },
  ]) {
    await page.setViewportSize(viewport);
    const root = page.locator('[data-story-mode="animated"]');
    const localProgress = 0.78;
    const globalProgress = 0.13 + localProgress * (0.30 - 0.13);
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, globalProgress);
    await expect(root).toHaveAttribute('data-active-scene', 'payment');
    await expect(page.locator('[data-homepage-chatbot]')).toHaveCount(1);
    await expect(page.getByRole('button', { name: 'Abrir chat de ayuda' })).toBeHidden();

    const scene = root.locator('[data-story-scene="payment"][data-active="true"]');
    const geometry = await scene.evaluate(element => {
      const visual = element.querySelector('.story-payment-visual')!.getBoundingClientRect();
      const selectedMerchant = element.querySelector('[data-merchant-selected]')!;
      const selector = selectedMerchant.parentElement!.parentElement!.parentElement!.getBoundingClientRect();
      const referenceGrid = element.querySelector('.story-payment-reference-grid')!;
      const references = referenceGrid.getBoundingClientRect();
      const lastReference = referenceGrid.lastElementChild!.getBoundingClientRect();
      return {
        visual: { top: visual.top, right: visual.right, bottom: visual.bottom, left: visual.left },
        selector: { top: selector.top, right: selector.right, bottom: selector.bottom, left: selector.left },
        references: { top: references.top, right: references.right, bottom: references.bottom, left: references.left },
        referenceTailGap: references.bottom - lastReference.bottom,
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: window.innerWidth,
      };
    });

    for (const panel of [geometry.selector, geometry.references]) {
      expect.soft(panel.top, `${viewport.width}×${viewport.height} top`).toBeGreaterThanOrEqual(geometry.visual.top - 1);
      expect.soft(panel.bottom, `${viewport.width}×${viewport.height} bottom`).toBeLessThanOrEqual(geometry.visual.bottom + 1);
      expect.soft(panel.left, `${viewport.width}×${viewport.height} left`).toBeGreaterThanOrEqual(geometry.visual.left - 1);
      expect.soft(panel.right, `${viewport.width}×${viewport.height} right`).toBeLessThanOrEqual(geometry.visual.right + 1);
    }
    expect(geometry.referenceTailGap, `${viewport.width}×${viewport.height} reference tail gap`)
      .toBeLessThanOrEqual(2);
    expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
  }
});

test('explica el post-servicio sin rutas ni puntos decorativos', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  await expect(root).toBeVisible();
  const localProgress = 0.78;
  const globalProgress = 0.29 + localProgress * (0.44 - 0.29);
  await root.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await expect(root).toHaveAttribute('data-active-scene', 'aftercare');

  const scene = root.locator('[data-story-scene="aftercare"][data-active="true"]');
  await expect(scene.getByText('Recibo digital', { exact: true })).toBeVisible();
  await expect(scene.getByText('Desde este recibo', { exact: true })).toBeVisible();
  await expect(scene.getByText('Reseña en Google', { exact: true })).toBeVisible();
  await expect(scene.getByText('Factúrate desde tu recibo', { exact: true })).toBeVisible();
  await expect(scene.getByText('Tu cliente captura sus datos y recibe su CFDI.', { exact: true })).toBeVisible();
  await expect(scene.locator('.story-aftercare-visual > svg')).toHaveCount(0);
  await expect(scene.locator('.story-aftercare-visual > span.rounded-full')).toHaveCount(0);
  await expect(scene.locator('[data-story-primary-pulse]')).toHaveCount(0);
});

test('mantiene el post-servicio dentro de su panel en desktop compacto', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.setViewportSize({ width: 887, height: 502 });
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  const localProgress = 0.78;
  const globalProgress = 0.29 + localProgress * (0.44 - 0.29);
  await root.evaluate((element, value) => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * value, behavior: 'auto' });
  }, globalProgress);
  await expect(root).toHaveAttribute('data-active-scene', 'aftercare');

  const scene = root.locator('[data-story-scene="aftercare"][data-active="true"]');
  const geometry = await scene.evaluate(element => {
    const visual = element.querySelector('.story-frame-visual')!.getBoundingClientRect();
    const receipt = element.querySelector('.story-aftercare-receipt')!.getBoundingClientRect();
    const outcomes = element.querySelector('.story-aftercare-outcomes')!.getBoundingClientRect();
    return {
      visual: { top: visual.top, right: visual.right, bottom: visual.bottom, left: visual.left },
      receipt: { top: receipt.top, right: receipt.right, bottom: receipt.bottom, left: receipt.left },
      outcomes: { top: outcomes.top, right: outcomes.right, bottom: outcomes.bottom, left: outcomes.left },
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
    };
  });

  for (const panel of [geometry.receipt, geometry.outcomes]) {
    expect.soft(panel.top).toBeGreaterThanOrEqual(geometry.visual.top - 1);
    expect.soft(panel.bottom).toBeLessThanOrEqual(geometry.visual.bottom + 1);
    expect.soft(panel.left).toBeGreaterThanOrEqual(geometry.visual.left - 1);
    expect.soft(panel.right).toBeLessThanOrEqual(geometry.visual.right + 1);
  }
  expect(geometry.documentWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);
});

test('mantiene un solo pulso primario durante los handoffs', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');
  const root = page.locator('[data-story-mode="animated"]');

  await expect(root).toBeVisible();
  await page.evaluate(() => new Promise<void>(resolve => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  }));

  const readNodeAlignment = async (
    progress: number,
    scene: 'operations' | 'finance',
    stage: string,
  ) => {
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);
    await expect(root).toHaveAttribute('data-active-scene', scene);

    const panel = root.locator(
      `[data-story-scene="${scene}"][data-active="true"] [data-story-panel="${scene}"]`,
    );
    await expect(panel).toBeVisible();
    return panel.evaluate((panelElement, stageTitle) => {
      const pulse = panelElement.querySelector<HTMLElement>('[data-story-primary-pulse]');
      const node = panelElement.querySelector<HTMLElement>(
        `[data-story-cascade-stage="${stageTitle}"] [data-story-cascade-node]`,
      );
      if (!pulse || !node) throw new Error(`Missing cascade geometry for ${stageTitle}`);

      const pulseRect = pulse.getBoundingClientRect();
      const nodeRect = node.getBoundingClientRect();
      const pulseCenter = {
        x: pulseRect.left + pulseRect.width / 2,
        y: pulseRect.top + pulseRect.height / 2,
      };
      const nodeCenter = {
        x: nodeRect.left + nodeRect.width / 2,
        y: nodeRect.top + nodeRect.height / 2,
      };
      return Math.hypot(
        pulseCenter.x - nodeCenter.x,
        pulseCenter.y - nodeCenter.y,
      );
    }, stage);
  };

  const operationsNodeDistance = await readNodeAlignment(
    0.43 + 0.54 * (0.62 - 0.43),
    'operations',
    'Reorden sugerido',
  );
  const financeNodeDistance = await readNodeAlignment(
    0.61 + 0.54 * (0.75 - 0.61),
    'finance',
    'Liquidación esperada',
  );
  expect.soft(operationsNodeDistance, 'operations pulse follows the visible node').toBeLessThanOrEqual(3);
  expect.soft(financeNodeDistance, 'finance pulse follows the visible node').toBeLessThanOrEqual(3);

  for (const [progress, expectedScene, expectedPulseCount] of [
    [0.01, 'service', 1],
    [0.14, 'payment', 0],
    [0.30, 'aftercare', 0],
    [0.59, 'operations', 1],
    [0.73, 'finance', 1],
  ] as const) {
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);

    await expect(root).toHaveAttribute('data-active-scene', expectedScene);
    await page.evaluate(() => new Promise<void>(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    }));

    const activeScene = root.locator(
      `[data-story-scene="${expectedScene}"][data-active="true"]`,
    );
    if (expectedScene === 'operations' || expectedScene === 'finance') {
      await expect(activeScene.locator('[data-story-cascade-path]')).toHaveCount(1);
      await expect(activeScene.locator('[data-story-primary-pulse]')).toHaveCount(1);
    }

    const visiblePrimaryPulses = await root.locator('[data-story-primary-pulse]').evaluateAll(elements =>
      elements.filter(element => {
        let opacity = 1;
        let current: Element | null = element;
        while (current && current !== document.documentElement) {
          opacity *= Number.parseFloat(getComputedStyle(current).opacity || '1');
          current = current.parentElement;
        }
        const rect = element.getBoundingClientRect();
        return opacity > 0.05 && rect.width > 0 && rect.height > 0;
      }).length,
    );
    expect(
      visiblePrimaryPulses,
      `${expectedScene} exposes ${expectedPulseCount} primary pulse${expectedPulseCount === 1 ? '' : 's'}`,
    ).toBe(expectedPulseCount);
  }

  const readCascadePulse = async (progress: number, scene: 'operations' | 'finance') => {
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);
    await expect(root).toHaveAttribute('data-active-scene', scene);

    const pulse = root.locator(
      `[data-story-scene="${scene}"][data-active="true"] [data-story-primary-pulse]`,
    );
    await expect(pulse).toBeVisible();
    return pulse.evaluate(element => {
      const rect = element.getBoundingClientRect();
      const styles = getComputedStyle(element);
      return {
        center: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
        inlineTop: (element as HTMLElement).style.top,
        inlineTransform: (element as HTMLElement).style.transform,
        boxShadow: styles.boxShadow,
      };
    });
  };

  const routedPulse = await readCascadePulse(0.525, 'operations');
  expect.soft(routedPulse.inlineTop).toBe('');
  expect.soft(routedPulse.inlineTransform).toContain('translateX(');
  expect.soft(routedPulse.inlineTransform).toContain('translateY(');
  expect.soft(routedPulse.boxShadow).toBe('none');

  const operationsDock = await readCascadePulse(0.606, 'operations');
  const financeDock = await readCascadePulse(0.613, 'finance');
  expect.soft(operationsDock.inlineTop).toBe('');
  expect.soft(financeDock.inlineTop).toBe('');
  expect(
    Math.hypot(
      operationsDock.center.x - financeDock.center.x,
      operationsDock.center.y - financeDock.center.y,
    ),
  ).toBeLessThanOrEqual(4);
});

test('mantiene una venta coherente desde operación hasta contabilidad', async ({ page }, testInfo) => {
  test.skip(['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const story = page.locator('main[data-scrollytelling]');

  await expect(story).toContainText('$348.10');
  await expect(story).toContainText('Crema facial 50 ml −1');
  await expect(story).toContainText('María G. +29 puntos');
  await expect(story).toContainText('Ana Torres +$29.50');
  await expect(story).toContainText('Reorden sugerido');
  await expect(story).toContainText('Liquidación esperada');
  await expect(story).toContainText('Conciliación');
  await expect(story).toContainText('Póliza');
  await expect(story).toContainText('En cascada');
  await expect(story).not.toContainText('5 efectos');
  await expect(story).not.toContainText('Liquidación garantizada');

  const root = page.locator('[data-story-mode="animated"]');
  const operationsScene = root.locator('[data-story-scene="operations"]');
  const financeScene = root.locator('[data-story-scene="finance"]');

  await expect(operationsScene.locator('.sr-only')).toContainText(
    'La venta de $348.10 atendida por Ana Torres descuenta una unidad de Crema facial 50 ml, cambia el stock de 8 a 7, sugiere reorden, suma 29 puntos a María G. y registra una comisión de $29.50.',
  );
  await expect(financeScene.locator('.sr-only')).toContainText(
    'El pago de $348.10 en Operación diaria sigue la ruta Costo, Liquidación esperada, Conciliación y Póliza; la liquidación se presenta como esperada, no garantizada.',
  );

  for (const [scene, sceneRoot] of [
    ['operations', operationsScene],
    ['finance', financeScene],
  ] as const) {
    const panel = sceneRoot.locator(`[data-story-panel="${scene}"]`);
    await expect(panel).toHaveCount(1);
    await expect(panel.locator('[data-story-cascade-path]')).toHaveCount(1);
    await expect(panel.locator('[data-story-primary-pulse]')).toHaveCount(1);
  }

  if (['chromium-mobile', 'chromium-small'].includes(testInfo.project.name)) {
    for (const [progress, scene] of [
      [0.59, 'operations'],
      [0.73, 'finance'],
    ] as const) {
      await root.evaluate((element, value) => {
        document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
        const top = element.getBoundingClientRect().top + window.scrollY;
        const distance = element.scrollHeight - window.innerHeight;
        window.scrollTo({ top: top + distance * value, behavior: 'auto' });
      }, progress);
      await expect(root).toHaveAttribute('data-active-scene', scene);

      const panel = root.locator(
        `[data-story-scene="${scene}"][data-active="true"] [data-story-panel="${scene}"]`,
      );
      await expect(panel).toBeVisible();
      const geometry = await panel.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return {
          left: rect.left,
          right: rect.right,
          width: rect.width,
          top: rect.top,
          bottom: rect.bottom,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          documentScrollWidth: document.documentElement.scrollWidth,
        };
      });
      expect(geometry.left).toBeGreaterThanOrEqual(-1);
      expect(geometry.right).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.width).toBeLessThanOrEqual(geometry.viewportWidth + 1);
      expect(geometry.top).toBeGreaterThanOrEqual(-1);
      expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight + 1);
      expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(geometry.documentScrollWidth).toBeLessThanOrEqual(geometry.viewportWidth + 1);

      const panelCopy = panel.locator('[data-story-panel-copy]');
      expect(await panelCopy.count()).toBeGreaterThan(0);
      const fontSizes = await panelCopy.evaluateAll(elements =>
        elements.map(element => Number.parseFloat(getComputedStyle(element).fontSize)),
      );
      expect(Math.min(...fontSizes)).toBeGreaterThanOrEqual(10);
    }
  }
});

test('cierra con control multi-sucursal y una pregunta accionable', async ({ page }, testInfo) => {
  test.skip(['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const story = page.locator('main[data-scrollytelling]');

  await expect(story).toContainText('Organización');
  await expect(story).toContainText('Zonas');
  await expect(story).toContainText('Sucursal Centro');
  await expect(story).toContainText('Sucursal Norte');
  await expect(story).toContainText('Cambia de sucursal sin cerrar sesión');
  await expect(story).toContainText('¿Qué sucursal bajó su ticket');

  const root = page.locator('[data-story-mode="animated"]');
  await root.evaluate(element => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * 0.94, behavior: 'auto' });
  });
  await expect(root).toHaveAttribute('data-active-scene', 'ai');
  await expect(story.getByRole('link', { name: 'Quiero verlo en mi negocio' })).toHaveAttribute(
    'href',
    /\/wa\?src=homepage_story_final/,
  );
});

test('recupera el cierre ilustrado y deja abrir el asistente', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.addInitScript(() => localStorage.removeItem('avoqado-chat-open'));
  await page.goto('/?motion=full');

  const invitation = page.locator('[data-homepage-chatbot-invitation]');
  await expect(invitation).toHaveCount(1);
  await expect(invitation).toContainText('¿Quieres saber');
  await expect(invitation).toContainText('todo de Avoqado?');

  expect(await invitation.evaluate(element => {
    const footer = document.querySelector('footer');
    return Boolean(footer && (element.compareDocumentPosition(footer) & Node.DOCUMENT_POSITION_FOLLOWING));
  })).toBe(true);

  await invitation.evaluate(element => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    const top = element.getBoundingClientRect().top + window.scrollY;
    const distance = element.scrollHeight - window.innerHeight;
    window.scrollTo({ top: top + distance * 0.92, behavior: 'auto' });
  });

  await expect(page.locator('[data-chatbot-invitation-arrow]')).toHaveCount(1);
  await expect(page.locator('[data-chatbot-invitation-circle]')).toHaveCount(1);
  await expect(page.locator('[data-site-navigation]')).toHaveCSS('opacity', '0');
  await expect(page.locator('[data-founders-banner]')).toHaveCSS('opacity', '0');
  await expect(page.locator('[data-site-navigation]')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-founders-banner]')).toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('[data-site-navigation]').evaluate(element => element.inert)).toBe(true);
  expect(await page.locator('[data-founders-banner]').evaluate(element => element.inert)).toBe(true);

  const openChat = page.getByRole('button', { name: 'Abrir chat de ayuda' });
  await expect(openChat).toBeVisible();
  await openChat.click();
  await expect(page.getByRole('heading', { name: '¿Dudas sobre Avoqado?' })).toBeVisible();

  await page.locator('footer').evaluate(element => element.scrollIntoView({ block: 'start' }));
  await expect(page.locator('[data-site-navigation]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-founders-banner]')).toHaveCSS('opacity', '1');
  await expect(page.locator('[data-site-navigation]')).not.toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('[data-founders-banner]')).not.toHaveAttribute('aria-hidden', 'true');
  expect(await page.locator('[data-site-navigation]').evaluate(element => element.inert)).toBe(false);
  expect(await page.locator('[data-founders-banner]').evaluate(element => element.inert)).toBe(false);
});

test('muestra el cierre ilustrado estático con movimiento reducido', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-reduced');
  await page.goto('/');

  const invitation = page.locator('[data-homepage-chatbot-invitation]');
  await invitation.scrollIntoViewIfNeeded();
  await expect(invitation).toHaveAttribute('data-reduced-motion', 'true');
  await invitation.evaluate(element => element.scrollIntoView({ block: 'start' }));

  const geometry = await invitation.evaluate(element => ({
    height: element.getBoundingClientRect().height,
    viewportHeight: window.innerHeight,
  }));
  expect(geometry.height).toBeLessThanOrEqual(geometry.viewportHeight + 1);
  await expect(invitation).toContainText('¿Quieres saber');
  await expect(invitation).toContainText('todo de Avoqado?');
  await expect(page.locator('[data-chatbot-invitation-arrow]')).toHaveCount(1);
  await expect(page.locator('[data-chatbot-invitation-circle]')).toHaveCount(1);

  const story = page.locator('[data-story-mode="static"]');
  await story.evaluate(element => {
    const top = element.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: top + element.scrollHeight - window.innerHeight, behavior: 'auto' });
  });
  await expect(page.locator('[data-chatbot-invitation-arrow]')).toHaveCount(0);
  await expect(page.locator('[data-chatbot-invitation-circle]')).toHaveCount(0);
});
