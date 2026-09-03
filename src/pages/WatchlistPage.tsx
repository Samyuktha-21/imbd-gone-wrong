import { Link } from "react-router";
import MovieGrid from "../components/MovieGrid";
import { movies } from "../data/movies";
import { useWatchlist } from "../watchlist";

const WatchlistPage = () => {
  const { ids, count } = useWatchlist();

  // Preserve watchlist order (newest first) rather than catalogue order.
  const saved = ids
    .map((id) => movies.find((movie) => movie.id === id))
    .filter((movie): movie is NonNullable<typeof movie> => Boolean(movie));

  return (
    <>
      <h2 className="section-heading">Your Watchlist</h2>

      {count === 0 ? (
        <p className="page-note">
          Nothing saved yet. Add something from the{" "}
          <Link to="/">home page</Link> — the button shrinks as you approach it,
          but it does work.
        </p>
      ) : (
        <>
          <p className="page-note">
            {count} {count === 1 ? "title" : "titles"} · saved in this browser
          </p>
          <MovieGrid movies={saved} />
        </>
      )}
    </>
  );
};

export default WatchlistPage;
