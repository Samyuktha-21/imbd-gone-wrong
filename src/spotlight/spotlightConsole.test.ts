import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { DEFAULT_RADIUS, MAX_RADIUS, MIN_RADIUS, RADIUS_VAR } from "./spotlightConfig";
import { registerSpotlightConsole } from "./spotlightConsole";
import { writeRadius } from "./spotlightVars";

const rootStyle = () => document.documentElement.style;
const currentRadius = () =>
  Number.parseFloat(rootStyle().getPropertyValue(RADIUS_VAR));

describe("spotlightConsole", () => {
  let unregister: () => void;

  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    rootStyle().removeProperty(RADIUS_VAR);
    unregister = registerSpotlightConsole();
  });

  afterEach(() => {
    unregister();
    vi.restoreAllMocks();
  });

  test("exposes window.spotlight", () => {
    expect(window.spotlight).toBeDefined();
  });

  test("reads the live radius", () => {
    writeRadius(300);
    expect(window.spotlight?.radius).toBe(300);
  });

  test("assigning radius widens the fog", () => {
    window.spotlight!.radius = 700;

    expect(currentRadius()).toBe(700);
    expect(window.spotlight?.radius).toBe(700);
  });

  test("clamps values typed into the console", () => {
    window.spotlight!.radius = MAX_RADIUS + 10_000;
    expect(currentRadius()).toBe(MAX_RADIUS);

    window.spotlight!.radius = -50;
    expect(currentRadius()).toBe(MIN_RADIUS);
  });

  test("reset() restores the default", () => {
    window.spotlight!.radius = 900;
    expect(window.spotlight?.reset()).toBe(DEFAULT_RADIUS);
    expect(currentRadius()).toBe(DEFAULT_RADIUS);
  });

  test("logs a discoverable hint for anyone who opens devtools", () => {
    expect(console.info).toHaveBeenCalled();
    const message = vi.mocked(console.info).mock.calls[0]?.[0] as string;
    expect(message).toContain("spotlight.radius");
  });

  test("cleans up after itself", () => {
    unregister();
    expect(window.spotlight).toBeUndefined();
    unregister = () => {};
  });
});
