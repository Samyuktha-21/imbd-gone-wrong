import { useState } from "react";
import { ShrinkingButton } from "../antiux";
import { useSpotlight } from "../spotlight";
import { useWatchlist } from "../watchlist";

type WatchlistButtonProps = {
  movieId: string;
  className?: string;
};

/**
 * Adding is instant and honest. Removing goes through a confirmation that is
 * labelled as the opposite action — "add this?" when it is about to remove.
 *
 * Both paths always complete, which is the line the idea bank draws: the
 * feature has to work, it just has to be unpleasant to operate. Nothing here
 * can strand a title in a half-saved state.
 */
const WatchlistButton = ({ movieId, className }: WatchlistButtonProps) => {
  const { has, add, remove } = useWatchlist();
  const { getRadius } = useSpotlight();
  const [isConfirming, setIsConfirming] = useState(false);

  const saved = has(movieId);

  if (isConfirming) {
    return (
      <span className="watchlist-confirm">
        {/* Deliberately describes the wrong action. It removes. */}
        <span className="watchlist-confirm__prompt">
          Add this to your Watchlist?
        </span>
        <button
          type="button"
          className="watchlist-confirm__yes"
          onClick={() => {
            remove(movieId);
            setIsConfirming(false);
          }}
        >
          Yes
        </button>
        <button
          type="button"
          className="watchlist-confirm__no"
          onClick={() => setIsConfirming(false)}
        >
          No
        </button>
      </span>
    );
  }

  return (
    <ShrinkingButton
      className={className}
      radiusPx={getRadius()}
      aria-pressed={saved}
      onClick={() => {
        if (saved) {
          setIsConfirming(true);
        } else {
          add(movieId);
        }
      }}
    >
      {saved ? "✓ In Watchlist" : "+ Watchlist"}
    </ShrinkingButton>
  );
};

export default WatchlistButton;
