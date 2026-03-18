import type { APIRoute } from 'astro';

export const prerender = false;

// Avoqado margin on top of Blumon rates
const AVOQADO_MARGIN = 0.2; // 0.2% added to credit and debit
const AMEX_MARGIN = 0.3; // 0.3% added to amex

// Pricing data by business type
const familiasTasas: Record<string, { credito: number; debito: number; amex: number }> = {
  "restaurante": { credito: 2.30, debito: 1.68, amex: 3.00 },
  "cafeteria": { credito: 2.30, debito: 1.68, amex: 3.00 },
  "cafe": { credito: 2.30, debito: 1.68, amex: 3.00 },
  "bar": { credito: 2.30, debito: 1.68, amex: 3.00 },
  "comida rapida": { credito: 1.70, debito: 1.35, amex: 3.00 },
  "retail": { credito: 1.53, debito: 1.15, amex: 3.00 },
  "tienda": { credito: 1.53, debito: 1.15, amex: 3.00 },
  "boutique": { credito: 1.53, debito: 1.15, amex: 3.00 },
  "belleza": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "salon": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "spa": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "estetica": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "servicios": { credito: 2.05, debito: 1.68, amex: 3.00 },
  "consultorio": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "medico": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "dentista": { credito: 1.00, debito: 1.00, amex: 3.00 },
  "gimnasio": { credito: 1.70, debito: 1.63, amex: 3.00 },
  "gym": { credito: 1.70, debito: 1.63, amex: 3.00 },
  "hotel": { credito: 2.10, debito: 1.63, amex: 3.00 },
  "farmacia": { credito: 1.28, debito: 1.00, amex: 3.00 },
};

// Check if user is asking about pricing in context
function isPricingContext(history: { role: string; content: string }[]): boolean {
  const lastTwo = history.slice(-4); // Check last 2 exchanges
  return lastTwo.some(msg => 
    msg.content.toLowerCase().includes('precio') ||
    msg.content.toLowerCase().includes('cuesta') ||
    msg.content.toLowerCase().includes('costo') ||
    msg.content.toLowerCase().includes('comision') ||
    msg.content.toLowerCase().includes('tasa')
  );
}

// Get pricing for a business type
function getPricingForBusiness(businessType: string): string | null {
  const normalized = businessType.toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  for (const [key, rates] of Object.entries(familiasTasas)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      const credito = (rates.credito + AVOQADO_MARGIN).toFixed(2);
      const debito = (rates.debito + AVOQADO_MARGIN).toFixed(2);
      const amex = (rates.amex + AMEX_MARGIN).toFixed(2);
      
      return `Para ${businessType}, las comisiones son:\n• Débito: ${debito}%\n• Crédito: ${credito}%\n• AMEX: ${amex}%\n\nTip: Para más información: [avoqado.io/pricing](/pricing)`;
    }
  }
  return null;
}

