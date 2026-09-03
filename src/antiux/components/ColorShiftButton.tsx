import { useCallback, useState, type ButtonHTMLAttributes } from "react";
import "../antiux.css";

const SHIFT_COLORS = [
  "#ff6b6b",
  "#feca57",
  "#1dd1a1",
  "#54a0ff",
  "#5f27cd",
  "#ff9ff3",
  "#00d2d3",
];

type ColorShiftButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick"
> & {
  onShift?: ((color: string) => void) | undefined;
};

const pickNextColor = (currentColor: string | null): string => {
  const candidates = SHIFT_COLORS.filter((color) => color !== currentColor);
  const pool = candidates.length > 0 ? candidates : SHIFT_COLORS;
  return pool[Math.floor(Math.random() * pool.length)] as string;
};

/**
 * Shifts to a jarring new background color on every click, forcing
 * constant visual re-adjustment. Never repeats the current color, so the
 * change is always noticeable.
 */
const ColorShiftButton = ({
  onShift,
  className,
  style,
  children,
  ...buttonProps
}: ColorShiftButtonProps) => {
  const [color, setColor] = useState<string | null>(null);

  const handleClick = useCallback(() => {
    const next = pickNextColor(color);
    setColor(next);
    onShift?.(next);
  }, [color, onShift]);

  return (
    <button
      {...buttonProps}
      type="button"
      onClick={handleClick}
      data-testid="color-shift-button"
      {...(color ? { "data-shift-color": color } : {})}
      className={["antiux-button", className].filter(Boolean).join(" ")}
      style={{ ...style, ...(color ? { backgroundColor: color } : {}) }}
    >
      {children}
    </button>
  );
};

export default ColorShiftButton;
