import type { CollectionEntry } from 'astro:content';

export type HelpArticle = CollectionEntry<'help'>;

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
] as const;

export type DashboardHelpCategory = (typeof DASHBOARD_HELP_CATEGORIES)[number]['slug'];

export const DASHBOARD_ROUTE_LABELS: Record<string, string> = {
	login: 'Ir a inicio de sesion',
	home: 'Ir al inicio',
	payments: 'Ir a pagos',
	orders: 'Ir a pedidos',
	'payment-links': 'Ir a ligas de pago',
	'payment-links/settings': 'Ir a ajustes de ligas',
	'payment-links/branding': 'Ir a marca de ligas',
	'menumaker/products': 'Ir a productos',
	'menumaker/categories': 'Ir a categorias',
	'menumaker/menus': 'Ir a menus',
	'inventory/stock-overview': 'Ir a inventario',
	'inventory/history': 'Ir a historial de inventario',
	'inventory/ingredients': 'Ir a ingredientes',
	'inventory/recipes': 'Ir a recetas',
	'inventory/suppliers': 'Ir a proveedores',
	tpv: 'Ir a terminales',
	team: 'Ir a equipo',
	shifts: 'Ir a turnos',
	commissions: 'Ir a comisiones',
	customers: 'Ir a clientes',
	'customers/groups': 'Ir a grupos de clientes',
	loyalty: 'Ir a lealtad',
	reviews: 'Ir a resenas',
	'promotions/discounts': 'Ir a descuentos',
	'promotions/coupons': 'Ir a cupones',
	'reports/sales-summary': 'Ir a resumen de ventas',
	'reports/sales-by-item': 'Ir a ventas por articulo',
	'reports/home-charts': 'Ir a graficas de inicio',
	analytics: 'Ir a analitica',
	'available-balance': 'Ir a saldo disponible',
	reservations: 'Ir a reservaciones',
	'reservations/calendar': 'Ir al calendario',
	'reservations/waitlist': 'Ir a lista de espera',
	'reservations/settings': 'Ir a ajustes de reservas',
	'reservations/online-booking': 'Ir a reservas online',
	edit: 'Ir a configuracion del local',
	'edit/integrations': 'Ir a integraciones',
};

export function getHelpCategory(slug: string) {
	return DASHBOARD_HELP_CATEGORIES.find((category) => category.slug === slug);
}

export function normalizeDashboardRoute(route: string) {
	return route.trim().replace(/^\/+/, '').replace(/\/+$/, '');
}

export function getDashboardRouteLabel(route: string) {
	const normalized = normalizeDashboardRoute(route);
	const label = DASHBOARD_ROUTE_LABELS[normalized];
	if (label) return label;

	const lastSegment = normalized.split('/').filter(Boolean).pop() ?? normalized;
	const readable = lastSegment.replace(/-/g, ' ');
	return `Ir a ${readable}`;
}

export function getArticleSlug(article: HelpArticle) {
	const parts = article.id.split('/');
	return parts[parts.length - 1]?.replace(/\.md$/, '') ?? article.id;
}

export function getArticleUrl(article: HelpArticle) {
	return `/help/dashboard/${article.data.category}/${getArticleSlug(article)}`;
}

export function sortHelpArticles(articles: HelpArticle[]) {
	return [...articles].sort((a, b) => {
		if (a.data.popular && !b.data.popular) return -1;
		if (!a.data.popular && b.data.popular) return 1;
		return a.data.title.localeCompare(b.data.title, 'es');
	});
}

export function toSearchItem(article: HelpArticle) {
	return {
		title: article.data.title,
		description: article.data.description,
		category: article.data.category,
		url: getArticleUrl(article),
		popular: Boolean(article.data.popular),
	};
}
