import "../antiux.css";

/**
 * The single shared SVG filter behind the `.antiux-underwater` class.
 *
 * Mounted once near the app root. Applying the ripple page-wide via one
 * class beats wrapping each element in its own filter: no extra DOM boxes
 * (so nothing disturbs `.poster`'s aspect-ratio inside the card grid), and
 * one filter definition instead of one per poster.
 *
 * Hover-to-surface is handled in CSS, so this needs no JS state at all.
 */
export const UNDERWATER_FILTER_ID = "antiux-underwater-filter";

const UnderwaterFilterDefs = () => (
  <svg aria-hidden="true" className="antiux-distortion__defs">
    <defs>
      <filter id={UNDERWATER_FILTER_ID}>
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
          scale={14}
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </defs>
  </svg>
);

export default UnderwaterFilterDefs;
