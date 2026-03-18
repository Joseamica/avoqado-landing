import ProductSection from './ProductSection';
import DashboardLivingPreview from './DashboardLivingPreview';

/**
 * Dashboard product section with Living Preview mockup.
 * Wraps ProductSection + DashboardLivingPreview together
 * since Astro templates can't use render prop children.
 */
export default function DashboardProductSection() {
  return (
    <ProductSection
      id="product-01"
      number="01"
      label="Control central"
      accentColor="oklch(0.72 0.14 240)"
      title="Dashboard Web"
      description="Panel de control para gestionar todo tu negocio. Inventario FIFO, personal con 9 niveles de rol, comisiones escalonadas, reservaciones, reportes automatizados y un asistente de IA que responde preguntas sobre tu negocio en lenguaje natural."
      tags={["31 modulos", "Asistente IA", "Multi-sucursal", "White-label"]}
      linkText="Explorar Dashboard"
      linkHref="/productos/dashboard"
      height={350}
    >
      {(scrollYProgress) => <DashboardLivingPreview scrollYProgress={scrollYProgress} />}
    </ProductSection>
  );
}
