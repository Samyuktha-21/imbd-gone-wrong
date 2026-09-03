import type { Movie } from "../data/movies";

/**
 * Real search over the catalogue. Matching is genuinely useful — the anti-UX
 * lives in how you reach and keep hold of the results, not in the results
 * being wrong. A search that silently lied would break the "fully functional
 * and finishable" rule in ANTI-UX-IDEAS.md.
 */
const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    // Strip accents so "amelie" finds "Amélie".
    .replace(/[̀-ͯ]/g, "")
    .trim();

export const searchMovies = (movies: Movie[], rawQuery: string): Movie[] => {
  const query = normalize(rawQuery);
  if (!query) {
    return [];
  }

  const terms = query.split(/\s+/);

  return movies.filter((movie) => {
    const haystack = normalize(
      `${movie.title} ${movie.year} ${movie.genres.join(" ")}`,
    );
    return terms.every((term) => haystack.includes(term));
  });
};

export const findMovieById = (movies: Movie[], id: string): Movie | undefined =>
  movies.find((movie) => movie.id === id);
