# Avoqado Landing Page

This is the official landing page for Avoqado (avoqado.io) - a modern restaurant management platform.

## Project Overview

**Purpose:** Marketing landing page to showcase Avoqado's features, pricing, and value proposition.

**Tech Stack:**
- **Framework:** Astro 5.x (content-first static site generator)
- **UI Components:** React 19.x (for interactive islands)
- **Styling:** Tailwind CSS 4.x
- **TypeScript:** Strict mode enabled
- **Hosting:** Cloudflare Pages (planned)

## Why Astro?

Astro was chosen for this landing page because:
1. **Performance-first:** Ships 0 KB JavaScript by default, only loads JS where needed
2. **SEO-optimized:** Static HTML pre-rendering ensures perfect SEO
3. **React Islands:** Use React components for interactive parts (calculators, forms, animations)
4. **Flexibility:** Can add Vue, Svelte, or other frameworks if needed
5. **Developer Experience:** Similar to React but optimized for content sites

## Architecture

### File Organization

**IMPORTANT:** Every time a new file/component is created, re-evaluate the directory structure and organization. The project should scale to support:
- Multiple pages per section
- Dedicated pages for each main Avoqado product
- Clear separation of concerns

Current structure:
```
src/
├── components/
│   ├── layout/          # Navbar, Footer, Layout wrappers
│   ├── sections/        # Full page sections (Hero, Features, etc.)
│   ├── interactive/     # React components with state/interactivity
│   ├── productos/       # Product-specific components
│   └── ui/              # Reusable UI components (buttons, cards, etc.)
├── pages/
│   ├── index.astro      # Main landing page
│   ├── productos/
│   │   ├── index.astro  # Products overview
│   │   ├── tpv.astro    # Avoqado TPV (terminal móvil)
│   │   ├── dashboard.astro  # Dashboard Web (con IA)
│   │   └── qr.astro     # Avoqado QR (pago en 30s)
│   ├── precios.astro
│   ├── casos-de-exito.astro
│   └── api/
│       └── contact.ts   # Contact form API endpoint
├── assets/              # Images, fonts (processed by Astro)
└── styles/              # Global CSS, theme tokens
```

### Avoqado Products

The platform consists of 3 main products:

1. **Avoqado TPV** - Terminal móvil para personal con pagos inteligentes
2. **Dashboard Web** - Plataforma integral con consultor IA integrado
3. **Avoqado QR** - El cliente escanea, escoge y paga en menos de 30 segundos

### Page Structure
- **Hero Section:** First impression, main value proposition
- **Features:** Key platform capabilities
- **Pricing:** Plans and pricing calculator (interactive React component)
- **Demo/Screenshots:** Product showcase
- **Testimonials:** Social proof
- **CTA/Contact:** Lead capture form

### Interactive Components (React Islands)
Use the `client:*` directives to control when React components load:
- `client:load` - Load immediately on page load
- `client:idle` - Load when browser is idle
- `client:visible` - Load when component enters viewport (recommended for most)
- `client:only` - Only render on client (not during build)

Example:
```astro
---
import PricingCalculator from '../components/PricingCalculator.tsx'
---
<PricingCalculator client:visible />
```

### Styling Guidelines
- Use Tailwind CSS utility classes
- Follow the same design tokens as the dashboard (avoqado-web-dashboard)
- Ensure responsive design (mobile-first)
- Support light/dark mode if applicable

### Animations
- Use Framer Motion for scroll animations
- Use Astro View Transitions for page transitions
- Keep animations performant and purposeful

## Development Commands

- `npm run dev` - Start dev server at http://localhost:4321
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

## Related Projects

- **Dashboard:** `/Users/amieva/Documents/Programming/Avoqado/avoqado-web-dashboard` - Main admin dashboard
- **Backend (old):** `/Users/amieva/Documents/Programming/React/avo-pwa/server` - Legacy API server
- **Backend (new):** `/Users/amieva/Documents/Programming/Avoqado/avoqado-server` - New TypeScript backend

## DNS & Hosting Setup

- **Domain:** avoqado.io
- **DNS:** Route 53 (AWS)
- **CDN/Proxy:** Cloudflare
- **Hosting:** Cloudflare Pages (to be configured)

### Subdomain Structure
- `avoqado.io` - This landing page
- `dashboard.avoqado.io` - Admin dashboard
- `bills.avoqado.io` - Bill/receipt viewer (old frontend)
- `api.avoqado.io` - Backend API

## Content Guidelines

- **Tone:** Professional, modern, approachable
- **Audience:** Restaurant owners, managers
- **Focus:** Showcase how Avoqado simplifies restaurant operations
- **CTA:** Drive sign-ups for demos or trials

## Future Enhancements

- [ ] Add blog/resources section
- [ ] Implement lead capture forms
- [ ] Add live chat widget
- [ ] Integrate analytics (Google Analytics, etc.)
- [ ] A/B testing for conversion optimization
- [ ] Multi-language support (ES/EN)

## Best Practices

### Design Decisions & Visual Options
**IMPORTANT:** When proposing design changes or alternatives, ALWAYS implement them visually so the user can see them in the browser, rather than just describing them.

**Bad approach:**
```
User: "I don't like this green background"
Assistant: "I can offer you 3 options:
  Option 1: Light background with green border
  Option 2: Orange accent instead
  Option 3: Dark background with subtle border
Which would you prefer?"
```

**Good approach:**
```
User: "I don't like this green background"
Assistant: "Let me show you 3 visual options"
[Implements all 3 options in the actual code so user can see them live]
Assistant: "I've created the 3 options - you can now see them on the page. Which one do you prefer?"
```

The user prefers to see visual examples rather than theoretical descriptions. This allows for faster iteration and better decision-making.

### Component Reusability
**IMPORTANT:** Always create reusable components instead of duplicating code.

**Bad Example:**
```
HeroCarousel.tsx (hardcoded slides)
TpvCarousel.tsx (duplicate with different slides)
DashboardCarousel.tsx (duplicate with different slides)
```

**Good Example:**
```tsx
// Generic component
HeroCarousel.tsx (accepts slides as props)

// Usage
<HeroCarousel slides={tpvSlides} aspectRatio="3/4" />
<HeroCarousel slides={dashboardSlides} />
```

### Asset Organization
Organize images by context and feature:
```
src/assets/
├── hero/
│   ├── principal/     # Landing page hero images
│   ├── tpv/          # TPV product hero images
│   ├── dashboard/    # Dashboard product hero images
│   └── qr/           # QR product hero images
├── features/
│   └── ...
└── logos/
    └── ...
```

## Notes

- Keep bundle sizes small - use `client:visible` for most React components
- Optimize images (use Astro's Image component or import from assets/)
- Test on real devices for performance
- Ensure accessibility (WCAG 2.1 AA compliance)
- **Always check for reusability** before creating new components

## Design System

### Fonts
- **Primary:** Urbanist (body text, UI elements)
- **Display:** Baby Doll (hero titles, special headings)
  - Use `font-baby` Tailwind class
  - Font files in `/public/fonts/`
  - Note: Does NOT force uppercase (removed as per user request)

### Custom Tailwind Classes
- `font-baby` - Baby Doll font family
- `text-avoqado-green` - Brand green color (#69E185)
