import { useEffect } from 'react';
import { useMotionValue } from 'framer-motion';
import type { ComponentType } from 'react';
import type { MotionValue } from 'framer-motion';

import DashboardLivingPreview from './DashboardLivingPreview';
import PosLivingPreview from './PosLivingPreview';
import QrLivingPreview from './QrLivingPreview';
import TpvLivingPreview from './TpvLivingPreview';
import AiLivingPreview from './AiLivingPreview';
import WidgetLivingPreview from './WidgetLivingPreview';

/**
 * Internal asset-export stage (NOT a public page — noindex, excluded from sitemap).
 *
 * Renders a single LivingPreview mockup isolated on the brand-dark canvas, with its
 * scroll progress driven imperatively via `window.__avoSetProgress(p)` so an external
 * capture script (scripts/export-marketing-assets.mjs) can:
 *   - screenshot each state for high-res PNG stills, and
 *   - frame-step progress 0 -> 1 to record the animation as video.
 *
 * Driven entirely by URL query params: ?c=<component>&p=<progress 0..1>
 */

type Key = 'dashboard' | 'pos' | 'qr' | 'tpv' | 'ai' | 'widget';

interface PreviewProps {
  scrollYProgress: MotionValue<number>;
}

const PREVIEWS: Record<Key, { Comp: ComponentType<PreviewProps>; width: number; label: string }> = {
  dashboard: { Comp: DashboardLivingPreview, width: 1080, label: 'Dashboard Web' },
  pos: { Comp: PosLivingPreview, width: 1000, label: 'POS' },
  ai: { Comp: AiLivingPreview, width: 720, label: 'Asistente IA' },
  widget: { Comp: WidgetLivingPreview, width: 900, label: 'Booking Widget' },
  tpv: { Comp: TpvLivingPreview, width: 560, label: 'TPV' },
  qr: { Comp: QrLivingPreview, width: 380, label: 'QR' },
};

const BG = '#0A0A0B';
const PAD = 64;

export default function ExportStage() {
  const params =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const key = (params.get('c') as Key) || 'dashboard';
  const rawP = parseFloat(params.get('p') || '0');
  const initialP = Number.isFinite(rawP) ? rawP : 0;

  const entry = PREVIEWS[key] ?? PREVIEWS.dashboard;
  const { Comp, width } = entry;

  const progress = useMotionValue(initialP);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    w.__avoSetProgress = (p: number) => progress.set(p);
    w.__avoMeta = { components: Object.keys(PREVIEWS), current: key, width };
    w.__avoReady = true;
    return () => {
      delete w.__avoReady;
    };
  }, [key, width, progress]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div id="capture" style={{ background: BG, padding: PAD, display: 'inline-block', lineHeight: 0 }}>
        <div style={{ width }}>
          <Comp scrollYProgress={progress} />
        </div>
      </div>
    </div>
  );
}
