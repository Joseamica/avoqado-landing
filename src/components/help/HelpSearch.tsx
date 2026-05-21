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
			<div className="flex items-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 shadow-sm">
				<Search className="h-5 w-5 text-gray-400" />
				<input
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="Buscar pagos, terminales, ligas de pago..."
					className="w-full bg-transparent text-base outline-none placeholder:text-gray-400"
				/>
			</div>

			{(query || results.length > 0) && (
				<div className="mt-3 overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
					{results.length > 0 ? (
						results.map((item) => (
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
	);
}
