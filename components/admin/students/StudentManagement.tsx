"use client";

import { useCallback, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CircleX,
  Clock,
  Eye,
  Layers,
  ListFilter,
  Network,
  PieChart,
  Plus,
  Search,
  UserCheck,
  UserPlus,
  UserRound,
  UsersRound,
  UserX,
} from "lucide-react";
import { getAdminStudents, getPlatformActivity, type AdminStudent, type TrackLevel } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";
import { AdminSurface, PANEL } from "../page-parts";
import { StudentAvatar } from "../StudentsTable";
import { AddStudentDialog } from "./AddStudentDialog";

type Tab = "all" | "track" | "squad" | "active" | "inactive";

const PALETTE = ["#d946ef", "#06b6d4", "#10b981", "#f59e0b", "#3b82f6", "#ef4444", "#8b5cf6", "#94a3b8"];
const CHIP: Record<number, string> = {
  0: "border-[#f0abfc] bg-[#fdf4ff] text-[#a21caf]",
  1: "border-[#a5f3fc] bg-[#ecfeff] text-[#0e7490]",
  2: "border-[#a7f3d0] bg-[#ecfdf5] text-[#047857]",
  3: "border-[#fde68a] bg-[#fffbeb] text-[#b45309]",
  4: "border-[#bfdbfe] bg-[#eff6ff] text-[#1d4ed8]",
  5: "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]",
  6: "border-[#ddd6fe] bg-[#f5f3ff] text-[#6d28d9]",
  7: "border-[#e2e8f0] bg-[#f8fafc] text-[#475569]",
};
const LEVELS: TrackLevel[] = ["Beginner", "Intermediate", "Advanced"];
const SELECT =
  "h-[2.4em] rounded-[0.6em] border border-[#e1e8f0] bg-white px-[0.8em] text-[0.78em] text-[#14365a] outline-none focus:ring-2 focus:ring-[#3b82f6]/30";

const sameMonth = (iso: string | null, d: Date) => {
  if (!iso) return false;
  const x = new Date(iso);
  return x.getFullYear() === d.getFullYear() && x.getMonth() === d.getMonth();
};

