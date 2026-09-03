import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { movies } from "../data/movies";
import Poster from "./Poster";

describe("Poster", () => {
  test("renders a TMDB image at the requested size", () => {
    render(
      <Poster title="The Shawshank Redemption" posterPath="/abc123.jpg" size="w342" />,
    );

    const image = screen.getByRole("img", {
      name: "The Shawshank Redemption poster",
    });
    expect(image).toHaveAttribute(
      "src",
      "https://image.tmdb.org/t/p/w342/abc123.jpg",
    );
  });

  test("falls back to the title card when there is no poster path", () => {
    render(<Poster title="Monsters, Inc." />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Monsters, Inc.")).toBeInTheDocument();
  });

  test("degrades to the title card if the image fails to load", () => {
    render(<Poster title="Broken" posterPath="/gone.jpg" />);

    fireEvent.error(screen.getByRole("img", { name: "Broken poster" }));

    // A dead TMDB path must not leave a broken-image icon behind.
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText("Broken")).toBeInTheDocument();
  });

  test("posters are submerged — real images carry the water treatment", () => {
    const { container } = render(<Poster title="Any" posterPath="/x.jpg" />);

    const poster = container.querySelector(".poster");
    // The class is what pulls in the displacement filter and the caustics.
    expect(poster).toHaveClass("antiux-underwater");
    expect(poster?.querySelector("img")).not.toBeNull();
  });

  test("lazy-loads so a grid of posters does not fetch everything at once", () => {
    render(<Poster title="Any" posterPath="/x.jpg" />);

    expect(screen.getByRole("img", { name: "Any poster" })).toHaveAttribute(
      "loading",
      "lazy",
    );
  });
});

describe("catalogue poster coverage", () => {
  test("most of the catalogue has a real poster path", () => {
    const withPoster = movies.filter((movie) => movie.posterPath);
    expect(withPoster.length).toBeGreaterThan(movies.length * 0.9);
  });

  test("poster paths are TMDB-shaped, so the built URL resolves", () => {
    for (const movie of movies) {
      if (movie.posterPath) {
        expect(movie.posterPath).toMatch(/^\/[\w-]+\.(jpg|png|webp)$/i);
      }
    }
  });

  test("titles without a poster still carry everything the card renders", () => {
    for (const movie of movies.filter((candidate) => !candidate.posterPath)) {
      expect(movie.title).toBeTruthy();
      expect(movie.year).toBeGreaterThan(1800);
    }
  });
});
