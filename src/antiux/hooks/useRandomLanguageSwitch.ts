import { useEffect, useState } from "react";

export type LanguageCopy = Record<string, string>;

const pickRandomLanguage = (languages: string[], excluding?: string): string => {
  const candidates = languages.filter((language) => language !== excluding);
  const pool = candidates.length > 0 ? candidates : languages;
  return pool[Math.floor(Math.random() * pool.length)] as string;
};

/**
 * Cycles through the keys of `translations` at random, swapping the
 * "active" language every `intervalMs`. Returns the active language code
 * and its copy so callers can render whichever text is current — the
 * language switcher is itself a moving target.
 */
export const useRandomLanguageSwitch = (
  translations: LanguageCopy,
  intervalMs = 4000,
) => {
  const languages = Object.keys(translations);
  const languagesKey = languages.join(",");
  const [language, setLanguage] = useState(() => pickRandomLanguage(languages));

  useEffect(() => {
    const codes = languagesKey.split(",");
    if (codes.length <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setLanguage((current) => pickRandomLanguage(codes, current));
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, languagesKey]);

  return { language, text: translations[language] ?? "" };
};
