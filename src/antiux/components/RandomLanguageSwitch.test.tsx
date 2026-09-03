import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import RandomLanguageSwitch from "./RandomLanguageSwitch";

const translations = { en: "Hello", es: "Hola", fr: "Bonjour" };

describe("RandomLanguageSwitch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders one of the provided translations with a matching lang attribute", () => {
    render(<RandomLanguageSwitch translations={translations} />);
    const element = screen.getByTestId("random-language-switch");
    const language = element.getAttribute("data-language");

    expect(Object.keys(translations)).toContain(language);
    expect(element).toHaveTextContent(
      translations[language as keyof typeof translations],
    );
    expect(element).toHaveAttribute("lang", language as string);
  });

  test("swaps to a different language after the interval elapses", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    render(
      <RandomLanguageSwitch translations={translations} intervalMs={1000} />,
    );
    const element = screen.getByTestId("random-language-switch");
    expect(element).toHaveAttribute("data-language", "en");

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // "en" is excluded from the next pick, so it must change.
    expect(element.getAttribute("data-language")).not.toBe("en");
  });

  test("stays put when only one language is available", () => {
    render(<RandomLanguageSwitch translations={{ en: "Hello" }} intervalMs={1000} />);
    const element = screen.getByTestId("random-language-switch");

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(element).toHaveAttribute("data-language", "en");
    expect(element).toHaveTextContent("Hello");
  });
});
