import type { MiddlewareHandler } from 'astro';

export const onRequest: MiddlewareHandler = async (context, next) => {
	const url = new URL(context.request.url);
	const hostname = url.hostname;

	console.log('Middleware: hostname =', hostname, 'path =', url.pathname);

	// If accessing from links.avoqado.io subdomain, rewrite to /links
	if (hostname === 'links.avoqado.io' && url.pathname === '/') {
		console.log('Rewriting links.avoqado.io to /links');
		return context.rewrite('/links');
	}

	// If accessing from tpv.avoqado.io subdomain, rewrite to /productos/tpv
	if (hostname === 'tpv.avoqado.io' && url.pathname === '/') {
		console.log('Rewriting tpv.avoqado.io to /productos/tpv');
		return context.rewrite('/productos/tpv');
	}

	return next();
};
