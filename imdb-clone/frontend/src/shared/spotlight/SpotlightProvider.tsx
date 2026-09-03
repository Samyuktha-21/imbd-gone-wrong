import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SpotlightContext, type SpotlightState } from "./SpotlightContext";
import "./spotlightProperties.css";

export const DEFAULT_RADIUS = 220;
export const MIN_RADIUS = 90;
export const ACTIVITY_BOOST = 18;
export const ACTIVITY_THROTTLE_MS = 400;
export const DECAY_STEP = 10;
export const DECAY_INTERVAL_MS = 1000;
export const JUMP_INTERVAL_MS = 7000;
export const JUMP_DURATION_MS = 900;
export const JUMP_OFFSET_RANGE = 140;
/** Generous ceiling so a curious DevTools edit is respected, not clamped away. */
const RADIUS_SANITY_CEILING = 4000;

type SpotlightProviderProps = {
  children: ReactNode;
  enableDecay?: boolean;
  enableRandomJumps?: boolean;
};

const clampRadius = (value: number) =>
  Math.min(RADIUS_SANITY_CEILING, Math.max(MIN_RADIUS, value));

const getSpotlightRoot = () => document.documentElement;

const readRadius = () => {
  // Reads the element's own inline style rather than getComputedStyle: this
  // is exactly the rule DevTools edits when a value was set via
  // `style.setProperty`, and it sidesteps cascade-resolution differences
  // between browsers and jsdom.
  const raw = getSpotlightRoot().style.getPropertyValue("--spotlight-radius");
  const parsed = parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_RADIUS;
};

/**
 * Foundational anti-UX layer: restricts visibility to a small circle that
 * follows the cursor/touch, shrinks over time, and can optionally jump away
 * from the real pointer position. Every other gag renders inside this fog.
 *
 * `--spotlight-radius` is deliberately left readable/writable via DevTools:
 * every adjustment re-reads the live DOM value first instead of trusting
 * stale React state, so a manual edit becomes the new baseline rather than
 * being instantly overwritten on the next pointer move or decay tick.
 */
const SpotlightProvider = ({
  children,
  enableDecay = true,
  enableRandomJumps = false,
}: SpotlightProviderProps) => {
  const [state, setState] = useState<SpotlightState>({
    radius: DEFAULT_RADIUS,
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });

  const pointerRef = useRef({ x: state.x, y: state.y });
  const jumpOffsetRef = useRef({ dx: 0, dy: 0 });
  const lastActivityRef = useRef(0);

  useEffect(() => {
    getSpotlightRoot().style.setProperty(
      "--spotlight-radius",
      `${DEFAULT_RADIUS}px`,
    );
  }, []);

  const adjustRadius = useCallback((delta: number) => {
    const next = clampRadius(readRadius() + delta);
    getSpotlightRoot().style.setProperty("--spotlight-radius", `${next}px`);
    setState((prev) => ({ ...prev, radius: next }));
  }, []);

  const applyPosition = useCallback(() => {
    setState((prev) => ({
      ...prev,
      x: pointerRef.current.x + jumpOffsetRef.current.dx,
      y: pointerRef.current.y + jumpOffsetRef.current.dy,
    }));
  }, []);

  const registerActivity = useCallback(() => {
    adjustRadius(ACTIVITY_BOOST);
  }, [adjustRadius]);

  const handleActivity = useCallback(
    (x: number, y: number) => {
      pointerRef.current = { x, y };
      applyPosition();

      const now = Date.now();
      if (now - lastActivityRef.current >= ACTIVITY_THROTTLE_MS) {
        lastActivityRef.current = now;
        registerActivity();
      }
    },
    [applyPosition, registerActivity],
  );

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      handleActivity(event.clientX, event.clientY);
    };
    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        handleActivity(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [handleActivity]);

  useEffect(() => {
    if (!enableDecay) {
      return undefined;
    }

    const id = window.setInterval(() => {
      adjustRadius(-DECAY_STEP);
    }, DECAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [adjustRadius, enableDecay]);

  useEffect(() => {
    if (!enableRandomJumps) {
      return undefined;
    }

    const id = window.setInterval(() => {
      jumpOffsetRef.current = {
        dx: (Math.random() - 0.5) * 2 * JUMP_OFFSET_RANGE,
        dy: (Math.random() - 0.5) * 2 * JUMP_OFFSET_RANGE,
      };
      applyPosition();

      window.setTimeout(() => {
        jumpOffsetRef.current = { dx: 0, dy: 0 };
        applyPosition();
      }, JUMP_DURATION_MS);
    }, JUMP_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [applyPosition, enableRandomJumps]);

  useEffect(() => {
    const root = getSpotlightRoot();
    root.style.setProperty("--spotlight-x", `${state.x}px`);
    root.style.setProperty("--spotlight-y", `${state.y}px`);
  }, [state.x, state.y]);

  const value = useMemo(
    () => ({ ...state, registerActivity }),
    [state, registerActivity],
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
    </SpotlightContext.Provider>
  );
};

export default SpotlightProvider;
