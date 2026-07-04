/**
 * Datos de las páginas /alternativas/[slug] — comparativas honestas contra
 * los competidores que la gente REALMENTE busca en la cuenta de Google Ads
 * (reporte de términos de búsqueda, jul 2026).
 *
 * Principios (skill de competitor pages): reconocer lo bueno del competidor,
 * no inventar datos de su producto (afirmaciones hedged + disclaimer), y
 * ayudar a decidir — hay perfiles para los que el competidor es mejor opción.
 * Los CTAs de WhatsApp SIEMPRE via /wa (conversión whatsapp_click).
 */

export type CompRow = {
  feature: string;
  /** true = lo tiene, 'partial' = con matices (se muestra la nota), false = no lo ofrece nativo */
  them: boolean | 'partial' | false;
  note?: string;
};

export interface Competitor {
  slug: string;
  name: string;
  category: string;
  /** H1: La alternativa a [name] ... */
  tagline: string;
  intro: string;
  /** Honestidad primero: qué hace bien el competidor. */
  goodAt: string[];
  /** Cuándo el competidor ES la mejor opción (reduce fricción, genera confianza). */
  whenThemFits: string;
  /** Cuándo Avoqado es la mejor opción. */
  whenUsFits: string;
  rows: CompRow[];
  faq: { q: string; a: string }[];
}

/** Filas que Avoqado cumple en todos los casos (columna Avoqado = ✓ siempre). */
export const AVOQADO_FEATURES = [
  'Punto de venta completo (iOS, Android y Windows)',
  'Terminal de cobro con tarjeta propia',
  'Citas y reservas en línea',
  'Inventario en tiempo real',
  'Facturación CFDI para México',
  'Lealtad y puntos para tus clientes',
  'IA que responde con los datos de tu negocio',
  'Elige a qué cuenta bancaria cae cada venta',
  'Soporte en español por WhatsApp',
] as const;

