import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async (context, next) => {
	const url = new URL(context.request.url);
	const hostname = url.hostname;

	// If accessing from links.avoqado.io subdomain, rewrite to /links
	if (hostname === 'links.avoqado.io') {
		// Rewrite the URL to /links while keeping the same hostname
		return context.rewrite(new URL('/links', context.request.url));
	}

	return next();
});