// Extended FAQ database for local matching (FREE responses)
const localFAQ: { keywords: string[], answer: string }[] = [
  // ===== GENERAL =====
  {
    keywords: ['qué es avoqado', 'que es avoqado', 'qué hace', 'que hace', 'avoqado es', 'explica avoqado'],
    answer: 'Avoqado es una plataforma integral de gestión para comercios que unifica punto de venta (TPV), pagos, reservas y administración en una sola solución. Ayudamos a restaurantes, bares, retail y servicios a operar de forma más eficiente.'
  },
  {
    keywords: ['cuánto cuesta', 'cuanto cuesta', 'precio', 'precios', 'costo', 'costos', 'plan', 'planes', 'tarifa', 'mensualidad', 'cuota'],
    answer: '¡Buena pregunta! Tip: Los precios dependen de tu tipo de negocio. ¿Qué tipo de negocio tienes? (restaurante, retail, belleza, servicios, etc.)'
  },
  {
    keywords: ['comision', 'comisiones', 'fee', 'porcentaje', 'cargo', 'cargos ocultos', 'tasa', 'tasas'],
    answer: '¡Buena pregunta! Tip: Las comisiones dependen de tu tipo de negocio. ¿Qué tipo de negocio tienes? (restaurante, tienda, spa, etc.)'
  },
  {
    keywords: ['prueba', 'trial', 'gratis', 'gratuito', 'probar', 'demo', 'demostración'],
    answer: 'Sí, ofrecemos una demostración personalizada para que conozcas todas las funcionalidades. Puedes agendar una demo en avoqado.io/contact o registrarte directamente en dashboardv2.avoqado.io/signup.'
  },
  {
    keywords: ['contacto', 'contactar', 'ventas', 'hablar', 'comunicar', 'whatsapp', 'teléfono', 'telefono', 'email', 'correo'],
    answer: 'Puedes contactarnos: 1) Formulario en avoqado.io/contact, 2) WhatsApp (link abajo), 3) Email a hola@avoqado.io. ¡Estamos para ayudarte!'
  },
  {
    keywords: ['hola', 'buenos días', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey', 'hi', 'ola'],
    answer: '¡Hola! Soy el asistente de Avoqado. Puedo responder tus preguntas sobre nuestra plataforma, precios, funcionalidades, y mas. ¿En que puedo ayudarte?'
  },
  {
    keywords: ['gracias', 'perfecto', 'genial', 'excelente', 'ok', 'entendido'],
    answer: '¡De nada! Si tienes más preguntas, aquí estaré. También puedes contactar a nuestro equipo directamente en avoqado.io/contact o por WhatsApp. 🙌'
  },

  // ===== SECTORES / INDUSTRIAS =====
  {
    keywords: ['sector', 'sectores', 'industria', 'industrias', 'tipo de negocio', 'para quién', 'para quien', 'negocios'],
    answer: 'Avoqado está diseñado para múltiples sectores: Alimentos y Bebidas (restaurantes, cafeterías, bares), Retail (tiendas), Belleza (salones, spas), y Servicios Profesionales. Nuestra plataforma se adapta a cada industria.'
  },

  // ===== TPV MÓVIL =====
  {
    keywords: ['tpv', 'punto de venta', 'terminal', 'pos', 'app', 'aplicación', 'aplicacion'],
    answer: 'El TPV Móvil de Avoqado es una app para iOS que te permite cobrar desde cualquier lugar. Incluye: gestión de menú, cobro con tarjeta/QR/efectivo, comandas a cocina, división de cuentas, y modo offline.'
  },
  {
    keywords: ['móvil', 'movil', 'celular', 'iphone', 'ipad', 'tablet', 'dispositivo'],
    answer: 'Avoqado funciona en dispositivos iOS (iPhone y iPad). La app TPV está optimizada para uso en campo, permitiéndote cobrar y gestionar desde cualquier lugar de tu negocio.'
  },
  {
    keywords: ['android'],
    answer: 'Actualmente el TPV de Avoqado está disponible solo para iOS (iPhone/iPad). El Dashboard web funciona en cualquier navegador. Contáctanos si tienes preguntas sobre compatibilidad.'
  },
  {
    keywords: ['offline', 'sin internet', 'sin conexión', 'sin conexion', 'funciona sin'],
    answer: 'Sí, el TPV de Avoqado tiene modo offline. Puedes seguir tomando órdenes y cobrando aunque no tengas internet. Los datos se sincronizan automáticamente cuando recuperas conexión.'
  },

  // ===== PAGOS =====
  {
    keywords: ['pago', 'pagos', 'cobrar', 'cobro', 'aceptar pagos', 'formas de pago'],
    answer: 'Avoqado acepta múltiples formas de pago: tarjetas de crédito/débito, pagos QR, efectivo, y más. Todo se registra automáticamente en tu dashboard con reportes en tiempo real.'
  },
  {
    keywords: ['tarjeta', 'tarjetas', 'crédito', 'credito', 'débito', 'debito', 'visa', 'mastercard'],
    answer: 'Sí, Avoqado acepta todas las tarjetas de crédito y débito principales (Visa, Mastercard, American Express). Los cobros se procesan de forma segura con encriptación bancaria.'
  },
  {
    keywords: ['qr', 'código qr', 'codigo qr', 'escanear', 'pago qr'],
    answer: 'Con Pagos QR de Avoqado, tus clientes pueden pagar escaneando un código desde su celular. Es rápido, sin contacto, y les permite dejar propina y reseña. Ideal para mesas de restaurante.'
  },
  {
    keywords: ['efectivo', 'cash', 'billetes', 'monedas', 'cambio'],
    answer: 'Sí, Avoqado registra pagos en efectivo. El sistema lleva control de tu caja, calcula cambios, y genera reportes de cierre automáticos. Todo queda registrado para tus cortes.'
  },
  {
    keywords: ['propina', 'propinas', 'tip', 'tips'],
    answer: 'Avoqado incluye propinas digitales integradas. Tus clientes pueden dejar propina al pagar, ya sea desde el TPV o mediante pago QR. Las propinas se reportan por separado para fácil distribución.'
  },
  {
    keywords: ['split', 'dividir', 'división', 'division', 'cuenta dividida', 'separar cuenta'],
    answer: 'Sí, puedes dividir cuentas fácilmente. La función Split permite que varios clientes paguen su parte de la cuenta, ya sea en partes iguales o seleccionando productos específicos.'
  },

  // ===== ENRUTAMIENTO DE PAGOS =====
  {
    keywords: ['enrutamiento', 'routing', 'clabe', 'banco', 'bancos', 'cuenta bancaria', 'depósito', 'deposito'],
    answer: 'El enrutamiento inteligente de Avoqado te permite configurar múltiples CLABEs bancarias. Puedes dirigir pagos a diferentes bancos automáticamente, ideal para negocios con múltiples socios o sucursales.'
  },
  {
    keywords: ['santander', 'bbva', 'bancomer', 'banorte', 'inbursa', 'hsbc', 'citibanamex'],
    answer: 'Avoqado es compatible con todos los bancos mexicanos. Puedes configurar depósitos a Santander, BBVA, Banorte, Inbursa, HSBC, Citibanamex, y más. El dinero llega directo a tu cuenta.'
  },

  // ===== DASHBOARD =====
  {
    keywords: ['dashboard', 'panel', 'administración', 'administracion', 'web', 'navegador', 'computadora'],
    answer: 'El Dashboard de Avoqado es tu centro de control web. Desde ahí puedes ver reportes, gestionar inventario, administrar personal, configurar menús, y monitorear todas tus operaciones en tiempo real.'
  },
  {
    keywords: ['reporte', 'reportes', 'estadísticas', 'estadisticas', 'análisis', 'analisis', 'analytics'],
    answer: 'Avoqado genera reportes en tiempo real: ventas por hora/día/mes, productos más vendidos, ticket promedio, horarios pico, rendimiento de personal, y más. Toma decisiones basadas en datos.'
  },

  // ===== INVENTARIO =====
  {
    keywords: ['inventario', 'stock', 'productos', 'existencias', 'almacén', 'almacen'],
    answer: 'La gestión de inventario de Avoqado te permite: controlar stock en tiempo real, recibir alertas de productos bajos, registrar mermas, y sincronizar automáticamente con cada venta desde el TPV.'
  },
  {
    keywords: ['menú', 'menu', 'carta', 'platillos', 'categorías', 'categorias', 'modificadores'],
    answer: 'Puedes gestionar tu menú completo desde el Dashboard: crear categorías, agregar platillos con fotos, configurar modificadores (tamaños, extras), establecer precios, y sincronizar con el TPV al instante.'
  },

  // ===== OPERACIONES RESTAURANTE =====
  {
    keywords: ['mesa', 'mesas', 'tabla', 'tablas', 'zona', 'zonas', 'sección', 'seccion'],
    answer: 'El sistema de mesas de Avoqado te permite: visualizar ocupación, asignar meseros por zona, transferir cuentas entre mesas, y ver el estado de cada mesa en tiempo real.'
  },
  {
    keywords: ['orden', 'ordenes', 'órdenes', 'comanda', 'comandas', 'pedido', 'pedidos'],
    answer: 'Las órdenes se envían desde el TPV directo a cocina. Puedes ver el estatus de cada orden, marcar como entregada, y el sistema registra tiempos de preparación para optimizar tu operación.'
  },
  {
    keywords: ['cocina', 'kitchen', 'pantalla cocina', 'kds', 'preparación', 'preparacion'],
    answer: 'Avoqado tiene sistema de pantalla para cocina (KDS). Las comandas llegan ordenadas por prioridad, los cocineros marcan platillos listos, y el mesero recibe notificación cuando están preparados.'
  },
  {
    keywords: ['impresora', 'imprimir', 'ticket', 'tickets', 'recibo', 'recibos', 'comanda impresa'],
    answer: 'Avoqado es compatible con impresoras térmicas de tickets. Puedes imprimir comandas en cocina, recibos para clientes, y reportes de cierre. Soportamos las marcas más comunes (Epson, Star, etc).'
  },

  // ===== PERSONAL =====
  {
    keywords: ['personal', 'empleado', 'empleados', 'meseros', 'staff', 'equipo', 'trabajador', 'trabajadores'],
    answer: 'Avoqado incluye gestión de personal: puedes crear usuarios con diferentes roles y permisos, asignar a zonas/mesas, trackear ventas por empleado, y controlar propinas individuales.'
  },
  {
    keywords: ['turno', 'turnos', 'horario', 'horarios', 'entrada', 'salida', 'reloj checador'],
    answer: 'El módulo de turnos te permite: registrar entrada/salida del personal, programar horarios, ver horas trabajadas, y generar reportes para nómina. Todo integrado con el sistema.'
  },
  {
    keywords: ['saldo', 'saldos', 'corte', 'cortes', 'cierre', 'arqueo', 'caja'],
    answer: 'El sistema de saldos y cortes de Avoqado automatiza el cierre de caja. Calcula efectivo esperado, registra diferencias, genera reportes de turno, y consolida todo en el Dashboard.'
  },

  // ===== SEGURIDAD =====
  {
    keywords: ['seguro', 'seguridad', 'datos', 'privacidad', 'encriptación', 'encriptacion', 'pci', 'protección', 'proteccion'],
    answer: 'Avoqado usa encriptación de grado bancario y cumple con PCI-DSS para proteger datos de pago. Tu información y la de tus clientes está segura. Nunca almacenamos datos de tarjetas.'
  },

  // ===== SOPORTE =====
  {
    keywords: ['soporte', 'ayuda', 'asistencia', 'problema', 'error', 'falla', 'no funciona', 'bug'],
    answer: 'Nuestro equipo de soporte está disponible para ayudarte. Puedes contactarnos por: 1) Chat en vivo, 2) Email a hola@avoqado.io, 3) WhatsApp. Respondemos rápido.'
  },

  // ===== PLATAFORMA UNIFICADA =====
  {
    keywords: ['unificado', 'unificada', 'todo en uno', 'integrado', 'centralizado', 'un solo', 'una sola'],
    answer: 'Avoqado es la plataforma unificada: TPV, Dashboard, pagos, inventario, personal, todo conectado. Un solo sistema, cero conciliaciones. Sin hojas de Excel, sin esfuerzo manual.'
  },

  // ===== MISC =====
  {
    keywords: ['méxico', 'mexico', 'mexicano', 'país', 'pais', 'disponible en'],
    answer: 'Avoqado opera en México. Estamos optimizados para el mercado mexicano: pesos, bancos locales, CFDIs, y soporte en español. Actualmente solo estamos disponibles en México.'
  },
  {
    keywords: ['sucursal', 'sucursales', 'multi', 'varias', 'varias ubicaciones', 'cadena'],
    answer: 'Sí, Avoqado soporta múltiples sucursales. Puedes gestionar varias ubicaciones desde un solo Dashboard, con reportes consolidados o por sucursal. Ideal para cadenas y franquicias.'
  },
  {
    keywords: ['adios', 'adiós', 'bye', 'chao', 'hasta luego', 'nos vemos'],
    answer: '¡Hasta pronto! Si necesitas mas ayuda, estare aqui. Tambien puedes visitar avoqado.io o contactar a nuestro equipo directamente.'
  },

  // ===== ACCESO ANTICIPADO / EARLY ACCESS =====
  {
    keywords: ['acceso anticipado', 'early access', 'lugares', 'spots', 'fundador', 'fundadores', 'primeros 100', 'reservar lugar'],
    answer: '¡Tenemos Acceso Anticipado! Solo quedan ~50 lugares de los 100 disponibles. Los beneficios incluyen: \n- **Co-crear el producto** - 100% de features priorizadas por usuarios\n- **Soporte VIP** - Canal directo via Slack, <2h respuesta\n- **Pricing Fundador** - 50% descuento permanente de por vida\n- **Features a medida** - Personalizaciones sin costo\n\n¿Te interesa? Puedes registrarte directamente en la seccion "Se parte del futuro" de nuestra pagina.'
  },
  {
    keywords: ['descuento', 'oferta', 'promoción', 'promocion', 'beneficios', 'ventajas'],
    answer: '¡Tenemos algo especial! Nuestro programa de Acceso Anticipado ofrece **50% de descuento permanente** para los primeros 100 negocios. Tambien incluye soporte VIP, co-creacion del producto, y features personalizadas. Solo quedan ~50 lugares.'
  },
  {
    keywords: ['registrar', 'registrarse', 'inscribir', 'unirse', 'apuntar'],
    answer: 'Puedes registrarte de dos formas: 1) En la seccion "Se parte del futuro" al final de avoqado.io, 2) En dashboardv2.avoqado.io/signup. Si quieres ser parte del programa de Acceso Anticipado, solo quedan ~50 lugares con 50% de descuento permanente.'
  }
];

// Context for OpenAI when local FAQ doesn't match
const AVOQADO_CONTEXT = `
Eres el asistente virtual de Avoqado, una plataforma de gestión para comercios. 
Tu rol es responder preguntas sobre Avoqado de forma amigable, concisa y profesional.

INFORMACIÓN CLAVE DE AVOQADO:
- Plataforma integral: TPV móvil, dashboard web, pagos QR, gestión de inventario
- Sectores: restaurantes, bares, cafeterías, retail, servicios, belleza
- Sede: México
- Contacto: hola@avoqado.io, avoqado.io/contact
- Registro: dashboardv2.avoqado.io/signup
- Precios: avoqado.io/pricing (calculadora interactiva)
- Seguridad: Encriptación bancaria, PCI-DSS

PROGRAMA DE ACCESO ANTICIPADO (MUY IMPORTANTE):
- Solo 100 lugares disponibles, quedan aproximadamente 50
- Beneficios exclusivos para fundadores:
  • Co-crear el producto: 100% de las features son priorizadas por usuarios fundadores
  • Soporte VIP: Canal directo de Slack con el equipo, tiempo de respuesta menor a 2 horas
  • Pricing Fundador: 50% de descuento PERMANENTE de por vida
  • Features a medida: Desarrollamos funcionalidades específicas para tu negocio sin costo adicional
- Sin costo ni compromiso para registrarse
- Los usuarios pueden reservar su lugar en la sección "Sé parte del futuro" de avoqado.io

COMISIONES POR SECTOR:
- Restaurantes/Bares: Crédito 2.50%, Débito 1.88%
- Retail/Tiendas: Crédito 1.73%, Débito 1.35%
- Belleza/Salones/Spa: Crédito 1.20%, Débito 1.20%
- Servicios/Consultorios: Crédito 1.20%, Débito 1.20%
- Joyerías: Se clasifican como retail, Crédito 1.73%, Débito 1.35%

REGLAS:
1. Si el usuario pregunta por precios/comisiones y NO especifica sector, pregunta qué tipo de negocio tiene
2. Si especifica sector después de preguntar precios, da solo las comisiones exactas (Débito X%, Crédito Y%)
3. Sé conciso (máximo 2-3 oraciones)
4. Usa español informal pero profesional
5. Siempre menciona avoqado.io/pricing para cálculos exactos
6. NO menciones detalles internos como márgenes o porcentajes adicionales
7. Si mencionan interés en unirse/probar, menciona el programa de Acceso Anticipado con sus beneficios
`;

// Simple fuzzy matching function (skip if in pricing context)
function findLocalMatch(query: string, skipPricingBusinessTypes: boolean = false): string | null {
  const normalizedQuery = query.toLowerCase().trim();
  
  for (const faq of localFAQ) {
    // Skip business type matches if we're in pricing context
    if (skipPricingBusinessTypes) {
      const businessKeywords = ['restaurante', 'retail', 'belleza', 'spa', 'salon', 'tienda', 'bar', 'cafe', 'cafeteria', 'servicios', 'consultorio'];
      const isBusinessType = businessKeywords.some(bk => faq.keywords.some(k => k.includes(bk)));
      if (isBusinessType) continue;
    }
    
    for (const keyword of faq.keywords) {
      if (normalizedQuery.includes(keyword) || keyword.includes(normalizedQuery)) {
        return faq.answer;
      }
    }
  }
  
  return null;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { message, history = [] } = body;
    
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'Mensaje requerido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if we're in a pricing context based on conversation history
    const inPricingContext = isPricingContext(history);
    
    // If in pricing context and user mentions a business type, give pricing
    if (inPricingContext) {
      const pricingAnswer = getPricingForBusiness(message);
      if (pricingAnswer) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            answer: pricingAnswer,
            source: 'local'
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Step 1: Try local FAQ match (FREE) - skip business types if in pricing context
    const localAnswer = findLocalMatch(message, inPricingContext);
    
    if (localAnswer) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          answer: localAnswer,
          source: 'local'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Step 2: No local match - use OpenAI with conversation history
    const apiKey = import.meta.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('Missing OPENAI_API_KEY');
      return new Response(
        JSON.stringify({ 
          success: true, 
          answer: 'Lo siento, no tengo una respuesta para eso ahora. Te recomiendo contactar a nuestro equipo en avoqado.io/contact o por WhatsApp para más información.',
          source: 'fallback'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build messages array with history for context
    const messages = [
      { role: 'system', content: AVOQADO_CONTEXT },
      ...history.slice(-6).map((msg: { role: string; content: string }) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 200,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({ 
          success: true, 
          answer: 'Disculpa, tuve un problema procesando tu pregunta. Intenta de nuevo o contáctanos directamente en avoqado.io/contact.',
          source: 'error'
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json();
    const aiAnswer = data.choices?.[0]?.message?.content || 'No pude generar una respuesta.';

    return new Response(
      JSON.stringify({ 
        success: true, 
        answer: aiAnswer,
        source: 'ai'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error interno del servidor' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
