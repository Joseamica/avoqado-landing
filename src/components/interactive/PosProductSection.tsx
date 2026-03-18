import ProductSection from './ProductSection';
import PosLivingPreview from './PosLivingPreview';

export default function PosProductSection() {
  return (
    <ProductSection
      id="product-03"
      number="03"
      label="Punto de venta"
      accentColor="oklch(0.68 0.15 290)"
      title="Avoqado POS"
      description="App de punto de venta para cualquier negocio. Gestiona productos, ordenes y cobros desde tableta o celular. Mesas para restaurantes, catalogo para retail, turnos, comisiones y modo kiosko. iOS y Android."
      tags={["iOS + Android", "Restaurantes + Retail", "Control de turnos", "Modo Kiosko"]}
      linkText="Explorar POS"
      linkHref="/productos/pos"
      height={350}
    >
      {(scrollYProgress) => <PosLivingPreview scrollYProgress={scrollYProgress} />}
    </ProductSection>
  );
}
