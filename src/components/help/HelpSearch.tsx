import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';

type HelpSearchItem = {
	title: string;
	description: string;
	category: string;
	url: string;
	popular: boolean;
};

export default function HelpSearch({ items }: { items: HelpSearchItem[] }) {
	const [query, setQuery] = useState('');

	const results = useMemo(() => {
		const normalized = query.trim().toLowerCase();
		if (!normalized) return items.filter((item) => item.popular).slice(0, 6);

		return items
			.filter((item) => {
				const haystack = `${item.title} ${item.description} ${item.category}`.toLowerCase();
				return haystack.includes(normalized);
			})
			.slice(0, 8);
	}, [items, query]);

	return (
		<div className="relative">
			<div className="flex items-center gap-3 rounded-[1.25rem] border border-black/10 bg-white px-5 py-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] transition focus-within:border-black/20 focus-within:shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
				<Search className="h-5 w-5 shrink-0 text-gray-400" />
				<input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Busca pagos, permisos, inventario, reportes..."
					className="w-full bg-transparent text-base font-medium text-gray-900 outline-none placeholder:font-normal placeholder:text-gray-400"
					aria-label="Buscar articulos de ayuda"
				/>
			</div>

			{(query || results.length > 0) && (
				<div className="mt-3 overflow-hidden rounded-[1.25rem] border border-black/10 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
					{results.length > 0 ? (
						results.map((item) => (
							<a key={item.url} href={item.url} className="group block border-b border-black/5 px-5 py-4 last:border-b-0 hover:bg-[#f7fbf5]">
								<span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">{item.category}</span>
								<div className="mt-1 font-semibold text-black group-hover:text-green-800">{item.title}</div>
								<p className="mt-1 text-sm leading-6 text-gray-600">{item.description}</p>
							</a>
						))
					) : (
						<div className="p-4 text-sm text-gray-600">No encontramos articulos para esa busqueda.</div>
					)}
				</div>
			)}
		</div>
	);
}
