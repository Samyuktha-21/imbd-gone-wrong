import { useLocation } from "react-router";

export type NavPlacement = "top" | "left" | "bottom";

const PLACEMENTS: NavPlacement[] = ["top", "left", "bottom"];

/**
 * Where the nav bar lives on a given route.
 *
 * Derived from the pathname rather than randomised, and that is the point:
 * within a page the nav stays put, so it reads as a considered layout rather
 * than a glitch. It is only when you navigate that the whole bar has silently
 * moved to a different edge, and you have to go find it again.
 */
export const navPlacementFor = (pathname: string): NavPlacement => {
  let hash = 0;
  for (let index = 0; index < pathname.length; index += 1) {
    hash = (hash << 5) - hash + pathname.charCodeAt(index);
    hash |= 0;
  }
  return PLACEMENTS[Math.abs(hash) % PLACEMENTS.length] as NavPlacement;
};

export const useNavPlacement = (): NavPlacement =>
  navPlacementFor(useLocation().pathname);
