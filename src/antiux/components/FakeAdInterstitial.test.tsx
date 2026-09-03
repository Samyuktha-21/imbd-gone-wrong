import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AD_VIDEOS } from "../adVideos";
import FakeAdInterstitial from "./FakeAdInterstitial";

const staticVideo = AD_VIDEOS[0]!;
const rickroll = AD_VIDEOS[1]!;

describe("FakeAdInterstitial", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  test("starts with the close button disabled and a live countdown", () => {
    const onDismiss = vi.fn();
    render(
      <FakeAdInterstitial
        durationSeconds={5}
        fakeResets={1}
        onDismiss={onDismiss}
        video={rickroll}
      />,
    );

    expect(screen.getByTestId("fake-ad-close-button")).toBeDisabled();
    expect(screen.getByTestId("fake-ad-skip-label")).toHaveTextContent(
      "Skip Ad in 5s",
    );

    fireEvent.click(screen.getByTestId("fake-ad-close-button"));
    expect(onDismiss).not.toHaveBeenCalled();
  });

  test("fake-resets the countdown before finally allowing dismissal", () => {
    const onDismiss = vi.fn();
    render(
      <FakeAdInterstitial
        durationSeconds={5}
        fakeResets={1}
        onDismiss={onDismiss}
        video={rickroll}
      />,
    );

    // First full countdown burns the single allowed fake reset.
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(screen.getByTestId("fake-ad-close-button")).toBeDisabled();

    // Second countdown genuinely finishes.
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(screen.getByTestId("fake-ad-close-button")).toBeEnabled();
    expect(screen.getByTestId("fake-ad-skip-label")).toHaveTextContent(
      "You can skip now",
    );

    fireEvent.click(screen.getByTestId("fake-ad-close-button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test("renders the static full-bleed and the rickroll letterboxed", () => {
    const { unmount } = render(
      <FakeAdInterstitial onDismiss={vi.fn()} video={staticVideo} />,
    );
    const ad = screen.getByTestId("fake-ad-interstitial");
    expect(ad).toHaveAttribute("data-video-id", "zSpg77VNQ8A");
    expect(ad).toHaveAttribute("data-fit", "cover");
    unmount();

    render(<FakeAdInterstitial onDismiss={vi.fn()} video={rickroll} />);
    const second = screen.getByTestId("fake-ad-interstitial");
    expect(second).toHaveAttribute("data-video-id", "dQw4w9WgXcQ");
    expect(second).toHaveAttribute("data-fit", "contain");
  });

  test("picks a video at random when none is supplied", () => {
    vi.spyOn(Math, "random").mockReturnValue(0);
    render(<FakeAdInterstitial onDismiss={vi.fn()} />);

    expect(screen.getByTestId("fake-ad-interstitial")).toHaveAttribute(
      "data-video-id",
      staticVideo.id,
    );
  });

  /*
   * The ceiling is the backstop that matters. jsdom never loads the external
   * IFrame API and never fires `error` for it either, so the promise simply
   * stays pending — exactly the shape of a blocked script in a real browser
   * with no error event. Only this timer guarantees the overlay clears.
   */
  test("dismisses itself at the max-playback ceiling", () => {
    const onDismiss = vi.fn();
    render(
      <FakeAdInterstitial
        onDismiss={onDismiss}
        video={rickroll}
        maxPlaybackMs={20_000}
      />,
    );

    act(() => {
      vi.advanceTimersByTime(20_000);
    });

    expect(onDismiss).toHaveBeenCalled();
  });
});
