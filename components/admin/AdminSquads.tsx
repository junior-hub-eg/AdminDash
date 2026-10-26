"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  Award,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Download,
  LayoutGrid,
  List,
  MonitorCheck,
  Plus,
  Rocket,
  Search,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import {
  getAdminMentors,
  getAdminSquadFull,
  getAdminSquads,
  type AdminSquad,
  type AdminSquadFull,
  type AdminSquadStatus,
} from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY } from "./page-parts";
import { currentSprint, SquadCard, STATUS_LABEL } from "./SquadCard";
import { SprintLink } from "./squad-detail/SprintDetails";
import { LoadState, useAdminData } from "./admin-data";
import { CreateSquadDialog } from "./squad-detail/CreateSquadDialog";
import { SquadStat } from "./squad-detail/SquadStat";

const PAGE_SIZE = 4;
const STATUSES: AdminSquadStatus[] = ["Active", "Waiting", "InReview", "Completed"];

const SELECT =
  "h-[2.7em] w-full min-w-0 appearance-none rounded-[0.7em] border border-[#e1e8f0] bg-white pe-[2.2em] ps-[0.9em] text-[0.8em] font-semibold text-[#14365a] outline-none focus:ring-2 focus:ring-[#06b6d4]/40";

/** One CSV cell. A leading = + - @ is neutralised so Excel never runs it as a formula. */
function csvCell(value: string | number) {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCsv(squads: AdminSquad[], trackOf: (s: AdminSquad) => string) {
  const head = ["Name", "Project", "Track", "Level", "Status", "Monitor", "Students", "Capacity", "Progress %"];
  const rows = squads.map((s) => [
    s.name,
    s.projectTitle,
    trackOf(s),
    s.level,
    s.status,
    s.monitor?.fullName ?? "",
    s.students,
    s.capacity,
    s.progress,
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");

  a.href = url;
  a.download = "squads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: ReactNode }) {
  return (
    <label className="relative min-w-0 flex-1 sm:w-[11em] sm:flex-none">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT}>
        {children}
      </select>
      <ChevronsUpDown className="pointer-events-none absolute end-[0.7em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
    </label>
  );
}

export default function AdminSquads() {
  const t = useT();
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const active = mentors.data?.mentors.filter((m) => m.isActive) ?? null;

  const [query, setQuery] = useState("");
  const [track, setTrack] = useState("all");
  const [monitor, setMonitor] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [creating, setCreating] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  /** Workspaces of the squads shown on the page (description, members, sprint); null when loading failed. */
  const [fulls, setFulls] = useState<Record<string, AdminSquadFull | null>>({});

  function replace(updated: AdminSquad) {
    squads.setData((list) => list?.map((s) => (s.id === updated.id ? updated : s)) ?? null);
  }

  const list = squads.data ?? [];
  const trackById = new Map((mentors.data?.mentors ?? []).map((m) => [m.id, m.trackName]));
  const trackOf = (s: AdminSquad) => (s.monitor ? (trackById.get(s.monitor.id) ?? "") : "");
  const tracks = Array.from(new Set(list.map(trackOf).filter(Boolean))).sort();

  const q = query.trim().toLowerCase();
  const filtered = list.filter(
    (s) =>
      (track === "all" || trackOf(s) === track) &&
      (status === "all" || s.status === status) &&
      (monitor === "all" || s.monitor?.id === monitor) &&
      (!q ||
        s.name.toLowerCase().includes(q) ||
        s.projectTitle.toLowerCase().includes(q) ||
        trackOf(s).toLowerCase().includes(q) ||
        (s.monitor?.fullName.toLowerCase().includes(q) ?? false) ||
        (fulls[s.id]?.members.some((m) => m.fullName.toLowerCase().includes(q)) ?? false)),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const from = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(from, from + PAGE_SIZE);
  const visibleKey = visible.map((s) => s.id).join(",");

  // Only the cards on this page load their workspace (GET admin/squads/{id}/full).
  useEffect(() => {
    let alive = true;
    for (const id of visibleKey ? visibleKey.split(",") : []) {
      if (id in fulls) continue;
      getAdminSquadFull(id).then(
        (full) => alive && setFulls((m) => ({ ...m, [id]: full })),
        () => alive && setFulls((m) => ({ ...m, [id]: null })),
      );
    }
    return () => {
      alive = false;
    };
    // `fulls` is read only to skip loaded ids; reloading on each arrival would refetch nothing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleKey]);

  const numbers: (number | "gap")[] =
    pages <= 6
      ? Array.from({ length: pages }, (_, i) => i + 1)
      : Array.from({ length: pages }, (_, i) => i + 1)
          .filter((n) => n === 1 || n === pages || Math.abs(n - current) <= 1 || (current <= 2 && n <= 3))
          .flatMap((n, i, arr) => (i > 0 && n - arr[i - 1] > 1 ? (["gap", n] as const) : ([n] as const)));

  const total = list.length;
  const activeCount = list.filter((s) => s.status === "Active").length;
  const reviewCount = list.filter((s) => s.status === "InReview").length;
  const doneCount = list.filter((s) => s.status === "Completed").length;
  const noMonitor = list.filter((s) => !s.monitor).length;
  const load = total ? Math.round((activeCount / total) * 100) : 0;
  const graduated = total ? Math.round((doneCount / total) * 100) : 0;
  const ready = !!squads.data;
  const dash = "—";
  const two = (n: number) => String(n).padStart(2, "0");

  const onFilter = (set: (v: string) => void) => (v: string) => {
    set(v);
    setPage(1);
  };

  return (
    <AdminSurface>
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[1em]">
        <div className="min-w-0 max-w-[32em]">
          <nav aria-label={t("Breadcrumb")} className="mb-[0.6em] flex flex-wrap items-center gap-[0.6em] text-[0.68em]">
            <span className="rounded-full bg-[#dff3fb] px-[0.9em] py-[0.25em] font-bold uppercase tracking-[0.08em] text-[#0b6f86]">
              {t("Squads")}
            </span>
            <span className="text-[#8a97a6]">/</span>
            <span className="font-medium text-[#3d4f61]">{t("Collaborative Clusters")}</span>
          </nav>
          <h1 className="text-[1.9em] font-extrabold leading-tight text-[#0b1b2b] xl:text-[2.2em]">{t("Squad Management")}</h1>
          <p className="mt-[0.4em] text-[0.85em] leading-snug text-[#5b6b7c]">
            {t("Manage collaborative student teams, sprint progress, and mentor allocations across live technical tracks.")}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-[0.6em]">
          <div className="relative">
            <button
              type="button"
              onClick={() => setExportOpen((o) => !o)}
              disabled={list.length === 0}
              aria-expanded={exportOpen}
              className="inline-flex items-center gap-[0.5em] rounded-[0.7em] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#14365a] shadow-[0_4px_14px_rgba(20,54,90,0.06)] hover:bg-[#f1f6fb] disabled:opacity-50"
            >
              <Download className="size-[1.1em]" /> {t("Export Squads")} <ChevronDown className="size-[0.9em] text-[#5b6b7c]" />
            </button>
            {exportOpen && (
              <div className="absolute end-0 top-full z-20 mt-[0.4em] grid min-w-[14em] gap-[0.2em] rounded-[0.8em] bg-white p-[0.4em] text-[0.8em] shadow-[0_10px_30px_rgba(20,54,90,0.15)]">
                <button
                  type="button"
                  disabled={filtered.length === 0}
                  onClick={() => {
                    exportCsv(filtered, trackOf);
                    setExportOpen(false);
                  }}
                  className="rounded-[0.5em] px-[0.8em] py-[0.5em] text-start hover:bg-[#eef4fa] disabled:opacity-50"
                >
                  {t("Filtered squads ({count}) · CSV", { count: filtered.length })}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportCsv(list, trackOf);
                    setExportOpen(false);
                  }}
                  className="rounded-[0.5em] px-[0.8em] py-[0.5em] text-start hover:bg-[#eef4fa]"
                >
                  {t("All squads ({count}) · CSV", { count: list.length })}
                </button>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setCreating(true)} className={BTN_PRIMARY}>
            <Plus className="size-[1.1em]" /> {t("Create Squad")}
          </button>
        </div>
      </header>

      <CreateSquadDialog
        open={creating}
        onClose={() => setCreating(false)}
        mentors={active}
        onCreated={(squad) => squads.setData((list) => [squad, ...(list ?? [])])}
      />

      <ul className="grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4" aria-busy={!ready}>
        <SquadStat
          label={t("Total Squads")}
          icon={UsersRound}
          tone="cyan"
          value={ready ? total : dash}
          suffix={
            ready && noMonitor > 0 ? (
              <span className="text-[#c7851a]">{t("{count} without monitor", { count: noMonitor })}</span>
            ) : undefined
          }
          hint={t("Teams enrolled in the program")}
        />
        <SquadStat
          label={t("Active Sprints")}
          icon={Rocket}
          tone="green"
          value={ready ? two(activeCount) : dash}
          suffix={
            ready ? (
              <span dir="ltr" className="rounded-[0.4em] bg-[#dff3fb] px-[0.5em] py-[0.1em] text-[#0b6f86]">
                {t("{pct}% Load", { pct: load })}
              </span>
            ) : undefined
          }
          hint={t("Currently in live sprint phases")}
        />
        <SquadStat
          label={t("In Review")}
          icon={MonitorCheck}
          tone="slate"
          value={ready ? two(reviewCount) : dash}
          suffix={t("Pending eval")}
          hint={t("Awaiting mentor milestone sign-off")}
        />
        <SquadStat
          label={t("Graduated Squads")}
          icon={Award}
          tone="slate"
          value={ready ? two(doneCount) : dash}
          suffix={
            ready ? (
              <span dir="ltr" className="inline-flex items-center gap-[0.2em] text-[#17935f]">
                <TrendingUp className="size-[1em]" /> {t("{pct}% of squads", { pct: graduated })}
              </span>
            ) : undefined
          }
          hint={t("Successfully completed the program")}
        />
      </ul>

      {/* Filters */}
      <section className="flex flex-wrap items-center gap-[0.7em] rounded-[1.1em] bg-white p-[0.8em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
        <label className="relative min-w-[14em] flex-[1_1_100%] lg:flex-1">
          <span className="sr-only">{t("Search squads, tracks, or members...")}</span>
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#5b6b7c]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onFilter(setQuery)(e.target.value)}
            placeholder={t("Search squads, tracks, or members...")}
            className="h-[2.7em] w-full rounded-[0.7em] bg-[#eef3fb] pe-[0.9em] ps-[2.6em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#5b6b7c] focus:ring-2 focus:ring-[#06b6d4]/40"
          />
        </label>

        <Select label={t("Track")} value={track} onChange={onFilter(setTrack)}>
          <option value="all">{t("All Tracks")}</option>
          {tracks.map((x) => (
            <option key={x} value={x}>
              {t(x)}
            </option>
          ))}
        </Select>

        <Select label={t("Mentor")} value={monitor} onChange={onFilter(setMonitor)}>
          <option value="all">{t("All Mentors")}</option>
          {active?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </Select>

        <Select label={t("Status")} value={status} onChange={onFilter(setStatus)}>
          <option value="all">{t("All Statuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(STATUS_LABEL[s])}
            </option>
          ))}
        </Select>

        <div role="group" aria-label={t("View")} className="flex shrink-0 items-center gap-[0.2em] rounded-[0.7em] bg-[#eef3fb] p-[0.25em]">
          {(
            [
              ["grid", LayoutGrid, tk("Grid view")],
              ["list", List, tk("List view")],
            ] as const
          ).map(([key, Icon, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              aria-pressed={view === key}
              aria-label={t(label)}
              title={t(label)}
              className={`grid size-[2.1em] place-items-center rounded-[0.5em] ${
                view === key ? "bg-white text-[#0b89a6] shadow-sm" : "text-[#3d4f61] hover:bg-white/60"
              }`}
            >
              <Icon className="size-[1.1em]" />
            </button>
          ))}
        </div>
      </section>

      {!squads.data && <LoadState error={squads.error} onRetry={squads.reload} />}
      {mentors.error && <LoadState error={mentors.error} onRetry={mentors.reload} />}

      {squads.data && filtered.length === 0 && (
        <p className="py-[2em] text-center text-[0.9em] text-[#8a97a6]">{list.length === 0 ? t("No squads yet.") : t("No squads match.")}</p>
      )}

      {view === "grid" ? (
        <div className="grid gap-[1.2em] md:grid-cols-2">
          {visible.map((s, i) => (
            <SquadCard
              key={s.id}
              squad={s}
              full={fulls[s.id]}
              trackName={trackOf(s) || null}
              mentors={active}
              onChanged={replace}
              index={from + i}
              href={`/admin/squads/${s.id}`}
            />
          ))}
        </div>
      ) : (
        visible.length > 0 && (
          <div className="overflow-x-auto rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
            <table className="w-full min-w-[46em] text-[0.8em] text-[#14365a]">
              <thead className="bg-[#f1f6fa] text-[0.82em] uppercase tracking-[0.08em] text-[#5b6b7c]">
                <tr>
                  <th scope="col" className="px-[1em] py-[0.8em] text-start font-semibold">{t("Squad")}</th>
                  <th scope="col" className="px-[1em] py-[0.8em] text-start font-semibold">{t("Track")}</th>
                  <th scope="col" className="px-[1em] py-[0.8em] text-start font-semibold">{t("Mentor")}</th>
                  <th scope="col" className="px-[1em] py-[0.8em] text-start font-semibold">{t("Members")}</th>
                  <th scope="col" className="px-[1em] py-[0.8em] text-start font-semibold">{t("Sprint")}</th>
                  <th scope="col" className="px-[1em] py-[0.8em] text-start font-semibold">{t("Status")}</th>
                  <th scope="col" className="px-[1em] py-[0.8em]">
                    <span className="sr-only">{t("Open Workspace")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {visible.map((s, i) => {
                  const full = fulls[s.id];
                  const sprint = currentSprint(full);
                  const pct = sprint ? Math.round(sprint.progress) : s.progress;
                  return (
                    <tr key={s.id} className="border-t border-[#eef2f7]">
                      <td className="px-[1em] py-[0.7em]">
                        <p className="text-[0.75em] font-bold uppercase tracking-[0.1em] text-[#8a97a6]">
                          {t("Squad {n}", { n: String(from + i + 1).padStart(2, "0") })}
                        </p>
                        <p className="font-bold text-[#0b1b2b]">{s.name}</p>
                        <p className="max-w-[16em] truncate text-[0.88em] text-[#5b6b7c]">{s.projectTitle}</p>
                      </td>
                      <td className="px-[1em] py-[0.7em]">{trackOf(s) ? t(trackOf(s)) : t(s.level)}</td>
                      <td className="px-[1em] py-[0.7em]">{s.monitor?.fullName ?? <span className="text-[#c0392b]">{t("None yet")}</span>}</td>
                      <td className="px-[1em] py-[0.7em]">{full ? full.members.length : s.students}</td>
                      <td className="px-[1em] py-[0.7em]">
                        <p className="text-[0.9em] font-semibold">
                          {sprint ? (
                            <SprintLink squadId={s.id} sprintId={sprint.id}>
                              {sprint.name}
                            </SprintLink>
                          ) : (
                            "—"
                          )}
                        </p>
                        <div className="mt-[0.3em] flex items-center gap-[0.5em]">
                          <div className="h-[0.4em] w-[6em] overflow-hidden rounded-full bg-[#e6edf3]">
                            <div className="h-full rounded-full bg-[#06b6d4]" style={{ width: `${pct}%` }} />
                          </div>
                          <span dir="ltr" className="text-[0.85em] text-[#5b6b7c]">
                            {pct}%{sprint && ` · ${sprint.tasksDone}/${sprint.tasksTotal}`}
                          </span>
                        </div>
                      </td>
                      <td className="px-[1em] py-[0.7em]">
                        <span className="rounded-full bg-[#eef3fb] px-[0.7em] py-[0.15em] text-[0.88em] font-semibold">{t(STATUS_LABEL[s.status])}</span>
                      </td>
                      <td className="px-[1em] py-[0.7em] text-end">
                        <Link
                          href={`/admin/squads/${s.id}` as Route}
                          aria-label={t("Open Workspace")}
                          className="inline-grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#e3f0fb] text-[#0d3b66] hover:bg-[#d4e8f8]"
                        >
                          <ArrowRight className="size-[1.1em]" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <footer className="flex flex-wrap items-center justify-between gap-[0.8em] rounded-[1.1em] bg-white px-[1.1em] py-[0.8em] text-[0.8em] text-[#5b6b7c] shadow-[0_6px_22px_rgba(20,54,90,0.05)]">
          <p>
            {t("Showing {from} to {to} of {total} collaborative squads", {
              from: from + 1,
              to: from + visible.length,
              total: filtered.length,
            })}
          </p>

          <nav aria-label={t("Pagination")} className="flex items-center gap-[0.4em]">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current === 1}
              aria-label={t("Previous page")}
              className="grid size-[2.3em] place-items-center rounded-[0.6em] text-[#14365a] hover:bg-[#eef4fa] disabled:opacity-35"
            >
              <ChevronLeft className="size-[1.1em]" />
            </button>

            {numbers.map((n, i) =>
              n === "gap" ? (
                <span key={`gap-${i}`} className="px-[0.3em]">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === current ? "page" : undefined}
                  className={`grid size-[2.3em] place-items-center rounded-[0.6em] font-semibold ${
                    n === current ? "bg-[#06b6d4] text-white shadow-[0_4px_12px_rgba(6,182,212,0.35)]" : "text-[#14365a] hover:bg-[#eef4fa]"
                  }`}
                >
                  {n}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current === pages}
              aria-label={t("Next page")}
              className="grid size-[2.3em] place-items-center rounded-[0.6em] bg-white text-[#14365a] shadow-sm hover:bg-[#eef4fa] disabled:opacity-35"
            >
              <ChevronRight className="size-[1.1em]" />
            </button>
          </nav>
        </footer>
      )}
    </AdminSurface>
  );
}
