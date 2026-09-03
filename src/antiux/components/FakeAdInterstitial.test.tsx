import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import FakeAdInterstitial from "./FakeAdInterstitial";

describe("FakeAdInterstitial", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("starts with the close button disabled and a live countdown", () => {
    const onDismiss = vi.fn();
    render(
      <FakeAdInterstitial
        durationSeconds={5}
        fakeResets={1}
        onDismiss={onDismiss}
      />,
    );

    expect(screen.getByTestId("fake-ad-close-button")).toBeDisabled();
    expect(screen.getByTestId("fake-ad-skip-label")).toHaveTextContent(
      "Skip Ad in 5s",
    );

    fireEvent.click(screen.getByTestId("fake-ad-close-button"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test("fake-resets the countdown before finally allowing dismissal", () => {
    const onDismiss = vi.fn();
    render(
      <FakeAdInterstitial
        durationSeconds={5}
        fakeResets={1}
        onDismiss={onDismiss}
      />,
    );

    // First full countdown burns the single allowed fake reset.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("fake-ad-close-button")).toBeDisabled();

    // Second countdown genuinely finishes.
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("fake-ad-close-button")).toBeEnabled();
    expect(screen.getByTestId("fake-ad-skip-label")).toHaveTextContent(
      "You can skip now",
    );

    fireEvent.click(screen.getByTestId("fake-ad-close-button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
