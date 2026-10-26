"use client";

import { Flag } from "lucide-react";
import type { CountItem } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { DonutChart, EmptyState, fmtNumber, ReportCard, StateBlock } from "@/components/report-kit";
import { CardFooter, Pill } from "./ui";

const COLORS = ["#06b6d4", "#6366f1", "#14b8a6", "#f59e0b", "#94a3b8"];

/** Level distribution: how many students sit at each level (system report students.byLevel). */
export function LevelDonut({ levels, error, onRetry }: { levels: CountItem[] | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  const items = levels ?? [];
  const total = items.reduce((a, l) => a + l.count, 0);

  return (
    <ReportCard
      icon={Flag}
      title={t("Level distribution")}
      description={t("Students at each learning level across all tracks.")}
      aside={levels && <Pill tone="green">{t("{count} students placed", { count: fmtNumber(total) })}</Pill>}
      className="flex flex-col"
    >
      <div className="mt-[1em] flex flex-1 items-center">
        {!levels ? (
          <StateBlock error={error} onRetry={onRetry} className="w-full" />
        ) : total === 0 ? (
          <EmptyState icon={Flag} title={t("No students placed on a level yet")} className="w-full" />
        ) : (
          <DonutChart
            label={t("Level distribution")}
            colors={COLORS}
            centerLabel={t("Students")}
            items={items.map((l) => ({ key: l.key, label: t(l.key), value: l.count }))}
          />
        )}
      </div>
      <CardFooter>
        <span>{t("Levels come from the placement test and level exams.")}</span>
      </CardFooter>
    </ReportCard>
  );
}
