# Homepage `/`: scrollytelling de una operación completa

> Diseño aprobado por el fundador el 2026-07-10. Esta especificación aplica únicamente a
> la página principal `/`; `/demo` conserva su tour interactivo independiente.

## Objetivo

Convertir la homepage de una secuencia de demostraciones aisladas en una historia continua:
un cliente inicia una acción, Avoqado coordina la operación y el dueño termina entendiendo
todo el negocio —incluidas sus sucursales— y puede consultarlo desde una IA.

La promesa central es:

> **Un cliente hace una cosa. Avoqado mueve todo lo demás.**

La página debe lograr tres emociones, en este orden:

1. Posibilidad: “esto conecta mucho más de lo que pensaba”.
2. Alivio: “ya no tengo que operar diez sistemas separados”.
3. Confianza: “la plataforma entiende pagos, sucursales y México de verdad”.

## Problema de la homepage actual

`src/pages/index.astro` monta varios scrollytellings que reinician la narrativa:
`SquareHero`, `ChatbotCTA`, `SuiteShowcase`, `UnifiedPlatform`, `IndustryAccordion` y
`EarlyAccessCTA`. Cada pieza funciona por separado, pero el usuario tiene que deducir cómo
se conectan.

El rediseño no debe añadir otro bloque. Debe reemplazar esa suma por una sola causa que
permanece visible y se transforma durante todo el scroll.

## Audiencia y dirección visual

- Audiencia primaria: dueños y operadores mexicanos de retail y negocios de citas con una
  o varias sucursales. Son usuarios de negocio, no técnicos, y visitan frecuentemente desde
  móvil.
- Personalidad: moderna, premium y cercana.
- Dirección: fintech editorial, oscura y cinematográfica, con superficies neutrales teñidas
  de verde y acentos de producto usados únicamente para distinguir dominios.
- Tipografía: DM Sans; Playfair Display italic sólo como acento editorial excepcional.
- Firma visual: un pulso verde representa la acción original del cliente. El pulso recorre
  dispositivos y sistemas, se divide para mostrar efectos y vuelve a reunirse en la vista
  consolidada.
- Diferenciador memorable: la misma venta nunca desaparece; el visitante puede seguirla
  desde la reserva o compra hasta la respuesta de la IA.

## Principios de experiencia

1. **Una causa, muchos efectos.** Cada escena debe conservar una referencia visual al evento
   inicial.
2. **Mostrar producto, no enumerarlo.** Las capacidades aparecen dentro de mockups concretos,
   no como una cuadrícula de tarjetas con iconos.
3. **Complejidad progresiva.** Se empieza con la acción del cliente; la arquitectura completa
   sólo se revela después de que el visitante ya entiende el valor.
4. **Movimiento con significado.** Entrar, viajar, ramificarse, liquidarse y consolidarse son
   los únicos verbos de animación.
5. **Equilibrio.** Cada capítulo tiene una promesa principal. Las funciones secundarias viven
   como detalles de interfaz, no como escenas nuevas.
6. **Móvil es otra composición.** En móvil el recorrido es vertical y secuencial; no es una
   versión reducida del diagrama radial de escritorio.

## Arquitectura de la página

La nueva homepage queda así:

1. `Navbar` existente.
2. Una isla React `HomepageStory` hidratada con `client:load` que contiene hero, ocho escenas
   y CTA final.
3. `Footer` existente.
4. `FloatingChatbot` existente con `client:idle`.

Se eliminan de `/` —sin borrar sus archivos ni afectar otras rutas— los montajes actuales de:

- `SquareHero`
- `ChatbotCTA`
- `SuiteShowcase`
- `UnifiedPlatform`
- `IndustryAccordion`
- `EarlyAccessCTA`
- `FAQ` (la implementación actual es una flecha hacia el chatbot, no un FAQ semántico)
- el import no utilizado de `PaymentRouting`

La relevancia por industria que hoy aporta `IndustryAccordion` se incorpora en la primera
escena mediante ejemplos de tienda, gym, estética y clínica. El CTA final sustituye a
`EarlyAccessCTA`. El footer queda fuera del sticky narrativo para mantener navegación y
accesibilidad convencionales. El chatbot flotante permanece accesible, pero no sustituye ni
duplica la escena final de IA operativa.

## Modelo de scroll

