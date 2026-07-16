import { expect, test } from 'playwright/test';
import { STORY_SCENES } from '../../src/components/interactive/home-story/story';
import { scrollOpeningNarrativeTo, scrollStoryGlobalTo, scrollStorySceneTo, settleFrames } from './helpers/home-story-scroll';

const staticTruth = [
  ['service', 'La reservación llega con todo el contexto.', 'María, su servicio, la colaboradora, la sucursal y el producto llegan juntos.', 'María G. · 11:30 · Facial hidratante', 'Tu equipo sabe a quién atender y qué preparar.'],
  ['payment', 'El pago conserva de dónde vino.', 'TPV, tienda en línea, liga o efectivo quedan ligados a la misma visita. En TPV compatibles, el operador elige manualmente una Cuenta de cobro habilitada.', 'Misma visita · María G. · $348.10', 'Siempre sabes cómo entró el dinero.'],
  ['aftercare', 'El recibo hace más que confirmar el pago.', 'María recibe su comprobante y, si la sucursal lo tiene configurado, puede reseñar o facturar desde ahí.', 'Mismo pago · $348.10 · Recibo enviado', 'El siguiente paso comienza desde el mismo recibo.'],
  ['operations', 'Una venta pone toda la operación en movimiento.', 'El mismo evento actualiza venta, inventario, reorden, cliente y equipo.', 'Misma venta · María G. · $348.10', 'Tu negocio avanza sin capturar lo mismo otra vez.'],
  ['finance', 'Ese mismo pago llega identificado hasta tus libros.', 'Costo, liquidación esperada, conciliación y póliza conservan la misma referencia.', 'Misma referencia · AVQ-34810', 'La referencia acompaña al dinero.'],
  ['multibranch', 'Cada sucursal cuenta en la misma vista.', 'Compara Centro, Roma y Norte sin salir de Estudio Lumina.', 'Estudio Lumina · 3 sucursales', 'Cambias de sucursal sin perder el panorama.'],
  ['ai', 'Para entender tu negocio, solo pregunta.', 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.', 'Mismo contexto · Estudio Lumina', 'ChatGPT o Claude responden con el contexto de Avoqado.'],
] as const;

const staticEvidence = {
  service: ['Reserva confirmada', 'María G. · 11:30', 'Facial hidratante · Ana Torres · Sucursal Centro'],
  payment: ['TPV reconocido', 'Cuenta de cobro', 'Operación diaria seleccionada manualmente'],
  aftercare: ['Recibo AVQ-34810 enviado', 'Reseña disponible', 'Facturación disponible cuando la sucursal la configura'],
  operations: ['Venta AVQ-34810 registrada', 'Inventario −1', 'Reorden sugerido', 'CRM y lealtad actualizado', 'Comisión de equipo registrada'],
  finance: ['Pago AVQ-34810', 'Costo calculado', 'Liquidación esperada', 'Conciliación ligada', 'Póliza Premium'],
  multibranch: ['Estudio Lumina → Sucursal Norte', 'Ticket $184 · -8%'],
  ai: ['Contexto AVQ-34810', 'Pregunta sobre ticket y reorden', 'Sucursal Norte · $184 · -8%', 'Crema facial 50 ml · 7 piezas · reorden sugerido'],
} as const;

test('mantiene la narrativa completa en reduced motion y no-JS', async ({ page }, testInfo) => {
  test.skip(!['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const mode = testInfo.project.name === 'chromium-reduced' ? 'static' : 'noscript';
  const story = page.locator(`[data-story-mode="${mode}"]`);

  for (const [id, title, body, thread, result] of staticTruth) {
    const scene = story.locator(`[data-story-scene="${id}"]`);
    await expect(scene.getByRole('heading', { level: 2 })).toHaveText(title);
    await expect(scene.locator('[data-narrative-body]')).toHaveText(body);
    await expect(scene.locator('[data-narrative-thread]')).toHaveText(thread);
    await expect(scene.locator('[data-narrative-result]')).toHaveText(result);
    await expect(scene.locator('[data-story-static-evidence]')).toHaveCount(1);
    await expect(scene.locator('[data-story-static-evidence] li')).toHaveText([...staticEvidence[id]]);
  }

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(story.getByRole('heading', { level: 2 })).toHaveCount(7);
});

test('mantiene un solo titular ancla durante idea, demostración y resultado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const scene of STORY_SCENES) {
    await scrollStorySceneTo(page, scene.id, 0.10);
    const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
    const heading = root.locator('[data-narrative-title]');
    const handle = await heading.elementHandle();
    if (!handle) throw new Error(`Missing heading for ${scene.id}`);
    const intro = await root.evaluate(element => {
      const title = element.querySelector<HTMLElement>('[data-narrative-title]')!;
      const lineRange = document.createRange();
      lineRange.selectNodeContents(title);
      return {
        text: title.textContent,
        fontSize: getComputedStyle(title).fontSize,
        width: title.offsetWidth,
        height: title.offsetHeight,
        lines: lineRange.getClientRects().length,
        threadOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-thread]')!).opacity),
        resultOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity),
        visualOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-visual]')!).opacity),
      };
    });
    expect(intro.threadOpacity).toBeLessThanOrEqual(0.05);
    expect(intro.resultOpacity).toBeLessThanOrEqual(0.05);
    expect(intro.visualOpacity).toBeCloseTo(0.14, 1);

    await scrollStorySceneTo(page, scene.id, 0.55);
    expect(await heading.evaluate((node, first) => node === first, handle)).toBe(true);
    const demo = await heading.evaluate(element => ({
      text: element.textContent,
      fontSize: getComputedStyle(element).fontSize,
      width: (element as HTMLElement).offsetWidth,
      height: (element as HTMLElement).offsetHeight,
      lines: (() => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return range.getClientRects().length;
      })(),
      scale: new DOMMatrixReadOnly(getComputedStyle(element).transform).a,
    }));
    expect(demo).toMatchObject({
      text: intro.text,
      fontSize: intro.fontSize,
      width: intro.width,
      height: intro.height,
      lines: intro.lines,
    });
    expect(demo.scale).toBeCloseTo(0.72, 1);
    await expect(root.locator('[data-narrative-thread]')).toHaveCSS('opacity', '1');

    await scrollStorySceneTo(page, scene.id, 0.86);
    await expect(root.locator('[data-narrative-result]')).toHaveCSS('opacity', '1');
    expect(await root.locator('[data-narrative-visual]').evaluate(element => (
      Number.parseFloat(getComputedStyle(element).opacity)
    ))).toBeCloseTo(0.65, 1);
  }
});

