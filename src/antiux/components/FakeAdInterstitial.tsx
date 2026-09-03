import { useFakeAdCountdown } from "../hooks/useFakeAdCountdown";
import "../antiux.css";

type FakeAdInterstitialProps = {
  onDismiss: () => void;
  durationSeconds?: number | undefined;
  fakeResets?: number | undefined;
};

/**
 * Full-screen "unskippable pre-roll ad" gag: force-plays a rickroll for a
 * mandatory watch time. The "Skip Ad in 5s" countdown fake-resets a couple
 * of times before genuinely letting the close button work — and the close
 * button is clearly telegraphed once it becomes clickable, so it stays a
 * bit rather than a trap.
 */
const FakeAdInterstitial = ({
  onDismiss,
  durationSeconds,
  fakeResets,
}: FakeAdInterstitialProps) => {
  const { canDismiss, secondsLeft } = useFakeAdCountdown(
    durationSeconds,
    fakeResets,
  );

  return (
    <div className="antiux-ad" data-testid="fake-ad-interstitial" role="dialog">
      <button
        aria-label="Close ad"
        className="antiux-ad__close"
        data-testid="fake-ad-close-button"
        disabled={!canDismiss}
        onClick={onDismiss}
        type="button"
      >
        &times;
      </button>

      <p className="antiux-ad__eyebrow">Advertisement</p>
      <div aria-hidden="true" className="antiux-ad__glyph">
        &#9654;
      </div>
      <p className="antiux-ad__title">Never Gonna Give You Up</p>
      <p className="antiux-ad__skip" data-testid="fake-ad-skip-label">
        {canDismiss ? "You can skip now" : `Skip Ad in ${secondsLeft}s`}
      </p>
    </div>
  );
};

export default FakeAdInterstitial;