`HomepageStory` es un contenedor continuo de aproximadamente `900vh` en móvil y `1000vh` en
desktop. Su escenario principal es `sticky`, debajo del navbar. Se usa:

```ts
useScroll({
  target: containerRef,
  offset: ['start start', 'end end'],
})
```

La línea de tiempo normalizada es:

| Rango | Escena |
|---|---|
| 0.00–0.11 | Hero: la acción inicial |
| 0.10–0.21 | Entradas omnicanal |
| 0.20–0.31 | Servicio y equipo |
| 0.30–0.43 | Cobro y cuenta de cobro |
| 0.42–0.53 | Recibo, Google y factura |
| 0.52–0.67 | Cascada operativa |
| 0.66–0.77 | Liquidación, banca y contabilidad |
| 0.76–0.89 | Organización, zonas y sucursales |
| 0.88–1.00 | Consulta por IA y CTA |

Los solapes son intencionales: producen crossfades breves y evitan cortes negros entre escenas.
Las animaciones continuas se implementan con `MotionValue` y `useTransform`; el estado React
sólo cambia al cruzar límites discretos y nunca en cada frame.

## Escenas y copy aprobado

### 0. Hero — Todo empieza con una acción

**Eyebrow:** `Toda tu operación, conectada`

**H1:** `Un cliente hace una cosa. Avoqado mueve todo lo demás.`

**Apoyo:** `Una reserva, una compra o un cobro se convierte en ventas, inventario, clientes,
finanzas y decisiones — sin volver a capturar nada.`

**Visual:** una escena real de negocio ocupa el fondo. Al iniciar el scroll, un punto verde
nace en el teléfono o mostrador y la imagen se abstrae gradualmente hasta convertirse en un
mapa de producto. Se reutilizan los assets reales de `src/assets/hero/`; no se añaden fotos de
stock.

**Acciones:**

- Primaria: `Agenda por WhatsApp` → `/wa?src=homepage_story_hero&text=...`
- Secundaria: `Comienza gratis` → `https://dashboard.avoqado.io/signup`

### 1. Entra por cualquier puerta

**Título:** `Tu cliente empieza como prefiera.`

**Apoyo:** `Reserva, compra o paga desde tu web, una liga, la app o directamente en sucursal.`

**Visual desktop:** cuatro entradas asimétricas convergen hacia un evento central:

- Consumer App → reserva o clase.
- Booking Widget → cita y depósito.
- Ecommerce / Checkout / liga o QR → compra o pago.
- Mostrador → venta presencial.

**Visual móvil:** las entradas aparecen como una secuencia vertical y alimentan el mismo
evento. El visitante nunca necesita interpretar líneas cruzadas.

### 2. Todo llega al mismo negocio

**Título:** `Tu equipo recibe el contexto completo.`

**Apoyo:** `Cliente, servicio, productos, colaborador y sucursal llegan juntos.`

**Visual:** el evento central abre una vista de agenda/pedido. Alrededor aparecen, como
superficies de trabajo y no como logos decorativos:

- POS iOS
- POS Android
- POS Desktop
- Windows Service como puente de un sistema existente

La TPV dedicada se reserva para la escena de cobro. Dashboard aparece más adelante como la
vista del dueño. Superadmin no aparece porque es el control plane interno de Avoqado.

### 3. El cobro toma la ruta elegida

**Título:** `Cobra por el canal correcto. Conserva el hilo del dinero.`

**Apoyo:** `TPV, ecommerce, liga o efectivo: Avoqado registra cómo ocurrió cada pago.`

**Visual principal:** una TPV compatible muestra el selector real `Cuenta de cobro`, con dos
merchants habilitados. El operador elige uno; el pulso viaja hacia ese merchant y el otro se
atenúa. En paralelo se ven las rutas online y efectivo, sin fingir que comparten el selector.

**Detalle secundario:** `Defaults por organización. Ajustes por sucursal o terminal.`

**Claim obligatorio:** `En terminales compatibles y previamente configuradas, el operador
puede elegir entre las cuentas de cobro habilitadas.`

### 4. El servicio termina. La relación continúa

**Título:** `La experiencia termina bien. El trabajo apenas empieza.`

**Visual:** el comprobante digital se transforma en tres resultados:

- recibo enviado;
- solicitud de reseña en Google;
- QR o liga para que el cliente genere su CFDI cuando la sucursal lo tiene configurado.

No se debe decir `se timbra sola`; el claim seguro es `tu cliente puede facturarse desde su
recibo`.

