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

export interface StoryScene {
  id: StorySceneId;
  eyebrow: string;
  title: string;
  body: string;
  range: readonly [number, number];
  progressLabel: string;
  theme: 'dark' | 'light';
}

export const STORY_SCENES: readonly StoryScene[] = [
  {
    id: 'service',
    eyebrow: 'Contexto compartido',
    title: 'Tu equipo recibe el contexto completo.',
    body: 'Cliente, servicio, productos, colaborador y sucursal llegan juntos.',
    range: [0, 0.14],
    progressLabel: 'Servicio',
    theme: 'dark',
  },
  {
    id: 'payment',
    eyebrow: 'Cobro trazable',
    title: 'Cobra por el canal correcto. Conserva el hilo del dinero.',
    body: 'TPV, ecommerce, liga o efectivo: Avoqado registra cómo ocurrió cada pago y, en TPV compatibles, permite elegir la Cuenta de cobro habilitada.',
    range: [0.13, 0.30],
    progressLabel: 'Cobro',
    theme: 'dark',
  },
  {
    id: 'aftercare',
    eyebrow: 'Después del servicio',
    title: 'La experiencia termina bien. El trabajo apenas empieza.',
    body: 'Recibo digital, reseña de Google y facturación desde el recibo, cuando la sucursal lo tiene configurado.',
    range: [0.29, 0.44],
    progressLabel: 'Cliente',
    theme: 'light',
  },
  {
    id: 'operations',
    eyebrow: 'Automatización operativa',
    title: 'Una venta. Seis sistemas actualizados.',
    body: 'Ventas, inventario, compras, CRM, puntos, turnos y comisiones avanzan desde el mismo evento.',
    range: [0.43, 0.62],
    progressLabel: 'Operación',
    theme: 'dark',
  },
  {
    id: 'finance',
    eyebrow: 'Del cobro a los libros',
    title: 'El dinero no se pierde entre sistemas.',
    body: 'Costo, liquidación esperada, conciliación, banca y contabilidad conservan la referencia del pago.',
    range: [0.61, 0.75],
    progressLabel: 'Finanzas',
    theme: 'light',
  },
  {
    id: 'multibranch',
    eyebrow: 'Control multi-sucursal',
    title: 'Una sucursal o diez. Una sola operación.',
    body: 'Cambia de sucursal sin cerrar sesión y entiende la organización completa desde el dashboard web.',
    range: [0.74, 0.90],
    progressLabel: 'Sucursales',
    theme: 'dark',
  },
  {
    id: 'ai',
    eyebrow: 'Avoqado MCP',
    title: 'Y si quieres saber cómo vas, sólo pregunta.',
    body: 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.',
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
