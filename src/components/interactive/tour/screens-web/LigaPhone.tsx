/**
 * LigaPhone — vista previa viva del checkout (pay.avoqado.io) dentro del
 * wizard de liga de pago, como el PaymentLinkPreview real del dashboard.
 * Refleja título/descripción/monto conforme se editan.
 */
interface Props {
  title: string;
  description: string;
  amountLabel: string;
}

export default function LigaPhone({ title, description, amountLabel }: Props) {
  return (
    <div className="lg-phone" aria-hidden="true">
      <div className="lg-phone-screen">
        <span className="lg-phone-logo" />
        <span className="lg-phone-venue">ESTUDIO LUMINA</span>
        <b className="lg-phone-title">{title}</b>
        <div className="lg-phone-amount">{amountLabel}</div>
        <p className="lg-phone-desc">{description}</p>
        <span className="lg-phone-cta">Proceso de pago</span>
        <span className="lg-phone-foot">
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
            <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
          </svg>
          Pago seguro con Avoqado
        </span>
      </div>
    </div>
  );
}
