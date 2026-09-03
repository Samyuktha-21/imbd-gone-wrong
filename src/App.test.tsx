import { act, fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { AD_VIDEOS } from "./antiux";
import { clearPersistedState, renderApp } from "./test/renderApp";

/**
 * Integration cover for the Track A + Track B seam. The gags read
 * `useSpotlight()`, which throws outside a provider, so a plain render of
 * the page is enough to catch a broken wiring.
 */
const isFogLifted = () =>
  document.documentElement.hasAttribute("data-spotlight-suppressed");

describe("App", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.removeAttribute("data-spotlight-suppressed");
    clearPersistedState();
  });

  test("plays a pre-roll that lifts the fog, then restores it on skip", () => {
    vi.useFakeTimers();
    try {
      renderApp();
      expect(isFogLifted()).toBe(false);

      fireEvent.click(screen.getByRole("button", { name: /play trailer/i }));

      const ad = screen.getByTestId("fake-ad-interstitial");
      expect(AD_VIDEOS.map((video) => video.id)).toContain(
        ad.getAttribute("data-video-id"),
      );
      // The one moment the page is fully visible.
      expect(isFogLifted()).toBe(true);

      // Sit through the mandatory watch time, fake resets and all.
      act(() => {
        vi.advanceTimersByTime(20_000);
      });
      expect(screen.getByTestId("fake-ad-close-button")).toBeEnabled();

      fireEvent.click(screen.getByTestId("fake-ad-close-button"));
      expect(
        screen.queryByTestId("fake-ad-interstitial"),
      ).not.toBeInTheDocument();
      // ...and straight back into the dark.
      expect(isFogLifted()).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  test("renders the page with gags wired in", () => {
    renderApp();

    expect(
      screen.getByRole("heading", { name: /shawshank redemption/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /play trailer/i })).toBeInTheDocument();
  });

  test("applies the underwater ripple to posters via the shared filter", () => {
    const { container } = renderApp();

    expect(container.querySelector("#antiux-underwater-filter")).not.toBeNull();
    expect(container.querySelectorAll(".poster.antiux-underwater").length).toBeGreaterThan(0);
  });

  test("gates Fan Favorites behind the math CAPTCHA", () => {
    renderApp();

    const gate = screen.getByTestId("math-captcha-gate");
    expect(
      within(gate).getByRole("button", { name: "Submit" }),
    ).toBeInTheDocument();

    // Only the ungated "Top Rated" grid is rendered until the gate is solved.
    expect(screen.getAllByRole("list")).toHaveLength(1);
  });

  test("renders watchlist buttons that shrink on pointer proximity", () => {
    renderApp();

    const shrinking = screen.getAllByTestId("shrinking-button");
    expect(shrinking.length).toBeGreaterThan(0);
    expect(shrinking[0]).toHaveAttribute("data-scale", "1");
  });
});
