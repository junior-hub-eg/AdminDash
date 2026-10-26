"use client";

import Link from "next/link";
import { ArrowRight, Headset, Star } from "lucide-react";
import type { AdminMentor, SystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { CardFooter, DASH, Empty, fmt, Initials, Pill, Section } from "./ui";

/** Mentor Workload & Feedback: the busiest mentors with their students, squads and rating. */
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
  const list = [...(mentors ?? [])].sort((a, b) => b.students + b.monitoredSquads - (a.students + a.monitoredSquads)).slice(0, 5);
  const active = (mentors ?? []).filter((m) => m.isActive).length;
  const perMentor = mentorship && mentorship.activeMentors ? (mentorship.studentsWithMentor / mentorship.activeMentors).toFixed(1) : null;

  const tiles = [
    {
      label: t("Sessions"),
      value: mentorship ? fmt(mentorship.sessionsCompleted) : DASH,
      hint: mentorship ? t("{count} upcoming", { count: fmt(mentorship.sessionsUpcoming) }) : "",
    },
    {
      label: t("Students per mentor"),
      value: perMentor ?? DASH,
      hint: mentorship ? t("{count} without a mentor", { count: fmt(mentorship.studentsWithoutMentor) }) : "",
    },
    {
      label: t("Average rating"),
      value: mentorship ? mentorship.averageRating.toFixed(2) : DASH,
      hint: t("Out of 5.0"),
    },
  ];

  return (
    <Section
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

      {!mentors ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : list.length === 0 ? (
        <Empty icon={Headset} title={t("No mentors in this track")} className="mt-[1em] flex-1" />
      ) : (
        <ul className="mt-[0.8em] flex-1 space-y-[0.5em]">
          {list.map((m) => (
            <li key={m.id}>
              <Link
                href={`/admin/mentors/${m.id}`}
                className="flex items-center gap-[0.7em] rounded-[0.8em] border border-[#e6edf3] px-[0.8em] py-[0.55em] hover:bg-[#f5f8fe]"
              >
                <Initials name={m.fullName} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8em] font-bold text-[#0b1b2b]">
                    {m.fullName} <span className="font-medium text-[#5b6b7c]">({m.trackName})</span>
                  </span>
                  <span className="block truncate text-[0.68em] text-[#8a97a6]">
                    {t("{students} students • {squads} squads", { students: m.students, squads: m.monitoredSquads })}
                  </span>
                </span>
                <span className="inline-flex items-center gap-[0.25em] text-[0.8em] font-bold text-[#0b89a6]">
                  <Star className="size-[0.95em]" /> {m.rating ? m.rating.toFixed(2) : DASH}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      <CardFooter>
        <span>
          {t("Mentor feedbacks")}: <b className="text-[#0b1b2b]">{mentorship ? fmt(mentorship.feedbacks) : DASH}</b>
        </span>
        <Link href="/admin/mentors" className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline">
          {t("All mentors")} <ArrowRight className="size-[1em] rtl:rotate-180" />
        </Link>
      </CardFooter>
    </Section>
  );
}
