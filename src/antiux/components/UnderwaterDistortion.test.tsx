import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import UnderwaterDistortion from "./UnderwaterDistortion";

describe("UnderwaterDistortion", () => {
  test("applies a wave filter by default and clears it on hover", () => {
    render(
      <UnderwaterDistortion>
        <img alt="poster" src="poster.jpg" />
      </UnderwaterDistortion>,
    );

    const wrapper = screen.getByTestId("underwater-distortion");
    expect(wrapper).toHaveAttribute("data-surfaced", "false");
    expect(wrapper.style.filter).toMatch(/^url\(#antiux-wave-/);

    fireEvent.mouseEnter(wrapper);
    expect(wrapper).toHaveAttribute("data-surfaced", "true");
    expect(wrapper.style.filter).toBe("none");

    fireEvent.mouseLeave(wrapper);
    expect(wrapper).toHaveAttribute("data-surfaced", "false");
  });

  test("renders the wrapped content", () => {
    render(
      <UnderwaterDistortion>
        <img alt="poster" src="poster.jpg" />
      </UnderwaterDistortion>,
    );

    expect(screen.getByAltText("poster")).toBeInTheDocument();
  });
});
