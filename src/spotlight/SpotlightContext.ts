import { createContext, useContext } from "react";

export type SpotlightContextValue = {
  /**
   * Reads the current radius in px straight from the DOM.
   *
   * Deliberately a getter rather than a value: the radius is fixed for the
   * app's lifetime, so there is nothing to re-render on, but a user can still
   * change it from devtools at any moment. A getter reports that honestly;
   * a snapshot in state would go stale.
   */
  getRadius: () => number;
};

export const SpotlightContext = createContext<SpotlightContextValue | null>(
  null,
);

export const useSpotlight = (): SpotlightContextValue => {
  const value = useContext(SpotlightContext);

  if (!value) {
    throw new Error("useSpotlight must be used within a SpotlightProvider");
  }

  return value;
};
