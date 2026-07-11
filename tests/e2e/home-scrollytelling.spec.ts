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
    window.scrollTo({ top: top + distance * 0.34, behavior: 'auto' });
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

  await expect(story).toContainText('Consumer App');
  await expect(story).toContainText('Booking Widget');
  await expect(story).toContainText('POS iOS');
  await expect(story).toContainText('POS Android');
  await expect(story).toContainText('POS Desktop');
  await expect(story).toContainText('Cuenta de cobro');
  await expect(story).toContainText('Operación diaria');
  await expect(story).toContainText('TPV compatible');
  await expect(story).not.toContainText('routing inteligente');
  await expect(story).not.toContainText('elige tu cuenta bancaria');
});

test('mantiene la verdad crítica visible fuera del chatbot en móvil', async ({ page }, testInfo) => {
  test.skip(!['chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');

  const root = page.locator('[data-story-mode="animated"]');
  const chat = page.getByRole('button', { name: 'Abrir chat de ayuda' });
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

  await moveTo(0.155, 'channels');
  const channels = root.locator('[data-story-scene="channels"][data-active="true"]');
  await expectClearOfChat(channels.locator('.story-channel-event-venue'));
  const channelPulse = channels.locator('[data-story-primary-pulse]:visible');
  const activeChannel = channels.locator('[data-channel-active]');
  await expect(channelPulse).toHaveCount(1);
  await expect(activeChannel).toHaveCount(1);
  expect(await channelPulse.evaluate((element, targetElement) => {
    const pulseRect = element.getBoundingClientRect();
    const targetRect = (targetElement as HTMLElement).getBoundingClientRect();
    const center = { x: pulseRect.left + pulseRect.width / 2, y: pulseRect.top + pulseRect.height / 2 };
    return center.x >= targetRect.left && center.x <= targetRect.right && center.y >= targetRect.top && center.y <= targetRect.bottom;
  }, await activeChannel.elementHandle())).toBe(true);

  await moveTo(0.255, 'service');
  const service = root.locator('[data-story-scene="service"][data-active="true"]');
  await expectClearOfChat(service.getByText('Crema facial 50 ml', { exact: true }), 10);
  await expectClearOfChat(service.getByText('POS Desktop · Windows Service', { exact: true }), 10);
  const railGap = await service.locator('.story-service-rail span').evaluateAll(elements => {
    const [first, second] = elements.map(element => element.getBoundingClientRect());
    return second.top > first.top + 1 ? second.top - first.bottom : second.left - first.right;
  });
  expect(railGap).toBeGreaterThanOrEqual(4);

  await moveTo(0.365, 'payment');
  const payment = root.locator('[data-story-scene="payment"][data-active="true"]');
  await expectClearOfChat(payment.getByText('TPV compatible · selección manual', { exact: true }), 10);
  await expectClearOfChat(payment.getByText('Merchant habilitado', { exact: true }), 10);
  await expectClearOfChat(payment.getByText('Disponible', { exact: true }), 10);
  const routeTruth = testInfo.project.name === 'chromium-small'
    ? payment.locator('.story-payment-reference-summary')
    : payment.getByText('Registro manual', { exact: true });
  await expectClearOfChat(routeTruth, 10);

  const pulse = payment.locator('[data-story-primary-pulse]:visible');
  const selectedMerchant = payment.locator('[data-merchant-selected]');
  const alternateMerchant = payment.locator('[data-merchant-alternate]');
  await expect(pulse).toHaveCount(1);
  await expect(selectedMerchant).toHaveCount(1);
  await expect(alternateMerchant).toHaveCount(1);
  const pulseTarget = await pulse.evaluate((element, targets) => {
    const pulseRect = element.getBoundingClientRect();
    const selectedRect = (targets.selected as HTMLElement).getBoundingClientRect();
    const alternateRect = (targets.alternate as HTMLElement).getBoundingClientRect();
    const center = { x: pulseRect.left + pulseRect.width / 2, y: pulseRect.top + pulseRect.height / 2 };
    const contains = (rect: DOMRect) => center.x >= rect.left && center.x <= rect.right && center.y >= rect.top && center.y <= rect.bottom;
    return { selected: contains(selectedRect), alternate: contains(alternateRect) };
  }, {
    selected: await selectedMerchant.elementHandle(),
    alternate: await alternateMerchant.elementHandle(),
  });
  expect(pulseTarget.selected).toBe(true);
  expect(pulseTarget.alternate).toBe(false);
});

test('mantiene un solo pulso primario durante los handoffs', async ({ page }, testInfo) => {
  test.skip(!['chromium-desktop', 'chromium-mobile', 'chromium-small'].includes(testInfo.project.name));
  await page.goto('/');
  const root = page.locator('[data-story-mode="animated"]');

  for (const progress of [0.105, 0.205, 0.305, 0.425]) {
    await root.evaluate((element, value) => {
      document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
      const top = element.getBoundingClientRect().top + window.scrollY;
      const distance = element.scrollHeight - window.innerHeight;
      window.scrollTo({ top: top + distance * value, behavior: 'auto' });
    }, progress);

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
    expect(visiblePrimaryPulses).toBe(1);
  }
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
  await expect(story).not.toContainText('Liquidación garantizada');

  if (['chromium-mobile', 'chromium-small'].includes(testInfo.project.name)) {
    const root = page.locator('[data-story-mode="animated"]');

    for (const [progress, scene] of [
      [0.645, 'operations'],
      [0.75, 'finance'],
    ] as const) {
      await root.evaluate((element, value) => {
        document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
        const top = element.getBoundingClientRect().top + window.scrollY;
        const distance = element.scrollHeight - window.innerHeight;
        window.scrollTo({ top: top + distance * value, behavior: 'auto' });
      }, progress);
      await expect(root).toHaveAttribute('data-active-scene', scene);

      const card = root.locator(
        `[data-story-scene="${scene}"][data-active="true"] .story-frame-visual > div > div`,
      );
      await expect(card).toBeVisible();
      const geometry = await card.evaluate(element => {
        const rect = element.getBoundingClientRect();
        return { top: rect.top, bottom: rect.bottom, viewportHeight: window.innerHeight };
      });
      expect(geometry.top).toBeGreaterThanOrEqual(0);
      expect(geometry.bottom).toBeLessThanOrEqual(geometry.viewportHeight);
    }
  }
});
