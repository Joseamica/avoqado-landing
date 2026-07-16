import { expect, test } from 'playwright/test';
import { STORY_SCENES } from '../../src/components/interactive/home-story/story';
import { scrollOpeningNarrativeTo, scrollStorySceneTo } from './helpers/home-story-scroll';

const staticTruth = [
  ['service', 'La reservación llega con todo el contexto.', 'María, su servicio, la colaboradora, la sucursal y el producto llegan juntos.', 'María G. · 11:30 · Facial hidratante', 'Tu equipo sabe a quién atender y qué preparar.'],
  ['payment', 'El pago conserva de dónde vino.', 'TPV, tienda en línea, liga o efectivo quedan ligados a la misma visita. En TPV compatibles, el operador elige manualmente una Cuenta de cobro habilitada.', 'Misma visita · María G. · $348.10', 'Siempre sabes cómo entró el dinero.'],
  ['aftercare', 'El recibo hace más que confirmar el pago.', 'María recibe su comprobante y, si la sucursal lo tiene configurado, puede reseñar o facturar desde ahí.', 'Mismo pago · $348.10 · Recibo enviado', 'El siguiente paso comienza desde el mismo recibo.'],
  ['operations', 'Una venta pone toda la operación en movimiento.', 'El mismo evento actualiza venta, inventario, reorden, cliente y equipo.', 'Misma venta · María G. · $348.10', 'Tu negocio avanza sin capturar lo mismo otra vez.'],
  ['finance', 'Ese mismo pago llega identificado hasta tus libros.', 'Costo, liquidación esperada, conciliación y póliza conservan la misma referencia.', 'Misma referencia · AVQ-34810', 'La referencia acompaña al dinero.'],
  ['multibranch', 'Cada sucursal cuenta en la misma vista.', 'Compara Centro, Roma y Norte sin salir de Estudio Lumina.', 'Estudio Lumina · 3 sucursales', 'Cambias de sucursal sin perder el panorama.'],
  ['ai', 'Para entender tu negocio, solo pregunta.', 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.', 'Mismo contexto · Estudio Lumina', 'ChatGPT o Claude responden con el contexto de Avoqado.'],
] as const;

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
