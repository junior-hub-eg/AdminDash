import { dateLocale } from "@/lib/i18n/translate";

export const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

export const shortDate = (iso: string) =>
  new Date(iso).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" });

export const dayTime = (iso: string) =>
  new Date(iso).toLocaleString(dateLocale("en-GB"), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

export const time = (iso: string) => new Date(iso).toLocaleTimeString(dateLocale("en-GB"), { hour: "2-digit", minute: "2-digit" });

/** "2026-11-05" (a date without time) as a short date. */
export const plainDate = (day: string) => shortDate(`${day}T12:00:00`);

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
