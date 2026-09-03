export type AdVideo = {
  id: string;
  /** Shown as the fake ad's title card. */
  label: string;
  /**
   * "cover" scales the player past the viewport edges so the footage bleeds
   * across the entire screen (used for the static). "contain" keeps the
   * whole 16:9 frame on screen.
   */
  fit: "cover" | "contain";
};

export const AD_VIDEOS: AdVideo[] = [
  {
    id: "zSpg77VNQ8A",
    label: "Signal Lost",
    fit: "cover",
  },
  {
    id: "dQw4w9WgXcQ",
    label: "Never Gonna Give You Up",
    fit: "contain",
  },
];

/** Which pre-roll you get is a coin flip. */
export const pickRandomAdVideo = (videos: AdVideo[] = AD_VIDEOS): AdVideo =>
  videos[Math.floor(Math.random() * videos.length)] as AdVideo;
