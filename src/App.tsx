import { MathCaptchaGate, UnderwaterFilterDefs } from "./antiux";
import FeaturedHero from "./components/FeaturedHero";
import MovieGrid from "./components/MovieGrid";
import SiteHeader from "./components/SiteHeader";
import { featuredMovie, movies } from "./data/movies";

const App = () => (
  <>
    {/* One shared <filter> powering .antiux-underwater on every poster. */}
    <UnderwaterFilterDefs />

    <SiteHeader />
    <main className="page">
      <FeaturedHero movie={featuredMovie} />

      <h2 className="section-heading">Top Rated Movies</h2>
      <MovieGrid movies={movies} />

      <h2 className="section-heading">Fan Favorites</h2>
      {/*
        Mundane content, gated behind "human verification" that effectively
        needs an AI to pass. Tolerant answer-checking keeps it finishable.
      */}
      <MathCaptchaGate actionLabel="see what other fans liked">
        <MovieGrid movies={[...movies].reverse()} />
      </MathCaptchaGate>
    </main>
    <footer className="site-footer">
      Made for a class project. Not affiliated with IMDb.
    </footer>
  </>
);

export default App;
