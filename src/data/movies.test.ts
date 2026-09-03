import { describe, expect, test } from "vitest";
import { blurbs } from "./blurbs";
import { featuredMovie, movies } from "./movies";

describe("movie catalogue", () => {
  test("is populated from the generated seed", () => {
    expect(movies.length).toBeGreaterThan(100);
  });

  test("every entry carries the fields the UI renders", () => {
    for (const movie of movies) {
      expect(movie.id).toMatch(/^tt\d+$/);
      expect(movie.title).toBeTruthy();
      expect(Number.isInteger(movie.year)).toBe(true);
      expect(movie.rating).toBeGreaterThan(0);
      expect(movie.runtimeMinutes).toBeGreaterThan(0);
      expect(movie.votes).toBeGreaterThan(0);
      expect(Array.isArray(movie.genres)).toBe(true);
    }
  });

  test("is ranked by vote count, most-voted first", () => {
    const votes = movies.map((movie) => movie.votes);
    expect([...votes].sort((a, b) => b - a)).toEqual(votes);
  });

  test("has no duplicate titles ids", () => {
    expect(new Set(movies.map((movie) => movie.id)).size).toBe(movies.length);
  });

  test("featured movie is the most-voted title", () => {
    expect(featuredMovie).toBe(movies[0]);
  });

  test("merges hand-written blurbs onto matching ids", () => {
    const withBlurb = movies.filter((movie) => movie.blurb);

    expect(withBlurb.length).toBeGreaterThan(0);
    for (const movie of withBlurb) {
      expect(movie.blurb).toBe(blurbs[movie.id]);
    }
  });

  test("leaves titles without a curated blurb undefined rather than blank", () => {
    const withoutBlurb = movies.filter((movie) => !(movie.id in blurbs));

    expect(withoutBlurb.length).toBeGreaterThan(0);
    for (const movie of withoutBlurb) {
      expect(movie.blurb).toBeUndefined();
    }
  });
});
