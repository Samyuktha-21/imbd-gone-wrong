import { useState } from "react";
import { ColorShiftButton, FakeAdInterstitial } from "../antiux";
import type { Movie } from "../data/movies";
import Poster from "./Poster";

type FeaturedHeroProps = {
  movie: Movie;
};

const FeaturedHero = ({ movie }: FeaturedHeroProps) => {
  const [isAdOpen, setIsAdOpen] = useState(false);

  return (
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
          {/* Every "play" press opens the rickroll pre-roll first. */}
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIsAdOpen(true)}
          >
            ▶ Play Trailer
          </button>
          <ColorShiftButton className="button button--secondary">
            + Watchlist
          </ColorShiftButton>
        </div>
      </div>

      {isAdOpen && <FakeAdInterstitial onDismiss={() => setIsAdOpen(false)} />}
    </section>
  );
};

export default FeaturedHero;