test('mantiene el titular de Entradas mientras demuestra tres canales', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const scene = page.locator('[data-opening-channel-handoff]');

  for (const [progress, thread] of [
    [0.36, 'Reservación en línea → Reserva confirmada'],
    [0.52, 'Liga de pago → Pago recibido'],
    [0.66, 'Terminal de cobro → Cobro aprobado'],
  ] as const) {
    await scrollOpeningNarrativeTo(page, progress);
    await expect(scene.locator('[data-narrative-title]')).toHaveText('Tu cliente reserva, compra o paga como prefiera.');
    await expect(scene.locator('[data-channel-thread][data-active="true"]')).toHaveText(thread);
  }

  await scrollOpeningNarrativeTo(page, 0.86);
  await expect(scene.locator('[data-narrative-result]')).toContainText('Todo llega conectado al mismo negocio.');
});

test('conserva idea, hilo, demostraciones y resultado de Entradas sin scrub', async ({ page }, testInfo) => {
  test.skip(!['chromium-reduced', 'chromium-nojs'].includes(testInfo.project.name));
  await page.goto('/');
  const mode = testInfo.project.name === 'chromium-reduced' ? 'static' : 'noscript';
  const opening = page.locator(`[data-opening-mode="${mode}"]`);
  await expect(opening.locator('[data-narrative-title]')).toHaveText('Tu cliente reserva, compra o paga como prefiera.');
  await expect(opening.locator('[data-narrative-body]')).toHaveText('Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.');
  await expect(opening.locator('[data-narrative-thread]')).toHaveText('Reservación en línea → Reserva confirmada');
  await expect(opening.locator('[data-channel-static-result]')).toHaveCount(3);
  await expect(opening.locator('[data-narrative-result]')).toHaveText('Todo llega conectado al mismo negocio.');
});

