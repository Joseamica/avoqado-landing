import ProductSection from './ProductSection';
import QrLivingPreview from './QrLivingPreview';

export default function QrProductSection() {
  return (
    <ProductSection
      id="product-04"
      number="04"
      label="Pago del cliente"
      accentColor="oklch(0.78 0.14 75)"
      title="Avoqado QR"
      description="Tu cliente escanea el QR, ve la cuenta, divide con sus amigos, deja propina y paga — todo desde su celular. Sin descargar app, sin esperar al mesero. Conectado en tiempo real con tu TPV y Dashboard."
      tags={["Sin app", "Split de cuenta", "Propina digital", "Tiempo real"]}
      linkText="Explorar QR"
      linkHref="/productos/qr"
      reversed={true}
      height={350}
      bgClass="bg-white"
      light={true}
    >
      {(scrollYProgress) => <QrLivingPreview scrollYProgress={scrollYProgress} />}
    </ProductSection>
  );
}
