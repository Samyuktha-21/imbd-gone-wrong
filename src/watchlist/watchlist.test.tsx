import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, test } from "vitest";
import { useWatchlist } from "./WatchlistContext";
import WatchlistProvider from "./WatchlistProvider";
import { STORAGE_KEY, readWatchlist, writeWatchlist } from "./watchlistStorage";

const Probe = () => {
  const { ids, count, has, add, remove, toggle } = useWatchlist();
  return (
    <div>
      <span data-testid="ids">{ids.join(",")}</span>
      <span data-testid="count">{count}</span>
      <span data-testid="has-tt1">{String(has("tt1"))}</span>
      <button type="button" onClick={() => add("tt1")}>
        add
      </button>
      <button type="button" onClick={() => remove("tt1")}>
        remove
      </button>
      <button type="button" onClick={() => toggle("tt1")}>
        toggle
      </button>
    </div>
  );
};

const ids = () => screen.getByTestId("ids").textContent;

describe("watchlistStorage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  test("returns an empty list when nothing is stored", () => {
    expect(readWatchlist()).toEqual([]);
  });

  test("round-trips ids", () => {
    writeWatchlist(["tt1", "tt2"]);
    expect(readWatchlist()).toEqual(["tt1", "tt2"]);
  });

  test("survives a corrupt entry instead of throwing", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not json");
    expect(readWatchlist()).toEqual([]);
  });

  test("survives a non-array entry", () => {
    window.localStorage.setItem(STORAGE_KEY, '{"nope":true}');
    expect(readWatchlist()).toEqual([]);
  });

  test("drops non-string members rather than the whole list", () => {
    window.localStorage.setItem(STORAGE_KEY, '["tt1",5,null,"tt2"]');
    expect(readWatchlist()).toEqual(["tt1", "tt2"]);
  });
});

describe("WatchlistProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  const setup = () => {
    render(
      <WatchlistProvider>
        <Probe />
      </WatchlistProvider>,
    );
    return userEvent.setup();
  };

  test("starts empty", () => {
    setup();
    expect(ids()).toBe("");
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  test("adds a title and reports membership", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "add" }));

    expect(ids()).toBe("tt1");
    expect(screen.getByTestId("has-tt1").textContent).toBe("true");
  });

  test("adding the same title twice does not duplicate it", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "add" }));
    await user.click(screen.getByRole("button", { name: "add" }));

    expect(screen.getByTestId("count").textContent).toBe("1");
  });

  test("removes a title", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "add" }));
    await user.click(screen.getByRole("button", { name: "remove" }));

    expect(ids()).toBe("");
    expect(screen.getByTestId("has-tt1").textContent).toBe("false");
  });

  test("toggle adds then removes", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(ids()).toBe("tt1");

    await user.click(screen.getByRole("button", { name: "toggle" }));
    expect(ids()).toBe("");
  });

  test("persists additions to localStorage", async () => {
    const user = setup();
    await user.click(screen.getByRole("button", { name: "add" }));

    expect(readWatchlist()).toEqual(["tt1"]);
  });

  test("restores a previously saved watchlist on mount", () => {
    writeWatchlist(["tt7", "tt8"]);

    render(
      <WatchlistProvider>
        <Probe />
      </WatchlistProvider>,
    );

    expect(ids()).toBe("tt7,tt8");
  });

  test("useWatchlist rejects use outside a provider", () => {
    expect(() => render(<Probe />)).toThrow(
      "useWatchlist must be used within a WatchlistProvider",
    );
  });
});
