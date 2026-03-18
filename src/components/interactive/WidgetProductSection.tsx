import ProductSection from './ProductSection';
import WidgetLivingPreview from './WidgetLivingPreview';

export default function WidgetProductSection() {
  return (
    <ProductSection
      id="product-06"
      number="06"
      label="Tu negocio en cualquier sitio"
      accentColor="oklch(0.72 0.15 340)"
      title="Avoqado Widget"
      description="Incrusta un widget de ordenes, pagos y reservaciones en cualquier sitio web. Tus clientes ordenan y pagan sin salir de tu pagina. Una linea de codigo, cero friccion."
      tags={["Embeddable", "Ordenes online", "Pagos integrados", "Reservaciones"]}
      linkText="Explorar Widget"
      linkHref="/productos/widget"
      reversed={true}
      height={350}
      bgClass="bg-white"
      light={true}
    >
      {(scrollYProgress) => <WidgetLivingPreview scrollYProgress={scrollYProgress} />}
    </ProductSection>
  );
}
