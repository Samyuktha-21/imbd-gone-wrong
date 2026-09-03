import { MirroredText, ShrinkingButton } from "../antiux";
import type { Movie } from "../data/movies";
import { useSpotlight } from "../spotlight";
import Poster from "./Poster";

type MovieCardProps = {
  movie: Movie;
};

const MovieCard = ({ movie }: MovieCardProps) => {
  const { getRadius } = useSpotlight();

  return (
    <li className="movie-card">
      <Poster title={movie.title} />
      <div className="movie-card__body">
        <span className="movie-card__rating">
          <span className="star" aria-hidden="true">
            ★
          </span>
          <strong>{movie.rating.toFixed(1)}</strong>
        </span>
        <h3 className="movie-card__title">
          <MirroredText>{movie.title}</MirroredText>
        </h3>
        <span className="movie-card__meta">
          {movie.year} · {movie.runtimeMinutes}m · {movie.certificate}
        </span>
        {/*
          The shrink radius is tied to the spotlight so the label only starts
          shrinking once the button is inside the lit circle — the two gags
          compound instead of firing in the dark where nobody can see it.
        */}
        <ShrinkingButton
          className="movie-card__watchlist"
          radiusPx={getRadius()}
        >
          + Watchlist
        </ShrinkingButton>
      </div>
    </li>
  );
};

export default MovieCard;
