import { useId, useState, type ReactNode } from "react";
import "../antiux.css";

type UnderwaterDistortionProps = {
  children: ReactNode;
  /** Displacement strength. Higher = less legible. */
  scale?: number;
};

/**
 * Wraps an image (or any content) in a rippling, underwater-style SVG
 * displacement filter, so you can't quite make out the details until you
 * hover to "surface" it — at which point the filter clears.
 */
const UnderwaterDistortion = ({
  children,
  scale = 18,
}: UnderwaterDistortionProps) => {
  const filterId = `antiux-wave-${useId().replace(/:/g, "")}`;
  const [isSurfaced, setIsSurfaced] = useState(false);

  return (
    <div
      data-testid="underwater-distortion"
      data-surfaced={isSurfaced}
      onMouseEnter={() => setIsSurfaced(true)}
      onMouseLeave={() => setIsSurfaced(false)}
      className="antiux-distortion"
      style={{ filter: isSurfaced ? "none" : `url(#${filterId})` }}
    >
      <svg aria-hidden="true" className="antiux-distortion__defs">
        <defs>
          <filter id={filterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.01 0.04"
              numOctaves={2}
              seed={3}
              result="wave"
            >
              <animate
                attributeName="baseFrequency"
                dur="6s"
                repeatCount="indefinite"
                values="0.01 0.04;0.02 0.06;0.01 0.04"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="wave"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>
      {children}
    </div>
  );
};

export default UnderwaterDistortion;
