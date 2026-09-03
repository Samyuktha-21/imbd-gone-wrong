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
 * Reads the *live* inline value rather than trusting React state.
 *
 * This is what makes the sanctioned devtools cheat work: when someone edits
 * --spotlight-radius in the inspector, the very next decay tick reads their
 * number and continues from it, instead of stomping it with a stale value.
 */
export const readRadius = (): number => {
  const parsed = Number.parseFloat(root().style.getPropertyValue(RADIUS_VAR));
  return Number.isFinite(parsed) ? parsed : DEFAULT_RADIUS;
};

export const writeRadius = (value: number): number => {
  const next = clampRadius(value);
  root().style.setProperty(RADIUS_VAR, `${next}px`);
  return next;
};

/** Nudges the radius relative to whatever is currently in the DOM. */
export const adjustRadius = (delta: number): number =>
  writeRadius(readRadius() + delta);

export const writePosition = (x: number, y: number): void => {
  const element = root();
  element.style.setProperty(X_VAR, `${x}px`);
  element.style.setProperty(Y_VAR, `${y}px`);
};
