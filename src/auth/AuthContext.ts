import { createContext, useContext } from "react";
import type { Session } from "./authStorage";

export type AuthContextValue = {
  session: Session | null;
  isSignedIn: boolean;
  signIn: (username: string) => void;
  signOut: () => void;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuth = (): AuthContextValue => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return value;
};
