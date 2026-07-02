# Avoqado Tour: cadena post-venta "cobrando se dispara todo" (inventario → factura → comisión → lealtad → reporte → IA)

> Spec ejecutable para avoqado-landing. Autor: /spec (Fable 5, 2026-07-02). **v2** — incorpora
> la ronda 1 de /codex review (8 P1 + 16 P2 resueltos abajo).
> Implementación prevista con Opus/Sonnet en sesión posterior. Rama base: `main`.
> Spec hermano previo: `docs/superpowers/specs/2026-06-10-avoqado-tour-demo-interactivo.md` (el tour existente).

## Pre-condición del baseline (LEER PRIMERO)

Este spec está escrito contra el **working tree del 2026-07-02**, que incluye cambios SIN
COMMITEAR en `AvoqadoTour.tsx` y `ChapterPanel.tsx` (el CTA ya fue cambiado a WhatsApp-only
vía `/wa`; `DEMO_DASHBOARD_URL` y el handoff J1 fueron ELIMINADOS). El implementador debe:

1. Verificar con `git diff src/components/interactive/tour/` que esos cambios siguen
   presentes (o ya commiteados). Si fueron descartados y el CTA volvió al handoff J1
   viejo, la sección "Panel/CTA" cambia: el primario WhatsApp habría que crearlo en vez
   de conservarlo.
2. No asumir nada del resto: `engine.ts`, `flows.ts`, `flows-web.ts`, `analytics.ts`,
   pantallas y CSS están SIN cambios respecto a `main`.

## Contexto

`/demo` (avoqado.io/demo) es la página de conversión de campañas. Hoy los flujos TPV del
AvoqadoTour (A "Pago rápido", B "Cobrar") terminan en el recibo y un CTA "Contactar a
ventas" (WhatsApp). El diferenciador de Avoqado — una venta dispara TODO el negocio
(inventario, facturación, comisiones, lealtad, reportes, IA) — nunca se demuestra. Un
visitante que compara contra una terminal básica no ve la diferencia.

Este spec extiende los flujos TPV con 2 capítulos nuevos que corren DENTRO del tour como
mock del dashboard (mismo escenario, crossfade del PAX a un browser frame), terminando en
un asistente IA con guion que cita exactamente la venta que el visitante hizo. El CTA
final conserva el primario de WhatsApp existente y RE-INTRODUCE el dashboard demo como
link secundario.

## Decisiones cerradas (con el fundador, 2026-07-01)

| # | Decisión | Resolución |
|---|---|---|
| D1 | ¿Dónde vive la cadena? | Mock dentro del tour del landing (NO extender el journey real del dashboard). Razones: infraestructura ya existente (BrowserFrame + steps-as-data + mock LigaList), la IA debe citar la venta exacta (solo guion lo garantiza), cero backend, single-repo. |
| D2 | Draft general | Aprobado. |
| D3 | Tiers | Badge "Premium" discreto en las escenas de Inventario y Facturación (features `INVENTORY_TRACKING` y `CFDI` son PREMIUM hoy). |
| D4 | Claim CFDI | Autofacturación desde el recibo: "Tu cliente se factura solo desde el QR del recibo — tú no capturas nada". NO decir "se timbra sola". |
| D5 | Entrega | Spec local (este archivo + archivo gstack). Sin issue de GitHub. |
| D6 | CTA final | WhatsApp primario + "dashboard demo" secundario (todos los flujos). El primario YA existe en el working tree (conservarlo con sus `src` actuales); el secundario se re-introduce con la URL J1 que fue eliminada. |
| — | ¿Dialog/modal para "ver todo"? | Rechazado: duplicaría el contenido de la cadena, un mock explorable libre es scope explosivo, y el layout stage+panel es la firma del tour. La cadena vive en el stage. |

## Estado actual (verificado 2026-07-02, working tree con cambios sin commitear)

Todo en `src/components/interactive/tour/` salvo indicación:

