import { useState } from "react";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/**
 * Deterministic stand-in artwork for titles with no TMDB poster, and the
 * backdrop behind every poster while its image loads.
 */
const hueFor = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
};

export type PosterSize = "w185" | "w342" | "w500";

type PosterProps = {
  title: string;
  /** TMDB path like "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg". */
  posterPath?: string | undefined;
  size?: PosterSize;
};

const Poster = ({ title, posterPath, size = "w342" }: PosterProps) => {
  // A dead TMDB path should degrade to the gradient, not to a broken icon.
  const [failed, setFailed] = useState(false);
  const hue = hueFor(title);
  const showImage = Boolean(posterPath) && !failed;

  return (
    <div
      className="poster antiux-underwater"
      style={{
        backgroundImage: `linear-gradient(150deg, hsl(${hue} 46% 34%), hsl(${(hue + 42) % 360} 52% 15%))`,
      }}
    >
      {showImage ? (
        <img
          className="poster__image"
          src={`${TMDB_IMAGE_BASE}/${size}${posterPath}`}
          alt={`${title} poster`}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="poster__fallback">{title}</span>
      )}
    </div>
  );
};

export default Poster;
