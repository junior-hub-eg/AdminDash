"use client";

import { Activity, BadgeCheck, ClipboardCheck, Users } from "lucide-react";
import type { AdminReport, SystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { StatCard, StatGrid } from "./page-parts";
import { DASH, fmt } from "./reports/ui";

/** The KPI strip of Analytics & Reports: all four numbers come from the API. */
export function ReportStats({ stats, system }: { stats: AdminReport["stats"] | null; system: SystemReport | null }) {
  const t = useT();
  const s = system?.students;
  const activeShare = s && s.total ? Math.round((s.activeLast30Days / s.total) * 100) : null;

  return (
    <StatGrid busy={!stats || !system}>
      <StatCard
        label={t("Active Students")}
        value={s ? fmt(s.activeLast30Days) : DASH}
        icon={Users}
        tone="cyan"
        badge={activeShare != null ? `${activeShare}%` : undefined}
        badgeTone="neutral"
        hint={s ? t("of {total} students active in the last 30 days", { total: fmt(s.total) }) : undefined}
      />
      <StatCard
        label={t("Course Completion Rate")}
        value={stats ? `${stats.completionRate}%` : DASH}
        icon={ClipboardCheck}
        tone="green"
        hint={t("For the selected period")}
      />
      <StatCard
        label={t("Average Student Score")}
        value={
          stats ? (
            <span dir="ltr">
              {stats.averageScore}
              <span className="text-[0.5em] font-semibold text-[#8a97a6]"> / 100</span>
            </span>
          ) : (
            DASH
          )
        }
        icon={BadgeCheck}
        tone="violet"
        badge={stats ? t("{count} certificates", { count: fmt(stats.certificatesIssued) }) : undefined}
        badgeTone="neutral"
        hint={t("For the selected period")}
      />
      <StatCard
        label={t("Active Engagement")}
        value={stats ? `${stats.activeEngagement}%` : DASH}
        icon={Activity}
        tone="amber"
        hint={t("For the selected period")}
      />
    </StatGrid>
  );
}
