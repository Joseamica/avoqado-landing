# Scrollytelling Guide — Avoqado Landing Page

> Complete reference for implementing scroll-linked animations using framer-motion in Astro + React.
> This documents every pattern used in the main landing page (`/`) so they can be replicated in any section or page.

---

## Table of Contents

1. [Core Concept](#core-concept)
2. [The Universal Pattern](#the-universal-pattern)
3. [Step-by-Step: Building a Scrollytelling Section](#step-by-step-building-a-scrollytelling-section)
4. [Animation Recipes](#animation-recipes)
5. [Component Reference](#component-reference)
6. [Responsive Design](#responsive-design)
7. [Advanced Techniques](#advanced-techniques)
8. [Gotchas & Troubleshooting](#gotchas--troubleshooting)
9. [Performance](#performance)

---

## Core Concept

Scrollytelling = the user's scroll position drives animations instead of time. As the user scrolls through a tall container, a sticky viewport stays visible and content animates based on how far they've scrolled (0% to 100% of the container).

**Three ingredients:**

```
useScroll()     → Tracks scroll progress (0 to 1)
useTransform()  → Maps progress to CSS values (opacity, y, scale, etc.)
motion.div      → Applies the animated values via `style` prop
```

---

## The Universal Pattern

Every scrollytelling section in the landing page follows this exact structure:

### JSX Structure

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function MySection() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Track scroll progress (0 = top of container at viewport top, 1 = bottom at viewport bottom)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]  // ALWAYS use this exact offset
  });

  // 2. Map progress to animation values
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [40, 0]);

  return (
    // 3. TALL container — provides scroll space
    <div ref={containerRef} className="relative h-[200vh] bg-black">

      {/* 4. STICKY viewport — stays visible while scrolling */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">

        {/* 5. Animated content */}
        <motion.div style={{ opacity: titleOpacity, y: titleY }}>
          <h2>This fades in as you scroll</h2>
        </motion.div>

      </div>
    </div>
  );
}
```

### Astro Page Integration

```astro
---
import MySection from '../components/interactive/MySection';
---

<div class="my-section-wrapper">
  <MySection client:visible />
</div>
```

### Key Rules

| Element | Class | Purpose |
|---|---|---|
| Outer container | `relative h-[Xvh]` | Tall div that provides scroll space. X = 150-300 |
| Sticky viewport | `sticky top-16 h-[calc(100vh-4rem)]` | Stays visible. `top-16` = below navbar (64px) |
| Content wrapper | `flex items-center justify-center` | Centers content in the viewport |
| Animated elements | `<motion.div style={{...}}>` | Uses transforms from `useTransform` |

### Height Guidelines

| Container Height | Scroll Speed | Best For |
|---|---|---|
| `h-[150vh]` | Fast — minimal scroll | Simple fade-in sections |
| `h-[200vh]` | Medium — comfortable | 2-3 sequential reveals |
| `h-[300vh]` | Slow — cinematic | Complex multi-phase animations |
| `h-[180vh]` | Fast-medium | Hero sections |

---

## Step-by-Step: Building a Scrollytelling Section

### Step 1: Define the scroll timeline

Decide what happens at each percentage of scroll:

```
0%  - 20%:   Title fades in
20% - 50%:   Content appears
50% - 80%:   Secondary content
80% - 100%:  Final state / CTA
```

### Step 2: Create useTransform declarations

Each animation gets a `useTransform` that maps scroll ranges to values:

```tsx
// Fade in: 0% to 20% scroll
const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
const titleY = useTransform(scrollYProgress, [0, 0.2], [40, 0]);

// Scale up: 20% to 50% scroll
const contentScale = useTransform(scrollYProgress, [0.2, 0.5], [0.8, 1]);
const contentOpacity = useTransform(scrollYProgress, [0.2, 0.35], [0, 1]);
```

### Step 3: Apply to motion elements

```tsx
<motion.div style={{ opacity: titleOpacity, y: titleY }}>
  <h2>Title</h2>
</motion.div>

<motion.div style={{ opacity: contentOpacity, scale: contentScale }}>
  <p>Content appears after title</p>
</motion.div>
```

### Step 4: Add to Astro page

```astro
<MySection client:visible />
```

Use `client:visible` for most sections (loads when entering viewport).
Use `client:load` only for the first visible section (SquareHero).

---

## Animation Recipes

### Recipe 1: Simple Fade + Slide Up

The most common pattern. Element fades in while sliding up.

```tsx
const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
const y = useTransform(scrollYProgress, [0, 0.2], [40, 0]);

<motion.div style={{ opacity, y }}>
  Content here
</motion.div>
```

### Recipe 2: Staggered List Reveal

Multiple items appear one after another. Each starts 0.015 later.

```tsx
const items = ['Item A', 'Item B', 'Item C', 'Item D'];

// Create transforms for each item
const itemTransforms = items.map((_, index) => {
  const start = 0.1 + (index * 0.05);    // Each starts 0.05 later
  const end = start + 0.15;               // Each takes 0.15 of scroll to complete
  return {
    opacity: useTransform(scrollYProgress, [start, end], [0, 1]),
    y: useTransform(scrollYProgress, [start, end], [30, 0]),
    scale: useTransform(scrollYProgress, [start, end], [0.9, 1]),
  };
});

// Apply in JSX
{items.map((item, i) => (
  <motion.div
    key={i}
    style={{
      opacity: itemTransforms[i].opacity,
      y: itemTransforms[i].y,
      scale: itemTransforms[i].scale,
    }}
  >
    {item}
  </motion.div>
))}
```

**Stagger increment guidelines:**
- `0.015` per item = tight stagger (17 items in SquareHero grid)
- `0.04` per item = medium stagger (8 cards in UnifiedPlatform)
- `0.05` per item = relaxed stagger (4-6 items)

### Recipe 3: Width/Scale Expansion

Element grows from a point to full size (used in ChatbotCTA input).

```tsx
const width = useTransform(scrollYProgress, [0.2, 0.5], ["0%", "100%"]);
const scale = useTransform(scrollYProgress, [0.2, 0.5], [0.5, 1]);
const opacity = useTransform(scrollYProgress, [0.2, 0.3], [0, 1]);

<motion.div style={{ width, scale, opacity }} className="max-w-xl">
  <input placeholder="Expanding input..." />
</motion.div>
```

### Recipe 4: SVG Path Drawing

Line draws itself along a path (used in FAQ arrow, UnifiedPlatform connections).

```tsx
const pathDraw = useTransform(scrollYProgress, [0.3, 0.7], [0, 1]);
const pathOpacity = useTransform(scrollYProgress, [0.29, 0.3], [0, 1]);

<svg viewBox="0 0 500 300">
  <motion.path
    d="M 50 150 C 150 50, 350 250, 450 150"
    fill="none"
    stroke="#69E185"
    strokeWidth="3"
    style={{
      pathLength: pathDraw,
      opacity: pathOpacity,
    }}
  />
</svg>
```

**Key:** Always add an opacity transform that starts just before the pathLength to avoid a visible dot at the start.

### Recipe 5: Text Writing Reveal

Text appears as if being typed/written (used in FAQ).

```tsx
const writeProgress = useTransform(scrollYProgress, [0, 0.15], ["0%", "100%"]);

<div className="relative inline-block">
  {/* Ghost text for layout sizing — invisible */}
  <span className="opacity-0">Your text here</span>

  {/* Reveal mask — clips from left to right */}
  <motion.div
    style={{ width: writeProgress }}
    className="absolute top-0 left-0 h-full overflow-hidden whitespace-nowrap"
  >
    <span className="text-white">Your text here</span>
  </motion.div>
</div>
```

### Recipe 6: Blur Fade (Cinematic)

Element fades in while deblurring (used in SquareHero text).

```tsx
const opacity = useTransform(scrollYProgress, [0.45, 0.58], [0, 1]);
const y = useTransform(scrollYProgress, [0.45, 0.58], [30, 0]);
const blurValue = useTransform(scrollYProgress, [0.45, 0.58], [8, 0]);
const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

<motion.div style={{ opacity, y, filter }}>
  <h2>Cinematic reveal</h2>
</motion.div>
```

### Recipe 7: Animated Counter (Event-Driven)

Counter animates when scroll crosses a threshold (used in EarlyAccessCTA).

```tsx
import { useMotionValue, useSpring } from 'framer-motion';

function AnimatedCounter({ value }: { value: number }) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 100, damping: 30 });
  const [display, setDisplay] = useState(0);

  useEffect(() => { motionValue.set(value); }, [value]);
  useEffect(() => {
    const unsub = spring.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [spring]);

  return <span>{display}</span>;
}

// Trigger when scroll passes 5%
const [triggered, setTriggered] = useState(false);
const [targetValue, setTargetValue] = useState(0);

useEffect(() => {
  const unsub = scrollYProgress.on("change", (v) => {
    if (v > 0.05 && !triggered) {
      setTriggered(true);
      setTargetValue(42);
    }
  });
  return unsub;
}, [scrollYProgress, triggered]);

<AnimatedCounter value={targetValue} />
```

### Recipe 8: Hero Shrink-to-Grid

Full-screen element shrinks and repositions into a grid cell (used in SquareHero).

```tsx
const SHRINK_END = 0.5;  // Takes 50% of scroll to shrink

const heroScale = useTransform(scrollYProgress, [0, SHRINK_END], [1, 0.105]);
const heroX = useTransform(scrollYProgress, [0, SHRINK_END], ["0%", "44%"]);
const heroY = useTransform(scrollYProgress, [0, SHRINK_END], ["0px", "65%"]);
const borderRadius = useTransform(scrollYProgress, [0, SHRINK_END], [0, 16]);

<motion.div
  style={{
    scale: heroScale,
    x: heroX,
    y: heroY,
    borderRadius,
  }}
  className="absolute inset-0 origin-top-left"
>
  <video src="/video.webm" autoPlay loop muted playsInline />
</motion.div>
```

---

## Component Reference

### Landing Page Scroll Sequence

The main page (`/`) composes 6 scrollytelling components:

```
Page Start
│
├── SquareHero (h-[180vh])
│   └── Video shrinks → Grid reveals → Text appears
│
├── ChatbotCTA (h-[300vh])
│   └── Title → Input expands → Suggestion chips
│
├── PaymentRouting (h-[300vh])
│   └── Title → Grid cards stagger → Connection lines draw
│
├── UnifiedPlatform (h-[300vh])
│   └── Title → Center logo → Source cards → Electric connections
│
├── EarlyAccessCTA (h-[200vh])
│   └── Title → Counter → Benefits → CTA button
│
├── FAQ (h-[300vh])
│   └── Text writes → Arrow draws → Circle scribbles
│
Page End
```

### Per-Component Scroll Timelines

#### SquareHero (180vh)
```
0.00 ─── 0.08: Hero text fades out
0.00 ─── 0.50: Video shrinks to grid position
0.08 ─── 0.67: Grid items stagger in (17 items, +0.015 each)
0.10 ─── 0.35: Grid container fades in
0.45 ─── 0.58: Center text line 1 (fade + blur)
0.52 ─── 0.68: Center text line 2 (fade + blur)
```

#### ChatbotCTA (300vh)
```
0.00 ─── 0.20: Title fades in + slides up
0.20 ─── 0.30: Input fades in
0.20 ─── 0.50: Input expands width + scales up
0.60 ─── 0.80: Suggestion chips fade in + slide up
```

#### PaymentRouting (300vh)
```
0.00 ─── 0.10: Title fades in
0.10 ─── 0.20: Grid fades in
0.08 ─── 0.67: Cards stagger in (+0.015 per card)
0.55 ─── 0.60: Connection base lines appear
0.75 ─── 0.80: Electric flow animation starts
```

#### UnifiedPlatform (300vh)
```
0.00 ─── 0.15: Title fades in
0.10 ─── 0.25: Center logo fades in
0.20 ─── 0.60: Source cards stagger in (+0.04 per card)
0.55 ─── 0.60: Connection lines appear
0.75 ─── 0.80: Electric dash animation + logo glow
```

#### EarlyAccessCTA (200vh)
```
0.00 ─── 0.20: Title fades in
0.15 ─── 0.35: Counter fades in (spring animation triggers at 0.05)
0.30 ─── 0.50: Benefits grid fades in
0.55 ─── 0.75: CTA form fades in
0.75 ─── 0.90: Footer text fades in
```

#### FAQ (300vh)
```
0.00 ─── 0.05: Overlay fades to full opacity
0.00 ─── 0.10: Text line 1 writes in
0.10 ─── 0.20: Text line 2 writes in
0.24 ─── 0.25: Arrow line becomes visible
0.25 ─── 0.60: Arrow path draws
0.59 ─── 0.60: Arrow head appears
0.65 ─── 0.90: Scribble circle draws
```

---

## Responsive Design

### Mobile Detection

```tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const check = () => setIsMobile(window.innerWidth < 768);
  check();
  window.addEventListener('resize', check);
  return () => window.removeEventListener('resize', check);
}, []);
```

### Conditional Transform Values

```tsx
// Different end positions for mobile vs desktop
const heroScale = useTransform(
  scrollYProgress,
  [0, 0.5],
  [1, isMobile ? 0.31 : 0.105]
);

const heroX = useTransform(
  scrollYProgress,
  [0, 0.5],
  ["0%", isMobile ? "34.5%" : "44%"]
);
```

### Completely Different Layouts (UnifiedPlatform pattern)

When mobile needs a fundamentally different animation:

```tsx
return (
  <>
    {/* Desktop layout */}
    <div className="hidden lg:block">
      <DesktopRadialDiagram scrollYProgress={scrollYProgress} />
    </div>

    {/* Mobile layout */}
    <div className="lg:hidden">
      <MobileWaterfallCascade scrollYProgress={scrollYProgress} />
    </div>
  </>
);
```

---

## Advanced Techniques

### Transform Chaining

Create derived values from transforms:

```tsx
// Step 1: Get raw number from scroll
const blurValue = useTransform(scrollYProgress, [0.45, 0.58], [8, 0]);

// Step 2: Convert number to CSS string
const filter = useTransform(blurValue, (v) => `blur(${v}px)`);

// Step 3: Apply
<motion.div style={{ filter }}>
```

### Portal Rendering

When animated content needs to escape the sticky container's transform stacking context (e.g., fixed overlays):

```tsx
import { createPortal } from 'react-dom';

const [mounted, setMounted] = useState(false);
useEffect(() => setMounted(true), []);

// Inside the component return:
{mounted && createPortal(
  <motion.div
    style={{ opacity: overlayOpacity }}
    className="fixed inset-0 pointer-events-none z-[40]"
  >
    {/* Content that needs to be truly fixed */}
  </motion.div>,
  document.body
)}
```

### Scroll-Triggered Events

Fire a one-time action when scroll passes a threshold:

```tsx
const [hasTriggered, setHasTriggered] = useState(false);

useEffect(() => {
  const unsubscribe = scrollYProgress.on("change", (value) => {
    if (value > 0.05 && !hasTriggered) {
      setHasTriggered(true);
      // Do something once
    }
  });
  return () => unsubscribe();
}, [scrollYProgress, hasTriggered]);
```

### Animated SVG Connections

For drawing lines between elements:

```tsx
const ElectricConnection = ({ fromPos, toPos, color, scrollY }) => {
  const opacity = useTransform(scrollY, [0.55, 0.6], [0, 1]);

  // Cubic bezier path between two points
  const dx = toPos.x - fromPos.x;
  const path = `M ${fromPos.x} ${fromPos.y} C ${fromPos.x + dx * 0.5} ${fromPos.y}, ${toPos.x - dx * 0.5} ${toPos.y}, ${toPos.x} ${toPos.y}`;

  return (
    <motion.path
      d={path}
      fill="none"
      stroke={color}
      strokeWidth={2}
      style={{ opacity }}
    />
  );
};
```

---

## Gotchas & Troubleshooting

### 1. framer-motion version MUST be 12.23.26

**CRITICAL:** Versions 12.24+ introduced native WAAPI `ScrollTimeline` that has a bug where `useScroll({ target })` tracks the entire document instead of the target element.

```json
// package.json — PINNED, not caret
"framer-motion": "12.23.26"
```

### 2. Never use `overflow: hidden` on body for modals

It resets scroll calculations and breaks all scrollytelling. Use the position-fixed pattern instead:

```tsx
// Lock scroll (save position)
const scrollY = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = `-${scrollY}px`;
document.body.style.left = '0';
document.body.style.right = '0';

// Unlock scroll (restore position)
document.body.style.position = '';
document.body.style.top = '';
window.scrollTo(0, scrollY);
```

### 3. Always use `["start start", "end end"]` offset

Other offsets like `["start end", "end start"]` track viewport entry/exit, not scroll-through. For scrollytelling, you ALWAYS want `["start start", "end end"]`.

### 4. The `<astro-island>` wrapper has height 0

Astro wraps React components in `<astro-island>` which reports `height: 0` via `getBoundingClientRect()`. This is fine — the inner div with `h-[Xvh]` still takes up layout space. But don't try to use the `astro-island` element as a scroll target.

### 5. Don't use `whileInView` for scroll-linked animations

`whileInView` only triggers once when an element enters the viewport. It's for entrance animations, not continuous scroll-linked effects.

### 6. Sticky needs `top` offset matching navbar

If navbar is 64px (`h-16`), the sticky must be `top-16` with `h-[calc(100vh-4rem)]`. If sticky is `top-0 h-screen`, content may be hidden behind the navbar.

### 7. Container must have `relative` position

`useScroll({ target })` requires the target to have a non-static CSS position. Always add `relative` to the outer container.

### 8. `initial={false}` for animated SVG paths

When using `animate={{ d }}` on `motion.path`, add `initial={false}` to prevent animating from `undefined` on mount:

```tsx
<motion.path
  d={pathString}
  initial={false}
  animate={{ d: pathString }}
  transition={{ type: "spring", stiffness: 300, damping: 30 }}
/>
```

### 9. SSR + React hooks in Astro 6 + Cloudflare

React SSR in Astro 6 with Cloudflare adapter can create dual React instances during Vite program reloads. The `reactSsrSingletonPlugin()` in `astro.config.mjs` patches this. Do NOT remove it.

---

## Performance

### Do

- Use `client:visible` for sections below the fold (loads only when entering viewport)
- Use `useTransform` on `style` props — framer-motion optimizes these to avoid React re-renders
- Use `will-change: transform` on elements that animate frequently
- Keep container heights reasonable (300vh max)

### Don't

- Don't use `useState` + `onChange` to track scroll values — this causes re-renders on every frame
- Don't create transforms inside render (create them at component top level)
- Don't add more than ~40 `useTransform` instances per component
- Don't use CSS `transition` on elements that also have `useTransform` styles (conflicts)

### Hydration Directives

| Directive | When to Use |
|---|---|
| `client:load` | First visible section only (SquareHero) |
| `client:visible` | All other scrollytelling sections |
| `client:idle` | Non-scroll interactive elements (FloatingChatbot) |

---

## Quick Start Template

Copy this to create a new scrollytelling section:

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function NewSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  // Phase 1: Title (0% - 20%)
  const titleOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.2], [40, 0]);

  // Phase 2: Content (20% - 50%)
  const contentOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const contentY = useTransform(scrollYProgress, [0.2, 0.4], [30, 0]);

  // Phase 3: CTA (50% - 80%)
  const ctaOpacity = useTransform(scrollYProgress, [0.5, 0.7], [0, 1]);

  return (
    <div ref={containerRef} className="relative h-[200vh] bg-black">
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-8">

          <motion.div style={{ opacity: titleOpacity, y: titleY }}>
            <h2 className="text-5xl font-light text-white">Your Title</h2>
            <p className="text-gray-400 text-lg mt-4">Subtitle text here</p>
          </motion.div>

          <motion.div style={{ opacity: contentOpacity, y: contentY }}>
            {/* Cards, images, content */}
          </motion.div>

          <motion.div style={{ opacity: ctaOpacity }}>
            <a href="/contact" className="bg-avoqado-green text-black px-8 py-4 rounded-full">
              Call to Action
            </a>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
```

Astro integration:
```astro
<div class="new-section-wrapper">
  <NewSection client:visible />
</div>
```
