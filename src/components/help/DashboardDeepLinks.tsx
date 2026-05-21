import { ExternalLink, Store } from 'lucide-react';
import { useMemo } from 'react';
import { getDashboardRouteLabel, normalizeDashboardRoute } from '../../lib/help';

type DashboardDeepLinksProps = {
	routes: string[];
};

const DASHBOARD_BASE_URL = 'https://dashboard.avoqado.io';

function buildDashboardUrl(route: string) {
	const normalizedRoute = normalizeDashboardRoute(route);
	if (normalizedRoute === 'login') return `${DASHBOARD_BASE_URL}/login`;

	const encodedRoute = normalizedRoute
		.split('/')
		.filter(Boolean)
		.map((segment) => encodeURIComponent(segment))
		.join('/');
	return `${DASHBOARD_BASE_URL}/go/${encodedRoute}`;
}

export default function DashboardDeepLinks({ routes }: DashboardDeepLinksProps) {
	const uniqueRoutes = useMemo(() => {
		return Array.from(new Set(routes.map(normalizeDashboardRoute).filter(Boolean)));
	}, [routes]);

	return (
		<section className="mt-8 rounded-lg border border-black/10 bg-black/[0.025] p-5">
			<div className="flex items-start gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-black text-white">
					<Store className="h-4 w-4" aria-hidden="true" />
				</div>
				<div>
					<p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-500">Acceso directo</p>
					<h2 className="mt-1 text-lg font-semibold text-black">Abrir en Dashboard</h2>
					<p className="mt-1 text-sm leading-6 text-gray-600">
						El Dashboard elegira el local desde tu sesion. Si no has iniciado sesion, primero te pedira entrar.
					</p>
				</div>
			</div>

			<div className="mt-4 flex flex-wrap gap-2">
				{uniqueRoutes.map((route) => {
					const href = buildDashboardUrl(route);
					const label = getDashboardRouteLabel(route);

					return (
						<a
							key={route}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex min-h-10 items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
						>
							{label}
							<ExternalLink className="h-4 w-4" aria-hidden="true" />
						</a>
					);
				})}
			</div>
		</section>
	);
}
