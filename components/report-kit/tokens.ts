/**
 * Report design kit: shared look and small helpers.
 *
 * The kit is shared by the admin, mentor and teacher dashboards so their reports look alike.
 * It only depends on React, lucide-react and `useT()`/`useI18n()` from lib/i18n/client.
 *
 * - CARD / BTN_* / FIELD: class names of the white card, buttons and inputs.
 * - SERIES_COLORS: chart palette, cyan first.
 * - fmtNumber(n): Latin digits, grouped (1,120).
 * - changePct(current, previous): % change, or null when there is nothing to compare with.
 * - Date helpers for yyyy-MM-dd strings (the API's date format).
 */

export const CARD = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] bg-[#06b6d4] px-[1.1em] py-[0.6em] text-[0.82em] font-semibold text-white shadow-[0_6px_16px_rgba(6,182,212,0.35)] hover:bg-[#0aa5c0] disabled:cursor-not-allowed disabled:opacity-50";

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] border border-[#dfe7f1] bg-white px-[1em] py-[0.6em] text-[0.82em] font-semibold text-[#14365a] hover:bg-[#f1f6fb] disabled:cursor-not-allowed disabled:opacity-50";

export const FIELD =
  "h-[2.6em] min-w-0 rounded-[0.7em] border border-[#e1e8f0] bg-white px-[0.9em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40 disabled:opacity-60";

export const SERIES_COLORS = ["#06b6d4", "#6366f1", "#14b8a6", "#f59e0b", "#ec4899", "#0f5f73", "#64748b"];

export const DASH = "—";

export const fmtNumber = (n: number) => (Number.isFinite(n) ? Math.round(n * 10) / 10 : 0).toLocaleString("en");

/** % change from previous to current; null when previous is 0 (nothing to compare with). */
export function changePct(current: number, previous: number | null | undefined): number | null {
  if (previous == null || previous === 0) return null;
  return ((current - previous) / Math.abs(previous)) * 100;
}

/** A Date as yyyy-MM-dd in local time. */
export function isoDay(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** yyyy-MM-dd as a local Date (midnight). */
export function parseDay(s: string) {
  const [y, m, d] = s.slice(0, 10).split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/** Whole days from `from` to `to`, both included. */
export function daysBetween(from: string, to: string) {
  return Math.round((parseDay(to).getTime() - parseDay(from).getTime()) / 86_400_000) + 1;
}

/** "12 Oct 2026" in the page language (Latin digits in Arabic too). */
export function fmtDay(s: string, intl: string, withYear = true) {
  return parseDay(s).toLocaleDateString(intl, { day: "numeric", month: "short", ...(withYear ? { year: "numeric" } : {}) });
}

/** "12 Oct – 18 Oct 2026". */
export function fmtRange(from: string, to: string, intl: string) {
  return `${fmtDay(from, intl, false)} – ${fmtDay(to, intl)}`;
}
