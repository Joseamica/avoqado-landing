/**
 * useTourEngine — the spotlight engine behind the Avoqado Tour.
 *
 * Faithful React port of the approved mockup engine
 * (docs/superpowers/specs/mockups/2026-06-10-avoqado-tour-mockup.html):
 *
 *  - Steps are DATA ({ screen, target, pill, pos, ch, onTap, tapDelay,
 *    auto, final, onEnter }) — see flows.ts.
 *  - Strict click rails: a single click-capture handler on the TPV screen;
 *    only the spotlighted target advances, any other click shakes the pill.
 *  - Floating spotlight (pulsing dot + green pill) positioned at the
 *    target's edge with the ported placeTour() math, animated between
 *    targets on the same screen and "jumped" (no transition) when it
 *    reappears after being hidden.
 *  - Screen transitions: 200ms slide-left/fade driven by classes.
 *  - Auto-steps (timed), final steps, full timer cleanup, reset from ANY
 *    state, and flow switching.
 *
 * Mutation model (intentional, mirrors the mockup): visibility/positions
 * are applied imperatively through refs (`active/enter/exit` on screens,
 * `off/jump/shake` + inline left/top on the tour layer). The JSX for those
 * attributes is constant, so React never patches them back — the proven
 * mockup sequencing (double-rAF + reflow flush) ports 1:1 without fighting
 * the renderer. Everything the user *sees inside* the screens (amounts,
 * stars, cart…) stays regular React state, owned by the caller.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';

export type FlowId = 'A' | 'B';
export type PillPos = 'top' | 'bottom' | 'left' | 'right';

/** Helpers the engine injects into every step callback. */
export interface EngineCtx {
  /** setTimeout registered in the engine's timer pool — cleared on reset/flow switch/unmount. */
  setTimer: (fn: () => void, ms: number) => void;
  /** Flow the step is running in. */
  flow: FlowId;
}

export interface TourStep<Ctx extends EngineCtx = EngineCtx> {
  /** data-screen of the TPV screen this step happens on. */
  screen: string;
  /** CSS selector (inside the screen) of the ONLY clickable element. */
  target?: string;
  /** Copy of the green pill. */
  pill?: string;
  /** Side of the target where dot + pill anchor. */
  pos?: PillPos;
  /** Chapter (panel) this step belongs to. */
  ch: number;
  /** Side effect when the target is tapped (before advancing). */
  onTap?: (ctx: Ctx) => void;
  /** ms to wait after the tap before moving to the next step. */
  tapDelay?: number;
  /** Side effect when the step's screen becomes active. */
  onEnter?: (ctx: Ctx) => void;
  /** Auto-step: no target; advance after this many ms. */
  auto?: number;
  /** Final step: tour ends here (CTA unlocks, "Nuevo Pago" restarts). */
  final?: boolean;
}

export interface UseTourEngineOptions<Ctx extends EngineCtx> {
  flows: Record<FlowId, TourStep<Ctx>[]>;
  initialFlow: FlowId;
  /** .stage — coordinate system for the floating spotlight. */
  stageRef: RefObject<HTMLDivElement>;
  /** .screens — container holding every [data-screen] section. */
  screensRef: RefObject<HTMLDivElement>;
  /** .tour-layer / .tour-dot / .tour-pill elements. */
  layerRef: RefObject<HTMLDivElement>;
  dotRef: RefObject<HTMLDivElement>;
  pillRef: RefObject<HTMLDivElement>;
  /** Builds the ctx passed to step callbacks (engine helpers + caller's). */
  buildCtx: (engine: EngineCtx) => Ctx;
  /** Caller resets its own screen state (cart, stars, tip, confetti…). */
  onReset: (flow: FlowId) => void;
}

export interface TourEngineApi {
  flow: FlowId;
  /** Active chapter in the panel. */
  chapter: number;
  /** True once the final step is reached (CTA unlocks). */
  done: boolean;
  /** Current pill copy (rendered by the caller inside .tour-pill). */
  pillText: string;
  /** Restart (same flow) or switch flow — works from ANY state. */
  reset: (flow: FlowId) => void;
  /** Single click-capture handler to attach on the .tpv element. */
  handleTpvClick: (e: ReactMouseEvent<HTMLElement>) => void;
}

const SCREEN_TRANSITION_MS = 230;
const DEFAULT_TAP_DELAY = 60;
/** Gap between the target's edge and the pulsing dot. */
const DOT_GAP = 13;
/** Gap between the dot and the pill. */
const PILL_GAP_SIDE = 15;
const PILL_GAP_VERT = 13;
/** How far the pill may overflow the stage horizontally. */
const PILL_OVERHANG = 28;

/** SSR-safe layout effect (the island is server-rendered by Astro). */
const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

interface UiState {
  flow: FlowId;
  chapter: number;
  done: boolean;
}