| Archivo | Rol hoy |
|---|---|
| `AvoqadoTour.tsx` | Isla principal. Monta UN frame según flujo (`isTpvFlow ? PaxPhotoFrame : BrowserFrame`), pasa `screensRef` al frame. **`handleCtaClick` YA redirige a WhatsApp**: `window.location.href = '/wa?src=<src>&text=<msj>'` con `src` = `demo_tour_tpv` (A y B), `demo_tour_reserva` (R), `demo_tour_liga` (L). `DEMO_DASHBOARD_URL` y el bloque J1 fueron eliminados; `lastPayment` (línea ~69) sigue seteándose vía `notifyPayment` pero ya no se usa. |
| `engine.ts` (450 líneas, sin cambios) | Spotlight engine. `TourStep { screen, target, pill, pos, ch, onTap, tapDelay, auto, final, onEnter }`. `screenEl()` busca `[data-screen]` dentro de `screensRef`. Click-rails: en pasos CON target, solo el target avanza y el resto hace shake (`shakePill`); en pasos auto/transición NO hay target y `handleTpvClick` ignora el click en silencio (`engine.ts:410`). Reset desde cualquier estado; timers en pool que se limpia en reset/switch. |
| `flows.ts` (299, sin cambios) | Steps A/B + `tpvReducer`. Montos demo: base $295.00, propina $53.10, total $348.10 (`DEMO_*`). Recibo `final: true` (línea 196). `tailSteps()` compartido. `notifyPayment` se dispara en el onEnter de success. `tour_complete` hoy se emite al ENTRAR al recibo (step final), ~2.5s después de success. |
| `flows-web.ts` (231, sin cambios) | Steps R y L + `webReducer`. |
| `ChapterPanel.tsx` | 3 capítulos por flujo (`n: 1\|2\|3` — tipo estrecho), selector de flujos, **CTA único `<button disabled={!done}>` con label "Contactar a ventas →"** en los 4 flujos (cambio sin commitear). |
| `PaxPhotoFrame.tsx` (56) / `BrowserFrame.tsx` (51) | Ambos reciben `screensRef` + `onTpvClick` + `children`; renderizan `div.screens` interno. Desktop bframe = canvas 700×500 (`tour-web.css:129-165`, con transform scale y márgenes negativos por breakpoint). PAX wrap ≈ 679px de alto en desktop (`tour.css:94`, responsive en `tour.css:1740-1825`). |
| `screens/` (sin cambios) | FastPaymentEntry, Cobrar (catálogo: Playera básica blanca $195.00, Gorra logo $100.00, Sudadera premium $450.00, Lentes de sol $250.00, Termo 600ml $320.00, Llavero metálico $80.00 — `Cobrar.tsx:24-31`), Review, Tip, MerchantSelection, Detecting, Processing, SuccessReceipt (recibo con "Nuevo Pago" `data-action="new-payment"`). |
| `screens-web/LigaList.tsx` (249, sin cambios) | Mock de dashboard con shell (`lg-shell`: sidebar venue "Estudio Lumina" + nav con subnav de Ventas + main + dialog overlay + toast). Referencia visual para las nuevas pantallas. |
| `analytics.ts` (34, sin cambios) | `trackTour()` → dataLayer GTM: tour_view, tour_start (1× por flujo por carga — `startedFlowsRef` no se limpia en reset, comportamiento intencional que se CONSERVA), tour_step (solo en taps exitosos), tour_complete, tour_cta_click, tour_flow_switch, tour_reset. |
| `src/pages/demo.astro` (sin cambios) | Página. H1 "Prueba Avoqado en 60 segundos". |
| `src/pages/wa.astro` (sin cambios) | Bridge de conversión: `/wa?src=<fuente>&text=<msj>` dispara `whatsapp_click` y redirige a wa.me. REGLA: todo CTA de WhatsApp pasa por aquí. |

**Sin cambios en otros repos:** avoqado-web-dashboard (journeys `venta-tpv`/`reserva`/`liga`
siguen existiendo y funcionando) y avoqado-server quedan intactos.

## Cambio propuesto — narrativa

Personajes fijos del demo (constantes): venue **Estudio Lumina**, empleada **Ana Torres**
(cobró la venta), empleado seed **Luis Mora**, clienta de lealtad **María G.**
(no usar "Sofía": es la persona del flujo Reserva).

Reglas de dinero del demo (una sola vez, para TODO el copy): la venta es **$295.00 de
subtotal + $53.10 de propina = $348.10 cobrados**. Comisión y puntos se calculan **sobre
el subtotal, SIN propina**, y las dos pantallas lo dicen en su regla visible:
comisión = 10% de $295.00 = **$29.50**; lealtad = 1 pt por cada $10 de compra (sin
propina) = **29 puntos**. El CFDI es por **$295.00** (la propina no se factura).

Tras el recibo (que deja de ser final y pasa a `auto: 2200`), el escenario hace
**crossfade del PAX → BrowserFrame desktop** (`dashboard.avoqado.io/venues/estudio-lumina`)
y corren los capítulos 4 y 5. El flujo A (sin productos) omite la escena de inventario y
su evento en cascada.

### Capítulos del panel (flujos A y B — de 3 a 5)

1. "Cobra en segundos" — "— monto directo o desde tu catálogo"
2. "Propina y calificación" — "— tu cliente opina en el momento"
3. "Aprobado al instante" — "— y reflejado en tu dashboard en vivo"
4. **"Todo se dispara solo" — "— inventario, factura, comisiones y puntos"** (nuevo)
5. **"Pregúntale a tu negocio" — "— tu IA responde con tus datos"** (nuevo)

### Escenas (pantallas `dash-*`, frame desktop)

Patrón de navegación: el target de cada escena es el elemento REAL que un usuario
tocaría — primero el evento de la cascada (causa→efecto), después los items del sidebar.

**`dash-live` — Transacciones + cascada (la escena clave).**
Header "Transacciones · Cada cobro, al segundo". Tabla con la venta del visitante
entrando con slide-in + highlight: `$348.10 · Tarjeta · Ana Torres · ahora` + badge
"Nueva"; 2 filas seed (`$1,250.00 · Efectivo · Luis Mora · 10:12`, `$890.00 · Tarjeta ·
Ana Torres · 09:48`). Panel derecho "Actividad de esta venta": eventos en cascada
escalonada (~450ms), cada uno con icono SVG (nunca emoji):

