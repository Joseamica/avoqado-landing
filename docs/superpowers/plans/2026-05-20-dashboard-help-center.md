# Dashboard Help Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Dashboard-only `/help` support area in the Avoqado landing site with structured articles, dashboard categories, search, and validation against the dashboard repo.

**Architecture:** Use Astro content collections for human-authored help articles, static Astro routes for `/help`, `/help/dashboard`, categories, and article pages, plus small Node scripts that inventory and validate references to `../avoqado-web-dashboard`. Phase 1 ships a useful public help center; Phase 2 adds route/feature validation without blocking the first usable release.

**Tech Stack:** Astro 5, Astro content collections, Markdown, React 18 for client-side search, Node ESM scripts, Tailwind CSS utilities already used by the landing.

---

## GStack Scope Review

`gstack-plan-eng-review` flagged the main execution risk: doing UI, content, search, inventory generation, validation, and CI in one pass would touch many files and make the first release harder to verify. The plan keeps a usable Phase 1 and moves generated inventory checks into Phase 2.

```
Phase 1: content schema + help UI + first articles
Phase 2: generated inventory + metadata validator
Phase 3: search polish after local validation is stable
```

## File Structure

Create:

- `src/content.config.ts` defines the `help` content collection schema.
- `src/lib/help.ts` owns category metadata, article URL helpers, sorting, and collection filtering.
- `src/components/help/HelpSearch.tsx` filters help articles on the client.
- `src/pages/help.astro` renders the support entry point.
- `src/pages/help/dashboard.astro` renders the Dashboard help landing page.
- `src/pages/help/dashboard/[category].astro` renders a category page.
- `src/pages/help/dashboard/[category]/[slug].astro` renders an article page.
- `src/content/help/dashboard/**.md` stores first human-written articles.
- `src/content/help/generated/dashboard-inventory.json` stores generated Dashboard inventory.
- `scripts/help-inventory.mjs` generates the inventory from `../avoqado-web-dashboard`.
- `scripts/help-check.mjs` validates metadata and route/feature references.

Modify:

- `package.json` adds `help:inventory` and `help:check`.

Do not modify dashboard repo files in this plan.

## Category Model

Use these Dashboard categories in V1:

```ts
export const DASHBOARD_HELP_CATEGORIES = [
  { slug: 'inicio', title: 'Inicio', description: 'Primeros pasos, sucursales y resumen del negocio.' },
  { slug: 'ventas', title: 'Ventas', description: 'Pagos, pedidos y ligas de pago.' },
  { slug: 'menu', title: 'Menu', description: 'Productos, categorias, servicios y modificadores.' },
  { slug: 'inventario', title: 'Inventario', description: 'Existencias, ingredientes, recetas y proveedores.' },
  { slug: 'terminales', title: 'Terminales', description: 'Activacion, estado y administracion de TPVs.' },
  { slug: 'equipo', title: 'Equipo', description: 'Miembros, turnos y comisiones.' },
  { slug: 'clientes', title: 'Clientes', description: 'Clientes, grupos, lealtad, resenas y promociones.' },
  { slug: 'reportes', title: 'Reportes', description: 'Saldo disponible, ventas y reportes operativos.' },
  { slug: 'reservaciones', title: 'Reservaciones', description: 'Reservas, calendario, lista de espera y canales online.' },
  { slug: 'configuracion', title: 'Configuracion', description: 'Local, integraciones, permisos, facturacion y notificaciones.' },
] as const
```

## Task 1: Content Collection And Helpers

**Files:**
- Create: `src/content.config.ts`
- Create: `src/lib/help.ts`

- [ ] **Step 1: Create the Astro content collection schema**

Create `src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

const help = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/help' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    product: z.literal('dashboard'),
    category: z.enum([
      'inicio',
      'ventas',
      'menu',
      'inventario',
      'terminales',
      'equipo',
      'clientes',
      'reportes',
      'reservaciones',
      'configuracion',
    ]),
    featureCode: z.string().optional(),
    dashboardRoutes: z.array(z.string()),
    roles: z.array(z.enum(['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'WAITER', 'HOST', 'VIEWER'])),
    lastVerified: z.date(),
    sourceRepo: z.literal('avoqado-web-dashboard'),
    relatedArticles: z.array(z.string()).optional(),
    popular: z.boolean().optional(),
    comingSoon: z.boolean().optional(),
  }),
})

export const collections = { help }
```

- [ ] **Step 2: Create help helpers**

