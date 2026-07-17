# Task 1 Report: Restore a Measured, One-Way Channels Connector

## Status

DONE

## Implementation

- Restored a single one-way Channels connector from the selected `Booking Widget` row to the `Reserva confirmada` event card on homepage `/`.
- Added real source and target anchors measured relative to `.story-channel-visual`, plus one passive route, one progress-drawn active route, and one primary pulse.
- Derived pulse coordinates and active path length from the same measured elbow route so the pulse follows the drawn endpoint and docks at the target without reversing.
- Added responsive anchor placement for stacked mobile and side-by-side desktop/tablet layouts.
- Preserved sequential channel-row reveal, the route-summary truth, monotonic event reveal, and the absence of the obsolete `Ruta activa` label/decorative row rules.
- Added browser geometry coverage for route endpoints, pulse alignment, monotonic travel, panel containment, overflow, chatbot visibility, mobile truth, and the global one-primary-pulse handoff contract.
- Kept `/demo`, Payment, Aftercare, and all design/plan documents untouched.

### Authorized Technical Correction

The literal measurement effect from the brief measured the source while its row was at `x=-14` and the target while the event was at `y=14`. `ResizeObserver` does not fire for transform-only animation, so the route remained approximately 12–14 px behind the live anchors. The parent explicitly authorized a `progress` subscription that coalesces measurement into one `requestAnimationFrame`. Cleanup unsubscribes, cancels the pending frame, and disconnects the observers. `setRoute` returns the current state when width, height, and path are unchanged. This preserves the approved transforms while keeping the route attached to the real anchors.

## Files

- `src/components/interactive/home-story/scenes/ChannelsScene.tsx`
- `src/components/interactive/home-story/home-story.css`
- `tests/e2e/home-scrollytelling.spec.ts`

No generated `test-results` artifacts were retained or committed.

## RED Evidence

Exact command:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro" \
  --project chromium-desktop
```

Exit code: `1`.

Observed output (ANSI control sequences omitted; wording and counts preserved):

```text
> avoqado-landing@0.0.1 test:e2e
> playwright test tests/e2e/home-scrollytelling.spec.ts --grep conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro --project chromium-desktop

Running 4 tests using 1 worker

1) [chromium-desktop] › tests/e2e/home-scrollytelling.spec.ts:256:1 › conecta Booking Widget con la reserva en un solo sentido

   Locator:  ...locator('[data-channel-route-source]')
   Expected: 1
   Received: 0
   Timeout:  8000ms

2) [chromium-desktop] › tests/e2e/home-scrollytelling.spec.ts:376:1 › mantiene el conector dentro del panel en todos los viewports

   Error: locator.evaluate: TypeError: Cannot read properties of null (reading 'getBoundingClientRect')

3) [chromium-desktop] › tests/e2e/home-scrollytelling.spec.ts:744:1 › mantiene un solo pulso primario durante los handoffs

   Error: channels exposes 1 primary pulse
   Expected: 1
   Received: 0

3 failed
  [chromium-desktop] › tests/e2e/home-scrollytelling.spec.ts:256:1 › conecta Booking Widget con la reserva en un solo sentido
  [chromium-desktop] › tests/e2e/home-scrollytelling.spec.ts:376:1 › mantiene el conector dentro del panel en todos los viewports
  [chromium-desktop] › tests/e2e/home-scrollytelling.spec.ts:744:1 › mantiene un solo pulso primario durante los handoffs
1 skipped
```

This was the expected RED: route anchors/path and the Channels pulse did not exist, while the handoff contract observed zero pulses.

## Intermediate GREEN Diagnosis

The first literal implementation run exposed the transform-only measurement defect described above. The exact final GREEN command exited `1` with `4 failed, 11 skipped, 5 passed`; source/pulse and route/anchor distances measured approximately `12.4–14.0` px instead of at most `3` px. After the authorized progress remeasurement, a focused desktop connector rerun passed `1 passed (8.5s)`.

## GREEN Evidence

Exact command:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro"
```

