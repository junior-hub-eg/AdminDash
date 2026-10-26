"use client";

import Link from "next/link";
import { ArrowRight, Headset, Star } from "lucide-react";
import type { AdminMentor, SystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { DASH, DataTable, fmtNumber, ReportCard, StateBlock } from "@/components/report-kit";
import { CardFooter, Pill } from "./ui";

/** Mentor workload: students, monitored squads and rating per mentor, sortable, with the mentorship totals on top. */
export function MentorWorkload({
  mentors,
  mentorship,
  error,
  onRetry,
}: {
  mentors: AdminMentor[] | null;
  mentorship: SystemReport["mentorship"] | null;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useT();
  const list = mentors ?? [];
  const active = list.filter((m) => m.isActive).length;
  const perMentor = mentorship && mentorship.activeMentors ? (mentorship.studentsWithMentor / mentorship.activeMentors).toFixed(1) : null;

  const tiles = [
    { label: t("Sessions"), value: mentorship ? fmtNumber(mentorship.sessionsCompleted) : DASH, hint: mentorship ? t("{count} upcoming", { count: fmtNumber(mentorship.sessionsUpcoming) }) : "" },
    { label: t("Students per mentor"), value: perMentor ?? DASH, hint: mentorship ? t("{count} without a mentor", { count: fmtNumber(mentorship.studentsWithoutMentor) }) : "" },
    { label: t("Average rating"), value: mentorship ? mentorship.averageRating.toFixed(2) : DASH, hint: t("Out of 5.0") },
  ];

  return (
    <ReportCard
      icon={Headset}
      title={t("Mentor Workload & Feedback")}
      description={t("Students, monitored squads and student ratings per mentor.")}
      aside={mentors && <Pill>{t("{count} active mentors", { count: active })}</Pill>}
      className="flex flex-col"
    >
      <dl className="mt-[1em] grid grid-cols-3 gap-[0.5em]">
        {tiles.map((x) => (
          <div key={x.label} className="min-w-0 rounded-[0.8em] bg-[#f5f8fe] px-[0.7em] py-[0.6em] text-center">
            <dt className="truncate text-[0.62em] font-semibold text-[#5b6b7c]">{x.label}</dt>
            <dd className="text-[1.15em] font-extrabold text-[#0b1b2b]">{x.value}</dd>
            <dd className="truncate text-[0.6em] text-[#0b89a6]">{x.hint}</dd>
          </div>
        ))}
      </dl>

      <div className="flex-1">
        {!mentors ? (
          <StateBlock error={error} onRetry={onRetry} className="mt-[1em]" />
        ) : (
          <DataTable
            label={t("Mentor Workload & Feedback")}
            rows={list}
            rowKey={(m) => m.id}
            defaultSort={{ key: "students", dir: "desc" }}
            empty={{ icon: Headset, title: t("No mentors in this track") }}
            columns={[
              {
                key: "name",
                header: t("Mentor"),
                sort: (m) => m.fullName,
                cell: (m) => (
                  <Link href={`/admin/mentors/${m.id}`} className="font-bold text-[#0b1b2b] hover:underline">
                    {m.fullName}
                    {!m.isActive && <span className="ms-[0.4em] text-[0.85em] font-medium text-[#8a97a6]">({t("Inactive")})</span>}
                  </Link>
                ),
              },
              { key: "track", header: t("Track"), sort: (m) => m.trackName, cell: (m) => m.trackName },
              { key: "students", header: t("Students"), align: "end", sort: (m) => m.students, cell: (m) => fmtNumber(m.students) },
              { key: "squads", header: t("Squads"), align: "end", sort: (m) => m.monitoredSquads, cell: (m) => fmtNumber(m.monitoredSquads) },
              {
                key: "rating",
                header: t("Rating"),
                align: "end",
                sort: (m) => m.rating,
                cell: (m) => (
                  <span className="inline-flex items-center gap-[0.25em] font-bold text-[#0b89a6]">
                    <Star className="size-[0.95em]" /> {m.rating ? m.rating.toFixed(2) : DASH}
                  </span>
                ),
              },
            ]}
          />
        )}
      </div>

      <CardFooter>
        <span>
          {t("Mentor feedbacks")}: <b className="text-[#0b1b2b]">{mentorship ? fmtNumber(mentorship.feedbacks) : DASH}</b>
        </span>
        <Link href="/admin/mentors" className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline print:hidden">
          {t("All mentors")} <ArrowRight className="size-[1em]" />
        </Link>
      </CardFooter>
    </ReportCard>
  );
}