export const COMPETITORS: Competitor[] = [
  {
    slug: 'loyverse',
    name: 'Loyverse',
    category: 'punto de venta gratuito',
    tagline: 'todo-en-uno y hecha en México',
    intro:
      'Loyverse es un punto de venta gratuito muy popular para empezar. Pero cuando tu negocio crece, empiezas a pagar suscripciones por módulos y a depender de integraciones para cobrar con tarjeta o facturar. Avoqado junta todo eso en un solo sistema desde el día uno.',
    goodAt: [
      'Empezar gratis con una caja sencilla',
      'App móvil fácil de usar',
      'Comunidad grande y material de ayuda',
    ],
    whenThemFits:
      'Si solo necesitas registrar ventas en una caja, sin cobrar con tarjeta integrada, sin facturar CFDI y sin agenda de citas, Loyverse gratuito te puede bastar.',
    whenUsFits:
      'Si cobras con tarjeta, facturas CFDI, manejas citas o inventario en serio, o quieres ver todo tu negocio (y preguntarle a una IA) en un solo lugar — para eso está Avoqado.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'App móvil y tablet; funciones avanzadas son suscripciones aparte' },
      { feature: 'Terminal de cobro con tarjeta propia', them: false, note: 'Vía integraciones de terceros' },
      { feature: 'Citas y reservas en línea', them: false },
      { feature: 'Inventario en tiempo real', them: 'partial', note: 'El inventario avanzado es una suscripción aparte' },
      { feature: 'Facturación CFDI para México', them: false, note: 'Requiere herramientas de terceros' },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial' },
      { feature: 'IA que responde con los datos de tu negocio', them: false },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false },
      { feature: 'Soporte en español por WhatsApp', them: 'partial', note: 'Soporte principalmente por chat/correo' },
    ],
    faq: [
      {
        q: '¿Puedo migrar mis productos desde Loyverse?',
        a: 'Sí. Exporta tu catálogo y nosotros te ayudamos a importarlo — la migración va por nuestra cuenta, sin costo.',
      },
      {
        q: '¿Cuánto cuesta Avoqado?',
        a: 'Puedes empezar gratis, sin tarjeta. Y con el Programa Fundador obtienes 50% de descuento de por vida en planes de pago (lugares limitados).',
      },
    ],
  },
  {
    slug: 'eleventa',
    name: 'Eleventa',
    category: 'punto de venta para tiendas y abarrotes',
    tagline: 'en la nube, con cobros y facturación integrados',
    intro:
      'Eleventa es un clásico de las tiendas y abarrotes en México: software de escritorio para Windows, directo y conocido. Avoqado es la siguiente generación: vive en la nube, corre en cualquier equipo (computadora, tablet o celular), cobra con terminal integrada y te responde con IA.',
    goodAt: [
      'Muy conocido en tiendas y abarrotes de México',
      'Interfaz sencilla en Windows',
      'Años de trayectoria en el mercado',
    ],
    whenThemFits:
      'Si tu operación es una caja fija en una PC con Windows y así estás cómodo, Eleventa cumple bien ese trabajo.',
    whenUsFits:
      'Si quieres ver tu negocio desde donde estés, cobrar con terminal sin cuadrar a mano, facturar CFDI en un click y que el inventario, los clientes y los reportes vivan juntos — Avoqado es para ti.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Principalmente escritorio Windows' },
      { feature: 'Terminal de cobro con tarjeta propia', them: false, note: 'La terminal bancaria va por separado' },
      { feature: 'Citas y reservas en línea', them: false },
      { feature: 'Inventario en tiempo real', them: 'partial', note: 'Local en tu PC; la nube es limitada' },
      { feature: 'Facturación CFDI para México', them: 'partial', note: 'Con timbres/módulos adicionales' },
      { feature: 'Lealtad y puntos para tus clientes', them: false },
      { feature: 'IA que responde con los datos de tu negocio', them: false },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿Puedo pasar mis productos de Eleventa a Avoqado?',
        a: 'Sí. Te ayudamos a migrar tu catálogo e inventario sin costo, y te acompañamos en la puesta en marcha.',
      },
      {
        q: '¿Necesito comprar equipo nuevo?',
        a: 'No. Avoqado corre en la computadora, tablet o celular que ya tienes. La terminal de cobro te la damos nosotros.',
      },
    ],
  },
  {
    slug: 'sicar',
    name: 'SICAR',
    category: 'punto de venta para comercios',
    tagline: 'moderna, con citas, IA y terminal incluida',
    intro:
      'SICAR es un punto de venta mexicano robusto y con años en el mercado. Avoqado compite de tú a tú en ventas e inventario — y le suma lo que un negocio de hoy necesita: citas en línea, cobros con terminal propia, lealtad de clientes y una IA que responde preguntas de tu negocio.',
    goodAt: [
      'Robusto para tiendas con mucho movimiento',
      'Muy usado en comercios mexicanos',
      'Facturación disponible',
    ],
    whenThemFits:
      'Si tu operación ya corre bien en SICAR y solo vendes en mostrador con una caja fija, puede seguir siéndote útil.',
    whenUsFits:
      'Si además de vender quieres agendar citas, cobrar con terminal integrada, premiar clientes frecuentes y preguntarle a tu negocio "¿cómo vamos?" desde el celular — eso es Avoqado.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Principalmente escritorio' },
      { feature: 'Terminal de cobro con tarjeta propia', them: false, note: 'La terminal bancaria va por separado' },
      { feature: 'Citas y reservas en línea', them: false },
      { feature: 'Inventario en tiempo real', them: true },
      { feature: 'Facturación CFDI para México', them: 'partial', note: 'Según plan/módulos' },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial' },
      { feature: 'IA que responde con los datos de tu negocio', them: false },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿Qué tan difícil es cambiarme desde SICAR?',
        a: 'Nada del otro mundo: exportas tu catálogo, nosotros lo importamos y configuramos contigo. La migración es sin costo.',
      },
      {
        q: '¿Avoqado aguanta un negocio con mucho movimiento?',
        a: 'Sí — procesamos ventas, inventario y cobros en tiempo real, y puedes tener varias cajas y sucursales conectadas.',
      },
    ],
  },
  {
    slug: 'fresha',
    name: 'Fresha',
    category: 'agenda para salones y estéticas',
    tagline: 'sin comisiones por tus propias reservas',
    intro:
      'Fresha tiene una agenda en línea muy pulida para salones y estéticas. Pero su modelo cobra comisiones por reservas de clientes nuevos y por procesar pagos — y se queda corto como sistema completo para México (punto de venta, inventario, CFDI). Avoqado es agenda + POS + cobros + facturación, todo en uno.',
    goodAt: [
      'Agenda en línea pulida y fácil para el cliente final',
      'Marketplace propio donde te pueden descubrir',
      'Recordatorios automáticos de citas',
    ],
    whenThemFits:
      'Si solo necesitas una agenda bonita y te funciona su modelo de comisiones por cliente nuevo, Fresha hace bien esa parte.',
    whenUsFits:
      'Si quieres la agenda Y el punto de venta Y el cobro con terminal Y la facturación CFDI — sin pagar comisión por tus propias reservas — Avoqado junta todo eso, hecho para negocios mexicanos.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Enfocado a agenda; el POS es básico' },
      { feature: 'Terminal de cobro con tarjeta propia', them: 'partial', note: 'Con comisiones por procesamiento' },
      { feature: 'Citas y reservas en línea', them: true },
      { feature: 'Inventario en tiempo real', them: 'partial', note: 'Inventario básico de productos' },
      { feature: 'Facturación CFDI para México', them: false },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial' },
      { feature: 'IA que responde con los datos de tu negocio', them: false },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿Avoqado cobra comisión por mis reservas?',
        a: 'No. Tus clientes reservan desde tu página, Google o redes y la cita cae directo a tu calendario, sin comisión por reserva.',
      },
      {
        q: '¿Puedo migrar mi agenda y clientes?',
        a: 'Sí. Te ayudamos a importar tus clientes y servicios sin costo, y tu widget de reservas queda listo el mismo día.',
      },
    ],
  },
];
