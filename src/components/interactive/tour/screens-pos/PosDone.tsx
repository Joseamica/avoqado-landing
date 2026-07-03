/**
 * PosDone (p-done) — el cierre del flujo P: la venta cobrada en la terminal
 * regresa al POS ya registrada y sincronizada en TODOS los equipos — el
 * mensaje final del flujo (iOS/Android/Windows, un solo sistema).
 * Montos exactos: $348.10 ($295.00 + $53.10 de propina); María G. +29 pts
 * (mismos números que la cadena TPV y la IA).
 */
export default function PosDone() {
  return (
    <section className="web-screen pos p-done" data-screen="p-done">
      <span className="p-done-check" aria-hidden="true">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" fill="#7ADD2C" />
          <path d="m7.8 12.4 2.7 2.7 5.7-5.9" stroke="#17300A" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <h2 className="p-done-title">Venta registrada</h2>
      <p className="p-done-sub">
        #1042 · <b>$348.10</b> · Tarjeta en Terminal Avoqado
      </p>

      <div className="p-done-rows">
        <div className="p-done-row">
          <b>Ticket cerrado en tu POS</b>
          <span>$295.00 + $53.10 de propina</span>
        </div>
        <div className="p-done-row">
          <b>María G. sumó 29 puntos</b>
          <span>y la autofactura ya está en su recibo</span>
        </div>
        <div className="p-done-row">
          <b>Sincronizada en todos tus equipos</b>
          <span>Windows · iPad · iPhone · Android — y en tu dashboard</span>
        </div>
      </div>
    </section>
  );
}
