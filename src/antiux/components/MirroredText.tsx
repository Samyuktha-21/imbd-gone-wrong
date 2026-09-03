import { useState, type HTMLAttributes, type ReactNode } from "react";
import "../antiux.css";

type MirroredTextProps = Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children: ReactNode;
};

/**
 * Renders its children horizontally flipped by default — readable only by
 * holding it up to an actual mirror. Hovering or focusing mirrors it back
 * to normal as a mercy so it stays legible when you really need to read it.
 */
const MirroredText = ({
  children,
  className,
  style,
  ...spanProps
}: MirroredTextProps) => {
  const [isReadable, setIsReadable] = useState(false);

  return (
    <span
      {...spanProps}
      data-testid="mirrored-text"
      data-mirrored={!isReadable}
      tabIndex={0}
      onMouseEnter={() => setIsReadable(true)}
      onMouseLeave={() => setIsReadable(false)}
      onFocus={() => setIsReadable(true)}
      onBlur={() => setIsReadable(false)}
      className={["antiux-mirrored", className].filter(Boolean).join(" ")}
      style={{ ...style, transform: isReadable ? "none" : "scaleX(-1)" }}
    >
      {children}
    </span>
  );
};

export default MirroredText;
