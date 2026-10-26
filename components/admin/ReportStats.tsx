"use client";

import { Activity, BadgeCheck, CalendarCheck, ClipboardCheck, FileCheck2, GraduationCap, ListChecks, Sparkles, UserPlus, Users, type LucideIcon } from "lucide-react";
import type { AdminReport } from "@/lib/admin-api";
import type { ReportTrends, TrendKey } from "@/lib/admin-reports-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { KpiCard, KpiGrid, StateBlock } from "@/components/report-kit";

/** The trend metrics, in the order the KPI row and the chart legend show them. */
export const TREND_METRICS: { key: TrendKey; label: string; icon: LucideIcon }[] = [
  { key: "activeStudents", label: tk("Active students"), icon: Users },
  { key: "newStudents", label: tk("New students"), icon: UserPlus },
  { key: "lessonsPassed", label: tk("Lessons passed"), icon: GraduationCap },
  { key: "tasksDone", label: tk("Squad tasks done"), icon: ListChecks },
  { key: "submissions", label: tk("Assignment submissions"), icon: FileCheck2 },
  { key: "sessionsCompleted", label: tk("Mentor sessions completed"), icon: CalendarCheck },
  { key: "xpAwarded", label: tk("XP awarded"), icon: Sparkles },
];

/** KPI row: the selected range against the same length of time before it (reports/trends). */
export function TrendKpis({ trends, error, onRetry }: { trends: ReportTrends | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  if (error && !trends) return <StateBlock error={error} onRetry={onRetry} />;
  return (
    <KpiGrid busy={!trends}>
      {TREND_METRICS.map((m) => (
        <KpiCard
          key={m.key}
          label={t(m.label)}
          icon={m.icon}
          value={trends ? (trends.current[m.key] ?? 0) : null}
          previous={trends ? (trends.previous[m.key] ?? 0) : null}
        />
      ))}
    </KpiGrid>
  );
}

const PERIOD_LABEL: Record<AdminReport["period"], string> = {
  Week: tk("Last 7 days"),
  Month: tk("Last 30 days"),
  Year: tk("Last 12 months"),
};

/** Learning quality for the closest standard period (reports?period=), with no comparison. */
export function QualityKpis({ report, error, onRetry }: { report: AdminReport | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  const s = report?.stats;
  const hint = report ? t("Learning quality · {period}", { period: t(PERIOD_LABEL[report.period]) }) : undefined;
  if (error && !report) return <StateBlock error={error} onRetry={onRetry} />;
  return (
    <KpiGrid busy={!report}>
      <KpiCard label={t("Course Completion Rate")} icon={ClipboardCheck} value={s ? s.completionRate : null} format={(n) => `${n}%`} hint={hint} />
      <KpiCard label={t("Average Student Score")} icon={BadgeCheck} value={s ? s.averageScore : null} format={(n) => `${n} / 100`} hint={hint} />
      <KpiCard label={t("Active Engagement")} icon={Activity} value={s ? s.activeEngagement : null} format={(n) => `${n}%`} hint={hint} />
      <KpiCard label={t("Certificates issued")} icon={BadgeCheck} value={s ? s.certificatesIssued : null} hint={hint} />
    </KpiGrid>
  );
}
