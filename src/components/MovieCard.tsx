import { Link } from "react-router";
import { MirroredText } from "../antiux";
import type { Movie } from "../data/movies";
import Poster from "./Poster";
import WatchlistButton from "./WatchlistButton";

type MovieCardProps = {
  movie: Movie;
};

const MovieCard = ({ movie }: MovieCardProps) => (
  <li className="movie-card">
    <Link to={`/title/${movie.id}`} className="movie-card__link">
      <Poster title={movie.title} posterPath={movie.posterPath} size="w185" />
    </Link>
    <div className="movie-card__body">
      <span className="movie-card__rating">
        <span className="star" aria-hidden="true">
          ★
        </span>
        <strong>{movie.rating.toFixed(1)}</strong>
      </span>
      <h3 className="movie-card__title">
        <Link to={`/title/${movie.id}`} className="movie-card__link">
          <MirroredText>{movie.title}</MirroredText>
        </Link>
      </h3>
      <span className="movie-card__meta">
        {[movie.year, `${movie.runtimeMinutes}m`, movie.genres[0]]
          .filter(Boolean)
          .join(" · ")}
      </span>
      {/*
        WatchlistButton ties its own shrink radius to the spotlight, so the
        label only starts shrinking once the button is inside the lit circle —
        the two gags compound instead of firing in the dark.
      */}
      <WatchlistButton movieId={movie.id} className="movie-card__watchlist" />
    </div>
  </li>
);

export default MovieCard;
