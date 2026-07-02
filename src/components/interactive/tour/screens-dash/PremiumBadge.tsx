/**
 * PremiumBadge — small discreet pill marking a feature as Premium-tier
 * (INVENTORY_TRACKING / CFDI today — see avoqado-server basePlan.service.ts).
 * Informative only: the tour has no real tier gating (out of scope, see spec
 * "Fuera de alcance"). No emoji, neutral/amber tone via the shared
 * --color-alert-amber OKLCH token.
 */
export default function PremiumBadge() {
  return <span className="dash-premium-badge">Premium</span>;
}
