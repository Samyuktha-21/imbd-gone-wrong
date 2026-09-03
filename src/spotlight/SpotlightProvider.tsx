import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { SpotlightContext } from "./SpotlightContext";
import SpotlightOverlay from "./SpotlightOverlay";
import {
  ACTIVITY_BOOST,
  ACTIVITY_THROTTLE_MS,
  DECAY_INTERVAL_MS,
  DECAY_STEP,
  DEFAULT_RADIUS,
  JUMP_DURATION_MS,
  JUMP_INTERVAL_MS,
  JUMP_OFFSET_RANGE,
} from "./spotlightConfig";
import { adjustRadius, writePosition, writeRadius } from "./spotlightVars";
import "./spotlight.css";

type SpotlightProviderProps = {
  children: ReactNode;
  enableDecay?: boolean;
  enableRandomJumps?: boolean;
};

/**
 * The site's base layer. Everything renders blacked out except a small circle
 * that follows the pointer, so every other gag happens inside this fog.
 *
 * Pointer position is written straight to CSS custom properties on a rAF tick
 * and deliberately kept out of React state — re-rendering the tree on every
 * mousemove would make the fog stutter. Only the radius, which changes at
 * around 1–3Hz, is exposed to consumers via context.
 */
const SpotlightProvider = ({
  children,
  enableDecay = true,
  enableRandomJumps = true,
}: SpotlightProviderProps) => {
  const [radius, setRadius] = useState(DEFAULT_RADIUS);

  const pointerRef = useRef({
    x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
    y: typeof window === "undefined" ? 0 : window.innerHeight / 2,
  });
  const jumpOffsetRef = useRef({ dx: 0, dy: 0 });
  const frameRef = useRef<number | null>(null);
  const lastBoostRef = useRef(0);

  const flushPosition = useCallback(() => {
    const { x, y } = pointerRef.current;
    const { dx, dy } = jumpOffsetRef.current;
    writePosition(x + dx, y + dy);
  }, []);

  const schedulePositionWrite = useCallback(() => {
    if (frameRef.current !== null) {
      return;
    }
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null;
      flushPosition();
    });
  }, [flushPosition]);

  const widen = useCallback((amount: number) => {
    setRadius(adjustRadius(amount));
  }, []);

  // Seed the custom properties before first paint so the page never flashes
  // fully lit.
  useEffect(() => {
    setRadius(writeRadius(DEFAULT_RADIUS));
    flushPosition();
  }, [flushPosition]);

  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      pointerRef.current = { x, y };
      schedulePositionWrite();

      const now = Date.now();
      if (now - lastBoostRef.current >= ACTIVITY_THROTTLE_MS) {
        lastBoostRef.current = now;
        setRadius(adjustRadius(ACTIVITY_BOOST));
      }
    };

    const onPointerMove = (event: PointerEvent) =>
      handleMove(event.clientX, event.clientY);
    const onTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0];
      if (touch) {
        handleMove(touch.clientX, touch.clientY);
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("touchmove", onTouchMove);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }
    };
  }, [schedulePositionWrite]);

  useEffect(() => {
    if (!enableDecay) {
      return;
    }

    const id = window.setInterval(() => {
      setRadius(adjustRadius(-DECAY_STEP));
    }, DECAY_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [enableDecay]);

  useEffect(() => {
    if (!enableRandomJumps) {
      return;
    }

    let resetId: number | undefined;

    const id = window.setInterval(() => {
      jumpOffsetRef.current = {
        dx: (Math.random() * 2 - 1) * JUMP_OFFSET_RANGE,
        dy: (Math.random() * 2 - 1) * JUMP_OFFSET_RANGE,
      };
      schedulePositionWrite();

      resetId = window.setTimeout(() => {
        jumpOffsetRef.current = { dx: 0, dy: 0 };
        schedulePositionWrite();
      }, JUMP_DURATION_MS);
    }, JUMP_INTERVAL_MS);

    return () => {
      window.clearInterval(id);
      if (resetId !== undefined) {
        window.clearTimeout(resetId);
      }
    };
  }, [enableRandomJumps, schedulePositionWrite]);

  const value = useMemo(() => ({ radius, widen }), [radius, widen]);

  return (
    <SpotlightContext.Provider value={value}>
      {children}
      <SpotlightOverlay />
    </SpotlightContext.Provider>
  );
};

export default SpotlightProvider;
