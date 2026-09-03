import { DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS } from "./spotlightConfig";
import { readRadius, writeRadius } from "./spotlightVars";

export type SpotlightConsoleApi = {
  /** Read or assign the radius in px: `spotlight.radius = 400`. */
  radius: number;
  /** Put it back to the punishing default. */
  reset: () => number;
};

declare global {
  interface Window {
    spotlight?: SpotlightConsoleApi;
  }
}

/**
 * Exposes `window.spotlight` so the radius can be changed from the Console
 * tab, alongside editing --spotlight-radius directly in the Elements panel.
 *
 * This is the one sanctioned cheat (see ANTI-UX-IDEAS.md): the site is
 * deliberately hostile, but a user curious enough to open devtools gets a way
 * out. The hint below is logged rather than shown on the page for the same
 * reason — you only find it by going looking.
 */
export const registerSpotlightConsole = (): (() => void) => {
  const api: SpotlightConsoleApi = {
    get radius() {
      return readRadius();
    },
    set radius(value: number) {
      writeRadius(value);
    },
    reset: () => writeRadius(DEFAULT_RADIUS),
  };

  window.spotlight = api;

  console.info(
    `%c🔦 spotlight%c\n  spotlight.radius = 400   (${MIN_RADIUS}–${MAX_RADIUS})\n  spotlight.reset()\n  or edit --spotlight-radius on <html>`,
    "font-weight:bold",
    "font-weight:normal",
  );

  return () => {
    delete window.spotlight;
  };
};
