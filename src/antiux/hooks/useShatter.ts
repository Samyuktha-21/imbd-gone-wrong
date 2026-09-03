import { useCallback, useEffect, useRef, useState } from "react";

export type Shard = {
  id: number;
  /** Offset from the shard's home slot, in px. Home is (0, 0). */
  dx: number;
  dy: number;
  rotation: number;
  placed: boolean;
};

type UseShatterOptions = {
  pieces?: number;
  /** How far shards fly when they scatter. */
  scatterRangePx?: number;
  /** How close to home a shard must land to snap into place. */
  snapTolerancePx?: number;
  /** Time to reassemble before it scatters again. */
  timeLimitMs?: number;
  /** Bounded so a slow dragger eventually gets to finish. */
  maxReshatters?: number;
};

const randomBetween = (range: number) => (Math.random() * 2 - 1) * range;

const createShards = (pieces: number, scatterRangePx: number): Shard[] =>
  Array.from({ length: pieces }, (_, id) => ({
    id,
    dx: randomBetween(scatterRangePx),
    dy: randomBetween(scatterRangePx * 0.55),
    rotation: randomBetween(38),
    placed: false,
  }));

/**
 * Shatter-and-reassemble state machine.
 *
 * Positions are tracked as offsets from each shard's home slot rather than as
 * absolute coordinates, so nothing needs to measure the DOM — which also means
 * it behaves identically under jsdom and in a real browser.
 */
export const useShatter = ({
  pieces = 6,
  scatterRangePx = 130,
  snapTolerancePx = 28,
  timeLimitMs = 7000,
  maxReshatters = 2,
}: UseShatterOptions = {}) => {
  const [shards, setShards] = useState<Shard[] | null>(null);
  const [reshattersUsed, setReshattersUsed] = useState(0);
  const draggingRef = useRef<{ id: number; startX: number; startY: number; originDx: number; originDy: number } | null>(null);

  const isShattered = shards !== null;

  const shatter = useCallback(() => {
    setShards(createShards(pieces, scatterRangePx));
  }, [pieces, scatterRangePx]);

  const reassemble = useCallback(() => {
    setShards(null);
    setReshattersUsed(0);
  }, []);

  const beginDrag = useCallback(
    (id: number, clientX: number, clientY: number) => {
      const shard = shards?.find((candidate) => candidate.id === id);
      if (!shard || shard.placed) {
        return;
      }
      draggingRef.current = {
        id,
        startX: clientX,
        startY: clientY,
        originDx: shard.dx,
        originDy: shard.dy,
      };
    },
    [shards],
  );

  // Drag tracking lives on the window so a fast pointer can outrun the shard
  // without dropping it.
  useEffect(() => {
    if (!isShattered) {
      return;
    }

    const onMove = (event: PointerEvent) => {
      const drag = draggingRef.current;
      if (!drag) {
        return;
      }
      setShards((current) =>
        current?.map((shard) =>
          shard.id === drag.id
            ? {
                ...shard,
                dx: drag.originDx + (event.clientX - drag.startX),
                dy: drag.originDy + (event.clientY - drag.startY),
              }
            : shard,
        ) ?? null,
      );
    };

    const onUp = () => {
      const drag = draggingRef.current;
      draggingRef.current = null;
      if (!drag) {
        return;
      }
      setShards((current) =>
        current?.map((shard) => {
          if (shard.id !== drag.id) {
            return shard;
          }
          const home = Math.hypot(shard.dx, shard.dy) <= snapTolerancePx;
          return home
            ? { ...shard, dx: 0, dy: 0, rotation: 0, placed: true }
            : shard;
        }) ?? null,
      );
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [isShattered, snapTolerancePx]);

  // Every shard home: the thing pulls itself back together.
  useEffect(() => {
    if (shards && shards.every((shard) => shard.placed)) {
      reassemble();
    }
  }, [reassemble, shards]);

  // Ran out of time: scatter again, but only while the budget lasts. Once it
  // is spent the shards stay put so the search bar is always recoverable.
  useEffect(() => {
    if (!isShattered || reshattersUsed >= maxReshatters) {
      return;
    }

    const timer = window.setTimeout(() => {
      setShards((current) => {
        if (!current || current.every((shard) => shard.placed)) {
          return current;
        }
        setReshattersUsed((used) => used + 1);
        return createShards(pieces, scatterRangePx);
      });
    }, timeLimitMs);

    return () => window.clearTimeout(timer);
  }, [
    isShattered,
    maxReshatters,
    pieces,
    reshattersUsed,
    scatterRangePx,
    timeLimitMs,
  ]);

  return {
    beginDrag,
    isShattered,
    reassemble,
    reshattersUsed,
    shards,
    shatter,
  };
};
