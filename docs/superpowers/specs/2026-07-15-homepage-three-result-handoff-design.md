# Homepage three-result channel handoff design

**Date:** 2026-07-15
**Status:** Approved in conversation on 2026-07-15
**Scope:** Animated homepage opening channel handoff, its reduced-motion/no-JavaScript truth, and related acceptance tests

## Relationship to earlier specifications

This document supersedes only the single-reservation restrictions in
`2026-07-14-channels-measured-connector-design.md` and
`2026-07-15-homepage-copy-five-entry-handoff-design.md`: the reservation is no longer the
only animated example, and the handoff may now retarget the one measured route twice. The
existing measured-anchor architecture, five public entries, moving mosaic tiles, copy,
responsive geometry requirements, fallbacks, and later-scene boundaries remain in force.

## Goal

Make the final opening screen prove that several kinds of customer activity arrive in the
same Avoqado operation. Keep the five understandable entry rows visible, but use scroll to
demonstrate three representative outcomes:

1. `Reservación en línea → Reserva confirmada`
2. `Liga de pago → Pago recibido`
3. `Terminal de cobro → Cobro aprobado`

The sequence must remain brief. `Tienda en línea` and `Punto de venta` stay visible as
additional connected entries without receiving their own animated result beat.

This design also fixes the current collision between `Reserva confirmada` and the green
route origin. The point must occupy a dedicated connector gutter instead of overlapping
the row result.

## Existing problem

The five-entry handoff currently communicates more breadth in the ledger than it proves in
the destination card:

- the active state is statically attached to `Reservación en línea`;
- the source ref, route summary, and destination details are all fixed to the reservation;
- the connector starts half outside the row at the same edge where the result text ends;
- at the current desktop width, the point visually covers the end of
  `Reserva confirmada`;
- continued scrolling does not reveal anything about payment links or physical terminals.

The measured route itself remains the correct foundation. The new behavior extends it to a
small, deterministic sequence rather than replacing it with decorative lines.

## Alternatives considered

### A. Sequential spotlight with one reusable result card — selected

The green row highlight, measured source, connector, and result card move through three
scroll-controlled beats. The card crossfades its concise content while retaining a stable
position.

Advantages: the cause-and-effect relationship is explicit, the screen stays calm, and one
signature connector animation carries the story. It reuses the existing measured route
architecture and preserves room for the five-row ledger.

### B. Three result cards stacked beside the ledger

Advantages: all examples are visible at once. Disadvantages: the right panel becomes dense,
the mobile layout grows too tall, and the connector has three simultaneous destinations.

### C. Tabs or chips inside the result card

Advantages: compact and technically simple. Disadvantages: the visitor must infer which
ledger row produced the card, and noninteractive scroll-controlled tabs resemble controls
that cannot be clicked.

## Content

The card keeps the current editorial, receipt-like visual language. Each beat shows one
headline outcome and no more than three short supporting details.

| Beat | Header summary | Primary value | Supporting detail | Context |
| --- | --- | --- | --- | --- |
| Reservation | `Reservación en línea → Reserva confirmada` | `Facial hidratante` | `María G. · 11:30` | `Sucursal Centro` |
| Payment link | `Liga de pago → Pago recibido` | `$1,250` | `Liga enviada por WhatsApp` | `Pago con tarjeta` |
| Terminal | `Terminal de cobro → Cobro aprobado` | `$348` | `Pago sin contacto` | `Terminal física · Sucursal Centro` |

These are illustrative interface examples, not pricing or performance claims. The card does
not introduce unsupported provider logos or name a payment processor. The visible Spanish
labels remain customer language rather than internal product terminology.

## Visual layout

### Ledger

- Preserve the five existing rows, their order, thumbnails, labels, and results.
- Reserve an explicit connector gutter at the route side of every row.
- On side-by-side layouts, the result ends before that gutter and the source dot sits inside
  it, aligned to the row center.
- `Reserva confirmada` must remain fully readable with visible separation from the dot.
- On stacked mobile layouts, retain the left-side connector rail so the route does not cross
  the row copy.
- Only the current demonstration row receives the pale green background and green text.
  The other four rows remain legible and neutral.

### Result card

- Keep one black result card in a stable position and with a stable outer size.
- The header summary, primary value, supporting detail, context, and time/status change as a
  single content group.
- Card content must not reflow the ledger or cause the connector target to jump.
- A short fade plus at most `8px` of vertical translation may accompany content changes.

### Connector

- Keep exactly one measured SVG route, one active stroke, one source dot, one destination
  dot, and one primary pulse.
- The route always derives from the currently active row's real source anchor and the card's
  real destination anchor.
