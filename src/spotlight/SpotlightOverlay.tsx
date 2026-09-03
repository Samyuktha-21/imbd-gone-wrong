/**
 * The fog itself: a fixed, pointer-transparent sheet of black with a hole
 * punched in it by the --spotlight-* custom properties.
 *
 * Styling lives in spotlight.css so the radius can be registered via
 * `@property` and therefore animate smoothly as it decays.
 */
const SpotlightOverlay = () => (
  <div aria-hidden="true" className="spotlight-overlay" data-testid="spotlight-overlay" />
);

export default SpotlightOverlay;
