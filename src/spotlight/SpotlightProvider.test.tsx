import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useSpotlight } from "./SpotlightContext";
import SpotlightProvider from "./SpotlightProvider";
import {
  ACTIVITY_THROTTLE_MS,
  DECAY_INTERVAL_MS,
  DECAY_STEP,
  DEFAULT_RADIUS,
  RADIUS_VAR,
  X_VAR,
} from "./spotlightConfig";

const rootStyle = () => document.documentElement.style;
const currentRadius = () =>
  Number.parseFloat(rootStyle().getPropertyValue(RADIUS_VAR));

const Probe = () => {
  const { radius } = useSpotlight();
  return <span data-testid="radius">{radius}</span>;
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
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("renders children behind an overlay and seeds the radius", () => {
    renderSpotlight();

    expect(screen.getByTestId("spotlight-overlay")).toBeInTheDocument();
    expect(currentRadius()).toBe(DEFAULT_RADIUS);
  });

  test("tracks the pointer into the x custom property", () => {
    renderSpotlight();
    movePointer(321, 654);

    expect(rootStyle().getPropertyValue(X_VAR)).toBe("321px");
  });

  test("shrinks the radius on each decay tick", () => {
    renderSpotlight();

    act(() => {
      vi.advanceTimersByTime(DECAY_INTERVAL_MS);
    });

    expect(currentRadius()).toBe(DEFAULT_RADIUS - DECAY_STEP);
  });

  test("keeps a devtools-widened radius as the new decay baseline", () => {
    renderSpotlight();

    act(() => {
      rootStyle().setProperty(RADIUS_VAR, "1500px");
    });
    act(() => {
      vi.advanceTimersByTime(DECAY_INTERVAL_MS);
    });

    expect(currentRadius()).toBe(1500 - DECAY_STEP);
  });

  test("throttles the pointer-activity boost", () => {
    renderSpotlight({ enableDecay: false });

    movePointer(10, 10);
    const afterFirstMove = currentRadius();
    expect(afterFirstMove).toBeGreaterThan(DEFAULT_RADIUS);

    movePointer(11, 11);
    expect(currentRadius()).toBe(afterFirstMove);

    act(() => {
      vi.advanceTimersByTime(ACTIVITY_THROTTLE_MS);
    });
    movePointer(12, 12);
    expect(currentRadius()).toBeGreaterThan(afterFirstMove);
  });

  test("does not decay when decay is disabled", () => {
    renderSpotlight({ enableDecay: false });

    act(() => {
      vi.advanceTimersByTime(DECAY_INTERVAL_MS * 4);
    });

    expect(currentRadius()).toBe(DEFAULT_RADIUS);
  });

  test("useSpotlight rejects use outside a provider", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(
      "useSpotlight must be used within a SpotlightProvider",
    );

    errorSpy.mockRestore();
  });
});
