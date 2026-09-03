import { beforeEach, describe, expect, test } from "vitest";
import {
  DEFAULT_RADIUS,
  MAX_RADIUS,
  MIN_RADIUS,
  RADIUS_VAR,
  X_VAR,
  Y_VAR,
} from "./spotlightConfig";
import { readRadius, writePosition, writeRadius } from "./spotlightVars";

const rootStyle = () => document.documentElement.style;

describe("spotlightVars", () => {
  beforeEach(() => {
    rootStyle().removeProperty(RADIUS_VAR);
    rootStyle().removeProperty(X_VAR);
    rootStyle().removeProperty(Y_VAR);
  });

  test("falls back to the default radius before anything is written", () => {
    expect(readRadius()).toBe(DEFAULT_RADIUS);
  });

  test("clamps the radius to the configured bounds", () => {
    expect(writeRadius(MIN_RADIUS - 500)).toBe(MIN_RADIUS);
    expect(writeRadius(MAX_RADIUS + 500)).toBe(MAX_RADIUS);
  });

  test("reads back whatever is currently on the element", () => {
    writeRadius(300);
    expect(readRadius()).toBe(300);

    // Stand-in for someone editing --spotlight-radius in the inspector.
    rootStyle().setProperty(RADIUS_VAR, "1200px");
    expect(readRadius()).toBe(1200);
  });

  test("writes pointer position to the x/y custom properties", () => {
    writePosition(120, 480);

    expect(rootStyle().getPropertyValue(X_VAR)).toBe("120px");
    expect(rootStyle().getPropertyValue(Y_VAR)).toBe("480px");
  });
});
