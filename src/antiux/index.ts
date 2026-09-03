export { default as ColorShiftButton } from "./components/ColorShiftButton";
export { default as FakeAdInterstitial } from "./components/FakeAdInterstitial";
export { default as MathCaptchaGate } from "./components/MathCaptchaGate";
export { default as MirroredText } from "./components/MirroredText";
export { default as RandomLanguageSwitch } from "./components/RandomLanguageSwitch";
export { default as ShrinkingButton } from "./components/ShrinkingButton";
export { default as UnderwaterDistortion } from "./components/UnderwaterDistortion";
export {
  default as UnderwaterFilterDefs,
  UNDERWATER_FILTER_ID,
} from "./components/UnderwaterFilterDefs";

export {
  AD_VIDEOS,
  pickRandomAdVideo,
  type AdVideo,
} from "./adVideos";
export { useFakeAdCountdown } from "./hooks/useFakeAdCountdown";
export { useYouTubePlayer } from "./hooks/useYouTubePlayer";
export { useMathCaptcha, type MathCaptchaProblem } from "./hooks/useMathCaptcha";
export { useProximityShrink } from "./hooks/useProximityShrink";
export {
  useRandomLanguageSwitch,
  type LanguageCopy,
} from "./hooks/useRandomLanguageSwitch";