Exit code: `0`.

Exact result summary:

```text
Running 20 tests using 5 workers
11 skipped
9 passed (34.2s)
```

The skips are the test file's intentional project guards for animation-only, mobile-only, and desktop-only assertions.

## Build Evidence

Exact command:

```bash
npm run build
```

Exit code: `0`.

Exact result tail:

```text
[build] Server built in 45.61s
[build] Complete!
```

The build emitted existing Sentry auth/source-map warnings and existing Astro prerender warnings about `Astro.request.headers`; none originate in the changed files.

## Diff and Hygiene Evidence

```bash
git diff --check
```

Exit code: `0`; no output. Before staging, `git status --short` listed only the three scoped modified files after `test-results/` was removed. After the commit, `git status --short` produced no output.

## Self-Review

- **Requirements:** Confirmed all required data hooks, exact route timings, route styles, target/source anchors, summary text, event reveal timings, responsive anchor CSS, viewport matrix, mobile pulse expectation, and handoff tuple are present.
- **Geometry:** Route and pulse share one measured geometry source. Focused tests verify source/target endpoint alignment, pulse-to-active-path alignment, monotonic approach, terminal docking, visual containment, and document overflow across six viewport sizes.
- **Lifecycle/performance:** Resize/font changes remain measured; transform motion is measured once per coalesced animation frame. The progress listener, pending frame, and observers are all cleaned up. Identical route state is not re-set.
- **Scope:** The commit changes exactly the three task files. No `/demo`, Payment, Aftercare, fixture, design, or plan code changed.
- **Quality:** `git diff --check` is clean; the production build and full focused browser matrix pass. Tests exercise real browser geometry and DOM behavior without mocks.
- **Artifacts:** Playwright failure/pass artifacts were deleted before commit and are absent from the worktree.

No Critical, Important, or Minor implementation findings remained after self-review. The main task will perform the independent gate review separately.

## Commit

```text
2d616a2eeec8dc2351720503920a8715615b2e07
fix(homepage): restore measured channel connector
3 files changed, 321 insertions(+), 21 deletions(-)
```

## Concerns

No blocking concerns.

- Playwright emits the existing informational warning that `NO_COLOR` is ignored because `FORCE_COLOR` is set.
- The successful build emits the existing Sentry and Astro warnings recorded above.
- The progress-driven remeasurement is an explicitly approved correction to the literal brief, required because transforms do not trigger `ResizeObserver`.

---

## Post-review correction: preserve one-way travel on reverse scroll

An independent review found that the measured connector still derived `trackLength`, `pulseX`, and `pulseY` from raw local progress. After the route reached the reservation, reverse scrolling therefore shortened the active path and moved the pulse back toward the source. The same review also found that the six-viewport contract checked pulse containment but did not assert pulse-to-target or active-route-to-target alignment.

### Implementation

- Added a `routeProgress` MotionValue that records the route's high-water local progress.
- Kept connector opacity, event reveal, anchor transforms, and route measurement driven by raw local progress.
- Reset the route high-water mark only at local progress `<= 0.20`, safely below the connector opacity start at `0.24`, so leaving backward into the invisible pre-scene zone resets a later forward replay.
- Reused the existing progress subscription and animation-frame measurement. Cleanup still unsubscribes the listener, cancels a pending frame, disconnects every observer, and guards delayed font measurement.
- Added a real reverse-scroll browser regression for both pulse docking and active-path completion.
- Added explicit `<= 3px` pulse-to-target and active-route-to-target assertions at all six required viewport sizes.

### TDD RED evidence

Exact command:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget" \
  --project chromium-desktop
```

Exit code: `1`.

Exact failure measurements:

```text
reverse scroll keeps the visible pulse docked
Expected: <= 3
Received: 35.38672474094071

reverse scroll keeps the visible route complete
Expected: <= 3
Received: 35.29953122664401

