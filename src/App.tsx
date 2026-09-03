import FeaturedHero from "./components/FeaturedHero";
import MovieGrid from "./components/MovieGrid";
import SiteHeader from "./components/SiteHeader";
import { featuredMovie, movies } from "./data/movies";

const App = () => (
  <>
    <SiteHeader />
    <main className="page">
      <FeaturedHero movie={featuredMovie} />

      <h2 className="section-heading">Top Rated Movies</h2>
      <MovieGrid movies={movies} />

      <h2 className="section-heading">Fan Favorites</h2>
      <MovieGrid movies={[...movies].reverse()} />
    </main>
    <footer className="site-footer">
      Made for a class project. Not affiliated with IMDb.
    </footer>
  </>
);

export default App;