- When the active beat changes, the old connector fades, geometry is remeasured, and the new
  connector draws from the new row. Do not visibly morph a stale path between rows.
- The pulse and active stroke use the same measured geometry and progress.
- The connector never covers labels, result copy, or the card header.

## Scroll sequence

The existing video-to-mosaic and mosaic-to-ledger transitions remain perceptually
unchanged. The opening gains approximately one additional viewport of sticky scroll for the
three result beats.

1. The five mosaic tiles settle into the five ledger rows.
2. The reservation row becomes active. Its route draws and the reservation details appear.
3. Continued scroll moves the highlight to `Liga de pago`; the connector retargets and the
   card crossfades to the payment-link receipt.
4. Continued scroll moves the highlight to `Terminal de cobro`; the connector retargets and
   the card crossfades to the terminal approval.
5. The terminal result holds long enough to be read before the page continues into the next
   story section.

Each beat gets an arrival interval and a readable plateau. State is derived from scroll
progress, not timers, so the sequence does not advance while the visitor is stationary.
Reverse scrolling restores the preceding active row and card deterministically.

## Motion behavior

The moving connector is the single signature animation. Supporting movement stays quiet:

- row background and text color transition without a lateral jump;
- card content uses opacity and a small transform only;
- route appearance uses opacity and `pathLength`;
- the pulse docks at the target before the beat changes;
- there are no loops, autoplay timers, bouncing cards, or simultaneous traveling points.

The implementation should avoid animating layout properties. Geometry is measured after the
active source changes and before the replacement connector becomes visible.

## Architecture

Extend each demonstrable channel with card content rather than hard-coding reservation data
inside `ChannelHandoff`. A small ordered demonstration model owns:

- channel id;
- public label and result;
- card primary value;
- supporting detail;
- context;
- compact time/status text.

`ChannelHandoff` derives the active demonstration index from scroll progress. The row with
that id owns the single source ref and `data-channel-active="true"`. The existing destination
ref remains attached to the stable card shell.

Changing the active source requires route measurement to observe the new row as well as
container, ledger, card, font, resize, and transform changes. Connector rendering remains
hidden until the new source-to-target geometry is valid. The card and active row may update
immediately; the route must never use coordinates from the previous row.

The opening progress ranges and sticky height may be retuned, but the new detail sequence
must not shorten the video reveal, mosaic assembly, or five-tile handoff. `/demo` and the
seven later story scenes remain independent.

## Accessibility and fallbacks

- The visible ledger and card provide the primary text truth; SVG, anchors, and pulse remain
  `aria-hidden`.
- Exactly one row exposes the active state at a time in the animated version.
- The card content replacement is not announced as a rapid live region while scrolling.
- A screen-reader summary exposes the three example relationships in document order.
- Reduced-motion and no-JavaScript variants expose the same three concise examples as a
  static summary without a traveling point or automatic transitions.
- The section remains noninteractive and must not intercept the hero calls to action.

## Responsive behavior

Required viewports remain `1440×900`, `910×691`, `787×701`, `887×502`, `390×844`, and
`320×568`.

- Side-by-side layouts keep the ledger, route gutter, and card inside the visual panel.
- Stacked layouts use a vertical-then-horizontal route through the free margin.
- Compact-height layouts may tighten padding and type, but must retain all five row results
  and the active card's primary/supporting content.
- No active label, result, source dot, destination dot, pulse, path, or card content may
  overflow the viewport.

## Tests and acceptance criteria

The implementation is complete when automated checks demonstrate:

1. exactly five rows remain visible and exactly one is active at every result checkpoint;
2. reservation, payment-link, and terminal checkpoints activate in that order;
3. each checkpoint shows its approved header, primary value, supporting detail, and context;
4. `Reserva confirmada` and every other result bounding box remain separated from the source
   dot by at least `6px` on side-by-side viewports;
5. exactly one route and one primary pulse exist, and route endpoints stay within `3px` of
   the current source and stable target;
6. the pulse matches the active stroke endpoint and docks at the target;
7. reverse scrolling restores the correct preceding row, content, and valid route;
8. all six required viewports have no panel or document overflow;
9. reduced-motion and no-JavaScript modes expose all five entries and the three example
   outcomes statically;
10. the complete Playwright suite and production build pass.

## Non-goals

- Do not generate or replace mosaic images.
- Do not add a sixth operation entry.
- Do not give `Tienda en línea` or `Punto de venta` an animated result beat in this change.
- Do not add controls, autoplay, provider logos, or clickable tabs to the handoff.
- Do not change later story scene claims, navigation, chatbot behavior, GTM payloads, or
  `/demo`.
