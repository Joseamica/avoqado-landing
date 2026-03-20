# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Avoqado Landing Page

Official marketing landing page for Avoqado (avoqado.io) - a multi-sector venue management platform for restaurants, hotels, gyms, retail, and entertainment businesses.

## Tech Stack

- **Framework:** Astro 5.x (SSR mode with Cloudflare adapter)
- **UI Components:** React 19.x (Islands Architecture)
- **Styling:** Tailwind CSS 4.x
- **TypeScript:** Strict mode enabled
- **Integrations:** Sentry, Sitemap, Spotlight
- **Hosting:** Cloudflare Pages

## Development Commands

```bash
npm run dev      # Start dev server at http://localhost:4321
npm run build    # Build for production (outputs to ./dist/)
npm run preview  # Preview production build locally
npm run astro    # Run Astro CLI commands
```

## Why Astro?

This project uses Astro's Islands Architecture:
- Ships 0 KB JavaScript by default
- Static HTML pre-rendering for SEO
- React components load only when needed via `client:*` directives
- SSR mode enabled for API routes (contact form)

## Architecture

**IMPORTANT:** When creating new files/components, re-evaluate the directory structure. The project is organized for scalability with multiple product pages and clear separation of concerns.

```
src/
├── components/
│   ├── layout/          # Navbar, Footer, Layout wrappers
│   ├── sections/        # Full page sections (Hero, Features, etc.)
│   ├── interactive/     # React components (HeroCarousel, ContactForm, etc.)
│   └── ui/              # Reusable UI components (buttons, cards, etc.)
├── pages/
│   ├── index.astro      # Main landing page
│   ├── links.astro      # Links page (served via links.avoqado.io)
│   ├── productos/       # Product pages (tpv.astro, dashboard.astro, qr.astro)
│   └── api/
│       └── contact.ts   # Contact form API endpoint (uses nodemailer)
├── layouts/             # Layout components
├── assets/
│   └── hero/
│       ├── principal/   # Main landing page hero images
│       └── tpv/         # Product-specific hero images
├── styles/              # Global CSS
└── middleware.ts        # Subdomain routing (links.avoqado.io → /links)
```

### Avoqado Products

1. **Avoqado TPV** - Terminal móvil para personal con pagos inteligentes
2. **Dashboard Web** - Plataforma integral con consultor IA integrado
3. **Avoqado QR** - El cliente escanea, escoge y paga en menos de 30 segundos

### Subdomain Routing

The middleware handles subdomain-based routing:
- `links.avoqado.io` → Rewrites to `/links` page
- Main domain serves the standard landing page

Related subdomains (other projects):
- `dashboard.avoqado.io` - Admin dashboard (separate repo)
- `api.avoqado.io` - Backend API (separate repo)

### React Islands

Interactive React components use `client:*` directives to control hydration:
- `client:visible` - Load when entering viewport (recommended default)
- `client:idle` - Load when browser is idle
- `client:load` - Load immediately

Example:
```astro
---
import HeroCarousel from '../components/interactive/HeroCarousel.tsx'
---
<HeroCarousel client:visible slides={tpvSlides} />
```

## Design System

### Fonts
- **Primary:** DM Sans — used for ALL text: headings, body, UI elements
  - Headings: light/medium weight (300-500), large sizes, tight tracking — Square-style
  - Body: regular weight (400), relaxed line-height
- **Editorial accent:** Playfair Display italic — used sparingly for special editorial moments only
- **Brand mark only:** Baby Doll (`font-baby` class) — reserved EXCLUSIVELY for the Avoqado logo/brand mark. NEVER use for page headings or section titles.
  - Font files: `/public/fonts/Baby Doll.otf`, `/public/fonts/Baby Doll.ttf`
- **DO NOT USE:** Urbanist (legacy, not loaded), Inter (removed from primary use)

