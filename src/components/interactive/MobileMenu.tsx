import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import DemoDialog from './DemoDialog';

// Menu structure with nested items
const menuItems = [
	{
		label: 'Tipos de negocio',
		children: [
			{ label: 'Alimentos y bebidas', href: '/restaurants' },
			{ label: 'Tienda', href: '/retail' },
			{ label: 'Belleza', href: '/beauty' },
			{ label: 'Servicios', href: '/services' },
		],
	},
	{
		label: 'Productos',
		children: [
			{ label: 'Hardware', href: '/productos/hardware' },
			{ label: 'Pagos', href: '/productos/pagos' },
			{ label: 'Clientes', href: '/productos/clientes' },
			{ label: 'Personal', href: '/productos/personal' },
			{ label: 'Banca', href: '/productos/banca' },
		],
	},
	{ label: 'Soluciones', href: '/#solutions' },
	{ label: 'Precios', href: '/pricing' },
];

type MenuItem = {
	label: string;
	href?: string;
	children?: { label: string; href: string }[];
};

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const [isDemoOpen, setIsDemoOpen] = useState(false);
	const [activeSubmenu, setActiveSubmenu] = useState<MenuItem | null>(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const scrollYRef = useRef(0);

	// Wait for client-side mount for portal
	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent body scroll when menu is open (without breaking scrollytelling)
	useEffect(() => {
		if (isOpen) {
			scrollYRef.current = window.scrollY;
			document.body.style.position = 'fixed';
			document.body.style.top = `-${scrollYRef.current}px`;
			document.body.style.left = '0';
			document.body.style.right = '0';
		} else {
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.left = '';
			document.body.style.right = '';
			if (scrollYRef.current > 0) {
				window.scrollTo(0, scrollYRef.current);
			}
		}
	}, [isOpen]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				if (activeSubmenu) {
					goBack();
				} else {
					closeMenu();
				}
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen, activeSubmenu]);

	const closeMenu = () => {
		setIsOpen(false);
		setActiveSubmenu(null);
	};

	const openSubmenu = (item: MenuItem) => {
		setIsAnimating(true);
		setActiveSubmenu(item);
		setTimeout(() => setIsAnimating(false), 300);
	};

	const goBack = () => {
		setIsAnimating(true);
		setActiveSubmenu(null);
		setTimeout(() => setIsAnimating(false), 300);
	};

	// Menu content to be portaled
	const menuContent = (
		<div
			className={`fixed inset-0 lg:hidden transition-opacity duration-300 ${
				isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
			}`}
			style={{ zIndex: 10000 }}
		>
			{/* Full screen white overlay - Square style */}
			<div className="absolute inset-0 bg-white">
				{/* Header with Back/Close buttons */}
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
					{/* Back button - only visible in submenu */}
					<button
						onClick={goBack}
						className={`flex items-center gap-2 text-black font-medium transition-opacity ${
							activeSubmenu ? 'opacity-100' : 'opacity-0 pointer-events-none'
						}`}
						aria-label="Go back"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						<span className="text-sm">Atrás</span>
					</button>

					{/* Close button - always visible */}
					<button
						onClick={closeMenu}
						className="p-2 text-black hover:text-gray-600 transition-colors"
						aria-label="Close menu"
					>
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>

				{/* Menu panels container with horizontal slide animation */}
				<div className="relative h-[calc(100%-65px)] overflow-hidden">
					{/* Main menu panel */}
					<div
						className={`absolute inset-0 px-5 py-6 transition-transform duration-300 ease-out ${
							activeSubmenu ? '-translate-x-full' : 'translate-x-0'
						}`}
					>
						<nav className="flex flex-col">
							{menuItems.map((item) => (
								<div key={item.label}>
									{item.children ? (
										<button
											onClick={() => openSubmenu(item)}
											className="w-full flex items-center justify-between py-4 text-left group"
										>
											<span className="text-xl font-bold text-black group-hover:text-gray-600 transition-colors">
												{item.label}
											</span>
											<svg
												className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</button>
									) : (
										<a
											href={item.href}
											onClick={closeMenu}
											className="block py-4 text-xl font-bold text-black hover:text-gray-600 transition-colors"
										>
											{item.label}
										</a>
									)}
								</div>
							))}
						</nav>

						{/* CTA Buttons at bottom */}
						<div className="absolute bottom-6 left-5 right-5 flex flex-col gap-3">
							<a
								href="https://dashboard.avoqado.io"
								onClick={closeMenu}
								className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-black text-black rounded-full font-semibold hover:bg-black hover:text-white transition-all text-center"
							>
								Iniciar sesión
								<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
								</svg>
							</a>
							<button
								onClick={() => {
									closeMenu();
									setIsDemoOpen(true);
								}}
								className="px-6 py-3.5 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all text-center cursor-pointer"
							>
								Obtener demo
							</button>
						</div>
					</div>

					{/* Submenu panel */}
					<div
						className={`absolute inset-0 px-5 py-6 transition-transform duration-300 ease-out ${
							activeSubmenu ? 'translate-x-0' : 'translate-x-full'
						}`}
					>
						{activeSubmenu && (
							<>
								{/* Submenu header */}
								<p className="text-sm text-gray-500 mb-2">{activeSubmenu.label}</p>

								{/* Submenu items */}
								<nav className="flex flex-col">
									{activeSubmenu.children?.map((child) => (
										<a
											key={child.href}
											href={child.href}
											onClick={closeMenu}
											className="block py-4 text-xl font-bold text-black hover:text-gray-600 transition-colors"
										>
											{child.label}
										</a>
									))}
								</nav>
							</>
						)}
					</div>
				</div>
			</div>
		</div>
	);

	return (
		<>
			{/* Hamburger Button - stays in navbar */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="lg:hidden p-2 text-white group-[.white-nav]:text-black hover:text-avoqado-green transition-colors z-50 relative"
				aria-label="Toggle menu"
				aria-expanded={isOpen}
			>
				<svg
					className="w-6 h-6"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					aria-hidden="true"
				>
					{isOpen ? (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					) : (
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M4 6h16M4 12h16M4 18h16"
						/>
					)}
				</svg>
			</button>

			{/* Portal menu to body to escape stacking context */}
			{mounted && createPortal(menuContent, document.body)}

			{/* Demo Dialog */}
			<DemoDialog isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
		</>
	);
}
