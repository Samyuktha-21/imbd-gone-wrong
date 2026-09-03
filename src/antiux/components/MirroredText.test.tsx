import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import MirroredText from "./MirroredText";

describe("MirroredText", () => {
  test("renders flipped by default", () => {
    render(<MirroredText>Hello world</MirroredText>);
    const element = screen.getByTestId("mirrored-text");

    expect(element).toHaveAttribute("data-mirrored", "true");
    expect(element).toHaveStyle({ transform: "scaleX(-1)" });
    expect(element).toHaveTextContent("Hello world");
  });

  test("un-mirrors on hover and re-mirrors on mouse leave", () => {
    render(<MirroredText>Hello world</MirroredText>);
    const element = screen.getByTestId("mirrored-text");

    fireEvent.mouseEnter(element);
    expect(element).toHaveAttribute("data-mirrored", "false");
    expect(element).toHaveStyle({ transform: "none" });

    fireEvent.mouseLeave(element);
    expect(element).toHaveAttribute("data-mirrored", "true");
  });

  test("un-mirrors on focus and re-mirrors on blur", () => {
    render(<MirroredText>Hello world</MirroredText>);
    const element = screen.getByTestId("mirrored-text");

    fireEvent.focus(element);
    expect(element).toHaveAttribute("data-mirrored", "false");

    fireEvent.blur(element);
    expect(element).toHaveAttribute("data-mirrored", "true");
  });
});