### Colors — OKLCH System (defined in global.css)
- **Primary green**: `oklch(0.78 0.18 155)` — 5 shades (light, base, muted, dark, subtle)
- **Neutrals**: Green-tinted (hue 155, chroma 0.005-0.007) — 11 stops from 950 to 50
- **Surfaces**: 4 elevation levels (surface-0 through surface-3)
- **Semantic**: success (green), error (coral), warning (amber), info (blue)
- **Product accents**: dashboard (blue 240), tpv (green 155), pos (indigo 290), qr (amber 75)
- Use Tailwind classes: `text-avoqado-green`, `bg-avoqado-dark-bg`, `bg-avoqado-dark-surface`
- For new elements, prefer CSS custom properties: `var(--color-neutral-600)`, `var(--color-surface-2)`
- NEVER use pure gray (chroma 0) or pure black (#000) — always tint toward hue 155

### Styling
- Tailwind CSS 4.x utility classes
- Mobile-first responsive design
- Follow design tokens from the dashboard repo for consistency

## Critical Development Practices

### 0. Responsive Design - ALWAYS Consider All Device Sizes

**CRITICAL:** Every CSS change, fix, or new feature MUST be tested and considered across ALL device sizes. A fix that works on mobile can completely break desktop (and vice versa).

#### The Golden Rule
```
Before applying ANY CSS change, ask:
1. Does this affect mobile? (< 768px)
2. Does this affect tablet? (768px - 1023px)
3. Does this affect desktop? (>= 1024px)
4. Should this change be scoped to specific breakpoints?
```

#### Use Tailwind Responsive Prefixes
```tsx
// BAD - Applies to ALL screen sizes
className="overflow-hidden"

// GOOD - Only applies overflow-hidden on mobile, visible on desktop
className="overflow-hidden lg:overflow-visible"

// GOOD - Different behavior per breakpoint
className="w-full md:w-1/2 lg:w-1/3"
```

#### Use CSS Media Queries for Global Styles
```css
/* BAD - Affects all devices */
body {
  overflow-x: hidden;
  position: relative;
}

/* GOOD - Only affects mobile */
@media (max-width: 1023px) {
  body {
    overflow-x: hidden;
    overscroll-behavior-x: none;
  }
}
```

#### iOS-Specific Gotchas
- `100vw` includes scrollbar width - can cause horizontal overflow
- `position: relative` on body interferes with `fixed` children
- `translate-x` transforms can create scrollable areas even with `overflow: hidden`
- `visibility: hidden` is better than `translate` for hiding off-screen elements
- Always test in Safari/Chrome on actual iOS devices

#### Mandatory Testing Checklist
Before considering any UI change complete:
- [ ] Test on mobile (use Chrome DevTools, 375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1280px+ width)
- [ ] Test pinch-zoom on mobile - no horizontal overflow should appear
- [ ] Verify fixed elements (navbar, floating buttons) work correctly

### 0.1 Modals/Dialogs - NEVER Break Scrollytelling

**CRITICAL:** This project uses scroll-based animations (scrollytelling). Modals and dialogs MUST NOT interfere with scroll position or scroll-based animations.

#### The Problem
When opening a modal, the common approach is `document.body.style.overflow = 'hidden'`. **DO NOT USE THIS** - it resets internal scroll calculations and breaks all scroll-based animations (SquareHero, UnifiedPlatform, FAQ, etc.).

#### The Solution - Use Position Fixed Pattern
```tsx
// Save scroll position and lock body in place
const scrollY = window.scrollY;
document.body.style.position = 'fixed';
document.body.style.top = `-${scrollY}px`;
document.body.style.left = '0';
document.body.style.right = '0';

// On close - restore scroll position
const savedScrollY = document.body.style.top;
document.body.style.position = '';
document.body.style.top = '';
document.body.style.left = '';
document.body.style.right = '';
window.scrollTo(0, parseInt(savedScrollY || '0') * -1);
```

#### Additional Modal Requirements
1. **Use React Portal**: Render modals in `document.body` via `createPortal` to escape any parent `transform` that would break `position: fixed`.
2. **Reference Implementation**: See `DemoDialog.tsx` for the correct pattern.
3. **Test After Changes**: Open modal → close modal → verify scrollytelling animations still work correctly.

### 1. No Emojis

**NEVER use emojis in code, UI, or content.** Keep the design clean and professional.

- No emojis in component text, labels, or buttons
- No emojis in comments or documentation
- Use icons (SVG/Lucide) instead when visual indicators are needed

### 1. Show, Don't Tell - Visual Design Options

**CRITICAL:** When the user requests design changes or doesn't like something, ALWAYS implement visual alternatives instead of describing options.

**❌ Bad:**
```
User: "I don't like this green background"
Assistant: "I can offer you 3 options:
  Option 1: Light background with green border
  Option 2: Orange accent instead
  Option 3: Dark background with subtle border
Which would you prefer?"
```

**✅ Good:**
```
User: "I don't like this green background"
Assistant: "Let me show you 3 visual alternatives"
[Implements all 3 options so user sees them live in the browser]
Assistant: "I've implemented 3 options - check them out and let me know which you prefer"
```

**Why:** The user learns and decides faster by seeing actual implementations rather than reading descriptions.

### 2. Component Reusability

Always create generic, reusable components that accept props instead of duplicating code.

**❌ Bad:**
```tsx
// Three separate carousel components with hardcoded content
HeroCarousel.tsx, TpvCarousel.tsx, DashboardCarousel.tsx
```

**✅ Good:**
```tsx
// One generic carousel component
HeroCarousel.tsx (accepts slides as props)

// Usage in different pages
<HeroCarousel slides={tpvSlides} aspectRatio="3/4" />
<HeroCarousel slides={dashboardSlides} />
```

Before creating a new component, check if existing components can be made more generic.

### 3. Asset Organization

Images are organized by feature and product:
```
src/assets/hero/
├── principal/   # Main landing page
├── tpv/         # TPV product page
├── dashboard/   # Dashboard product page
└── qr/          # QR product page
```

When adding new images, follow this pattern and create subdirectories as needed.

## Scrollytelling Animation Pattern

**CRITICAL:** Full documentation in [`docs/scrollytelling-guide.md`](docs/scrollytelling-guide.md). Read it before creating or modifying any scroll-linked animation.

### Quick Reference

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const { scrollYProgress } = useScroll({
  target: containerRef,
  offset: ["start start", "end end"]  // ALWAYS this exact offset
});
const opacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);

