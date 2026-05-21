import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
});

export const collections = { help };
