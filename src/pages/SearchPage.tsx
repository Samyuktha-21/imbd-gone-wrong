import { useSearchParams } from "react-router";
import MovieGrid from "../components/MovieGrid";
import { movies } from "../data/movies";
import { searchMovies } from "../search/searchMovies";

/** Results are real; only the route to them is hostile. */
const SearchPage = () => {
  const [params] = useSearchParams();
  const query = params.get("q") ?? "";
  const results = searchMovies(movies, query);

  return (
    <>
      <h2 className="section-heading">
        {query ? `Results for "${query}"` : "Search"}
      </h2>

      {!query && (
        <p className="page-note">
          Type something into the search bar. Assuming you can get hold of it.
        </p>
      )}

      {query && results.length === 0 && (
        <p className="page-note">
          No titles matched "{query}". That one is genuinely not in the
          catalogue — only the top 250 most-voted films are.
        </p>
      )}

      {results.length > 0 && (
        <>
          <p className="page-note">
            {results.length} {results.length === 1 ? "title" : "titles"}
          </p>
          <MovieGrid movies={results} />
        </>
      )}
    </>
  );
};

export default SearchPage;
