import { useRef, useState } from "react";
import { pickRandomAdVideo, type AdVideo } from "../adVideos";
import { useFakeAdCountdown } from "../hooks/useFakeAdCountdown";
import { useYouTubePlayer } from "../hooks/useYouTubePlayer";
import "../antiux.css";

/** Ceiling on playback so a looping video can never trap the viewer. */
const MAX_PLAYBACK_MS = 45_000;

type FakeAdInterstitialProps = {
  onDismiss: () => void;
  /** Omit to let the component roll one of the pre-rolls at random. */
  video?: AdVideo | undefined;
  durationSeconds?: number | undefined;
  fakeResets?: number | undefined;
  maxPlaybackMs?: number | undefined;
};

/**
 * Full-screen unskippable pre-roll. Which video you get is a coin flip, and
 * the "Skip Ad" countdown resets a bounded number of times before the close
 * button genuinely works.
 *
 * Sits above the spotlight fog on purpose: the fog is z-index 9000, so a
 * lower stacking order would black the video out entirely. Callers also lift
 * the fog while this is mounted, but the z-index means the gag still works if
 * they forget.
 */
const FakeAdInterstitial = ({
  onDismiss,
  video,
  durationSeconds,
  fakeResets,
  maxPlaybackMs = MAX_PLAYBACK_MS,
}: FakeAdInterstitialProps) => {
  // Rolled once per mount so re-renders never swap the video mid-play.
  const [selected] = useState(() => video ?? pickRandomAdVideo());
  const hostRef = useRef<HTMLDivElement | null>(null);
  const { canDismiss, secondsLeft } = useFakeAdCountdown(
    durationSeconds,
    fakeResets,
  );

  // When the video runs out the ad closes itself and the fog comes back.
  useYouTubePlayer({
    videoId: selected.id,
    hostRef,
    onEnded: onDismiss,
    maxPlaybackMs,
  });

  return (
    <div
      className="antiux-ad"
      data-testid="fake-ad-interstitial"
      data-video-id={selected.id}
      data-fit={selected.fit}
      role="dialog"
      aria-label="Advertisement"
    >
      <div className={`antiux-ad__stage antiux-ad__stage--${selected.fit}`}>
        <div data-testid="fake-ad-player" ref={hostRef} />
      </div>

      <div className="antiux-ad__chrome">
        <p className="antiux-ad__eyebrow">Advertisement</p>
        <p className="antiux-ad__title">{selected.label}</p>
        <p className="antiux-ad__skip" data-testid="fake-ad-skip-label">
          {canDismiss ? "You can skip now" : `Skip Ad in ${secondsLeft}s`}
        </p>
      </div>

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
    </div>
  );
};

export default FakeAdInterstitial;