1 failed
```

This was the expected RED: the forward assertions passed, then raw reverse progress undocked both the pulse and active route while the connector remained visible.

### Targeted GREEN evidence

The same exact command after the high-water fix exited `0`:

```text
Running 1 test using 1 worker
1 passed (3.5s)
```

### Full focused Channels GREEN evidence

Exact command:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro"
```

Exit code: `0`.

Exact result summary:

```text
Running 20 tests using 5 workers
11 skipped
9 passed (14.5s)
```

The skips remain the spec's intentional project guards. The desktop responsive test exercised `1440×900`, `910×691`, `787×701`, `887×502`, `390×844`, and `320×568`, including the new target-alignment assertions.

### Build and hygiene evidence

```bash
npm run build
```

Exit code: `0`.

```text
[build] Server built in 12.56s
[build] Complete!
```

The build repeated the existing Sentry auth/source-map and Astro prerender `Astro.request.headers` warnings; no warning originated in the changed files.

```bash
git diff --check
```

Exit code: `0`; no output.

Generated Playwright `test-results/.last-run.json` and RED failure artifacts were removed before staging. `/demo` and unrelated homepage scenes remain untouched.

---

## Final visual-coherence correction

In-app visual QA found two remaining coherence defects: reverse scrolling kept the connector docked but hid its destination card, and the anchor-distance heuristic classified every side-by-side viewport as a stacked route. This wave keeps the entire relation monotonic and derives route topology from the rendered panel layout.

### Implementation

- `eventOpacity`, `eventY`, and `pulseScale` now use the same high-water `routeProgress` as pulse position and active-path length.
- Connector opacity continues to use raw progress, so the complete relation fades before the high-water state resets invisibly at local progress `<= 0.20`.
- Route measurement now compares the real ledger and event rectangles: non-overlapping horizontal panels use `M-H-V-H`; overlapping stacked panels use `M-V-H`.
- The ledger and event panels are included in the existing `ResizeObserver`; the existing progress unsubscribe, pending-frame cancellation, observer disconnect, and delayed-font guard remain intact.
- The reverse-scroll regression now asserts the destination remains at opacity `>= 0.98` and within `1px` of its revealed Y position, then verifies hidden reset and replay from the source.
- The six-viewport contract now asserts `M-H-V-H` at `1440×900`, `910×691`, `787×701`, and `887×502`, plus `M-V-H` at `390×844` and `320×568`, without weakening any existing `<= 3px` geometry assertion.

### TDD RED A: destination coherence on reverse scroll

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget" \
  --project chromium-desktop
```

Exit code: `1`.

```text
reverse scroll keeps the destination revealed
Expected: >= 0.98
Received: 0

reverse scroll keeps the destination docked
Expected: <= 1
Received: 14

1 failed
```

### TDD RED B: rendered route topology

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "mantiene el conector dentro" \
  --project chromium-desktop
```

Exit code: `1`.

For each side-by-side viewport (`1440×900`, `910×691`, `787×701`, `887×502`):

```text
route follows the rendered panel layout
Expected: "MHVH"
Received: "MVH"
```

The stacked mobile viewports already reported the intended `MVH` topology.

### Targeted GREEN evidence

The exact RED A command exited `0` with:

```text
1 passed (3.2s)
```

The exact RED B command exited `0` with:

```text
1 passed (2.7s)
```

### Full focused Channels GREEN evidence

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npm run test:e2e -- \
  tests/e2e/home-scrollytelling.spec.ts \
  --grep "conecta Booking Widget|mantiene la verdad crítica|mantiene un solo pulso|mantiene el conector dentro"
```

Exit code: `0`.

```text
Running 20 tests using 5 workers
11 skipped
9 passed (10.1s)
```

### Build and hygiene evidence

```bash
npm run build
```

Exit code: `0`.

```text
[build] Server built in 9.44s
[build] Complete!
```

The build repeated only the existing Sentry auth/source-map and Astro prerender warnings.

```bash
git diff --check
```

Exit code: `0`; no output. Generated `test-results` artifacts were removed before staging. `/demo`, CSS, and all unrelated scenes remain untouched.
