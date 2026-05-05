import { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowUp, RotateCcw } from 'lucide-react';
import type { ChatMessage, ConversationState, ExtractedFields, SubmitResponse } from '../../lib/labs/types';
import { isComplete } from '../../lib/labs/types';
import LabsSummary from './LabsSummary';
import LabsMessage from './LabsMessage';
import LabsSubmitModal from './LabsSubmitModal';
import LabsSuccessScreen from './LabsSuccessScreen';

const SUGGESTION_LABELS: { text: string; hint: string }[] = [
  { text: 'Un dashboard que conecte mi POS con WhatsApp', hint: 'Dashboard · WhatsApp' },
  { text: 'Un agente que conteste reservaciones automáticamente', hint: 'Agente AI · Reservas' },
  { text: 'Un reporte diario de ventas que me llegue al correo', hint: 'Reporte · Email' },
];

const STORAGE_KEY = 'avoqado-labs-conversation-v1';
const IDLE_MS = 24 * 60 * 60 * 1000;

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Detect inline error messages that older versions of the client appended
// to assistant bubbles. We strip these out so they don't pollute the UI or
// the prompt history sent to OpenAI. The patterns include legacy residues
// from a previous buggy sanitizer that left tails like 'API_KEY missing"}_'.
const ERROR_FRAGMENT_RE = /(\n*_Error[: ]|OPENAI_API_KEY|API_KEY\s+missing|"error"\s*:|_Error de conexión)/i;

function isErrorArtifact(content: string): boolean {
  const t = content.trim();
  if (!t) return false;
  return ERROR_FRAGMENT_RE.test(t);
}

function sanitizeMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .map(m => {
      if (m.role !== 'assistant') return m;
      let cleaned = m.content;
      // Slice off everything from the start of any error fragment to end-of-string.
      const match = cleaned.match(ERROR_FRAGMENT_RE);
      if (match && match.index !== undefined) {
        cleaned = cleaned.slice(0, match.index).trim();
      }
      return { ...m, content: cleaned };
    })
    .filter(m => m.role !== 'assistant' || (m.content.length > 0 && !isErrorArtifact(m.content)));
}

function loadFromStorage(): ConversationState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConversationState;
    if (Date.now() - parsed.lastActivityAt > IDLE_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    // Retroactively scrub error artifacts from prior sessions
    return { ...parsed, messages: sanitizeMessages(parsed.messages) };
  } catch {
    return null;
  }
}

function saveToStorage(state: ConversationState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // localStorage may be disabled
  }
}

function clearStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // noop
  }
}

function mergeFields(prev: ExtractedFields, next: Partial<ExtractedFields>): ExtractedFields {
  const merged: ExtractedFields = { ...prev };
  for (const key of Object.keys(next) as (keyof ExtractedFields)[]) {
    const v = next[key];
    if (v === undefined || v === null) continue;
    if (key === 'integrations' && Array.isArray(v)) {
      merged.integrations = v as string[];
    } else if (key === 'contact' && typeof v === 'object') {
      const incoming = v as ExtractedFields['contact'];
      merged.contact = {
        name: incoming?.name ?? prev.contact?.name ?? '',
        email: incoming?.email ?? prev.contact?.email ?? '',
        whatsapp: incoming?.whatsapp ?? prev.contact?.whatsapp,
      };
    } else {
      // @ts-expect-error generic write-through
      merged[key] = v;
    }
  }
  return merged;
}

