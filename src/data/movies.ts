import { blurbs } from "./blurbs";
import generated from "./movies.generated.json";

export type Movie = {
  /** IMDb title id, e.g. "tt0111161". */
  id: string;
  title: string;
  year: number;
  rating: number;
  runtimeMinutes: number;
  votes: number;
  genres: string[];
  /**
   * Only set for the handful of titles in blurbs.ts. Components must render
   * without it.
   */
  blurb?: string;
};

/** The shape emitted by scripts/movie-seed/build_movie_seed.py. */
type GeneratedMovie = Omit<Movie, "blurb">;

/**
 * The 250 most-voted feature films in the IMDb non-commercial dataset,
 * ranked by vote count.
 *
 * Regenerate with:
 *   python scripts/movie-seed/build_movie_seed.py --limit 250
 */
export const movies: Movie[] = (generated as GeneratedMovie[]).map((movie) => {
  const blurb = blurbs[movie.id];
  return blurb ? { ...movie, blurb } : movie;
});

/** Most-voted title in the catalogue. */
export const featuredMovie = movies[0];
