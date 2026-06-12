/**
 * BrowserFrame — marco de navegador para los flujos web del tour:
 *  - variant "phone": navegador móvil (la página de reservas del venue).
 *  - variant "desktop": ventana macOS (el dashboard, canvas fijo 700×500
 *    escalado por CSS en viewports angostos).
 *
 * Igual que TerminalFrame: las pantallas viven en `.screens` (mismo ref
 * que consume el engine) y un único click-capture alimenta los rieles.
 */
import type { MouseEvent as ReactMouseEvent, ReactNode, RefObject } from 'react';

interface Props {
  variant: 'phone' | 'desktop';
  url: string;
  screensRef: RefObject<HTMLDivElement>;
  onTpvClick: (e: ReactMouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

export default function BrowserFrame({ variant, url, screensRef, onTpvClick, children }: Props) {
  return (
    <div className={`bframe-wrap ${variant}`}>
      <div className={`bframe ${variant}`}>
        <div className="b-toolbar" aria-hidden="true">
          {variant === 'desktop' ? (
            <span className="b-lights">
              <i className="r" />
              <i className="y" />
              <i className="g" />
            </span>
          ) : (
            <span className="b-lights-spacer" />
          )}
          <span className="b-url">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
              <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" />
            </svg>
            {url}
          </span>
          <span className="b-toolbar-end" />
        </div>
        <div className="b-content" onClick={onTpvClick}>
          <div className="screens" ref={screensRef}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
