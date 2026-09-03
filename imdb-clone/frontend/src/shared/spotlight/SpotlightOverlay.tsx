import type { CSSProperties } from "react";

/**
 * Renders above the whole app (below modals/tooltips) and masks everything
 * outside a circle driven by the `--spotlight-*` CSS custom properties set
 * by SpotlightProvider. Pointer-events pass through untouched.
 */
const overlayStyle: CSSProperties = {
  backgroundImage:
    "radial-gradient(circle var(--spotlight-radius) at var(--spotlight-x) var(--spotlight-y), transparent 0%, transparent 55%, rgba(3, 5, 10, 0.94) 100%)",
  inset: 0,
  pointerEvents: "none",
  position: "fixed",
  transition: "--spotlight-radius 500ms ease-out",
  zIndex: 1200,
};

const SpotlightOverlay = () => (
  <div aria-hidden data-testid="spotlight-overlay" style={overlayStyle} />
);

export default SpotlightOverlay;
