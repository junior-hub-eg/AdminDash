"use client";

import type { AuditSeverity } from "@/lib/admin-security-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import { Pill, type PillTone } from "../reports/ui";

/** "3h ago", "Yesterday"... */
export function ago(t: TFunction, iso: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return t("Just now");
  if (minutes < 60) return t("{count}m ago", { count: minutes });
  if (minutes < 1440) return t("{count}h ago", { count: Math.floor(minutes / 60) });
  const days = Math.floor(minutes / 1440);
  return days === 1 ? t("Yesterday") : t("{count}d ago", { count: days });
}

/** "26 Oct 2026, 14:05" in the page's language. */
export const stamp = (iso: string) =>
  new Date(iso).toLocaleString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

const SEVERITY_TONE: Record<AuditSeverity, PillTone> = { Info: "cyan", Warning: "amber", Critical: "red" };

export const SEVERITIES: AuditSeverity[] = ["Info", "Warning", "Critical"];
export const SEVERITY_LABEL: Record<AuditSeverity, string> = { Info: tk("Info"), Warning: tk("Warning"), Critical: tk("Critical") };

export function SeverityPill({ severity }: { severity: AuditSeverity }) {
  const t = useT();
  return <Pill tone={SEVERITY_TONE[severity] ?? "gray"}>{t(SEVERITY_LABEL[severity] ?? severity)}</Pill>;
}

/** A short browser / system name from a user agent ("Chrome on Windows"). */
export function deviceOf(t: TFunction, userAgent: string | null) {
  if (!userAgent) return t("Unknown device");
  const browser = /Edg\//.test(userAgent)
    ? "Edge"
    : /OPR\//.test(userAgent)
      ? "Opera"
      : /Firefox\//.test(userAgent)
        ? "Firefox"
        : /Chrome\//.test(userAgent)
          ? "Chrome"
          : /Safari\//.test(userAgent)
            ? "Safari"
            : null;
  const system = /Windows/.test(userAgent)
    ? "Windows"
    : /Android/.test(userAgent)
      ? "Android"
      : /iPhone|iPad/.test(userAgent)
        ? "iOS"
        : /Mac OS X/.test(userAgent)
          ? "macOS"
          : /Linux/.test(userAgent)
            ? "Linux"
            : null;
  if (browser && system) return t("{browser} on {system}", { browser, system });
  return browser ?? system ?? userAgent.slice(0, 40);
}

/** Module names as the backend sends them, marked for translation. */
export const MODULE_LABEL: Record<string, string> = {
  Students: tk("Students"),
  Squads: tk("Squads"),
  Mentors: tk("Mentors"),
  Tracks: tk("Tracks"),
  Roles: tk("Roles"),
  Admins: tk("Admins"),
  Announcements: tk("Announcements"),
  Settings: tk("Settings"),
  Approvals: tk("Approvals"),
  Certificates: tk("Certificates"),
  Rewards: tk("Rewards"),
  Security: tk("Security"),
  Auth: tk("Sign-in"),
};

export const moduleLabel = (t: TFunction, module: string) => t(MODULE_LABEL[module] ?? module);

/** The audit entry's summary in the page's language ("Created in Squads (squads / tasks)"). */
export function summaryOf(t: TFunction, e: { summary: string; module: string; action: string; statusCode: number }) {
  if (e.module === "Auth") return e.statusCode < 400 ? t("Admin signed in") : t("Admin sign-in failed ({status})", { status: e.statusCode });
  const method = e.action.split(" ")[0];
  const verb =
    method === "POST" ? t("Created") : method === "DELETE" ? t("Deleted") : method === "PUT" || method === "PATCH" ? t("Updated") : method;
  const detail = e.summary.match(/\(([^()]*)\)/)?.[1];
  const text = t("{verb} in {module}", { verb, module: moduleLabel(t, e.module) }) + (detail && !/^\d+$/.test(detail) ? ` (${detail})` : "");
  return e.statusCode < 400 ? text : t("Failed: {text} ({status})", { text, status: e.statusCode });
}
