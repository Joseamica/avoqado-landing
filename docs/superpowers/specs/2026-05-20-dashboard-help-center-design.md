# Dashboard Help Center Design

Date: 2026-05-20
Status: Proposed
Scope: Avoqado Dashboard only

## Goal

Create a public `/help` area in the Avoqado landing site that helps merchants use the Avoqado web dashboard. The first release focuses on customer-facing dashboard functionality and avoids internal systems, white-label modules, Android, and TPV app support.

The help center should stay maintainable as the dashboard changes by connecting each article to dashboard routes, feature codes, roles, and a verification date.

## Source Context

The initial Dashboard inventory comes from the sibling repository `../avoqado-web-dashboard`, specifically:

- `src/components/Sidebar/app-sidebar.tsx` for visible navigation and sidebar grouping.
- `src/routes/venueRoutes.tsx` for venue-level dashboard routes.
- `src/routes/router.tsx` for organization and module routes that must be excluded from V1.
- `src/config/feature-registry.ts` for feature codes and descriptions.

## In Scope

V1 includes only the standard venue dashboard experience:

- Inicio
- Ventas
- Menu
- Inventario
- Terminales
- Equipo
- Clientes
- Reportes
- Reservaciones
- Configuracion

V1 should include article metadata, category pages, a dashboard landing page, a simple search experience, and local validation scripts.

## Out of Scope

The first release intentionally excludes:

- Avoqado Android support.
- Avoqado TPV app support.
- PlayTelecom and white-label module-specific help.
- Superadmin and internal operations tools.
- Full ticketing, live chat, community forums, or Zendesk/Intercom integration.
- Automatically writing full articles from code without human review.

## Information Architecture

The public structure is:

```txt
/help
/help/dashboard
/help/dashboard/<category>
/help/dashboard/<category>/<article>
```

The content structure is:

```txt
src/content/help/dashboard/
  inicio/
  ventas/
  menu/
  inventario/
  terminales/
  equipo/
  clientes/
  reportes/
  reservaciones/
  configuracion/
```

Each category page lists articles, highlights common tasks, and provides a route back to `/help/dashboard`.

## Article Metadata

Every article must have frontmatter similar to:

```yaml
title: Crear una liga de pago
description: Aprende a crear y compartir una liga de pago desde el Dashboard.
product: dashboard
category: ventas
featureCode: AVOQADO_PAYMENT_LINKS
dashboardRoutes:
  - payment-links
  - payment-links/settings
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
```

Required fields:

- `title`
- `description`
- `product`
- `category`
- `dashboardRoutes`
- `roles`
- `lastVerified`
- `sourceRepo`

Optional fields:

- `featureCode`
- `relatedArticles`
- `popular`
- `comingSoon`

## Dashboard Inventory Model

The implementation should maintain a generated inventory file derived from `../avoqado-web-dashboard`. A reasonable output path is:

```txt
src/content/help/generated/dashboard-inventory.json
```

The inventory should include:

- Dashboard route path.
- Category inferred from sidebar grouping.
- Feature code when available.
- Permission when available.
- Whether the route is active, hidden, internal, or coming soon.

The generated inventory is a maintenance aid, not the public article source.

## Validation Workflow

Add scripts to the landing project:

```txt
npm run help:inventory
npm run help:check
```

`help:inventory` reads the dashboard repository and updates the generated route/feature inventory.

`help:check` validates:

- Every article references valid dashboard routes unless explicitly marked `comingSoon`.
- Every `featureCode` exists in `feature-registry.ts`.
- Every article has required metadata.
- No article has `lastVerified` older than the configured freshness window.
- No V1 article references Android, TPV app, Superadmin, or PlayTelecom routes.
- Key dashboard categories are not empty.

The freshness window for V1 is 120 days.

## Initial Article Set

The first release should ship with a small set of high-value articles:

- Iniciar sesion en el Dashboard
- Cambiar de sucursal
- Entender el inicio del Dashboard
- Ver pagos
- Ver pedidos
- Crear una liga de pago
- Gestionar productos
- Gestionar terminales
- Ver saldo disponible
- Configurar datos del local

Additional inventory can exist without articles, as long as `help:check` reports gaps instead of failing the build for missing article coverage in V1.

## UI Requirements

The `/help` UI should feel like a support tool, not a marketing page:

- Search is the first action on `/help` and `/help/dashboard`.
- Dashboard categories are compact and scannable.
- Articles prioritize direct task steps over product copy.
- Avoid instructions that depend on fragile visual placement such as "click the blue button in the upper right".
- Use route/function language such as "abre Ventas > Ligas de Pago".
- Include a "last verified" date on article pages.
- Include related articles at the bottom when metadata provides them.

## Error Handling

If content is missing or malformed:

- Build-time validation should fail for invalid required metadata.
- Runtime pages should not crash if optional metadata is absent.
- Empty categories should render a clear empty state in development, but should be avoided in production navigation.

If the dashboard repo is not present locally:

- `help:inventory` should exit with a clear message.
- Existing generated inventory should remain usable for building the landing.

## Testing

Implementation should include:

- TypeScript build for the landing.
- A content validation script test path through `npm run help:check`.
- Basic route smoke checks for `/help`, `/help/dashboard`, one category, and one article.
- Link validation for internal help links.

## Rollout

V1 should be built in phases:

1. Add content schema, routes, layout, and first articles.
2. Add generated dashboard inventory and validation scripts.
3. Add search and related-article behavior.
4. Add CI validation once the local workflow is stable.

Android and TPV app sections can be added later as separate scopes with their own inventories and article metadata.
