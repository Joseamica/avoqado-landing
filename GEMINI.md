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