export default function LabsChat() {
  const [state, setState] = useState<ConversationState>(() => {
    const restored = loadFromStorage();
    if (restored) return restored;
    return {
      sessionId: uid(),
      messages: [],
      fields: {},
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    };
  });
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [submitModalOpen, setSubmitModalOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [restartConfirm, setRestartConfirm] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(state);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 4500);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.messages, isStreaming]);

  const setFields = useCallback((updater: (prev: ExtractedFields) => ExtractedFields) => {
    setState(prev => ({ ...prev, fields: updater(prev.fields), lastActivityAt: Date.now() }));
  }, []);

  const addMessage = useCallback((m: ChatMessage) => {
    setState(prev => ({ ...prev, messages: [...prev.messages, m], lastActivityAt: Date.now() }));
  }, []);

  const updateLastAssistant = useCallback((appendText: string) => {
    setState(prev => {
      const msgs = [...prev.messages];
      const last = msgs[msgs.length - 1];
      if (last?.role === 'assistant') {
        msgs[msgs.length - 1] = { ...last, content: last.content + appendText };
      }
      return { ...prev, messages: msgs, lastActivityAt: Date.now() };
    });
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isStreaming) return;
      const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: Date.now() };
      addMessage(userMsg);
      setInput('');
      setIsStreaming(true);

      const assistantMsg: ChatMessage = { id: uid(), role: 'assistant', content: '', timestamp: Date.now() };
      addMessage(assistantMsg);

      const cleanHistory = sanitizeMessages([...stateRef.current.messages, userMsg]);
      const history = cleanHistory.map(m => ({ role: m.role, content: m.content }));
      const toolCallBuffer: Record<number, { name?: string; args: string }> = {};
      let streamFailed = false;

      try {
        const res = await fetch('/api/labs/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok || !res.body) {
          let errMsg = 'No pudimos conectar con el agente. Intenta de nuevo.';
          try {
            const errBody = await res.text();
            const parsed = JSON.parse(errBody);
            if (parsed?.error) {
              if (res.status === 429) errMsg = 'Vas muy rápido. Espera unos segundos.';
              else if (parsed.error.includes('OPENAI_API_KEY')) errMsg = 'El agente no está configurado. Avísale a Jose.';
            }
          } catch {
            // keep generic message
          }
          showToast(errMsg);
          streamFailed = true;
          setIsStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const ev of events) {
            if (!ev.startsWith('data: ')) continue;
            const json = ev.slice(6);
            try {
              const parsed = JSON.parse(json);
              if (parsed.type === 'text') {
                updateLastAssistant(parsed.value);
              } else if (parsed.type === 'tool_call_delta') {
                const tc = parsed.value;
                const idx: number = tc.index ?? 0;
                if (!toolCallBuffer[idx]) toolCallBuffer[idx] = { args: '' };
                if (tc.function?.name) toolCallBuffer[idx].name = tc.function.name;
                if (tc.function?.arguments) toolCallBuffer[idx].args += tc.function.arguments;
              } else if (parsed.type === 'done') {
                for (const tc of Object.values(toolCallBuffer)) {
                  if (tc.name === 'updateBrief' && tc.args) {
                    try {
                      const args = JSON.parse(tc.args) as Partial<ExtractedFields>;
                      setFields(prev => mergeFields(prev, args));
                    } catch (e) {
                      console.warn('Failed to parse updateBrief args', e);
                    }
                  } else if (tc.name === 'finalizeBrief') {
                    if (isComplete(stateRef.current.fields)) {
                      setSubmitModalOpen(true);
                    }
                  }
                }
              } else if (parsed.type === 'error') {
                showToast('El agente tuvo un problema. Vuelve a enviar tu mensaje.');
                streamFailed = true;
              }
            } catch {
              // ignore malformed event
            }
          }
        }
      } catch (err) {
        showToast('Error de conexión. Intenta de nuevo.');
        streamFailed = true;
        console.error(err);
      } finally {
        setIsStreaming(false);
        // Defense: if the model emitted only tool calls and no text, OR if the stream failed
        // before producing text, drop the empty assistant placeholder so it doesn't pollute
        // the conversation or the next request to OpenAI.
        setState(prev => {
          const last = prev.messages[prev.messages.length - 1];
          if (last?.role === 'assistant' && (last.content.trim() === '' || streamFailed)) {
            return { ...prev, messages: prev.messages.slice(0, -1) };
          }
          return prev;
        });
      }
    },
    [isStreaming, addMessage, updateLastAssistant, setFields, showToast]
  );

  const handleChipClick = (chip: string) => setInput(chip);

  const restart = () => {
    clearStorage();
    setState({
      sessionId: uid(),
      messages: [],
      fields: {},
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    });
    setSubmitted(false);
    setRestartConfirm(false);
  };

  const handleRestartClick = () => {
    if (state.messages.length === 0) {
      restart();
      return;
    }
    setRestartConfirm(true);
  };

  const handleSubmitConfirmed = async (additionalNotes: string): Promise<SubmitResponse> => {
    if (!isComplete(state.fields)) {
      return { success: false, message: 'Faltan datos en el brief' };
    }
    let res: Response;
    try {
      res = await fetch('/api/labs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          fields: state.fields,
          additionalNotes: additionalNotes.trim() || undefined,
          transcript: state.messages,
        }),
      });
    } catch (err) {
      console.error('Labs submit fetch error:', err);
      return { success: false, message: 'No pudimos contactar al servidor. Revisa tu conexión.' };
    }

    let data: SubmitResponse;
    try {
      data = (await res.json()) as SubmitResponse;
    } catch (err) {
      const text = await res.text().catch(() => '');
      console.error('Labs submit non-JSON response:', res.status, text);
      return {
        success: false,
        message: `El servidor falló (${res.status}). Tu brief NO se envió. ${text.slice(0, 120)}`,
      };
    }

    if (data.success) {
      setSubmitted(true);
      clearStorage();
      setSubmitModalOpen(false);
    }
    return data;
  };

  if (submitted) {
    return <LabsSuccessScreen onRestart={restart} />;
  }

  const empty = state.messages.length === 0;

  // Hero-input layout when empty: input is THE focus, no sidebar yet, hero-sized
  // textarea with circular send button. Once the user sends the first message we
  // switch to the conventional chat layout (messages above, input below, sidebar
  // appears with the live summary).
  const sendDisabled = !input.trim() || isStreaming;
  const InputCard = (
    <div
      className={`rounded-3xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] shadow-[var(--labs-shadow-soft)] focus-within:border-[color:var(--labs-accent)] focus-within:shadow-[var(--labs-shadow-pop)] transition-all duration-300 motion-reduce:transition-none ${
        empty ? 'p-5 md:p-6' : 'p-4'
      }`}
    >
      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
          }
        }}
        placeholder={empty ? 'Describe lo que quieres construir…' : '¿Algo más?'}
        rows={empty ? 4 : 2}
        className={`w-full bg-transparent border-0 outline-none resize-none text-[color:var(--labs-ink)] placeholder:text-[color:var(--labs-ink-muted)] ${
          empty ? 'text-lg md:text-xl leading-relaxed' : 'text-base'
        }`}
        disabled={isStreaming}
        autoFocus={empty}
      />
      <div className="flex items-center justify-between mt-2 gap-3">
        <div className="text-xs text-[color:var(--labs-ink-muted)] min-h-[28px] flex items-center">
          {empty && (
            <span className="hidden sm:inline">Enter para enviar · Shift+Enter para nueva línea</span>
          )}
          {!empty && state.messages.length > 0 && !restartConfirm && (
            <button
              onClick={handleRestartClick}
              className="inline-flex items-center gap-1.5 hover:text-[color:var(--labs-ink)] transition-colors"
              aria-label="Empezar conversación de nuevo"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Empezar de nuevo</span>
            </button>
          )}
          {restartConfirm && (
            <span className="flex items-center gap-2" role="alertdialog" aria-label="Confirmar reinicio">
              <span>¿Borrar?</span>
              <button onClick={restart} className="text-[color:var(--labs-accent)] font-medium hover:underline">
                Sí
              </button>
              <span aria-hidden="true">·</span>
              <button onClick={() => setRestartConfirm(false)} className="hover:underline">
                Cancelar
              </button>
            </span>
          )}
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={sendDisabled}
          aria-label="Enviar mensaje"
          className={`shrink-0 inline-flex items-center justify-center rounded-full transition-all duration-200 motion-reduce:transition-none ${
            empty ? 'w-12 h-12' : 'w-10 h-10'
          } ${
            sendDisabled
              ? 'bg-[color:var(--labs-rule)] text-[color:var(--labs-ink-muted)] cursor-not-allowed'
              : 'bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white shadow-[var(--labs-shadow-pop)] hover:-translate-y-0.5 motion-reduce:hover:translate-y-0'
          }`}
        >
          <ArrowUp className={empty ? 'w-5 h-5' : 'w-4 h-4'} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );

  return (
    <div data-theme="labs" className="w-full max-w-[1200px] mx-auto px-6 pb-24">
      {empty ? (
        // ─── Empty state: input is the hero ───
        <div className="max-w-[760px] mx-auto">
          {InputCard}
          <div className="mt-6">
            <div className="text-[10px] uppercase tracking-[0.2em] text-[color:var(--labs-ink-muted)] font-semibold mb-3">
              O empieza con uno de estos
            </div>
            <div className="grid gap-2 sm:grid-cols-1">
              {SUGGESTION_LABELS.map(({ text, hint }) => (
                <button
                  key={text}
                  onClick={() => handleChipClick(text)}
                  className="group text-left px-4 py-3 rounded-xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] hover:border-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-soft)] transition-all duration-200 motion-reduce:transition-none"
                >
                  <div className="text-[10px] uppercase tracking-widest text-[color:var(--labs-accent)] font-semibold mb-0.5">
                    {hint}
                  </div>
                  <div className="text-sm text-[color:var(--labs-ink)] leading-snug">{text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // ─── Active state: messages + sidebar ───
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-10">
          <div className="lg:col-start-2 lg:row-start-1">
            <LabsSummary
              fields={state.fields}
              canSubmit={isComplete(state.fields)}
              onSubmit={() => setSubmitModalOpen(true)}
            />
          </div>

          <div className="flex flex-col min-h-[60vh] lg:col-start-1 lg:row-start-1">
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto pb-6 space-y-4 max-h-[min(65vh,640px)]"
              style={{ scrollBehavior: 'smooth' }}
            >
              {state.messages.map(m => (
                <LabsMessage key={m.id} message={m} />
              ))}
              {isStreaming && state.messages.at(-1)?.content === '' && (
                <div className="flex justify-start">
                  <div className="bg-[color:var(--labs-bg-elevated)] border border-[color:var(--labs-rule)] rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5 items-center">
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[color:var(--labs-ink-muted)] animate-pulse"
                        style={{ animationDelay: '0ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[color:var(--labs-ink-muted)] animate-pulse"
                        style={{ animationDelay: '150ms' }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-[color:var(--labs-ink-muted)] animate-pulse"
                        style={{ animationDelay: '300ms' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {InputCard}
          </div>
        </div>
      )}

      {submitModalOpen && (
        <LabsSubmitModal
          fields={state.fields}
          onClose={() => setSubmitModalOpen(false)}
          onConfirm={handleSubmitConfirmed}
        />
      )}

      {/* Transient toast for transport-level errors. Never written to chat history. */}
      <div
        aria-live="polite"
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[1100] transition-all duration-300 ease-out ${
          toast ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0 pointer-events-none'
        }`}
      >
        {toast && (
          <div className="px-4 py-3 rounded-full bg-[color:var(--labs-ink)] text-[color:var(--labs-bg)] text-sm shadow-lg max-w-[90vw]">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
