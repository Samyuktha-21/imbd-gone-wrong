import {
  DEFAULT_RADIUS,
  MAX_RADIUS,
  MIN_RADIUS,
  RADIUS_VAR,
  SUPPRESSED_ATTR,
  X_VAR,
  Y_VAR,
} from "./spotlightConfig";

const root = () => document.documentElement;

export const clampRadius = (value: number) =>
  Math.min(MAX_RADIUS, Math.max(MIN_RADIUS, value));

/**
 * Reads the *live* value rather than any cached copy, so a radius typed into
 * devtools is what callers see.
 */
export const readRadius = (): number => {
  const parsed = Number.parseFloat(root().style.getPropertyValue(RADIUS_VAR));
  return Number.isFinite(parsed) ? parsed : DEFAULT_RADIUS;
};

/** Called once at mount. Nothing else in the app writes the radius. */
export const writeRadius = (value: number): number => {
  const next = clampRadius(value);
  root().style.setProperty(RADIUS_VAR, `${next}px`);
  return next;
};

export const writePosition = (x: number, y: number): void => {
  const element = root();
  element.style.setProperty(X_VAR, `${x}px`);
  element.style.setProperty(Y_VAR, `${y}px`);
};

/**
 * Lifts or restores the fog. Used while a full-screen video plays, where the
 * whole point is that you can finally see the page — the mercy is temporary.
 */
export const writeSuppressed = (suppressed: boolean): void => {
  const element = root();
  if (suppressed) {
    element.setAttribute(SUPPRESSED_ATTR, "");
  } else {
    element.removeAttribute(SUPPRESSED_ATTR);
  }
};

export const readSuppressed = (): boolean =>
  root().hasAttribute(SUPPRESSED_ATTR);