Create `src/lib/help.ts`:

```ts
import type { CollectionEntry } from 'astro:content'

export type HelpArticle = CollectionEntry<'help'>

export const DASHBOARD_HELP_CATEGORIES = [
  { slug: 'inicio', title: 'Inicio', description: 'Primeros pasos, sucursales y resumen del negocio.' },
  { slug: 'ventas', title: 'Ventas', description: 'Pagos, pedidos y ligas de pago.' },
  { slug: 'menu', title: 'Menu', description: 'Productos, categorias, servicios y modificadores.' },
  { slug: 'inventario', title: 'Inventario', description: 'Existencias, ingredientes, recetas y proveedores.' },
  { slug: 'terminales', title: 'Terminales', description: 'Activacion, estado y administracion de TPVs.' },
  { slug: 'equipo', title: 'Equipo', description: 'Miembros, turnos y comisiones.' },
  { slug: 'clientes', title: 'Clientes', description: 'Clientes, grupos, lealtad, resenas y promociones.' },
  { slug: 'reportes', title: 'Reportes', description: 'Saldo disponible, ventas y reportes operativos.' },
  { slug: 'reservaciones', title: 'Reservaciones', description: 'Reservas, calendario, lista de espera y canales online.' },
  { slug: 'configuracion', title: 'Configuracion', description: 'Local, integraciones, permisos, facturacion y notificaciones.' },
] as const

export type DashboardHelpCategory = (typeof DASHBOARD_HELP_CATEGORIES)[number]['slug']

export function getHelpCategory(slug: string) {
  return DASHBOARD_HELP_CATEGORIES.find(category => category.slug === slug)
}

export function getArticleSlug(article: HelpArticle) {
  const parts = article.id.split('/')
  return parts[parts.length - 1]?.replace(/\.md$/, '') ?? article.id
}

export function getArticleUrl(article: HelpArticle) {
  return `/help/dashboard/${article.data.category}/${getArticleSlug(article)}`
}

export function sortHelpArticles(articles: HelpArticle[]) {
  return [...articles].sort((a, b) => {
    if (a.data.popular && !b.data.popular) return -1
    if (!a.data.popular && b.data.popular) return 1
    return a.data.title.localeCompare(b.data.title, 'es')
  })
}

export function toSearchItem(article: HelpArticle) {
  return {
    title: article.data.title,
    description: article.data.description,
    category: article.data.category,
    url: getArticleUrl(article),
    popular: Boolean(article.data.popular),
  }
}
```

- [ ] **Step 3: Run build to verify schema file is accepted**

Run:

```bash
npm run build
```

Expected: build fails only because there are no `help` entries yet or passes if Astro accepts the empty collection. If it fails on `content.config.ts` syntax or imports, fix the exact schema/import error before continuing.

## Task 2: Seed Dashboard Help Articles

**Files:**
- Create: `src/content/help/dashboard/inicio/iniciar-sesion.md`
- Create: `src/content/help/dashboard/inicio/cambiar-sucursal.md`
- Create: `src/content/help/dashboard/inicio/entender-inicio-dashboard.md`
- Create: `src/content/help/dashboard/ventas/ver-pagos.md`
- Create: `src/content/help/dashboard/ventas/ver-pedidos.md`
- Create: `src/content/help/dashboard/ventas/crear-liga-pago.md`
- Create: `src/content/help/dashboard/menu/gestionar-productos.md`
- Create: `src/content/help/dashboard/terminales/gestionar-terminales.md`
- Create: `src/content/help/dashboard/reportes/ver-saldo-disponible.md`
- Create: `src/content/help/dashboard/configuracion/configurar-datos-local.md`

- [ ] **Step 1: Create the first article**

Create `src/content/help/dashboard/ventas/crear-liga-pago.md`:

```md
---
title: Crear una liga de pago
description: Aprende a crear y compartir una liga de pago desde el Dashboard.
product: dashboard
category: ventas
featureCode: AVOQADO_PAYMENT_LINKS
dashboardRoutes:
  - payment-links
  - payment-links/settings
  - payment-links/branding
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
relatedArticles:
  - ver-pagos
  - configurar-datos-local
---

## Antes de empezar

Necesitas acceso al Dashboard y permiso para usar **Ventas > Ligas de Pago**. Si no ves esta seccion, pide a un administrador que revise tus permisos.

## Crear la liga

1. Abre el Dashboard.
2. Entra a **Ventas > Ligas de Pago**.
3. Crea una nueva liga.
4. Captura el concepto, monto y descripcion.
5. Guarda la liga.
6. Copia el enlace o compartelo por WhatsApp.

## Configurar marca y ajustes

Usa **Ventas > Ligas de Pago > Ajustes generales** para revisar comportamiento general de cobro. Usa **Ventas > Ligas de Pago > Marca** para ajustar la presentacion publica de las ligas.

## Si algo no aparece

Verifica que tu local ya pueda aceptar pagos y que la funcion de ligas de pago este activa para tu cuenta.
```

