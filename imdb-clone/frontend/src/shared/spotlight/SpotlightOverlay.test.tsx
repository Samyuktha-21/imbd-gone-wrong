import { render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import SpotlightOverlay from "./SpotlightOverlay";

describe("SpotlightOverlay", () => {
  test("renders a pointer-transparent overlay masking everything outside the spotlight vars", () => {
    render(<SpotlightOverlay />);

    const overlay = screen.getByTestId("spotlight-overlay");
    expect(overlay.style.pointerEvents).toBe("none");
    expect(overlay.style.position).toBe("fixed");
    expect(overlay.style.backgroundImage).toContain("var(--spotlight-radius)");
    expect(overlay.style.backgroundImage).toContain("var(--spotlight-x)");
    expect(overlay.style.backgroundImage).toContain("var(--spotlight-y)");
  });
});
