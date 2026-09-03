import { createContext, useContext } from "react";

export type SpotlightState = {
  radius: number;
  x: number;
  y: number;
};

export type SpotlightContextValue = SpotlightState & {
  /** Nudge the spotlight back toward the pointer, partially undoing decay. */
  registerActivity: () => void;
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
