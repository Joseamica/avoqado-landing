import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Menu, X, ArrowRight, CreditCard, Monitor, Smartphone, Store, Globe, Users, BookOpen, HelpCircle, Code } from 'lucide-react';

export default function NavigationMenu() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20 || activeMenu !== null || mobileMenuOpen);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeMenu, mobileMenuOpen]);

  // Sync scroll state immediately when menu opens
  useEffect(() => {
    setScrolled(window.scrollY > 20 || activeMenu !== null || mobileMenuOpen);
  }, [activeMenu, mobileMenuOpen]);

  const handleMouseEnter = (menu: string) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setActiveMenu(menu);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150); // Small delay for smoother transition
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : '';
  };
  
  const openSearch = () => {
    window.dispatchEvent(new CustomEvent('open-global-search'));
  };

  const isDark = !scrolled && !activeMenu && !mobileMenuOpen;

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 font-sans ${
        scrolled ? 'bg-white/90 backdrop-blur-md border-b border-gray-100 py-3 shadow-sm' : 'bg-transparent py-5'
      }`}
      onMouseLeave={handleMouseLeave}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center relative z-50">
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <a href="/" className="block">
              <img 
                src={isDark ? "/imagotipo-white.png" : "/imagotipo.png"} 
                alt="Avoqado" 
                className="h-8 w-auto transition-all duration-300"
                width={180}
                height={36}
              />
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <NavItem 
              label="Productos" 
              active={activeMenu === 'products'} 
              isDark={isDark}
              onMouseEnter={() => handleMouseEnter('products')}
            />
            <NavItem 
              label="Industrias" 
              active={activeMenu === 'industries'} 
              isDark={isDark}
              onMouseEnter={() => handleMouseEnter('industries')}
            />
            <NavItem 
              label="Recursos" 
              active={activeMenu === 'resources'} 
              isDark={isDark}
              onMouseEnter={() => handleMouseEnter('resources')}
            />
          </div>

          {/* Right Actions */}
          <div className="hidden lg:flex items-center gap-4">
            <button 
              onClick={openSearch}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
              aria-label="Buscar"
            >
              <Search className="w-5 h-5" />
            </button>
            <a 
              href="https://dashboard.avoqado.io/login"
              className={`text-sm font-medium transition-colors ${
                isDark ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-600'
              }`}
            >
              Iniciar sesión
            </a>
            <a 
              href="/contact"
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-sm ${
                isDark 
                  ? 'bg-white text-black hover:bg-gray-100' 
                  : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              Contactar ventas
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-4">
             <button 
              onClick={openSearch}
              className={`p-2 rounded-full transition-colors ${
                isDark ? 'text-white hover:bg-white/10' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={toggleMobileMenu}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'text-white hover:bg-white/10' : 'text-gray-900 hover:bg-gray-100'
              }`}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdown Container */}
      <div 
        className={`absolute top-full left-0 w-full bg-white border-b border-gray-100 shadow-xl overflow-hidden transition-all duration-300 ease-in-out z-40 ${
          activeMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
        }`}
        style={{ maxHeight: activeMenu ? '600px' : '0' }}
        onMouseEnter={() => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
        }}
        onMouseLeave={handleMouseLeave}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {activeMenu === 'products' && <ProductsContent />}
          {activeMenu === 'industries' && <IndustriesContent />}
          {activeMenu === 'resources' && <ResourcesContent />}
        </div>
      </div>

       {/* Mobile Menu Overlay */}
       <div 
        className={`fixed inset-0 top-16 bg-white z-30 lg:hidden overflow-y-auto transition-all duration-300 ${
          mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="p-6 space-y-6 pb-24">
            <MobileSection title="Productos">
                <ProductsContent mobile />
            </MobileSection>
            <MobileSection title="Industrias">
                <IndustriesContent mobile />
            </MobileSection>
            <MobileSection title="Recursos">
                <ResourcesContent mobile />
            </MobileSection>
             <div className="pt-6 border-t border-gray-100 space-y-4">
                <a href="https://dashboard.avoqado.io/login" className="flex items-center justify-between w-full p-4 rounded-xl bg-gray-50 text-gray-900 font-medium">
                    Iniciar sesión
                    <ArrowRight className="w-4 h-4" />
                </a>
                <a href="/contact" className="flex items-center justify-center w-full p-4 rounded-xl bg-black text-white font-bold">
                    Contactar ventas
                </a>
            </div>
        </div>
      </div>
    </nav>
  );
}

