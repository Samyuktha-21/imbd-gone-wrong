import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { readSession, writeSession, type Session } from "./authStorage";
import { describeAuthError, getFirebaseAuth } from "./firebaseClient";

/**
 * Real Firebase accounts, with the previous localStorage session kept as a
 * fallback.
 *
 * The fallback is not belt-and-braces for its own sake: until Email/Password is
 * enabled in the Firebase console the SDK rejects every attempt with
 * `auth/operation-not-allowed`, and the site would have a sign-in button that
 * cannot succeed. Falling back keeps it usable in that window, offline, and in
 * tests, which never reach the network.
 */
const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(() => readSession());
  const [isPending, setIsPending] = useState(false);

  // Mirror whatever we settle on into localStorage so a reload keeps you in.
  useEffect(() => {
    writeSession(session);
  }, [session]);

  // Adopt a live Firebase session if there is one.
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      return;
    }

    return onAuthStateChanged(auth, (user) => {
      if (user) {
        setSession({
          username: user.displayName ?? user.email ?? "user",
          email: user.email ?? undefined,
          uid: user.uid,
        });
      }
    });
  }, []);

  /** Local-only sign in. Used directly, and as the fallback path below. */
  const signIn = useCallback((username: string) => {
    const trimmed = username.trim();
    if (trimmed) {
      setSession({ username: trimmed });
    }
  }, []);

  /**
   * Tries Firebase, creating the account if the email is new. Returns an error
   * string on failure, or null on success.
   */
  const signInWithPassword = useCallback(
    async (email: string, password: string): Promise<string | null> => {
      const auth = getFirebaseAuth();
      const trimmed = email.trim();

      if (!auth) {
        signIn(trimmed);
        return null;
      }

      setIsPending(true);
      try {
        try {
          await signInWithEmailAndPassword(auth, trimmed, password);
        } catch (error) {
          const code = (error as { code?: string }).code ?? "";

          // No account yet: register instead of dead-ending on a login form
          // with nowhere to sign up.
          if (code === "auth/user-not-found" || code === "auth/invalid-credential") {
            await createUserWithEmailAndPassword(auth, trimmed, password);
          } else if (code === "auth/operation-not-allowed") {
            // Console switch still off. Keep the site usable.
            signIn(trimmed);
            return null;
          } else {
            return describeAuthError(code);
          }
        }
        return null;
      } catch (error) {
        return describeAuthError((error as { code?: string }).code ?? "");
      } finally {
        setIsPending(false);
      }
    },
    [signIn],
  );

  const signOut = useCallback(async () => {
    const auth = getFirebaseAuth();
    if (auth?.currentUser) {
      try {
        await firebaseSignOut(auth);
      } catch {
        // Falls through: the local session is cleared either way.
      }
    }
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isSignedIn: session !== null,
      isPending,
      signIn,
      signInWithPassword,
      signOut,
    }),
    [session, isPending, signIn, signInWithPassword, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
