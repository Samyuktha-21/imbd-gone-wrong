import type { Movie } from "../data/movies";
import Poster from "./Poster";

type FeaturedHeroProps = {
  movie: Movie;
};

const FeaturedHero = ({ movie }: FeaturedHeroProps) => (
  <section className="hero" aria-labelledby="featured-title">
    <Poster title={movie.title} />
    <div className="hero-body">
      <h1 id="featured-title">{movie.title}</h1>
      <p className="hero-meta">
        {movie.year} · {movie.certificate} · {movie.runtimeMinutes}m ·{" "}
        {movie.genres.join(", ")}
      </p>
      <p className="hero-blurb">{movie.blurb}</p>
      <div className="hero-actions">
        <button type="button" className="button button--primary">
          ▶ Play Trailer
        </button>
        <button type="button" className="button button--secondary">
          + Watchlist
        </button>
      </div>
    </div>
  </section>
);

export default FeaturedHero;
