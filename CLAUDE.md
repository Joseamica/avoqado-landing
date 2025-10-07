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

## Notes

- Keep bundle sizes small - use `client:visible` for most React components
- Optimize images (use Astro's Image component)
- Test on real devices for performance
- Ensure accessibility (WCAG 2.1 AA compliance)
