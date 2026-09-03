import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { WatchlistContext } from "./WatchlistContext";
import { readWatchlist, writeWatchlist } from "./watchlistStorage";

/**
 * Holds the watchlist and mirrors it into localStorage so it survives a
 * reload. Newest additions go to the front, which is what the watchlist page
 * renders.
 */
const WatchlistProvider = ({ children }: { children: ReactNode }) => {
  const [ids, setIds] = useState<string[]>(() => readWatchlist());

  useEffect(() => {
    writeWatchlist(ids);
  }, [ids]);

  const add = useCallback((id: string) => {
    setIds((current) => (current.includes(id) ? current : [id, ...current]));
  }, []);

  const remove = useCallback((id: string) => {
    setIds((current) => current.filter((entry) => entry !== id));
  }, []);

  const toggle = useCallback((id: string) => {
    setIds((current) =>
      current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [id, ...current],
    );
  }, []);

  const value = useMemo(
    () => ({
      ids,
      count: ids.length,
      has: (id: string) => ids.includes(id),
      add,
      remove,
      toggle,
    }),
    [ids, add, remove, toggle],
  );

  return (
    <WatchlistContext.Provider value={value}>
      {children}
    </WatchlistContext.Provider>
  );
};

export default WatchlistProvider;
