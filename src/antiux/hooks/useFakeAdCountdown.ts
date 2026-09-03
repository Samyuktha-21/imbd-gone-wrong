import { useEffect, useState } from "react";

const DEFAULT_DURATION_SECONDS = 5;
const DEFAULT_FAKE_RESETS = 2;

/**
 * Counts down from `durationSeconds`, but "fake-resets" back to the start
 * `fakeResets` times before finally reaching zero for real, at which point
 * `canDismiss` flips true. Modeled after an unskippable pre-roll ad whose
 * "Skip in 5s" timer keeps lying to you.
 *
 * Capped by `fakeResets` so it stays a bit, not a trap.
 */
export const useFakeAdCountdown = (
  durationSeconds = DEFAULT_DURATION_SECONDS,
  fakeResets = DEFAULT_FAKE_RESETS,
) => {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const [resetsUsed, setResetsUsed] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);

  useEffect(() => {
    if (canDismiss) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => {
        if (current > 1) {
          return current - 1;
        }

        setResetsUsed((usedSoFar) => {
          if (usedSoFar < fakeResets) {
            return usedSoFar + 1;
          }
          setCanDismiss(true);
          return usedSoFar;
        });

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [canDismiss, fakeResets]);

  useEffect(() => {
    if (!canDismiss && secondsLeft <= 0 && resetsUsed <= fakeResets) {
      setSecondsLeft(durationSeconds);
    }
  }, [canDismiss, durationSeconds, fakeResets, resetsUsed, secondsLeft]);

  return { canDismiss, secondsLeft: Math.max(secondsLeft, 0) };
};
