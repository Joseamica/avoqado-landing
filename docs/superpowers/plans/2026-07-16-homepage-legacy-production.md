# Homepage Legacy Production Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Publish the approved scrollytelling homepage at `/` while preserving the previous production landing as a functional, non-indexed `/legacy` route.

**Architecture:** Keep the current `src/pages/index.astro` untouched. Reconstruct the previous page from pre-scrollytelling commit `3316cf1` by snapshotting only its changed visual dependencies into `src/components/legacy/`, while reusing unchanged product sections and the current global navigation/footer. Merge and push only after route tests and a production build pass in both the feature worktree and merged `main`.

**Tech Stack:** Astro 5, React 18, TypeScript, Framer Motion 12.23.26, Tailwind CSS 4, Playwright 1.60, GitHub-triggered production deployment.

## Global Constraints

- `/` remains the approved homepage scrollytelling and keeps `?motion=full` support.
- `/legacy` remains directly accessible but is absent from public navigation and sitemap discovery.
- `/legacy` must include `noindex, nofollow` and canonical `https://avoqado.io/`.
- Snapshot the behavior and source structure of `SquareHero.tsx`, `FAQ.tsx`, and `DoodleBackground.tsx` from commit `3316cf1`; only the FAQ import path and trailing-whitespace normalization may differ.
- Reuse current Navbar, Footer, FloatingChatbot, IndustryAccordion, SuiteShowcase, UnifiedPlatform, EarlyAccessCTA, and ChatbotCTA.
- Reuse existing assets; do not copy images or video.
- Do not change `/demo`, product pages, pricing, help, backend, or the deployment pipeline.
- Add no dependency.
- Preserve the untracked `faq-endcap-2026-07-15-1759.png` in the main checkout and the untracked `test-results/` directory in the feature worktree.
- Do not delete the feature worktree or branch until production verification succeeds.

---

### Task 1: Specify the public legacy route contract

**Files:**
- Create: `tests/e2e/home-legacy.spec.ts`

**Interfaces:**
- Consumes: public routes `/`, `/legacy`, and `/demo`.
- Produces: a browser-level contract for new homepage isolation, legacy content, SEO exclusion, and shared chrome.

- [ ] **Step 1: Write the failing Playwright test**

Create `tests/e2e/home-legacy.spec.ts`:

```ts
import { expect, test } from 'playwright/test';

test('conserva la homepage anterior en /legacy sin competir en buscadores', async ({ page }) => {
  await page.goto('/?motion=full');
  await expect(page.locator('main[data-scrollytelling]')).toHaveCount(1);
  await expect(page.locator('[data-story-mode]').first()).toBeAttached();
  await expect(page.locator('[data-legacy-homepage]')).toHaveCount(0);

  await page.goto('/legacy');
  const legacy = page.locator('[data-legacy-homepage]');
  await expect(legacy).toHaveCount(1);
  await expect(legacy).toContainText('Tu tienda, tu gym, tu estética.');
  await expect(legacy.locator('#chatbot-section')).toHaveCount(1);
  await expect(legacy.locator('.unified-platform-wrapper')).toHaveCount(1);
  await expect(legacy.locator('.industry-section-wrapper')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://avoqado.io/');
  await expect(page.locator('[data-site-navigation]')).toHaveCount(1);
  await expect(page.locator('footer')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Abrir chat de ayuda' })).toHaveCount(1);

  await page.goto('/demo');
  await expect(page.locator('main[data-scrollytelling], [data-legacy-homepage]')).toHaveCount(0);
});
```

