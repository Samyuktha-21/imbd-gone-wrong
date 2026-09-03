import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import ShrinkingButton from "./ShrinkingButton";

/** Pins the button at a known rect so pointer distance is deterministic. */
const pinButtonRect = () => {
  const button = screen.getByTestId("shrinking-button");
  button.getBoundingClientRect = () =>
    ({
      bottom: 60,
      height: 40,
      left: 80,
      right: 180,
      top: 20,
      width: 100,
      x: 80,
      y: 20,
      toJSON: () => ({}),
    }) as DOMRect;
  return button;
};

/**
 * jsdom doesn't implement PointerEvent, but the hook only reads
 * clientX/clientY, which MouseEvent supplies.
 */
const movePointer = (clientX: number, clientY: number) => {
  fireEvent(window, new MouseEvent("pointermove", { clientX, clientY }));
};

describe("ShrinkingButton", () => {
  test("starts at full scale", () => {
    render(
      <ShrinkingButton radiusPx={100} minScale={0.4}>
        Buy now
      </ShrinkingButton>,
    );

    expect(screen.getByTestId("shrinking-button")).toHaveAttribute(
      "data-scale",
      "1",
    );
  });

  test("shrinks to minScale when the pointer lands on its center", () => {
    render(
      <ShrinkingButton radiusPx={100} minScale={0.4}>
        Buy now
      </ShrinkingButton>,
    );
    const button = pinButtonRect();

    // Rect center is (130, 40).
    movePointer(130, 40);

    expect(Number(button.getAttribute("data-scale"))).toBeCloseTo(0.4, 5);
    expect(button).toHaveStyle({ fontSize: "0.4em" });
  });

  test("recovers to full scale once the pointer moves away", () => {
    render(
      <ShrinkingButton radiusPx={100} minScale={0.4}>
        Buy now
      </ShrinkingButton>,
    );
    const button = pinButtonRect();

    movePointer(130, 40);
    movePointer(5000, 5000);

    expect(Number(button.getAttribute("data-scale"))).toBe(1);
  });
});
