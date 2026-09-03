import type { ReactNode } from "react";
import { useShatter } from "../hooks/useShatter";
import "../antiux.css";

type ShatterOnClickProps = {
  children: ReactNode;
  /** Lets the caller hand the wrapper whatever layout the child used to own. */
  className?: string;
  pieces?: number;
  scatterRangePx?: number;
  snapTolerancePx?: number;
  timeLimitMs?: number;
  maxReshatters?: number;
  /** Announced to screen readers while the pieces are scattered. */
  label?: string;
};

/**
 * Shatters whatever it wraps the moment you touch it. The pieces scatter and
 * have to be dragged back into their slots before a timer scatters them
 * again — though only a bounded number of times, so the control underneath is
 * always eventually reachable.
 *
 * The intact child stays mounted while shattered (hidden, inert) so the row
 * never changes height and the shards have a stable set of slots to sit in.
 */
const ShatterOnClick = ({
  children,
  className,
  pieces = 6,
  scatterRangePx,
  snapTolerancePx,
  timeLimitMs,
  maxReshatters,
  label = "Reassemble the pieces to use this control",
}: ShatterOnClickProps) => {
  const { beginDrag, isShattered, isSolved, shards, shatter } = useShatter({
    pieces,
    ...(scatterRangePx === undefined ? {} : { scatterRangePx }),
    ...(snapTolerancePx === undefined ? {} : { snapTolerancePx }),
    ...(timeLimitMs === undefined ? {} : { timeLimitMs }),
    ...(maxReshatters === undefined ? {} : { maxReshatters }),
  });

  return (
    <div
      className={["antiux-shatter", className].filter(Boolean).join(" ")}
      data-testid="shatter-field"
      data-shattered={isShattered}
      data-solved={isSolved}
    >
      <div
        aria-hidden={isShattered}
        className="antiux-shatter__intact"
        data-testid="shatter-intact"
        // Capture phase: intercept the click before the input can focus.
        // Once solved the handler comes off entirely, so the control underneath
        // finally works — otherwise anything focusable here is unusable by
        // construction, since every click to use it would shatter it again.
        onPointerDownCapture={
          isShattered || isSolved
            ? undefined
            : (event) => {
                event.preventDefault();
                shatter();
              }
        }
        inert={isShattered}
      >
        {children}
      </div>

      {isShattered && (
        <div className="antiux-shatter__pieces" role="group" aria-label={label}>
          {shards?.map((shard) => (
            <button
              aria-label={`Piece ${shard.id + 1} of ${pieces}`}
              className="antiux-shatter__piece"
              data-placed={shard.placed}
              data-testid={`shatter-piece-${shard.id}`}
              key={shard.id}
              onPointerDown={(event) => {
                event.preventDefault();
                event.currentTarget.setPointerCapture?.(event.pointerId);
                beginDrag(shard.id, event.clientX, event.clientY);
              }}
              style={{
                transform: `translate(${shard.dx}px, ${shard.dy}px) rotate(${shard.rotation}deg)`,
              }}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ShatterOnClick;
