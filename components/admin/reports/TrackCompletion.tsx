"use client";

import Link from "next/link";
import { ArrowRight, CircleDashed } from "lucide-react";
import type { AdminTrack } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { CardFooter, Empty, fmt, Pill, Section } from "./ui";

const BAR = ["#06b6d4", "#0e7490", "#0f766e", "#64748b", "#6b7280"];

/** Course Completion by Track: each track's progress bar, best first. */
export function TrackCompletion({
  tracks,
  error,
  onRetry,
}: {
  tracks: AdminTrack[] | null;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useT();
  const sorted = [...(tracks ?? [])].sort((a, b) => b.progress - a.progress);
  const enrolled = sorted.reduce((a, tr) => a + tr.students, 0);
  // Weighted by students so a big track counts more than an empty one.
  const pacing = enrolled ? Math.round(sorted.reduce((a, tr) => a + tr.progress * tr.students, 0) / enrolled) : null;

  return (
    <Section
      icon={CircleDashed}
      title={t("Course Completion by Track")}
      description={t("Average syllabus progress of the students in each track.")}
      aside={tracks && <Pill>{t("{count} tracks tracked", { count: sorted.length })}</Pill>}
      className="flex flex-col"
    >
      {!tracks ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : sorted.length === 0 ? (
        <Empty icon={CircleDashed} title={t("No tracks to show")} className="mt-[1em]" />
      ) : (
        <ul className="mt-[1em] flex-1 space-y-[1em]">
          {sorted.map((tr, i) => (
            <li key={tr.id}>
              <div className="flex items-center justify-between gap-[0.6em] text-[0.8em] font-semibold text-[#0b1b2b]">
                <span className="flex min-w-0 items-center gap-[0.5em]">
                  <span className="size-[0.6em] shrink-0 rounded-full" style={{ backgroundColor: BAR[Math.min(i, BAR.length - 1)] }} />
                  <span className="truncate">{tr.name}</span>
                </span>
                <span dir="ltr">{tr.progress}%</span>
              </div>
              <div className="mt-[0.35em] h-[0.55em] overflow-hidden rounded-full bg-[#e8eef5]">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.max(0, Math.min(100, tr.progress))}%`, backgroundColor: BAR[Math.min(i, BAR.length - 1)] }}
                />
              </div>
              <div className="mt-[0.3em] flex justify-between gap-[0.6em] text-[0.68em] text-[#8a97a6]">
                <span>{t("{count} enrolled", { count: fmt(tr.students) })}</span>
                {i === 0 && sorted.length > 1 ? (
                  <span className="font-semibold text-[#0b89a6]">{t("Top performing track")}</span>
                ) : (
                  <span>{t("{count} squads", { count: tr.squads })}</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <CardFooter>
        <span>
          {t("Average pacing")}: <b className="text-[#0b1b2b]">{pacing != null ? `${pacing}%` : "—"}</b>
        </span>
        <Link href="/admin/tracks" className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline">
          {t("Track details")} <ArrowRight className="size-[1em] rtl:rotate-180" />
        </Link>
      </CardFooter>
    </Section>
  );
}
