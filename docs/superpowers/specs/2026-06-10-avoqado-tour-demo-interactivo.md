# Avoqado Tour — Demo interactivo guiado (spec v1)

> Proyecto: demo tipo Square (squareup.com/.../mobile-pos-demo) pero MEJOR: las superficies
> simuladas escriben datos REALES en un venue demo, y el visitante ve su cobro/reserva
> aterrizar EN VIVO en el dashboard real. Casa propuesta: `avoqado.io/demo` (este repo,
> isla React dentro de Astro).

## 1. La mecánica (observada en vivo en el demo de Square)

- **Marco de dispositivo** (teléfono) con pantallas del producto real — una *máquina de
  estados de pantallas*, no la app corriendo.
- **Pill + punto pulsante** anclado al ÚNICO elemento clickeable. Click → la pantalla
  transiciona y la pill se mueve al siguiente target.
- **Rieles estrictos**: click fuera del target = no pasa nada (verificado).
- **Panel lateral de capítulos** (3 pasos numerados, el activo marcado) con copy de VALOR,
  no de instrucción ("Enter orders instantly — *no footsteps necessary*").
- Botón **↺ reset** en el marco. Demos por vertical (FSR/QSR).
- Todo client-side → su demo MUERE en el pago. **El nuestro no** (ver §3).

## 2. Fidelidad al TPV real (obligatorio — pedido del founder)

Réplica web pixel-faithful del UI de `avoqado-tpv` (mapa completo del scout, 2026-06-10):

### Design tokens (extraídos del Compose theme)
| Token | Valor |
|---|---|
| Primary (verde Avoqado) | `#10B981` (light `#34D399`, pressed `#059669`) |
| Background | `#1C1C1C` · Surface `#2A2A2A` |
| Texto | `#FAFAFA` · secundario `#B5B5B5` |
| Error `#EB5757` · Warning `#FBBF24` · Outline `#383838` |
| Tipografía | **DM Sans** (Google Fonts) — display 57, headline 24-28 SemiBold, body 14 |
| Botones | radius **12dp**, altura 48-52dp, filled verde / outline gris |
| Canvas | PAX A910S portrait **720×1280** (marco de terminal con bordes PAX) |

### Componentes a replicar (React)
`AvoqadoTopBar` (título + subtítulo paso + back) · `CustomKeyboard` (0-9, punto, C, ◄, ✓ verde)
· cards de propina (3 presets + personalizado) · segmented buttons (Tarjeta|Efectivo|Cripto;
Imprimir|Email|WhatsApp) · estrellas de calificación · spinner de procesamiento ·
**animación Aprobado**: círculo que se dibuja (~600ms) + check con bounce + confetti 50
partículas ~2.5s · recibo estilo ticket con QR 180×180 y divisor punteado.

## 3. El diferenciador: datos reales, dashboard vivo

El TPV del demo es simulado, pero al completar el pago hace POST real al **venue demo de
la sesión del visitante** (infra `liveDemo` existente: venue efímero, expira 5h, cleanup).
El Acto 2 muestra el **dashboard real** (iframe con el auto-login de liveDemo) donde el
pago aparece **en tiempo real** (Socket.IO ya empuja pagos). Square enseña screenshots;
nosotros enseñamos el sistema nervioso conectado.

Backend nuevo (chico): endpoints `demo-sim` token-scoped a la sesión liveDemo:
- `POST /live-demo/sim/fast-payment` → registra el pago (reusa el flujo de
  `/mobile/venues/:id/fast`) en MI venue demo.
- (Acto 3 no necesita endpoint: el widget real `<avoqado-booking>` apunta al slug del
  venue demo — los venues demo bypasean el plan-gate público por diseño.)

### Contrato de handoff tour → dashboard (✅ implementado, lado landing)

El CTA final del tour ("Siguiente: míralo en TU dashboard →") abre en **nueva pestaña**
(`window.open(..., '_blank', 'noopener,noreferrer')`) la jornada del dashboard demo:

```
${PUBLIC_DEMO_DASHBOARD_URL}/?demoTour=venta-tpv&amountCents=<int>&tipCents=<int>
```

- `demoTour=venta-tpv` — id de la jornada J1 (driver tour del dashboard, F2).
- `amountCents` / `tipCents` — el último pago simulado del tour **en centavos**
  (`Math.round(pesos * 100)`); defaults `29500` / `5310` si no hubiera `PaymentInfo`.