- [ ] **Step 2: Create remaining articles using the same metadata shape**

Create the remaining nine files with these exact frontmatter values and concise task-focused bodies:

```md
---
title: Iniciar sesion en el Dashboard
description: Entra al Dashboard de Avoqado con tu cuenta de usuario.
product: dashboard
category: inicio
dashboardRoutes:
  - login
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - CASHIER
  - WAITER
  - HOST
  - VIEWER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Entrar al Dashboard

1. Abre la URL del Dashboard.
2. Escribe tu correo y contrasena.
3. Confirma que estas en la sucursal correcta.

## Si no puedes entrar

Usa la recuperacion de contrasena o pide a un administrador que confirme que tu usuario sigue activo.
```

```md
---
title: Cambiar de sucursal
description: Cambia entre los locales asignados a tu usuario.
product: dashboard
category: inicio
dashboardRoutes:
  - home
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - VIEWER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Cambiar sucursal

1. Abre el selector de sucursales del Dashboard.
2. Selecciona el local que quieres revisar.
3. Confirma que el menu lateral y los reportes cambiaron al local elegido.

## Cuando no ves una sucursal

Tu usuario necesita estar asignado a esa sucursal. Pide a un OWNER o ADMIN que revise tu acceso.
```

```md
---
title: Entender el inicio del Dashboard
description: Revisa ventas, liquidacion, acciones rapidas y resumen del negocio.
product: dashboard
category: inicio
featureCode: AVOQADO_DASHBOARD
dashboardRoutes:
  - home
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - VIEWER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
---

## Que muestra Inicio

Inicio resume actividad reciente del local: ventas, liquidacion, productos, terminales y accesos rapidos.

## Cambiar periodo

Usa el selector de fechas para comparar el rendimiento contra otro periodo.
```

```md
---
title: Ver pagos
description: Consulta pagos, filtros, recibos y detalle de transacciones.
product: dashboard
category: ventas
featureCode: AVOQADO_PAYMENTS
dashboardRoutes:
  - payments
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - CASHIER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
relatedArticles:
  - crear-liga-pago
  - ver-saldo-disponible
---

## Ver pagos

1. Abre **Ventas > Transacciones**.
2. Filtra por fecha, metodo de pago o busqueda.
3. Abre una transaccion para revisar su detalle.

## Si falta un pago

Revisa el rango de fechas y confirma que estas en la sucursal correcta.
```

```md
---
title: Ver pedidos
description: Consulta pedidos, productos, estados y detalle operativo.
product: dashboard
category: ventas
featureCode: AVOQADO_ORDERS
dashboardRoutes:
  - orders
roles:
  - OWNER
  - ADMIN
  - MANAGER
  - CASHIER
  - WAITER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Ver pedidos

1. Abre **Ventas > Pedidos**.
2. Filtra por estado, mesa, mesero o fecha.
3. Abre un pedido para ver productos, propina, total y estado.

## Editar informacion

Algunas acciones dependen de permisos. Si no puedes editar, pide a un administrador que revise tu rol.
```

```md
---
title: Gestionar productos
description: Crea y edita productos del menu desde el Dashboard.
product: dashboard
category: menu
featureCode: AVOQADO_MENU
dashboardRoutes:
  - menumaker/products
  - menumaker/categories
  - menumaker/menus
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Gestionar productos

1. Abre **Menu > Productos**.
2. Crea un producto o abre uno existente.
3. Revisa nombre, precio, categoria y disponibilidad.
4. Guarda los cambios.

## Relacion con categorias y menus

Los productos pueden organizarse por categorias y aparecer en uno o varios menus.
```

```md
---
title: Gestionar terminales
description: Revisa terminales, estado de conexion y activacion.
product: dashboard
category: terminales
featureCode: AVOQADO_TPVS
dashboardRoutes:
  - tpv
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Ver terminales

1. Abre **Terminales**.
2. Revisa estado, conexion, activacion y version.
3. Usa filtros para encontrar una terminal especifica.

## Activacion

Si una terminal aparece pendiente, sigue el flujo de activacion o pide soporte para confirmar que el dispositivo este asignado al local correcto.
```

