/**
 * AvoqadoTour — interactive guided demo of the Avoqado TPV (F1).
 *
 * Square-style spotlight tour over a pixel-faithful PAX A910S replica:
 * stage (terminal + floating dot/pill layer) + chapter panel + flow
 * selector + final CTA. The engine lives in engine.ts; the step scripts
 * and screen state in flows.ts; the screens in screens/.
 *
 * F2 seam: `onPaymentComplete` fires when the simulated payment is
 * approved (success screen) — that's where the real demo-sim POST to the
 * visitor's live demo venue hooks in. No-op by default.
 *
 * J1 handoff: when the tour completes, the chapter-panel CTA opens the
 * demo-dashboard journey in a new tab:
 * `${PUBLIC_DEMO_DASHBOARD_URL}/?demoTour=venta-tpv&amountCents&tipCents`.
 */
import { useReducer, useRef, useState } from 'react';
import './tour.css';

import { useTourEngine } from './engine';
import type { FlowId } from './engine';
import { DEMO_BASE_AMOUNT, DEMO_TIP_AMOUNT, INITIAL_TPV_STATE, TOUR_FLOWS, tpvReducer } from './flows';
import type { PaymentInfo, StepCtx } from './flows';

import TerminalFrame from './TerminalFrame';
import ChapterPanel from './ChapterPanel';
import FastPaymentEntry from './screens/FastPaymentEntry';
import Cobrar from './screens/Cobrar';
import Review from './screens/Review';
import Tip from './screens/Tip';
import MerchantSelection from './screens/MerchantSelection';
import Detecting from './screens/Detecting';
import Processing from './screens/Processing';
import { ReceiptScreen, SuccessScreen } from './screens/SuccessReceipt';

export type { PaymentInfo };

export interface AvoqadoTourProps {
  /**
   * F2 seam: called once per completed (simulated) payment, when the
   * "Aprobado" screen appears. Defaults to a no-op.
   */
  onPaymentComplete?: (info: PaymentInfo) => void;
}

/** Demo dashboard the final CTA hands off to (J1 journey). */
const DEMO_DASHBOARD_URL: string = (
  import.meta.env.PUBLIC_DEMO_DASHBOARD_URL || 'https://demo.dashboard.avoqado.io'
).replace(/\/$/, '');

export default function AvoqadoTour({ onPaymentComplete }: AvoqadoTourProps) {
  const [tpv, dispatch] = useReducer(tpvReducer, INITIAL_TPV_STATE);

  /** Last completed (simulated) payment — feeds the dashboard handoff URL. */
  const [lastPayment, setLastPayment] = useState<PaymentInfo | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const screensRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);

  const onPaymentRef = useRef(onPaymentComplete);
  onPaymentRef.current = onPaymentComplete;

  const engine = useTourEngine<StepCtx>({
    flows: TOUR_FLOWS,
    initialFlow: 'A',
    stageRef,
    screensRef,
    layerRef,
    dotRef,
    pillRef,
    buildCtx: helpers => ({
      ...helpers,
      dispatch,
      notifyPayment: info => {
        setLastPayment(info);
        onPaymentRef.current?.(info);
      },
    }),
    onReset: () => dispatch({ type: 'reset' }),
  });

  const handleSelectFlow = (flow: FlowId) => engine.reset(flow);

  /** J1 handoff: continue the journey in the visitor's demo dashboard. */
  const handleCtaClick = () => {
    if (!engine.done) return;
    /* Graceful fallback: the tour can't complete without a payment, but if
       PaymentInfo is somehow missing we still hand off with the demo amounts. */
    const amount = lastPayment?.amount ?? DEMO_BASE_AMOUNT;
    const tip = lastPayment?.tip ?? DEMO_TIP_AMOUNT;
    const url =
      `${DEMO_DASHBOARD_URL}/?demoTour=venta-tpv` +
      `&amountCents=${Math.round(amount * 100)}` +
      `&tipCents=${Math.round(tip * 100)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="avq-tour">
      <div className="demo">
        {/* ====================== STAGE: terminal + tour layer ====================== */}
        <div className="stage" ref={stageRef}>
          <button
            type="button"
            className="reset-btn"
            title="Reiniciar demo"
            aria-label="Reiniciar demo"
            onClick={() => engine.reset(engine.flow)}
          >
            &#8634;
          </button>

          <TerminalFrame screensRef={screensRef} onTpvClick={engine.handleTpvClick}>
            <FastPaymentEntry amount={tpv.amount} popKey={tpv.amountPopKey} />
            <Cobrar
              view={tpv.cobrarView}
              cartPlayera={tpv.cartPlayera}
              cartGorra={tpv.cartGorra}
              cartItems={tpv.cartItems}
              cartButtonLabel={tpv.cartButtonLabel}
            />
            <Review starsFilled={tpv.starsFilled} />
            <Tip selected={tpv.tipSelected} totalLabel={tpv.tipTotalLabel} />
            <MerchantSelection cardSelected={tpv.cardSelected} />
            <Detecting />
            <Processing />
            <SuccessScreen confettiKey={tpv.confettiKey} />
            <ReceiptScreen />
          </TerminalFrame>

          {/* Floating spotlight: pulsing dot + green pill (Square-style).
              Classes off/jump and inline positions are engine-managed. */}
          <div className="tour-layer off jump" ref={layerRef} aria-hidden="true">
            <div className="tour-dot" ref={dotRef} />
            <div className="tour-pill" ref={pillRef}>
              <span>{engine.pillText}</span>
              <span className="chev">&#8250;</span>
            </div>
          </div>
        </div>

        {/* ====================== CHAPTER PANEL ====================== */}
        <ChapterPanel
          chapter={engine.chapter}
          done={engine.done}
          flow={engine.flow}
          onSelectFlow={handleSelectFlow}
          onCtaClick={handleCtaClick}
        />
      </div>
    </div>
  );
}
