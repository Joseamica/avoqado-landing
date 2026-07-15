# Homepage copy and five-entry handoff design

**Date:** 2026-07-15
**Status:** Approved on 2026-07-15
**Scope:** Homepage opening copy, channel handoff terminology, three new mosaic images, and the measured tile handoff count

## Goal

Make the homepage opening explain Avoqado in language a Mexican business owner understands immediately. Replace internal product terms such as “Consumer App” and “Booking Widget” with real ways a customer can enter an operation. Extend the measured mosaic handoff from four to five entries while preserving the causal structure and business claims of the rest of the scrollytelling story.

## Hero copy

The animated, reduced-motion, no-JavaScript, and `/scrollytelling` opening variants must use the same message.

### Eyebrow

`PARA TODO TIPO DE NEGOCIO`

### H1

`El primer sistema todo en uno en México para cobrar, administrar y hacer crecer tu negocio.`

Recommended desktop line treatment:

```text
El primer sistema todo en uno en México
para cobrar, administrar
y hacer crecer tu negocio.
```

Line wrapping may respond naturally at smaller widths; the words and reading order must not change.

### Support copy

`Pagos y terminales, punto de venta, tienda en línea, reservaciones, inventario, clientes, facturación, contabilidad y reportes — todo conectado en tiempo real.`

The support copy remains one paragraph and may occupy two or three visual lines depending on viewport width.

## Five operation entries

The public section must not expose internal English product names. It will show exactly five entries, in this order:

| Entry label | Result | Public id | Mosaic tile | Asset decision |
| --- | --- | --- | --- | --- |
| Reservación en línea | Reserva confirmada | `online-booking` | `tile-7` | Generate a new image |
| Tienda en línea | Pedido recibido | `online-store` | `tile-12` | Keep the existing shopping-bag illustration |
| Liga de pago | Pago recibido | `payment-link` | `tile-2` | Generate a new image |
| Punto de venta | Venta registrada | `point-of-sale` | `tile-15` | Generate a new image |
| Terminal de cobro | Cobro aprobado | `payment-terminal` | `tile-10` | Keep the existing physical-terminal photograph |

`Reservación en línea` remains the active example. The green route, point, event card, semantic summary, and analytics-independent story copy must say:

`Reservación en línea → Reserva confirmada`

The destination card continues using the existing fixture customer, service, time, and venue.

### Narrative consistency

The existing `STORY_FIXTURE.selectedChannel` value must change from `Booking Widget` to `Reservación en línea`. The service scene may continue consuming that fixture, so its source card uses the same understandable label as the handoff. This is a terminology change only; the service scene's sequence, appointment data, route behavior, and product claims remain unchanged.

## Section copy

### Eyebrow

`UNA SOLA OPERACIÓN`

### Heading

`Tu cliente reserva, compra o paga como prefiera.`

### Support

`Desde una reservación o liga de pago hasta el punto de venta o la terminal física: todo llega conectado a Avoqado.`

## Image generation

Generate three separate square raster assets with the built-in image-generation tool. Each image is a distinct asset, not a contact sheet.

### Shared art direction

- Use case: `photorealistic-natural`.
- Intended use: a large mosaic tile that also becomes a `48 × 40px` row thumbnail.
- Output composition: square, subject and device centered, readable at thumbnail size, safe crop on every side.
- Style: premium documentary commercial photography, authentic Mexican small-business setting, natural human interaction, warm daylight, realistic skin and material texture.
- Avoid: legible interface text, invented logos, watermarks, floating UI, excessive depth-of-field blur, staged stock-photo smiles, extra fingers, distorted hands, or a device hidden by the hand.
- The three images should feel related but use different business types so the mosaic reinforces “para todo tipo de negocio.”

### New asset 1 — online booking

A customer books a real appointment from a smartphone. A simple calendar and time-slot structure is visually recognizable on the screen without requiring readable words. The background suggests a salon, clinic, gym, or service business.

### New asset 2 — payment link

A customer opens a payment link received in a mobile conversation. The phone and the link/payment action are the visual focus; the business setting is visible but secondary. The screen must not reproduce WhatsApp branding or readable private messages.

### New asset 3 — point of sale

A staff member records a sale on a countertop tablet or POS screen while a customer is present. The composition must clearly read as sale registration, not as a handheld payment-terminal transaction.

Final project assets should be saved under `src/assets/hero/` using descriptive versioned filenames. Existing source files must not be overwritten until the selected outputs have been inspected.

## Interaction and layout

- Keep exactly 17 mosaic tiles.
- Increase selected moving tiles and shared overlays from four to five.
- Render exactly one active responsive source grid, as today.
- Measure all five source and target boxes; do not add hard-coded endpoints.
- The channel surface must remain hidden until all five geometries are ready.
- Preserve source → overlay → target opacity coordination, reverse restoration, docked reservation route, and synchronized reverse fade.
- Fit five rows without horizontal or vertical overflow at all six existing acceptance viewports, including `320 × 568`.
- Keep the section noninteractive (`pointer-events-none`) so it cannot block hero CTAs.

## Semantics and fallbacks

- Animated, reduced-motion, and no-JavaScript modes expose the same hero and five-entry truth.
- Exactly one visible H1 remains in every mode.
- The reduced/no-JavaScript list contains all five public labels and results.
- Video poster and pre-hydration failure behavior remain unchanged.
- `/demo` remains independent.

## Test changes

- Update H1 assertions to the new claim.
- Assert the eyebrow and expanded support copy in animated and static modes.
- Update shared-source, shared-target, overlay, channel-row, and geometry-ready counts from four to five.
- Preserve monotonic travel and `≤ 3px` endpoint assertions for every selected tile.
- Preserve reverse source opacity, connector transform remeasurement, CTA hit-testing/GTM, media failure, reduced-motion, no-JavaScript, and the six-viewport matrix.
- Assert that none of `Consumer App`, `Booking Widget`, or the standalone label `Online` appears in the public homepage opening or story narrative.
- Assert `Reservación en línea → Reserva confirmada` in the visible and semantic route summaries.
- Run the complete E2E suite and production build before completion.

## Non-goals

- Do not change the seven post-opening story scenes, except for replacing the selected-channel label consumed from `STORY_FIXTURE`; do not change their business claims or interaction behavior.
- Do not change the navbar, footer, chatbot, WhatsApp route, signup destinations, or GTM payloads.
- Do not replace the remaining twelve mosaic images.
- Do not add a sixth entry or an additional route animation.
- Do not change `/demo` or its tour components.

## Acceptance criteria

1. The opening starts with the approved eyebrow, H1, and support copy in every rendering mode.
2. The mosaic still contains 17 tiles.
3. Five selected tiles move continuously into the five understandable operation entries.
4. The reservation example alone connects to `Reserva confirmada`; route, point, and card stay synchronized forward and backward.
5. All five endpoint errors remain within `3px` and the six required viewports show no overflow or browser errors.
6. The three generated assets are visually distinct, understandable as thumbnails, and saved inside the project.
7. Full Playwright E2E and the production build pass.