```md
---
title: Ver saldo disponible
description: Consulta liquidaciones, depositos y calendario de saldo.
product: dashboard
category: reportes
featureCode: AVOQADO_BALANCE
dashboardRoutes:
  - available-balance
roles:
  - OWNER
  - ADMIN
  - MANAGER
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Ver saldo disponible

1. Abre **Reportes > Saldo Disponible**.
2. Revisa el saldo por liquidar y el calendario de depositos.
3. Filtra por periodo si necesitas revisar movimientos anteriores.

## Diferencia contra ventas del dia

El saldo disponible depende de reglas de liquidacion, tipo de tarjeta y fecha de deposito. No siempre coincide con las ventas brutas del dia.
```

```md
---
title: Configurar datos del local
description: Edita informacion basica, imagenes, documentos e integraciones del local.
product: dashboard
category: configuracion
featureCode: AVOQADO_SETTINGS
dashboardRoutes:
  - edit
  - edit/integrations
roles:
  - OWNER
  - ADMIN
lastVerified: 2026-05-20
sourceRepo: avoqado-web-dashboard
popular: true
---

## Configurar el local

1. Abre **Configuracion > Editar Local**.
2. Revisa informacion basica, contacto, imagenes y documentos.
3. Entra a **Integraciones** para revisar conexiones como pagos o calendario.
4. Guarda los cambios.

## Permisos

Solo usuarios con rol administrativo pueden modificar datos sensibles del local.
```

- [ ] **Step 3: Run build to validate Markdown frontmatter**

Run:

```bash
npm run build
```

Expected: Astro validates all help entries. If a date or enum fails, fix the article frontmatter before creating routes.

## Task 3: Static Help Routes

**Files:**
- Create: `src/pages/help.astro`
- Create: `src/pages/help/dashboard.astro`
- Create: `src/pages/help/dashboard/[category].astro`
- Create: `src/pages/help/dashboard/[category]/[slug].astro`

- [ ] **Step 1: Create `/help`**

Create `src/pages/help.astro`:

```astro
---
import Layout from '../layouts/Layout.astro'
import Navbar from '../components/layout/Navbar.astro'
import Footer from '../components/layout/Footer.astro'
---

<Layout title="Centro de ayuda | Avoqado" description="Encuentra ayuda para usar el Dashboard de Avoqado.">
  <Navbar position="fixed" />
  <main class="min-h-screen bg-white pt-32 text-black">
    <section class="mx-auto max-w-5xl px-6 py-16">
      <p class="text-sm font-semibold uppercase tracking-[0.18em] text-avoqado-green">Soporte</p>
      <h1 class="mt-4 max-w-3xl text-5xl font-light tracking-tight md:text-6xl">Hola. ¿Como podemos ayudarte?</h1>
      <div class="mt-10 rounded-xl border border-black/10 bg-black/[0.03] p-4">
        <a href="/help/dashboard" class="block rounded-lg bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <span class="text-sm font-semibold text-avoqado-green">Dashboard</span>
          <h2 class="mt-2 text-2xl font-medium">Ayuda para el Dashboard Web</h2>
          <p class="mt-2 text-gray-600">Pagos, pedidos, ligas de pago, terminales, inventario, reportes y configuracion.</p>
        </a>
      </div>
    </section>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 2: Create `/help/dashboard`**

Create `src/pages/help/dashboard.astro`:

```astro
---
import { getCollection } from 'astro:content'
import Layout from '../../layouts/Layout.astro'
import Navbar from '../../components/layout/Navbar.astro'
import Footer from '../../components/layout/Footer.astro'
import HelpSearch from '../../components/help/HelpSearch'
import { DASHBOARD_HELP_CATEGORIES, getArticleUrl, sortHelpArticles, toSearchItem } from '../../lib/help'

const articles = sortHelpArticles(await getCollection('help', article => article.data.product === 'dashboard'))
const popularArticles = articles.filter(article => article.data.popular).slice(0, 6)
const searchItems = articles.map(toSearchItem)
---

