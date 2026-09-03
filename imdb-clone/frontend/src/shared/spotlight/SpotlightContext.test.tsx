import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import { useSpotlight } from "./SpotlightContext";

describe("useSpotlight", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("throws a helpful error when used outside a SpotlightProvider", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => renderHook(() => useSpotlight())).toThrow(
      "useSpotlight must be used within a SpotlightProvider",
    );

    errorSpy.mockRestore();
  });
});
