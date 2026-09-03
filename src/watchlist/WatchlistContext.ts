import { createContext, useContext } from "react";

export type WatchlistContextValue = {
  /** IMDb ids, most recently added first. */
  ids: string[];
  count: number;
  has: (id: string) => boolean;
  add: (id: string) => void;
  remove: (id: string) => void;
  toggle: (id: string) => void;
};

export const WatchlistContext = createContext<WatchlistContextValue | null>(
  null,
);

export const useWatchlist = (): WatchlistContextValue => {
  const value = useContext(WatchlistContext);

  if (!value) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }

  return value;
};