### 5. Una venta mueve todo el negocio

**Título:** `Una venta. Seis sistemas actualizados.`

**Visual:** el pulso entra a la venta del dashboard y dispara una cascada temporal:

1. `Venta registrada`.
2. `Inventario −1`; aparece `Reorden sugerido` o una orden de compra preparada.
3. `María +29 puntos`; se actualizan CRM, grupo, créditos o referidos.
4. `Comisión de Ana +$29.50`; se actualizan turno y meta.
5. `Reporte actualizado`.

Dentro de los paneles pueden aparecer, sin convertirse en escenas independientes:

- proveedores, transferencias e inventario serializado;
- descuentos, puntos, referidos, grupos y paquetes de crédito;
- turnos, asistencia, metas y comisiones.

### 6. Del cobro a los libros

**Título:** `El dinero no se pierde entre sistemas.`

**Visual:** el pago conserva su `merchant` mientras atraviesa:

`pago → costo → liquidación esperada → conciliación → saldo/movimientos → póliza`.

Un panel fiscal muestra CFDI, IVA, ISR y contabilidad como consecuencias del mismo pago. Si el
merchant tiene emisor fiscal configurado, se refleja esa asociación.

**Límite:** no prometer liquidación bancaria instantánea, garantizada ni instrucciones de
depósito desde Avoqado. La cuenta receptora es la contratada con el procesador.

### 7. Una sucursal o diez

**Título:** `Una sucursal o diez. Una sola operación.`

**Apoyo:** `Cambia de sucursal sin cerrar sesión y entiende la organización completa.`

**Animación firma:** la sucursal que ocupaba toda la pantalla se aleja. Primero aparecen sus
terminales y equipo; después otras sucursales; finalmente se revela:

`Organización → zonas → sucursales`.

La jerarquía se transforma en el dashboard web consolidado con:

- ingresos, pedidos, pagos y ticket promedio;
- ranking y comparación por sucursal;
- productos y desempeño por local;
- roles y permisos;
- defaults organizacionales con overrides por sucursal.

El selector web cambia `Sucursal Centro` por `Sucursal Norte` sin representar logout/login.

### 8. Pregúntale a tu negocio

**Título:** `Y si quieres saber cómo vas, sólo pregunta.`

**Visual:** una conversación corta conectada a Avoqado MCP:

**Pregunta:** `¿Qué sucursal bajó su ticket y qué debo reordenar?`

**Respuesta:** `Sucursal Norte bajó 8% esta semana. Crema facial está en 7 piezas y llegará a
stock crítico en 5 días. La venta y el reorden ya aparecen en tu operación.`

La respuesta se revela por bloques, no letra por letra. Debajo aparece la composición final:
todos los canales y dominios se pliegan dentro del isotipo de Avoqado.

**Cierre:** `Así se ve cuando todo tu negocio habla el mismo idioma.`

**CTA:**

- Primaria: `Quiero verlo en mi negocio` → WhatsApp mediante `/wa` con
  `src=homepage_story_final`.
- Secundaria: `Comienza gratis` → signup.

## Navegación y progreso

- Desktop: un rail vertical discreto con los labels `Inicio`, `Cobro`, `Operación`,
  `Sucursales`, `IA`. El rail indica progreso, pero no pretende ser navegación por tabs.
- Móvil: una línea de progreso horizontal de 1 px en la parte inferior del escenario sticky;
  no se muestran nueve labels.
- La barra usa `scaleX`/`scaleY`, nunca `width`/`height` animados.
- El usuario puede desplazarse en ambas direcciones; todas las escenas deben ser reversibles y
  deterministas.

## Arquitectura de componentes

```text
src/components/interactive/home-story/
├── HomepageStory.tsx            # scroll root, timeline y reduced-motion switch
├── story.ts                     # ids, rangos, copy y tipos compartidos
├── story-fixture.ts             # una venta, cliente, sucursal y cifras coherentes
├── StoryStage.tsx               # escenario sticky y crossfades
├── StoryProgress.tsx            # rail desktop / barra móvil
├── StoryPulse.tsx               # pulso persistente y trazo SVG
├── ReducedMotionStory.tsx       # versión estática semántica
└── scenes/
    ├── HeroScene.tsx
    ├── EntryScene.tsx
    ├── ServiceScene.tsx
    ├── PaymentScene.tsx
    ├── CustomerScene.tsx
    ├── OperationsScene.tsx
    ├── FinanceScene.tsx
    ├── OrganizationScene.tsx
    └── AiScene.tsx
```