<Layout title="Ayuda Dashboard | Avoqado" description="Guia de soporte para el Dashboard de Avoqado.">
  <Navbar position="fixed" />
  <main class="min-h-screen bg-white pt-32 text-black">
    <section class="mx-auto max-w-6xl px-6 py-14">
      <a href="/help" class="text-sm text-gray-500 hover:text-black">Centro de ayuda</a>
      <h1 class="mt-4 text-5xl font-light tracking-tight md:text-6xl">Ayuda para Dashboard</h1>
      <p class="mt-5 max-w-2xl text-lg leading-relaxed text-gray-600">Encuentra guias para operar ventas, pagos, terminales, menu, inventario, reportes y configuracion.</p>
      <div class="mt-8">
        <HelpSearch items={searchItems} client:load />
      </div>
    </section>
    <section class="mx-auto grid max-w-6xl gap-4 px-6 pb-10 md:grid-cols-2 lg:grid-cols-3">
      {DASHBOARD_HELP_CATEGORIES.map(category => (
        <a href={`/help/dashboard/${category.slug}`} class="rounded-xl border border-black/10 p-5 transition hover:-translate-y-0.5 hover:border-black/25 hover:shadow-sm">
          <h2 class="text-xl font-medium">{category.title}</h2>
          <p class="mt-2 text-sm leading-relaxed text-gray-600">{category.description}</p>
        </a>
      ))}
    </section>
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <h2 class="text-2xl font-medium">Articulos populares</h2>
      <div class="mt-5 grid gap-3 md:grid-cols-2">
        {popularArticles.map(article => (
          <a href={getArticleUrl(article)} class="rounded-lg border border-black/10 p-4 transition hover:border-black/25">
            <span class="text-xs uppercase tracking-[0.14em] text-gray-500">{article.data.category}</span>
            <h3 class="mt-1 font-medium">{article.data.title}</h3>
            <p class="mt-1 text-sm text-gray-600">{article.data.description}</p>
          </a>
        ))}
      </div>
    </section>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 3: Create category route**

Create `src/pages/help/dashboard/[category].astro`:

```astro
---
import { getCollection } from 'astro:content'
import Layout from '../../../layouts/Layout.astro'
import Navbar from '../../../components/layout/Navbar.astro'
import Footer from '../../../components/layout/Footer.astro'
import { DASHBOARD_HELP_CATEGORIES, getArticleUrl, getHelpCategory, sortHelpArticles } from '../../../lib/help'

export async function getStaticPaths() {
  return DASHBOARD_HELP_CATEGORIES.map(category => ({
    params: { category: category.slug },
    props: { category },
  }))
}

const { category } = Astro.props
const articles = sortHelpArticles(await getCollection('help', article => article.data.category === category.slug))
---

<Layout title={`${category.title} | Ayuda Dashboard Avoqado`} description={category.description}>
  <Navbar position="fixed" />
  <main class="min-h-screen bg-white pt-32 text-black">
    <section class="mx-auto max-w-4xl px-6 py-14">
      <a href="/help/dashboard" class="text-sm text-gray-500 hover:text-black">Ayuda Dashboard</a>
      <h1 class="mt-4 text-5xl font-light tracking-tight">{category.title}</h1>
      <p class="mt-4 text-lg text-gray-600">{category.description}</p>
      <div class="mt-10 divide-y divide-black/10 rounded-xl border border-black/10">
        {articles.map(article => (
          <a href={getArticleUrl(article)} class="block p-5 transition hover:bg-black/[0.03]">
            <h2 class="text-lg font-medium">{article.data.title}</h2>
            <p class="mt-1 text-sm text-gray-600">{article.data.description}</p>
          </a>
        ))}
      </div>
    </section>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 4: Create article route**

Create `src/pages/help/dashboard/[category]/[slug].astro`:

```astro
---
import { getCollection, render } from 'astro:content'
import Layout from '../../../../layouts/Layout.astro'
import Navbar from '../../../../components/layout/Navbar.astro'
import Footer from '../../../../components/layout/Footer.astro'
import { getArticleSlug, getArticleUrl, getHelpCategory, sortHelpArticles } from '../../../../lib/help'

export async function getStaticPaths() {
  const articles = await getCollection('help')
  return articles.map(article => ({
    params: {
      category: article.data.category,
      slug: getArticleSlug(article),
    },
    props: { article },
  }))
}

const { article } = Astro.props
const { Content } = await render(article)
const category = getHelpCategory(article.data.category)
const allArticles = await getCollection('help')
const related = sortHelpArticles(allArticles.filter(candidate => article.data.relatedArticles?.includes(getArticleSlug(candidate))))
const verified = article.data.lastVerified.toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
---

