export const updateBriefTool = {
  type: 'function' as const,
  function: {
    name: 'updateBrief',
    description:
      'Llama esta función cada vez que el usuario te dé información que pertenezca a uno de los 7 campos del brief. Solo incluye los campos que aprendiste en este turno; no repitas lo ya capturado.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {
        projectType: {
          type: 'string',
          enum: ['web-app', 'mobile-app', 'dashboard', 'automation', 'ai-agent', 'integration', 'report', 'other'],
          description: 'Tipo principal del proyecto.',
        },
        projectTypeFreeText: {
          type: 'string',
          description: 'Solo si projectType === "other". Descripción libre del tipo.',
        },
        businessContext: {
          type: 'string',
          description: 'Industria, tamaño y problema que resuelve. 1-3 frases.',
        },
        coreFunctionality: {
          type: 'string',
          description: 'Qué tiene que hacer el sistema en una frase.',
        },
        integrations: {
          type: 'array',
          items: { type: 'string' },
          description: 'Sistemas con los que debe conectar. Array vacío si ninguna.',
        },
        designReference: {
          type: 'string',
          description: 'Estética deseada o URL de referencia. "no tengo referencia" es válido.',
        },
        urgency: {
          type: 'string',
          enum: ['hoy', 'esta-semana', 'este-mes', 'sin-prisa'],
        },
        contact: {
          type: 'object',
          additionalProperties: false,
          description:
            'Datos de contacto del cliente. Captura SIEMPRE el nombre y AL MENOS UNO entre email o whatsapp (cualquiera basta; ambos es mejor). Si el usuario te da solo un teléfono mexicano (10 dígitos, con o sin +52), guárdalo en whatsapp — nunca en email. Si te da algo que no es claramente un email, NO lo pongas en email.',
          properties: {
            name: { type: 'string', description: 'Nombre del cliente.' },
            email: {
              type: 'string',
              description:
                'Correo electrónico válido (debe contener @ y un dominio). Si el usuario no dio un email reconocible, OMITE este campo en vez de inventarlo.',
            },
            whatsapp: {
              type: 'string',
              description:
                'Número de WhatsApp (idealmente con código de país, p. ej. +52 55 1234 5678). Acepta también solo 10 dígitos sin prefijo.',
            },
          },
          required: ['name'],
        },
      },
    },
  },
};

export const finalizeBriefTool = {
  type: 'function' as const,
  function: {
    name: 'finalizeBrief',
    description:
      'Llama esta función SOLO cuando el usuario haya confirmado explícitamente que quiere enviar el brief a Avoqado. No llames esta función automáticamente — espera el "sí, mándalo" del usuario.',
    parameters: {
      type: 'object',
      additionalProperties: false,
      properties: {},
    },
  },
};

export const LABS_TOOLS = [updateBriefTool, finalizeBriefTool];
