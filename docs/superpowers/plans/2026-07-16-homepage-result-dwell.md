# Homepage Result Dwell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep every post-opening scene result fully readable for slightly more scroll before the reversible handoff begins.

**Architecture:** Retain the current story height, scene ranges, copy, and demonstration thresholds. Extend the shared result hold through local progress `0.96`, then make `StoryLayer` derive its outgoing crossfade from that shared exit phase so narrative content and its scene leave together.

**Tech Stack:** Astro 5, React 18, TypeScript, Framer Motion 12.23.26, Playwright 1.60.

## Global Constraints

- Apply the change to all seven scenes rendered by `AnimatedStory`.
- Keep `STORY_PHASES.result` at `[0.73, 0.84]`.
- Set the stable result hold to `[0.84, 0.96]` and the exit to `[0.96, 1]`.
- Do not change story height, scene ranges, demonstration thresholds, copy, opening, FAQ, Footer, or `/demo`.
- Preserve scroll-derived reverse behavior, reduced motion, no-JavaScript output, and the final IA layer behavior.
- Add no dependency and animate no new property.

---

### Task 1: Extend the shared result plateau

**Files:**
- Modify: `tests/e2e/home-narrative-hierarchy.spec.ts`
- Modify: `src/components/interactive/home-story/story-motion.ts`
- Modify: `src/components/interactive/home-story/StoryLayer.tsx`

**Interfaces:**
- Consumes: `STORY_PHASES.exit`, each scene's existing local `MotionValue<number>`, and `scrollStorySceneTo`.
- Produces: a single `0.96` exit boundary shared by result hold and outgoing scene opacity.

- [ ] **Step 1: Write the failing dwell and reverse-scroll test**

Add a desktop Playwright test that scrolls every scene to `0.955`, asserts that its result and
layer opacity are at least `0.95`, advances intermediate scenes to `0.98` to observe the exit,
then returns to `0.955` and asserts the exact prior opacity values are restored.

- [ ] **Step 2: Run the focused test to verify RED**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop --grep "retiene cada resultado"
```

Expected: FAIL because intermediate layers start fading at local progress `0.93`.

- [ ] **Step 3: Implement the minimal shared timing change**

Update `story-motion.ts`:

```ts
hold: [0.84, 0.96],
exit: [0.96, 1],
```

Import `STORY_PHASES` in `StoryLayer.tsx` and replace both outgoing `0.93` literals with
`STORY_PHASES.exit[0]`.

- [ ] **Step 4: Run focused and narrative verification**

Run the focused command from Step 2, followed by:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npx playwright test tests/e2e/home-narrative-hierarchy.spec.ts --project=chromium-desktop
npm run build
```

Expected: all selected tests PASS and the production build exits `0`.

- [ ] **Step 5: Review the diff and commit**

Run `git diff --check`, confirm only the two timing files, the regression test, this plan, and
its design specification changed, then commit with:

```bash
git add docs/superpowers/specs/2026-07-16-homepage-result-dwell-design.md docs/superpowers/plans/2026-07-16-homepage-result-dwell.md tests/e2e/home-narrative-hierarchy.spec.ts src/components/interactive/home-story/story-motion.ts src/components/interactive/home-story/StoryLayer.tsx
git commit -m "fix(homepage): extend result reading pause"
```