test('cruza canales sin saltar ruta, evento ni hilo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const scene = page.locator('[data-opening-channel-handoff]');
  const readMaximumOpacity = async (selector: string) => scene.locator(selector).evaluateAll(nodes => (
    Math.max(0, ...nodes.map(node => Number.parseFloat(getComputedStyle(node).opacity)))
  ));

  for (const [before, boundary, after] of [[0.42, 0.43, 0.44], [0.57, 0.58, 0.59]] as const) {
    await scrollOpeningNarrativeTo(page, before);
    expect(await readMaximumOpacity('[data-channel-event-content]')).toBeGreaterThan(0.05);
    expect(await readMaximumOpacity('[data-channel-thread]')).toBeGreaterThan(0.05);

    await scrollOpeningNarrativeTo(page, boundary);
    expect(await readMaximumOpacity('[data-channel-event-content]')).toBeLessThanOrEqual(0.05);
    expect(await readMaximumOpacity('[data-channel-thread]')).toBeLessThanOrEqual(0.05);
    expect(await readMaximumOpacity('[data-channel-route], [data-story-primary-pulse]')).toBeLessThanOrEqual(0.05);

    await scrollOpeningNarrativeTo(page, after);
    expect(await readMaximumOpacity('[data-channel-event-content]')).toBeGreaterThan(0.05);
    expect(await readMaximumOpacity('[data-channel-thread]')).toBeGreaterThan(0.05);
  }
});

test('mantiene la jerarquía de Entradas en los siete viewports y al restaurar scroll', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  test.setTimeout(180_000);
  const viewports = [
    { width: 1440, height: 900 }, { width: 1024, height: 768 },
    { width: 910, height: 691 }, { width: 887, height: 502 },
    { width: 787, height: 701 }, { width: 390, height: 844 },
    { width: 320, height: 568 },
  ] as const;

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.goto('/?motion=full');
    await page.evaluate(async () => { await document.fonts.ready; });
    let titleInvariant: { text: string | null; width: number; height: number; lines: number } | undefined;

    for (const progress of [0.10, 0.55, 0.86] as const) {
      await scrollOpeningNarrativeTo(page, progress);
      const scene = page.locator('[data-opening-channel-handoff]');
      const geometry = await scene.evaluate(element => {
        const title = element.querySelector<HTMLElement>('[data-narrative-title]')!;
        const visual = element.querySelector<HTMLElement>('[data-narrative-visual]')!;
        const event = element.querySelector<HTMLElement>('.story-channel-event')!;
        const range = document.createRange();
        range.selectNodeContents(title);
        const inside = (rect: DOMRect) => rect.left >= -1 && rect.right <= innerWidth + 1
          && rect.top >= -1 && rect.bottom <= innerHeight + 1;
        return {
          title: { text: title.textContent, width: title.offsetWidth, height: title.offsetHeight, lines: range.getClientRects().length },
          titleFontSize: Number.parseFloat(getComputedStyle(title).fontSize),
          titleInside: inside(title.getBoundingClientRect()),
          visualInside: inside(visual.getBoundingClientRect()),
          eventInside: inside(event.getBoundingClientRect()),
          eventHeight: event.getBoundingClientRect().height,
          eyebrowOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-eyebrow]')!).opacity),
          threadOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-thread]')!).opacity),
          resultOpacity: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity),
        };
      });
      expect(geometry.titleInside && geometry.visualInside && geometry.eventInside).toBe(true);
      expect(geometry.eventHeight).toBeGreaterThanOrEqual(120);
      if (viewport.width < 768) expect(geometry.titleFontSize).toBeGreaterThanOrEqual(36);
      if (progress === 0.10) expect(geometry.eyebrowOpacity).toBeGreaterThanOrEqual(0.95);
      if (progress === 0.55) expect(geometry.threadOpacity).toBeGreaterThanOrEqual(0.95);
      if (progress === 0.86) expect(geometry.resultOpacity).toBeGreaterThanOrEqual(0.95);
      titleInvariant ??= geometry.title;
      expect(geometry.title).toEqual(titleInvariant);
    }
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/?motion=full');
  await scrollOpeningNarrativeTo(page, 0.52);
  await page.reload();
  const restored = page.locator('[data-opening-channel-handoff]');
  await expect.poll(() => restored.getAttribute('data-active')).toBe('true');
  await expect(restored).toHaveCSS('visibility', 'visible');
  await expect(restored.locator('[data-channel-thread][data-active="true"]')).toHaveText('Liga de pago → Pago recibido');
});

