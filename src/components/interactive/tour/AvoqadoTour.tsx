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
import './tour-dash.css';

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
import { INITIAL_CHAIN_STATE, chainReducer } from './flows-chain';

import { flowName, trackTour, trackTourBeforeNav } from './analytics';
import PaxPhotoFrame from './PaxPhotoFrame';
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
import DashResvCal from './screens-dash/DashResvCal';
import DashResvSales from './screens-dash/DashResvSales';
import DashLive from './screens-dash/DashLive';
import DashInventory from './screens-dash/DashInventory';
import DashCfdi from './screens-dash/DashCfdi';
import DashCommission from './screens-dash/DashCommission';
import DashLoyalty from './screens-dash/DashLoyalty';
import DashReport from './screens-dash/DashReport';
import DashAi from './screens-dash/DashAi';

export type { PaymentInfo };

const DEMO_DASHBOARD_URL: string = (
  import.meta.env.PUBLIC_DEMO_DASHBOARD_URL || 'https://demo.dashboard.avoqado.io'
).replace(/\/$/, '');

export interface AvoqadoTourProps {
  /**
   * F2 seam: called once per completed (simulated) payment, when the
   * "Aprobado" screen appears. Defaults to a no-op.
   */
  onPaymentComplete?: (info: PaymentInfo) => void;
}

