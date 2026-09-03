import {
  DEFAULT_RADIUS,
  MAX_RADIUS,
  MIN_RADIUS,
  RADIUS_VAR,
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
