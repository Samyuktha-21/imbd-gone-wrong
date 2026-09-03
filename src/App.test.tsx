import { render, screen, within } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import App from "./App";
import { SpotlightProvider } from "./spotlight";

/**
 * Integration cover for the Track A + Track B seam. The gags read
 * `useSpotlight()`, which throws outside a provider, so a plain render of
 * the page is enough to catch a broken wiring.
 */
const renderApp = () =>
  render(
    <SpotlightProvider>
      <App />
    </SpotlightProvider>,
  );

describe("App", () => {
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
