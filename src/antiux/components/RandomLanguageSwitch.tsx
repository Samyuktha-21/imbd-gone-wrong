import type { HTMLAttributes } from "react";
import {
  useRandomLanguageSwitch,
  type LanguageCopy,
} from "../hooks/useRandomLanguageSwitch";

type RandomLanguageSwitchProps = Omit<
  HTMLAttributes<HTMLSpanElement>,
  "children"
> & {
  translations?: LanguageCopy;
  intervalMs?: number | undefined;
};

const DEFAULT_TRANSLATIONS: LanguageCopy = {
  en: "Welcome back",
  es: "Bienvenido de nuevo",
  ja: "おかえりなさい",
  fr: "Content de vous revoir",
};

/**
 * Renders a random language from `translations` and re-rolls to a
 * different one every `intervalMs`. There is no stable language switcher —
 * the current language is itself a moving target.
 */
const RandomLanguageSwitch = ({
  translations = DEFAULT_TRANSLATIONS,
  intervalMs,
  ...spanProps
}: RandomLanguageSwitchProps) => {
  const { language, text } = useRandomLanguageSwitch(translations, intervalMs);

  return (
    <span
      {...spanProps}
      data-testid="random-language-switch"
      data-language={language}
      lang={language}
    >
      {text}
    </span>
  );
};

export default RandomLanguageSwitch;
