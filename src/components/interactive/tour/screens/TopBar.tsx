/** Shared TPV top bar (AvoqadoTopBar replica): back chevron + title + optional step subtitle. */
interface Props {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: Props) {
  return (
    <div className="topbar">
      <button type="button" className="back" aria-label="Atrás">
        &#8249;
      </button>
      <div className="titles">
        <div className="title">{title}</div>
        {subtitle ? <div className="subtitle">{subtitle}</div> : null}
      </div>
      <span />
    </div>
  );
}
