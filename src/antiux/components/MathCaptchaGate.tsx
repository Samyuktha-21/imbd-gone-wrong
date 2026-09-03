import { useId, useState, type FormEvent, type ReactNode } from "react";
import {
  useMathCaptcha,
  type MathCaptchaProblem,
} from "../hooks/useMathCaptcha";
import "../antiux.css";

type MathCaptchaGateProps = {
  children: ReactNode;
  actionLabel?: string;
  problems?: MathCaptchaProblem[];
};

/**
 * Gates `children` behind a "prove you're human" math problem that is
 * effectively impossible to solve in your head — the joke being that the
 * human-verification gate actually requires an AI tool to pass.
 */
const MathCaptchaGate = ({
  children,
  actionLabel = "view your cart",
  problems,
}: MathCaptchaGateProps) => {
  const { hasFailed, isSolved, problem, submitAnswer } =
    useMathCaptcha(problems);
  const [value, setValue] = useState("");
  const inputId = useId();

  if (isSolved) {
    return <>{children}</>;
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submitAnswer(value);
  };

  return (
    <form
      className="antiux-captcha"
      data-testid="math-captcha-gate"
      onSubmit={handleSubmit}
    >
      <p className="antiux-captcha__title">
        Prove you&rsquo;re human to {actionLabel}
      </p>
      <p className="antiux-captcha__question">{problem.question}</p>

      <label className="antiux-captcha__label" htmlFor={inputId}>
        Your answer
        <input
          className="antiux-captcha__input"
          id={inputId}
          onChange={(event) => setValue(event.target.value)}
          value={value}
        />
      </label>

      {hasFailed && (
        <p className="antiux-captcha__error" role="alert">
          Not quite. Try again.
        </p>
      )}

      <button className="antiux-button" type="submit">
        Submit
      </button>
    </form>
  );
};

export default MathCaptchaGate;
