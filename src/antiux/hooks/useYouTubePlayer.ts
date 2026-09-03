import { useEffect, useRef, type RefObject } from "react";

const IFRAME_API_SRC = "https://www.youtube.com/iframe_api";
const ENDED = 0;

/** Minimal shape of the bits of the IFrame API this hook actually touches. */
type YouTubePlayer = { destroy: () => void };
type YouTubeApi = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
        onError?: () => void;
      };
    },
  ) => YouTubePlayer;
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

/**
 * Loads the IFrame API once per page and resolves when `window.YT` is usable.
 * The API calls a single global callback, so concurrent callers share one
 * script tag and one pending promise.
 */
let apiPromise: Promise<YouTubeApi> | null = null;

const loadYouTubeApi = (): Promise<YouTubeApi> => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  apiPromise ??= new Promise<YouTubeApi>((resolve, reject) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      if (window.YT?.Player) {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube IFrame API loaded without a Player"));
      }
    };

    const script = document.createElement("script");
    script.src = IFRAME_API_SRC;
    script.async = true;
    script.onerror = () => reject(new Error("YouTube IFrame API failed to load"));
    document.head.appendChild(script);
  });

  return apiPromise;
};

type UseYouTubePlayerOptions = {
  videoId: string;
  hostRef: RefObject<HTMLDivElement | null>;
  onEnded: () => void;
  /**
   * Hard ceiling on playback. The static loops for hours, and a gag that
   * cannot end is a dead end rather than a joke.
   */
  maxPlaybackMs: number;
  enabled?: boolean;
};

/**
 * Mounts a YouTube player into `hostRef` and reports when the video ends.
 *
 * `onEnded` is guaranteed to fire exactly once: on the real ENDED event, on
 * the max-playback ceiling, or immediately if the API cannot load at all
 * (blocked, offline, or running under jsdom). Failing open matters more than
 * the bit — the caller uses it to restore the page.
 */
export const useYouTubePlayer = ({
  videoId,
  hostRef,
  onEnded,
  maxPlaybackMs,
  enabled = true,
}: UseYouTubePlayerOptions) => {
  const onEndedRef = useRef(onEnded);
  onEndedRef.current = onEnded;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    let cancelled = false;
    let player: YouTubePlayer | null = null;
    let finished = false;

    const finishOnce = () => {
      if (!finished && !cancelled) {
        finished = true;
        onEndedRef.current();
      }
    };

    const ceiling = window.setTimeout(finishOnce, maxPlaybackMs);

    loadYouTubeApi()
      .then((api) => {
        const host = hostRef.current;
        if (cancelled || !host) {
          return;
        }

        player = new api.Player(host, {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === ENDED) {
                finishOnce();
              }
            },
            onError: finishOnce,
          },
        });
      })
      .catch(() => {
        // No API (offline, blocked, jsdom): let the caller move on.
        finishOnce();
      });

    return () => {
      cancelled = true;
      window.clearTimeout(ceiling);
      player?.destroy();
    };
  }, [enabled, hostRef, maxPlaybackMs, videoId]);
};
