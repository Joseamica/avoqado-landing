import ProductSection from './ProductSection';
import AiLivingPreview from './AiLivingPreview';

/**
 * AI Assistant product section with Living Preview mockup.
 * Wraps ProductSection + AiLivingPreview together
 * since Astro templates can't use render prop children.
 */
export default function AiProductSection() {
  return (
    <ProductSection
      id="product-05"
      number="05"
      label="Inteligencia artificial"
      accentColor="oklch(0.75 0.14 195)"
      title="Asistente IA"
      description="Pregunta lo que sea sobre tu negocio en lenguaje natural. Genera graficas, exporta reportes en Excel y toma acciones directas — crear promos, ajustar precios o enviar notificaciones. Todo desde una conversacion."
      tags={["Text-to-SQL", "Graficas en vivo", "Export Excel", "Acciones directas"]}
      linkText="Explorar Asistente IA"
      linkHref="/productos/ai"
      height={350}
    >
      {(scrollYProgress) => <AiLivingPreview scrollYProgress={scrollYProgress} />}
    </ProductSection>
  );
}
