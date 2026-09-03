import { useEffect, useState } from "react";
import { ColorShiftButton, FakeAdInterstitial } from "../antiux";
import { descriptionOf, type Movie } from "../data/movies";
import { useSpotlight } from "../spotlight";
import Poster from "./Poster";

type FeaturedHeroProps = {
  movie: Movie;
};

/** Chance that a non-play action ambushes you with the pre-roll instead. */
const SURPRISE_AD_CHANCE = 0.35;

const FeaturedHero = ({ movie }: FeaturedHeroProps) => {
  const [isAdOpen, setIsAdOpen] = useState(false);
  const { setSuppressed } = useSpotlight();

  /*
   * Lift the fog for the duration of the ad — the one moment the site is
   * fully visible — and drop it again the instant the video ends or is
   * skipped. Cleanup covers unmount so the page can't be left lit.
   */
  useEffect(() => {
    setSuppressed(isAdOpen);
    return () => setSuppressed(false);
  }, [isAdOpen, setSuppressed]);

  return (
    <section className="hero" aria-labelledby="featured-title">
      <Poster
        title={movie.title}
        posterPath={movie.posterPath}
        size="w342"
      />
      <div className="hero-body">
        <h1 id="featured-title">{movie.title}</h1>
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
        {/* Curated blurb if there is one, else TMDB's synopsis. */}
        {descriptionOf(movie) && (
          <p className="hero-blurb">{descriptionOf(movie)}</p>
        )}
        <div className="hero-actions">
          {/* Every "play" press opens the pre-roll first. */}
          <button
            type="button"
            className="button button--primary"
            onClick={() => setIsAdOpen(true)}
          >
            ▶ Play Trailer
          </button>
          {/* ...and sometimes an unrelated action does too. */}
          <ColorShiftButton
            className="button button--secondary"
            onShift={() => {
              if (Math.random() < SURPRISE_AD_CHANCE) {
                setIsAdOpen(true);
              }
            }}
          >
            + Watchlist
          </ColorShiftButton>
        </div>
      </div>

      {isAdOpen && <FakeAdInterstitial onDismiss={() => setIsAdOpen(false)} />}
    </section>
  );
};

export default FeaturedHero;