export function useTourEngine<Ctx extends EngineCtx>(opts: UseTourEngineOptions<Ctx>): TourEngineApi {
  const [ui, setUi] = useState<UiState>({ flow: opts.initialFlow, chapter: opts.flows[opts.initialFlow][0]?.ch ?? 1, done: false });
  const [pillText, setPillText] = useState('');
  const [placeTick, setPlaceTick] = useState(0);

  // Mutable engine state — mirrors the mockup's closure variables.
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const flowRef = useRef<FlowId>(opts.initialFlow);
  const stepsRef = useRef<TourStep<Ctx>[]>(opts.flows[opts.initialFlow]);
  const idxRef = useRef(0);
  const curScreenRef = useRef<string | null>(null);
  const curTargetRef = useRef<HTMLElement | null>(null);
  const busyRef = useRef(false);
  const doneRef = useRef(false);
  const tourVisibleRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const pendingPlaceRef = useRef<{ pos: PillPos; jump: boolean } | null>(null);

  /* ==========================================================
     Timers
     ========================================================== */
  const setTimer = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };

  const clearTimers = () => {
    timersRef.current.forEach(id => window.clearTimeout(id));
    timersRef.current = [];
  };

  const makeCtx = (): Ctx => optsRef.current.buildCtx({ setTimer, flow: flowRef.current });

  const screenEl = (name: string): HTMLElement | null =>
    optsRef.current.screensRef.current?.querySelector<HTMLElement>(`[data-screen="${name}"]`) ?? null;

  /* ==========================================================
     Spotlight: position dot + pill at the target's edge
     ========================================================== */
  const placeTour = (target: HTMLElement, pos: PillPos, jump: boolean) => {
    const stage = optsRef.current.stageRef.current;
    const layer = optsRef.current.layerRef.current;
    const dot = optsRef.current.dotRef.current;
    const pill = optsRef.current.pillRef.current;
    if (!stage || !layer || !dot || !pill) return;

    const sr = stage.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const cx = tr.left - sr.left + tr.width / 2;
    const cy = tr.top - sr.top + tr.height / 2;
    let dx: number;
    let dy: number;

    if (pos === 'right') {
      dx = tr.right - sr.left + DOT_GAP;
      dy = cy;
    } else if (pos === 'left') {
      dx = tr.left - sr.left - DOT_GAP;
      dy = cy;
    } else if (pos === 'bottom') {
      dx = cx;
      dy = tr.bottom - sr.top + DOT_GAP;
    } else {
      dx = cx;
      dy = tr.top - sr.top - DOT_GAP;
    }

    if (jump) layer.classList.add('jump');

    dot.style.left = `${dx}px`;
    dot.style.top = `${dy}px`;

    const pw = pill.offsetWidth;
    const ph = pill.offsetHeight;
    let px: number;
    let py: number;

    if (pos === 'right') {
      px = dx + PILL_GAP_SIDE;
      py = dy - ph / 2;
    } else if (pos === 'left') {
      px = dx - PILL_GAP_SIDE - pw;
      py = dy - ph / 2;
    } else if (pos === 'bottom') {
      px = dx - pw / 2;
      py = dy + PILL_GAP_VERT;
    } else {
      px = dx - pw / 2;
      py = dy - PILL_GAP_VERT - ph;
    }

    /* keep the pill near the stage (it may overflow the bezel — that's the look) */
    const minX = -PILL_OVERHANG;
    const maxX = sr.width - pw + PILL_OVERHANG;
    px = Math.max(minX, Math.min(maxX, px));

    pill.style.left = `${px}px`;
    pill.style.top = `${py}px`;

    if (jump) {
      void layer.offsetWidth; /* flush so the next move animates */
      layer.classList.remove('jump');
    }
  };

  const showTour = (step: TourStep<Ctx>) => {
    if (!step.target) return;
    const target = screenEl(step.screen)?.querySelector<HTMLElement>(step.target) ?? null;
    if (!target) return;
    curTargetRef.current = target;
    target.classList.add('tour-target');
    pendingPlaceRef.current = { pos: step.pos ?? 'top', jump: !tourVisibleRef.current };
    setPillText(step.pill ?? '');
    setPlaceTick(t => t + 1); // placement happens after the pill text renders (we need its width)
  };

  /* Measure + place after React commits the new pill text. */
  useIsomorphicLayoutEffect(() => {
    const pending = pendingPlaceRef.current;
    const target = curTargetRef.current;
    if (!pending || !target) return;
    pendingPlaceRef.current = null;
    placeTour(target, pending.pos, pending.jump);
    optsRef.current.layerRef.current?.classList.remove('off');
    tourVisibleRef.current = true;
  }, [placeTick]);

  const hideTour = () => {
    optsRef.current.layerRef.current?.classList.add('off');
    tourVisibleRef.current = false;
    curTargetRef.current?.classList.remove('tour-target');
    curTargetRef.current = null;
  };

  const shakePill = () => {
    if (!tourVisibleRef.current) return;
    const pill = optsRef.current.pillRef.current;
    if (!pill) return;
    pill.classList.remove('shake');
    void pill.offsetWidth; // reflow so a repeated wrong click restarts the animation
    pill.classList.add('shake');
  };

  /* ==========================================================
     Screen transitions — 200ms slide-left / fade
     ========================================================== */
  const switchScreen = (name: string, cb: () => void) => {
    const out = curScreenRef.current ? screenEl(curScreenRef.current) : null;
    const inc = screenEl(name);
    if (!inc) return;

    inc.classList.add('active', 'enter');
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        inc.classList.add('entering');
        out?.classList.add('exit');
      });
    });

    setTimer(() => {
      out?.classList.remove('active', 'exit');
      inc.classList.remove('enter', 'entering');
      curScreenRef.current = name;
      cb();
    }, SCREEN_TRANSITION_MS);
  };

  const setScreenInstant = (name: string) => {
    const screens = optsRef.current.screensRef.current;
    screens?.querySelectorAll<HTMLElement>('[data-screen]').forEach(el => {
      el.classList.remove('active', 'enter', 'entering', 'exit');
    });
    screenEl(name)?.classList.add('active');
    curScreenRef.current = name;
  };

  /* ==========================================================
     Step navigation
     ========================================================== */
  const goTo = (i: number) => {
    clearTimers();
    idxRef.current = i;
    const step = stepsRef.current[i];
    if (!step) return;
    doneRef.current = !!step.final;
    setUi(u => ({ ...u, chapter: step.ch, done: !!step.final }));

    if (step.screen !== curScreenRef.current) {
      hideTour();
      switchScreen(step.screen, () => enterStep(step));
    } else {
      enterStep(step);
    }
  };

  const enterStep = (step: TourStep<Ctx>) => {
    step.onEnter?.(makeCtx());

    if (step.final) {
      hideTour();
      busyRef.current = false;
      return;
    }

    if (step.auto) {
      hideTour();
      setTimer(() => goTo(idxRef.current + 1), step.auto);
      busyRef.current = false;
      return;
    }

    showTour(step);
    busyRef.current = false;
  };

  const onTargetTap = () => {
    if (busyRef.current) return;
    busyRef.current = true;
    const step = stepsRef.current[idxRef.current];
    curTargetRef.current?.classList.remove('tour-target');
    step?.onTap?.(makeCtx());
    setTimer(() => goTo(idxRef.current + 1), step?.tapDelay ?? DEFAULT_TAP_DELAY);
  };

  /* ==========================================================
     Reset — works from ANY state
     ========================================================== */
  const resetFlow = (flow: FlowId) => {
    clearTimers();
    flowRef.current = flow;
    stepsRef.current = optsRef.current.flows[flow];
    busyRef.current = false;
    doneRef.current = false;

    optsRef.current.onReset(flow);
    optsRef.current.screensRef.current
      ?.querySelectorAll<HTMLElement>('.tour-target')
      .forEach(el => el.classList.remove('tour-target'));

    hideTour();
    const first = stepsRef.current[0];
    if (!first) return;
    setScreenInstant(first.screen);
    idxRef.current = 0;
    setUi({ flow, chapter: first.ch, done: false });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => enterStep(first));
    });
  };

  /* ==========================================================
     Click capture — only the spotlighted target advances;
     anything else inside the screen makes the pill shake.
     ========================================================== */
  const handleTpvClick = (e: ReactMouseEvent<HTMLElement>) => {
    if (busyRef.current) return;
    const clicked = e.target as HTMLElement;

    if (doneRef.current) {
      /* final state: only "Nuevo Pago" restarts */
      if (clicked.closest('[data-action="new-payment"]')) resetFlow(flowRef.current);
      return;
    }

    const target = curTargetRef.current;
    if (!target) return; /* auto step or transition: silently ignore */

    if (target.contains(clicked)) {
      onTargetTap();
    } else {
      shakePill();
    }
  };

  /* ==========================================================
     Boot + window listeners
     ========================================================== */
  useEffect(() => {
    resetFlow(optsRef.current.initialFlow);

    const reposition = () => {
      const target = curTargetRef.current;
      if (!target || !tourVisibleRef.current) return;
      placeTour(target, stepsRef.current[idxRef.current]?.pos ?? 'top', true);
    };

    window.addEventListener('resize', reposition);
    /* DM Sans loads async — pill width changes once it lands */
    document.fonts?.ready?.then(reposition).catch(() => {});

    return () => {
      window.removeEventListener('resize', reposition);
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- engine state lives in refs; boot once
  }, []);

  return {
    flow: ui.flow,
    chapter: ui.chapter,
    done: ui.done,
    pillText,
    reset: resetFlow,
    handleTpvClick,
  };
}