function NavItem({ label, active, isDark, onMouseEnter }: { label: string, active: boolean, isDark: boolean, onMouseEnter: () => void }) {
  return (
    <button
      onMouseEnter={onMouseEnter}
      className={`group px-4 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-1 ${
        active 
          ? 'bg-gray-100 text-gray-900' 
          : isDark 
            ? 'text-white/90 hover:bg-white/10 hover:text-white' 
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {label}
      <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${active ? 'rotate-180' : ''}`} />
    </button>
  );
}

function MobileSection({ title, children }: { title: string, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-gray-100 pb-4">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full py-2 text-lg font-bold text-gray-900"
            >
                {title}
                <ChevronDown className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`mt-2 space-y-2 overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {children}
            </div>
        </div>
    )
}


// --- Content Components ---

function ProductsContent({ mobile }: { mobile?: boolean }) {
    const gridClass = mobile ? "grid grid-cols-1 gap-4" : "grid grid-cols-3 gap-12";
    
    return (
      <div className={gridClass}>
        <div className="space-y-6">
          <SectionHeader title="Hardware y Pagos" />
          <div className="space-y-4">
            <MenuLink href="/products/terminal" icon={CreditCard} title="Terminal Inteligente" desc="Pagos, impresión y software todo en uno" mobile={mobile} />
            <MenuLink href="/products/pos" icon={Monitor} title="Punto de Venta" desc="Sistema operativo para gestionar tu negocio" mobile={mobile} />
            <MenuLink href="/products/payments" icon={Smartphone} title="Pagos en Línea" desc="Links de pago y checkout para e-commerce" mobile={mobile} />
          </div>
        </div>
        <div className="space-y-6">
          <SectionHeader title="Gestión" />
          <div className="space-y-4">
             <MenuLink href="/products/dashboard" icon={Globe} title="Web Dashboard" desc="Administra inventario, personal y reportes" mobile={mobile} />
             <MenuLink href="/products/kitchen" icon={Store} title="Kitchen Display" desc="Sistema de visualización para cocina" mobile={mobile} />
          </div>
        </div>
        {!mobile && (
           <div className="bg-gray-50 p-6 rounded-2xl">
               <h4 className="font-bold text-gray-900 mb-2">¿Nuevo en Avoqado?</h4>
               <p className="text-sm text-gray-600 mb-4">Descubre cómo podemos ayudarte a crecer tu negocio con una demo personalizada.</p>
               <a href="/contact" className="text-sm font-semibold text-avoqado-green hover:underline flex items-center">
                  Ver demostración <ArrowRight className="w-4 h-4 ml-1" />
               </a>
           </div>
        )}
      </div>
    );
  }

function IndustriesContent({ mobile }: { mobile?: boolean }) {
    const gridClass = mobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-4 gap-8";
    return (
      <div className={gridClass}>
        <MenuLink href="/restaurants" icon={Store} title="Restaurantes" desc="Para cafeterías, bares y alta cocina" mobile={mobile} />
        <MenuLink href="/retail" icon={CreditCard} title="Retail" desc="Tiendas de ropa, abarrotes y más" mobile={mobile} />
        <MenuLink href="/services" icon={Users} title="Servicios" desc="Consultorios, salones y profesionales" mobile={mobile} />
        <MenuLink href="/entertainment" icon={Monitor} title="Entretenimiento" desc="Cines, teatros y eventos" mobile={mobile} />
      </div>
    );
}

function ResourcesContent({ mobile }: { mobile?: boolean }) {
    const gridClass = mobile ? "grid grid-cols-1 gap-2" : "grid grid-cols-3 gap-8";
    return (
      <div className={gridClass}>
         <MenuLink href="/blog" icon={BookOpen} title="Blog" desc="Noticias, guías y consejos" mobile={mobile} />
         <MenuLink href="/help" icon={HelpCircle} title="Centro de Ayuda" desc="Tutoriales y documentación" mobile={mobile} />
         <MenuLink href="/developers" icon={Code} title="Desarrolladores" desc="APIs y herramientas de integración" mobile={mobile} />
      </div>
    );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h3>
    )
}

function MenuLink({ href, icon: Icon, title, desc, mobile }: any) {
    return (
      <a href={href} className={`group block rounded-xl transition-colors ${mobile ? 'p-2' : 'p-0 hover:bg-gray-50 -m-3 p-3'}`}>
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg bg-gray-100 group-hover:bg-white group-hover:shadow-sm transition-all ${mobile ? 'hidden' : 'block'}`}>
            <Icon className="w-5 h-5 text-gray-600 group-hover:text-avoqado-green" />
          </div>
          <div>
            <div className="font-semibold text-gray-900 group-hover:text-black flex items-center">
                {title}
                {mobile && <ArrowRight className="w-3 h-3 ml-2 opacity-50" />}
            </div>
            {!mobile && <div className="text-xs text-gray-500 mt-0.5">{desc}</div>}
          </div>
        </div>
      </a>
    );
}