const simpleStepContracts = {
  service: [
    { id: 'reservation', minimumOpacity: 0.95 },
    { id: 'route', minimumOpacity: 0.35 },
    { id: 'agenda', minimumOpacity: 0.95 },
    { id: 'context', minimumOpacity: 0.95 },
  ],
  payment: ['channel', 'selector', 'account'].map(id => ({ id, minimumOpacity: 0.95 })),
  aftercare: ['receipt', 'review', 'invoice'].map(id => ({ id, minimumOpacity: 0.95 })),
} as const;

test('acumula Servicio, Cobro y Cliente antes del resultado y los revierte', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const [sceneId, steps] of Object.entries(simpleStepContracts)) {
    await scrollStorySceneTo(page, sceneId as keyof typeof simpleStepContracts, 0.72);
    const scene = page.locator(`[data-story-scene="${sceneId}"][data-active="true"]`);
    for (const step of steps) {
      const element = scene.locator(`[data-story-step="${step.id}"]`);
      await expect(element).toHaveCount(1);
      expect(await element.evaluate(node => Number.parseFloat(getComputedStyle(node).opacity)))
        .toBeGreaterThanOrEqual(step.minimumOpacity);
    }

    await scrollStorySceneTo(page, sceneId as keyof typeof simpleStepContracts, 0.10);
    for (const step of steps) {
      expect(await scene.locator(`[data-story-step="${step.id}"]`).evaluate(node => (
        Number.parseFloat(getComputedStyle(node).opacity)
      ))).toBeLessThanOrEqual(0.05);
    }
  }
});

test('Cobro y Cliente conservan marcador estático y cero pulsos o rutas', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const sceneId of ['payment', 'aftercare'] as const) {
    await scrollStorySceneTo(page, sceneId, 0.55);
    const scene = page.locator(`[data-story-scene="${sceneId}"][data-active="true"]`);
    await expect(scene.locator('[data-narrative-thread-marker]')).toHaveCount(1);
    await expect(scene.locator('[data-story-primary-pulse]')).toHaveCount(0);
    await expect(scene.locator('[data-story-cascade-path], [data-story-service-connector]')).toHaveCount(0);
  }
});

const cascadeContracts = {
  operations: ['sale', 'inventory', 'reorder', 'crm', 'team'],
  finance: ['payment', 'cost', 'settlement', 'reconciliation', 'policy'],
} as const;

test('acumula las dos cascadas y conserva el pulso en el último nodo durante la pausa', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const [sceneId, steps] of Object.entries(cascadeContracts)) {
    await scrollStorySceneTo(page, sceneId as keyof typeof cascadeContracts, 0.72);
    const sceneLayer = page.locator(`[data-story-scene="${sceneId}"]`);
    await expect(sceneLayer).toHaveAttribute('data-active', 'true');
    for (const step of steps) {
      expect(await sceneLayer.locator(`[data-story-step="${step}"]`).evaluate(node => (
        Number.parseFloat(getComputedStyle(node).opacity)
      ))).toBeGreaterThanOrEqual(0.95);
    }

    const finalNode = sceneLayer.locator('[data-story-cascade-node]').last();
    const pulse = sceneLayer.locator('[data-story-primary-pulse]');
    const atResult = await Promise.all([finalNode.boundingBox(), pulse.boundingBox()]);
    expect(atResult[0]).not.toBeNull();
    expect(atResult[1]).not.toBeNull();
    expect(Math.abs((atResult[0]!.y + atResult[0]!.height / 2) - (atResult[1]!.y + atResult[1]!.height / 2)))
      .toBeLessThanOrEqual(8);

    const exitDistances = [];
    for (const localProgress of [0.93, 0.96, 0.99, 1]) {
      await scrollStorySceneTo(page, sceneId as keyof typeof cascadeContracts, localProgress);
      exitDistances.push(await pulse.evaluate(node => {
        const matrix = new DOMMatrixReadOnly(getComputedStyle(node).transform);
        return Math.hypot(matrix.m41, matrix.m42);
      }));
    }
    for (let index = 1; index < exitDistances.length; index += 1) {
      expect(exitDistances[index]).toBeLessThanOrEqual(exitDistances[index - 1] + 0.5);
    }
    expect(exitDistances.at(-1)).toBeLessThanOrEqual(1);
  }
});

