/**
 * Starting radius, in px, of the revealed circle. Tuned to roughly one movie
 * card — enough to read a title, never enough to see the grid.
 */
export const DEFAULT_RADIUS = 95;

/**
 * The fog never fully closes. The site has to stay a torment, not a brick
 * wall — see the "fully functional and finishable" rule in ANTI-UX-IDEAS.md.
 */
export const MIN_RADIUS = 42;

/**
 * Deliberately generous so a curious user who cranks --spotlight-radius in
 * devtools is rewarded rather than clamped back down.
 */
export const MAX_RADIUS = 6000;

/**
 * How much the spotlight shrinks per decay tick, and how often that fires.
 * Scaled down alongside the radius so the fog still takes ~15s to close
 * rather than bottoming out in a couple of ticks.
 */
export const DECAY_STEP = 3.5;
export const DECAY_INTERVAL_MS = 1000;

/** Moving the pointer buys back a little room, at most once per throttle window. */
export const ACTIVITY_BOOST = 7;
export const ACTIVITY_THROTTLE_MS = 350;

/**
 * Occasionally the spotlight lies about where the cursor is. Kept a little
 * over one radius so the jump fully displaces the revealed patch without
 * flinging it somewhere unrecoverable.
 */
export const JUMP_INTERVAL_MS = 9000;
export const JUMP_DURATION_MS = 850;
export const JUMP_OFFSET_RANGE = 110;

export const RADIUS_VAR = "--spotlight-radius";
export const X_VAR = "--spotlight-x";
export const Y_VAR = "--spotlight-y";
