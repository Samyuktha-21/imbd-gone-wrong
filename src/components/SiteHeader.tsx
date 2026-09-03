import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { RandomLanguageSwitch, ShatterOnClick } from "../antiux";
import type { LanguageCopy } from "../antiux";
import { useNavPlacement } from "../antiux/hooks/useNavPlacement";
import { useTreacherousHistory } from "../antiux/hooks/useTreacherousHistory";
import { useAuth } from "../auth";
import { useWatchlist } from "../watchlist";

/**
 * Nav labels drift between languages on their own. There is no language
 * switcher to undo it — and if there were, it would be labelled in whatever
 * language happens to be active.
 */
const navItems: { key: string; to: string; translations: LanguageCopy }[] = [
  {
    key: "movies",
    to: "/",
    translations: { en: "Movies", es: "Películas", ja: "映画", fr: "Films", de: "Filme" },
  },
  {
    key: "tv",
    to: "/search?q=drama",
    translations: { en: "TV Shows", es: "Series", ja: "テレビ番組", fr: "Séries", de: "Serien" },
  },
  {
    key: "celebs",
    to: "/search?q=crime",
    translations: { en: "Celebs", es: "Famosos", ja: "有名人", fr: "Célébrités", de: "Stars" },
  },
  {
    key: "awards",
    to: "/search?q=1994",
    translations: { en: "Awards", es: "Premios", ja: "受賞歴", fr: "Récompenses", de: "Preise" },
  },
];

/** How many resting places the search bar cycles through. */
const SEARCH_SLOTS = 4;

const SiteHeader = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const placement = useNavPlacement();
  const { goBackSomewhere, goSomewhereUnexpected } = useTreacherousHistory();
  const { count } = useWatchlist();
  const { isSignedIn, session } = useAuth();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [searchSlot, setSearchSlot] = useState(0);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }
    // The search itself is honest; the bar just refuses to stay put.
    setSearchSlot((slot) => (slot + 1) % SEARCH_SLOTS);
    void navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className={`site-header site-header--${placement}`}>
      {/* Normally goes home. This one does not. */}
      <button
        type="button"
        className="brand"
        onClick={goSomewhereUnexpected}
        title="IMDb"
      >
        IMDb
      </button>

      <nav className="site-nav" aria-label="Primary">
        {navItems.map((item, index) => (
          <Link key={item.key} to={item.to}>
            {/*
              Fast enough that a label can change while you are still reading
              it. Staggered so they never re-roll in unison, which would read
              as a deliberate site-wide switch rather than the nav coming apart.
            */}
            <RandomLanguageSwitch
              translations={item.translations}
              intervalMs={900 + index * 220}
            />
          </Link>
        ))}
      </nav>

      {/* Touch the search bar and it comes apart in your hands. */}
      <form
        className={`header-search-form header-search-form--slot-${searchSlot}`}
        role="search"
        onSubmit={handleSearch}
      >
        <ShatterOnClick
          className="header-search-shatter"
          label="Search bar shattered — drag the pieces back into place"
          pieces={6}
        >
          <input
            className="header-search"
            type="search"
            placeholder="Search IMDb"
            aria-label="Search IMDb"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </ShatterOnClick>
      </form>

      <div className="header-actions">
        {/* Goes back somewhere you have been. Rarely where you just were. */}
        <button type="button" className="button button--ghost" onClick={goBackSomewhere}>
          ← Back
        </button>
        <Link to="/watchlist" className="button button--secondary">
          Watchlist{count > 0 ? ` (${count})` : ""}
        </Link>
        <Link to="/signin" className="header-account">
          {isSignedIn ? session?.username : "Sign In"}
        </Link>
      </div>
    </header>
  );
};

export default SiteHeader;