test('Sucursales prueba el dato que IA explica después', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  await scrollStorySceneTo(page, 'multibranch', 0.72);
  const branches = page.locator('[data-story-scene="multibranch"][data-active="true"]');
  await expect(branches.locator('[data-story-step="north-selector"]')).toContainText('Sucursal Norte');
  await expect(branches.locator('[data-branch-breadcrumb]')).toHaveText('Estudio Lumina → Sucursal Norte');
  await expect(branches.locator('[data-branch-ticket]')).toHaveText('Ticket $184 · -8%');

  await scrollStorySceneTo(page, 'ai', 0.55);
  const ai = page.locator('[data-story-scene="ai"][data-active="true"]');
  await expect(ai.locator('[data-story-step="question"]')).toContainText('¿Qué sucursal bajó su ticket y qué debo reordenar?');
  await expect(ai.locator('[data-story-step="answer"]')).toContainText('Sucursal Norte bajó su ticket a $184 (-8%).');
  expect(await ai.locator('.story-frame-actions').evaluate(element => element.inert)).toBe(true);

  await scrollStorySceneTo(page, 'ai', 0.86);
  expect(await ai.locator('.story-frame-actions').evaluate(element => element.inert)).toBe(false);
  await expect(ai.locator('[data-narrative-result]')).toHaveCSS('opacity', '1');

  for (const sceneId of ['aftercare', 'operations', 'finance', 'ai'] as const) {
    await scrollStorySceneTo(page, sceneId, 0.72);
    await expect(page.locator(`[data-story-scene="${sceneId}"]`)).toContainText('AVQ-34810');
  }

  await scrollStorySceneTo(page, 'ai', 0.86);
  await page.reload();
  await expect.poll(async () => page.locator('[data-story-mode="animated"]').getAttribute('data-active-scene')).toBe('ai');
  const restoredActions = page.locator('[data-story-scene="ai"][data-active="true"] .story-frame-actions');
  await expect.poll(async () => restoredActions.evaluate(element => element.inert)).toBe(false);
});

test('usa 9/10 viewports y transiciones relativas a cada escena', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const root = page.locator('[data-story-mode="animated"]');

  expect(await root.evaluate(element => element.offsetHeight / window.innerHeight)).toBeCloseTo(10, 1);
  await scrollStorySceneTo(page, 'operations', 0.03);
  const entering = root.locator('[data-story-scene="operations"]');
  const enteringOpacity = await entering.evaluate(node => Number.parseFloat(getComputedStyle(node).opacity));
  expect(enteringOpacity).toBeGreaterThan(0.20);
  expect(enteringOpacity).toBeLessThan(0.80);

  await scrollStorySceneTo(page, 'operations', 0.50);
  await expect(root).toHaveAttribute('data-active-scene', 'operations');
  await expect(root.locator('[data-story-scene][data-active="true"]')).toHaveCount(1);
  await expect(root.locator('[data-story-scene][aria-hidden="false"]')).toHaveCount(1);
  expect(await root.locator('[data-story-scene][data-active="false"]').evaluateAll(nodes => (
    nodes.every(node => (node as HTMLElement).inert)
  ))).toBe(true);

  const rail = page.getByRole('navigation', { name: 'Progreso de la historia' });
  await expect(rail).toContainText('Servicio');
  await expect(rail).not.toContainText('Entrada');
});

test('mantiene estados estables dentro de intro, demo y resultado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  const demoPlateaus = {
    service: [0.34, 0.39],
    payment: [0.36, 0.46],
    aftercare: [0.36, 0.46],
    operations: [0.33, 0.37],
    finance: [0.33, 0.37],
    multibranch: [0.33, 0.37],
    ai: [0.36, 0.48],
  } as const;

  for (const scene of STORY_SCENES) {
    const samples = [
      [0.08, 0.14],
      demoPlateaus[scene.id],
      [0.85, 0.91],
    ] as const;
    for (const [first, second] of samples) {
      await scrollStorySceneTo(page, scene.id, first);
      const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
      const before = await root.evaluate(element => ({
        title: element.querySelector('[data-narrative-title]')?.textContent,
        resultVisible: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity) >= 0.95,
        completeSteps: Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]'))
          .filter(node => Number.parseFloat(getComputedStyle(node).opacity) >= 0.95)
          .map(node => node.dataset.storyStep),
      }));
      await scrollStorySceneTo(page, scene.id, second);
      const after = await root.evaluate(element => ({
        title: element.querySelector('[data-narrative-title]')?.textContent,
        resultVisible: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity) >= 0.95,
        completeSteps: Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]'))
          .filter(node => Number.parseFloat(getComputedStyle(node).opacity) >= 0.95)
          .map(node => node.dataset.storyStep),
      }));
      expect(after).toEqual(before);
    }
  }
});

