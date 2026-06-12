/**
 * Shared TPV top bar (AvoqadoTopBar replica): surface #2A2A2A strip with a
 * 1px outline border, full Material ArrowBack and title + optional step
 * subtitle. The real Cobrar header is left-aligned (CheckoutScreen.kt);
 * payment screens center the title.
 */
interface Props {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}

export default function TopBar({ title, subtitle, align = 'center' }: Props) {
  return (
    <div className={`topbar${align === 'left' ? ' left' : ''}`}>
      <button type="button" className="back" aria-label="Atrás">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor" />
        </svg>
      </button>
      <div className="titles">
        <div className="title">{title}</div>
        {subtitle ? <div className="subtitle">{subtitle}</div> : null}
      </div>
      <span />
    </div>
  );
}
