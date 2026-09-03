import { createContext, useContext } from "react";
import type { Session } from "./authStorage";

export type AuthContextValue = {
  session: Session | null;
  isSignedIn: boolean;
  /** True while a Firebase request is in flight. */
  isPending: boolean;
  /** Local-only sign in, by display name. */
  signIn: (username: string) => void;
  /** Real Firebase sign in, registering the account if the email is new. */
  signInWithPassword: (email: string, password: string) => Promise<string | null>;
  signOut: () => void | Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return value;
};