export default function AvoqadoTour({ onPaymentComplete }: AvoqadoTourProps) {
  const [tpv, dispatch] = useReducer(tpvReducer, INITIAL_TPV_STATE);
  const [web, webDispatch] = useReducer(webReducer, INITIAL_WEB_STATE);
  const [chain, chainDispatch] = useReducer(chainReducer, INITIAL_CHAIN_STATE);

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

  /** Flows the visitor actually engaged with (first tap = tour_start). */
  const startedFlowsRef = useRef<Set<FlowId>>(new Set());

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
      chainDispatch,
      notifyPayment: info => {
        setLastPayment(info);
        onPaymentRef.current?.(info);
        trackTour('tour_payment_done', { tour_flow: flowName(helpers.flow) });
      },
    }),
    onReset: () => {
      dispatch({ type: 'reset' });
      webDispatch({ type: 'reset' });
      chainDispatch({ type: 'reset' });
      setLastPayment(null);
    },
    onEvent: e => {
      if (e.type === 'tap') {
        if (!startedFlowsRef.current.has(e.flow)) {
          startedFlowsRef.current.add(e.flow);
          trackTour('tour_start', { tour_flow: flowName(e.flow) });
        }
        trackTour('tour_step', { tour_flow: flowName(e.flow), tour_step: e.stepIndex, tour_step_name: e.stepName });
      } else if (e.type === 'complete') {
        trackTour('tour_complete', { tour_flow: flowName(e.flow) });
      }
    },
  });

  /* tour_view: una vez por carga — la persona VE el demo */
  useEffect(() => {
    trackTour('tour_view');
  }, []);

  const handleSelectFlow = (flow: FlowId) => {
    if (flow !== engine.flow) trackTour('tour_flow_switch', { tour_flow: flowName(flow), tour_from: flowName(engine.flow) });
    engine.reset(flow);
  };

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

  /** Shared per-flow WhatsApp src/text so the href (for the <a>) and the
   *  click handler (for the location redirect) never compute two different
   *  URLs. */
  const waSrc =
    engine.flow === 'A' || engine.flow === 'B'
      ? 'demo_tour_tpv'
      : engine.flow === 'R'
      ? 'demo_tour_reserva'
      : 'demo_tour_liga';
  const waText =
    engine.flow === 'A' || engine.flow === 'B'
      ? 'Hola, acabo de probar el demo de cobros de Avoqado y quiero hablar con ventas.'
      : engine.flow === 'R'
      ? 'Hola, acabo de probar el demo de reservas de Avoqado y quiero hablar con ventas.'
      : 'Hola, acabo de probar el demo de ligas de pago de Avoqado y quiero hablar con ventas.';
  const waHref = `/wa?src=${waSrc}&text=${encodeURIComponent(waText)}`;

  /** Handoff: tour completed → contact sales on WhatsApp, routed through the
   *  /wa bridge so the Google Ads whatsapp_click conversion fires (beacon). */
  const handlePrimaryCta = (e: Parameters<typeof trackTourBeforeNav>[0]) => {
    if (!engine.done) {
      e.preventDefault();
      return;
    }
    /* LA conversión de /demo: tour completado → contactar a ventas por WhatsApp.
       Navegación same-tab a /wa → el evento debe salir ANTES del unload
       (eventCallback + tope 800ms); un push simple aquí nunca llegaba a GA4. */
    trackTourBeforeNav(e, 'tour_cta_click', { tour_flow: flowName(engine.flow), tour_cta: 'whatsapp' });
  };

  /** Secondary handoff: tour completed → open the real demo dashboard journey
   *  in a new tab, seeded with the simulated payment (TPV) or the flow's
   *  journey (R/L). */
  const handleSecondaryCta = () => {
    if (!engine.done) return;
    trackTour('tour_cta_click', { tour_flow: flowName(engine.flow), tour_cta: 'dashboard' });
    const url =
      engine.flow === 'A' || engine.flow === 'B'
        ? `${DEMO_DASHBOARD_URL}/?demoTour=venta-tpv&amountCents=${Math.round(
            (lastPayment?.amount ?? DEMO_BASE_AMOUNT) * 100
          )}&tipCents=${Math.round((lastPayment?.tip ?? DEMO_TIP_AMOUNT) * 100)}`
        : engine.flow === 'R'
        ? `${DEMO_DASHBOARD_URL}/?demoTour=reserva`
        : `${DEMO_DASHBOARD_URL}/?demoTour=liga`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isTpvFlow = engine.flow === 'A' || engine.flow === 'B';
  /* Which frame-slot is visible on flows that stack two (A/B: PAX ⇄ dashboard;
     R: booking phone ⇄ dashboard calendar). L renders a single desktop frame. */
  const showDesktop = engine.frame === 'desktop';

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
            onClick={() => {
              trackTour('tour_reset', { tour_flow: flowName(engine.flow) });
              engine.reset(engine.flow);
            }}
          >
            &#8634;
          </button>

          <div className="frames" ref={screensRef}>
            {isTpvFlow ? (
              <>
                <div className={`frame-slot${showDesktop ? ' is-hidden' : ''}`}>
                  <PaxPhotoFrame onTpvClick={engine.handleTpvClick}>
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
                  </PaxPhotoFrame>
                </div>
                <div className={`frame-slot${showDesktop ? '' : ' is-hidden'}`}>
                  <BrowserFrame variant="desktop" url="dashboard.avoqado.io/venues/estudio-lumina" onTpvClick={engine.handleTpvClick}>
                    <DashLive saleRowIn={chain.saleRowIn} cascadeShown={chain.cascadeShown} flow={engine.flow === 'A' ? 'A' : 'B'} />
                    <DashInventory counted={chain.invCounted} />
                    <DashCfdi />
                    <DashCommission />
                    <DashLoyalty />
                    <DashReport counted={chain.reportCounted} />
                    <DashAi aiStage={chain.aiStage} aiTyping={chain.aiTyping} flow={engine.flow === 'A' ? 'A' : 'B'} />
                  </BrowserFrame>
                </div>
              </>
            ) : engine.flow === 'R' ? (
              <>
                <div className={`frame-slot${showDesktop ? ' is-hidden' : ''}`}>
                  <BrowserFrame variant="phone" url="book.avoqado.io/estetica-bella" onTpvClick={engine.handleTpvClick}>
                    <ResvLanding />
                    <ResvServices serviceAdded={web.resvServiceAdded} />
                    <ResvDateTime day={web.resvDay} slot={web.resvSlot} />
                    <ResvCheckout />
                    <ResvDone />
                  </BrowserFrame>
                </div>
                <div className={`frame-slot${showDesktop ? '' : ' is-hidden'}`}>
                  <BrowserFrame variant="desktop" url="dashboard.avoqado.io/venues/estetica-bella" onTpvClick={engine.handleTpvClick}>
                    <DashResvCal statusOpen={web.resvStatusOpen} showMarked={web.resvShowMarked} />
                    <DashResvSales />
                  </BrowserFrame>
                </div>
              </>
            ) : (
              <BrowserFrame
                variant="desktop"
                url="dashboard.avoqado.io/venues/estudio-lumina/payment-links"
                onTpvClick={engine.handleTpvClick}
              >
                <LigaList saved={web.ligaSaved} waOpen={web.ligaWaOpen} waSent={web.ligaWaSent} paid={web.ligaPaid} toast={web.ligaToast} />
                <LigaPurpose purpose={web.ligaPurpose} />
                <LigaForm amountTyped={web.ligaAmount} />
              </BrowserFrame>
            )}
          </div>

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
            waHref={waHref}
            onPrimaryCta={handlePrimaryCta}
            onSecondaryCta={handleSecondaryCta}
          />
        </div>
      </div>
    </div>
  );
}
