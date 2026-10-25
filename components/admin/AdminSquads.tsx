"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, ClipboardCheck, Download, GraduationCap, Plus, Rocket, Search, Users } from "lucide-react";
import { getAdminMentors, getAdminSquads, type AdminSquad, type AdminSquadStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, INPUT, PageHeader, PANEL, StatCard, StatGrid } from "./page-parts";
import { SquadCard, STATUS_LABEL } from "./SquadCard";
import { LoadState, useAdminData } from "./admin-data";
import { CreateSquadDialog } from "./squad-detail/CreateSquadDialog";

const PAGE_SIZE = 4;
const STATUSES: AdminSquadStatus[] = ["Active", "Waiting", "InReview", "Completed"];

/** One CSV cell. A leading = + - @ is neutralised so Excel never runs it as a formula. */
function csvCell(value: string | number) {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

function exportCsv(squads: AdminSquad[]) {
  const head = ["Name", "Project", "Level", "Status", "Monitor", "Students", "Capacity", "Progress %"];
  const rows = squads.map((s) => [
    s.name,
    s.projectTitle,
    s.level,
    s.status,
    s.monitor?.fullName ?? "",
    s.students,
    s.capacity,
    s.progress,
  ]);
  const csv = "\uFEFF" + [head, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");

  a.href = url;
  a.download = "squads.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function AdminSquads() {
  const t = useT();
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const active = mentors.data?.mentors.filter((m) => m.isActive) ?? null;

  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");
  const [monitor, setMonitor] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);

  function replace(updated: AdminSquad) {
    squads.setData((list) => list?.map((s) => (s.id === updated.id ? updated : s)) ?? null);
  }

  const list = squads.data ?? [];
  const levels = Array.from(new Set(list.map((s) => s.level)));

  const q = query.trim().toLowerCase();
  const filtered = list.filter(
    (s) =>
      (level === "all" || s.level === level) &&
      (status === "all" || s.status === status) &&
      (monitor === "all" || s.monitor?.id === monitor) &&
      (!q ||
        s.name.toLowerCase().includes(q) ||
        s.projectTitle.toLowerCase().includes(q) ||
        (s.monitor?.fullName.toLowerCase().includes(q) ?? false)),
  );

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const from = (current - 1) * PAGE_SIZE;
  const visible = filtered.slice(from, from + PAGE_SIZE);

  const windowStart = Math.max(1, Math.min(current - 2, pages - 4));
  const numbers = Array.from({ length: Math.min(5, pages) }, (_, i) => windowStart + i);

  const total = list.length;
  const activeCount = list.filter((s) => s.status === "Active").length;
  const reviewCount = list.filter((s) => s.status === "InReview").length;
  const doneCount = list.filter((s) => s.status === "Completed").length;
  const load = total ? Math.round((activeCount / total) * 100) : 0;
  const ready = !!squads.data;
  const dash = "—";

  const onFilter = (set: (v: string) => void) => (e: { target: { value: string } }) => {
    set(e.target.value);
    setPage(1);
  };

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Collaborative Clusters")}
        title={t("Squad Management")}
        description={t("Manage collaborative student teams, sprint progress, and mentor allocations across live technical tracks.")}
        actions={
          <>
            <button type="button" onClick={() => exportCsv(filtered)} disabled={filtered.length === 0} className={BTN_SECONDARY}>
              <Download className="size-[1.1em]" /> {t("Export Squads")}
            </button>
            <button type="button" onClick={() => setCreating(true)} className={BTN_PRIMARY}>
              <Plus className="size-[1.1em]" /> {t("Create Squad")}
            </button>
          </>
        }
      />

      <CreateSquadDialog
        open={creating}
        onClose={() => setCreating(false)}
        mentors={active}
        onCreated={(squad) => squads.setData((list) => [squad, ...(list ?? [])])}
      />

      <StatGrid busy={!ready}>
        <StatCard
          label={t("Total Squads")}
          value={ready ? total : dash}
          icon={Users}
          tone="cyan"
          hint={t("Teams enrolled this term")}
        />
        <StatCard
          label={t("Active Sprints")}
          value={ready ? activeCount : dash}
          icon={Rocket}
          tone="green"
          badge={ready ? `${load}%` : undefined}
          hint={t("Currently in live sprint phases")}
        />
        <StatCard
          label={t("In Review")}
          value={ready ? reviewCount : dash}
          icon={ClipboardCheck}
          tone="violet"
          hint={t("Awaiting mentor sign-off")}
        />
        <StatCard
          label={t("Graduated Squads")}
          value={ready ? doneCount : dash}
          icon={GraduationCap}
          tone="amber"
          hint={t("Successfully completed the program")}
        />
      </StatGrid>

      {/* Filters */}
      <section className={`${PANEL} flex flex-wrap items-center gap-[0.7em] p-[0.9em]`}>
        <label className="relative min-w-[14em] flex-1">
          <span className="sr-only">{t("Search squads, projects or monitors")}</span>
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
          <input
            type="search"
            value={query}
            onChange={onFilter(setQuery)}
            placeholder={t("Search squads, projects or monitors")}
            className={`${INPUT} w-full ps-[2.6em]`}
          />
        </label>

        <select value={level} onChange={onFilter(setLevel)} aria-label={t("Level")} className={INPUT}>
          <option value="all">{t("All Levels")}</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {t(l)}
            </option>
          ))}
        </select>

        <select value={monitor} onChange={onFilter(setMonitor)} aria-label={t("Monitor")} className={INPUT}>
          <option value="all">{t("All Monitors")}</option>
          {active?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>

        <select value={status} onChange={onFilter(setStatus)} aria-label={t("Status")} className={INPUT}>
          <option value="all">{t("All Statuses")}</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(STATUS_LABEL[s])}
            </option>
          ))}
        </select>
      </section>

      {!squads.data && <LoadState error={squads.error} onRetry={squads.reload} />}
      {mentors.error && <LoadState error={mentors.error} onRetry={mentors.reload} />}

      {squads.data && filtered.length === 0 && (
        <p className="py-[2em] text-center text-[0.9em] text-[#8a97a6]">
          {list.length === 0 ? t("No squads yet.") : t("No squads match.")}
        </p>
      )}

      <div className="grid gap-[1.2em] md:grid-cols-2">
        {visible.map((s, i) => (
          <SquadCard key={s.id} squad={s} mentors={active} onChanged={replace} index={from + i} href={`/admin/squads/${s.id}`} />
        ))}
      </div>

      {/* Pagination */}
      {filtered.length > 0 && (
        <footer className="flex flex-wrap items-center justify-between gap-[0.8em] text-[0.8em] text-[#5b6b7c]">
          <p>
            {t("Showing {from} to {to} of {total} squads", {
              from: from + 1,
              to: from + visible.length,
              total: filtered.length,
            })}
          </p>

          {pages > 1 && (
            <nav aria-label={t("Pagination")} className="flex items-center gap-[0.4em]">
              <button
                type="button"
                onClick={() => setPage(current - 1)}
                disabled={current === 1}
                aria-label={t("Previous page")}
                className="grid size-[2.2em] place-items-center rounded-[0.6em] border border-[#dfe7f1] bg-white disabled:opacity-40"
              >
                <ChevronLeft className="size-[1.1em] rtl:rotate-180" />
              </button>

              {numbers.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === current ? "page" : undefined}
                  className={`grid size-[2.2em] place-items-center rounded-[0.6em] text-[0.95em] font-semibold ${
                    n === current ? "bg-[#06b6d4] text-white" : "border border-[#dfe7f1] bg-white text-[#14365a]"
                  }`}
                >
                  {n}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setPage(current + 1)}
                disabled={current === pages}
                aria-label={t("Next page")}
                className="grid size-[2.2em] place-items-center rounded-[0.6em] border border-[#dfe7f1] bg-white disabled:opacity-40"
              >
                <ChevronRight className="size-[1.1em] rtl:rotate-180" />
              </button>
            </nav>
          )}
        </footer>
      )}
    </AdminSurface>
  );
}