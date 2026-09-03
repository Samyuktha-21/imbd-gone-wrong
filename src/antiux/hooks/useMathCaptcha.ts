import { useState } from "react";

export type MathCaptchaProblem = {
  question: string;
  answer: number;
  tolerance?: number | undefined;
};

/**
 * Deliberately too hard to do in your head in a reasonable time — the
 * joke is that this "human verification" gate effectively requires you to
 * paste it into an AI tool to get through.
 */
const DEFAULT_PROBLEMS: MathCaptchaProblem[] = [
  {
    question:
      "Let f(x) = 3x⁴ − 5x³ + 2x. What is f′(2)? (the derivative of f evaluated at x = 2)",
    answer: 62,
  },
  {
    question: "Evaluate the definite integral of 2x³ from x = 0 to x = 3.",
    answer: 40.5,
    tolerance: 0.1,
  },
  {
    question:
      "A fair coin is flipped 5 times. What is the probability of getting exactly 3 heads? (decimal, 2+ places)",
    answer: 0.3125,
    tolerance: 0.01,
  },
  {
    question:
      "What is the sum of the interior angles, in degrees, of a convex polygon with 11 sides?",
    answer: 1620,
  },
];

const normalizeAnswer = (raw: string) =>
  Number.parseFloat(raw.trim().replace(/,/g, ""));

const pickRandomProblem = (
  problems: MathCaptchaProblem[],
): MathCaptchaProblem =>
  problems[Math.floor(Math.random() * problems.length)] as MathCaptchaProblem;

export const useMathCaptcha = (
  problems: MathCaptchaProblem[] = DEFAULT_PROBLEMS,
) => {
  const [problem] = useState(() => pickRandomProblem(problems));
  const [isSolved, setIsSolved] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);

  /**
   * Accepts any reasonably-formatted correct final value so the gag never
   * becomes a real dead end.
   */
  const submitAnswer = (rawAnswer: string) => {
    const parsed = normalizeAnswer(rawAnswer);
    const tolerance = problem.tolerance ?? 0.001;
    const correct =
      Number.isFinite(parsed) && Math.abs(parsed - problem.answer) <= tolerance;

    setIsSolved(correct);
    setHasFailed(!correct);
    return correct;
  };

  return { hasFailed, isSolved, problem, submitAnswer };
};