test('termina todos los pasos antes de introducir el resultado', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');

  for (const scene of STORY_SCENES) {
    await scrollStorySceneTo(page, scene.id, 0.72);
    const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
    const before = await root.locator('[data-story-step]').evaluateAll(nodes => nodes.map(node => (
      Number.parseFloat(getComputedStyle(node).opacity).toFixed(3)
    )));
    await scrollStorySceneTo(page, scene.id, 0.74);
    const after = await root.locator('[data-story-step]').evaluateAll(nodes => nodes.map(node => (
      Number.parseFloat(getComputedStyle(node).opacity).toFixed(3)
    )));
    expect(after).toEqual(before);
    expect(await root.locator('[data-narrative-result]').evaluate(node => (
      Number.parseFloat(getComputedStyle(node).opacity)
    ))).toBeGreaterThan(0);
  }
});

test('registra una sola vez la historia completa aunque el usuario regrese', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await page.evaluate(() => { window.dataLayer = []; });

  await scrollStoryGlobalTo(page, 0.91);
  await scrollStoryGlobalTo(page, 0.70);
  await scrollStoryGlobalTo(page, 0.95);

  const completions = await page.evaluate(() => (window.dataLayer ?? []).filter(entry => (
    typeof entry === 'object'
    && entry !== null
    && 'event' in entry
    && entry.event === 'homepage_story_complete'
  )));
  expect(completions).toHaveLength(1);
});

const narrativeViewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 910, height: 691 },
  { width: 887, height: 502 },
  { width: 787, height: 701 },
  { width: 390, height: 844 },
  { width: 320, height: 568 },
] as const;

