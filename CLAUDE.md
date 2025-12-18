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

## Performance & Bundle Size

- Use `client:visible` for most React components (loads when entering viewport)
- Import images from `src/assets/` (processed and optimized by Astro)
- Keep JavaScript minimal - Astro ships 0 KB by default
- Test performance on real devices

## Related Projects

- **Dashboard:** `/Users/amieva/Documents/Programming/Avoqado/avoqado-web-dashboard`
- **Backend (new):** `/Users/amieva/Documents/Programming/Avoqado/avoqado-server`
- **Backend (old):** `/Users/amieva/Documents/Programming/React/avo-pwa/server`
