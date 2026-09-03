import type { Movie } from "../data/movies";
import Poster from "./Poster";

type MovieCardProps = {
  movie: Movie;
};

const MovieCard = ({ movie }: MovieCardProps) => (
  <li className="movie-card">
    <Poster title={movie.title} />
    <div className="movie-card__body">
      <span className="movie-card__rating">
        <span className="star" aria-hidden="true">
          ★
        </span>
        <strong>{movie.rating.toFixed(1)}</strong>
      </span>
      <h3 className="movie-card__title">{movie.title}</h3>
      <span className="movie-card__meta">
        {movie.year} · {movie.runtimeMinutes}m · {movie.certificate}
      </span>
      <button type="button" className="movie-card__watchlist">
        + Watchlist
      </button>
    </div>
  </li>
);

export default MovieCard;
