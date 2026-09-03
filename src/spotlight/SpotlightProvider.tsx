import { useCallback, useEffect, useMemo, useRef, type ReactNode } from "react";
import { SpotlightContext } from "./SpotlightContext";
import SpotlightOverlay from "./SpotlightOverlay";
import {
  DEFAULT_RADIUS,
  JUMP_DURATION_MS,
  JUMP_INTERVAL_MS,
  JUMP_OFFSET_RANGE,
} from "./spotlightConfig";
import { registerSpotlightConsole } from "./spotlightConsole";
import {
  readRadius,
  writePosition,
  writeRadius,
  writeSuppressed,
} from "./spotlightVars";
import "./spotlight.css";

type SpotlightProviderProps = {
  children: ReactNode;
  enableRandomJumps?: boolean;
};

/**
 * The site's base layer. Everything renders blacked out except a small circle
 * that follows the pointer, so every other gag happens inside this fog.
 *
 * The circle is a fixed size for the app's lifetime — the radius is written
 * once on mount and never touched again. That keeps the devtools cheat
 * dependable: whatever you type into --spotlight-radius stays put.
 *
 * Pointer position goes straight to CSS custom properties on a rAF tick and is
 * deliberately kept out of React state — re-rendering on every mousemove made
 * the fog stutter. This component therefore holds no state at all and never
 * re-renders after mount.
 */
const SpotlightProvider = ({
  children,
  enableRandomJumps = true,
}: SpotlightProviderProps) => {
  const pointerRef = useRef({
    x: typeof window === "undefined" ? 0 : window.innerWidth / 2,
    y: typeof window === "undefined" ? 0 : window.innerHeight / 2,
  });
  const jumpOffsetRef = useRef({ dx: 0, dy: 0 });
  const frameRef = useRef<number | null>(null);

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

  // Seed the custom properties before first paint so the page never flashes
  // fully lit. This is the only write to the radius the app performs; after
  // this, it only ever changes if a user asks for it from devtools.
  useEffect(() => {
    writeRadius(DEFAULT_RADIUS);
    flushPosition();
  }, [flushPosition]);

  useEffect(() => registerSpotlightConsole(), []);

  useEffect(() => {
    const handleMove = (x: number, y: number) => {
      pointerRef.current = { x, y };
      schedulePositionWrite();
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

  // Restore the fog if the provider unmounts mid-playback, so a suppressed
  // attribute can never outlive the thing that set it.
  useEffect(() => () => writeSuppressed(false), []);

  const value = useMemo(
    () => ({ getRadius: readRadius, setSuppressed: writeSuppressed }),
    [],
  );

  return (
    <SpotlightContext.Provider value={value}>
      {children}
      <SpotlightOverlay />
    </SpotlightContext.Provider>
  );
};

export default SpotlightProvider;