<Layout title={`${article.data.title} | Ayuda Avoqado`} description={article.data.description} type="article">
  <Navbar position="fixed" />
  <main class="min-h-screen bg-white pt-32 text-black">
    <article class="mx-auto max-w-3xl px-6 py-14">
      <a href={`/help/dashboard/${article.data.category}`} class="text-sm text-gray-500 hover:text-black">{category?.title ?? 'Dashboard'}</a>
      <h1 class="mt-4 text-4xl font-light tracking-tight md:text-5xl">{article.data.title}</h1>
      <p class="mt-4 text-lg leading-relaxed text-gray-600">{article.data.description}</p>
      <div class="mt-5 flex flex-wrap gap-2 text-xs text-gray-500">
        <span class="rounded-full bg-black/[0.04] px-3 py-1">Verificado: {verified}</span>
        {article.data.roles.map(role => <span class="rounded-full bg-black/[0.04] px-3 py-1">{role}</span>)}
      </div>
      <div class="help-article mt-10">
        <Content />
      </div>
      {related.length > 0 && (
        <aside class="mt-12 border-t border-black/10 pt-8">
          <h2 class="text-xl font-medium">Articulos relacionados</h2>
          <div class="mt-4 grid gap-3">
            {related.map(item => (
              <a href={getArticleUrl(item)} class="rounded-lg border border-black/10 p-4 hover:border-black/25">
                <span class="font-medium">{item.data.title}</span>
                <p class="mt-1 text-sm text-gray-600">{item.data.description}</p>
              </a>
            ))}
          </div>
        </aside>
      )}
    </article>
  </main>
  <Footer />
</Layout>
```

- [ ] **Step 5: Add article typography CSS**

Append to `src/styles/global.css`:

```css
.help-article h2 {
  margin-top: 2rem;
  font-size: 1.375rem;
  font-weight: 500;
  letter-spacing: 0;
}

.help-article p {
  margin-top: 1rem;
  line-height: 1.75;
  color: rgb(75 85 99);
}

.help-article ol,
.help-article ul {
  margin-top: 1rem;
  padding-left: 1.25rem;
  color: rgb(75 85 99);
}

.help-article li {
  margin-top: 0.5rem;
  line-height: 1.7;
}

.help-article strong {
  color: rgb(17 24 39);
  font-weight: 600;
}
```

- [ ] **Step 6: Build**

Run:

```bash
npm run build
```

Expected: routes compile and all article pages render.

## Task 4: Client Search

**Files:**
- Create: `src/components/help/HelpSearch.tsx`

- [ ] **Step 1: Create the search component**

Create `src/components/help/HelpSearch.tsx`:

```tsx
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

type HelpSearchItem = {
  title: string
  description: string
  category: string
  url: string
  popular: boolean
}

