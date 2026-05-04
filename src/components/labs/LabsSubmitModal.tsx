import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { ExtractedFields, SubmitResponse } from '../../lib/labs/types';

interface Props {
  fields: ExtractedFields;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<SubmitResponse>;
}

export default function LabsSubmitModal({ fields, onClose, onConfirm }: Props) {
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    return () => {
      const savedY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, parseInt(savedY || '0') * -1);
    };
  }, []);

  const handleSend = async () => {
    setSubmitting(true);
    setError(null);
    const result = await onConfirm(notes);
    if (!result.success) {
      setError(result.message);
      setSubmitting(false);
    }
  };

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      data-theme="labs"
      className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl bg-[color:var(--labs-bg-elevated)] border border-[color:var(--labs-rule)] shadow-2xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-serif italic text-2xl md:text-3xl text-[color:var(--labs-ink)] mb-2 leading-tight">
          ¿Mando esto a Jose?
        </h2>
        <p className="text-sm text-[color:var(--labs-ink-muted)] mb-5">
          Jose te confirma timeline y costo en menos de 24 horas.
        </p>

        <div className="space-y-2 mb-5 text-sm">
          <div>
            <span className="text-[color:var(--labs-ink-muted)]">Tipo:</span>{' '}
            <span className="text-[color:var(--labs-ink)]">{fields.projectType}</span>
          </div>
          <div>
            <span className="text-[color:var(--labs-ink-muted)]">Contacto:</span>{' '}
            <span className="text-[color:var(--labs-ink)]">
              {fields.contact?.name} ({fields.contact?.email})
            </span>
          </div>
        </div>

        <label className="block text-xs uppercase tracking-widest text-[color:var(--labs-ink-muted)] mb-2">
          ¿Algo más que quieras agregar para Jose? (opcional)
        </label>
        <textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Cualquier detalle extra que no salió en la conversación…"
          className="w-full bg-[color:var(--labs-bg)] border border-[color:var(--labs-rule)] rounded-lg p-3 text-sm text-[color:var(--labs-ink)] placeholder:text-[color:var(--labs-ink-muted)] outline-none focus:border-[color:var(--labs-accent)]"
        />

        {error && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-full text-sm font-medium border border-[color:var(--labs-rule)] text-[color:var(--labs-ink)] hover:bg-[color:var(--labs-bg)]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSend}
            disabled={submitting}
            className="flex-1 px-4 py-3 rounded-full text-sm font-medium bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white disabled:opacity-50"
          >
            {submitting ? 'Enviando…' : 'Enviar a Jose'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