Responsabilidades:

- `story.ts` no importa React. Exporta `STORY_SCENES`, rangos y tipos. Es la única fuente de
  verdad para orden, copy y progreso.
- `story-fixture.ts` exporta el escenario estable `Estudio Lumina`: María G., Ana Torres,
  subtotal `$295.00`, propina `$53.10`, total `$348.10`, 29 puntos y comisión `$29.50`. Ninguna
  escena vuelve a escribir estas cifras a mano.
- Cada escena recibe únicamente `progress: MotionValue<number>` y su rango normalizado. No lee
  `window.scrollY`.
- `StoryStage` monta todas las escenas para permitir crossfade, pero deshabilita pointer events
  en capas inactivas.
- Ningún archivo de escena debe superar 300 líneas; `HomepageStory.tsx` debe mantenerse por
  debajo de 220.
- Se reutilizan tokens de `global.css`, `lucide-react`, assets existentes y Framer Motion
  `12.23.26`. No se añade otra librería de animación.

Los mockups de `/demo` sirven como referencia y fuente de copy/estructura —en especial
`DashLive`, inventario, CFDI, bancos e IA—, pero la homepage no monta `AvoqadoTour`, su engine,
timers, spotlight ni sus hojas CSS scoped a `.avq-tour`. Las escenas de homepage son versiones
ligeras, pasivas y gobernadas exclusivamente por scroll. Esto mantiene `/demo` aislado y evita
que un refactor visual de marketing cambie su flujo interactivo.

## Responsive

### Desktop ≥ 1024 px

- Copy a la izquierda (aprox. 34%) y producto/diagrama a la derecha (66%).
- Composiciones asimétricas; el pulso puede moverse en X e Y.
- Máximo 12 nodos visibles al mismo tiempo.

### Tablet 768–1023 px

- Copy arriba a la izquierda y mockup centrado debajo.
- Jerarquías laterales se comprimen a tres sucursales representativas.

### Móvil < 768 px

- Copy en el tercio superior y visual en los dos tercios inferiores.
- El pulso viaja verticalmente.
- Se muestran como máximo cuatro efectos simultáneos en la cascada; los secundarios se resumen
  en `+ más automatizaciones`.
- Los CTAs tienen mínimo 44 px de alto y nunca quedan debajo de la UI del navegador.
- No se oculta ninguna promesa principal.

## Movimiento y rendimiento

- Una sola firma de movimiento: el pulso persistente.
- Entradas de escena: 450–650 ms con `ease-out-quint`.
- Estados y microinteracciones: 180–280 ms.
- Salidas: 75% de la duración de entrada.
- Sólo se animan `transform`, `opacity`, `pathLength` y colores cuando el coste sea aceptable.
- No se animan `width`, `height`, `top`, `left`, padding ni margin.
- Sin bounce, elastic, partículas, glow constante ni typing carácter por carácter.
- `will-change` sólo en pulso y dos superficies que se transforman durante una escena.
- Máximo aproximado: 40 `useTransform` activos por componente; las escenas deben encapsular sus
  propios transforms.
- Los assets below-the-fold cargan con `loading="lazy"`; el hero conserva sólo el asset crítico.
- Presupuestos: máximo 12 viewports de recorrido (hard cap 14), JavaScript inicial ≤ 120 KiB
  gzip, JavaScript total de homepage ≤ 160 KiB gzip y medio crítico inicial ≤ 1 MiB. El video
  actual `video4.webm` no se reproduce automáticamente en la nueva portada.

## Reduced motion y accesibilidad

Si `useReducedMotion()` devuelve `true`, no se monta el sticky de `900–1000vh`. Se renderiza
`ReducedMotionStory`: nueve secciones estáticas, compactas y en orden causal.

- Ninguna información depende exclusivamente del movimiento o color.
- Los headings conservan jerarquía H1 → H2.
- El escenario animado evita tab stops en escenas inactivas.
- CTAs y links conservan focus visible.
- Contraste mínimo WCAG AA.
- Los mockups decorativos usan `aria-hidden="true"`; el contenido equivalente existe en copy
  semántico.
- El scroll no se bloquea y no se altera `body.style.overflow`.

## SEO y contenido renderizado