| Evento | data-t | Título | Detalle | Flujos |
|---|---|---|---|---|
| Inventario | `ev-inv` | "Inventario" | "Playera básica blanca −1 · Gorra logo −1" | solo B |
| Facturación | `ev-cfdi` | "Facturación" | "Autofactura lista en el recibo" | A y B |
| Comisiones | `ev-com` | "Comisiones" | "Ana Torres +$29.50" | A y B |
| Lealtad | `ev-loy` | "Lealtad" | "María G. +29 puntos" | A y B |

**`dash-inventory` (solo flujo B) — Inventario.** Badge "Premium" junto al header.
Tabla (los 6 productos del catálogo de Cobrar): columnas Producto / Vendidos hoy /
Stock / Estado. Playera básica blanca: stock anima 12→11, "Vendidos hoy 1"; Gorra logo:
8→7 + badge ámbar "Resurtir pronto"; resto estático (Sudadera 15, Lentes 9, Termo 12,
Llavero 30). Copy lateral: "Se descontó solo — sin capturar nada."

**`dash-cfdi` — Facturación.** Badge "Premium". Card izquierda: venta `B-1042 ·
$295.00 · Autofactura disponible` con QR mini y nota "El QR va en el recibo de tu
cliente". Card derecha (preview del portal del cliente): "Genera tu factura", input
RFC mock, botón "Generar CFDI 4.0", nota "Tu cliente captura su RFC una vez — el
CFDI llega solo a su correo". Desglose fiscal: `Subtotal $254.31 · IVA 16% $40.69 ·
Total $295.00` con nota "(la propina no se factura)".

**`dash-commission` — Equipo · Comisiones.** Card esquema: "Mostrador · 10% sobre
venta (sin propina)". Tabla: `Ana Torres · hoy +$29.50 · quincena $312.40 ·
[barra 78%] meta $400` ; `Luis Mora · hoy $0.00 · quincena $198.00 · [barra 49%]`.
Copy: "Cada venta suma a la comisión de quien cobró — sin Excel a fin de quincena."

**`dash-loyalty` — Clientes · Lealtad.** Card María G. (avatar iniciales "MG"):
"+29 puntos por esta compra" con regla visible "1 punto por cada $10 de compra (sin
propina)", total 220 pts, barra hacia recompensa "Sesión mini gratis · 250 pts" con
"Le faltan 30 pts". Copy: "Si tu cliente está en tu directorio, cada compra suma sola."

**`dash-report` — Reportes · Hoy.** Cards con contadores animados al entrar:
Ventas `13 → 14`, Total `$4,866.00 → $5,214.10` (delta = $348.10 exacto), Propinas
`$487.20 → $540.30` (delta = $53.10 exacto). Mini gráfica de barras por hora con datos
mock ESTÁTICOS y etiquetas fijas (9:00–14:00); la ÚLTIMA barra crece al entrar — no se
lee el reloj real (`Date`), el mock es determinista. Desglose métodos: Tarjeta 71% ·
Efectivo 29%. Copy: "Tu corte del día se arma solo — sin cerrar caja a mano."

**`dash-ai` — Asistente IA.** Chat del asistente. Mensaje de bienvenida: "Pregúntale lo
que sea a tu negocio — respondo con tus datos en vivo." Dos chips sugeridos (targets).
Al tocar un chip: burbuja del usuario + typing dots (~1.2s) + respuesta completa (fade,
sin efecto por-carácter). Estados de los chips: el chip 1 pasa a estilo "usado"
(atenuado) cuando `aiStage >= 1`; el chip 2 solo se renderiza como target cuando
`aiStage >= 2`. Clicks repetidos durante el typing: el engine ya los bloquea
(`busyRef` + `tapDelay`), no se necesita lógica extra. Bajo el chat, link
"Repetir demo" con `data-action="new-payment"` (reusa el rail de restart en done).

Copy IA EXACTO (constantes en `flows-chain.ts`):

| Pieza | Flujo | Texto |
|---|---|---|
| Chip 1 | A y B | "¿Qué vendí hoy?" |
| Respuesta 1 | B | "Hoy llevas 1 venta: $348.10 — 1 Playera básica blanca y 1 Gorra logo, cobrada por Ana con tarjeta ($295.00 + $53.10 de propina). María G. sumó 29 puntos y la autofactura ya está en su recibo." |
| Respuesta 1 | A | "Hoy llevas 1 venta: $348.10, cobrada por Ana con tarjeta ($295.00 + $53.10 de propina). María G. sumó 29 puntos y la autofactura ya está en su recibo." |
| Chip 2 | B | "¿Qué me toca resurtir?" |
| Respuesta 2 | B | "La Gorra logo bajó a 7 piezas — a tu ritmo de venta se agota en unas 2 semanas. ¿Te preparo la orden de compra al proveedor?" |
| Chip 2 | A | "¿Cómo van las comisiones?" |
| Respuesta 2 | A | "Ana Torres lleva $312.40 de comisión en la quincena — 78% de su meta. Hoy sumó $29.50 por la venta de $295.00 (la comisión no incluye propina)." |

### Steps nuevos (data — se anexan a A y B tras `tailSteps()`)

El recibo cambia de `{ screen:'receipt', final:true, ch:3 }` a `{ screen:'receipt',
auto:2200, ch:3 }`. Después, `chainSteps(flow)`:

```
Flujo B (10 steps):
 1 { screen:'dash-live',      frame:'desktop', auto:3000, ch:4,
     onEnter: saleIn@400ms → cascade 1..4 @1000,1450,1900,2350ms
              (reduced-motion: dispatch inmediato de saleIn + cascadeAll(4)) }
 2 { screen:'dash-live',      frame:'desktop', target:'[data-t="ev-inv"]',
     pill:'Mira: tu inventario se movió solo', pos:'left', ch:4 }
 3 { screen:'dash-inventory', frame:'desktop', target:'[data-t="nav-cfdi"]',
     pill:'Ahora, la factura', pos:'right', ch:4, onEnter: invCount }
 4 { screen:'dash-cfdi',      frame:'desktop', target:'[data-t="nav-equipo"]',
     pill:'Ve lo que ganó tu equipo', pos:'right', ch:4 }
 5 { screen:'dash-commission',frame:'desktop', target:'[data-t="nav-clientes"]',
     pill:'Y lo que ganó tu cliente', pos:'right', ch:4 }
 6 { screen:'dash-loyalty',   frame:'desktop', target:'[data-t="nav-reportes"]',
     pill:'Tu corte ya está listo', pos:'right', ch:4 }
 7 { screen:'dash-report',    frame:'desktop', target:'[data-t="nav-ia"]',
     pill:'Ahora pregúntale a tu negocio', pos:'right', ch:4, onEnter: reportCount }
 8 { screen:'dash-ai',        frame:'desktop', target:'[data-t="ai-q1"]',
     pill:'Pregúntale', pos:'top', ch:5,
     onTap: aiAsk1 + aiTypingOn → aiAnswer1@1300ms, tapDelay:1600 }
 9 { screen:'dash-ai',        frame:'desktop', target:'[data-t="ai-q2"]',
     pill:'Ahora algo más difícil', pos:'top', ch:5,
     onTap: aiAsk2 + aiTypingOn → aiAnswer2@1400ms, tapDelay:1700 }
