"use client";

import Link from "next/link";
import { ArrowRight, CircleDashed } from "lucide-react";
import type { AdminTrack } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { BarList, EmptyState, fmtNumber, ReportCard, StateBlock } from "@/components/report-kit";
import { CardFooter, Pill } from "./ui";

/** Course Completion by Track: each track's average syllabus progress, best first. */
export function TrackCompletion({ tracks, error, onRetry }: { tracks: AdminTrack[] | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  const sorted = [...(tracks ?? [])].sort((a, b) => b.progress - a.progress);
  const enrolled = sorted.reduce((a, tr) => a + tr.students, 0);
  // Weighted by students so a big track counts more than an empty one.
  const pacing = enrolled ? Math.round(sorted.reduce((a, tr) => a + tr.progress * tr.students, 0) / enrolled) : null;

  return (
    <ReportCard
      icon={CircleDashed}
      title={t("Course Completion by Track")}
      description={t("Average syllabus progress of the students in each track.")}
      aside={tracks && <Pill>{t("{count} tracks tracked", { count: sorted.length })}</Pill>}
      className="flex flex-col"
    >
      <div className="mt-[1em] flex-1">
        {!tracks ? (
          <StateBlock error={error} onRetry={onRetry} />
        ) : sorted.length === 0 ? (
          <EmptyState icon={CircleDashed} title={t("No tracks to show")} />
        ) : (
          <BarList
            label={t("Course Completion by Track")}
            items={sorted.map((tr) => ({
              key: tr.id,
              label: tr.name,
              value: tr.progress,
              href: `/admin/tracks/${tr.id}`,
              hint: t("{count} enrolled · {squads} squads", { count: fmtNumber(tr.students), squads: tr.squads }),
            }))}
          />
        )}
      </div>
      <CardFooter>
        <span>
          {t("Average pacing")}: <b className="text-[#0b1b2b]">{pacing != null ? `${pacing}%` : "—"}</b>
        </span>
        <Link href="/admin/tracks" className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline print:hidden">
          {t("Track details")} <ArrowRight className="size-[1em]" />
        </Link>
      </CardFooter>
    </ReportCard>
  );
}
