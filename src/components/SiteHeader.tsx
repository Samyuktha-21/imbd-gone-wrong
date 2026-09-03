const navItems = ["Movies", "TV Shows", "Celebs", "Awards"];

const SiteHeader = () => (
  <header className="site-header">
    <span className="brand">IMDb</span>
    <nav className="site-nav" aria-label="Primary">
      {navItems.map((item) => (
        <button key={item} type="button">
          {item}
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