- [ ] **Step 2: Run the test to verify RED**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npx playwright test tests/e2e/home-legacy.spec.ts --project=chromium-desktop
```

Expected: FAIL because `/legacy` does not yet render `[data-legacy-homepage]`.

---

### Task 2: Restore the previous landing as isolated legacy components

**Files:**
- Create: `src/components/legacy/LegacySquareHero.tsx`
- Create: `src/components/legacy/LegacyFAQ.tsx`
- Create: `src/components/legacy/LegacyDoodleBackground.tsx`
- Create: `src/pages/legacy.astro`
- Modify: `astro.config.mjs`
- Test: `tests/e2e/home-legacy.spec.ts`

**Interfaces:**
- Consumes: immutable source blobs `3316cf1:src/components/interactive/SquareHero.tsx`, `3316cf1:src/components/interactive/FAQ.tsx`, `3316cf1:src/components/interactive/DoodleBackground.tsx`, plus current shared components.
- Produces: default React exports `LegacySquareHero`, `LegacyFAQ`, and `LegacyDoodleBackground`, and Astro route `/legacy` marked with `data-legacy-homepage`.

- [ ] **Step 1: Materialize the three immutable component snapshots**

Read the exact source blobs with:

```bash
git show 3316cf1:src/components/interactive/SquareHero.tsx
git show 3316cf1:src/components/interactive/FAQ.tsx
git show 3316cf1:src/components/interactive/DoodleBackground.tsx
```

Create the corresponding `src/components/legacy/Legacy*.tsx` files using `apply_patch`. Keep the
source bodies and their existing default-exported function names unchanged. Normalize inherited
trailing whitespace; the only semantic source edit is the FAQ dependency path:

```ts
// LegacyFAQ.tsx
import DoodleBackground from './LegacyDoodleBackground';
```

Default imports in `legacy.astro` provide the `LegacySquareHero` and `LegacyFAQ` local names, so the
snapshotted component implementations need no other edits.

- [ ] **Step 2: Create the legacy Astro route**

Create `src/pages/legacy.astro` from `3316cf1:src/pages/index.astro`, using these imports for the
snapshotted pieces:

```astro
import LegacySquareHero from '../components/legacy/LegacySquareHero';
import LegacyFAQ from '../components/legacy/LegacyFAQ';
```

Remove the unused `PaymentRouting` import, replace `<SquareHero>` with `<LegacySquareHero>`, replace
`<FAQ>` with `<LegacyFAQ>`, add the SEO directives below inside `<head>`, and mark the body:

```astro
<meta name="robots" content="noindex, nofollow" />
<link rel="canonical" href="https://avoqado.io/" />
...
<body data-legacy-homepage class="bg-black m-0 p-0 w-full">
```

All other old-page markup, loading variants, scroll observer, shared sections, Footer, and
FloatingChatbot remain the exact `3316cf1` structure.

- [ ] **Step 3: Exclude the archive from the generated sitemap**

Update the existing sitemap filter in `astro.config.mjs`:

```js
filter: (page) => !page.includes('/export-stage') && !page.includes('/legacy'),
```

- [ ] **Step 4: Run the focused test to verify GREEN**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npx playwright test tests/e2e/home-legacy.spec.ts --project=chromium-desktop
```

Expected: `1 passed`.

- [ ] **Step 5: Run homepage regressions and build**

Run:

```bash
PLAYWRIGHT_BASE_URL=http://127.0.0.1:4330 npx playwright test tests/e2e/home-legacy.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop
npm run build
! rg -q 'https://avoqado\.io/legacy/?' dist/sitemap-0.xml
git diff --check
```

Expected: all selected tests pass, build exits `0`, and `git diff --check` prints nothing.

- [ ] **Step 6: Commit the isolated legacy route**

Run:

```bash
git add astro.config.mjs src/components/legacy/LegacySquareHero.tsx src/components/legacy/LegacyFAQ.tsx src/components/legacy/LegacyDoodleBackground.tsx src/pages/legacy.astro tests/e2e/home-legacy.spec.ts docs/superpowers/plans/2026-07-16-homepage-legacy-production.md
git commit -m "feat(homepage): preserve previous landing at legacy"
```

Expected: one commit containing the route, three snapshots, test, and plan; `test-results/` remains untracked.

---

### Task 3: Merge, push, and verify production

**Files:**
- Merge source: `codex/homepage-scrollytelling`
- Merge target: `main`
- Preserve untracked main file: `faq-endcap-2026-07-15-1759.png`

**Interfaces:**
- Consumes: verified feature commit and current `origin/main`.
- Produces: merged `main`, pushed `origin/main`, and live routes `https://avoqado.io/` and `https://avoqado.io/legacy`.

- [ ] **Step 1: Refresh remote state and confirm merge safety**

Run:

```bash
git fetch origin
git status --short --branch
git log --oneline --left-right origin/main...codex/homepage-scrollytelling
```

If `origin/main` contains commits absent from the feature branch, merge `origin/main` into the
feature branch, resolve only overlapping homepage files, and rerun Task 2 Step 4 before continuing.

- [ ] **Step 2: Merge into local main without removing the worktree**

Run from `/Users/amieva/Documents/Programming/Avoqado/avoqado-landing`:

```bash
git pull --ff-only origin main
git merge --no-ff codex/homepage-scrollytelling -m "merge: publish homepage scrollytelling"
```

Expected: merge succeeds and `faq-endcap-2026-07-15-1759.png` remains untracked.

- [ ] **Step 3: Verify the merged result on main**

Run from the main checkout:

```bash
npm run build
npx playwright test tests/e2e/home-legacy.spec.ts tests/e2e/home-narrative-hierarchy.spec.ts tests/e2e/home-scrollytelling.spec.ts --project=chromium-desktop
git status --short --branch
```

Expected: build and tests pass; `main` is ahead of `origin/main` only by the feature and merge commits,
with the pre-existing screenshot still untracked.

- [ ] **Step 4: Push main to production**

Run:

```bash
git push origin main
```

Expected: push succeeds without force.

- [ ] **Step 5: Verify deployed content**

Poll the production routes until the deployment updates, then assert exact content:

```bash
curl -fsSL https://avoqado.io/ | rg 'data-scrollytelling'
curl -fsSL https://avoqado.io/legacy | rg 'data-legacy-homepage'
curl -fsSL https://avoqado.io/legacy | rg 'noindex, nofollow'
```

Expected: every command exits `0`. Keep the feature branch and worktree available for immediate
follow-up; the pre-merge `main` commit remains the exact rollback point in Git history.
