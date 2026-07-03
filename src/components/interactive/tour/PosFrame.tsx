/**
 * PosFrame — marco de tablet (shell plateado + bezel negro + cámara) para el
 * flujo P "Punto de venta", siguiendo la tabla de device frames del proyecto
 * (POS / apps de tableta → iPad CSS frame). Canvas fijo 700×500 escalado por
 * CSS en viewports angostos, igual que el BrowserFrame desktop.
 *
 * Mismo contrato que PaxPhotoFrame/BrowserFrame: las pantallas viven en
 * `.screens`, un único click-capture alimenta los rieles del engine.
 */
import type { MouseEvent as ReactMouseEvent, ReactNode } from 'react';

interface Props {
  onTpvClick: (e: ReactMouseEvent<HTMLElement>) => void;
  children: ReactNode;
}

export default function PosFrame({ onTpvClick, children }: Props) {
  return (
    <div className="posframe-wrap">
      <div className="posframe">
        <span className="posframe-cam" aria-hidden="true" />
        <div className="posframe-content" onClick={onTpvClick}>
          <div className="screens">{children}</div>
        </div>
      </div>
    </div>
  );
}
