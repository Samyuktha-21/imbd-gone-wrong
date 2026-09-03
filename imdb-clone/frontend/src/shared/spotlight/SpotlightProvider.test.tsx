import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { useSpotlight } from "./SpotlightContext";
import SpotlightProvider, {
  ACTIVITY_THROTTLE_MS,
  DECAY_INTERVAL_MS,
  DECAY_STEP,
  DEFAULT_RADIUS,
} from "./SpotlightProvider";

const readRootRadius = () =>
  parseFloat(
    document.documentElement.style.getPropertyValue("--spotlight-radius"),
  );

const Probe = () => {
  const { radius, x, y } = useSpotlight();
  return (
    <div>
      <span data-testid="radius">{radius}</span>
      <span data-testid="x">{x}</span>
      <span data-testid="y">{y}</span>
    </div>
  );
};

const movePointer = (clientX: number, clientY: number) => {
  window.dispatchEvent(new MouseEvent("pointermove", { clientX, clientY }));
};

describe("SpotlightProvider", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  test("initializes --spotlight-radius on the document root", () => {
    render(
      <SpotlightProvider>
        <Probe />
      </SpotlightProvider>,
    );

    expect(readRootRadius()).toBe(DEFAULT_RADIUS);
  });

  test("pointer movement updates position and boosts radius (throttled)", () => {
    render(
      <SpotlightProvider>
        <Probe />
      </SpotlightProvider>,
    );

    act(() => {
      movePointer(120, 340);
    });

    expect(screen.getByTestId("x").textContent).toBe("120");
    expect(screen.getByTestId("y").textContent).toBe("340");
    expect(readRootRadius()).toBeGreaterThan(DEFAULT_RADIUS);

    const boostedRadius = readRootRadius();

    act(() => {
      movePointer(121, 341);
    });
    expect(readRootRadius()).toBe(boostedRadius);

    act(() => {
      vi.advanceTimersByTime(ACTIVITY_THROTTLE_MS);
      movePointer(122, 342);
    });
    expect(readRootRadius()).toBeGreaterThan(boostedRadius);
  });

  test("decays radius over time when enabled", () => {
    render(
      <SpotlightProvider>
        <Probe />
      </SpotlightProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(DECAY_INTERVAL_MS);
    });

    expect(readRootRadius()).toBe(DEFAULT_RADIUS - DECAY_STEP);
  });

  test("respects a manual DevTools edit as the new decay baseline (mercy valve)", () => {
    render(
      <SpotlightProvider>
        <Probe />
      </SpotlightProvider>,
    );

    act(() => {
      document.documentElement.style.setProperty(
        "--spotlight-radius",
        "900px",
      );
    });

    act(() => {
      vi.advanceTimersByTime(DECAY_INTERVAL_MS);
    });

    expect(readRootRadius()).toBe(900 - DECAY_STEP);
  });

  test("does not decay when enableDecay is false", () => {
    render(
      <SpotlightProvider enableDecay={false}>
        <Probe />
      </SpotlightProvider>,
    );

    act(() => {
      vi.advanceTimersByTime(DECAY_INTERVAL_MS * 3);
    });

    expect(readRootRadius()).toBe(DEFAULT_RADIUS);
  });
});
