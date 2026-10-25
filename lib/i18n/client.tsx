"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, dirOf, intlLocale, type Locale } from "./config";
import { makeT, type TFunction } from "./translate";

type I18n = {
  locale: Locale;
  dir: "rtl" | "ltr";
  /** The BCP 47 tag for toLocaleDateString / Intl. */
  intl: string;
  t: TFunction;
  setLocale: (locale: Locale) => void;
};

const I18nContext = createContext<I18n | null>(null);

export function LanguageProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = next;
      document.documentElement.dir = dirOf(next);
      setLocaleState(next);
      // Server Components read the cookie, so re-render them in the new language.
      router.refresh();
    },
    [router],
  );

  const value = useMemo<I18n>(
    () => ({ locale, dir: dirOf(locale), intl: intlLocale(locale), t: makeT(locale), setLocale }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside <LanguageProvider>");
  return ctx;
}

/** Shorthand for components that only need `t()`. */
export function useT(): TFunction {
  return useI18n().t;
}
