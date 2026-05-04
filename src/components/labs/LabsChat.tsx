import { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatMessage, ConversationState, ExtractedFields, SubmitResponse } from '../../lib/labs/types';
import { isComplete } from '../../lib/labs/types';
import LabsSummary from './LabsSummary';
import LabsMessage from './LabsMessage';
import LabsSubmitModal from './LabsSubmitModal';
import LabsSuccessScreen from './LabsSuccessScreen';

const STORAGE_KEY = 'avoqado-labs-conversation-v1';
const IDLE_MS = 24 * 60 * 60 * 1000;

const SUGGESTION_CHIPS = [
  'Un dashboard que conecte mi POS con WhatsApp',
  'Un agente que conteste reservaciones automáticamente',
  'Un reporte diario de ventas que me llegue al correo',
];

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
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
    return parsed;
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef(state);

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

      const history = [...stateRef.current.messages, userMsg].map(m => ({ role: m.role, content: m.content }));
      const toolCallBuffer: Record<number, { name?: string; args: string }> = {};

      try {
        const res = await fetch('/api/labs/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: history }),
        });

        if (!res.ok || !res.body) {
          const errBody = await res.text();
          updateLastAssistant(`\n\n_Error: ${errBody.slice(0, 200)}_`);
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
                updateLastAssistant(`\n\n_Error: ${parsed.message}_`);
              }
            } catch {
              // ignore malformed event
            }
          }
        }
      } catch (err) {
        updateLastAssistant(`\n\n_Error de conexión._`);
        console.error(err);
      } finally {
        setIsStreaming(false);
        // Defense: if the model emitted only tool calls and no text, the trailing assistant
        // message would be empty. Drop it so the user can continue without seeing a void bubble.
        setState(prev => {
          const last = prev.messages[prev.messages.length - 1];
          if (last?.role === 'assistant' && last.content.trim() === '') {
            return { ...prev, messages: prev.messages.slice(0, -1) };
          }
          return prev;
        });
      }
    },
    [isStreaming, addMessage, updateLastAssistant, setFields]
  );

  const handleChipClick = (chip: string) => setInput(chip);

  const restart = () => {
    if (state.messages.length > 0 && !confirm('¿Empezar de nuevo? Se borrará la conversación actual.')) return;
    clearStorage();
    setState({
      sessionId: uid(),
      messages: [],
      fields: {},
      startedAt: Date.now(),
      lastActivityAt: Date.now(),
    });
    setSubmitted(false);
  };

  const handleSubmitConfirmed = async (additionalNotes: string): Promise<SubmitResponse> => {
    if (!isComplete(state.fields)) {
      return { success: false, message: 'Faltan datos en el brief' };
    }
    try {
      const res = await fetch('/api/labs/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: state.sessionId,
          fields: state.fields,
          additionalNotes: additionalNotes.trim() || undefined,
          transcript: state.messages,
        }),
      });
      const data = (await res.json()) as SubmitResponse;
      if (data.success) {
        setSubmitted(true);
        clearStorage();
        setSubmitModalOpen(false);
      }
      return data;
    } catch {
      return { success: false, message: 'Error de conexión. Intenta de nuevo.' };
    }
  };

  if (submitted) {
    return <LabsSuccessScreen onRestart={restart} />;
  }

  const empty = state.messages.length === 0;

  return (
    <div data-theme="labs" className="w-full max-w-[1200px] mx-auto px-6 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 lg:gap-10">
        <div className="flex flex-col min-h-[60vh]">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto pb-6 space-y-4 max-h-[60vh]"
            style={{ scrollBehavior: 'smooth' }}
          >
            {empty ? (
              <div className="text-center py-12 text-[color:var(--labs-ink-muted)]">
                <p className="text-sm">Empieza por contarnos qué quieres construir.</p>
              </div>
            ) : (
              state.messages.map(m => <LabsMessage key={m.id} message={m} />)
            )}
            {isStreaming && state.messages.at(-1)?.content === '' && (
              <div className="text-xs text-[color:var(--labs-ink-muted)] px-1 italic">Escribiendo…</div>
            )}
          </div>

          <div className="rounded-2xl border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] p-4 shadow-[var(--labs-shadow-soft)]">
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder="¿Qué quieres construir?"
              rows={empty ? 3 : 2}
              className="w-full bg-transparent border-0 outline-none resize-none text-[color:var(--labs-ink)] placeholder:text-[color:var(--labs-ink-muted)] text-base"
              disabled={isStreaming}
            />
            <div className="flex items-center justify-between mt-3">
              <div className="text-xs text-[color:var(--labs-ink-muted)]">
                {state.messages.length > 0 && (
                  <button onClick={restart} className="hover:underline">
                    Empezar de nuevo
                  </button>
                )}
              </div>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isStreaming}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-40 bg-[color:var(--labs-accent)] hover:bg-[color:var(--labs-accent-hover)] text-white"
              >
                Enviar
              </button>
            </div>
          </div>

          {empty && (
            <div className="flex flex-wrap gap-2 mt-4">
              {SUGGESTION_CHIPS.map(chip => (
                <button
                  key={chip}
                  onClick={() => handleChipClick(chip)}
                  className="px-4 py-2 rounded-full text-sm border border-[color:var(--labs-rule)] bg-[color:var(--labs-bg-elevated)] text-[color:var(--labs-ink)] hover:border-[color:var(--labs-accent)] hover:-translate-y-px transition-all duration-200"
                >
                  {chip}
                </button>
              ))}
            </div>
          )}
        </div>

        <LabsSummary
          fields={state.fields}
          canSubmit={isComplete(state.fields)}
          onSubmit={() => setSubmitModalOpen(true)}
        />
      </div>

      {submitModalOpen && (
        <LabsSubmitModal
          fields={state.fields}
          onClose={() => setSubmitModalOpen(false)}
          onConfirm={handleSubmitConfirmed}
        />
      )}
    </div>
  );
}
