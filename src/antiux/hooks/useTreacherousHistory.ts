import { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";

export const HOME_PATH = "/";

/** Every route the user could be sent to by a treacherous control. */
const DESTINATIONS = [
  HOME_PATH,
  "/watchlist",
  "/search?q=crime",
  "/search?q=1994",
  "/search?q=sci-fi",
];

/**
 * Tracks where you have actually been, so "Back" can send you somewhere you
 * genuinely visited — just not the place you came from.
 *
 * Picking from real history rather than a random URL keeps the joke coherent:
 * every destination is somewhere you recognise, which makes it more
 * disorienting than a page you have never seen.
 */
export const useTreacherousHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const visited = useRef<string[]>([]);

  useEffect(() => {
    const current = `${location.pathname}${location.search}`;
    const history = visited.current;
    if (history[history.length - 1] !== current) {
      history.push(current);
      // Bounded so a long session cannot grow this without limit.
      if (history.length > 25) {
        history.shift();
      }
    }
  }, [location.pathname, location.search]);

  /** Go back to a random page you have been to — rarely the previous one. */
  const goBackSomewhere = useCallback(() => {
    const current = `${location.pathname}${location.search}`;
    const candidates = visited.current.filter((path) => path !== current);

    if (candidates.length === 0) {
      void navigate(HOME_PATH);
      return;
    }

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    void navigate(target ?? HOME_PATH);
  }, [location.pathname, location.search, navigate]);

  /** Where the logo sends you instead of home. */
  const goSomewhereUnexpected = useCallback(() => {
    const current = `${location.pathname}${location.search}`;
    const candidates = DESTINATIONS.filter((path) => path !== current);
    const target = candidates[Math.floor(Math.random() * candidates.length)];
    void navigate(target ?? HOME_PATH);
  }, [location.pathname, location.search, navigate]);

  return { goBackSomewhere, goSomewhereUnexpected };
};
