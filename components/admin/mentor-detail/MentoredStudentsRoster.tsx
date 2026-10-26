"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Flame, Search } from "lucide-react";
import type { AdminMentorStudent } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { INPUT } from "../page-parts";
import { LoadState } from "../admin-data";
import { Avatar, shortDate } from "../squad-detail/parts";
import { EmptyNote, Section } from "./parts";

/** The mentor's students (GET /admin/mentors/{id}/students). `limit` cuts the list on the overview. */
export function MentoredStudentsRoster({
  students,
  error,
  onRetry,
  limit,
  onViewAll,
}: {
  students: AdminMentorStudent[] | null;
  error: string | null;
  onRetry: () => void;
  limit?: number;
  onViewAll: () => void;
}) {
  const t = useT();
  const [q, setQ] = useState("");
  const all = students ?? [];
  const query = q.trim().toLowerCase();
  const matches = all.filter((s) => !query || s.fullName.toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
  const rows = limit ? matches.slice(0, limit) : matches;

  return (
    <Section
      title={t("Mentored Students Roster")}
      sub={t("Tracking individual student progress, XP and streaks")}
      action={
        <label className="relative">
          <Search className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Filter student...")} aria-label={t("Filter student...")} className={`${INPUT} ps-[2.3em]`} />
        </label>
      }
    >
      {!students ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : all.length === 0 ? (
        <EmptyNote text={t("No students are assigned to this mentor yet.")} />
      ) : rows.length === 0 ? (
        <EmptyNote text={t("No students match your search.")} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[40em] text-start text-[0.8em]">
            <thead>
              <tr className="bg-[#eef4fb] text-[0.8em] font-bold uppercase tracking-[0.05em] text-[#14365a]/75">
                <th className="rounded-s-[0.6em] px-[1em] py-[0.9em] text-start">{t("Student Profile")}</th>
                <th className="px-[1em] py-[0.9em] text-start">{t("Grade & Class")}</th>
                <th className="px-[1em] py-[0.9em] text-start">{t("Total XP")}</th>
                <th className="px-[1em] py-[0.9em] text-start">{t("Streak")}</th>
                <th className="px-[1em] py-[0.9em] text-start">{t("Last Active")}</th>
                <th className="rounded-e-[0.6em] px-[1em] py-[0.9em] text-end">{t("Quick Actions")}</th>
              </tr>
            </thead>
            <tbody className="text-[#14365a]">
              {rows.map((s) => (
                <tr key={s.id} className="border-b border-[#eef2f6] last:border-0">
                  <td className="px-[1em] py-[0.9em]">
                    <span className="flex items-center gap-[0.7em]">
                      <Avatar name={s.fullName} photoUrl={s.photoUrl} className="size-[2.4em]" />
                      <span className="min-w-0">
                        <b className="block text-[#0b1b2b]">{s.fullName}</b>
                        <span dir="ltr" className="block truncate text-[0.85em] text-[#8a97a6] rtl:text-end">{s.email}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-[1em]">
                    <b className="block text-[#0b6f86]">{s.grade != null ? t("Grade {n}", { n: s.grade }) : "—"}</b>
                    <span className="text-[0.85em] text-[#8a97a6]">{s.className ?? ""}</span>
                  </td>
                  <td className="px-[1em] font-semibold">{s.totalXp.toLocaleString()} XP</td>
                  <td className="px-[1em]">
                    <span className="inline-flex items-center gap-[0.3em] font-semibold text-[#12676b]">
                      <Flame className="size-[1em]" /> {t("{n} days", { n: s.streakDays })}
                    </span>
                  </td>
                  <td className="px-[1em] text-[#5b6b7c]">{shortDate(s.lastActiveDate)}</td>
                  <td className="px-[1em] text-end">
                    <Link
                      href={`/admin/students/${s.id}` as Route}
                      className="inline-block rounded-[0.4em] bg-[#eaf1fd] px-[0.8em] py-[0.35em] font-semibold text-[#1d6fe0] hover:bg-[#dbe8fb]"
                    >
                      {t("Progress")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {students && all.length > 0 && (
        <p className="mt-[1em] flex flex-wrap justify-between gap-[0.5em] text-[0.75em] text-[#5b6b7c]">
          <span>{t("Showing {n} of {total} active students", { n: rows.length, total: all.length })}</span>
          {limit && all.length > limit && (
            <button type="button" onClick={onViewAll} className="font-semibold text-[#0b6f86] hover:underline">
              {t("View All {total} Mentored Students", { total: all.length })} <span className="inline-block rtl:rotate-180">›</span>
            </button>
          )}
        </p>
      )}
    </Section>
  );
}