- `PUBLIC_DEMO_DASHBOARD_URL` — env del landing (Astro, expuesta al cliente), default
  `https://demo.dashboard.avoqado.io`. Declarada en `.env.example`.

F2 consume estos params en el dashboard: tras el auto-login liveDemo, dispara el driver
tour `venta-tpv` y usa los montos para señalar "ahí está TU cobro".

## 4. Motor "spotlight" (≈150-200 líneas, sin librerías)

- Overlay absoluto sobre el marco del dispositivo con `pointer-events: all` EXCEPTO un
  recorte sobre el target (`clip-path` o 4 rects), igual que driver.js pero mínimo.
- **Punto pulsante** (verde `#34D399`, animación ping) + pill con el copy de acción
  anclada al target.
- Script de pasos: `{ screen, target, pill, panelStep, advanceTo }[]` — datos, no código.
- Click en target → transición de pantalla (slide/fade 200ms) + avanza script.
- Click fuera → nada (opcional: shake sutil de la pill para reorientar).
- ↺ reset al paso 1. Teclado del demo: cada tecla del keypad ES un target en los pasos
  de monto (secuencia guiada: "2" → "5" → "0" → "✓" — se siente real).

## 5. Guión Acto 1A — Pago Rápido (flujo fiel al TPV)

Panel de capítulos: ① Cobra en segundos · ② Propina y calificación · ③ Aprobado → míralo
en tu dashboard.

| # | Pantalla (réplica) | Pill/target | Al click |
|---|---|---|---|
| 1 | `FastPaymentEntry` — "Ingresa el monto del pago", $0.00 + keypad | "Marca $250" → secuencia teclas 2,5,0 | El monto va creciendo $2 → $25 → $250 |
| 2 | ídem | "Confirma" → tecla ✓ verde | → ReviewScreen |
| 3 | `Review` — "Calificación", 5 estrellas, "Saltar" | "El cliente te califica" → 5ª estrella | auto-avanza (fiel al TPV) → TipScreen |
| 4 | `Tip` — "Propina", cards 15/18/20% + "Sin propina" | "Elige 18%" → card 18% | header actualiza total $295 |
| 5 | ídem | "Continuar" | → MerchantSelection |
| 6 | `MerchantSelection` — "Seleccionar Cuenta", total $295, Tarjeta\|Efectivo\|Cripto | "Cobra con tarjeta" → Tarjeta | → DetectingCard |
| 7 | `DetectingCard` — "Acerca o inserta la tarjeta" + icono contactless | "Acerca la tarjeta" → animación de tarjeta entrando (auto, 1.5s) | → Processing (spinner "Procesando pago…" 1.2s, auto) |
| 8 | `Success` — círculo+check+confetti "Aprobado $295.00" → recibo ticket con QR, "Total pagado / Monto / Propina", Imprimir\|Email\|WhatsApp | **AQUÍ dispara el POST real** | CTA del tour: "Ahora ve a TU dashboard →" (transición al Acto 2) |

## 6. Guión Acto 1B — "Cobro" (orden/mesa) — fiel al segundo flujo del TPV

| # | Pantalla | Target | Al click |
|---|---|---|---|
| 1 | `OrderingWelcome/OrderList` — grid de mesas/órdenes | "Abre la Mesa 4" → card de orden | → Checkout |
| 2 | `Checkout` — "Orden #1234", items, Subtotal/Total, opciones "Pagar todo / Dividir…" | "Cobra la cuenta completa" → "Cobrar" | → cola de pago compartida (Review→Tip→…→Success, pasos 3-8 del 1A) |

(El selector de demo permite elegir flujo: "Pago rápido" | "Cobrar una mesa" — como Square
hace FSR/QSR.)

## 7. JORNADAS v1 (decisión founder 2026-06-10: retail y servicios primero)

La unidad del demo no es "un acto por producto" sino una **jornada cross-superficie** que
siempre termina mostrando la consecuencia REAL en otra superficie (lo que Square no hace).

### Dashboard real como ACTOR guiado (insight clave de complejidad)
El dashboard YA trae motor de tours (`driver.js` + atributos `data-tour` obligatorios por
regla del repo en cada CTA/wizard). Guiar el dashboard real = escribir GUIONES de tour
nuevos + dispararlos con query param (`?demoTour=<jornada>`) tras el auto-login liveDemo.
NO se construye motor nuevo para el dashboard; el spotlight custom (§4) es solo para las
réplicas (TPV) y superficies embebidas.

