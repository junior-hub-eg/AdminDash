"use client";

import { useState } from "react";
import { TrendingUp } from "lucide-react";
import type { SystemReport } from "@/lib/admin-api";
import type { ReportTrends, TrendKey } from "@/lib/admin-reports-api";
import { useT } from "@/lib/i18n/client";
import { DASH, EmptyState, fmtNumber, ReportCard, StateBlock, TrendChart } from "@/components/report-kit";
import { TREND_METRICS } from "./ReportStats";

/** Weekly trends of the selected range (reports/trends), with metric toggles, plus a strip of live totals. */
export function ReportCharts({
  trends,
  system,
  error,
  onRetry,
}: {
  trends: ReportTrends | null;
  system: SystemReport | null;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useT();
  const [active, setActive] = useState<string[]>(["activeStudents", "lessonsPassed", "tasksDone"] satisfies TrendKey[]);
  const empty = trends && trends.series.every((p) => TREND_METRICS.every((m) => !p.values[m.key]));

  const strip = [
    { label: t("Active in the last 7 days"), value: system ? fmtNumber(system.students.activeLast7Days) : DASH, hint: t("students") },
    { label: t("Lessons completed"), value: system ? fmtNumber(system.learning.lessonsCompletedLast30Days) : DASH, hint: t("in the last 30 days") },
    {
      label: t("Squad tasks done"),
      value: system ? fmtNumber(system.squads.tasksDone) : DASH,
      hint: system ? t("of {total} tasks", { total: fmtNumber(system.squads.tasksTotal) }) : "",
    },
    { label: t("Completed sessions"), value: system ? fmtNumber(system.mentorship.sessionsCompleted) : DASH, hint: t("all time") },
  ];

  return (
    <ReportCard icon={TrendingUp} title={t("Weekly trends")} description={t("Week by week across the selected range. Pick the metrics to compare.")}>
      <div className="mt-[1em]">
        {!trends ? (
          <StateBlock error={error} onRetry={onRetry} className="min-h-[15em]" />
        ) : empty ? (
          <EmptyState icon={TrendingUp} title={t("No activity in this range yet.")} className="min-h-[15em]" />
        ) : (
          <TrendChart
            points={trends.series}
            metrics={TREND_METRICS.map((m) => ({ key: m.key, label: t(m.label) }))}
            active={active}
            onActiveChange={setActive}
            label={t("Weekly trends")}
          />
        )}
      </div>

      <dl className="mt-[1em] grid grid-cols-2 gap-[1em] rounded-[0.9em] bg-[#f5f8fe] p-[1em] lg:grid-cols-4">
        {strip.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="text-[0.62em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">{s.label}</dt>
            <dd className="mt-[0.2em] text-[1.05em] font-bold text-[#0b1b2b]">{s.value}</dd>
            <dd className="text-[0.68em] text-[#0b89a6]">{s.hint}</dd>
          </div>
        ))}
      </dl>
    </ReportCard>
  );
}
