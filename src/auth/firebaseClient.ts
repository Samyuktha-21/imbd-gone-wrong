import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

/**
 * Web API keys are not secrets — Google's own docs say so. They identify the
 * project; access is governed by Firebase Security Rules, not by hiding this
 * value. It is checked in deliberately so the app builds without a .env.
 */
const firebaseConfig = {
  apiKey: "AIzaSyCHXa99ZjPzdzwQzcqT9haWrGv300Y42Zo",
  authDomain: "imdb-9afba.firebaseapp.com",
  projectId: "imdb-9afba",
  storageBucket: "imdb-9afba.firebasestorage.app",
  messagingSenderId: "488764684248",
  appId: "1:488764684248:web:dd7c1f1f365958d49e24ad",
  measurementId: "G-X7SS4PYMHV",
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

/**
 * Lazily initialised so importing this module never throws, and so unit tests
 * that never touch auth do not have to stand up a Firebase app.
 *
 * Returns null if initialisation fails for any reason — a missing config, a
 * blocked network, an unsupported environment. Callers fall back to the local
 * session rather than leaving the user unable to sign in at all.
 */
export const getFirebaseAuth = (): Auth | null => {
  if (auth) {
    return auth;
  }

  try {
    app = app ?? initializeApp(firebaseConfig);
    auth = getAuth(app);
    return auth;
  } catch {
    return null;
  }
};

/**
 * Firebase surfaces failures as `auth/...` codes. Mapped to plain sentences —
 * except when the deliberately vague error is in play, which the form decides.
 */
export const describeAuthError = (code: string): string => {
  switch (code) {
    case "auth/invalid-email":
      return "That email address is not valid.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email or password is incorrect.";
    case "auth/email-already-in-use":
      return "That email already has an account. Try signing in instead.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "auth/network-request-failed":
      return "Could not reach Firebase. Check your connection.";
    case "auth/operation-not-allowed":
      return "Email/password sign-in is not enabled in the Firebase console yet.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a moment and try again.";
    default:
      return "Sign-in failed. Please try again.";
  }
};
