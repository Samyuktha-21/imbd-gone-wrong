import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import ColorShiftButton from "./ColorShiftButton";

describe("ColorShiftButton", () => {
  test("has no shift color before the first click", () => {
    render(<ColorShiftButton>Click me</ColorShiftButton>);

    expect(screen.getByRole("button", { name: "Click me" })).not.toHaveAttribute(
      "data-shift-color",
    );
  });

  test("shifts background color and notifies onShift on click", () => {
    const onShift = vi.fn();
    render(<ColorShiftButton onShift={onShift}>Click me</ColorShiftButton>);
    const button = screen.getByRole("button", { name: "Click me" });

    fireEvent.click(button);

    expect(onShift).toHaveBeenCalledTimes(1);
    const color = button.getAttribute("data-shift-color");
    expect(color).toBeTruthy();
    expect(button).toHaveStyle({ backgroundColor: color as string });
  });

  test("picks a different color on consecutive clicks", () => {
    render(<ColorShiftButton>Click me</ColorShiftButton>);
    const button = screen.getByRole("button", { name: "Click me" });

    fireEvent.click(button);
    const firstColor = button.getAttribute("data-shift-color");

    fireEvent.click(button);
    const secondColor = button.getAttribute("data-shift-color");

    expect(secondColor).not.toEqual(firstColor);
  });
});
