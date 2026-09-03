import { Link, useParams } from "react-router";
import { MirroredText } from "../antiux";
import Poster from "../components/Poster";
import WatchlistButton from "../components/WatchlistButton";
import { movies } from "../data/movies";
import { findMovieById } from "../search/searchMovies";

const TitlePage = () => {
  const { id = "" } = useParams();
  const movie = findMovieById(movies, id);

  if (!movie) {
    return (
      <>
        <h2 className="section-heading">Title not found</h2>
        <p className="page-note">
          No title with id "{id}" in the catalogue.{" "}
          <Link to="/">Back to the home page</Link>, which does what it says.
        </p>
      </>
    );
  }

  return (
    <article className="title-detail">
      <Poster title={movie.title} />
      <div className="title-detail__body">
        <h1>
          <MirroredText>{movie.title}</MirroredText>
        </h1>
        <p className="hero-meta">
          {[
            movie.year,
            `${movie.runtimeMinutes}m`,
            movie.genres.join(", "),
            `${movie.votes.toLocaleString()} votes`,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <p className="title-detail__rating">
          <span className="star" aria-hidden="true">
            ★
          </span>{" "}
          <strong>{movie.rating.toFixed(1)}</strong>
          <span className="movie-card__meta"> / 10</span>
        </p>
        {movie.blurb && <p className="hero-blurb">{movie.blurb}</p>}
        <div className="hero-actions">
          <WatchlistButton movieId={movie.id} />
        </div>
      </div>
    </article>
  );
};

export default TitlePage;
