/**
 * Deterministic stand-in artwork. Real poster images would mean shipping
 * binaries or hotlinking a CDN, and the fog hides most of the frame anyway —
 * a stable per-title colour is enough to tell cards apart.
 */
const hueFor = (seed: string) => {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash) % 360;
};

type PosterProps = {
  title: string;
};

const Poster = ({ title }: PosterProps) => {
  const hue = hueFor(title);

  return (
    <div
      className="poster antiux-underwater"
      style={{
        backgroundImage: `linear-gradient(150deg, hsl(${hue} 46% 34%), hsl(${(hue + 42) % 360} 52% 15%))`,
      }}
    >
      {title}
    </div>
  );
};

export default Poster;