10 { screen:'dash-ai',        frame:'desktop', final:true, ch:5 }

Flujo A: igual SIN el step 3; su step 2 es
   { target:'[data-t="ev-cfdi"]', pill:'Mira: tu factura quedó lista', pos:'left' }
   → va a dash-cfdi. Cascada de 3 eventos (cfdi/com/loy @1000,1450,1900; auto:2600).
Reduced-motion en steps 8-9: aiAnswerN se agenda a 150ms en vez de 1300/1400ms.
```

Presupuesto de tiempo añadido: ~35s (8 clicks + autos). Aceptado por el fundador; el
"60 segundos" del header es el gancho del cobro, no un contrato.

## Cambios técnicos por archivo

### 1. `engine.ts` — frame por step (~12 líneas)
- `TourStep` gana `frame?: 'desktop'` (unión estrecha; ausente = frame default del
  flujo). NO usar `string`.
- `UiState` y `TourEngineApi` exponen `frame: 'desktop' | undefined`. Fuente de verdad =
  el step activo: se fija en `goTo()` (`frame: step.frame`) y en `resetFlow()`
  (`frame: first?.frame` — con flujo vacío queda `undefined`). No duplicar en refs.
- `onEvent` de tipo `tap` agrega `stepName: string` (= `step.screen`).

### 2. `AvoqadoTour.tsx` — doble frame apilado + wrapper de screens + CTA
- `screensRef` SUBE a un wrapper nuevo: `<div className="frames" ref={screensRef}>…`
  `</div>`. `PaxPhotoFrame` y `BrowserFrame` **dejan de recibir `screensRef`** (prop
  eliminada de ambos; su `div.screens` interno queda como hook de CSS). `engine.screenEl`
  busca por descendencia — funciona igual, y `setScreenInstant` limpia pantallas de
  ambos frames.
- Flujos TPV montan DOS frames apilados: `PaxPhotoFrame` + `BrowserFrame
  variant="desktop" url="dashboard.avoqado.io/venues/estudio-lumina"`, cada uno en un
  `.frame-slot`; slot inactivo = `.is-hidden`. `const showDesktop = isTpvFlow &&
  engine.frame === 'desktop'`. R y L montan su único frame dentro del mismo wrapper.
- Ambos frames reciben `onTpvClick={engine.handleTpvClick}` (el oculto no recibe clicks
  por `pointer-events:none`).
- `notifyPayment` agrega `trackTour('tour_payment_done', { tour_flow })`. **Nota de
  medición:** se emite en el onEnter de success, ~2.5s ANTES del punto donde hoy se
  emite `tour_complete` (entrada al recibo); entre ambos no hay acción del usuario, así
  que el funnel es equivalente — documentado para no sorprender al comparar.
- `onReset` además de resetear reducers hace `setLastPayment(null)` (evita que el link
  secundario arrastre un pago de un intento anterior tras switch de flujo).
- Restaurar el bloque eliminado de la URL del dashboard (con su fallback, tal como
  existía):
  ```ts
  const DEMO_DASHBOARD_URL: string = (
    import.meta.env.PUBLIC_DEMO_DASHBOARD_URL || 'https://demo.dashboard.avoqado.io'
  ).replace(/\/$/, '');
  ```
  Si la env no está definida (solo vive en `.env.example`), el fallback hardcodeado
  garantiza que NUNCA se construya `undefined/?demoTour=…`.
- Handlers separados: `handlePrimaryCta` = el `handleCtaClick` actual del working tree
  (WhatsApp same-tab, srcs `demo_tour_tpv|reserva|liga`, textos actuales) + push
  `tour_cta_click { tour_cta:'whatsapp', tour_flow }` antes de navegar.
  `handleSecondaryCta` = la lógica J1 restaurada: A/B →
  `${DEMO_DASHBOARD_URL}/?demoTour=venta-tpv&amountCents=<round(amount*100)>&tipCents=
  <round(tip*100)>` con fallback `lastPayment ?? DEMO_BASE_AMOUNT/DEMO_TIP_AMOUNT`;
  R → `…/?demoTour=reserva`; L → `…/?demoTour=liga`; `window.open(_blank,
  noopener,noreferrer)` + push `tour_cta_click { tour_cta:'dashboard', tour_flow }`.
- TODOS los `trackTour` viven en `AvoqadoTour.tsx`; `ChapterPanel` es presentacional.

### 3. `flows-chain.ts` (NUEVO, ~190 líneas)
- `ChainState`: `{ saleRowIn: boolean; cascadeShown: 0|1|2|3|4; invCounted: boolean;
  reportCounted: boolean; aiStage: 0|1|2|3|4; aiTyping: boolean }` + `INITIAL_CHAIN_STATE`.
- `ChainAction` (payloads explícitos para que reduced-motion sea expresable):
  `{ type:'saleIn' } | { type:'cascade'; shown: 1|2|3|4 } | { type:'cascadeAll';
  total: 3|4 } | { type:'invCount' } | { type:'reportCount' } | { type:'aiAsk1' } |
  { type:'aiAnswer1' } | { type:'aiAsk2' } | { type:'aiAnswer2' } |
  { type:'aiTypingOn' } | { type:'reset' }` + `chainReducer` (switch puro; los
  `aiAnswerN` apagan `aiTyping`).
- Helper `reducedMotion()` = `typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches` — usado por los
  onEnter/onTap para elegir entre timers escalonados y dispatch inmediato.
- `chainSteps(flow: 'A' | 'B'): TourStep<StepCtx>[]` (tabla de arriba; timers via
  `ctx.setTimer` — el pool del engine ya limpia todo en reset/switch, incluidos resets
  a MITAD de cascada/contadores/typing).
- Constantes de copy IA por flujo + textos de cascada.
- `StepCtx` (en `flows.ts`) gana `chainDispatch: Dispatch<ChainAction>`; `buildCtx` lo
  inyecta; `onReset` despacha `{ type:'reset' }` al chain.

### 4. `screens-dash/` (NUEVO)
- `DashShell.tsx` — shell con **slots**, no config plana (la nav de LigaList tiene
  subnav anidada, footer, dialog y toast que una `NavItem[]` plana no reproduce):
  `{ nav: ReactNode; children: ReactNode }` renderizando `lg-shell`/`lg-side`
  (venue "Estudio Lumina") /`lg-main` con las MISMAS clases CSS actuales.
- `ChainNav.tsx` — la nav de las escenas de la cadena (compartida):
  Inicio / Ventas / Inventario (`data-t="nav-inv"`) / Facturación (`nav-cfdi`) /
  Equipo (`nav-equipo`) / Clientes (`nav-clientes`) / Reportes (`nav-reportes`) /
  Asistente IA (`nav-ia`) / Configuración. Prop: `active: string`.
- 7 pantallas presentacionales (<150 líneas c/u, cero estado propio; TODO llega por
  props desde `ChainState` + `engine.flow`):

| Pantalla | data-screen | Props |
|---|---|---|
| `DashLive` | `dash-live` | `{ saleRowIn: boolean; cascadeShown: number; flow: 'A'\|'B' }` (flow decide si se renderiza `ev-inv`) |
| `DashInventory` | `dash-inventory` | `{ counted: boolean }` |
| `DashCfdi` | `dash-cfdi` | `{}` (estática) |
| `DashCommission` | `dash-commission` | `{}` (estática) |
| `DashLoyalty` | `dash-loyalty` | `{}` (estática) |
| `DashReport` | `dash-report` | `{ counted: boolean }` |
| `DashAi` | `dash-ai` | `{ aiStage: number; aiTyping: boolean; flow: 'A'\|'B' }` |

- Badge Premium: componente local `PremiumBadge` (pill discreto junto al h1, tono
  neutro/ámbar OKLCH) usado en DashInventory y DashCfdi.

### 5. `LigaList.tsx` — refactor a `DashShell` (slots)
LigaList pasa su nav ACTUAL COMPLETA (con subnav de Ventas, iconos y footer) como el
slot `nav`, y su main/dialog/toast como `children`. Criterio de aceptación: **cero
cambio visual en el flujo L** (comparación manual de screenshots antes/después). Si el
markup del shell no se puede extraer sin tocar clases, ABORTAR el refactor y dejar que
`ChainNav`+`DashShell` dupliquen el patrón (aceptable; el criterio manda).

### 6. `tour-dash.css` (NUEVO)
Estilos de las 7 escenas sobre el canvas desktop 700×500 (mismos tokens/densidades que
`tour-liga.css`). Incluye animaciones de cascada, highlight de fila, countdown de stock,
contadores, typing dots.

**Crossfade y sizing del stack (diseño concreto, Fase 1):**
- `.frames { display: grid; justify-items: center; align-items: start; }` y
  `.frame-slot { grid-area: 1 / 1; }` — ambos frames ocupan la misma celda; la altura
  del stage = la del frame MÁS ALTO por breakpoint (estable durante todo el flujo, sin
  saltos por diseño).
- `.frame-slot.is-hidden { opacity: 0; visibility: hidden; pointer-events: none; }`
  con `transition: opacity 260ms ease, visibility 0s 260ms`. Secuenciación: el cambio
  de `engine.frame` y el `switchScreen` (230ms) arrancan en el mismo commit de React;
  como el slot oculto tiene `visibility:hidden`, la animación de la pantalla entrante
  no se ve hasta que el frame aparece — no hay dependencia de orden que especificar.
- Sizing interno de cada frame: NO SE TOCA. Los `scale()` + márgenes negativos del
  bframe viven en `.avq-tour .bframe-wrap.desktop .bframe` (NO en el wrap) — media
  queries en `tour-web.css:133-174` con cortes 1340/1180/880/760/560/430 — y son el
  mecanismo que hace que la altura efectiva del wrap siga a la altura VISUAL escalada.
  Se CONSERVAN tal cual (neutralizarlos rompería la compensación); lo mismo el scaling
  del PAX (`tour.css:1740-1825`). Cada `.frame-slot` es un contenedor de flujo normal,
  así que ambos mecanismos siguen funcionando dentro del stack sin overrides.
- Estabilidad de altura: el grid toma el max de ambos slots por breakpoint. En Fase 1
  se MIDE la altura de ambos frames en cada corte (1340/1180/880/760/560/430/375); si
  en algún corte el frame más bajo deja hueco visible molesto, se ajusta con
  `min-height` por breakpoint en `.frames` — decisión visual del gate de Fase 1, no
  automática.
- **Fase 1 se valida visualmente ANTES de construir escenas**: con una `dash-live`
  placeholder, verificar en los cortes 1340/1180/880/760/375 que (a) el swap no mueve
  el panel ni cambia la altura del stage, y (b) los flujos R y L se ven IDÉNTICOS a
  hoy dentro del wrapper `.frames` (su centrado hoy lo da `.stage`; el grid del
  wrapper lo reemplaza — verificar).
- `@media (prefers-reduced-motion: reduce)`: sin transición de crossfade (swap
  instantáneo), sin animaciones de cascada/contadores/stock/typing/highlight — TODO el
  CSS nuevo queda cubierto, no solo las animaciones "nombradas".

### 7. `ChapterPanel.tsx` — 5 capítulos + doble CTA
- Tipo `n: 1|2|3` → `n: number`. `TPV_CHAPTERS` pasa a 5 (copys arriba).
- CTA con render condicional (un `<a>` no soporta `disabled`):
  - `!done`: `<button type="button" className="cta-next" disabled>Contactar a
    ventas →</button>` (como el working tree hoy).
  - `done`: `<a className="cta-next ready cta-wa" href={waHref}>Contactar a
    ventas →</a>` + debajo el link secundario `<button type="button"
    className="cta-secondary" onClick={onSecondaryCta}>…</button>`.
  - El contenedor del CTA lleva `min-height` fija que cubre botón+link para que el
    panel no salte al completar (medir en implementación; misma altura en `!done`).
  - `waHref` la construye AvoqadoTour y la pasa por prop; el `<a>` además llama
    `onPrimaryCta` en onClick para el tracking y deja navegar el href.
- Labels secundarios por flujo: A/B "Explorar el dashboard demo →", R "Ver tu reserva
  en el dashboard demo →", L "Ver tu liga en el dashboard demo →".
- `FLOW_META.cta` → `{ secondary: string }` (el primario es fijo: "Contactar a
  ventas →").

### 8. `analytics.ts` + eventos
- `tour_step` gana `tour_step_name` — mapeo exacto: `onEvent` tap trae `stepName`
  (engine) → `trackTour('tour_step', { tour_flow, tour_step: e.stepIndex,
  tour_step_name: e.stepName })`. **Semántica sin cambios:** `tour_step` se emite SOLO
  en taps exitosos (pasos auto y final no lo emiten, igual que hoy).
- NUEVO `tour_payment_done` (ver §2, con su nota de timing).
- `tour_cta_click` gana `tour_cta: 'whatsapp' | 'dashboard'`.
- `startedFlowsRef` (tour_start 1× por flujo por carga) se CONSERVA tal cual.
- **Nota de medición para GA4/PostHog:** los índices de `tour_step` y el momento de
  `tour_complete` cambian para A/B — revisar funnels antes de comparar pre/post.

### 9. `demo.astro` — subheader (mantiene los 3 demos)
"Sigue el punto verde: cobra en la terminal y mira cómo una venta dispara todo tu
negocio, recibe una reserva o crea una liga de pago. Sin registro, sin tarjeta."
(H1 igual.)

## Criterios de aceptación (pass/fail)

1. Flujo B completo: 5 capítulos en el panel; tras el recibo el stage hace crossfade
   PAX→browser sin salto de layout ni movimiento del panel; la cascada muestra 4
   eventos escalonados; en pasos con target solo el target avanza (resto = shake); la
   IA cita "$348.10", "Playera básica blanca", "Gorra logo", "Ana" y "$53.10 de
   propina" textual.
2. Flujo A: cadena sin escena de inventario, cascada de 3 eventos, chip 2 de
   comisiones; la IA cita "$348.10" sin mencionar artículos.
3. `tour_payment_done` se emite en success de A y B; `tour_complete` al llegar al step
   final de `dash-ai`; todo `tour_step` (taps) lleva `tour_step_name`;
   `tour_cta_click` lleva `tour_cta`.
4. CTA primario en done = `<a href="/wa?src=demo_tour_<tpv|reserva|liga>&text=…">`
   (nunca wa.me directo; mismos src/text del working tree actual). Link secundario
   abre `${DEMO_DASHBOARD_URL}/?demoTour=…` (con fallback hardcodeado si la env
   falta — nunca `undefined/…`) en nueva pestaña; para A/B incluye
   `amountCents/tipCents` del pago simulado.
5. Reset (↺) y cambio de flujo funcionan desde CUALQUIER punto de la cadena —
   incluyendo A MITAD de la cascada, de los contadores del reporte y del typing de la
   IA: timers limpios, chain state inicial, `lastPayment` en null, frame de vuelta al
   PAX, sin pantallas fantasma.
6. Flujos R y L: cero regresión visual (screenshots antes/después del refactor
   DashShell) y funcional.
7. Responsive 880+/768/375px: sin overflow horizontal; la altura del stage no cambia
   al hacer el swap (max de ambos frames por diseño); en done el panel hace
   scroll-into-view como hoy.
8. `prefers-reduced-motion`: crossfade instantáneo; cascada, stock, contadores y
   respuestas de IA aparecen de inmediato (sin timers escalonados, typing ~150ms).
9. Cero emojis en UI (iconos SVG), tokens OKLCH existentes, textos en español; archivos
   TS/TSX <500 líneas (los CSS siguen la práctica del repo — `tour.css` tiene 1817).
10. `npm run build` verde; consola de `/demo` sin errores ni warnings del engine
    (`[avq-tour] target … not found` = selector roto = fallo).
11. "Nuevo Pago" del recibo durante la cadena es inofensivo: en el paso auto del recibo
    el click se ignora en silencio (así funciona el engine sin target); en pasos con
    target hace shake. En done, "Repetir demo" (`data-action="new-payment"`) y ↺
    reinician el flujo completo.
12. Badge "Premium" visible en dash-inventory y dash-cfdi; en ninguna otra escena.
13. `DashAi`: chip 1 queda atenuado tras usarse; chip 2 aparece como target solo en
    `aiStage >= 2`; clicks durante typing no rompen nada (rail del engine).

## Plan de QA (manual — el repo no tiene runner de tests)

Sin tests automatizados: agregar vitest solo para `chainReducer` es una decisión de
dependencia que el fundador no ha pedido — queda como follow-up opcional, NO parte de
este spec. Mitigación: el warning dev del engine ante selectores rotos (criterio 10) +
la matriz manual.

| Caso | Qué verificar |
|---|---|
| B completo | Criterios 1, 3-13 |
| A completo | Criterio 2 + cadena de 9 steps |
| Switch a mitad | En dash-cfdi cambiar a flujo R → mock reserva limpio; volver a B → arranca del keypad |
| Reset durante timers | ↺ a MITAD de: cascada (dash-live), contadores (dash-report), typing (dash-ai) → sin updates fantasma ni warnings |
| Reset en cada escena | 7 escenas × ↺ → estado inicial |
| Viewports | 375, 768, 880, 1280, 1440 |
| Reduced motion | macOS "Reduce motion" activado → criterio 8 |
| dataLayer | Consola: tour_view → tour_start → tour_step(+name) → tour_payment_done → tour_complete → tour_cta_click(+tour_cta) |
| Pinch-zoom | En iPhone REAL (Safari): zoom ~2x en /demo durante la cadena → sin scroll horizontal (regla CLAUDE.md; no es emulable en DevTools) |
| R/L regresión | Ambos flujos completos + screenshots del mock L antes/después |

Sugerido: correr `/qa` de gstack sobre el dev server al terminar.

## Plan de implementación sugerido (fases)

1. `engine.ts` frame + wrapper `.frames` en AvoqadoTour + CSS del stack/crossfade, con
   `dash-live` placeholder — **validar visualmente el swap en 3 breakpoints ANTES de
   seguir** (es el mayor riesgo de layout del spec).
2. `DashShell` (slots) + `ChainNav` + refactor `LigaList` — validar regresión L con
   screenshots.
3. `flows-chain.ts` + DashLive/DashInventory/DashCfdi (flujo B hasta step 4).
4. DashCommission/DashLoyalty/DashReport.
5. `DashAi` + steps 8-10 + variantes flujo A.
6. Panel 5 capítulos + doble CTA (render condicional) + restaurar DEMO_DASHBOARD_URL +
   analytics + demo.astro.
7. QA matrix completa + build.

## Esfuerzo estimado (CC = Claude Code Opus/Sonnet)

| Componente | CC |
|---|---|
| Fase 1 (engine + doble frame + CSS stack, validado) | ~1 h |
| Fase 2 (DashShell slots + refactor L) | ~30 min |
| Fases 3-5 (7 escenas + steps + copy) | ~3 h |
| tour-dash.css | ~1 h |
| Fase 6 (panel/CTA/analytics/copy) | ~45 min |
| Fase 7 (QA + fixes) | ~1 h |
| **Total** | **~7.5 h** (humano: ~3-4 días) |

## Rollback

Revert del commit — frontend puro, sin datos, sin API, sin cambios en otros repos.

## Fuera de alcance

- Cadena para flujos R y L (posible follow-up con escenas propias).
- Cualquier cambio en avoqado-web-dashboard o avoqado-server (journeys/sims intactos).
- LLM real o MCP en el demo (la IA es guion determinista).
- Cambios a la landing home u otras páginas (solo `/demo` + componentes del tour).
- Gating real de tiers; el badge Premium es informativo de marketing.
- Runner de tests (vitest) — follow-up opcional, ver Plan de QA.
- Limpiar `startedFlowsRef` en reset (comportamiento actual intencional).
- Sales deck / MCP sync: exentos (no cambia ninguna capacidad de plataforma).

## Referencias de archivos

| Archivo | Cambio |
|---|---|
| `src/components/interactive/tour/engine.ts` | +`frame?: 'desktop'` en TourStep/UiState/api; +`stepName` en onEvent tap |
| `src/components/interactive/tour/AvoqadoTour.tsx` | wrapper `.frames`; doble frame TPV; restaurar `DEMO_DASHBOARD_URL` con fallback; `handlePrimaryCta`/`handleSecondaryCta`; `tour_payment_done`; `lastPayment` null en reset |
| `src/components/interactive/tour/flows.ts` | recibo final→auto:2200; append `chainSteps`; `StepCtx.chainDispatch` |
| `src/components/interactive/tour/flows-chain.ts` | NUEVO: estado + reducer (payloads) + steps + copy + `reducedMotion()` |
| `src/components/interactive/tour/screens-dash/*.tsx` | NUEVO: DashShell (slots) + ChainNav + 7 escenas + PremiumBadge |
| `src/components/interactive/tour/screens-web/LigaList.tsx` | refactor a DashShell slots (cero cambio visual o se aborta) |
| `src/components/interactive/tour/tour-dash.css` | NUEVO: escenas + stack/crossfade con sizing por breakpoint + reduced-motion total |
| `src/components/interactive/tour/ChapterPanel.tsx` | `n: number`; 5 capítulos TPV; CTA condicional button/anchor + secundario; min-height |
| `src/components/interactive/tour/analytics.ts` | `tour_payment_done`; params `tour_step_name`/`tour_cta` |
| `src/components/interactive/tour/PaxPhotoFrame.tsx` / `BrowserFrame.tsx` | quitar prop `screensRef` |
| `src/pages/demo.astro` | subheader (menciona los 3 demos) |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` | Scope & strategy | 0 | — | — |
| Codex Review | `/codex review` | Independent 2nd opinion | 1 (3 rondas) | AUTHORIZED | 24 findings (8 P1 + 16 P2), 24/24 resueltos en v2 |
| Eng Review | `/plan-eng-review` | Architecture & tests (required) | 0 | — | — |
| Design Review | `/plan-design-review` | UI/UX gaps | 0 | — | — |
| DX Review | `/plan-devex-review` | Developer experience gaps | 0 | — | — |

**CODEX:** ronda 1 = 8 P1 + 16 P2 (baseline drift del CTA, matemática de comisión/lealtad, reduced-motion a nivel reducer, sizing del crossfade, anchor `disabled`, fallback de env, semántica de analytics, API de DashShell); v2 resolvió todo; ronda 2 dejó abierto el selector del crossfade; ronda 3 = `VERDICT: AUTHORIZED` (sesión codex `019f22f3-b9a1`, ~1.03M tokens en 3 rondas).

**VERDICT:** CODEX CLEARED (AUTHORIZED) — listo para implementar con Opus/Sonnet siguiendo las 7 fases. Eng review no corrido (opcional; el gate obligatorio del pipeline completo solo aplica vía /autoplan).

NO UNRESOLVED DECISIONS
