# Homepage motion profiles and scroll performance

**Date:** 2026-07-16

**Status:** Approved for planning

**Scope:** `/` only. `/legacy` remains unchanged.

## Context

The production homepage currently has two coupled problems:

1. `HomepageStory` replaces the scrollytelling with a linear static experience whenever
   `prefers-reduced-motion: reduce` matches. The project previews were normally opened
   with `?motion=full`, so this behavior was not visible during design review.
2. The full-motion opening repeatedly measures DOM geometry while scroll progress
   changes. In production this creates forced layout work and visible pauses.

Production measurements on `https://avoqado.io/?motion=full` found:

- roughly 1,470 `getBoundingClientRect()` calls per second during the opening;
- scroll pauses between 200 ms and 425 ms;
- a 3.7 s observed LCP, of which about 3.6 s was render delay;
- approximately 1.6 MB of avoidable image transfer in the initial trace;
- a 5.2 MB, 1280×720, 30 fps VP9 opening video that still contains an unused audio
  stream;
- analytics and advertising scripts starting while the opening is hydrating.

When opening geometry was cached experimentally, the largest measured frame interval
fell to 9.4 ms and no interval exceeded 20 ms. This confirms that continuous geometry
measurement is the primary scroll-stall cause. Media and third-party loading are
secondary contributors to slow startup.

## Goals

- Every visitor receives the same complete narrative in the same causal order.
- Motion preference changes animation intensity, not story content.
- The full-motion experience remains visually equivalent to the approved homepage.
- Scroll remains responsive with a mouse, trackpad, keyboard, touch, slow wheel input,
  fast wheel input, and reverse scrolling.
- Reduced-motion and data-saving experiences remain intentional rather than appearing
  to be a broken or unrelated landing page.
- Production performance is measured before and after deployment.

## Non-goals

- Do not redesign the narrative, copy, scene order, or calls to action.
- Do not change `/legacy`.
- Do not infer device quality from RAM or a device model.
- Do not silently remove story chapters on slower devices.
- Do not replace Framer Motion or rebuild the entire homepage animation engine.

## Experience model

The homepage will distinguish story structure from motion intensity.

### Full motion

Used when the visitor has not requested reduced motion, or when `?motion=full` is
present.

- Preserve the opening video, mosaic, channel handoff, seven narrative scenes, and
  illustrated closing.
- Preserve scroll-controlled timing and reversible transitions.
- Use cached geometry and compositor-friendly transforms.
- Never measure route or tile geometry continuously as scroll progresses.

### Reduced motion

Used when `prefers-reduced-motion: reduce` matches, or when `?motion=reduced` is
present.

- Present the same opening concepts and all seven narrative scenes in the same order.
- Reveal one self-contained chapter at a time through normal page scrolling.
- Avoid autoplay video, travelling pulses, animated routes, parallax, scaling, and
  scrubbed transforms.
- Use the video poster and static evidence panels.
- Do not dump the entire platform explanation into one initial viewport.

Reduced motion remains scrollytelling in the editorial sense: scroll advances the
story chapter by chapter. It does not reproduce continuous spatial motion.

### Data-saving media profile

When `navigator.connection.saveData` is true, or the browser reports `slow-2g` or
`2g`, the story mode remains unchanged but media delivery becomes lighter:

- use the opening poster instead of downloading or playing the video;
- retain the same layout and copy;
- lazy-load images outside the current or following chapter.

Network hints are progressive enhancement. Browsers that do not expose them keep the
normal media profile.

### No JavaScript

The existing semantic linear fallback remains. It contains every chapter, evidence
panel, CTA, and closing message.

## Mode selection

`HomepageStory` will resolve a small explicit experience profile:

1. `motion=full` forces full motion for previewing and user choice.
2. `motion=reduced` forces the reduced-motion story.
3. Otherwise, `prefers-reduced-motion` selects reduced or full motion.
4. Save-Data and effective connection type affect media delivery only.
5. With no JavaScript, the `noscript` fallback is authoritative.

The implementation will expose the selected motion and media profiles through data
attributes so they can be tested and inspected without relying on visual inference.

## Geometry and rendering architecture

### Shared opening tiles

`SharedTileLayer` currently subscribes its measurement routine to opening progress.
That routine repeatedly reads root, source, and target rectangles and updates React
state.

It will instead:

- derive stable source and target boxes without depending on animated transforms;
- measure after mount and font readiness;
- remeasure on a real layout change through `ResizeObserver`;
- remeasure when the desktop/mobile layout key changes;
- cache geometry until one of those events occurs;
- remove the `progress.on('change', schedule)` measurement subscription.

