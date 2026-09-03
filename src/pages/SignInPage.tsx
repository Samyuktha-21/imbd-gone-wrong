import { useState, type FormEvent, type KeyboardEvent } from "react";
import { useNavigate } from "react-router";
import {
  VAGUE_ERROR,
  displayedStrength,
  isPrintableKey,
  isSubmittable,
  useAuth,
  type FieldName,
} from "../auth";

const SignInPage = () => {
  const navigate = useNavigate();
  const { isSignedIn, isPending, session, signInWithPassword, signOut } =
    useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const appendTo = (field: FieldName, character: string) => {
    if (field === "username") {
      setUsername((value) => value + character);
    } else {
      setPassword((value) => value + character);
    }
  };

  /**
   * With Caps Lock on, the character you type is dropped into the other field.
   * Turning Caps Lock off restores normal behaviour, which is the whole escape
   * hatch — nothing here can permanently lock you out of the form.
   */
  const handleKeyDown =
    (field: FieldName) => (event: KeyboardEvent<HTMLInputElement>) => {
      if (!isPrintableKey(event.key) || !event.getModifierState("CapsLock")) {
        return;
      }
      event.preventDefault();
      appendTo(field === "username" ? "password" : "username", event.key);
    };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    if (!isSubmittable(username, password)) {
      // Never says which field, or why.
      setError(VAGUE_ERROR);
      return;
    }

    // "Remember me" visibly gives up right before submit. The session is kept
    // regardless, so the lie is cosmetic.
    setRemember(false);
    setError("");

    // Real failures get a real message. Being cryptic about a genuinely wrong
    // password would cross from annoying into a dead end.
    const failure = await signInWithPassword(username, password);
    if (failure) {
      setError(failure);
      return;
    }

    void navigate("/");
  };

  if (isSignedIn) {
    return (
      <>
        <h2 className="section-heading">Signed in</h2>
        <p className="page-note">
          You are signed in as <strong>{session?.username}</strong>. Your
          watchlist is kept in this browser.
        </p>
        <button type="button" className="button button--secondary" onClick={signOut}>
          Sign out
        </button>
      </>
    );
  }

  return (
    <>
      <h2 className="section-heading">Sign in</h2>
      <form className="signin-form" onSubmit={handleSubmit}>
        <label className="signin-field">
          <span>Email</span>
          <input
            name="username"
            type="email"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            onKeyDown={handleKeyDown("username")}
            autoComplete="off"
          />
        </label>

        <label className="signin-field">
          <span>Password</span>
          <input
            name="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={handleKeyDown("password")}
            autoComplete="off"
          />
        </label>

        {/* Confidently, consistently wrong. */}
        {password && (
          <p className="signin-strength" data-testid="password-strength">
            Password strength: <strong>{displayedStrength(password)}</strong>
          </p>
        )}

        <label className="signin-remember">
          <input
            type="checkbox"
            checked={remember}
            onChange={(event) => setRemember(event.target.checked)}
          />
          <span>Remember me</span>
        </label>

        {error && (
          <p className="signin-error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="button button--primary" disabled={isPending}>
          {isPending ? "Signing in…" : "Sign in"}
        </button>

        <p className="page-note">
          New email addresses get an account created automatically — there is no
          separate sign-up form to go hunting for.
        </p>
      </form>
    </>
  );
};

export default SignInPage;
