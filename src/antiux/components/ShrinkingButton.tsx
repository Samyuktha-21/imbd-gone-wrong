import { useRef, type ButtonHTMLAttributes } from "react";
import { useProximityShrink } from "../hooks/useProximityShrink";
import "../antiux.css";

type ShrinkingButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  radiusPx?: number | undefined;
  minScale?: number | undefined;
};

/**
 * The button's label shrinks the closer the cursor gets, bottoming out at
 * a barely-legible size right as you're about to click it.
 */
const ShrinkingButton = ({
  radiusPx,
  minScale,
  className,
  style,
  children,
  ...buttonProps
}: ShrinkingButtonProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const scale = useProximityShrink(buttonRef, { radiusPx, minScale });

  return (
    <button
      {...buttonProps}
      ref={buttonRef}
      type="button"
      data-testid="shrinking-button"
      data-scale={scale}
      className={["antiux-button", className].filter(Boolean).join(" ")}
      style={{ ...style, fontSize: `${scale}em` }}
    >
      {children}
    </button>
  );
};

export default ShrinkingButton;
