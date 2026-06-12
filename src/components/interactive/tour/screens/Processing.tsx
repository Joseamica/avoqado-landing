/**
 * 6. Processing — fiel al real (PaymentLoadingContent): AvoqadoTopBar
 * "Pago con Tarjeta" + card surface con spinner primary y "Procesando...".
 * Paso automático del tour.
 */
import TopBar from './TopBar';

export default function Processing() {
  return (
    <section className="tpv-screen" data-screen="processing">
      <TopBar title="Pago con Tarjeta" />
      <div className="proc-body">
        <div className="proc-card">
          <div className="spinner" aria-hidden="true" />
          <p className="proc-text">Procesando...</p>
        </div>
      </div>
    </section>
  );
}
