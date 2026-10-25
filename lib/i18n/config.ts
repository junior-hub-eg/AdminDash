/** The two site languages. English is the default; Arabic turns the page right-to-left. */
export type Locale = "en" | "ar";

export const LOCALES: Locale[] = ["en", "ar"];
export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "jh_lang";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "ar";
}

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

/** The BCP 47 tag to format dates and numbers with. */
export function intlLocale(locale: Locale): string {
  // Arabic month and day names with the same 0-9 digits as the rest of the page.
  return locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
}
