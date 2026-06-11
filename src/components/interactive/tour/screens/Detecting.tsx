/**
 * 5. DetectingCard — "Acerca o inserta la tarjeta": icono contactless con
 * ondas pulsantes y la tarjeta del cliente entrando (animación CSS al
 * activarse la pantalla — paso automático del tour).
 */
import { DEMO_TOTAL_LABEL } from '../flows';

export default function Detecting() {
  return (
    <section className="tpv-screen screen-detecting" data-screen="detecting">
      <div className="detect-body">
        <div className="detect-amount">{DEMO_TOTAL_LABEL}</div>
        <svg className="detect-icon" width="104" height="84" viewBox="0 0 104 84" fill="none" aria-hidden="true">
          <rect x="8" y="20" width="62" height="44" rx="7" stroke="#FAFAFA" strokeWidth="2.4" />
          <line x1="8" y1="32" x2="70" y2="32" stroke="#FAFAFA" strokeWidth="2.4" />
          <path className="wave" d="M78 32a16 16 0 0 1 0 20" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
          <path className="wave w2" d="M86 25a26 26 0 0 1 0 34" stroke="#10B981" strokeWidth="3" strokeLinecap="round" />
        </svg>
        <p className="detect-text">Acerca o inserta la tarjeta</p>
        <div className="pay-card" aria-hidden="true">
          <div className="pc-top">
            <span className="pc-brand">avoqado</span>
            <svg className="pc-ctl" width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M5 6.5a5 5 0 0 1 0 5" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M8 4.5a8.2 8.2 0 0 1 0 9" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
              <path d="M11 2.5a11.5 11.5 0 0 1 0 13" stroke="rgba(255,255,255,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="pc-chip" />
          <div className="pc-num">
            <span>&bull;&bull;&bull;&bull;</span>
            <span>&bull;&bull;&bull;&bull;</span>
            <span>&bull;&bull;&bull;&bull;</span>
            <span>4242</span>
          </div>
          <div className="pc-bottom">
            <div>
              <span className="pc-exp">12/29</span>
              <span className="pc-holder">Cliente Demo</span>
            </div>
            <span className="pc-visa">VISA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
