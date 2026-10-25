"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Download, Plus, UserX, Video } from "lucide-react";
import { getAdminMentors, getApprovals, type AdminMentor, type AdminMentorsPage } from "@/lib/admin-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";
import { MentorStats } from "./MentorStats";
import { MentorsTable } from "./MentorsTable";
import { UnassignedStudents } from "./UnassignedStudents";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** TEMPORARY: the API has no session list yet (only a count). Replace with a real endpoint, then delete. */
const MOCK_SESSIONS = [
  { title: tk("Design Critique: Checkout Flow"), who: "Dr. Tarek Fayed · Design Masters", time: "04:00 PM - 05:30 PM", tag: tk("Today"), action: tk("Join Room") },
  { title: tk("Go Microservices Debugging"), who: "Eng. Khaled Mostafa · Server Squad", time: "06:30 PM - 07:30 PM", tag: tk("Tomorrow"), action: tk("Link Active") },
  { title: tk("React State Management Lab"), who: "Eng. Mona Zaki · Code Crew", time: "05:00 PM - 06:30 PM", tag: tk("Oct 24"), action: tk("Auto-calendar sync") },
];

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

  // Workload from the squads each mentor monitors: none = available, 1-2 = balanced, more than 2 = high load.
  const high = mentors.filter((m) => m.monitoredSquads > 2).length;
  const available = mentors.filter((m) => m.monitoredSquads === 0).length;
  const balanced = mentors.length - high - available;
  const optimal = mentors.length ? Math.round((balanced / mentors.length) * 100) : 0;

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
              <span aria-hidden>›</span> <span className="text-[#14365a]">{t("Mentors Management")}</span>
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
              className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#d5dee8] bg-white px-[1em] py-[0.55em] font-medium text-[#14365a] disabled:opacity-50"
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
              className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#1d6fe0] px-[1.1em] py-[0.55em] font-semibold text-white hover:bg-[#1859b5]"
            >
              <Plus className="size-[1.1em]" /> {t("Add Mentor")}
            </Link>
          </div>
        </section>

        <MentorStats stats={stats} pending={pending} className="mt-[1.2em]" />

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
              <h2 className="text-[1.05em] font-bold text-[#14365a]">{t("Mentor Workload")}</h2>
              <p className="text-[0.75em] text-[#8a97a6]">{t("Capacity distribution across all active technical tracks and study squads.")}</p>
              {page.data ? (
                <>
                  <div className="mt-[1em] flex flex-wrap items-center justify-center gap-[1.2em]">
                    <Donut
                      label={`${optimal}%`}
                      sub={t("Optimal")}
                      segments={[
                        { value: balanced, color: "#06b6d4" },
                        { value: available, color: "#7fddc9" },
                        { value: high, color: "#d92d2d" },
                      ]}
                    />
                    <ul className="space-y-[0.6em] text-[0.75em] text-[#14365a]">
                      <li className="flex items-center gap-[0.6em]">
                        <span className="size-[0.7em] rounded-full bg-[#06b6d4]" /> {t("Balanced (1-2 Squads)")}: <b>{balanced}</b>
                      </li>
                      <li className="flex items-center gap-[0.6em]">
                        <span className="size-[0.7em] rounded-full bg-[#7fddc9]" /> {t("Available Capacity")}: <b>{available}</b>
                      </li>
                      <li className="flex items-center gap-[0.6em]">
                        <span className="size-[0.7em] rounded-full bg-[#d92d2d]" /> {t("High Load (>2 Squads)")}: <b>{high}</b>
                      </li>
                    </ul>
                  </div>
                  <p className="mt-[1em] flex items-center justify-between rounded-[0.6em] bg-[#f4f7fb] px-[1em] py-[0.6em] text-[0.75em] text-[#5b6b7c]">
                    {t("Optimal Target per Mentor:")} <b className="text-[#1d6fe0]">{t("8-12 Students")}</b>
                  </p>
                </>
              ) : (
                <LoadState error={page.error} onRetry={page.reload} />
              )}
            </article>

            {/* Upcoming sessions */}
            <article className={card}>
              <header className="flex items-center justify-between gap-[0.6em]">
                <h2 className="text-[1.05em] font-bold text-[#14365a]">{t("Upcoming Sessions")}</h2>
                {stats && (
                  <span className="rounded-full bg-[#eaf1fd] px-[0.7em] py-[0.15em] text-[0.75em] font-semibold text-[#1d6fe0]">
                    {stats.upcomingSessions}
                  </span>
                )}
              </header>
              <ul className="mt-[0.8em] space-y-[0.6em]">
                {MOCK_SESSIONS.map((s) => (
                  <li key={s.title} className="rounded-[0.7em] bg-[#f4f7fb] p-[0.8em] text-[0.75em]">
                    <div className="flex items-start justify-between gap-[0.6em]">
                      <p className="font-bold text-[#0b1b2b]">{t(s.title)}</p>
                      <span className="shrink-0 rounded-full bg-[#dbe8fb] px-[0.6em] py-[0.1em] text-[0.85em] font-semibold text-[#14365a]">{t(s.tag)}</span>
                    </div>
                    <p className="mt-[0.2em] text-[#5b6b7c]">{s.who}</p>
                    <p className="mt-[0.5em] flex items-center justify-between text-[#14365a]">
                      <span>{s.time}</span>
                      <span className="inline-flex items-center gap-[0.3em] font-semibold text-[#1d6fe0]">
                        {s.action === "Join Room" && <Video className="size-[1em]" />} {t(s.action)}
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            </article>

            {/* Recruitment pipeline */}
            <article className="rounded-[1.1em] bg-gradient-to-br from-[#0b1b2b] to-[#14365a] p-[1.2em] text-white shadow-[0_6px_22px_rgba(20,54,90,0.18)] md:col-span-2 xl:col-span-1">
              <p className="text-[0.65em] font-bold uppercase tracking-[0.18em] text-[#7fddc9]">{t("Recruitment Pipeline")}</p>
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