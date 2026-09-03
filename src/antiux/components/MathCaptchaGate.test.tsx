import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import MathCaptchaGate from "./MathCaptchaGate";

const problems = [{ answer: 42, question: "What is 6 times 7?" }];

const submit = (answer: string) => {
  fireEvent.change(screen.getByLabelText(/your answer/i), {
    target: { value: answer },
  });
  fireEvent.click(screen.getByRole("button", { name: "Submit" }));
};

describe("MathCaptchaGate", () => {
  test("blocks children until the correct answer is submitted", () => {
    render(
      <MathCaptchaGate problems={problems}>
        <div>Secret cart contents</div>
      </MathCaptchaGate>,
    );

    expect(screen.queryByText("Secret cart contents")).not.toBeInTheDocument();
    expect(screen.getByText("What is 6 times 7?")).toBeInTheDocument();
  });

  test("shows an error and stays blocked on a wrong answer", () => {
    render(
      <MathCaptchaGate problems={problems}>
        <div>Secret cart contents</div>
      </MathCaptchaGate>,
    );

    submit("7");

    expect(screen.getByRole("alert")).toHaveTextContent("Not quite. Try again.");
    expect(screen.queryByText("Secret cart contents")).not.toBeInTheDocument();
  });

  test("reveals children once the correct answer is submitted", () => {
    render(
      <MathCaptchaGate problems={problems}>
        <div>Secret cart contents</div>
      </MathCaptchaGate>,
    );

    submit("42");

    expect(screen.getByText("Secret cart contents")).toBeInTheDocument();
    expect(screen.queryByTestId("math-captcha-gate")).not.toBeInTheDocument();
  });

  test("accepts an answer within the problem's tolerance", () => {
    render(
      <MathCaptchaGate
        problems={[{ answer: 40.5, question: "Integral?", tolerance: 0.1 }]}
      >
        <div>Secret cart contents</div>
      </MathCaptchaGate>,
    );

    submit("40.55");

    expect(screen.getByText("Secret cart contents")).toBeInTheDocument();
  });

  test("tolerates surrounding whitespace and thousands separators", () => {
    render(
      <MathCaptchaGate problems={[{ answer: 1620, question: "Angles?" }]}>
        <div>Secret cart contents</div>
      </MathCaptchaGate>,
    );

    submit("  1,620 ");

    expect(screen.getByText("Secret cart contents")).toBeInTheDocument();
  });
});
