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
	account: 'Ir a mi perfil',
	notifications: 'Ir a notificaciones',
	'notifications/preferences': 'Ir a preferencias de notificaciones',
	home: 'Ir al inicio',
	payments: 'Ir a pagos',
	orders: 'Ir a pedidos',
	'merchant-accounts': 'Ir a cuentas merchant',
	'payment-config': 'Ir a configuracion de pagos',
	'virtual-terminal': 'Ir a terminal virtual',
	disputes: 'Ir a disputas',
	'payment-links': 'Ir a ligas de pago',
	'payment-links/settings': 'Ir a ajustes de ligas',
	'payment-links/branding': 'Ir a marca de ligas',
	'menumaker/products': 'Ir a productos',
	'menumaker/categories': 'Ir a categorias',
	'menumaker/menus': 'Ir a menus',
	'menumaker/modifier-groups': 'Ir a grupos de modificadores',
	'menumaker/services': 'Ir a servicios',
	'menumaker/credit-packs': 'Ir a paquetes de credito',
	'inventory/stock-overview': 'Ir a inventario',
	'inventory/history': 'Ir a historial de inventario',
	'inventory/ingredients': 'Ir a ingredientes',
	'inventory/recipes': 'Ir a recetas',
	'inventory/suppliers': 'Ir a proveedores',
	'inventory/purchase-orders': 'Ir a ordenes de compra',
	'inventory/stock-counts': 'Ir a conteos de inventario',
	'inventory/transfers': 'Ir a transferencias',
	'inventory/restocks': 'Ir a reabastecimientos',
	'inventory/profitability': 'Ir a rentabilidad',
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
	'reports/payment-methods': 'Ir a metodos de pago',
	'reports/taxes': 'Ir a impuestos',
	'reports/voids': 'Ir a cancelaciones',
	'reports/sales-by-category': 'Ir a ventas por categoria',
	'reports/pay-later-aging': 'Ir a cuentas por cobrar',
	analytics: 'Ir a analitica',
	'available-balance': 'Ir a saldo disponible',
	subscriptions: 'Ir a suscripciones',
	reservations: 'Ir a reservaciones',
	'reservations/calendar': 'Ir al calendario',
	'reservations/waitlist': 'Ir a lista de espera',
	'reservations/settings': 'Ir a ajustes de reservas',
	'reservations/online-booking': 'Ir a reservas online',
	'reservations/communications': 'Ir a comunicaciones',
	'reservations/invite-clients': 'Ir a invitar clientes',
	'reservations/widget-advanced': 'Ir a widget avanzado',
	edit: 'Ir a configuracion del local',
	'edit/basic-info': 'Ir a informacion basica',
	'edit/contact-images': 'Ir a imagenes y contacto',
	'edit/integrations': 'Ir a integraciones',
	'settings/role-permissions': 'Ir a permisos y roles',
	'settings/billing': 'Ir a facturacion y add-ons',
	'settings/billing/subscriptions': 'Ir a suscripciones',
	'settings/billing/history': 'Ir a historial de facturacion',
	'settings/billing/payment-methods': 'Ir a metodos de pago',
	'settings/billing/tokens': 'Ir a tokens de billing',
};

