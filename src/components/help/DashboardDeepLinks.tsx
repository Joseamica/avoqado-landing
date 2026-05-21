import { ExternalLink, Store } from 'lucide-react';
import { useMemo } from 'react';
import { getDashboardRouteLabel, getDashboardRoutePath, isDashboardRouteComingSoon, normalizeDashboardRoute } from '../../lib/help';

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
		<section className="mt-8 rounded-[1.25rem] border border-black/10 bg-[#f7fbf5] p-5">
			<div className="flex items-start gap-3">
				<div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black text-white">
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

			<div className="mt-4 grid gap-2 sm:grid-cols-2">
				{uniqueRoutes.map((route) => {
					const href = buildDashboardUrl(route);
					const label = getDashboardRouteLabel(route);
					const path = getDashboardRoutePath(route);
					const comingSoon = isDashboardRouteComingSoon(route);

					if (comingSoon) {
						return (
							<div
								key={route}
								role="link"
								aria-disabled="true"
								className="min-w-0 rounded-xl border border-dashed border-black/15 bg-white px-4 py-3 text-sm text-gray-500"
							>
								<span className="flex min-w-0 flex-wrap items-center gap-2 font-medium text-gray-700">
									{label}
									<span className="rounded-full bg-black/[0.06] px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
										Proximamente
									</span>
								</span>
								<span className="mt-1 block break-words text-xs leading-5 text-gray-500">{path}</span>
							</div>
						);
					}

					return (
						<a
							key={route}
							href={href}
							target="_blank"
							rel="noopener noreferrer"
							className="group min-w-0 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm transition hover:border-black/25 hover:shadow-sm"
						>
							<span className="flex min-w-0 items-center gap-2 font-medium text-black">
								{label}
								<ExternalLink className="h-4 w-4 text-gray-400 transition group-hover:text-black" aria-hidden="true" />
							</span>
							<span className="mt-1 block break-words text-xs leading-5 text-gray-500">{path}</span>
						</a>
					);
				})}
			</div>
		</section>
	);
}
