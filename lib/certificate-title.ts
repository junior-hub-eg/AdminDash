/** Certificate titles are written by the backend in English; these patterns give the Arabic one. */
import type { TFunction } from "@/lib/i18n/translate";

export function certificateTitle(title: string, t: TFunction): string {
  let m = /^Capstone Project: (.+)$/.exec(title);
  if (m) return t("Capstone Project: {x}", { x: m[1] });
  m = /^(.+) Capstone Project$/.exec(title);
  if (m) return t("{x} Capstone Project", { x: t(m[1]) });
  m = /^(.+) Track Completion$/.exec(title);
  if (m) return t("{x} Track Completion", { x: t(m[1]) });
  return t(title);
}
