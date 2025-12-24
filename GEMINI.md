# Avoqado Landing Page Context

This file provides context for Gemini when working on the Avoqado Landing Page project.

## Project Overview

Avoqado Landing Page is the official marketing site for Avoqado (avoqado.io), a multi-sector venue management platform. It showcases products like the Mobile POS (TPV), Web Dashboard, and QR Payment solutions.

-   **Type:** Web Application (Landing Page)
-   **Framework:** Astro 5.x (SSR with Cloudflare adapter)
-   **UI Library:** React 19.x (used via Astro Islands architecture)
-   **Styling:** Tailwind CSS 4.x
-   **Language:** TypeScript (Strict mode)
-   **Hosting:** Cloudflare Pages

## Architecture & Directory Structure

The project uses Astro's file-based routing and Islands Architecture to maximize performance (0KB JS by default).

```text
/
├── public/              # Static assets (fonts, icons, robots.txt)
│   ├── fonts/           # Custom fonts (Baby Doll)
│   └── _routes.json     # Cloudflare routing config
├── src/
│   ├── assets/          # Optimized images (organized by feature/product)
│   │   ├── hero/        # Hero section images
│   │   └── ...
│   ├── components/
│   │   ├── interactive/ # React components (require client hydration)
│   │   ├── layout/      # Astro layout components (Navbar, Footer, SEO)
│   │   ├── sections/    # Full-width page sections (Hero, Features, Pricing)
│   │   └── ui/          # Primitive UI components (Button, Icon)
│   ├── layouts/         # Page wrappers (Layout.astro)
│   ├── middleware.ts    # Request handling (e.g., subdomain routing)
│   ├── pages/           # Route definitions
│   │   ├── api/         # Server-side API endpoints (e.g., contact form)
│   │   ├── products/    # Product specific landing pages
│   │   ├── index.astro  # Main homepage
│   │   └── links.astro  # Link-in-bio page (links.avoqado.io)
│   └── styles/          # Global styles (Tailwind imports)
├── astro.config.mjs     # Astro configuration (Integrations, Adapter)
└── package.json         # Dependencies and scripts
```

## Building and Running

| Command           | Description                                      |
| :---------------- | :----------------------------------------------- |
| `npm run dev`     | Start local development server (`localhost:4321`) |
| `npm run build`   | Build for production (output to `./dist/`)       |
| `npm run preview` | Preview the production build locally             |
| `npm run astro`   | Run Astro CLI commands                           |

## Key Development Guidelines

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
```

#### Use CSS Media Queries for Global Styles
```css
/* BAD - Affects all devices */
body { overflow-x: hidden; }

/* GOOD - Only affects mobile */
@media (max-width: 1023px) {
  body { overflow-x: hidden; }
}
```

#### iOS-Specific Gotchas
- `100vw` includes scrollbar width - causes horizontal overflow
- `position: relative` on body interferes with `fixed` children
- `translate-x` transforms create scrollable areas even with `overflow: hidden`
- Use `visibility: hidden` instead of just `translate` for hiding off-screen elements

#### Mandatory Testing
Before any UI change is complete:
- Test on mobile (375px), tablet (768px), and desktop (1280px+)
- Test pinch-zoom on mobile - no horizontal overflow should appear
- Verify fixed elements (navbar, floating buttons) work correctly

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

### 1. Visual Design & "Show, Don't Tell"
**CRITICAL:** When suggesting design changes or alternatives, **implement them visually** instead of describing them in text.
-   **Do not ask:** "Would you prefer a dark mode?"
-   **Do:** Implement the dark mode version and say, "I've applied a dark theme option, let me know if you prefer this."

-   **Do:** Implement the dark mode version and say, "I've applied a dark theme option, let me know if you prefer this."

### 2. Preferred Architecture: Scrollytelling
Based on `scrollytelling.astro`, new complex pages should follow this pattern:
-   **Structure:** Astro Page as orchestrator -> React Islands as Sections.
-   **Styling:** `bg-black` default, premium aesthetic.
-   **Navbar:** `<Navbar position="fixed" transparentOnTop={true} />`.
-   **Animation:** Use simple `IntersectionObserver` script for fade-ins.
    -   Tag elements with `data-animate-on-scroll`.
    -   Initial state: `opacity-0 translate-y-20`.
    -   Target state: `opacity-100 translate-y-0`.

### 3. React Islands & Hydration
Use React components only when interactivity is required. Control hydration using directives:
-   `client:visible`: Load when component enters viewport (Default preference).
-   `client:idle`: Load when browser is idle.
-   `client:load`: Load immediately (use sparingly).
-   **Example:** `<HeroCarousel client:visible slides={...} />`

### 3. Component Reusability
Prioritize creating generic, configurable components over specific ones.
-   **Good:** `HeroCarousel.tsx` accepting `slides` prop.
-   **Bad:** `TpvCarousel.tsx`, `DashboardCarousel.tsx` with hardcoded content.

### 4. Design System
-   **Font Primary:** Urbanist (Body, UI).
-   **Font Display:** Baby Doll (Headings, use `font-baby` class).
-   **Brand Color:** Avoqado Green (`#69E185`, `text-avoqado-green`).
-   **Styling:** Use Tailwind CSS utility classes. Mobile-first approach.

## Routing & Middleware
The `src/middleware.ts` handles advanced routing logic, specifically for subdomains:
-   `links.avoqado.io` requests are rewritten to render the `/links` page.
-   The main domain serves standard content.

## Related Projects
-   **Dashboard:** `avoqado-web-dashboard` (Admin interface)
-   **Backend:** `avoqado-server` (API)

## Recent Implementations (Dec 2025)

### Header Behavior ("Square-style")
-   **Dynamic States:**
    1.  **Top:** Transparent BG, White Text, Full Content.
    2.  **Scrolling:** Hidden (translated up).
    3.  **Chatbot/Bottom:** White BG, Black Text, Simplified Content (No center links).
-   **Technical implementation:**
    -   Javascript logic in `Navbar.astro` observes `ChatbotCTA` section.
    -   **Logo:** Explicitly swaps `imagotipo-white.png` <-> `imagotipo.png` to avoid color inversion issues.
    -   **Styling:** Uses Tailwind `group-[.white-nav]` modifiers for conditional styling based on parent class.

### Contact Page
-   **Path:** `/contact` (Independent of main landing logic).
-   **Design:** Clean, white background, split layout.
-   **Forms:** `ContactSalesForm.tsx` (React).
-   **Styling Note:** Global styles (`global.css`) force white text by default. Any white-background page MUST explicitly override text colors (e.g., `!text-black`, `text-gray-900`) on headings and inputs to be visible.
