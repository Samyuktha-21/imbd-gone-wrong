import { MathCaptchaGate, UnderwaterFilterDefs } from "./antiux";
import FeaturedHero from "./components/FeaturedHero";
import MovieGrid from "./components/MovieGrid";
import SiteHeader from "./components/SiteHeader";
import { featuredMovie, movies } from "./data/movies";

/*
 * The catalogue holds 250 titles, but each card carries an SVG displacement
 * filter and mirrored text. Rendering all of them twice means 500 filtered
 * subtrees and a visibly janky page, so each row shows a slice. The gags are
 * the point; grinding the compositor is not.
 */
const TOP_RATED = movies.slice(0, 24);
const FAN_FAVOURITES = movies.slice(24, 48);

const App = () => (
  <>
    {/* One shared <filter> powering .antiux-underwater on every poster. */}
    <UnderwaterFilterDefs />

    <SiteHeader />
    <main className="page">
      <FeaturedHero movie={featuredMovie} />

      <h2 className="section-heading">Top Rated Movies</h2>
      <MovieGrid movies={TOP_RATED} />

      <h2 className="section-heading">Fan Favorites</h2>
      {/*
        Mundane content, gated behind "human verification" that effectively
        needs an AI to pass. Tolerant answer-checking keeps it finishable.
      */}
      <MathCaptchaGate actionLabel="see what other fans liked">
        <MovieGrid movies={FAN_FAVOURITES} />
      </MathCaptchaGate>
    </main>
    <footer className="site-footer">
      Made for a class project. Not affiliated with IMDb.
    </footer>
  </>
);

export default App;
