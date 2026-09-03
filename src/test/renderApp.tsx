import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "../App";
import { AuthProvider } from "../auth";
import { SpotlightProvider } from "../spotlight";
import { WatchlistProvider } from "../watchlist";

/**
 * Renders the whole app inside the same provider stack as main.tsx, with
 * MemoryRouter standing in for BrowserRouter so each test starts on a known
 * route.
 *
 * Kept in one place deliberately: every test that mounts <App /> needs the
 * full stack, and duplicating it meant that adding a provider broke every
 * test file at once with a context error.
 */
export const renderApp = (route = "/") => {
  const view = render(
    <MemoryRouter initialEntries={[route]}>
      <AuthProvider>
        <WatchlistProvider>
          <SpotlightProvider>
            <App />
          </SpotlightProvider>
        </WatchlistProvider>
      </AuthProvider>
    </MemoryRouter>,
  );

  return { ...view, user: userEvent.setup() };
};

/**
 * Sessions and watchlists both persist to localStorage, so tests leak into
 * each other without this.
 */
export const clearPersistedState = () => {
  window.localStorage.clear();
};