### J1 — 🛍️ Retail: "Cobra en mostrador" (TPV → dashboard)
El visitante elige el flujo del TPV (los DOS de fábrica, fieles al producto):
- **Pago rápido** (guión §5): monto directo $295.
- **Cobro** (guión §6 versión retail): grid de ventas abiertas ("Venta #1234" con
  productos de tienda: playeras, gorras) → checkout con items/total → "Cobrar" → misma
  cola de pago (calificación → propina → tarjeta → Aprobado).
Ambos → POST real → "ahora ve a TU dashboard" → dashboard real (`?demoTour=venta-tpv`)
→ driver tour: Ventas → Resumen → "ahí está tu cobro" (llegó por Socket.IO, en vivo).

### J2 — 💳 Retail: "Cobra a distancia" (dashboard → checkout → dashboard)
Dashboard real con tour `?demoTour=liga-de-pago`: Ventas → Ligas de Pago → Nueva liga →
monto $450 → crear (LIGA REAL con shortCode real en el venue demo) → el tour entrega la
liga → "así la ve tu cliente": **checkout real** (avoqado-checkout) renderizando esa liga
→ paso final de pago SIMULADO (endpoint sim-pay para venues demo; jamás tarjeta real —
prod corre Stripe live) → vuelta al dashboard: el pago de la liga aparece.

### J3 — 💆 Servicios: "Recibe reservas 24/7" (widget → dashboard)
Widget real `<avoqado-booking>` (marco "la página de tu negocio") contra el venue demo de
servicios: elegir servicio → horario → reservar (REAL, sin depósito) → dashboard real con
tour `?demoTour=reserva`: el calendario con TU cita.

### Restaurante = v2. El flujo "cobro" SÍ va en v1 (versión retail, J1); solo el sabor
restaurante (mesas, comensales, cursos) se difiere — el guión §6 se re-tematiza entonces.

### Seeder por vertical
`liveDemo` necesita param de vertical: venue **retail** = tienda GENÉRICA con productos
normales (ej. boutique: playeras, gorras, accesorios) — ⚠️ **SIN serialized inventory**
(SIMs/IMEI es del white-label PlayTelecom, NO aparece en el demo; el TPV se muestra tal
cual es de fábrica: pago rápido y cobro estándar) — y venue **servicios** (catálogo de
servicios + agenda, ej. estética/gym). El visitante elige vertical al entrar (como Square
elige FSR/QSR).

## 8. Fases (re-ordenadas a las jornadas v1)

1. **F1 ✅ (2026-06-11)** Motor spotlight + réplica TPV pago-rápido completa (client-side)
   — el corazón. Código: `src/components/interactive/tour/` — `AvoqadoTour.tsx` (isla
   raíz, props públicas `onPaymentComplete?: (info: PaymentInfo) => void`), `engine.ts`
   (motor spotlight), `flows.ts` (guiones A/B + estado TPV), `ChapterPanel.tsx`,
   `TerminalFrame.tsx`, `screens/`, `tour.css`; página `src/pages/demo.astro`. Incluye
   los DOS flujos (Pago rápido + Cobrar) y el CTA final ya abre la jornada del dashboard
   con el contrato de §3 (`?demoTour=venta-tpv&amountCents&tipCents`, nueva pestaña,
   `PUBLIC_DEMO_DASHBOARD_URL`).
2. **F2** Sesión liveDemo desde el tour + endpoint sim fast-payment + **J1 completa**
   (incl. driver tour `venta-tpv` en el dashboard — consume el contrato de handoff de §3 —
   + seeder retail).
3. **F3** **J2**: driver tour `liga-de-pago` + checkout embebido + endpoint sim-pay liga.
4. **F4** **J3**: seeder servicios + widget + driver tour `reserva`.
5. **F5** QA browser + `impeccable` + analítica de abandono por paso + CTA → /setup.

## 9. Decisiones tomadas / abiertas

- ✅ Casa: `avoqado.io/demo` (landing). ✅ Dashboard real guiado con su propio driver.js.
- ✅ Fidelidad: tokens/typografía/animaciones del TPV real (§2).
- ✅ **v1 = RETAIL y SERVICIOS** (restaurante v2). Jornadas J1-J3.
- ✅ Pagos del demo SIEMPRE simulados en el último paso (venues demo, jamás tarjeta real).
- ⬜ Idioma: ES primero (el TPV es ES); ¿EN después?
- ⬜ ¿Gate de email antes del demo (lead capture) o demo libre + CTA al final? (Square: libre.)
