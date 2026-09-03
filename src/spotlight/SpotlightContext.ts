import { createContext, useContext } from "react";

export type SpotlightContextValue = {
  /** Current revealed radius in px. Updates at roughly 1–3Hz, not per frame. */
  radius: number;
  /** Widen the fog by `amount` px, relative to the live DOM value. */
  widen: (amount: number) => void;
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
