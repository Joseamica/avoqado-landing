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
  {
    slug: 'ipos',
    name: 'iPOS',
    category: 'punto de venta en la nube',
    tagline: 'que también agenda citas, premia clientes y responde con IA',
    intro:
      'iPOS es un punto de venta en la nube sólido, con facturación e integraciones de e-commerce, y planes publicados desde $990 MXN al mes. Avoqado cubre ese mismo terreno — y le suma citas en línea, lealtad, IA y una terminal de cobro propia, pudiendo empezar gratis.',
    goodAt: [
      'Punto de venta en la nube, accesible desde cualquier dispositivo',
      'Facturación integrada e integraciones con e-commerce y marketplaces',
      'Pensado para retail omnicanal (tienda física + en línea)',
    ],
    whenThemFits:
      'Si tu prioridad es una operación retail omnicanal con tienda en línea y marketplaces integrados, iPOS está bien armado para eso.',
    whenUsFits:
      'Si además del punto de venta quieres citas y reservas, lealtad de clientes, una IA que te responde del negocio y cobrar con terminal integrada — y prefieres empezar sin mensualidad — Avoqado es tu opción.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: true },
      { feature: 'Terminal de cobro con tarjeta propia', them: 'partial', note: 'Ofrece terminales; verifica su esquema y costos' },
      { feature: 'Citas y reservas en línea', them: false, note: 'Enfocado a venta retail y e-commerce' },
      { feature: 'Inventario en tiempo real', them: true },
      { feature: 'Facturación CFDI para México', them: true },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial', note: 'No lo destaca su información pública' },
      { feature: 'IA que responde con los datos de tu negocio', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿Qué diferencia de precio hay?',
        a: 'iPOS publica planes desde $990 MXN al mes. Con Avoqado puedes empezar gratis, sin tarjeta, y el Programa Fundador da 50% de descuento de por vida en planes de pago.',
      },
      {
        q: '¿Me ayudan a cambiarme?',
        a: 'Sí — migramos tu catálogo, inventario y clientes sin costo, y te acompañamos en la puesta en marcha.',
      },
    ],
  },
  {
    slug: 'pulpos',
    name: 'Pulpos',
    category: 'punto de venta para tiendas',
    tagline: 'que suma citas, terminal propia, lealtad e IA de verdad',
    intro:
      'Pulpos es un punto de venta mexicano moderno y fácil de usar, con CFDI 4.0 y control de inventario. Se parece a Avoqado en lo básico — la diferencia está en todo lo demás: citas y reservas en línea, terminal de cobro propia, puntos de lealtad, y una IA a la que le preguntas "¿cómo va mi negocio?" y te contesta con tus datos.',
    goodAt: [
      'Fácil de usar y moderno, corre en computadora, tablet o celular',
      'Facturación CFDI 4.0 desde el punto de venta',
      'Sugerencias de compra basadas en tus ventas',
    ],
    whenThemFits:
      'Si solo necesitas mostrador + inventario + factura y ya, Pulpos lo resuelve bien y es fácil de arrancar.',
    whenUsFits:
      'Si tu negocio también agenda citas, quiere premiar clientes frecuentes, cobrar con terminal integrada o preguntarle a una IA por sus números — Avoqado junta todo eso en el mismo sistema.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: true },
      { feature: 'Terminal de cobro con tarjeta propia', them: 'partial', note: 'Registra pagos con tarjeta; la terminal bancaria va aparte, según su información pública' },
      { feature: 'Citas y reservas en línea', them: false, note: 'Enfocado a venta en mostrador' },
      { feature: 'Inventario en tiempo real', them: true },
      { feature: 'Facturación CFDI para México', them: true },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial', note: 'No lo destaca su información pública' },
      { feature: 'IA que responde con los datos de tu negocio', them: 'partial', note: 'Sugerencias de compra; sin chat de IA según su información pública' },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Soporte en español por WhatsApp', them: 'partial', note: 'Comparte recibos por WhatsApp' },
    ],
    faq: [
      {
        q: '¿Puedo migrar mis productos desde Pulpos?',
        a: 'Sí. Exporta tu catálogo y nosotros lo importamos contigo, sin costo.',
      },
      {
        q: '¿Avoqado también factura CFDI?',
        a: 'Sí — facturación CFDI para México, y además tus clientes pueden autofacturarse solos desde su recibo digital.',
      },
    ],
  },
  {
    slug: 'agendapro',
    name: 'AgendaPro',
    category: 'agenda para estéticas y clínicas',
    tagline: 'que también es punto de venta, inventario y facturación',
    intro:
      'AgendaPro es una agenda especializada para estéticas, spas y clínicas, con buena presencia en Latinoamérica. Hace bien la agenda — pero un negocio también vende productos, controla inventario, factura y cobra en mostrador. Avoqado es la agenda Y todo lo demás, hecho para México.',
    goodAt: [
      'Agenda especializada para belleza, spa y clínicas',
      'Recordatorios automáticos para reducir inasistencias',
      'Presencia y soporte en varios países de Latinoamérica',
    ],
    whenThemFits:
      'Si tu operación es 100% citas y no necesitas punto de venta, inventario ni facturación mexicana integrada, AgendaPro cumple esa parte.',
    whenUsFits:
      'Si además de agendar vendes productos, quieres cobrar con terminal propia, facturar CFDI, controlar inventario y ver todo tu negocio en un solo lugar — para eso está Avoqado.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Enfocado a agenda; la caja es básica' },
      { feature: 'Terminal de cobro con tarjeta propia', them: 'partial', note: 'Procesa pagos; verifica comisiones y condiciones' },
      { feature: 'Citas y reservas en línea', them: true },
      { feature: 'Inventario en tiempo real', them: 'partial', note: 'Inventario básico de productos' },
      { feature: 'Facturación CFDI para México', them: 'partial', note: 'Según plan y país; verifica su información' },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial', note: 'No lo destaca su información pública' },
      { feature: 'IA que responde con los datos de tu negocio', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Soporte en español por WhatsApp', them: 'partial', note: 'Recordatorios por WhatsApp sí; verifica canales de soporte' },
    ],
    faq: [
      {
        q: '¿Avoqado cobra comisión por mis reservas?',
        a: 'No. Tus clientes reservan desde tu página, Google o redes, y la cita cae directo a tu calendario sin comisión por reserva.',
      },
      {
        q: '¿Puedo migrar mi agenda y clientes?',
        a: 'Sí — importamos tus clientes y servicios sin costo, y tu widget de reservas queda listo el mismo día.',
      },
    ],
  },
  {
    slug: 'abarrotes-punto-de-venta',
    name: 'Abarrotes Punto de Venta',
    category: 'punto de venta para abarrotes',
    tagline: 'en la nube: tu tienda en el celular, con terminal e IA',
    intro:
      'Abarrotes Punto de Venta es un clásico de las tienditas mexicanas: software para PC con Windows, directo y conocido. Avoqado es el salto de generación: tu tienda en la nube — la ves desde el celular donde estés —, con terminal de cobro integrada, facturación CFDI y una IA que te contesta preguntas del negocio.',
    goodAt: [
      'Hecho específicamente para tiendas de abarrotes',
      'Sencillo de instalar y operar en una PC con Windows',
      'Muy conocido, con años en el mercado mexicano',
    ],
    whenThemFits:
      'Si tu operación es una caja fija en una PC y así estás a gusto, cumple bien ese trabajo.',
    whenUsFits:
      'Si quieres ver tus ventas desde el celular, cobrar con tarjeta sin cuadrar a mano, facturar en un click y que el sistema te avise qué resurtir — Avoqado te queda mejor.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Principalmente escritorio Windows' },
      { feature: 'Terminal de cobro con tarjeta propia', them: false, note: 'La terminal bancaria va por separado' },
      { feature: 'Citas y reservas en línea', them: false },
      { feature: 'Inventario en tiempo real', them: 'partial', note: 'Local en tu PC' },
      { feature: 'Facturación CFDI para México', them: 'partial', note: 'Con su módulo de facturación' },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial', note: 'No lo destaca su información pública' },
      { feature: 'IA que responde con los datos de tu negocio', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿Puedo pasar mis productos a Avoqado?',
        a: 'Sí. Exporta tu catálogo y nosotros lo importamos contigo sin costo — códigos de barras incluidos.',
      },
      {
        q: '¿Necesito comprar equipo nuevo?',
        a: 'No. Avoqado corre en la computadora, tablet o celular que ya tienes, y la terminal de cobro te la damos nosotros.',
      },
    ],
  },
  {
    slug: 'soft-restaurant',
    name: 'Soft Restaurant',
    category: 'punto de venta para restaurantes',
    tagline: 'todo incluido, sin módulos: comandas, cobros, reservas e IA',
    intro:
      'Soft Restaurant es el punto de venta más conocido del sector restaurantero mexicano, con años de trayectoria y una operación muy completa. Avoqado es la opción moderna: nace en la nube, incluye comandero, cobros con terminal propia, reservas en línea e IA — sin armar el sistema por módulos.',
    goodAt: [
      'El más conocido para restaurantes en México',
      'Operación completa de restaurante: comandas, mesas, cocina',
      'Facturación disponible y red amplia de distribuidores',
    ],
    whenThemFits:
      'Si tu restaurante ya corre estable en Soft Restaurant y tu equipo lo domina, cambiarte tiene que justificarse — es un producto probado.',
    whenUsFits:
      'Si estás empezando o quieres modernizarte: comandero digital, cobro con terminal integrada, reservas en línea, y una IA que te dice cómo va el día desde el celular — todo incluido, sin comprar módulos por separado.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Centrado en escritorio, con versiones en la nube' },
      { feature: 'Terminal de cobro con tarjeta propia', them: 'partial', note: 'La terminal bancaria va aparte, según su información pública' },
      { feature: 'Citas y reservas en línea', them: 'partial', note: 'Reservaciones según versión y módulos' },
      { feature: 'Inventario en tiempo real', them: true },
      { feature: 'Facturación CFDI para México', them: true },
      { feature: 'Lealtad y puntos para tus clientes', them: 'partial', note: 'Según módulos' },
      { feature: 'IA que responde con los datos de tu negocio', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿Avoqado aguanta la operación de un restaurante?',
        a: 'Sí: comandero digital a cocina, mesas, cobros con terminal, propinas, inventario de insumos y reportes en tiempo real.',
      },
      {
        q: '¿Qué tan difícil es migrar?',
        a: 'Te ayudamos a cargar tu menú y recetas sin costo, y te acompañamos el día del arranque para que no pares operación.',
      },
    ],
  },
  {
    slug: 'wansoft',
    name: 'Wansoft',
    category: 'punto de venta para restaurantes',
    tagline: 'con reservas en línea, IA y elección de cuenta bancaria por venta',
    intro:
      'Wansoft (hoy Wansoft by Clip) es una solución mexicana sólida para restaurantes, con terminales Clip integradas y esquema mes a mes. Avoqado también es 100% mexicano y con terminal propia — y le suma reservas en línea, IA que responde de tu negocio, y algo único: tú eliges a qué cuenta bancaria cae cada venta.',
    goodAt: [
      'Solución 100% mexicana enfocada a restaurantes',
      'Terminales de cobro integradas (Clip)',
      'Programas de lealtad e integraciones con apps de delivery',
    ],
    whenThemFits:
      'Si tu operación es un restaurante y ya trabajas a gusto con el ecosistema Clip, Wansoft es una opción coherente.',
    whenUsFits:
      'Si quieres además reservas en línea, una IA que te contesta del negocio, elegir a qué cuenta cae cada venta — o si tu negocio no es solo restaurante (también tienda o servicios) — Avoqado te da un solo sistema para todo.',
    rows: [
      { feature: 'Punto de venta completo (iOS, Android y Windows)', them: 'partial', note: 'Enfocado a restaurantes' },
      { feature: 'Terminal de cobro con tarjeta propia', them: true, note: 'Con terminales Clip' },
      { feature: 'Citas y reservas en línea', them: 'partial', note: 'No lo destaca su información pública' },
      { feature: 'Inventario en tiempo real', them: true },
      { feature: 'Facturación CFDI para México', them: 'partial', note: 'Verifica su esquema de facturación' },
      { feature: 'Lealtad y puntos para tus clientes', them: true },
      { feature: 'IA que responde con los datos de tu negocio', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Elige a qué cuenta bancaria cae cada venta', them: false, note: 'No lo anuncia su información pública' },
      { feature: 'Soporte en español por WhatsApp', them: 'partial' },
    ],
    faq: [
      {
        q: '¿En qué se diferencia Avoqado si ambos son mexicanos y con terminal?',
        a: 'En el alcance: Avoqado añade reservas en línea, IA con tus datos, lealtad, y multi-cuenta bancaria por venta — y funciona igual para restaurantes, tiendas y negocios de servicios.',
      },
      {
        q: '¿Puedo migrar mi menú y productos?',
        a: 'Sí, te ayudamos a cargarlo sin costo y te acompañamos en el arranque.',
      },
    ],
  },
];
