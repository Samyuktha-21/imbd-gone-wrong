import { Link, Route, Routes } from "react-router";
import { UnderwaterFilterDefs } from "./antiux";
import SiteHeader from "./components/SiteHeader";
import HomePage from "./pages/HomePage";
import SearchPage from "./pages/SearchPage";
import TitlePage from "./pages/TitlePage";
import WatchlistPage from "./pages/WatchlistPage";

const App = () => (
  <>
    {/* One shared <filter> powering .antiux-underwater on every poster. */}
    <UnderwaterFilterDefs />

    <SiteHeader />
    <main className="page">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/title/:id" element={<TitlePage />} />
        <Route path="/watchlist" element={<WatchlistPage />} />
        <Route
          path="*"
          element={
            <>
              <h2 className="section-heading">Page not found</h2>
              <p className="page-note">
                Nothing lives at this address. <Link to="/">Go home</Link>.
              </p>
            </>
          }
        />
      </Routes>
    </main>
    <footer className="site-footer">
      {/*
        The one control on the site that always does exactly what it says.
        Every other route out of here is booby-trapped, and a site with no
        reliable way home stops being a joke and becomes a dead end.
      */}
      <Link to="/">Home</Link>
      <span> · Made for a class project. Not affiliated with IMDb.</span>
    </footer>
  </>
);

export default App;
