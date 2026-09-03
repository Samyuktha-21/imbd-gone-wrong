import { fireEvent, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, test } from "vitest";
import { navPlacementFor } from "./antiux/hooks/useNavPlacement";
import { movies } from "./data/movies";
import { clearPersistedState, renderApp as renderAt } from "./test/renderApp";

afterEach(clearPersistedState);

/**
 * jsdom has no PointerEvent constructor, so fireEvent.pointerDown lands
 * without coordinates. The handlers only read clientX/clientY, which
 * MouseEvent supplies.
 */
const pointer = (type: string, clientX: number, clientY: number) =>
  new MouseEvent(type, { bubbles: true, clientX, clientY });

/** Shard offsets live in the transform, relative to the home slot. */
const offsetOf = (piece: HTMLElement) => {
  const match = piece.style.transform.match(
    /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/,
  );
  return { dx: Number(match?.[1] ?? 0), dy: Number(match?.[2] ?? 0) };
};

/**
 * Drag every shard back to its slot, the way a determined user would.
 *
 * Touching the search bar shatters it, so any test that actually uses search
 * has to solve the puzzle first — which doubles as proof the gag is winnable.
 */
const solveShatterPuzzle = (container: HTMLElement) => {
  for (let guard = 0; guard < 30; guard += 1) {
    const piece = Array.from(
      container.querySelectorAll<HTMLElement>(".antiux-shatter__piece"),
    ).find((candidate) => candidate.dataset["placed"] === "false");

    if (!piece) {
      return;
    }

    const { dx, dy } = offsetOf(piece);
    fireEvent(piece, pointer("pointerdown", 0, 0));
    fireEvent(window, pointer("pointermove", -dx, -dy));
    fireEvent(window, pointer("pointerup", -dx, -dy));
  }
  throw new Error("shatter puzzle did not converge");
};

describe("routing", () => {
  test("renders the home page at /", () => {
    renderAt("/");
    expect(
      screen.getByRole("heading", { name: "Top Rated Movies" }),
    ).toBeInTheDocument();
  });

  test("renders a title detail page at /title/:id", () => {
    renderAt(`/title/${movies[0]!.id}`);
    expect(
      screen.getByRole("heading", { level: 1, name: movies[0]!.title }),
    ).toBeInTheDocument();
  });

  test("shows a recoverable message for an unknown title id", () => {
    renderAt("/title/tt-does-not-exist");
    expect(
      screen.getByRole("heading", { name: "Title not found" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /back to the home page/i }),
    ).toBeInTheDocument();
  });

  test("shows a recoverable message for an unknown route", () => {
    renderAt("/nowhere");
    expect(
      screen.getByRole("heading", { name: "Page not found" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Go home" })).toBeInTheDocument();
  });

  test("the footer home link is always present as the reliable way out", () => {
    renderAt("/watchlist");
    const footer = document.querySelector(".site-footer") as HTMLElement;
    expect(within(footer).getByRole("link", { name: "Home" })).toBeInTheDocument();
  });
});

describe("search", () => {
  test("returns real matches for a query", () => {
    renderAt("/search?q=shawshank");
    expect(screen.getByText(/Results for "shawshank"/)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /shawshank/i, level: 3 }),
    ).toBeInTheDocument();
  });

  test("says so plainly when nothing matches", () => {
    renderAt("/search?q=zzzznotathing");
    expect(screen.getByText(/No titles matched/)).toBeInTheDocument();
  });

  test("the search bar shatters on contact, then works once reassembled", async () => {
    const { user, container } = renderAt("/");

    // First touch breaks it.
    await user.click(screen.getByLabelText("Search IMDb"));
    expect(container.querySelector('[data-shattered="true"]')).not.toBeNull();

    solveShatterPuzzle(container);
    expect(container.querySelector('[data-shattered="true"]')).toBeNull();

    // Reassembling has to buy real access, or search is unusable by
    // construction: every click to type would shatter it again.
    await user.type(screen.getByLabelText("Search IMDb"), "godfather{Enter}");
    expect(screen.getByText(/Results for "godfather"/)).toBeInTheDocument();
  });

  test("the search bar moves to a new slot after each search", async () => {
    const { user, container } = renderAt("/");
    const form = () => container.querySelector(".header-search-form")!;

    await user.click(screen.getByLabelText("Search IMDb"));
    solveShatterPuzzle(container);

    const before = form().className;
    await user.type(screen.getByLabelText("Search IMDb"), "crime{Enter}");

    expect(form().className).not.toBe(before);
  });

  test("an empty query does not navigate", async () => {
    const { user, container } = renderAt("/");

    await user.click(screen.getByLabelText("Search IMDb"));
    solveShatterPuzzle(container);

    await user.type(screen.getByLabelText("Search IMDb"), "   {Enter}");

    expect(
      screen.getByRole("heading", { name: "Top Rated Movies" }),
    ).toBeInTheDocument();
  });
});

describe("watchlist", () => {
  test("starts empty and says how to fill it", () => {
    renderAt("/watchlist");
    expect(screen.getByText(/Nothing saved yet/)).toBeInTheDocument();
  });

  test("adding a title from a card persists it to the watchlist page", async () => {
    const { user } = renderAt(`/title/${movies[0]!.id}`);

    await user.click(screen.getByRole("button", { name: /\+ Watchlist/ }));

    // Header count reflects it immediately.
    expect(
      screen.getByRole("link", { name: /Watchlist \(1\)/ }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /Watchlist \(1\)/ }));
    expect(screen.getByText(/1 title/)).toBeInTheDocument();
  });

  test("removing goes through a confirmation labelled as the opposite action", async () => {
    const { user } = renderAt(`/title/${movies[0]!.id}`);

    await user.click(screen.getByRole("button", { name: /\+ Watchlist/ }));
    await user.click(screen.getByRole("button", { name: /In Watchlist/ }));

    // The prompt says "add", but confirming removes. That is the gag.
    expect(screen.getByText("Add this to your Watchlist?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Yes" }));

    expect(screen.getByRole("button", { name: /\+ Watchlist/ })).toBeInTheDocument();
  });

  test("declining the confirmation keeps the title saved", async () => {
    const { user } = renderAt(`/title/${movies[0]!.id}`);

    await user.click(screen.getByRole("button", { name: /\+ Watchlist/ }));
    await user.click(screen.getByRole("button", { name: /In Watchlist/ }));
    await user.click(screen.getByRole("button", { name: "No" }));

    expect(screen.getByRole("button", { name: /In Watchlist/ })).toBeInTheDocument();
  });
});

describe("navPlacementFor", () => {
  test("is stable for a given route", () => {
    expect(navPlacementFor("/watchlist")).toBe(navPlacementFor("/watchlist"));
  });

  test("only ever returns a real edge", () => {
    for (const path of ["/", "/search", "/watchlist", "/title/tt0111161", "/nope"]) {
      expect(["top", "left", "bottom"]).toContain(navPlacementFor(path));
    }
  });

  test("does not put every route on the same edge", () => {
    const seen = new Set(
      ["/", "/search", "/watchlist", "/title/tt0111161", "/title/tt0068646"].map(
        navPlacementFor,
      ),
    );
    expect(seen.size).toBeGreaterThan(1);
  });

  test("the header carries the placement class for the current route", () => {
    const { container } = renderAt("/watchlist");
    const header = container.querySelector(".site-header")!;
    expect(header.className).toContain(
      `site-header--${navPlacementFor("/watchlist")}`,
    );
  });
});
