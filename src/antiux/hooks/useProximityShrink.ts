import { useEffect, useState, type RefObject } from "react";

type UseProximityShrinkOptions = {
  radiusPx?: number | undefined;
  minScale?: number | undefined;
};

const DEFAULT_RADIUS_PX = 160;
const DEFAULT_MIN_SCALE = 0.4;

/**
 * Tracks pointer distance to the given element and returns a font-size
 * scale that shrinks from 1 (far away) down to minScale (right on top of
 * it), so the closer you get to clicking, the harder it is to read/hit.
 */
export const useProximityShrink = (
  ref: RefObject<HTMLElement | null>,
  {
    radiusPx = DEFAULT_RADIUS_PX,
    minScale = DEFAULT_MIN_SCALE,
  }: UseProximityShrinkOptions = {},
) => {
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const element = ref.current;
      if (!element) {
        return;
      }

      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(
        event.clientX - centerX,
        event.clientY - centerY,
      );
      const proximity = Math.max(0, Math.min(1, 1 - distance / radiusPx));
      setScale(1 - proximity * (1 - minScale));
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, [minScale, radiusPx, ref]);

  return scale;
};
