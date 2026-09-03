export type FieldName = "username" | "password";

/**
 * With Caps Lock on, characters land in the *other* field.
 *
 * Straight from the Account/Auth section of ANTI-UX-IDEAS.md. It stays
 * finishable because the escape is entirely in the user's hands: turn Caps
 * Lock off and the form behaves normally.
 */
export const swapTarget = (field: FieldName): FieldName =>
  field === "username" ? "password" : "username";

/** A keypress only gets redirected if it would have typed a character. */
export const isPrintableKey = (key: string): boolean => key.length === 1;

export const STRENGTH_LABELS = [
  "Very weak",
  "Weak",
  "Strong",
  "Very strong",
] as const;

export type StrengthLabel = (typeof STRENGTH_LABELS)[number];

/** An ordinary strength score: length, plus a nod to character variety. */
export const realStrength = (password: string): 0 | 1 | 2 | 3 => {
  if (password.length < 4) {
    return 0;
  }

  const variety =
    Number(/[a-z]/.test(password)) +
    Number(/[A-Z]/.test(password)) +
    Number(/\d/.test(password)) +
    Number(/[^A-Za-z0-9]/.test(password));

  if (password.length >= 12 && variety >= 3) {
    return 3;
  }
  if (password.length >= 8 && variety >= 2) {
    return 2;
  }
  return 1;
};

/**
 * The meter is confidently, consistently wrong: it reports the exact inverse
 * of the real score, so a strong password reads "Very weak" and vice versa.
 *
 * Inverted rather than randomised on purpose — a random meter reads as broken,
 * while a stable wrong answer reads as a meter that disagrees with you.
 */
export const displayedStrength = (password: string): StrengthLabel =>
  STRENGTH_LABELS[3 - realStrength(password)] as StrengthLabel;

/**
 * The form accepts anything non-empty. It has nothing to authenticate
 * against, so rejecting real input would be a dead end rather than a joke.
 */
export const isSubmittable = (username: string, password: string): boolean =>
  username.trim().length > 0 && password.length > 0;

/** Never says which field, or why. */
export const VAGUE_ERROR = "Something is wrong.";
