/**
 * PAX A910S hardware replica: white body, gray printer cap with contactless
 * mark + blue rim + serrated paper edge, PAX / A910S bezel branding, side
 * card-reader rail, faux Android status bar and capacitive nav buttons.
 *
 * The TPV screens render inside `.screens`; a single delegated click
 * handler on `.tpv` feeds the spotlight engine's strict rails.
 */
import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react';

interface Props {
  screensRef: RefObject<HTMLDivElement>;
  onTpvClick: (e: ReactMouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

export default function TerminalFrame({ screensRef, onTpvClick, children }: Props) {
  return (
    <div className="device">
      <div className="printer-cap" aria-hidden="true">
        {/* marca contactless (tarjeta + ondas) como en el A910S real */}
        <svg width="62" height="28" viewBox="0 0 62 28" fill="none">
          <rect x="6" y="7" width="22" height="15" rx="2.6" transform="rotate(-8 17 14.5)" stroke="#eef1f4" strokeWidth="1.9" />
          <path
            d="M36 21.5C38.7 18.9 40.3 15.6 40.3 12S38.7 5.1 36 2.5"
            stroke="#eef1f4"
            strokeWidth="1.9"
            strokeLinecap="round"
            transform="translate(2 2)"
          />
          <path
            d="M41 19C42.9 17.1 44 14.6 44 12s-1.1-5.1-3-7"
            stroke="#eef1f4"
            strokeWidth="1.9"
            strokeLinecap="round"
            transform="translate(4 2)"
          />
          <path
            d="M46 16.5c1.1-1.2 1.8-2.8 1.8-4.5s-.7-3.3-1.8-4.5"
            stroke="#eef1f4"
            strokeWidth="1.9"
            strokeLinecap="round"
            transform="translate(6 2)"
          />
        </svg>
      </div>
      <div className="bezel-brand" aria-hidden="true">
        <span className="pax">
          <i />
          PAX
        </span>
        <span className="model">
          A<b>910S</b>
        </span>
      </div>
      <span className="side-rail" aria-hidden="true" />

      <div className="tpv" onClick={onTpvClick}>
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

        <div className="screens" ref={screensRef}>
          {children}
        </div>
      </div>

      <div className="android-nav" aria-hidden="true">
        {/* recientes */}
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
          <rect x="1.5" y="1.5" width="12" height="12" rx="2.5" stroke="currentColor" strokeWidth="1.7" />
        </svg>
        {/* home */}
        <svg width="17" height="16" viewBox="0 0 17 16" fill="none">
          <path
            d="M2 7.2 8.5 1.8 15 7.2V13a1.4 1.4 0 0 1-1.4 1.4H3.4A1.4 1.4 0 0 1 2 13V7.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinejoin="round"
          />
        </svg>
        {/* atrás */}
        <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
          <path
            d="M8 1 2 7l6 6M2.6 7H14.5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
