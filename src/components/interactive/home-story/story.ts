export const STORY_SCENE_IDS = [
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
    id: 'entry',
    eyebrow: 'Toda tu operación, conectada',
    title: 'Un cliente hace una cosa. Avoqado mueve todo lo demás.',
    body: 'Una reserva, una compra o un cobro se convierte en ventas, inventario, clientes, finanzas y decisiones — sin volver a capturar nada.',
    range: [0, 0.11],
    progressLabel: 'Inicio',
    theme: 'dark',
  },
  {
    id: 'channels',
    eyebrow: 'Una sola entrada de verdad',
    title: 'Tu cliente empieza como prefiera.',
    body: 'Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.',
    range: [0.10, 0.21],
    progressLabel: 'Canales',
    theme: 'light',
  },
  {
    id: 'service',
    eyebrow: 'Contexto compartido',
    title: 'Tu equipo recibe el contexto completo.',
    body: 'Cliente, servicio, productos, colaborador y sucursal llegan juntos.',
    range: [0.20, 0.31],
    progressLabel: 'Servicio',
    theme: 'dark',
  },
  {
    id: 'payment',
    eyebrow: 'Cobro trazable',
    title: 'Cobra por el canal correcto. Conserva el hilo del dinero.',
    body: 'TPV, ecommerce, liga o efectivo: Avoqado registra cómo ocurrió cada pago y, en TPV compatibles, permite elegir la Cuenta de cobro habilitada.',
    range: [0.30, 0.43],
    progressLabel: 'Cobro',
    theme: 'dark',
  },
  {
    id: 'aftercare',
    eyebrow: 'Después del servicio',
    title: 'La experiencia termina bien. El trabajo apenas empieza.',
    body: 'Recibo digital, reseña de Google y facturación desde el recibo, cuando la sucursal lo tiene configurado.',
    range: [0.42, 0.53],
    progressLabel: 'Cliente',
    theme: 'light',
  },
  {
    id: 'operations',
    eyebrow: 'Automatización operativa',
    title: 'Una venta. Seis sistemas actualizados.',
    body: 'Ventas, inventario, compras, CRM, puntos, turnos y comisiones avanzan desde el mismo evento.',
    range: [0.52, 0.67],
    progressLabel: 'Operación',
    theme: 'dark',
  },
  {
    id: 'finance',
    eyebrow: 'Del cobro a los libros',
    title: 'El dinero no se pierde entre sistemas.',
    body: 'Costo, liquidación esperada, conciliación, banca y contabilidad conservan la referencia del pago.',
    range: [0.66, 0.77],
    progressLabel: 'Finanzas',
    theme: 'light',
  },
  {
    id: 'multibranch',
    eyebrow: 'Control multi-sucursal',
    title: 'Una sucursal o diez. Una sola operación.',
    body: 'Cambia de sucursal sin cerrar sesión y entiende la organización completa desde el dashboard web.',
    range: [0.76, 0.89],
    progressLabel: 'Sucursales',
    theme: 'dark',
  },
  {
    id: 'ai',
    eyebrow: 'Avoqado MCP',
    title: 'Y si quieres saber cómo vas, sólo pregunta.',
    body: 'ChatGPT o Claude pueden consultar ventas, inventario, clientes y sucursales con el contexto de Avoqado.',
    range: [0.88, 1],
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
