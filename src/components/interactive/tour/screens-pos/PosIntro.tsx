/**
 * PosIntro (p-intro) — la escena de apertura del flujo P: una computadora
 * (ventana de Windows) y una tablet lado a lado corriendo el MISMO POS.
 * Al tocar "Entrar al POS" (`merged`) los dos dispositivos se fusionan hacia
 * el centro (animación CSS .pos-merging) y el crossfade a p-pos completa la
 * ilusión de que quedó UNA sola pantalla.
 *
 * El mini-POS de cada dispositivo es el mismo layout (grid de productos +
 * ticket) en miniatura — idéntico en ambos a propósito: ese ES el mensaje.
 */

/** Mini mock del POS — idéntico en laptop y tablet (mismo sistema). */
function MiniPos() {
  return (
    <div className="pmini" aria-hidden="true">
      <span className="pmini-bar" />
      <div className="pmini-body">
        <div className="pmini-grid">
          {Array.from({ length: 6 }, (_, i) => (
            <span className="pmini-card" key={i} />
          ))}
        </div>
        <div className="pmini-ticket">
          <span />
          <span />
          <span className="pmini-pay" />
        </div>
      </div>
    </div>
  );
}

interface Props {
  merged: boolean;
}

export default function PosIntro({ merged }: Props) {
  return (
    <section className={`web-screen pos p-intro${merged ? ' pos-merging' : ''}`} data-screen="p-intro">
      <p className="p-intro-kicker">Punto de venta Avoqado</p>
      <h2 className="p-intro-title">El mismo POS en todos tus equipos</h2>
      <p className="p-intro-sub">Windows · iPad · iPhone · Android — una sola cuenta, un solo catálogo.</p>

      <div className="pos-devices" aria-hidden="true">
        {/* Computadora (ventana Windows) */}
        <div className="pdev pdev-laptop">
          <div className="pdev-titlebar">
            <span className="pdev-title">Avoqado POS — Caja 1</span>
            <span className="pdev-winbtns">
              <i />
              <i />
              <i />
            </span>
          </div>
          <MiniPos />
          <span className="pdev-label">Windows</span>
        </div>

        {/* Tablet */}
        <div className="pdev pdev-tablet">
          <span className="pdev-cam" />
          <MiniPos />
          <span className="pdev-label">iPad · Android</span>
        </div>
      </div>

      <button type="button" className="p-intro-cta" data-t="pos-enter">
        Entrar al POS
      </button>
    </section>
  );
}
