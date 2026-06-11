/** 6. Processing — spinner "Procesando pago…" (paso automático del tour). */
export default function Processing() {
  return (
    <section className="tpv-screen" data-screen="processing">
      <div className="proc-body">
        <div className="spinner" aria-hidden="true" />
        <p className="proc-text">Procesando pago&hellip;</p>
      </div>
    </section>
  );
}
