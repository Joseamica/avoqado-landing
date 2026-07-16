import { STORY_FIXTURE } from './story-fixture';

export const STORY_SCENE_IDS = [
  'service',
  'payment',
  'aftercare',
  'operations',
  'finance',
  'multibranch',
  'ai',
] as const;

export type StorySceneId = (typeof STORY_SCENE_IDS)[number];

export interface NarrativeBeat {
  eyebrow: string;
  title: string;
  thread: string;
  result: string;
  body: string;
  stepThresholds: readonly number[];
}

export interface StoryScene extends NarrativeBeat {
  id: StorySceneId;
  range: readonly [number, number];
  progressLabel: string;
  theme: 'dark' | 'light';
}

export const STORY_SCENES: readonly StoryScene[] = [
  {
    id: 'service',
    eyebrow: 'Todo empieza con una reservación',
    title: 'La reservación llega con todo el contexto.',
    thread: `${STORY_FIXTURE.customer} · ${STORY_FIXTURE.appointmentTime} · ${STORY_FIXTURE.service}`,
    result: 'Tu equipo sabe a quién atender y qué preparar.',
    body: 'María, su servicio, la colaboradora, la sucursal y el producto llegan juntos.',
    stepThresholds: [0.30, 0.43, 0.56, 0.68],
    range: [0, 0.15],
    progressLabel: 'Servicio',
    theme: 'dark',
  },
  {
    id: 'payment',
    eyebrow: 'Al terminar el servicio',
    title: 'El pago conserva de dónde vino.',
    thread: `Misma visita · ${STORY_FIXTURE.customer} · ${STORY_FIXTURE.total}`,
    result: 'Siempre sabes cómo entró el dinero.',
    body: 'TPV, tienda en línea, liga o efectivo quedan ligados a la misma visita. En TPV compatibles, el operador elige manualmente una Cuenta de cobro habilitada.',
    stepThresholds: [0.32, 0.50, 0.67],
    range: [0.14, 0.30],
    progressLabel: 'Cobro',
    theme: 'dark',
  },
  {
    id: 'aftercare',
    eyebrow: 'Después del cobro',
    title: 'El recibo hace más que confirmar el pago.',
    thread: `Mismo pago · ${STORY_FIXTURE.total} · Recibo enviado`,
    result: 'El siguiente paso comienza desde el mismo recibo.',
    body: 'María recibe su comprobante y, si la sucursal lo tiene configurado, puede reseñar o facturar desde ahí.',
    stepThresholds: [0.32, 0.50, 0.67],
    range: [0.29, 0.44],
    progressLabel: 'Cliente',
    theme: 'light',
  },
  {
    id: 'operations',
    eyebrow: 'Mientras María recibe su recibo',
    title: 'Una venta pone toda la operación en movimiento.',
    thread: `Misma venta · ${STORY_FIXTURE.customer} · ${STORY_FIXTURE.total}`,
    result: 'Tu negocio avanza sin capturar lo mismo otra vez.',
    body: 'El mismo evento actualiza venta, inventario, reorden, cliente y equipo.',
    stepThresholds: [0.30, 0.40, 0.50, 0.60, 0.68],
    range: [0.43, 0.62],
    progressLabel: 'Operación',
    theme: 'dark',
  },
  {
    id: 'finance',
    eyebrow: 'Después del cobro',
    title: 'Ese mismo pago llega identificado hasta tus libros.',
    thread: `Misma referencia · ${STORY_FIXTURE.paymentReference}`,
    result: 'La referencia acompaña al dinero.',
    body: 'Costo, liquidación esperada, conciliación y póliza conservan la misma referencia.',
    stepThresholds: [0.30, 0.40, 0.50, 0.60, 0.70],
    range: [0.61, 0.76],
    progressLabel: 'Finanzas',
    theme: 'light',
  },
  {
    id: 'multibranch',
    eyebrow: 'Ahora abre el panorama',
    title: 'Cada sucursal cuenta en la misma vista.',
    thread: `${STORY_FIXTURE.organization} · 3 sucursales`,
    result: 'Cambias de sucursal sin perder el panorama.',
    body: 'Compara Centro, Roma y Norte sin salir de Estudio Lumina.',
    stepThresholds: [0.30, 0.40, 0.50, 0.56, 0.66],
    range: [0.75, 0.90],
    progressLabel: 'Sucursales',
    theme: 'dark',
  },
  {
    id: 'ai',
    eyebrow: 'Con todo conectado',
    title: 'Para entender tu negocio, solo pregunta.',
    thread: `Mismo contexto · ${STORY_FIXTURE.organization}`,
    result: 'ChatGPT o Claude responden con el contexto de Avoqado.',
    body: 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.',
    stepThresholds: [0.32, 0.52, 0.68],
    range: [0.89, 1],
    progressLabel: 'IA',
    theme: 'dark',
  },
] as const;

export function getActiveSceneIndex(progress: number): number {
  for (let index = STORY_SCENES.length - 1; index >= 0; index -= 1) {
    if (progress >= STORY_SCENES[index].range[0]) return index;
  }
  return 0;
}
