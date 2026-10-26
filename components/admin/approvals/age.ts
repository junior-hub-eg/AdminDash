import type { Priority } from "./types";

/** A request should be decided within this many hours. */
export const SLA_HOURS = 48;

export const ageHours = (iso: string, now: number) => Math.max(0, (now - new Date(iso).getTime()) / 3_600_000);

/** Waiting time as "42m", "5h", "3d". */
export function shortSpan(hours: number) {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))}m`;
  if (hours < 48) return `${Math.round(hours)}h`;
  return `${Math.round(hours / 24)}d`;
}

/** Older than the SLA: urgent; past half of it: medium; else normal. */
export function priorityFor(hours: number): Priority {
  if (hours >= SLA_HOURS) return "urgent";
  if (hours >= SLA_HOURS / 2) return "medium";
  return "normal";
}
