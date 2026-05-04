interface Props {
  onRestart: () => void;
}

export default function LabsSuccessScreen({ onRestart }: Props) {
  return (
    <div data-theme="labs" className="w-full max-w-2xl mx-auto px-6 py-24 text-center">
      <svg
        width="56"
        height="56"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mx-auto mb-6 text-[color:var(--labs-accent)]"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9 12l2 2 4-4" />
      </svg>
      <h2 className="font-serif italic text-4xl md:text-5xl text-[color:var(--labs-ink)] mb-4 leading-tight">
        Brief enviado.
      </h2>
      <p className="text-lg text-[color:var(--labs-ink-muted)] mb-10 max-w-md mx-auto">
        Jose lo revisa personalmente. Te confirma timeline y costo en menos de 24 horas.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="/"
          className="px-6 py-3 rounded-full text-sm font-medium bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white transition-colors"
        >
          Volver al inicio
        </a>
        <button
          onClick={onRestart}
          className="px-6 py-3 rounded-full text-sm font-medium border border-[color:var(--labs-rule)] text-[color:var(--labs-ink)] hover:bg-[color:var(--labs-bg-elevated)] transition-colors"
        >
          Empezar otro brief
        </button>
      </div>
    </div>
  );
}
