import { expect, test } from 'playwright/test';

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
