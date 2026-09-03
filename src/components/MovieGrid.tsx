import type { Movie } from "../data/movies";
import MovieCard from "./MovieCard";

type MovieGridProps = {
  movies: Movie[];
};

const MovieGrid = ({ movies }: MovieGridProps) => (
  <ul className="movie-grid">
    {movies.map((movie) => (
      <MovieCard key={movie.id} movie={movie} />
    ))}
  </ul>
);

export default MovieGrid;