La isla React se renderiza del lado del servidor a través de Astro; no usa `client:only`. H1,
headings, párrafos y CTAs deben existir en el HTML inicial. El title y description actuales se
mantienen salvo una mejora menor para incorporar `varias sucursales` si la auditoría final lo
justifica.

La versión reduced-motion usa el mismo arreglo de copy. Para navegadores sin JavaScript se
incluye una versión semántica dentro de `noscript`, también alimentada por el mismo fixture; la
página no puede depender de la hidratación para explicar qué hace Avoqado.

## Analítica

- CTA hero: `demo_request`, `location: homepage_story_hero`.
- CTA final: `demo_request`, `location: homepage_story_final`.
- Signup conserva `trackGetStarted` con locations diferenciadas.
- Se registra una sola vez `homepage_story_complete` al cruzar 0.90; no se registra cada paso de
  scroll para evitar ruido.
- Todos los CTAs de WhatsApp pasan por `/wa`.

## Integración con la navegación y loaders actuales

- Se define `--site-header-height` como fuente única para el banner de founders + navbar y para
  el `top`/alto del sticky. No se hardcodea `top-16` en la nueva historia.
- Al retirar `SquareHero`, también se retiran de `index.astro` las tres variantes experimentales
  de loading y su listener `avoqado-ready`; no se conserva markup muerto ni un timeout de seis
  segundos.
- La página incorpora `<main data-scrollytelling>` alrededor de la historia.

## Claims y límites obligatorios

1. El routing es **selección manual de merchant** en la TPV dedicada compatible; no es routing
   automático por IA, BIN, monto o comisión.
2. `Cuenta de cobro` no significa que Avoqado elija una cuenta bancaria arbitraria en cada pago.
3. El cambio multi-sucursal sin logout y la vista consolidada se muestran como experiencia del
   dashboard web, no como comportamiento idéntico de todos los POS.
4. La facturación puede resolverse según el merchant/emisor configurado, pero no se promete
   contabilidad multi-RFC completa.
5. Liquidación se presenta como estimada/conciliada, nunca instantánea o garantizada.
6. Avoqado no promete que todas las automatizaciones estén incluidas en todos los tiers. En los
   mockups, Inventario y CFDI llevan un badge `Premium` discreto porque actualmente son features
   PREMIUM.

## Fuera de alcance

- Cambios a `/demo`.
- Cambios al backend, POS, TPV, dashboard o MCP.
- Hacer funcionales los mockups como demo interactivo.
- Routing automático o rediseño de configuración de merchants.
- Crear nuevas fotografías, videos o ilustraciones generadas.
- Rediseñar Navbar, Footer o FloatingChatbot más allá de ajustes de transición/contraste.
- Mostrar Superadmin, planes o tablas comparativas dentro del scrollytelling.

## Hallazgos de ingeniería separados

La investigación detectó dos temas de seguridad en `avoqado-server` que no forman parte de esta
implementación, pero deben convertirse en trabajo independiente:

1. `GET /api/v1/tpv/terminals/:serialNumber/config` no exige autenticación y puede devolver
   configuración sensible, incluido PIN AngelPay descifrado.
2. El registro de pago valida existencia/estado del `merchantAccountId`, pero no valida de forma
   completa que esté asignado a la terminal y sucursal que reportan el pago.

Estos hallazgos no deben resolverse dentro del landing ni mezclarse en el mismo commit.

## Criterios de aceptación

1. `/` presenta una historia causal continua desde el hero hasta el CTA de IA.
2. La venta o acción inicial permanece reconocible durante todas las escenas.
3. Los nueve capítulos y el copy aprobado aparecen en desktop y móvil.
4. Multi-sucursal tiene una escena principal propia.
5. Multi-merchant aparece como beat dentro del cobro y respeta todos los límites de claim.
6. Los frontends externos relevantes aparecen por propósito; Superadmin no se comercializa.
7. Reduced motion elimina el sticky largo y conserva contenido/CTAs.
8. No hay errores de consola, hydration warnings ni saltos horizontales a 390, 768, 1024 y
   1440 px.
9. Navbar, Footer y FloatingChatbot siguen funcionando.
10. `npm run build` termina correctamente.
11. La página mantiene enlaces WhatsApp/signup y eventos GTM existentes o equivalentes.
12. El comportamiento se verifica en Chromium con scroll hacia abajo y arriba.
