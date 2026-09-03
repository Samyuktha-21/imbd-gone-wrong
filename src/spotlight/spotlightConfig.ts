/**
 * Radius, in px, of the revealed circle. Tuned to roughly one movie card —
 * enough to read a title, never enough to see the grid.
 *
 * This is set once on mount and then left alone. Nothing in the app moves it
 * afterwards, which is what makes the sanctioned devtools cheat reliable:
 * edit --spotlight-radius in the inspector and it simply stays where you put
 * it. Mirrored as the `initial-value` in spotlight.css.
 */
export const DEFAULT_RADIUS = 95;

/** Guard rails for the value, including anything typed into devtools. */
export const MIN_RADIUS = 42;
export const MAX_RADIUS = 6000;

/**
 * Occasionally the spotlight lies about where the cursor is. This moves the
 * circle, never its size.
 */
export const JUMP_INTERVAL_MS = 9000;
export const JUMP_DURATION_MS = 850;
export const JUMP_OFFSET_RANGE = 110;

/**
 * Set on <html> while the fog is lifted (during full-screen video playback).
 * An attribute rather than React state keeps the provider re-render-free,
 * matching how position and radius are already written straight to the DOM.
 */
export const SUPPRESSED_ATTR = "data-spotlight-suppressed";

export const RADIUS_VAR = "--spotlight-radius";
export const X_VAR = "--spotlight-x";
export const Y_VAR = "--spotlight-y";