test('mantiene jerarquía, saltos y límites en la matriz narrativa', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  test.setTimeout(180_000);

  for (const viewport of narrativeViewports) {
    await page.setViewportSize(viewport);
    await page.goto('/?motion=full');
    await page.evaluate(async () => { await document.fonts.ready; });
    expect(await page.locator('[data-story-mode="animated"]').evaluate(element => (
      element.offsetHeight / window.innerHeight
    ))).toBeCloseTo(viewport.width >= 1024 ? 10 : 9, 1);

    for (const scene of STORY_SCENES) {
      let titleInvariant: { text: string | null; fontSize: number; width: number; height: number; lines: number } | undefined;
      for (const progress of [0.10, 0.55, 0.86]) {
        await scrollStorySceneTo(page, scene.id, progress);
        const root = page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`);
        const geometry = await root.evaluate(element => {
          const stageRect = element.getBoundingClientRect();
          const withinStage = (rect: DOMRect) => ({
            horizontal: rect.left >= stageRect.left - 1 && rect.right <= stageRect.right + 1,
            vertical: rect.top >= stageRect.top - 1 && rect.bottom <= stageRect.bottom + 1,
          });
          const isMeasurable = (node: HTMLElement) => {
            const style = getComputedStyle(node);
            const rect = node.getBoundingClientRect();
            return style.display !== 'none'
              && style.visibility !== 'hidden'
              && rect.width > 0.5
              && rect.height > 0.5;
          };
          const isVisiblyRendered = (node: HTMLElement) => (
            isMeasurable(node) && Number.parseFloat(getComputedStyle(node).opacity) > 0.05
          );
          const title = element.querySelector<HTMLElement>('[data-narrative-title]')!;
          const range = document.createRange();
          range.selectNodeContents(title);
          const titleRect = title.getBoundingClientRect();
          const visual = element.querySelector<HTMLElement>('[data-narrative-visual]')!;
          const visualRect = visual.getBoundingClientRect();
          const result = element.querySelector<HTMLElement>('[data-narrative-result]')!;
          const resultRect = result.getBoundingClientRect();
          const steps = Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]'));
          const visibleStepsInside = steps
            .filter(isVisiblyRendered)
            .map(node => withinStage(node.getBoundingClientRect()));
          const panels = Array.from(element.querySelectorAll<HTMLElement>('[data-story-panel]'))
            .filter(isMeasurable);
          const visualChildren = Array.from(visual.children)
            .filter((node): node is HTMLElement => node instanceof HTMLElement)
            .filter(isMeasurable);
          const contentNodes = panels.length > 0 ? panels : visualChildren;
          return {
            documentOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            title: {
              text: title.textContent,
              fontSize: Number.parseFloat(getComputedStyle(title).fontSize),
              width: title.offsetWidth,
              height: title.offsetHeight,
              lines: range.getClientRects().length,
            },
            titleInside: withinStage(titleRect),
            visualInside: withinStage(visualRect),
            resultInside: withinStage(resultRect),
            contentInside: contentNodes.map(node => withinStage(node.getBoundingClientRect())),
            stepCount: steps.length,
            visibleStepsInside,
            visualOpacity: Number.parseFloat(getComputedStyle(visual).opacity),
            resultOpacity: Number.parseFloat(getComputedStyle(result).opacity),
          };
        });
        expect(geometry.documentOverflow).toBeLessThanOrEqual(1);
        expect(geometry.titleInside, `${viewport.width}x${viewport.height} ${scene.id} title at ${progress}`).toEqual({ horizontal: true, vertical: true });
        expect(geometry.visualInside, `${viewport.width}x${viewport.height} ${scene.id} visual at ${progress}`).toEqual({ horizontal: true, vertical: true });
        expect(geometry.contentInside.length).toBeGreaterThan(0);
        expect(
          geometry.contentInside.every(bounds => bounds.horizontal && bounds.vertical),
          `${viewport.width}x${viewport.height} ${scene.id} content at ${progress}: ${JSON.stringify(geometry.contentInside)}`,
        ).toBe(true);
        expect(
          geometry.visibleStepsInside.every(bounds => bounds.horizontal && bounds.vertical),
          `${viewport.width}x${viewport.height} ${scene.id} at ${progress}: ${JSON.stringify(geometry.visibleStepsInside)}`,
        ).toBe(true);
        if (viewport.width < 768) expect(geometry.title.fontSize).toBeGreaterThanOrEqual(36);
        if (progress === 0.10) expect(geometry.visualOpacity).toBeLessThanOrEqual(0.15);
        if (progress === 0.86) {
          expect(geometry.resultOpacity).toBeGreaterThanOrEqual(0.95);
          expect(geometry.resultInside).toEqual({ horizontal: true, vertical: true });
          expect(geometry.stepCount).toBe(scene.stepThresholds.length);
          expect(geometry.visibleStepsInside).toHaveLength(geometry.stepCount);
        }
        titleInvariant ??= geometry.title;
        expect(geometry.title).toEqual(titleInvariant);
      }
    }

    await scrollStorySceneTo(page, 'ai', 0.86);
    const activeAi = page.locator('[data-story-scene="ai"][data-active="true"]');
    const actions = activeAi.locator('.story-frame-actions a');
    const stageBox = await activeAi.boundingBox();
    expect(stageBox).not.toBeNull();
    await expect(actions).toHaveCount(2);
    for (const action of await actions.all()) {
      const box = await action.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.x).toBeGreaterThanOrEqual(stageBox!.x - 1);
      expect(box!.x + box!.width).toBeLessThanOrEqual(stageBox!.x + stageBox!.width + 1);
      expect(box!.y).toBeGreaterThanOrEqual(stageBox!.y - 1);
      expect(box!.y + box!.height).toBeLessThanOrEqual(stageBox!.y + stageBox!.height + 1);
    }
  }
});

test('reproduce el mismo recorrido al subir', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  const sequence = [0.10, 0.50, 0.86, 0.50, 0.10] as const;

  for (const scene of STORY_SCENES) {
    const snapshots: Array<{ thread: string; result: string; steps: string[] }> = [];
    for (const progress of sequence) {
      await scrollStorySceneTo(page, scene.id, progress);
      snapshots.push(await page.locator(`[data-story-scene="${scene.id}"][data-active="true"]`).evaluate(element => ({
        thread: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-thread]')!).opacity).toFixed(3),
        result: Number.parseFloat(getComputedStyle(element.querySelector('[data-narrative-result]')!).opacity).toFixed(3),
        steps: Array.from(element.querySelectorAll<HTMLElement>('[data-story-step]')).map(node => (
          Number.parseFloat(getComputedStyle(node).opacity).toFixed(3)
        )),
      })));
    }
    for (const snapshot of snapshots) {
      expect(snapshot.steps).toHaveLength(scene.stepThresholds.length);
    }
    expect(snapshots[3]).toEqual(snapshots[1]);
    expect(snapshots[4]).toEqual(snapshots[0]);
  }
});

test('tolera rueda lenta, rueda rápida y Page Down sin errores', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  const errors: string[] = [];
  page.on('console', message => {
    if (message.type() === 'error' || /hydration/i.test(message.text())) errors.push(message.text());
  });
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?motion=full');

  const root = page.locator('[data-story-mode="animated"]');
  await root.evaluate(element => {
    document.documentElement.style.setProperty('scroll-behavior', 'auto', 'important');
    element.scrollIntoView({ block: 'start', behavior: 'auto' });
  });
  await settleFrames(page);
  const sceneIds = STORY_SCENES.map(scene => scene.id);
  const activeIndex = async () => sceneIds.indexOf(
    (await root.getAttribute('data-active-scene')) as (typeof sceneIds)[number],
  );
  const expectSingleActiveLayer = async () => {
    await expect(root.locator('[data-story-scene][data-active="true"]')).toHaveCount(1);
  };
  const scrollY = () => page.evaluate(() => window.scrollY);
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('Missing viewport for wheel-input test');
  await page.mouse.move(viewport.width / 2, viewport.height / 2);

  const start = await activeIndex();
  expect(start).toBeGreaterThanOrEqual(0);
  const beforeSmallWheelY = await scrollY();
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, 80);
    await settleFrames(page);
  }
  await expect.poll(scrollY).toBeGreaterThan(beforeSmallWheelY);
  await expect.poll(activeIndex).toBeGreaterThanOrEqual(start);
  await expectSingleActiveLayer();

  const afterSmallWheel = await activeIndex();
  const beforeFastWheelY = await scrollY();
  await page.mouse.wheel(0, 1400);
  await settleFrames(page);
  await expect.poll(scrollY).toBeGreaterThan(beforeFastWheelY);
  await expect.poll(activeIndex).toBeGreaterThan(afterSmallWheel);
  await expectSingleActiveLayer();

  const afterFastWheel = await activeIndex();
  const beforePageDownY = await scrollY();
  await page.keyboard.press('PageDown');
  await settleFrames(page);
  await expect.poll(scrollY).toBeGreaterThan(beforePageDownY);
  await expect.poll(activeIndex).toBeGreaterThanOrEqual(afterFastWheel);
  await expectSingleActiveLayer();

  const forwardPeak = await activeIndex();
  const beforeReverseY = await scrollY();
  await page.mouse.wheel(0, -1400);
  await settleFrames(page);
  for (let index = 0; index < 12; index += 1) {
    await page.mouse.wheel(0, -80);
    await settleFrames(page);
  }
  await expect.poll(scrollY).toBeLessThan(beforeReverseY);
  await expect.poll(activeIndex).toBeLessThan(forwardPeak);
  await expectSingleActiveLayer();

  expect(await root.getAttribute('data-active-scene')).not.toBeNull();
  expect(errors).toEqual([]);
});

test('conserva navegación, CTAs, footer, chatbot y aislamiento de demo', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'chromium-desktop');
  await page.goto('/?motion=full');
  await expect(page.locator('[data-site-navigation]')).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'Agenda por WhatsApp' })).toHaveAttribute('href', /\/wa\?src=hero_demo/);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Abrir chat de ayuda' })).toHaveCount(1);

  await scrollStorySceneTo(page, 'ai', 0.86);
  const aiActions = page.locator('[data-story-scene="ai"][data-active="true"] .story-frame-actions');
  await expect(aiActions.getByRole('link', { name: 'Quiero verlo en mi negocio' })).toHaveAttribute('href', /\/wa\?src=homepage_story_final/);
  await expect(aiActions.getByRole('link', { name: 'Comienza gratis' })).toHaveAttribute('href', 'https://dashboard.avoqado.io/signup');

  await page.goto('/demo');
  await expect(page).toHaveURL(/\/demo\/?$/);
  await expect(page.locator('[data-story-mode], [data-opening-mode]')).toHaveCount(0);
});
