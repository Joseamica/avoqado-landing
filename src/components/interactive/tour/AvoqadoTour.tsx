/**
 * AvoqadoTour — interactive guided demo of the Avoqado platform.
 *
 * Square-style spotlight tour over four guided flows:
 *   A/B (TPV)  — pixel-faithful PAX A910S replica (pago rápido / Cobrar).
 *   R (web)    — the booking widget on a venue's page (phone browser).
 *   L (web)    — the dashboard "Ligas de pago" journey (desktop browser).
 *
 * The engine lives in engine.ts; step scripts + screen state in flows.ts /
 * flows-web.ts; screens in screens/ (TPV) and screens-web/ (browser).
 *
 * J1 handoff: when a TPV flow completes, the chapter-panel CTA opens the
 * demo-dashboard journey (`?demoTour=venta-tpv`) in a new tab; web flows
 * hand off to the plain live-demo dashboard.
 */
import { useEffect, useReducer, useRef, useState } from 'react';
import './tour.css';
import './tour-web.css';
import './tour-resv.css';
import './tour-liga.css';

import { useTourEngine } from './engine';
import type { FlowId } from './engine';
import {
  DEMO_BASE_AMOUNT,
  DEMO_TIP_AMOUNT,
  INITIAL_TPV_STATE,
  INITIAL_WEB_STATE,
  TOUR_FLOWS,
  tpvReducer,
  webReducer,
} from './flows';
import type { PaymentInfo, StepCtx } from './flows';

