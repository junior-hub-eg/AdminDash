import { ar } from "./ar";
import type { Locale } from "./config";

export type TVars = Record<string, string | number | null | undefined>;
export type TFunction = (text: string, vars?: TVars) => string;

/**
 * Translations are keyed by the English text itself, so English needs no dictionary
 * and a missing Arabic entry falls back to English instead of breaking the page.
 * `{name}` placeholders are filled from `vars`.
 */
export function translate(locale: Locale, text: string, vars?: TVars): string {
  const out = locale === "ar" ? (ar[text] ?? text) : text;
  if (!vars) return out;
  return out.replace(/\{(\w+)\}/g, (m, key: string) => (vars[key] == null ? m : String(vars[key])));
}

/**
 * The language the page is showing, read from <html lang>. For code outside React
 * (API helpers, error messages) that runs in the browser; on the server it is English.
 */
export function currentLocale(): Locale {
  return typeof document !== "undefined" && document.documentElement.lang === "ar" ? "ar" : "en";
}

/**
 * The locale to format dates with: Arabic when the page is Arabic, otherwise the English
 * format the caller asked for (for example "en-GB" for "24 Oct").
 */
export function dateLocale(english = "en-US"): string {
  return currentLocale() === "ar" ? "ar-EG-u-nu-latn" : english;
}

/** `t()` for code outside React; see currentLocale(). */
export function tNow(text: string, vars?: TVars): string {
  return translate(currentLocale(), text, vars);
}

export function makeT(locale: Locale): TFunction {
  return (text, vars) => translate(locale, text, vars);
}

/**
 * Marks a text defined outside a component (a nav label, a constant) as translatable.
 * It returns the text unchanged; translate it where it is shown with `t(label)`.
 */
export const tk = (text: string): string => text;
