import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { pushEvent } from '../../lib/gtm';

const WHATSAPP_NUMBER = '525640070001';
const DEFAULT_MESSAGE = 'Hola, vengo de un anuncio y me interesa Avoqado.';
const SESSION_KEY = 'waPromptDone';
const SHOW_DELAY_MS = 1500;

/**
 * Detect whether the visitor arrived from a paid ad, and from which platform.
 * Auto-detects the click IDs / utm params the ad platforms add, plus a manual
 * `?wa=1` override (with optional `?src=`) for testing or explicit campaigns.
 */
function detectAdVisitor(params: URLSearchParams): { ad: boolean; source: string } {
	if (params.get('wa') === '1') return { ad: true, source: params.get('src') || 'manual' };
	if (params.get('gclid') || params.get('gbraid') || params.get('wbraid')) return { ad: true, source: 'googleads' };
	if (params.get('fbclid')) return { ad: true, source: 'meta' };
	if (params.get('li_fat_id')) return { ad: true, source: 'linkedin' };
	if (params.get('msclkid')) return { ad: true, source: 'microsoft' };
	const medium = (params.get('utm_medium') || '').toLowerCase();
	if (['cpc', 'ppc', 'paid', 'paidsocial', 'paid_social', 'display'].includes(medium)) {
		return { ad: true, source: params.get('utm_source') || 'utm' };
	}
	return { ad: false, source: '' };
}

export default function AdWhatsAppPrompt() {
	const [mounted, setMounted] = useState(false);
	const [open, setOpen] = useState(false);
	const [source, setSource] = useState('ad');
	const [message, setMessage] = useState(DEFAULT_MESSAGE);
	const scrollYRef = useRef(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	// Decide whether to show, only for ad visitors, once per session.
	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const { ad, source } = detectAdVisitor(params);
		if (!ad) return;
		try {
			if (sessionStorage.getItem(SESSION_KEY)) return;
		} catch {
			/* sessionStorage may be unavailable; show anyway */
		}
		setSource(source);
		const customMsg = params.get('text');
		if (customMsg) setMessage(customMsg);

		const t = setTimeout(() => {
			setOpen(true);
			pushEvent('whatsapp_prompt_shown', { wa_source: source });
		}, SHOW_DELAY_MS);
		return () => clearTimeout(t);
	}, []);

	// Lock scroll while open without breaking scrollytelling (position: fixed pattern).
	useEffect(() => {
		if (!open) return;
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') dismiss();
		};
		document.addEventListener('keydown', onKey);
		scrollYRef.current = window.scrollY;
		document.body.style.position = 'fixed';
		document.body.style.top = `-${scrollYRef.current}px`;
		document.body.style.left = '0';
		document.body.style.right = '0';
		return () => {
			document.removeEventListener('keydown', onKey);
			document.body.style.position = '';
			document.body.style.top = '';
			document.body.style.left = '';
			document.body.style.right = '';
			window.scrollTo(0, scrollYRef.current);
		};
	}, [open]);

	const markDone = () => {
		try {
			sessionStorage.setItem(SESSION_KEY, '1');
		} catch {
			/* ignore */
		}
	};

	const dismiss = () => {
		markDone();
		setOpen(false);
		pushEvent('whatsapp_prompt_dismissed', { wa_source: source });
	};

	const onWhatsAppClick = () => {
		markDone();
		// Conversion event — same name the /wa bridge uses, so one GA4 tag covers both.
		/* whatsapp_click + Google Ads conversion now fire from the /wa bridge (waUrl), which waits for tags before redirecting — no manual push here to avoid double-counting. */
		setOpen(false);
	};

	if (!mounted || !open) return null;

	const waUrl = `/wa?src=ad_${source}&text=${encodeURIComponent(message)}`;

	const modal = (
		<div
			className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
			role="dialog"
			aria-modal="true"
			aria-labelledby="wa-prompt-title"
			onClick={dismiss}
		>
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

			<div
				className="relative w-full max-w-sm rounded-3xl bg-white p-7 text-center shadow-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={dismiss}
					aria-label="Cerrar"
					className="absolute right-4 top-4 p-1.5 text-gray-400 transition-colors hover:text-black"
				>
					<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>

				<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#25D366]">
					<svg className="h-9 w-9 text-white" fill="currentColor" viewBox="0 0 24 24">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
					</svg>
				</div>

				<h2 id="wa-prompt-title" className="mb-2 text-2xl font-semibold text-black">
					¿Te atendemos por WhatsApp?
				</h2>
				<p className="mb-6 text-gray-500">
					Resolvemos tus dudas al instante y te ayudamos a elegir el plan ideal. Sin compromiso.
				</p>

				<a
					href={waUrl}
					target="_blank"
					rel="noopener noreferrer"
					onClick={onWhatsAppClick}
					className="flex w-full items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-4 text-lg font-semibold text-white shadow-lg transition-transform hover:scale-[1.02]"
				>
					<svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
						<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
					</svg>
					Escríbenos por WhatsApp
				</a>

				<button
					onClick={dismiss}
					className="mt-4 text-sm text-gray-400 underline-offset-2 transition-colors hover:text-gray-700 hover:underline"
				>
					No gracias, quiero ver la página
				</button>
			</div>
		</div>
	);

	return createPortal(modal, document.body);
}
