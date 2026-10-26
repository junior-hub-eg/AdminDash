"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BadgeCheck, Download, Gauge, UserPlus, UserX } from "lucide-react";
import { getAdminMentors, getApprovals, type AdminMentor, type AdminMentorsPage } from "@/lib/admin-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";
import { MentorStats } from "./MentorStats";
import { MentorsTable } from "./MentorsTable";
import { UnassignedStudents } from "./UnassignedStudents";
import { UpcomingSessions } from "./mentors/UpcomingSessions";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

/** Downloads the mentors as a CSV file that opens in Excel. */
function exportRoster(mentors: AdminMentor[]) {
  // A leading = + - @ would run as a formula in Excel, so it gets a quote in front.
  const esc = (v: string | number) => {
    const s = String(v);
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const head = ["Name", "Email", "Track", "Title", "Students", "Squads", "Rating", "Status"];
  const rows = mentors.map((m) => [
    m.fullName,
    m.email ?? "",
    m.trackName,
    m.title,
    m.students,
    m.monitoredSquads,
    m.rating,
    m.isActive ? "Active" : "Inactive",
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "mentors-roster.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Donut({ segments, label, sub }: { segments: { value: number; color: string }[]; label: string; sub: string }) {
  const r = 38;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  return (
    <div className="relative mx-auto size-[11em] shrink-0">
      <svg viewBox="0 0 120 120" className="size-full" role="img" aria-label={`${label} ${sub}`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e6edf3" strokeWidth="14" />
        <g transform="rotate(-90 60 60)">
          {total > 0 &&
            segments.map((s, i) => {
              const len = (s.value / total) * c;
              const start = (segments.slice(0, i).reduce((a, p) => a + p.value, 0) / total) * c;
              return (
                <circle
                  key={i}
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={`${Math.max(len - 1.5, 0)} ${c - len + 1.5}`}
                  strokeDashoffset={-start}
                />
              );
            })}
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <span>
          <span className="block text-[1.6em] font-extrabold leading-none text-[#0b1b2b]">{label}</span>
          <span className="block text-[0.6em] font-semibold uppercase text-[#8a97a6]">{sub}</span>
        </span>
      </div>
    </div>
  );
}

export default function AdminMentors() {
  const { t } = useI18n();
  const page = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const approvals = useAdminData(getApprovals, tk("We couldn't load the sign-ups. Please try again."));
  const [showUnassigned, setShowUnassigned] = useState(false);

  const mentors = page.data?.mentors ?? [];
  const applicants = (approvals.data ?? []).filter((a) => a.role === "Mentor");
  const pending = approvals.data ? applicants.length : null;

  // The cards follow the list, so they stay right after a mentor is activated or deactivated.
  const stats: AdminMentorsPage["stats"] | null = page.data
    ? { ...page.data.stats, totalMentors: mentors.length, activeMentors: mentors.filter((m) => m.isActive).length }
    : null;

  const onChanged = (updated: AdminMentor) =>
    page.setData((p) => (p ? { ...p, mentors: p.mentors.map((m) => (m.id === updated.id ? updated : m)) } : p));

  // Workload of the active mentors, from the squads each one monitors: none = available, 1-2 = balanced, more than 2 = high load.
  const working = mentors.filter((m) => m.isActive);
  const high = working.filter((m) => m.monitoredSquads > 2).length;
  const available = working.filter((m) => m.monitoredSquads === 0).length;
  const balanced = working.length - high - available;
  const optimal = working.length ? Math.round((balanced / working.length) * 100) : 0;

  return (
    <AdminPage>
      <div className="pt-[calc(var(--u)*5.4)]">
        {/* ---------- Header ---------- */}
        <section className="flex flex-wrap items-end justify-between gap-[1em]">
          <div>
            <nav aria-label={t("Breadcrumb")} className="text-[0.7em] font-medium text-[#5b6b7c]">
              <Link href={"/admin/dashboard" as Route} className="hover:underline">
                {t("Admin")}
              </Link>{" "}
              <span aria-hidden className="rtl:inline-block rtl:rotate-180">›</span> <span className="font-semibold text-[#0b6f86]">{t("Mentors Management")}</span>
            </nav>
            <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t("Mentors Management")}</h1>
            <p className="max-w-[34em] text-[0.85em] text-[#5b6b7c]">
              {t("Manage mentor allocations, track specialties, capacity, and student coaching sessions.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-[0.6em] text-[0.8em]">
            <button
              type="button"
              onClick={() => exportRoster(mentors)}
              disabled={mentors.length === 0}
              className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#e1e8f0] bg-white px-[1.1em] py-[0.6em] font-semibold text-[#14365a] shadow-sm hover:bg-[#f1f6fb] disabled:opacity-50"
            >
              <Download className="size-[1em]" /> {t("Export Roster")}
            </button>
            <button
              type="button"
              onClick={() => setShowUnassigned((v) => !v)}
              aria-expanded={showUnassigned}
              className={`inline-flex items-center gap-[0.4em] rounded-[0.6em] border px-[1em] py-[0.55em] font-medium ${
                showUnassigned ? "border-[#06b6d4] bg-[#e0f6fc] text-[#0b6f86]" : "border-[#d5dee8] bg-white text-[#14365a]"
              }`}
            >
              <UserX className="size-[1em]" /> {t("Students without a mentor")}
            </button>
            <Link
              href={"/admin/mentors/new" as Route}
              className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#06b6d4] px-[1.2em] py-[0.6em] font-semibold text-white shadow-[0_6px_16px_rgba(6,182,212,0.35)] hover:bg-[#0aa5c0]"
            >
              <UserPlus className="size-[1.1em]" /> {t("Add Mentor")}
            </Link>
          </div>
        </section>

        <MentorStats stats={stats} mentors={mentors} pending={pending} className="mt-[1.2em]" />

        {showUnassigned && (
          <div className="mt-[1.2em]">
            <UnassignedStudents mentors={mentors} onAssigned={page.reload} />
          </div>
        )}

        {/* ---------- Table + side column ---------- */}
        <section className="mt-[1.2em] grid gap-[1.2em] xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
          {page.data ? (
            <MentorsTable mentors={mentors} onChanged={onChanged} />
          ) : (
            <div className={card}>
              <LoadState error={page.error} onRetry={page.reload} />
            </div>
          )}

          <div className="grid min-w-0 content-start gap-[1.2em] md:grid-cols-2 xl:grid-cols-1">
            {/* Workload */}
            <article className={card}>
              <header className="flex items-start justify-between gap-[0.6em]">
                <h2 className="inline-flex items-center gap-[0.4em] text-[1.05em] font-bold text-[#0b1b2b]">
                  <Gauge className="size-[1.05em] text-[#06b6d4]" /> {t("Mentor Workload")}
                </h2>
                <span className="text-[0.65em] font-semibold uppercase tracking-[0.1em] text-[#5b6b7c]">{t("This Cohort")}</span>
              </header>
              <p className="mt-[0.3em] text-[0.75em] text-[#5b6b7c]">{t("Capacity distribution across all active technical tracks and study squads.")}</p>
              {page.data ? (
                <>
                  <div className="mt-[1em] flex flex-wrap items-center justify-center gap-[1.2em]">
                    <Donut
                      label={`${optimal}%`}
                      sub={t("Optimal")}
                      segments={[
                        { value: balanced, color: "#06b6d4" },
                        { value: available, color: "#14b8a6" },
                        { value: high, color: "#d92d2d" },
                      ]}
                    />
                    <ul className="space-y-[0.6em] text-[0.75em] text-[#14365a]">
                      <li className="flex items-center gap-[0.6em]">
                        <span className="size-[0.7em] rounded-full bg-[#06b6d4]" /> {t("Balanced (1-2 Squads)")}: <b>{balanced}</b>
                      </li>
                      <li className="flex items-center gap-[0.6em]">
                        <span className="size-[0.7em] rounded-full bg-[#14b8a6]" /> {t("Available Capacity")}: <b>{available}</b>
                      </li>
                      <li className="flex items-center gap-[0.6em]">
                        <span className="size-[0.7em] rounded-full bg-[#d92d2d]" /> {t("High Load (>2 Squads)")}: <b>{high}</b>
                      </li>
                    </ul>
                  </div>
                  <p className="mt-[1em] flex items-center justify-between rounded-[0.6em] bg-[#f4f7fb] px-[1em] py-[0.6em] text-[0.75em] text-[#5b6b7c]">
                    {t("Optimal Target per Mentor:")} <b className="text-[#0b6f86]">{t("8-12 Students")}</b>
                  </p>
                </>
              ) : (
                <LoadState error={page.error} onRetry={page.reload} />
              )}
            </article>

            <UpcomingSessions />

            {/* Recruitment pipeline */}
            <article className="rounded-[1.1em] bg-gradient-to-br from-[#0b1b2b] to-[#16314f] p-[1.3em] text-white shadow-[0_6px_22px_rgba(20,54,90,0.18)] md:col-span-2 xl:col-span-1">
              <p className="inline-flex items-center gap-[0.6em] text-[0.65em] font-bold uppercase tracking-[0.14em] text-[#2be3c4]">
                <span className="grid size-[2.2em] place-items-center rounded-[0.5em] bg-[#2be3c4]/15">
                  <BadgeCheck className="size-[1.3em]" />
                </span>
                {t("Recruitment Pipeline")}
              </p>
              <h2 className="mt-[0.4em] text-[1.3em] font-bold leading-tight">
                {pending === null
                  ? "—"
                  : pending === 0
                    ? t("No new mentor applications")
                    : t("{count} New Mentor Applications", { count: pending })}
              </h2>
              <p className="mt-[0.4em] text-[0.8em] text-white/70">{t("Mentor sign-ups wait for your approval before they can sign in.")}</p>
              <div className="mt-[1em] flex flex-wrap items-center justify-between gap-[0.8em]">
                <span className="flex -space-x-[0.5em] rtl:space-x-reverse">
                  {applicants.slice(0, 3).map((a) => (
                    <span key={a.id} title={a.fullName} className="grid size-[2.2em] place-items-center rounded-full border-2 border-[#14365a] bg-[#12939b] text-[0.7em] font-bold">
                      {initials(a.fullName)}
                    </span>
                  ))}
                  {applicants.length > 3 && (
                    <span className="grid size-[2.2em] place-items-center rounded-full border-2 border-[#14365a] bg-[#3d4f7c] text-[0.7em] font-bold">
                      +{applicants.length - 3}
                    </span>
                  )}
                </span>
                <Link
                  href={"/admin/approvals" as Route}
                  className="rounded-[0.5em] bg-[#2be3c4] px-[1.1em] py-[0.5em] text-[0.8em] font-bold text-[#0b1b2b] hover:bg-[#1fcfb2]"
                >
                  {t("Review Candidates")}
                </Link>
              </div>
            </article>
          </div>
        </section>
      </div>
    </AdminPage>
  );
}