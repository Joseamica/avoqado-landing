/**
 * DashShell — shared dashboard chrome (venue sidebar + main content area) for
 * every dash-* screen in the "cadena post-venta" chapters, plus LigaList.
 *
 * Slot-based on purpose: LigaList's nav has a nested Ventas subnav, icons and
 * a side-footer that don't fit a flat NavItem[] config, so the shell accepts
 * whatever JSX the caller passes for `nav` and `children` instead of a
 * data-driven list. Renders the EXACT same lg-shell/lg-side/lg-main structure
 * and CSS classes LigaList used before this refactor — pure chrome, no
 * screen-specific markup, no state of its own.
 */
import type { ReactNode } from 'react';

interface DashShellProps {
  nav: ReactNode;
  children: ReactNode;
  /**
   * Optional sidebar footer, rendered as a SIBLING of `<nav className="lg-nav">`
   * (not nested inside it) — matches LigaList's `lg-side-foot`, which relies on
   * `lg-nav { flex: 1 }` pushing it to the bottom of the `lg-side` flex column.
   * The new ChainNav screens have no footer, so this is omitted for them.
   */
  sideFoot?: ReactNode;
  /** Venue shown in the sidebar header. Defaults to the TPV/liga demo venue;
   *  the reserva flow's calendar scene runs at Estética Bella instead. */
  venue?: string;
}

export default function DashShell({ nav, children, sideFoot, venue = 'Estudio Lumina' }: DashShellProps) {
  return (
    <div className="lg-shell">
      <aside className="lg-side">
        <div className="lg-venue">
          <b>{venue}</b>
          <span>Dashboard</span>
        </div>
        <nav className="lg-nav">{nav}</nav>
        {sideFoot}
      </aside>

      <main className="lg-main">{children}</main>
    </div>
  );
}