export default function HelpSearch({ items }: { items: HelpSearchItem[] }) {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return items.filter(item => item.popular).slice(0, 6)

    return items
      .filter(item => {
        const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase()
        return haystack.includes(normalized)
      })
      .slice(0, 8)
  }, [items, query])

  return (
    <div className="relative">
      <div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm">
        <Search className="h-5 w-5 text-gray-400" />
        <input
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Buscar pagos, terminales, ligas de pago..."
          className="w-full bg-transparent text-base outline-none placeholder:text-gray-400"
        />
      </div>

      {(query || results.length > 0) && (
        <div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
          {results.length > 0 ? (
            results.map(item => (
              <a key={item.url} href={item.url} className="block border-b border-black/5 p-4 last:border-b-0 hover:bg-black/[0.03]">
                <span className="text-xs uppercase tracking-[0.14em] text-gray-500">{item.category}</span>
                <div className="mt-1 font-medium text-black">{item.title}</div>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </a>
            ))
          ) : (
            <div className="p-4 text-sm text-gray-600">No encontramos articulos para esa busqueda.</div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build**

Run:

```bash
npm run build
```

Expected: React island compiles and `/help/dashboard` includes the search component.

## Task 5: Dashboard Inventory And Validation Scripts

**Files:**
- Create: `src/content/help/generated/dashboard-inventory.json`
- Create: `scripts/help-inventory.mjs`
- Create: `scripts/help-check.mjs`
- Modify: `package.json`

- [ ] **Step 1: Add initial generated inventory file**

Create `src/content/help/generated/dashboard-inventory.json`:

```json
{
  "generatedAt": "2026-05-20T00:00:00.000Z",
  "sourceRepo": "../avoqado-web-dashboard",
  "routes": []
}
```

- [ ] **Step 2: Create inventory script**

Create `scripts/help-inventory.mjs`:

```js
import { readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'

const dashboardRoot = path.resolve(process.cwd(), '../avoqado-web-dashboard')
const venueRoutesPath = path.join(dashboardRoot, 'src/routes/venueRoutes.tsx')
const sidebarPath = path.join(dashboardRoot, 'src/components/Sidebar/app-sidebar.tsx')
const featureRegistryPath = path.join(dashboardRoot, 'src/config/feature-registry.ts')
const outputPath = path.resolve(process.cwd(), 'src/content/help/generated/dashboard-inventory.json')

if (!existsSync(venueRoutesPath) || !existsSync(sidebarPath) || !existsSync(featureRegistryPath)) {
  console.error('Dashboard repo not found at ../avoqado-web-dashboard. Keep the existing generated inventory for builds.')
  process.exit(1)
}

const routeSource = await readFile(venueRoutesPath, 'utf8')
const sidebarSource = await readFile(sidebarPath, 'utf8')
const featureSource = await readFile(featureRegistryPath, 'utf8')

const routeMatches = [...routeSource.matchAll(/path:\s*'([^'#][^']*)'/g)]
const sidebarUrlMatches = [...sidebarSource.matchAll(/url:\s*'([^#][^']*)'/g)]
const routes = [...new Set([
  ...routeMatches.map(match => match[1]),
  ...sidebarUrlMatches.map(match => match[1]),
])]
  .filter(route => !route.includes(':'))
  .filter(route => !route.startsWith('settings/billing/'))
  .filter(route => !route.startsWith('/superadmin'))
  .filter(route => route !== '/admin')
  .sort()
  .map(route => ({
    path: route,
    product: 'dashboard',
    internal: route.includes('superadmin') || route.includes('payment-config') || route.includes('merchant-accounts'),
    comingSoon: ['disputes', 'subscriptions', 'virtual-terminal'].includes(route),
  }))

const featureMatches = [...featureSource.matchAll(/(AVOQADO_[A-Z_]+):\s*{/g)]
const featureCodes = [...new Set(featureMatches.map(match => match[1]))].sort()

await writeFile(
  outputPath,
  `${JSON.stringify({
    generatedAt: new Date().toISOString(),
    sourceRepo: '../avoqado-web-dashboard',
    routes,
    featureCodes,
  }, null,  2)}\n`,
)

console.log(`Wrote ${routes.length} dashboard routes and ${featureCodes.length} feature codes to ${outputPath}`)
```

- [ ] **Step 3: Create validation script**

Create `scripts/help-check.mjs`:

```js
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'

const helpRoot = path.resolve(process.cwd(), 'src/content/help/dashboard')
const inventoryPath = path.resolve(process.cwd(), 'src/content/help/generated/dashboard-inventory.json')
const inventory = JSON.parse(await readFile(inventoryPath, 'utf8'))
const validRoutes = new Set(inventory.routes.map(route => route.path))
const validFeatureCodes = new Set(inventory.featureCodes || [])
const allowedCategories = new Set(['inicio', 'ventas', 'menu', 'inventario', 'terminales', 'equipo', 'clientes', 'reportes', 'reservaciones', 'configuracion'])
const forbiddenTerms = ['playtelecom', 'superadmin', 'android', 'tpv app']
const maxAgeDays = 120

function parseFrontmatter(source, filePath) {
  const match = source.match(/^---\n([\s\S]*?)\n---/)
  if (!match) throw new Error(`${filePath}: missing frontmatter`)

  const data = {}
  let currentArrayKey = null

  for (const line of match[1].split('\n')) {
    if (!line.trim()) continue
    const arrayItem = line.match(/^\s+-\s+(.+)$/)
    if (arrayItem && currentArrayKey) {
      data[currentArrayKey].push(arrayItem[1].trim())
      continue
    }

    const keyValue = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/)
    if (!keyValue) continue
    const [, key, rawValue] = keyValue
    if (rawValue === '') {
      data[key] = []
      currentArrayKey = key
      continue
    }
    currentArrayKey = null
    data[key] = rawValue.trim()
  }

  return data
}

async function listMarkdownFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = await Promise.all(entries.map(entry => {
    const fullPath = path.join(dir, entry.name)
    return entry.isDirectory() ? listMarkdownFiles(fullPath) : fullPath
  }))
  return files.flat().filter(file => file.endsWith('.md'))
}

const files = await listMarkdownFiles(helpRoot)
const errors = []
const categoriesWithArticles = new Set()

for (const file of files) {
  const source = await readFile(file, 'utf8')
  const data = parseFrontmatter(source, file)
  const required = ['title', 'description', 'product', 'category', 'dashboardRoutes', 'roles', 'lastVerified', 'sourceRepo']

  for (const key of required) {
    if (!(key in data)) errors.push(`${file}: missing ${key}`)
  }

  if (data.product !== 'dashboard') errors.push(`${file}: product must be dashboard`)
  if (!allowedCategories.has(data.category)) errors.push(`${file}: invalid category ${data.category}`)
  if (data.sourceRepo !== 'avoqado-web-dashboard') errors.push(`${file}: sourceRepo must be avoqado-web-dashboard`)
  if (data.featureCode && validFeatureCodes.size > 0 && !validFeatureCodes.has(data.featureCode)) errors.push(`${file}: unknown featureCode ${data.featureCode}`)

  categoriesWithArticles.add(data.category)

  for (const route of data.dashboardRoutes || []) {
    if (!validRoutes.has(route) && data.comingSoon !== 'true' && route !== 'login') {
      errors.push(`${file}: dashboard route not found in inventory: ${route}`)
    }
  }

  const verified = new Date(data.lastVerified)
  const ageMs = Date.now() - verified.getTime()
  const ageDays = ageMs / 1000 / 60 / 60 / 24
  if (Number.isNaN(verified.getTime())) errors.push(`${file}: invalid lastVerified date`)
  if (ageDays > maxAgeDays) errors.push(`${file}: lastVerified older than ${maxAgeDays} days`)

  const lower = source.toLowerCase()
  for (const term of forbiddenTerms) {
    if (lower.includes(term)) errors.push(`${file}: forbidden V1 scope term "${term}"`)
  }
}

for (const category of ['inicio', 'ventas']) {
  if (!categoriesWithArticles.has(category)) errors.push(`category ${category}: must have at least one article`)
}

if (errors.length > 0) {
  console.error(errors.join('\n'))
  process.exit(1)
}

console.log(`Validated ${files.length} dashboard help articles`)
```

- [ ] **Step 4: Add package scripts**

Modify `package.json` scripts:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "cloudflared tunnel run --url http://localhost:4321 avoqado-dev",
  "astro": "astro",
  "help:inventory": "node scripts/help-inventory.mjs",
  "help:check": "node scripts/help-check.mjs"
}
```

- [ ] **Step 5: Generate inventory and validate articles**

Run:

```bash
npm run help:inventory
npm run help:check
npm run build
```

Expected:

- `help:inventory` writes real dashboard route and feature data.
- `help:check` validates article metadata.
- `build` completes.

## Task 6: Local QA

**Files:**
- No planned source changes unless QA finds bugs.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Astro prints a localhost URL, usually `http://127.0.0.1:4321/`.

- [ ] **Step 2: Browser smoke checks**

Open these routes:

```txt
http://127.0.0.1:4321/help
http://127.0.0.1:4321/help/dashboard
http://127.0.0.1:4321/help/dashboard/ventas
http://127.0.0.1:4321/help/dashboard/ventas/crear-liga-pago
```

Expected:

- Navbar and footer render.
- Search accepts text and shows matching results.
- Category cards link to category pages.
- Article page renders Markdown content and last verified date.
- Mobile width does not overlap text or navigation.

- [ ] **Step 3: Stop dev server**

Stop the dev server after QA. Do not leave a running process.

## Spec Coverage Review

- `/help` and `/help/dashboard`: covered by Task 3.
- Dashboard-only scope: covered by content schema and validation in Tasks 1 and 5.
- Categories: covered by `DASHBOARD_HELP_CATEGORIES` in Task 1.
- Article metadata: covered by Task 1 schema and Task 5 validator.
- Initial article set: covered by Task 2.
- Search: covered by Task 4.
- Generated inventory: covered by Task 5.
- Testing and smoke checks: covered by Tasks 5 and 6.

## Known Limits

- The V1 inventory script uses source parsing, not a TypeScript AST parser. This is acceptable for the current route files and keeps dependencies at zero.
- The first validator only requires non-empty `inicio` and `ventas` categories because the first article set does not cover every category.
- CI integration is intentionally outside this first implementation plan. Add it after local `help:check` has been stable for at least one implementation pass.
