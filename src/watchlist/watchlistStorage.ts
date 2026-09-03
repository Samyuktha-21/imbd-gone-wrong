export const STORAGE_KEY = "imdb-gone-wrong:watchlist";

/**
 * The store itself is deliberately honest: it saves what you asked it to save
 * and gives it back intact. The gags live in the UI that wraps it. A watchlist
 * that quietly lost titles would be a bug, not a bit.
 *
 * Every access is guarded because localStorage throws rather than returning
 * null in Safari private mode and when storage is full.
 */
export const readWatchlist = (): string[] => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    // Tolerate a hand-edited or partly-corrupt entry rather than throwing the
    // whole watchlist away.
    return parsed.filter((id): id is string => typeof id === "string");
  } catch {
    return [];
  }
};

export const writeWatchlist = (ids: string[]): void => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Persisting is best-effort; the in-memory list stays correct either way.
  }
};
