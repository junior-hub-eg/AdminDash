"use client";

import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, ChevronRight, LoaderCircle, PieChart, Star, Trash2, TriangleAlert, UserPlus, UsersRound, Pencil } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { MentorPicture } from "../MentorsTable";
import { EmptyNote, Section, SOFT } from "../mentor-detail/parts";

/** Mentors whose track is this one (from the mentors list). */
export function AssignedMentorsCard({ mentors, lead }: { mentors: AdminMentor[] | null; lead: AdminMentor | null }) {
  const t = useT();
  const list = [...(mentors ?? [])].sort((a, b) => Number(b.id === lead?.id) - Number(a.id === lead?.id) || Number(b.isActive) - Number(a.isActive) || b.students - a.students);
  return (
    <Section
      title={t("Assigned Mentors")}
      icon={<UsersRound className="size-[1.1em]" />}
      action={<span className="text-[0.7em] text-[#5b6b7c]">{mentors ? t("{n} Total", { n: mentors.length }) : "—"}</span>}
    >
      {!mentors ? (
        <EmptyNote text={t("We couldn't load the mentors. Please try again.")} />
      ) : list.length === 0 ? (
        <EmptyNote text={t("No mentor teaches this track yet.")} />
      ) : (
        <ul className="grid gap-[0.6em]">
          {list.map((m) => (
            <li key={m.id}>
              <Link href={`/admin/mentors/${m.id}` as Route} className={`${SOFT} flex items-center gap-[0.8em] !p-[0.7em] text-[0.8em] hover:bg-[#e6f1fb]`}>
                <MentorPicture mentor={m} size="2.6em" />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-[#0b1b2b]">{m.fullName}</b>
                  <span className="block truncate text-[0.85em] text-[#5b6b7c]">
                    {m.id === lead?.id ? t("Lead Mentor") : m.isActive ? m.title || t("Mentor") : t("On Leave")} •{" "}
                    {t("{n} Squads", { n: m.monitoredSquads })} • {t("{count} students", { count: m.students })}
                  </span>
                </span>
                <span className="inline-flex items-center gap-[0.3em] text-[0.85em] font-semibold text-[#0b6f86]">
                  <Star className="size-[0.9em]" />
                  {m.rating.toFixed(2)}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link
        href={"/admin/mentors/new" as Route}
        className="mt-[0.8em] flex w-full items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#e6edfb] py-[0.7em] text-[0.8em] font-semibold text-[#14365a] hover:bg-[#dbe6f8]"
      >
        <UserPlus className="size-[1em]" /> {t("Assign New Track Mentor")}
      </Link>
    </Section>
  );
}

/** No demographics or tool-competency data in the API yet. */
export function DemographicsCard({ students }: { students: number }) {
  const t = useT();
  return (
    <Section
      title={t("Demographics & Software")}
      icon={<PieChart className="size-[1.1em]" />}
      action={<span className="text-[0.7em] text-[#5b6b7c]">{t("{n} Active", { n: students })}</span>}
    >
      <EmptyNote text={t("Age and tool-competency data isn't collected for this track yet.")} />
    </Section>
  );
}

/** No milestones API yet. */
export function UpcomingMilestonesCard() {
  const t = useT();
  return (
    <Section title={t("Upcoming Milestones")} icon={<CalendarDays className="size-[1.1em]" />}>
      <EmptyNote text={t("No upcoming milestones")} />
    </Section>
  );
}

export function TrackGovernance({ onEdit, onDelete, deleting, error }: { onEdit: () => void; onDelete: () => void; deleting: boolean; error: string | null }) {
  const t = useT();
  const row = "flex w-full items-center gap-[0.7em] rounded-[0.7em] px-[0.9em] py-[0.8em] text-start text-[0.8em] font-semibold disabled:opacity-60";
  return (
    <Section title={t("Track Governance & Export")}>
      <div className="grid gap-[0.6em]">
        <button type="button" onClick={onEdit} className={`${row} bg-[#f1f5fd] text-[#14365a] hover:bg-[#e6f1fb]`}>
          <Pencil className="size-[1.1em]" />
          <span className="flex-1">{t("Edit Track Details")}</span>
          <ChevronRight className="size-[1em] rtl:rotate-180" />
        </button>
        <button type="button" onClick={onDelete} disabled={deleting} className={`${row} bg-[#fdecec] text-[#b83232] hover:bg-[#fbe0e0]`}>
          {deleting ? <LoaderCircle className="size-[1.1em] animate-spin" /> : <Trash2 className="size-[1.1em]" />}
          <span className="flex-1">{t("Delete Track")}</span>
          <TriangleAlert className="size-[1em]" />
        </button>
        {error && (
          <p role="alert" className="text-[0.75em] font-semibold text-[#b83232]">
            {error}
          </p>
        )}
      </div>
    </Section>
  );
}
