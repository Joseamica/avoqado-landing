import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function MobileMenu() {
	const [isOpen, setIsOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	// Wait for client-side mount for portal
	useEffect(() => {
		setMounted(true);
	}, []);

	// Prevent body scroll when menu is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		document.addEventListener('keydown', handleEscape);
		return () => document.removeEventListener('keydown', handleEscape);
	}, [isOpen]);

	const closeMenu = () => setIsOpen(false);

	const navLinks = [
		{ href: '/#industries', label: 'Tipos de negocios' },
		{ href: '/productos', label: 'Productos' },
		{ href: '/#solutions', label: 'Soluciones' },
		{ href: '/pricing', label: 'Precios' },
	];

	// Menu content to be portaled
	const menuContent = (
		<>
			{/* Full screen backdrop */}
			{isOpen && (
				<div
					className="fixed inset-0 bg-black/90 lg:hidden"
					style={{ zIndex: 99998 }}
					onClick={closeMenu}
					aria-hidden="true"
				/>
			)}

			{/* Mobile Menu Panel */}
			<div
				className={`fixed top-0 right-0 h-full w-[280px] border-l border-gray-700 shadow-2xl lg:hidden transition-transform duration-300 ease-out ${
					isOpen ? 'translate-x-0' : 'translate-x-full'
				}`}
				style={{ 
					zIndex: 99999,
					backgroundColor: '#000000',
				}}
				role="dialog"
				aria-modal="true"
				aria-label="Mobile navigation"
			>
				<div className="flex flex-col h-full p-6" style={{ backgroundColor: '#000000' }}>
					{/* Close Button */}
					<div className="flex justify-end mb-8">
						<button
							onClick={closeMenu}
							className="p-2 text-gray-400 hover:text-white transition-colors"
							aria-label="Close menu"
						>
							<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M6 18L18 6M6 6l12 12"
								/>
							</svg>
						</button>
					</div>

					{/* Navigation Links */}
					<nav className="flex flex-col space-y-6 mb-8">
						{navLinks.map((link) => (
							<a
								key={link.href}
								href={link.href}
								onClick={closeMenu}
								className="text-lg text-white hover:text-avoqado-green transition-colors py-2"
							>
								{link.label}
							</a>
						))}
					</nav>

					{/* CTA Buttons */}
					<div className="flex flex-col gap-3 mt-auto">
						<a
							href="https://dashboard.avoqado.io"
							onClick={closeMenu}
							className="px-6 py-3 border border-white/30 text-white rounded-full hover:bg-white/10 hover:border-white/50 transition-all font-medium text-center"
						>
							Iniciar sesión →
						</a>
						<a
							href="/#contact"
							onClick={closeMenu}
							className="px-6 py-3 bg-avoqado-green text-white rounded-full hover:bg-avoqado-green/90 hover:scale-105 transition-all font-semibold shadow-lg text-center"
						>
							Obtén demo
						</a>
					</div>
				</div>
			</div>
		</>
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
		</>
	);
}
