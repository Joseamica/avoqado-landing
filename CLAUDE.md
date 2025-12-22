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
- **Primary:** Urbanist (body text, UI elements)
- **Display:** Baby Doll (hero titles, special headings)
  - Use `font-baby` Tailwind class
  - Font files: `/public/fonts/Baby Doll.otf`, `/public/fonts/Baby Doll.ttf`
  - Does NOT force uppercase

### Colors
- Brand green: `#69E185` (use `text-avoqado-green` class)

### Styling
- Tailwind CSS 4.x utility classes
- Mobile-first responsive design
- Follow design tokens from the dashboard repo for consistency

## Critical Development Practices

### 0. No Emojis

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

**CRITICAL:** When creating scroll-linked animations, follow this exact pattern used throughout the landing page.

### Required Structure

```tsx
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

export default function ScrollytellingComponent() {
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Setup scroll tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]  // IMPORTANT: This exact offset
  });

  // 2. Create transforms linked to scroll progress (0 to 1)
  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1]);
  const titleY = useTransform(scrollYProgress, [0, 0.15], [50, 0]);

  // Staggered animations for multiple items
  const card0Y = useTransform(scrollYProgress, [0.2, 0.35], [80, 0]);
  const card1Y = useTransform(scrollYProgress, [0.25, 0.4], [80, 0]);
  const card2Y = useTransform(scrollYProgress, [0.3, 0.45], [80, 0]);

  return (
    // 3. TALL container (150vh-200vh) for scroll space
    <div ref={containerRef} className="relative h-[180vh] bg-black z-0">

      {/* 4. STICKY viewport that stays in view while scrolling */}
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">

        {/* 5. Animated content using style prop with transforms */}
        <motion.div style={{ opacity: titleOpacity, y: titleY }}>
          <h2>Title animates on scroll</h2>
        </motion.div>

        {cards.map((card, i) => (
          <motion.div
            key={i}
            style={{ y: cardTransforms[i].y, opacity: cardTransforms[i].opacity }}
          >
            {card.content}
          </motion.div>
        ))}

      </div>
    </div>
  );
}
```

### Key Rules

1. **Container height**: Must be tall (`h-[150vh]` to `h-[200vh]`) to provide scroll space
2. **Sticky inner div**: `sticky top-0 h-screen` keeps content visible while scrolling
3. **useScroll offset**: Always use `["start start", "end end"]` for predictable behavior
4. **useTransform ranges**: Map scroll progress (0-1) to animation values
5. **Stagger animations**: Offset the scroll ranges for sequential reveals (e.g., 0.2-0.35, 0.25-0.4, 0.3-0.45)

### Examples in Codebase

- `SquareHero.tsx` - Hero with grid animation
- `ChatbotCTA.tsx` - Input expansion animation
- `PaymentRouting.tsx` - Product grid with connections
- `UnifiedPlatform.tsx` - Radial diagram with electric flow
- `EarlyAccessCTA.tsx` - Staggered card reveals

### Common Mistakes

**DON'T** use `whileInView` for scroll-linked animations - it only triggers once
**DON'T** use `min-h-screen` - not enough scroll space for animations
**DON'T** forget the `sticky` class on the inner viewport
**DON'T** use `offset: ["start end", "end start"]` - this tracks viewport entry/exit, not scroll-through

## Performance & Bundle Size

- Use `client:visible` for most React components (loads when entering viewport)
- Import images from `src/assets/` (processed and optimized by Astro)
- Keep JavaScript minimal - Astro ships 0 KB by default
- Test performance on real devices

## Related Projects

- **Dashboard:** `/Users/amieva/Documents/Programming/Avoqado/avoqado-web-dashboard`
- **Backend (new):** `/Users/amieva/Documents/Programming/Avoqado/avoqado-server`
- **Backend (old):** `/Users/amieva/Documents/Programming/React/avo-pwa/server`
