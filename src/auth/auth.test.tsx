import { fireEvent, screen } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { clearPersistedState, renderApp as renderAt } from "../test/renderApp";
import { AUTH_STORAGE_KEY, readSession, writeSession } from "./authStorage";
import {
  STRENGTH_LABELS,
  VAGUE_ERROR,
  displayedStrength,
  isPrintableKey,
  isSubmittable,
  realStrength,
  swapTarget,
} from "./signInGags";

/** jsdom's KeyboardEvent has no Caps Lock state, so it gets stubbed on. */
const typeWithCapsLock = (input: HTMLElement, key: string) => {
  const event = new KeyboardEvent("keydown", {
    key,
    bubbles: true,
    cancelable: true,
  });
  Object.defineProperty(event, "getModifierState", { value: () => true });
  fireEvent(input, event);
};

afterEach(clearPersistedState);

describe("authStorage", () => {
  test("returns null when nothing is stored", () => {
    expect(readSession()).toBeNull();
  });

  test("round-trips a session", () => {
    writeSession({ username: "ebert" });
    expect(readSession()).toEqual({ username: "ebert" });
  });

  test("clears the session when passed null", () => {
    writeSession({ username: "ebert" });
    writeSession(null);
    expect(readSession()).toBeNull();
  });

  test("survives a corrupt entry", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, "{not json");
    expect(readSession()).toBeNull();
  });

  test("rejects a stored value with no username", () => {
    window.localStorage.setItem(AUTH_STORAGE_KEY, '{"username":""}');
    expect(readSession()).toBeNull();
  });
});

describe("sign-in gag helpers", () => {
  test("swapTarget flips between the two fields", () => {
    expect(swapTarget("username")).toBe("password");
    expect(swapTarget("password")).toBe("username");
  });

  test("only single characters count as printable", () => {
    expect(isPrintableKey("a")).toBe(true);
    expect(isPrintableKey("Backspace")).toBe(false);
    expect(isPrintableKey("Enter")).toBe(false);
  });

  test("the strength meter reports the exact inverse of the truth", () => {
    const strong = "Tr0ub4dor&3xyz";
    const weak = "ab";

    expect(realStrength(strong)).toBe(3);
    expect(displayedStrength(strong)).toBe("Very weak");

    expect(realStrength(weak)).toBe(0);
    expect(displayedStrength(weak)).toBe("Very strong");
  });

  test("the meter is always wrong, never accidentally right", () => {
    for (const password of ["a", "abcd", "abcdefgh", "Passw0rd!", "Tr0ub4dor&3xyz"]) {
      const truthful = STRENGTH_LABELS[realStrength(password)];
      expect(displayedStrength(password)).not.toBe(truthful);
    }
  });

  test("any non-empty pair is submittable, so the form is never a dead end", () => {
    expect(isSubmittable("a", "b")).toBe(true);
    expect(isSubmittable("", "b")).toBe(false);
    expect(isSubmittable("a", "")).toBe(false);
    expect(isSubmittable("   ", "b")).toBe(false);
  });
});

describe("SignInPage", () => {
  test("signing in persists a session and greets you in the header", async () => {
    const { user } = renderAt("/signin");

    await user.type(screen.getByLabelText("Username"), "ebert");
    await user.type(screen.getByLabelText("Password"), "hunter2");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(readSession()).toEqual({ username: "ebert" });
    expect(screen.getByRole("link", { name: "ebert" })).toBeInTheDocument();
  });

  test("an incomplete form fails without ever saying what is wrong", async () => {
    const { user } = renderAt("/signin");

    await user.type(screen.getByLabelText("Username"), "ebert");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    expect(screen.getByRole("alert")).toHaveTextContent(VAGUE_ERROR);
    expect(readSession()).toBeNull();
  });

  test("Caps Lock drops your keystrokes into the other field", () => {
    renderAt("/signin");

    const username = screen.getByLabelText("Username") as HTMLInputElement;
    const password = screen.getByLabelText("Password") as HTMLInputElement;

    typeWithCapsLock(username, "X");

    expect(username.value).toBe("");
    expect(password.value).toBe("X");
  });

  test("Caps Lock swaps in both directions", () => {
    renderAt("/signin");

    const username = screen.getByLabelText("Username") as HTMLInputElement;
    const password = screen.getByLabelText("Password") as HTMLInputElement;

    typeWithCapsLock(password, "Y");

    expect(password.value).toBe("");
    expect(username.value).toBe("Y");
  });

  test("non-printable keys are left alone even with Caps Lock on", () => {
    renderAt("/signin");

    const username = screen.getByLabelText("Username") as HTMLInputElement;
    const password = screen.getByLabelText("Password") as HTMLInputElement;

    typeWithCapsLock(username, "Backspace");

    expect(password.value).toBe("");
  });

  test("shows the (wrong) strength meter once a password is typed", async () => {
    const { user } = renderAt("/signin");

    await user.type(screen.getByLabelText("Password"), "Tr0ub4dor&3xyz");

    expect(screen.getByTestId("password-strength")).toHaveTextContent(
      "Very weak",
    );
  });

  test("'Remember me' unchecks itself on submit but the session persists anyway", async () => {
    const { user } = renderAt("/signin");

    const remember = screen.getByLabelText("Remember me") as HTMLInputElement;
    expect(remember.checked).toBe(true);

    await user.type(screen.getByLabelText("Username"), "ebert");
    await user.type(screen.getByLabelText("Password"), "hunter2");
    await user.click(screen.getByRole("button", { name: "Sign in" }));

    // The checkbox lied; the session is kept regardless.
    expect(readSession()).toEqual({ username: "ebert" });
  });

  test("restores an existing session and can sign out", async () => {
    writeSession({ username: "pauline" });
    const { user } = renderAt("/signin");

    // Shown twice on purpose: once in the header, once on the page.
    expect(screen.getByRole("heading", { name: "Signed in" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "pauline" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(readSession()).toBeNull();
    expect(screen.getByRole("button", { name: "Sign in" })).toBeInTheDocument();
  });
});
