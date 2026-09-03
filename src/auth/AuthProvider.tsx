import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { readSession, writeSession, type Session } from "./authStorage";

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(() => readSession());

  useEffect(() => {
    writeSession(session);
  }, [session]);

  const signIn = useCallback((username: string) => {
    const trimmed = username.trim();
    if (trimmed) {
      setSession({ username: trimmed });
    }
  }, []);

  const signOut = useCallback(() => setSession(null), []);

  const value = useMemo(
    () => ({ session, isSignedIn: session !== null, signIn, signOut }),
    [session, signIn, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
