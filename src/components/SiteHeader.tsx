import { RandomLanguageSwitch } from "../antiux";
import type { LanguageCopy } from "../antiux";

/**
 * Nav labels drift between languages on their own. There is no language
 * switcher to undo it — and if there were, it would be labelled in whatever
 * language happens to be active.
 */
const navItems: { key: string; translations: LanguageCopy }[] = [
  {
    key: "movies",
    translations: {
      en: "Movies",
      es: "Películas",
      ja: "映画",
      fr: "Films",
      de: "Filme",
    },
  },
  {
    key: "tv",
    translations: {
      en: "TV Shows",
      es: "Series",
      ja: "テレビ番組",
      fr: "Séries",
      de: "Serien",
    },
  },
  {
    key: "celebs",
    translations: {
      en: "Celebs",
      es: "Famosos",
      ja: "有名人",
      fr: "Célébrités",
      de: "Stars",
    },
  },
  {
    key: "awards",
    translations: {
      en: "Awards",
      es: "Premios",
      ja: "受賞歴",
      fr: "Récompenses",
      de: "Preise",
    },
  },
];

const SiteHeader = () => (
  <header className="site-header">
    <span className="brand">IMDb</span>
    <nav className="site-nav" aria-label="Primary">
      {navItems.map((item, index) => (
        <button key={item.key} type="button">
          {/* Staggered intervals so the labels never re-roll in unison. */}
          <RandomLanguageSwitch
            translations={item.translations}
            intervalMs={5000 + index * 1300}
          />
        </button>
      ))}
    </nav>
    <input
      className="header-search"
      type="search"
      placeholder="Search IMDb"
      aria-label="Search IMDb"
    />
    <div className="header-actions">
      <button type="button" className="button button--secondary">
        Watchlist
      </button>
      <span>Sign In</span>
    </div>
  </header>
);

export default SiteHeader;
