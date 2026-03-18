import ProductSection from './ProductSection';
import TpvLivingPreview from './TpvLivingPreview';

export default function TpvProductSection() {
  return (
    <ProductSection
      id="product-02"
      number="02"
      label="Terminal de cobro"
      accentColor="#69E185"
      title="Avoqado TPV"
      description="Terminal de cobro tipo handheld para tu staff. Cobra con tarjeta (NFC, chip, banda), imprime tickets al instante, opera sin internet y sincroniza automaticamente. Multi-merchant en una sola terminal y gestion remota desde el dashboard."
      tags={["NFC + Chip + Banda", "Offline-first", "Impresora integrada", "Gestion remota"]}
      linkText="Explorar TPV"
      linkHref="/productos/tpv"
      reversed={true}
      height={350}
      bgClass="bg-white"
      light={true}
    >
      {(scrollYProgress) => <TpvLivingPreview scrollYProgress={scrollYProgress} />}
    </ProductSection>
  );
}
