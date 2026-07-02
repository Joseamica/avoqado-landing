/**
 * PaxPhotoFrame — real PAX A920Pro device photo as the TPV bezel, with the
 * live React screens rendered inside the photo's transparent screen cutout.
 *
 * Replaces the CSS-drawn TerminalFrame for the TPV flows (A/B). Same prop
 * contract (onTpvClick / children) so it drops into AvoqadoTour unchanged.
 * The screens render at their native 330px design width; a single scale
 * transform on `.pax-photo` sizes the whole unit for display — the
 * spotlight engine reads getBoundingClientRect, which respects the transform,
 * so dot/pill positioning keeps working exactly as before.
 *
 * The `screensRef` the engine queries lives on the `.frames` wrapper in
 * AvoqadoTour (a shared ancestor of every frame's `div.screens`) — engine.screenEl()
 * finds `[data-screen]` elements by descendant selector, so nesting depth doesn't matter.
 *
 * The screen cutout geometry was measured from public/pax-a920pro.png
 * (1834×1834): left 31.08%, top 24.537%, width 37.405%, height 75.409%.
 */
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

interface Props {
  onTpvClick: (e: ReactMouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

export default function PaxPhotoFrame({ onTpvClick, children }: Props) {
  return (
    <div className="pax-photo-wrap">
      <div className="pax-photo">
        {/* Live screen — sits inside the photo's transparent cutout. Clickable. */}
        <div className="pax-screen" onClick={onTpvClick}>
          <div className="statusbar" aria-hidden="true">
            <span>12:30</span>
            <span className="right">
              <span className="sig">
                <i />
                <i />
                <i />
              </span>
              <svg width="13" height="10" viewBox="0 0 13 10" fill="none">
                <path d="M1 3.4C2.6 1.9 4.5 1.1 6.5 1.1s3.9.8 5.5 2.3" stroke="#8d8d8d" strokeWidth="1.2" strokeLinecap="round" />
                <path d="M3.2 5.6c1-.9 2.1-1.4 3.3-1.4s2.3.5 3.3 1.4" stroke="#8d8d8d" strokeWidth="1.2" strokeLinecap="round" />
                <circle cx="6.5" cy="8" r="1.1" fill="#8d8d8d" />
              </svg>
              <span className="batt" />
            </span>
          </div>
          <div className="screens">{children}</div>
        </div>

        {/* Device photo overlays as the bezel; transparent cutout reveals the
            screen beneath. pointer-events:none so clicks reach the screen. */}
        <img className="pax-photo-img" src="/pax-a920pro.png" alt="Terminal PAX A920Pro de Avoqado" aria-hidden="true" />
      </div>
    </div>
  );
}