export const DASHBOARD_ROUTE_PATHS: Record<string, string> = {
	login: 'Dashboard > Inicio de sesion',
	account: 'Dashboard > Mi perfil',
	notifications: 'Dashboard > Notificaciones',
	'notifications/preferences': 'Dashboard > Notificaciones > Preferencias',
	home: 'Dashboard > Inicio',
	payments: 'Dashboard > Ventas > Transacciones',
	orders: 'Dashboard > Ventas > Pedidos',
	'merchant-accounts': 'Dashboard > Configuracion > Herramientas superadmin > Cuentas merchant',
	'payment-config': 'Dashboard > Configuracion > Herramientas superadmin > Configuracion de pagos',
	'virtual-terminal': 'Dashboard > Ventas > Terminal virtual',
	disputes: 'Dashboard > Ventas > Disputas',
	'payment-links': 'Dashboard > Ventas > Ligas de Pago',
	'payment-links/settings': 'Dashboard > Ventas > Ligas de Pago > Ajustes generales',
	'payment-links/branding': 'Dashboard > Ventas > Ligas de Pago > Marca',
	'menumaker/products': 'Dashboard > Menu > Productos',
	'menumaker/categories': 'Dashboard > Menu > Categorias',
	'menumaker/menus': 'Dashboard > Menu > Menus',
	'menumaker/modifier-groups': 'Dashboard > Menu > Grupos de modificadores',
	'menumaker/services': 'Dashboard > Menu > Servicios',
	'menumaker/credit-packs': 'Dashboard > Menu > Paquetes de credito',
	'inventory/stock-overview': 'Dashboard > Inventario > Resumen de existencias',
	'inventory/history': 'Dashboard > Inventario > Historial',
	'inventory/ingredients': 'Dashboard > Inventario > Ingredientes',
	'inventory/recipes': 'Dashboard > Inventario > Recetas',
	'inventory/suppliers': 'Dashboard > Inventario > Proveedores',
	'inventory/purchase-orders': 'Dashboard > Inventario > Ordenes de compra',
	'inventory/stock-counts': 'Dashboard > Inventario > Conteos de inventario',
	'inventory/transfers': 'Dashboard > Inventario > Transferencias',
	'inventory/restocks': 'Dashboard > Inventario > Reabastecimientos pendientes',
	'inventory/profitability': 'Dashboard > Inventario > Rentabilidad',
	tpv: 'Dashboard > Terminales',
	team: 'Dashboard > Equipo > Miembros',
	shifts: 'Dashboard > Equipo > Turnos',
	commissions: 'Dashboard > Equipo > Comisiones',
	customers: 'Dashboard > Clientes > Todos',
	'customers/groups': 'Dashboard > Clientes > Grupos',
	loyalty: 'Dashboard > Clientes > Lealtad',
	reviews: 'Dashboard > Clientes > Resenas',
	'promotions/discounts': 'Dashboard > Clientes > Promociones > Descuentos',
	'promotions/coupons': 'Dashboard > Clientes > Promociones > Cupones',
	'reports/sales-summary': 'Dashboard > Reportes > Resumen de ventas',
	'reports/sales-by-item': 'Dashboard > Reportes > Ventas por articulo',
	'reports/home-charts': 'Dashboard > Reportes > Graficas de inicio',
	'reports/payment-methods': 'Dashboard > Reportes > Metodos de pago',
	'reports/taxes': 'Dashboard > Reportes > Impuestos',
	'reports/voids': 'Dashboard > Reportes > Cancelaciones',
	'reports/sales-by-category': 'Dashboard > Reportes > Ventas por categoria',
	'reports/pay-later-aging': 'Dashboard > Reportes > Cuentas por cobrar',
	analytics: 'Dashboard > Analitica',
	'available-balance': 'Dashboard > Reportes > Saldo disponible',
	subscriptions: 'Dashboard > Suscripciones',
	reservations: 'Dashboard > Reservaciones > Lista',
	'reservations/calendar': 'Dashboard > Reservaciones > Calendario',
	'reservations/waitlist': 'Dashboard > Reservaciones > Lista de espera',
	'reservations/settings': 'Dashboard > Reservaciones > Ajustes',
	'reservations/online-booking': 'Dashboard > Reservaciones > Reservas online',
	'reservations/communications': 'Dashboard > Reservaciones > Ajustes > Comunicaciones',
	'reservations/invite-clients': 'Dashboard > Reservaciones > Reservas online > Invitar clientes',
	'reservations/widget-advanced': 'Dashboard > Reservaciones > Reservas online > Widget avanzado',
	edit: 'Dashboard > Configuracion > Editar Local',
	'edit/basic-info': 'Dashboard > Configuracion > Editar Local > Informacion basica',
	'edit/contact-images': 'Dashboard > Configuracion > Editar Local > Imagenes y contacto',
	'edit/integrations': 'Dashboard > Configuracion > Integraciones',
	'settings/role-permissions': 'Dashboard > Configuracion > Permisos y roles',
	'settings/billing': 'Dashboard > Configuracion > Facturacion y add-ons',
	'settings/billing/subscriptions': 'Dashboard > Configuracion > Facturacion y add-ons > Suscripciones',
	'settings/billing/history': 'Dashboard > Configuracion > Facturacion y add-ons > Historial',
	'settings/billing/payment-methods': 'Dashboard > Configuracion > Facturacion y add-ons > Metodos de pago',
	'settings/billing/tokens': 'Dashboard > Configuracion > Facturacion y add-ons > Tokens',
};

export const DASHBOARD_COMING_SOON_ROUTES = new Set([
	'inventory/restocks',
	'reports/payment-methods',
	'reports/taxes',
	'reports/voids',
	'reports/sales-by-category',
	'reservations/communications',
	'reservations/invite-clients',
	'reservations/widget-advanced',
]);

export const HELP_ROLE_LABELS: Record<string, string> = {
	OWNER: 'Owner',
	ADMIN: 'Administrador',
	MANAGER: 'Manager',
	CASHIER: 'Caja',
	WAITER: 'Mesero',
	HOST: 'Host',
	VIEWER: 'Solo lectura',
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

export function getDashboardRoutePath(route: string) {
	const normalized = normalizeDashboardRoute(route);
	const path = DASHBOARD_ROUTE_PATHS[normalized];
	if (path) return path;

	return `Dashboard > ${normalized.split('/').filter(Boolean).map((segment) => segment.replace(/-/g, ' ')).join(' > ')}`;
}

export function getDashboardRoutePathParts(route: string) {
	return getDashboardRoutePath(route).split('>').map((part) => part.trim()).filter(Boolean);
}

export function isDashboardRouteComingSoon(route: string) {
	return DASHBOARD_COMING_SOON_ROUTES.has(normalizeDashboardRoute(route));
}

export function getRoleLabel(role: string) {
	return HELP_ROLE_LABELS[role] ?? role;
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
