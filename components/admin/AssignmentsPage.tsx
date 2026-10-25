"use client";

import { CheckCircle2, Clock, FileText, Star } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { getAdminSubmissions, getSubmissionsByTrack } from "@/lib/admin-api";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";

const BADGE = {
  Submitted: "bg-[#cfeedd] text-[#2f9a5f]",
  Pending: "bg-[#fdeeb8] text-[#b7840f]",
};

/** The admin only follows the totals: mentors review the submissions (review notes, 25 Oct 2026). */

export default function AssignmentsPage() {
  const t = useT();
  const { data } = useAdminData(getAdminSubmissions, tk("Could not load the submissions."));
  const byTrack = useAdminData(getSubmissionsByTrack, tk("Could not load the submissions."));
  const stats = data?.stats;
  const STATS = [
    { icon: FileText, label: "Total Submissions", value: stats ? stats.totalSubmissions.toLocaleString() : "–", color: "#14365a" },
    { icon: CheckCircle2, label: "Avg Score", value: stats?.avgScore ?? "–", color: "#2f9a5f" },
    { icon: Clock, label: "Pending Review", value: stats ? stats.pendingReview.toLocaleString() : "–", color: "#d9822b" },
    { icon: Star, label: "Approved", value: stats ? stats.approved.toLocaleString() : "–", color: "#d9a21b" },
  ];

  return (
    <AdminPage>
      <AdminHero>
        <h1 className="text-[2.2em] font-bold leading-tight text-[#0f7378]">{t("Assignments & Submissions")}</h1>

        <ul className="mt-[0.7em] grid max-w-[56em] grid-cols-2 gap-[0.9em] lg:grid-cols-4">
          {STATS.map((s) => (
            <li key={s.label} className="flex items-center gap-[0.7em] rounded-[0.9em] border border-white/50 bg-white/55 px-[0.9em] py-[0.7em] backdrop-blur-[3px]">
              <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.5em] bg-white/85">
                <s.icon className="size-[1.2em]" style={{ color: s.color }} />
              </span>
              <span className="leading-tight">
                <span className="block text-[0.6em] text-[#14365a]/70">{t(s.label)}</span>
                <span className="block text-[1.15em] font-bold text-[#0b1b2b]">{s.value}</span>
              </span>
            </li>
          ))}
        </ul>
      </AdminHero>

      <AdminBody>
        <section className="rounded-[1.3em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
          <header>
            <h2 className="text-[0.95em] font-bold text-[#0b1b2b]">{t("Submissions by track")}</h2>
            <p className="text-[0.72em] text-[#14365a]/60">
              {t("Mentors review and grade the squads' work. Here you follow how each track is doing.")}
            </p>
          </header>

          {!byTrack.data ? (
            <LoadState error={byTrack.error} onRetry={byTrack.reload} />
          ) : byTrack.data.length === 0 ? (
            <p className="py-[2em] text-center text-[0.8em] text-[#14365a]/60">{t("No submissions yet.")}</p>
          ) : (
            <div className="mt-[0.8em] overflow-x-auto">
              <table className="w-full min-w-[40em] text-start text-[0.75em]">
                <thead>
                  <tr className="text-[0.9em] font-medium text-[#14365a]/60">
                    <th className="py-[0.6em] pe-[1em] text-start font-medium">{t("Track")}</th>
                    <th className="py-[0.6em] pe-[1em] text-start font-medium">{t("Squads")}</th>
                    <th className="py-[0.6em] pe-[1em] text-start font-medium">{t("Submitted")}</th>
                    <th className="py-[0.6em] pe-[1em] text-start font-medium">{t("In review")}</th>
                    <th className="py-[0.6em] pe-[1em] text-start font-medium">{t("Approved")}</th>
                    <th className="w-[12em] py-[0.6em] text-start font-medium">{t("Approval rate")}</th>
                  </tr>
                </thead>
                <tbody>
                  {byTrack.data.map((r) => {
                    const rate = r.submitted ? Math.round((r.approved / r.submitted) * 100) : 0;
                    return (
                      <tr key={r.trackCode} className="border-t border-[#eef2f6]">
                        <td className="py-[0.8em] pe-[1em] font-semibold text-[#0b1b2b]">{r.trackName}</td>
                        <td className="py-[0.8em] pe-[1em] text-[#14365a]/80">{r.squads}</td>
                        <td className="py-[0.8em] pe-[1em] text-[#14365a]/80">{r.submitted}</td>
                        <td className="py-[0.8em] pe-[1em]">
                          <span className={`inline-block rounded-full px-[0.9em] py-[0.15em] text-[0.85em] font-semibold ${BADGE.Pending}`}>{r.inReview}</span>
                        </td>
                        <td className="py-[0.8em] pe-[1em]">
                          <span className={`inline-block rounded-full px-[0.9em] py-[0.15em] text-[0.85em] font-semibold ${BADGE.Submitted}`}>{r.approved}</span>
                        </td>
                        <td className="py-[0.8em]">
                          <span className="flex items-center gap-[0.6em]">
                            <span className="h-[0.5em] flex-1 overflow-hidden rounded-full bg-[#e7eef6]">
                              <span className="block h-full rounded-full bg-[#2f9a5f]" style={{ width: `${rate}%` }} />
                            </span>
                            <span className="w-[3em] text-end font-semibold text-[#0b1b2b]">{rate}%</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </AdminBody>
    </AdminPage>
  );
}