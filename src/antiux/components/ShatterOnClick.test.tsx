import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import ShatterOnClick from "./ShatterOnClick";

/**
 * jsdom has no PointerEvent constructor, but the handlers only read
 * clientX/clientY and pointerId, which MouseEvent supplies.
 */
const pointer = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, { bubbles: true, clientX, clientY });

const shatterIt = () => {
  fireEvent(screen.getByTestId("shatter-intact"), pointer("pointerdown", 0, 0));
};

/** Drags a shard by an exact delta and releases it. */
const dragPiece = (id: number, byX: number, byY: number) => {
  fireEvent(screen.getByTestId(`shatter-piece-${id}`), pointer("pointerdown", 0, 0));
  fireEvent(window, pointer("pointermove", byX, byY));
  fireEvent(window, pointer("pointerup", byX, byY));
};

describe("ShatterOnClick", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Deterministic scatter: every shard lands the same distance from home.
    vi.spyOn(Math, "random").mockReturnValue(1);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("renders its child intact until touched", () => {
    render(
      <ShatterOnClick>
        <input aria-label="Search" />
      </ShatterOnClick>,
    );

    expect(screen.getByTestId("shatter-field")).toHaveAttribute(
      "data-shattered",
      "false",
    );
    expect(screen.getByLabelText("Search")).toBeInTheDocument();
    expect(screen.queryByTestId("shatter-piece-0")).not.toBeInTheDocument();
  });

  test("shatters into the requested number of pieces on pointer down", () => {
    render(
      <ShatterOnClick pieces={4}>
        <input aria-label="Search" />
      </ShatterOnClick>,
    );

    shatterIt();

    expect(screen.getByTestId("shatter-field")).toHaveAttribute(
      "data-shattered",
      "true",
    );
    expect(screen.getAllByRole("button", { name: /piece \d of 4/i })).toHaveLength(4);
  });

  test("snaps a piece home when dropped within tolerance", () => {
    render(
      <ShatterOnClick pieces={2} scatterRangePx={100} snapTolerancePx={30}>
        <input aria-label="Search" />
      </ShatterOnClick>,
    );
    shatterIt();

    // random()=1 puts every shard at dx=+100, dy=+55. Drag it back to origin.
    dragPiece(0, -100, -55);

    expect(screen.getByTestId("shatter-piece-0")).toHaveAttribute(
      "data-placed",
      "true",
    );
  });

  test("leaves a piece loose when dropped outside tolerance", () => {
    render(
      <ShatterOnClick pieces={2} scatterRangePx={100} snapTolerancePx={10}>
        <input aria-label="Search" />
      </ShatterOnClick>,
    );
    shatterIt();

    dragPiece(0, -40, 0);

    expect(screen.getByTestId("shatter-piece-0")).toHaveAttribute(
      "data-placed",
      "false",
    );
  });

  test("reassembles once every piece is home", () => {
    render(
      <ShatterOnClick pieces={2} scatterRangePx={100} snapTolerancePx={30}>
        <input aria-label="Search" />
      </ShatterOnClick>,
    );
    shatterIt();

    dragPiece(0, -100, -55);
    dragPiece(1, -100, -55);

    expect(screen.getByTestId("shatter-field")).toHaveAttribute(
      "data-shattered",
      "false",
    );
    expect(screen.queryByTestId("shatter-piece-0")).not.toBeInTheDocument();
  });

  test("re-scatters unplaced pieces when the timer runs out", () => {
    render(
      <ShatterOnClick pieces={2} scatterRangePx={100} snapTolerancePx={30} timeLimitMs={3000}>
        <input aria-label="Search" />
      </ShatterOnClick>,
    );
    shatterIt();

    dragPiece(0, -100, -55);
    expect(screen.getByTestId("shatter-piece-0")).toHaveAttribute(
      "data-placed",
      "true",
    );

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Everything scatters again, including the piece already placed.
    expect(screen.getByTestId("shatter-piece-0")).toHaveAttribute(
      "data-placed",
      "false",
    );
  });

  test("stops re-scattering once the budget is spent, so it stays finishable", () => {
    render(
      <ShatterOnClick
        pieces={2}
        maxReshatters={1}
        scatterRangePx={100}
        snapTolerancePx={30}
        timeLimitMs={3000}
      >
        <input aria-label="Search" />
      </ShatterOnClick>,
    );
    shatterIt();

    act(() => {
      vi.advanceTimersByTime(3000); // burns the only re-shatter
    });
    dragPiece(0, -100, -55);

    act(() => {
      vi.advanceTimersByTime(9000); // budget spent: nothing disturbs it now
    });

    expect(screen.getByTestId("shatter-piece-0")).toHaveAttribute(
      "data-placed",
      "true",
    );
  });
});
