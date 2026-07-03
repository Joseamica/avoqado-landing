/**
 * DashAi — "Asistente IA" (dash-ai): the chain's closing scene. A scripted
 * chat where the visitor asks four questions and gets answers that cite the
 * exact sale they just made — the last two BY BANK ACCOUNT (BBVA / Inbursa),
 * showing the AI understands the multi-merchant routing they just used when
 * paying. `aiStage` numbering (mirrors chainReducer, do not assume):
 *
 *   0 welcome only · 1 q1 asked · 2 a1 shown · 3 q2 asked · 4 a2 shown
 *   · 5 q3 asked · 6 a3 shown · 7 q4 asked · 8 a4 shown (final)
 *
 * `aiTyping` is a separate flag (true between an aiAskN and its aiAnswerN).
 * Chips are ALWAYS mounted (visual state gated) — a tour target must exist
 * in the DOM the instant its step activates, or the engine soft-locks.
 * Copy is EXACT, imported from flows-chain.ts — never inlined/paraphrased.
 */
import DashShell from './DashShell';
import ChainNav from './ChainNav';
import { AI_ANSWER_1, AI_ANSWER_2, AI_ANSWER_3, AI_ANSWER_4, AI_CHIP_1, AI_CHIP_2, AI_CHIP_3, AI_CHIP_4, AI_WELCOME } from '../flows-chain';

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

interface ChipProps {
  dataT: string;
  visible: boolean;
  used: boolean;
  label: string;
}

/** Always mounted; hidden-visual until `visible`, dimmed once `used`. */
function Chip({ dataT, visible, used, label }: ChipProps) {
  const cls = !visible ? ' dash-ai-chip-pending' : used ? ' dash-ai-chip-used' : '';
  return (
    <button type="button" className={`dash-ai-chip${cls}`} data-t={dataT} disabled={!visible || used} aria-hidden={!visible} tabIndex={visible && !used ? undefined : -1}>
      {label}
    </button>
  );
}

export default function DashAi({ aiStage, aiTyping, flow }: Props) {
  const qa = [
    { asked: aiStage >= 1, answered: aiStage >= 2, typing: aiTyping && aiStage === 1, q: AI_CHIP_1, a: AI_ANSWER_1[flow] },
    { asked: aiStage >= 3, answered: aiStage >= 4, typing: aiTyping && aiStage === 3, q: AI_CHIP_2[flow], a: AI_ANSWER_2[flow] },
    { asked: aiStage >= 5, answered: aiStage >= 6, typing: aiTyping && aiStage === 5, q: AI_CHIP_3, a: AI_ANSWER_3 },
    { asked: aiStage >= 7, answered: aiStage >= 8, typing: aiTyping && aiStage === 7, q: AI_CHIP_4, a: AI_ANSWER_4 },
  ];

  return (
    <section className="web-screen lg dash-ai" data-screen="dash-ai">
      <DashShell nav={<ChainNav active="nav-ia" />}>
        <div className="lg-head">
          <div>
            <h1 className="lg-h1">Asistente IA</h1>
            <p className="lg-subtitle">Pregúntale a tu negocio y responde con tus datos en vivo.</p>
          </div>
        </div>

        {/* Anchored to the bottom like a real chat: with 4 Q&As the oldest
            bubbles slide out of the fixed-height canvas instead of the
            newest ones overflowing invisible (see .dash-ai-chat CSS). */}
        <div className="dash-ai-chat">
          <div className="dash-ai-bubble dash-ai-bubble-bot">{AI_WELCOME}</div>
          {qa.map(({ asked, answered, typing, q, a }) => (
            <div className="dash-ai-turn" key={q}>
              {asked && <div className="dash-ai-bubble dash-ai-bubble-user">{q}</div>}
              {typing && <TypingDots />}
              {answered && <div className="dash-ai-bubble dash-ai-bubble-bot dash-ai-answer-in">{a}</div>}
            </div>
          ))}
        </div>

        <div className="dash-ai-chips">
          <Chip dataT="ai-q1" visible={true} used={aiStage >= 1} label={AI_CHIP_1} />
          <Chip dataT="ai-q2" visible={aiStage >= 2} used={aiStage >= 3} label={AI_CHIP_2[flow]} />
          <Chip dataT="ai-q3" visible={aiStage >= 4} used={aiStage >= 5} label={AI_CHIP_3} />
          <Chip dataT="ai-q4" visible={aiStage >= 6} used={aiStage >= 7} label={AI_CHIP_4} />
        </div>

        <button type="button" className="dash-ai-restart" data-action="new-payment">
          Repetir demo
        </button>
      </DashShell>
    </section>
  );
}
