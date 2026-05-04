import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronDown, Search, Menu, X, ArrowRight, ArrowUpRight } from 'lucide-react';

// ─── Product data with real accent colors ───
const products = [
  { name: 'Dashboard Web', desc: 'Inventario, personal, reportes y IA', href: '/productos/dashboard', accent: 'oklch(0.72 0.14 240)', num: '01' },
  { name: 'Avoqado TPV', desc: 'Ordenes y cobros en terminal con NFC, chip y banda', href: '/productos/tpv', accent: '#69E185', num: '02' },
  { name: 'Avoqado POS', desc: 'Punto de venta para cualquier negocio', href: '/productos/pos', accent: 'oklch(0.68 0.15 290)', num: '03' },
  { name: 'Avoqado QR', desc: 'Escanear, pedir y pagar en 30 segundos', href: '/productos/qr', accent: 'oklch(0.78 0.14 75)', num: '04' },
  { name: 'Asistente IA', desc: 'Pregunta en lenguaje natural, obtiene respuestas', href: '/productos/ai', accent: 'oklch(0.75 0.14 195)', num: '05' },
  { name: 'Avoqado Widget', desc: 'Ordenes y reservas embebidas en tu sitio', href: '/productos/widget', accent: 'oklch(0.72 0.15 340)', num: '06' },
];

const industries = [
  { name: 'Restaurantes y Bares', desc: 'Full-service, quick-service, cafeterias, food trucks', href: '/restaurants', icon: 'utensils' },
  { name: 'Retail', desc: 'Tiendas, boutiques, farmacias, conveniencia', href: '/retail', icon: 'store' },
  { name: 'Belleza y Bienestar', desc: 'Salones, spas, barberias, esteticas', href: '/beauty', icon: 'scissors' },
  { name: 'Servicios', desc: 'Consultorios, gimnasios, talleres, veterinarias', href: '/services', icon: 'briefcase' },
  { name: 'Entretenimiento', desc: 'Cines, antros, eventos, salones de fiestas', href: '/entertainment', icon: 'ticket' },
];

const resources = [
  { name: 'Precios', desc: 'Planes y costos transparentes', href: '/pricing', icon: 'tag' },
  { name: 'Blog', desc: 'Noticias, guias y consejos', href: '/blog', icon: 'book' },
  { name: 'Centro de Ayuda', desc: 'Tutoriales y documentacion', href: '/help', icon: 'help' },
  { name: 'API y Desarrolladores', desc: 'SDK, webhooks e integraciones', href: '/developers', icon: 'code' },
];