Motion values will interpolate between cached boxes without further layout reads.

### Channel connector

`ChannelHandoff` currently measures on sequence progress and observes animated `style`
attributes. This causes layout reads while those same elements are being transformed.

It will instead:

- cache the connector geometry for the active channel;
- measure after the active channel changes and after the new row has settled;
- remeasure on container resize and font readiness;
- remove progress-driven measurement and the animated-style `MutationObserver`;
- animate only path length and the pulse position from cached points.

### Main story

The main story already changes React state only when a scene threshold changes.
That property must remain true. Hidden scenes will not gain new layout measurement
subscriptions. If the primary fixes do not meet the performance budget, rendering
only the active and adjacent visual scenes may be added in a separate measured change;
it is not required in the first fix.

## Media delivery

- Re-encode `video4.webm` without audio.
- Preserve 1280×720 unless a lower resolution passes visual comparison.
- Target a transfer size of at most 2.5 MB without visible blocking artifacts.
- Keep the poster as the immediate visual and LCP candidate.
- Do not start video download in the data-saving profile.
- Ensure opening tile dimensions are declared and use appropriately sized derivatives
  where the current source materially exceeds its rendered size.

## Analytics loading

Page-view attribution must remain available, but heavy work must not compete with the
opening hydration.

- Apply the loading change to `/` only; analytics behavior on other routes is outside
  this fix.
- Keep the consent and attribution data path intact.
- Queue first-party page-view information immediately.
- Defer PostHog session recording, surveys, and nonessential advertising helpers until
  browser idle or the first meaningful interaction.
- Do not initialize the same vendor twice.
- Validate CTA and story-completion events after deferral.

This work must preserve the current regional consent behavior.

## Accessibility

- Continue honoring `prefers-reduced-motion`.
- Do not use device memory as an accessibility or performance proxy.
- Keep a single visible `h1`.
- Maintain semantic scene order in every profile.
- Preserve keyboard access, focus behavior, inert hidden content, readable contrast,
  and all CTAs.
- The query overrides are diagnostic and user-choice mechanisms, not the default
  accessibility policy.

## Testing

### Behavior

- Bare `/` selects full motion under a normal preference.
- Bare `/` selects reduced motion under a reduced preference but still exposes every
  narrative chapter in order.
- `?motion=full` overrides a reduced preference.
- `?motion=reduced` overrides a normal preference.
- Save-Data prevents video loading while preserving the selected story mode.
- No-JavaScript mode preserves the complete story.
- `/legacy` remains byte-for-byte unaffected by the homepage component changes.

### Performance regression

Add deterministic browser instrumentation around the opening:

- count geometry reads during a representative scroll interval;
- fail if the opening returns to progress-driven layout measurement;
- verify React scene state changes only at scene boundaries;
- assert no console errors during slow, fast, reverse, Page Down, and touch scrolling.

The geometry-read threshold will be derived from the optimized implementation and
leave room for browser internals, but it must be at least an order of magnitude below
the measured production baseline.

### Verification matrix

- desktop Chromium with normal motion;
- desktop Chromium with reduced motion;
- mobile and small mobile viewports;
- Save-Data or equivalent request interception;
- JavaScript disabled;
- local production build;
- deployed `https://avoqado.io/` canary check.

Run the existing homepage scrollytelling, narrative hierarchy, opening, and legacy
suites serially where necessary to avoid the known parallel scroll-test interference.

## Acceptance criteria

- The bare production URL presents the complete story under every motion profile.
- Full motion preserves the approved appearance and scene timing.
- Reduced motion progresses chapter by chapter and does not resemble the previous
  all-at-once static opening.
- Opening geometry is not measured from scroll-progress subscriptions.
- Representative automated scrolling records no application-caused pause above 50 ms
  on the unthrottled desktop test environment.
- The optimized video is no larger than 2.5 MB, or the implementation documents why a
  slightly larger asset is required for acceptable quality.
- Existing CTA tracking, consent, navigation, chatbot, FAQ, footer, and `/legacy`
  behavior continue to pass.

## Rollout and rollback

1. Implement on `codex/homepage-motion-performance`.
2. Verify locally against a production build.
3. Merge only after the behavior and performance suites pass.
4. Deploy and compare live load and scroll traces.
5. Keep `/legacy` and the pre-fix production commit available for immediate rollback.