/** Student Management per the design: stats, tabs and filters, the student table, distribution, grades and recent activity. */
export default function StudentManagement() {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const list = useAdminData(getAdminStudents, tk("We couldn't load the students. Please try again."));
  const feed = useAdminData(useCallback(() => getPlatformActivity(5), []), tk("We couldn't load the activity. Please try again."));

  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [track, setTrack] = useState(params.get("track") ?? "all");
  const [squad, setSquad] = useState("all");
  const [status, setStatus] = useState("all");
  const [level, setLevel] = useState("all");
  const [grade, setGrade] = useState("all");
  const [moreFilters, setMoreFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  const [now] = useState(() => new Date());

  const students = useMemo(() => list.data ?? [], [list.data]);
  const tracks = useMemo(() => {
    const m = new Map<string, { name: string; count: number }>();
    for (const s of students) if (s.trackCode) m.set(s.trackCode, { name: s.trackName ?? s.trackCode, count: (m.get(s.trackCode)?.count ?? 0) + 1 });
    return [...m.entries()].sort((a, b) => b[1].count - a[1].count);
  }, [students]);
  const colorOf = (code: string | null) => {
    const i = tracks.findIndex(([c]) => c === code);
    return i < 0 ? 7 : i % 7;
  };
  const squads = useMemo(() => [...new Set(students.map((s) => s.squadName).filter((x): x is string => !!x))].sort(), [students]);
  const grades = useMemo(() => [...new Set(students.map((s) => s.grade).filter((x): x is number => x != null))].sort((a, b) => a - b), [students]);

  // Stats
  const total = students.length;
  const active = students.filter((s) => s.status === "Active").length;
  const inactive = students.filter((s) => s.status === "Inactive").length;
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const newThisMonth = students.filter((s) => sameMonth(s.joinedUtc, now)).length;
  const newLastMonth = students.filter((s) => sameMonth(s.joinedUtc, lastMonth)).length;
  const newChange = newLastMonth ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100) : null;
  const pct = (n: number) => (total ? Math.round((n / total) * 1000) / 10 : 0);

  const q = query.trim().toLowerCase();
  const filtered = students.filter(
    (s) =>
      (tab !== "active" || s.status === "Active") &&
      (tab !== "inactive" || s.status === "Inactive") &&
      (track === "all" || s.trackCode === track) &&
      (squad === "all" || s.squadName === squad) &&
      (status === "all" || s.status === status) &&
      (level === "all" || s.level === level) &&
      (grade === "all" || String(s.grade) === grade) &&
      (!q || [s.fullName, s.email ?? "", s.squadName ?? "", s.trackName ?? ""].some((v) => v.toLowerCase().includes(q))),
  );
  const sorted =
    tab === "track"
      ? [...filtered].sort((a, b) => (a.trackName ?? "~").localeCompare(b.trackName ?? "~") || a.fullName.localeCompare(b.fullName))
      : tab === "squad"
        ? [...filtered].sort((a, b) => (a.squadName ?? "~").localeCompare(b.squadName ?? "~") || a.fullName.localeCompare(b.fullName))
        : [...filtered].sort((a, b) => (b.joinedUtc ?? "").localeCompare(a.joinedUtc ?? ""));

  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const current = Math.min(page, pages);
  const from = (current - 1) * pageSize;
  const visible = sorted.slice(from, from + pageSize);
  const numbers = pageNumbers(current, pages);

  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };
  const allChecked = visible.length > 0 && visible.every((s) => checked.has(s.id));

  const TABS: { key: Tab; label: string; icon: typeof UserRound; count?: number; tone?: string }[] = [
    { key: "all", label: tk("All Students"), icon: UserRound, count: total },
    { key: "track", label: tk("By Track"), icon: Layers },
    { key: "squad", label: tk("By Squad"), icon: Network },
    { key: "active", label: tk("Active"), icon: CircleCheck, count: active, tone: "text-[#16a34a]" },
    { key: "inactive", label: tk("Inactive"), icon: CircleX, count: inactive, tone: "text-[#e11d48]" },
  ];

  return (
    <AdminSurface>
      {/* Hero */}
      <section className="flex flex-wrap items-center justify-between gap-[1em] rounded-[1.2em] bg-gradient-to-r from-[#e0f7fd] via-[#eef8fd] to-[#f3f8fe] px-[2em] py-[1.8em] shadow-[0_6px_22px_rgba(20,54,90,0.06)]">
        <div>
          <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t("Student Management")}</h1>
          <p className="mt-[0.3em] text-[0.88em] text-[#3d4f61]">{t("View, manage, and support all students across tracks and squads.")}</p>
        </div>
        <div className="flex items-center gap-[1.4em]">
          <span className="relative hidden h-[5.6em] w-[5.6em] overflow-hidden rounded-[0.4em] bg-[#cfe6f2] shadow-sm sm:block">
            <Image src="/images/avatars/girl-1-reading.webp" alt="" fill sizes="96px" className="object-cover object-top" />
          </span>
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-[0.5em] rounded-[0.7em] bg-[#1d6fe0] px-[1.3em] py-[0.75em] text-[0.85em] font-semibold text-white shadow-[0_6px_16px_rgba(29,111,224,0.35)] hover:bg-[#1859b5]"
          >
            <Plus className="size-[1.1em]" /> {t("Add Student")}
          </button>
        </div>
      </section>

      {/* Stats */}
      <ul className="grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4" aria-busy={!list.data}>
        <Stat label={t("Total Students")} value={list.data ? total.toLocaleString("en") : "—"} icon={UsersRound} tone="bg-[#e0f2fe] text-[#0284c7]"
          delta={newThisMonth ? `+${newThisMonth}` : undefined} up hint={t("this month")} />
        <Stat label={t("Active Students")} value={list.data ? active.toLocaleString("en") : "—"} icon={UserCheck} tone="bg-[#dcfce7] text-[#16a34a]"
          delta={`${pct(active)}%`} up hint={t("of total")} />
        <Stat label={t("Inactive Students")} value={list.data ? inactive.toLocaleString("en") : "—"} icon={UserX} tone="bg-[#fef3c7] text-[#d97706]"
          delta={`${pct(inactive)}%`} hint={t("Need attention")} />
        <Stat label={t("New Students")} value={list.data ? newThisMonth.toLocaleString("en") : "—"} icon={UserPlus} tone="bg-[#f3e8ff] text-[#9333ea]"
          delta={newChange == null ? undefined : `${Math.abs(newChange)}%`} up={(newChange ?? 0) >= 0} hint={t("This month")} />
      </ul>

      <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2.3fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-[1em]">
          {/* Tabs */}
          <div role="tablist" className="flex flex-wrap items-center gap-[0.4em] border-b border-[#e3ebf3] pb-[0.6em] text-[0.8em]">
            {TABS.map((x) => {
              const on = tab === x.key;
              const Icon = x.icon;
              return (
                <button
                  key={x.key}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => reset(setTab)(x.key)}
                  className={`inline-flex items-center gap-[0.5em] rounded-[0.6em] px-[1em] py-[0.55em] font-semibold ${
                    on ? "bg-[#1d6fe0] text-white shadow-sm" : "text-[#3d4f61] hover:bg-white"
                  }`}
                >
                  <Icon className={`size-[1.1em] ${on ? "" : x.tone ?? ""}`} />
                  {t(x.label)}
                  {x.count != null && (
                    <span className={`rounded-full px-[0.6em] text-[0.85em] ${on ? "bg-white/20" : `bg-[#eef3f9] ${x.tone ?? "text-[#3d4f61]"}`}`}>
                      {x.count.toLocaleString("en")}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <section className={`${PANEL} grid gap-[0.7em] p-[0.9em]`}>
            <label className="relative">
              <span className="sr-only">{t("Search students...")}</span>
              <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />
              <input
                type="search"
                value={query}
                onChange={(e) => reset(setQuery)(e.target.value)}
                placeholder={t("Search students...")}
                className="h-[2.6em] w-full rounded-[0.6em] border border-[#e1e8f0] bg-[#f8fafc] ps-[2.5em] pe-[1em] text-[0.8em] outline-none focus:ring-2 focus:ring-[#3b82f6]/30"
              />
            </label>
            <div className="flex flex-wrap gap-[0.5em]">
              <select value={track} onChange={(e) => reset(setTrack)(e.target.value)} aria-label={t("Track")} className={SELECT}>
                <option value="all">{t("All Tracks")}</option>
                {tracks.map(([code, v]) => (
                  <option key={code} value={code}>
                    {t(v.name)}
                  </option>
                ))}
              </select>
              <select value={squad} onChange={(e) => reset(setSquad)(e.target.value)} aria-label={t("Squad")} className={SELECT}>
                <option value="all">{t("All Squads")}</option>
                {squads.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <select value={status} onChange={(e) => reset(setStatus)(e.target.value)} aria-label={t("Status")} className={SELECT}>
                <option value="all">{t("All Status")}</option>
                {(["Active", "Inactive", "Pending"] as const).map((s) => (
                  <option key={s} value={s}>
                    {t(s)}
                  </option>
                ))}
              </select>
              <select value={level} onChange={(e) => reset(setLevel)(e.target.value)} aria-label={t("Level")} className={SELECT}>
                <option value="all">{t("All Levels")}</option>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {t(l)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setMoreFilters((v) => !v)}
                aria-expanded={moreFilters}
                className={`${SELECT} inline-flex items-center gap-[0.4em] ${moreFilters ? "border-[#3b82f6] bg-[#eff6ff]" : "bg-[#f1f5f9]"}`}
              >
                <ListFilter className="size-[1em]" /> {t("More Filters")}
              </button>
              {moreFilters && (
                <select value={grade} onChange={(e) => reset(setGrade)(e.target.value)} aria-label={t("Grade")} className={SELECT}>
                  <option value="all">{t("All Grades")}</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>
                      {t("Grade {grade}", { grade: g })}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </section>

          {/* Table */}
          <section className={`${PANEL} min-w-0 overflow-hidden`}>
            {!list.data ? (
              <LoadState error={list.error} onRetry={list.reload} />
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[54em] text-start text-[0.8em]">
                    <thead>
                      <tr className="border-b border-[#eef2f6] text-[0.85em] font-bold uppercase tracking-wider text-[#5b6b7c]">
                        <th className="w-[3em] px-[1em] py-[1em]">
                          <input
                            type="checkbox"
                            aria-label={t("Select all")}
                            checked={allChecked}
                            onChange={() =>
                              setChecked((c) => {
                                const next = new Set(c);
                                for (const s of visible) {
                                  if (allChecked) next.delete(s.id);
                                  else next.add(s.id);
                                }
                                return next;
                              })
                            }
                            className="size-[1.1em] accent-[#1d6fe0]"
                          />
                        </th>
                        <th className="px-[0.8em] text-start">{t("Student")}</th>
                        <th className="px-[0.8em] text-start">{t("Track")}</th>
                        <th className="px-[0.8em] text-start">{t("Squad")}</th>
                        <th className="px-[0.8em] text-start">{t("Level")}</th>
                        <th className="px-[0.8em] text-start">{t("Status")}</th>
                        <th className="px-[0.8em] text-start">{t("Join Date")}</th>
                        <th className="px-[0.8em] text-end">{t("Actions")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visible.map((s, i) => (
                        <Row
                          key={s.id}
                          s={s}
                          index={from + i}
                          chip={CHIP[colorOf(s.trackCode)]}
                          checked={checked.has(s.id)}
                          onCheck={() =>
                            setChecked((c) => {
                              const next = new Set(c);
                              if (next.has(s.id)) next.delete(s.id);
                              else next.add(s.id);
                              return next;
                            })
                          }
                        />
                      ))}
                      {visible.length === 0 && (
                        <tr>
                          <td colSpan={8} className="py-[2.5em] text-center text-[#8a97a6]">
                            {students.length === 0 ? t("No students yet.") : t("No students match your filters.")}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <footer className="flex flex-wrap items-center justify-between gap-[0.8em] border-t border-[#eef2f6] px-[1em] py-[0.8em] text-[0.78em] text-[#5b6b7c]">
                  <span>
                    {t("Showing {from}–{to} of {total} students", {
                      from: sorted.length ? from + 1 : 0,
                      to: from + visible.length,
                      total: sorted.length.toLocaleString("en"),
                    })}
                  </span>
                  <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
                    <PageBtn label={t("Previous page")} disabled={current <= 1} onClick={() => setPage(current - 1)}>
                      <ChevronLeft className="size-[1.1em] rtl:rotate-180" />
                    </PageBtn>
                    {numbers.map((n, i) =>
                      n === "…" ? (
                        <span key={`gap-${i}`} className="px-[0.4em]">
                          …
                        </span>
                      ) : (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          aria-current={n === current ? "page" : undefined}
                          className={`grid h-[2.2em] min-w-[2.2em] place-items-center rounded-[0.4em] px-[0.4em] font-semibold ${
                            n === current ? "bg-[#1d6fe0] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"
                          }`}
                        >
                          {n}
                        </button>
                      ),
                    )}
                    <PageBtn label={t("Next page")} disabled={current >= pages} onClick={() => setPage(current + 1)}>
                      <ChevronRight className="size-[1.1em] rtl:rotate-180" />
                    </PageBtn>
                  </nav>
                  <label className="flex items-center gap-[0.5em]">
                    {t("Rows per page")}
                    <select
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                      }}
                      className="h-[2.2em] rounded-[0.4em] border border-[#e1e8f0] bg-white px-[0.5em]"
                    >
                      {[8, 16, 32].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </footer>
              </>
            )}
          </section>
        </div>

        {/* Right column */}
        <div className="grid min-w-0 gap-[1.2em] md:grid-cols-2 xl:grid-cols-1">
          <Distribution
            total={total}
            rows={tracks.map(([code, v], i) => ({ key: code, name: t(v.name), count: v.count, color: PALETTE[i % 7] }))}
            withoutTrack={students.filter((s) => !s.trackCode).length}
          />
          <GradeBars students={students} />
          <section className={`${PANEL} p-[1.2em] md:col-span-2 xl:col-span-1`}>
            <header className="mb-[0.9em] flex items-center justify-between">
              <h2 className="flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
                <Clock className="size-[1.1em] text-[#1d6fe0]" /> {t("Recent Activities")}
              </h2>
              <Link href={"/admin/security" as Route} className="inline-flex items-center gap-[0.3em] text-[0.78em] font-semibold text-[#1d6fe0] hover:underline">
                {t("View All")} <ArrowRight className="size-[1em] rtl:rotate-180" />
              </Link>
            </header>
            {!feed.data ? (
              <LoadState error={feed.error} onRetry={feed.reload} />
            ) : feed.data.length === 0 ? (
              <p className="py-[1em] text-center text-[0.8em] text-[#8a97a6]">{t("Nothing yet.")}</p>
            ) : (
              <ul className="grid gap-[0.9em]">
                {feed.data.map((f, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => router.push(`/admin/students/${f.studentId}` as Route)}
                      className="flex w-full items-start gap-[0.7em] text-start"
                    >
                      <StudentAvatar student={{ photoUrl: f.photoUrl, gender: null }} index={i} size="2.3em" />
                      <span className="min-w-0 flex-1 text-[0.78em]">
                        <span className="block text-[#14365a]">
                          <b className="text-[#0b1b2b]">{f.studentName}</b> {f.text}
                        </span>
                        {f.trackName && <span className="block text-[0.9em] text-[#8a97a6]">{t(f.trackName)}</span>}
                      </span>
                      <span className="shrink-0 text-[0.7em] text-[#8a97a6]">{ago(f.createdUtc, t)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {adding && <AddStudentDialog onClose={() => setAdding(false)} onAdded={() => void list.reload()} />}
    </AdminSurface>
  );
}

function Stat({
  label,
  value,
  icon: Icon,
  tone,
  delta,
  up,
  hint,
}: {
  label: string;
  value: string;
  icon: typeof UsersRound;
  tone: string;
  delta?: string;
  up?: boolean;
  hint: string;
}) {
  return (
    <li className={`${PANEL} flex items-start justify-between gap-[0.8em] p-[1.2em]`}>
      <div className="min-w-0">
        <p className="text-[0.78em] font-semibold text-[#3d4f61]">{label}</p>
        <p className="mt-[0.3em] text-[1.8em] font-extrabold leading-none text-[#0b1b2b]">{value}</p>
        <p className="mt-[0.6em] flex flex-wrap items-center gap-[0.4em] text-[0.72em] text-[#8a97a6]">
          {delta && (
            <span className={`inline-flex items-center gap-[0.15em] font-bold ${up ? "text-[#16a34a]" : "text-[#e11d48]"}`}>
              {up ? <ArrowUp className="size-[1em]" /> : <ArrowDown className="size-[1em]" />}
              {delta}
            </span>
          )}
          {hint}
        </p>
      </div>
      <span className={`grid size-[3em] shrink-0 place-items-center rounded-[0.8em] ${tone}`}>
        <Icon className="size-[1.4em]" />
      </span>
    </li>
  );
}

function Row({ s, index, chip, checked, onCheck }: { s: AdminStudent; index: number; chip: string; checked: boolean; onCheck: () => void }) {
  const t = useT();
  const statusTone = s.status === "Active" ? "text-[#16a34a]" : s.status === "Inactive" ? "text-[#e11d48]" : "text-[#d97706]";
  return (
    <tr className="border-b border-[#f1f5f9] align-middle last:border-0 hover:bg-[#f8fbff]">
      <td className="px-[1em] py-[0.8em]">
        <input type="checkbox" aria-label={t("Select {name}", { name: s.fullName })} checked={checked} onChange={onCheck} className="size-[1.1em] accent-[#1d6fe0]" />
      </td>
      <td className="px-[0.8em]">
        <Link href={`/admin/students/${s.id}` as Route} className="flex items-center gap-[0.7em]">
          <StudentAvatar student={s} index={index} size="2.4em" />
          <span className="min-w-0">
            <span className="block font-bold text-[#0b1b2b] hover:underline">{s.fullName}</span>
            {s.email && (
              <span dir="ltr" className="block truncate text-[0.88em] text-[#8a97a6] rtl:text-end">
                {s.email}
              </span>
            )}
          </span>
        </Link>
      </td>
      <td className="px-[0.8em]">
        {s.trackName ? (
          <span className={`inline-block rounded-full border px-[0.8em] py-[0.15em] text-[0.88em] font-semibold ${chip}`}>{t(s.trackName)}</span>
        ) : (
          <span className="text-[#8a97a6]">—</span>
        )}
      </td>
      <td className="px-[0.8em] text-[#3d4f61]">{s.squadName ?? "—"}</td>
      <td className="px-[0.8em]">
        {s.level ? (
          <span className="rounded-[0.4em] bg-[#eff6ff] px-[0.6em] py-[0.15em] text-[0.88em] font-semibold text-[#1d4ed8]">{t(s.level)}</span>
        ) : (
          <span className="text-[#8a97a6]">—</span>
        )}
      </td>
      <td className="px-[0.8em]">
        <span className={`inline-flex items-center gap-[0.4em] font-semibold ${statusTone}`}>
          <span className="size-[0.45em] rounded-full bg-current" />
          {t(s.status)}
        </span>
      </td>
      <td className="px-[0.8em] text-[#3d4f61]">
        {s.joinedUtc ? new Date(s.joinedUtc).toLocaleDateString(dateLocale("en-US"), { month: "short", day: "numeric", year: "numeric" }) : "—"}
      </td>
      <td className="px-[0.8em] text-end">
        <Link
          href={`/admin/students/${s.id}` as Route}
          aria-label={t("View Profile")}
          title={t("View Profile")}
          className="inline-grid size-[2em] place-items-center rounded-full text-[#1d6fe0] hover:bg-[#eff6ff]"
        >
          <Eye className="size-[1.1em]" />
        </Link>
      </td>
    </tr>
  );
}

function Distribution({
  total,
  rows,
  withoutTrack,
}: {
  total: number;
  rows: { key: string; name: string; count: number; color: string }[];
  withoutTrack: number;
}) {
  const t = useT();
  const top = rows.slice(0, 4);
  const rest = rows.slice(4).reduce((n, r) => n + r.count, 0) + withoutTrack;
  const shown = rest ? [...top, { key: "other", name: t("Other"), count: rest, color: "#94a3b8" }] : top;
  const r = 38;
  const c = 2 * Math.PI * r;
  const sum = shown.reduce((n, x) => n + x.count, 0);

  return (
    <section className={`${PANEL} p-[1.2em]`}>
      <h2 className="mb-[0.9em] flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
        <PieChart className="size-[1.1em] text-[#1d6fe0]" /> {t("Students Distribution")}
      </h2>
      <div className="flex flex-wrap items-center gap-[1.2em]">
        <div className="relative size-[8.5em] shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={t("Students Distribution")}>
            <circle cx="60" cy="60" r={r} fill="none" stroke="#eef3f9" strokeWidth="16" />
            {sum > 0 &&
              shown.map((x, i) => {
                const len = (x.count / sum) * c;
                const start = (shown.slice(0, i).reduce((n, p) => n + p.count, 0) / sum) * c;
                return (
                  <circle key={x.key} cx="60" cy="60" r={r} fill="none" stroke={x.color} strokeWidth="16"
                    strokeDasharray={`${Math.max(len - 1, 0)} ${c - len + 1}`} strokeDashoffset={-start} />
                );
              })}
          </svg>
          <span className="absolute inset-0 grid place-items-center text-center">
            <span>
              <b className="block text-[1.1em] text-[#0b1b2b]">{total.toLocaleString("en")}</b>
              <span className="text-[0.62em] text-[#8a97a6]">{t("Students")}</span>
            </span>
          </span>
        </div>
        <ul className="grid min-w-[10em] flex-1 gap-[0.5em] text-[0.75em]">
          {shown.map((x) => (
            <li key={x.key} className="flex items-center gap-[0.5em]">
              <span className="size-[0.7em] shrink-0 rounded-full" style={{ background: x.color }} />
              <span className="flex-1 text-[#3d4f61]">{x.name}</span>
              <b className="text-[#0b1b2b]">{total ? Math.round((x.count / total) * 100) : 0}%</b>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function GradeBars({ students }: { students: AdminStudent[] }) {
  const t = useT();
  const byGrade = new Map<number, number>();
  for (const s of students) if (s.grade != null) byGrade.set(s.grade, (byGrade.get(s.grade) ?? 0) + 1);
  const bars = [...byGrade.entries()].sort((a, b) => a[0] - b[0]);
  const max = Math.max(1, ...bars.map(([, n]) => n));
  const peak = bars.reduce((p, b) => (b[1] > (p?.[1] ?? -1) ? b : p), bars[0]);

  return (
    <section className={`${PANEL} p-[1.2em]`}>
      <h2 className="mb-[0.9em] flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
        <BarChart3 className="size-[1.1em] text-[#1d6fe0]" /> {t("Students by Grade Level")}
      </h2>
      {bars.length === 0 ? (
        <p className="py-[1.5em] text-center text-[0.8em] text-[#8a97a6]">{t("No grade data yet.")}</p>
      ) : (
        <div className="flex h-[10em] items-end justify-center gap-[0.5em] border-b border-[#e3ebf3] pb-[0.2em]">
          {bars.map(([g, n]) => (
            <div key={g} className="flex h-full max-w-[3.2em] flex-1 flex-col items-center justify-end gap-[0.3em]">
              <span className="text-[0.68em] font-semibold text-[#3d4f61]">{n}</span>
              <span
                className="w-full rounded-t-[0.3em]"
                style={{ height: `${Math.max(4, (n / max) * 78)}%`, background: g === peak?.[0] ? "#0ea5e9" : "#7dd3fc" }}
              />
            </div>
          ))}
        </div>
      )}
      {bars.length > 0 && (
        <div className="mt-[0.3em] flex justify-center gap-[0.5em] text-center text-[0.7em] text-[#5b6b7c]">
          {bars.map(([g]) => (
            <span key={g} className="max-w-[4.6em] flex-1">
              {g}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function PageBtn({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid size-[2.2em] place-items-center rounded-[0.4em] border border-[#e1e8f0] bg-white disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function pageNumbers(current: number, pages: number): (number | "…")[] {
  if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
  const set = new Set([1, 2, 3, 4, 5, pages, current - 1, current, current + 1].filter((n) => n >= 1 && n <= pages));
  const sorted = [...set].sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  sorted.forEach((n, i) => {
    if (i > 0 && n - sorted[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

function ago(iso: string, t: ReturnType<typeof useT>) {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return t("{count} minutes ago", { count: mins });
  if (mins < 1440) return t("{count} hours ago", { count: Math.round(mins / 60) });
  return t("{count} days ago", { count: Math.round(mins / 1440) });
}
