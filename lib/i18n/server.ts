import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, isLocale, type Locale } from "./config";
import { makeT, type TFunction } from "./translate";

/** The language the visitor picked (from the language cookie), for Server Components. */
export async function getLocale(): Promise<Locale> {
  const value = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** `t()` for Server Components. */
export async function getT(): Promise<TFunction> {
  return makeT(await getLocale());
}
