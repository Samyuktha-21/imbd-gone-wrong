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
   * TMDB image paths, e.g. "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg". Present only
   * after the enrichment pass has run; components fall back to a generated
   * gradient without them.
   */
  posterPath?: string;
  backdropPath?: string;
  /** TMDB synopsis, added by the enrichment pass. */
  overview?: string;
  /**
   * Hand-written description from blurbs.ts, for titles that have one.
   * Preferred over `overview` because it is curated.
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
 *   python scripts/movie-seed/enrich_movie_seed.py     # posters + synopses
 */
export const movies: Movie[] = (generated as GeneratedMovie[]).map((movie) => {
  const blurb = blurbs[movie.id];
  return blurb ? { ...movie, blurb } : movie;
});

/** Most-voted title in the catalogue. */
export const featuredMovie = movies[0];

/** Curated description first, TMDB's synopsis as the fallback. */
export const descriptionOf = (movie: Movie): string | undefined =>
  movie.blurb ?? movie.overview;