<div ref={containerRef} className="relative h-[200vh] bg-black">
  <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center justify-center">
    <motion.div style={{ opacity }}>Content</motion.div>
  </div>
</div>
```

### Key Rules

1. **framer-motion MUST be pinned to `12.23.26`** — newer versions have WAAPI ScrollTimeline bug that breaks `useScroll({ target })`
2. **Container**: `relative h-[Xvh]` — height 150-300vh. More height = slower/cinematic scroll
3. **Sticky viewport**: `sticky top-16 h-[calc(100vh-4rem)]` — stays visible below navbar
4. **useScroll offset**: Always `["start start", "end end"]`
5. **Stagger**: Offset ranges by +0.015 to +0.05 per item for sequential reveals
6. **Never use** `whileInView` for scroll-linked animations (only triggers once)
7. **Never use** `overflow: hidden` on body for modals (breaks scroll calculations)
8. **SVG animate={{ d }}**: Always add `initial={false}` to prevent `<path d="undefined">` errors

### Existing Scrollytelling Components

| Component | Height | Key Animation |
|---|---|---|
| `SquareHero.tsx` | 180vh | Video shrinks to grid, items stagger in |
| `ChatbotCTA.tsx` | 300vh | Title, input expands, suggestion chips |
| `PaymentRouting.tsx` | 300vh | Cards stagger, connection lines draw |
| `UnifiedPlatform.tsx` | 300vh | Radial diagram with electric connections |
| `EarlyAccessCTA.tsx` | 200vh | Counter, benefits, CTA sequential reveal |
| `FAQ.tsx` | 300vh | Text writes in, arrow draws, circle scribbles |

### Animation Recipes (see full guide for code)

- **Fade + Slide Up** — opacity + y transform
- **Staggered List** — index-based offset per item
- **Width Expansion** — width + scale + opacity
- **SVG Path Drawing** — pathLength + opacity
- **Text Writing Reveal** — width mask over hidden text
- **Blur Fade (Cinematic)** — opacity + y + filter blur chain
- **Animated Counter** — useMotionValue + useSpring
- **Hero Shrink-to-Grid** — scale + x + y + borderRadius

## Performance & Bundle Size

- Use `client:visible` for most React components (loads when entering viewport)
- Import images from `src/assets/` (processed and optimized by Astro)
- Keep JavaScript minimal - Astro ships 0 KB by default
- Test performance on real devices

## Design Context

### Users
Venue owners and operators across Mexico — restaurants, hotels, gyms, retail stores, and entertainment businesses. They are business-focused, not technical. They visit avoqado.io to evaluate a payments and management platform. Their context: they're busy, often on mobile, comparing options, and need to quickly understand what Avoqado does and why it's better than their current setup.

### Brand Personality
**Modern, Premium, Approachable**

- **Modern**: Dark-first aesthetic, scroll-driven animations, cinematic product reveals
- **Premium**: Stripe/Square-tier polish. Every pixel earns trust. No shortcuts, no stock photos, no template energy
- **Approachable**: Warm enough for a restaurant owner who isn't technical. Clear language (Spanish), intuitive hierarchy, never intimidating

### Emotional Goals
1. **Excitement & possibility** — "This will transform how I run my business"
2. **Confidence & trust** — "This is serious, reliable technology"
3. **Relief & simplicity** — "Finally, something that just works"

### Design Principles
1. **Show, don't tell** — Demonstrate through animation and real imagery, not text blocks
2. **Cinematic scroll** — Scroll-linked animations build narrative. Each section is a scene.
3. **Premium simplicity** — Every element earns its place. Generous spacing, clear hierarchy, no clutter.
4. **Trust through craft** — Pixel-perfect alignment, smooth 60fps animations, consistent tokens.
5. **Accessible premium** — WCAG-compliant contrast, focus-visible styles, reduced-motion support.

### Device Frame Mockups

When showing product UI mockups, ALWAYS use the appropriate device frame:

| Context | Frame | Example |
|---|---|---|
| **Dashboard, Widget, Checkout, Ligas de Pago** | Browser frame (3 dots + URL bar + lock icon) | `dashboard.avoqado.io`, `pay.avoqado.io/l/...`, `misushi.com.mx` |
| **POS, Kiosko, apps de tableta** | iPad/tablet CSS frame (silver gradient shell + black bezel + camera dot) | Floor plan, catalogo, turnos |
| **QR, pagos del celular, apps moviles** | iPhone CSS frame (titanium shell + Dynamic Island + home indicator) | QR scan, split cuenta, pago |
| **TPV terminal** | Real PAX image (`pax-frontal.png`) with UI overlay | Menu, orden, cobro |

Rules:
- Browser frame: dark chrome (`oklch(0.14)`) with dots + URL bar showing the actual domain
- iPad frame: silver gradient shell with rounded corners, black inner bezel, camera dot top-center
- iPhone frame: dark titanium gradient shell, Dynamic Island (pill with camera dot), home indicator bar at bottom
- TPV: Use the real PAX A920 Pro image with transparent screen, UI rendered behind at z-5

### Section Background Alternation Pattern

Product pages and detail pages MUST alternate section backgrounds between dark and light to create visual rhythm and prevent monotony:

- **Odd sections** (1st, 3rd, 5th): Dark background (`bg-black` or dark surface)
- **Even sections** (2nd, 4th, 6th): White background (`bg-white`) with `light={true}` and `reversed={true}` on ProductSection

On `/productos`, the 6 products follow this pattern:
| Product | BG | Layout |
|---|---|---|
| 01 Dashboard | Dark | text-left, mockup-right |
| 02 TPV | White | reversed (mockup-left, text-right) |
| 03 POS | Dark | text-left, mockup-right |
| 04 QR | White | reversed |
| 05 IA | Dark | text-left, mockup-right |
| 06 Widget | White | reversed |

Detail pages (`/productos/dashboard`, `/productos/tpv`, etc.) also alternate section backgrounds using `border-t border-white/5` (dark) or `border-t border-black/5` (light) as separators.

### Anti-References
- Generic SaaS templates with stock photos
- Enterprise/corporate stiff blue-gray software
- Overly playful/cartoon with mascots
- Cluttered/information-heavy layouts

## Related Projects

- **Dashboard:** `/Users/amieva/Documents/Programming/Avoqado/avoqado-web-dashboard`
- **Backend (new):** `/Users/amieva/Documents/Programming/Avoqado/avoqado-server`
- **Backend (old):** `/Users/amieva/Documents/Programming/React/avo-pwa/server`