import TerminalFrame from './TerminalFrame';
import BrowserFrame from './BrowserFrame';
import ChapterPanel from './ChapterPanel';
import FastPaymentEntry from './screens/FastPaymentEntry';
import Cobrar from './screens/Cobrar';
import Review from './screens/Review';
import Tip from './screens/Tip';
import MerchantSelection from './screens/MerchantSelection';
import Detecting from './screens/Detecting';
import Processing from './screens/Processing';
import { ReceiptScreen, SuccessScreen } from './screens/SuccessReceipt';
import ResvLanding from './screens-web/ResvLanding';
import ResvServices from './screens-web/ResvServices';
import ResvDateTime from './screens-web/ResvDateTime';
import ResvCheckout from './screens-web/ResvCheckout';
import ResvDone from './screens-web/ResvDone';
import LigaList from './screens-web/LigaList';
import LigaPurpose from './screens-web/LigaPurpose';
import LigaForm from './screens-web/LigaForm';

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
  const [web, webDispatch] = useReducer(webReducer, INITIAL_WEB_STATE);

  /** Last completed (simulated) payment — feeds the dashboard handoff URL. */
  const [lastPayment, setLastPayment] = useState<PaymentInfo | null>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const screensRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLDivElement>(null);
  const panelWrapRef = useRef<HTMLDivElement>(null);

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
      webDispatch,
      notifyPayment: info => {
        setLastPayment(info);
        onPaymentRef.current?.(info);
      },
    }),
    onReset: () => {
      dispatch({ type: 'reset' });
      webDispatch({ type: 'reset' });
    },
  });

  const handleSelectFlow = (flow: FlowId) => engine.reset(flow);

  /* Mobile fold fix (founder QA): the panel + CTA live below the stage on
     small screens — when the tour completes, bring the unlocked CTA into
     view so the conversion moment is never invisible. */
  useEffect(() => {
    if (!engine.done) return;
    if (window.innerWidth >= 880) return;
    const t = window.setTimeout(() => {
      panelWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 450);
    return () => window.clearTimeout(t);
  }, [engine.done]);

  /** Handoff: each flow deep-links its own journey in the demo dashboard. */
  const handleCtaClick = () => {
    if (!engine.done) return;
    if (engine.flow === 'A' || engine.flow === 'B') {
      /* Graceful fallback: the tour can't complete without a payment, but if
         PaymentInfo is somehow missing we still hand off with the demo amounts. */
      const amount = lastPayment?.amount ?? DEMO_BASE_AMOUNT;
      const tip = lastPayment?.tip ?? DEMO_TIP_AMOUNT;
      const url =
        `${DEMO_DASHBOARD_URL}/?demoTour=venta-tpv` +
        `&amountCents=${Math.round(amount * 100)}` +
        `&tipCents=${Math.round(tip * 100)}`;
      window.open(url, '_blank', 'noopener,noreferrer');
    } else if (engine.flow === 'R') {
      /* Journey "reserva": the dashboard creates a REAL reservation in the
         visitor's demo venue and tours the Reservations calendar. */
      window.open(`${DEMO_DASHBOARD_URL}/?demoTour=reserva`, '_blank', 'noopener,noreferrer');
    } else {
      /* Journey "liga": the dashboard creates a REAL payment link + its web
         payment and tours Ligas de Pago → Transacciones. */
      window.open(`${DEMO_DASHBOARD_URL}/?demoTour=liga`, '_blank', 'noopener,noreferrer');
    }
  };

  const isTpvFlow = engine.flow === 'A' || engine.flow === 'B';

  return (
    <div className="avq-tour">
      <div className={`demo flow-${engine.flow.toLowerCase()}`}>
        {/* ====================== STAGE: device/browser + tour layer ====================== */}
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

          {isTpvFlow ? (
            <TerminalFrame screensRef={screensRef} onTpvClick={engine.handleTpvClick}>
              <FastPaymentEntry amount={tpv.amount} popKey={tpv.amountPopKey} />
              <Cobrar
                view={tpv.cobrarView}
                cartPlayera={tpv.cartPlayera}
                cartGorra={tpv.cartGorra}
                cartItems={tpv.cartItems}
                cartButtonLabel={tpv.cartButtonLabel}
                cartSheetOpen={tpv.cartSheetOpen}
              />
              <Review starsFilled={tpv.starsFilled} />
              <Tip selected={tpv.tipSelected} totalLabel={tpv.tipTotalLabel} />
              <MerchantSelection cardSelected={tpv.cardSelected} />
              <Detecting />
              <Processing />
              <SuccessScreen confettiKey={tpv.confettiKey} />
              <ReceiptScreen />
            </TerminalFrame>
          ) : engine.flow === 'R' ? (
            <BrowserFrame variant="phone" url="book.avoqado.io/estetica-bella" screensRef={screensRef} onTpvClick={engine.handleTpvClick}>
              <ResvLanding />
              <ResvServices serviceAdded={web.resvServiceAdded} />
              <ResvDateTime day={web.resvDay} slot={web.resvSlot} />
              <ResvCheckout />
              <ResvDone />
            </BrowserFrame>
          ) : (
            <BrowserFrame
              variant="desktop"
              url="dashboard.avoqado.io/venues/estudio-lumina/payment-links"
              screensRef={screensRef}
              onTpvClick={engine.handleTpvClick}
            >
              <LigaList saved={web.ligaSaved} waOpen={web.ligaWaOpen} waSent={web.ligaWaSent} paid={web.ligaPaid} toast={web.ligaToast} />
              <LigaPurpose purpose={web.ligaPurpose} />
              <LigaForm amountTyped={web.ligaAmount} />
            </BrowserFrame>
          )}

          {/* Floating spotlight: pulsing dot + green pill (Square-style).
              Classes off/jump and inline positions are engine-managed. */}
          <div className="tour-layer off jump" ref={layerRef} aria-hidden="true">
            <div className="tour-dot" ref={dotRef} />
            {/* data-pos + --tail-x (set by the engine) drive the tooltip tail
                that points back at the dot — no chevron glyph. */}
            <div className="tour-pill" ref={pillRef}>
              <span>{engine.pillText}</span>
            </div>
          </div>
        </div>

        {/* ====================== CHAPTER PANEL ====================== */}
        <div className="panel-wrap" ref={panelWrapRef}>
          <ChapterPanel
            chapter={engine.chapter}
            done={engine.done}
            flow={engine.flow}
            onSelectFlow={handleSelectFlow}
            onCtaClick={handleCtaClick}
          />
        </div>
      </div>
    </div>
  );
}
