/**
 * DashAi — "Asistente IA" (dash-ai): the chain's closing scene. A scripted
 * chat where the visitor asks two questions and gets answers that cite the
 * exact sale they just made. `aiStage` numbering (confirmed against
 * `chainReducer` in flows-chain.ts, not assumed):
 *
 *   0 — nothing yet (welcome message only)
 *   1 — aiAsk1 dispatched: chip 1 tapped, user bubble for Q1 shows
 *   2 — aiAnswer1 dispatched: answer 1 revealed (aiTyping already false)
 *   3 — aiAsk2 dispatched: chip 2 tapped, user bubble for Q2 shows
 *   4 — aiAnswer2 dispatched: answer 2 revealed (aiTyping already false)
 *
 * `aiTyping` is a separate flag (true between an aiAskN and its aiAnswerN)
 * — the typing-dots indicator renders whenever it's true, regardless of
 * which question is in flight.
 *
 * Copy is EXACT, imported from flows-chain.ts (word for word from the spec's
 * "Copy IA EXACTO" table) — never inlined/paraphrased here.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';
import { AI_ANSWER_1, AI_ANSWER_2, AI_CHIP_1, AI_CHIP_2, AI_WELCOME } from '../flows-chain';

interface Props {
  aiStage: number;
  aiTyping: boolean;
  flow: 'A' | 'B';
}

function TypingDots() {
  return (
    <div className="dash-ai-bubble dash-ai-bubble-bot dash-ai-typing" aria-label="Escribiendo…">
      <span className="dash-ai-dot" />
      <span className="dash-ai-dot" />
      <span className="dash-ai-dot" />
    </div>
  );
}

export default function DashAi({ aiStage, aiTyping, flow }: Props) {
  const q1Used = aiStage >= 1;
  const answer1Shown = aiStage >= 2;
  const q2Tapped = aiStage >= 3;
  const answer2Shown = aiStage >= 4;
  /* Chip 2 only becomes a valid/visible target once answer 1 has landed. */
  const q2Visible = aiStage >= 2;
  /* Typing dots follow whichever question is currently in flight. */
  const typingForQ1 = aiTyping && aiStage === 1;
  const typingForQ2 = aiTyping && aiStage === 3;

  return (
    <section className="web-screen lg dash-ai" data-screen="dash-ai">
      <DashShell nav={<ChainNav active="nav-ia" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Asistente IA</h1>
            <p className="lg-subtitle">Pregúntale a tu negocio y responde con tus datos en vivo.</p>
          </div>
        </div>

        <div className="dash-ai-chat">
          <div className="dash-ai-bubble dash-ai-bubble-bot">{AI_WELCOME}</div>

          {q1Used && <div className="dash-ai-bubble dash-ai-bubble-user">{AI_CHIP_1}</div>}
          {typingForQ1 && <TypingDots />}
          {answer1Shown && <div className="dash-ai-bubble dash-ai-bubble-bot dash-ai-answer-in">{AI_ANSWER_1[flow]}</div>}

          {q2Tapped && <div className="dash-ai-bubble dash-ai-bubble-user">{AI_CHIP_2[flow]}</div>}
          {typingForQ2 && <TypingDots />}
          {answer2Shown && <div className="dash-ai-bubble dash-ai-bubble-bot dash-ai-answer-in">{AI_ANSWER_2[flow]}</div>}
        </div>

        <div className="dash-ai-chips">
          <button type="button" className={`dash-ai-chip${q1Used ? ' dash-ai-chip-used' : ''}`} data-t="ai-q1" disabled={q1Used}>
            {AI_CHIP_1}
          </button>
          {/* Always mounted (never conditionally rendered) — see the
              dash-ai-chip-pending CSS comment in tour-dash.css for why:
              the tour engine must be able to find this element the instant
              it becomes the active step's target, regardless of whether
              React has already committed the "visible" class yet. */}
          <button
            type="button"
            className={`dash-ai-chip${!q2Visible ? ' dash-ai-chip-pending' : q2Tapped ? ' dash-ai-chip-used' : ''}`}
            data-t="ai-q2"
            disabled={!q2Visible || q2Tapped}
            aria-hidden={!q2Visible}
            tabIndex={q2Visible ? undefined : -1}
          >
            {AI_CHIP_2[flow]}
          </button>
        </div>

        <button type="button" className="dash-ai-restart" data-action="new-payment">
          Repetir demo
        </button>
      </DashShell>
    </section>
  );
}
