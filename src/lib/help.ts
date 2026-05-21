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

export function getHelpCategory(slug: string) {
	return DASHBOARD_HELP_CATEGORIES.find((category) => category.slug === slug);
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
