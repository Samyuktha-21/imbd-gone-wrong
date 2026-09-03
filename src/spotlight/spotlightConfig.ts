/** Starting radius, in px, of the revealed circle. */
export const DEFAULT_RADIUS = 190;

/**
 * The fog never fully closes. The site has to stay a torment, not a brick
 * wall — see the "fully functional and finishable" rule in ANTI-UX-IDEAS.md.
 */
export const MIN_RADIUS = 80;

/**
 * Deliberately generous so a curious user who cranks --spotlight-radius in
 * devtools is rewarded rather than clamped back down.
 */
export const MAX_RADIUS = 6000;

/** How much the spotlight shrinks per decay tick, and how often that fires. */
export const DECAY_STEP = 6;
export const DECAY_INTERVAL_MS = 1000;

/** Moving the pointer buys back a little room, at most once per throttle window. */
export const ACTIVITY_BOOST = 14;
export const ACTIVITY_THROTTLE_MS = 350;

/** Occasionally the spotlight lies about where the cursor is. */
export const JUMP_INTERVAL_MS = 9000;
export const JUMP_DURATION_MS = 850;
export const JUMP_OFFSET_RANGE = 160;

export const RADIUS_VAR = "--spotlight-radius";
export const X_VAR = "--spotlight-x";
export const Y_VAR = "--spotlight-y";
