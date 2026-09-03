import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useSpotlight } from "./SpotlightContext";
import SpotlightProvider from "./SpotlightProvider";
import { DEFAULT_RADIUS, RADIUS_VAR, X_VAR, Y_VAR } from "./spotlightConfig";

const rootStyle = () => document.documentElement.style;
const currentRadius = () =>
  Number.parseFloat(rootStyle().getPropertyValue(RADIUS_VAR));

const Probe = () => {
  const { getRadius } = useSpotlight();
  return <span data-testid="radius">{getRadius()}</span>;
};

const renderSpotlight = (props: Record<string, unknown> = {}) =>
  render(
    <SpotlightProvider enableRandomJumps={false} {...props}>
      <Probe />
    </SpotlightProvider>,
  );

const movePointer = (clientX: number, clientY: number) => {
  act(() => {
    window.dispatchEvent(new MouseEvent("pointermove", { clientX, clientY }));
    vi.advanceTimersByTime(20); // let the rAF shim flush
  });
};

describe("SpotlightProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    rootStyle().removeProperty(RADIUS_VAR);
    rootStyle().removeProperty(X_VAR);
    rootStyle().removeProperty(Y_VAR);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders children behind an overlay and seeds the radius", () => {
    renderSpotlight();

    expect(screen.getByTestId("spotlight-overlay")).toBeInTheDocument();
    expect(currentRadius()).toBe(DEFAULT_RADIUS);
  });

  test("holds the radius steady over time", () => {
    renderSpotlight();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(currentRadius()).toBe(DEFAULT_RADIUS);
  });

  test("does not change the radius in response to pointer movement", () => {
    renderSpotlight();

    movePointer(10, 10);
    movePointer(400, 300);
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    movePointer(800, 600);

    expect(currentRadius()).toBe(DEFAULT_RADIUS);
  });

  test("never overwrites a radius set from devtools", () => {
    renderSpotlight();

    act(() => {
      rootStyle().setProperty(RADIUS_VAR, "1500px");
    });

    // Everything that used to fight a manual edit: time passing, and moving.
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    movePointer(120, 120);

    expect(currentRadius()).toBe(1500);
  });

  test("tracks the pointer into the position custom properties", () => {
    renderSpotlight();
    movePointer(321, 654);

    expect(rootStyle().getPropertyValue(X_VAR)).toBe("321px");
    expect(rootStyle().getPropertyValue(Y_VAR)).toBe("654px");
  });

  test("exposes the live radius through useSpotlight", () => {
    renderSpotlight();

    expect(screen.getByTestId("radius").textContent).toBe(
      String(DEFAULT_RADIUS),
    );
  });

  test("useSpotlight rejects use outside a provider", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(
      "useSpotlight must be used within a SpotlightProvider",
    );

    errorSpy.mockRestore();
  });
});