// ─── Simple SVG Icons (no lucide dependency for menu content) ───
function IndustryIcon({ type, className }: { type: string; className?: string }) {
  const cn = className || 'w-4 h-4';
  const props = { width: 16, height: 16, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  switch (type) {
    case 'utensils': return <svg {...props} className={cn}><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>;
    case 'store': return <svg {...props} className={cn}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/></svg>;
    case 'scissors': return <svg {...props} className={cn}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/><line x1="8.12" y1="8.12" x2="12" y2="12"/></svg>;
    case 'briefcase': return <svg {...props} className={cn}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>;
    case 'bed': return <svg {...props} className={cn}><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg>;
    case 'ticket': return <svg {...props} className={cn}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M13 5v2"/><path d="M13 17v2"/><path d="M13 11v2"/></svg>;
    case 'tag': return <svg {...props} className={cn}><path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/></svg>;
    case 'book': return <svg {...props} className={cn}><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>;
    case 'help': return <svg {...props} className={cn}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
    case 'code': return <svg {...props} className={cn}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>;
    default: return null;
  }
}

export default function NavigationMenu() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [isLightPage, setIsLightPage] = useState(false);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navRef = useRef<HTMLElement>(null);

  // Detect white/light background pages on mount
  useEffect(() => {
    const bodyBg = document.body.style.backgroundColor || '';
    const computedBg = window.getComputedStyle(document.body).backgroundColor;
    const explicitLight = document.body.dataset.navLight === 'true';
    const isLight =
      explicitLight ||
      bodyBg.includes('fff') ||
      bodyBg.includes('white') ||
      computedBg === 'rgb(255, 255, 255)';
    if (isLight) {
      setIsLightPage(true);
      setScrolled(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20 || activeMenu !== null || isLightPage);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeMenu, isLightPage]);

  useEffect(() => {
    setScrolled(window.scrollY > 20 || activeMenu !== null || mobileOpen || isLightPage);
  }, [activeMenu, mobileOpen, isLightPage]);

  const enter = useCallback((menu: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setActiveMenu(menu);
  }, []);

  const leave = useCallback(() => {
    hoverTimeout.current = setTimeout(() => setActiveMenu(null), 200);
  }, []);

  const keepOpen = useCallback(() => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
  }, []);

  const toggleMobile = () => {
    setMobileOpen(v => {
      const next = !v;
      if (next) {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
      } else {
        const savedY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        window.scrollTo(0, parseInt(savedY || '0') * -1);
      }
      return next;
    });
  };

  const openSearch = () => window.dispatchEvent(new CustomEvent('open-global-search'));

  const isDark = !scrolled && !activeMenu && !mobileOpen;

  return (
    <nav
      ref={navRef}
      className={`fixed top-[36px] left-0 right-0 z-[300] transition-all duration-300 font-sans ${
        scrolled
          ? 'bg-white/95 backdrop-blur-xl border-b border-black/5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
          : 'bg-transparent py-4'
      }`}
      onMouseLeave={leave}
    >
      <div className="max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center relative z-50">

          {/* Logo */}
          <a href="/" className="shrink-0">
            <img
              src={isDark ? '/imagotipo-white.png' : '/imagotipo.png'}
              alt="Avoqado"
              className="h-7 w-auto transition-all duration-300"
              width={160}
              height={32}
            />
          </a>

          {/* Desktop Nav Items */}
          <div className="hidden lg:flex items-center gap-0.5">
            {(['productos', 'industrias', 'recursos'] as const).map(key => (
              <button
                key={key}
                onMouseEnter={() => enter(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  activeMenu === key
                    ? 'bg-gray-100 text-gray-900'
                    : isDark
                      ? 'text-white/80 hover:text-white hover:bg-white/8'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeMenu === key ? 'rotate-180' : ''}`} />
              </button>
            ))}
            <a
              href="/traje-a-la-medida"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isDark ? 'text-white/80 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Traje a la medida
            </a>
            <a
              href="/labs"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isDark ? 'text-white/80 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Labs
            </a>
            <a
              href="/pricing"
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                isDark ? 'text-white/80 hover:text-white hover:bg-white/8' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Precios
            </a>
          </div>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={openSearch}
              className={`p-2 rounded-full transition-colors ${isDark ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
              aria-label="Buscar"
            >
              <Search className="w-4.5 h-4.5" />
            </button>
            <a
              href="https://dashboard.avoqado.io/login"
              className={`text-sm font-medium transition-colors ${isDark ? 'text-white/80 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Iniciar sesion
            </a>
            <a
              href="https://dashboard.avoqado.io/signup"
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                isDark
                  ? 'bg-white text-black hover:bg-gray-100 hover:-translate-y-0.5'
                  : 'bg-black text-white hover:bg-gray-800 hover:-translate-y-0.5'
              }`}
            >
              Comienza
            </a>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <button onClick={openSearch} className={`p-2 rounded-full ${isDark ? 'text-white/70' : 'text-gray-500'}`}>
              <Search className="w-5 h-5" />
            </button>
            <button onClick={toggleMobile} className={`p-2 rounded-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ═══ Desktop Mega Menu ═══ */}
      <div
        className={`absolute top-full left-0 w-full transition-all duration-300 ease-out ${
          activeMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-1 pointer-events-none'
        }`}
        onMouseEnter={keepOpen}
        onMouseLeave={leave}
      >
        <div className="bg-white border-b border-black/5 shadow-xl shadow-black/5">
          <div className="max-w-[1400px] mx-auto px-6 py-8">
            {activeMenu === 'productos' && <ProductsDropdown />}
            {activeMenu === 'industrias' && <IndustriesDropdown />}
            {activeMenu === 'recursos' && <ResourcesDropdown />}
          </div>
        </div>
      </div>

      {/* ═══ Mobile Menu ═══ */}
      <div className={`fixed inset-0 top-[88px] bg-white z-30 lg:hidden overflow-y-auto transition-all duration-300 ${mobileOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="p-5 pb-32 space-y-1">
          {/* Mobile sections */}
          {[
            { key: 'productos', label: 'Productos', content: <MobileProducts /> },
            { key: 'industrias', label: 'Industrias', content: <MobileIndustries /> },
            { key: 'recursos', label: 'Recursos', content: <MobileResources /> },
          ].map(({ key, label, content }) => (
            <div key={key} className="border-b border-gray-100">
              <button
                onClick={() => setMobileSection(mobileSection === key ? null : key)}
                className="flex items-center justify-between w-full py-4 text-base font-semibold text-gray-900"
              >
                {label}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${mobileSection === key ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${mobileSection === key ? 'max-h-[600px] opacity-100 pb-4' : 'max-h-0 opacity-0'}`}>
                {content}
              </div>
            </div>
          ))}

          <a href="/traje-a-la-medida" className="flex items-center justify-between w-full py-4 text-base font-semibold text-gray-900 border-b border-gray-100">
            Traje a la medida
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </a>
          <a href="/labs" className="flex items-center justify-between w-full py-4 text-base font-semibold text-gray-900 border-b border-gray-100">
            Labs
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </a>
          <a href="/pricing" className="flex items-center justify-between w-full py-4 text-base font-semibold text-gray-900 border-b border-gray-100">
            Precios
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </a>

          {/* Mobile CTAs */}
          <div className="pt-6 space-y-3">
            <a href="https://dashboard.avoqado.io/signup" className="flex items-center justify-center w-full p-3.5 rounded-xl bg-black text-white font-semibold text-sm">
              Comienza
            </a>
            <a href="https://dashboard.avoqado.io/login" className="flex items-center justify-center w-full p-3.5 rounded-xl bg-gray-50 text-gray-900 font-medium text-sm">
              Iniciar sesion
            </a>
            <a href="/contact" className="flex items-center justify-center w-full p-3.5 rounded-xl border border-gray-200 text-gray-700 font-medium text-sm">
              Contactar ventas
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════
// DESKTOP DROPDOWN CONTENT
// ═══════════════════════════════════════════════

function ProductsDropdown() {
  return (
    <div className="grid grid-cols-12 gap-8">
      {/* Products grid — 8 cols */}
      <div className="col-span-8">
        <div className="grid grid-cols-2 gap-x-10 gap-y-0.5">
          {products.map(p => (
            <a key={p.num} href={p.href} className="group flex items-baseline gap-3 py-3 border-b border-transparent hover:border-gray-100 transition-colors">
              <span className="text-[10px] font-mono text-gray-300 tabular-nums w-4 shrink-0">{p.num}</span>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-gray-900 group-hover:text-black transition-colors">{p.name}</span>
                <p className="text-xs text-gray-400 mt-0.5">{p.desc}</p>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-200 group-hover:text-gray-400 opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5 shrink-0 mt-0.5" />
            </a>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <a href="/productos" className="text-sm font-medium text-avoqado-green hover:underline inline-flex items-center gap-1">
            Ver todos los productos <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Promo card — 4 cols */}
      <div className="col-span-4">
        <div className="rounded-2xl p-6 h-full flex flex-col justify-between" style={{ background: 'oklch(0.97 0.005 155)' }}>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-avoqado-green font-semibold mb-3">Demo interactiva</div>
            <h4 className="text-base font-semibold text-gray-900 mb-2">Prueba el ecosistema completo</h4>
            <p className="text-sm text-gray-600 leading-relaxed">Accede al dashboard con datos de ejemplo. Sin tarjeta, sin compromiso.</p>
          </div>
          <a
            href="https://demo.dashboard.avoqado.io"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-avoqado-green hover:underline"
          >
            Probar demo gratis <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function IndustriesDropdown() {
  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-8">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-4">Sectores</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {industries.map(ind => (
            <a key={ind.name} href={ind.href} className="group flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-sm flex items-center justify-center text-gray-500 group-hover:text-avoqado-green transition-all">
                <IndustryIcon type={ind.icon} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{ind.name}</span>
                <p className="text-xs text-gray-500 mt-0.5">{ind.desc}</p>
              </div>
            </a>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400">35+ tipos de negocio soportados. <a href="/contact" className="text-avoqado-green hover:underline">Consulta tu industria</a></p>
        </div>
      </div>
      <div className="col-span-4">
        <div className="rounded-2xl p-6 h-full" style={{ background: 'oklch(0.97 0.005 155)' }}>
          <div className="text-[10px] uppercase tracking-widest text-avoqado-green font-semibold mb-3">Multi-sector</div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">35+ tipos de negocio</h4>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">Un ecosistema que se adapta a tu industria. Modulos especializados, flujos personalizados, y soporte para operaciones unicas.</p>
          <a href="/traje-a-la-medida" className="text-sm font-semibold text-avoqado-green hover:underline inline-flex items-center gap-1">
            Traje a la medida <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

function ResourcesDropdown() {
  return (
    <div className="grid grid-cols-12 gap-8">
      <div className="col-span-8">
        <div className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-4">Recursos</div>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1">
          {resources.map(res => (
            <a key={res.name} href={res.href} className="group flex items-center gap-3 p-2.5 -mx-2.5 rounded-xl hover:bg-gray-50 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-sm flex items-center justify-center text-gray-500 group-hover:text-avoqado-green transition-all">
                <IndustryIcon type={res.icon} />
              </div>
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900">{res.name}</span>
                <p className="text-xs text-gray-500 mt-0.5">{res.desc}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
      <div className="col-span-4">
        <div className="rounded-2xl p-6 h-full" style={{ background: 'oklch(0.97 0.005 155)' }}>
          <div className="text-[10px] uppercase tracking-widest text-avoqado-green font-semibold mb-3">Contacto</div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">Habla con el equipo</h4>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">Te ayudamos a elegir el plan correcto para tu negocio. Sin presion.</p>
          <a href="/contact" className="text-sm font-semibold text-avoqado-green hover:underline inline-flex items-center gap-1">
            Contactar ventas <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// MOBILE CONTENT
// ═══════════════════════════════════════════════

function MobileProducts() {
  return (
    <div className="space-y-0.5">
      {products.map(p => (
        <a key={p.num} href={p.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
          <span className="text-[10px] font-mono text-gray-300 w-4">{p.num}</span>
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-900">{p.name}</span>
            <p className="text-xs text-gray-500">{p.desc}</p>
          </div>
        </a>
      ))}
      <a href="/productos" className="block p-2.5 text-sm font-medium text-avoqado-green">
        Ver todos los productos
      </a>
    </div>
  );
}

function MobileIndustries() {
  return (
    <div className="space-y-1">
      {industries.map(ind => (
        <a key={ind.name} href={ind.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            <IndustryIcon type={ind.icon} />
          </div>
          <span className="text-sm font-medium text-gray-900">{ind.name}</span>
        </a>
      ))}
    </div>
  );
}

function MobileResources() {
  return (
    <div className="space-y-1">
      {resources.map(res => (
        <a key={res.name} href={res.href} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50">
          <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
            <IndustryIcon type={res.icon} />
          </div>
          <span className="text-sm font-medium text-gray-900">{res.name}</span>
        </a>
      ))}
    </div>
  );
}
