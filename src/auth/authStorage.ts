export const AUTH_STORAGE_KEY = "imdb-gone-wrong:session";

export type Session = {
  username: string;
};

/**
 * A local, credential-free session. There is no server to authenticate
 * against and no password is ever stored — signing in records a display name
 * so the rest of the site has someone to be rude to.
 *
 * Like the watchlist store, this part is honest: the gags live in the form,
 * not in whether the session survives.
 */
export const readSession = (): Session | null => {
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Session).username === "string" &&
      (parsed as Session).username.length > 0
    ) {
      return { username: (parsed as Session).username };
    }
    return null;
  } catch {
    return null;
  }
};

export const writeSession = (session: Session | null): void => {
  try {
    if (session) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  } catch {
    // Best-effort; the in-memory session stays correct either way.
  }
};
