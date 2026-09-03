import { describe, expect, test } from "vitest";
import type { Movie } from "../data/movies";
import { findMovieById, searchMovies } from "./searchMovies";

const movie = (over: Partial<Movie> & Pick<Movie, "id" | "title">): Movie => ({
  year: 1999,
  rating: 8,
  runtimeMinutes: 120,
  votes: 1000,
  genres: ["Drama"],
  ...over,
});

const catalogue: Movie[] = [
  movie({ id: "tt1", title: "The Dark Knight", year: 2008, genres: ["Crime", "Thriller"] }),
  movie({ id: "tt2", title: "The Godfather", year: 1972, genres: ["Crime", "Drama"] }),
  movie({ id: "tt3", title: "Amélie", year: 2001, genres: ["Comedy", "Romance"] }),
  movie({ id: "tt4", title: "Interstellar", year: 2014, genres: ["Sci-Fi"] }),
];

describe("searchMovies", () => {
  test("matches on title, case-insensitively", () => {
    expect(searchMovies(catalogue, "dark knight").map((m) => m.id)).toEqual(["tt1"]);
    expect(searchMovies(catalogue, "DARK KNIGHT").map((m) => m.id)).toEqual(["tt1"]);
  });

  test("matches on partial words", () => {
    expect(searchMovies(catalogue, "inter").map((m) => m.id)).toEqual(["tt4"]);
  });

  test("matches on year", () => {
    expect(searchMovies(catalogue, "1972").map((m) => m.id)).toEqual(["tt2"]);
  });

  test("matches on genre", () => {
    expect(searchMovies(catalogue, "crime").map((m) => m.id)).toEqual(["tt1", "tt2"]);
  });

  test("requires every term to match, in any order", () => {
    expect(searchMovies(catalogue, "crime 1972").map((m) => m.id)).toEqual(["tt2"]);
    expect(searchMovies(catalogue, "1972 crime").map((m) => m.id)).toEqual(["tt2"]);
    expect(searchMovies(catalogue, "crime 2014")).toEqual([]);
  });

  test("ignores accents so plain typing still finds the title", () => {
    expect(searchMovies(catalogue, "amelie").map((m) => m.id)).toEqual(["tt3"]);
  });

  test("returns nothing for an empty or whitespace query", () => {
    expect(searchMovies(catalogue, "")).toEqual([]);
    expect(searchMovies(catalogue, "   ")).toEqual([]);
  });

  test("returns nothing when there is genuinely no match", () => {
    expect(searchMovies(catalogue, "zzzzz")).toEqual([]);
  });

  test("preserves catalogue order in results", () => {
    expect(searchMovies(catalogue, "the").map((m) => m.id)).toEqual(["tt1", "tt2"]);
  });
});

describe("findMovieById", () => {
  test("finds a title by IMDb id", () => {
    expect(findMovieById(catalogue, "tt3")?.title).toBe("Amélie");
  });

  test("returns undefined for an unknown id", () => {
    expect(findMovieById(catalogue, "tt999")).toBeUndefined();
  });
});
