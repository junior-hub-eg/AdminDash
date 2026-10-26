"use client";

import { useState } from "react";
import { BadgeCheck, Files, Hourglass, Library, Plus, SlidersHorizontal, SquareTerminal } from "lucide-react";
import { getAdminSquads, getProjects, getSubmissionsByTrack, type AdminProject, type AdminSquad } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, AdminSurface, StatCard, StatGrid } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { ProjectFilters, type ProjectFilterState, type ProjectTab } from "./projects/ProjectFilters";
import { ProjectList } from "./projects/ProjectList";
import { ProjectEvaluationPanel } from "./projects/ProjectEvaluationPanel";
import { ReviewMetrics } from "./projects/ReviewMetrics";
import { ProjectLibrary } from "./projects/ProjectLibrary";
import { ProjectFormDialog } from "./projects/ProjectFormDialog";

type View = "capstones" | "library";

const TAB_STATUS: Record<ProjectTab, (s: AdminSquad) => boolean> = {
  all: () => true,
  review: (s) => s.status === "InReview",
  approved: (s) => s.status === "Completed",
  revisions: () => false, // not tracked by the API yet
};

const two = (n: number) => String(n).padStart(2, "0");

/**
 * Projects are the squads' capstones (GET admin/squads): title, squad, level, status, monitor, progress.
 * Selecting one loads the full squad for the evaluation panel. Mentors review the submissions;
 * the admin follows them here and per track (GET admin/submissions/by-track).
 * The project library (27 Oct 2026) is the catalog apart from the squads (GET admin/projects): "New Project Brief" writes
 * a project in full, and new squads get one of their level at random.
 */
export default function AdminProjects() {
  const t = useT();
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the projects. Please try again."));
  const byTrack = useAdminData(getSubmissionsByTrack, tk("We couldn't load the submissions. Please try again."));
  const [tab, setTab] = useState<ProjectTab>("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProjectFilterState>({ squad: "all", status: "all", level: "all" });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const catalog = useAdminData(getProjects, tk("We couldn't load the project library. Please try again."));
  const [view, setView] = useState<View>("capstones");
  // "new" for New Project Brief, a project to edit it, null when the form is closed.
  const [editing, setEditing] = useState<AdminProject | "new" | null>(null);

  function saved(project: AdminProject) {
    catalog.setData([...(catalog.data ?? []).filter((p) => p.id !== project.id), project]);
    setView("library");
    // Squads still building it got its new title.
    if (project.activeSquads > 0) squads.reload();
  }

  const all = squads.data ?? [];
  const tracks = byTrack.data ?? [];
  const q = query.trim().toLowerCase();
  const matches = all.filter(
    (s) =>
      (filters.squad === "all" || s.id === filters.squad) &&
      (filters.status === "all" || s.status === filters.status) &&
      (filters.level === "all" || s.level === filters.level) &&
      (!q || [s.projectTitle, s.name, s.monitor?.fullName ?? ""].some((v) => v.toLowerCase().includes(q))),
  );
  const items = matches.filter(TAB_STATUS[tab]);
  const counts = {
    all: matches.length,
    review: matches.filter(TAB_STATUS.review).length,
    approved: matches.filter(TAB_STATUS.approved).length,
  };
  const selected = all.find((s) => s.id === selectedId) ?? items[0] ?? null;

  const active = all.filter((s) => s.status === "Active");
  const avgActive = active.length ? Math.round(active.reduce((n, s) => n + s.progress, 0) / active.length) : 0;
  const inReview = byTrack.data ? tracks.reduce((n, x) => n + x.inReview, 0) : all.filter(TAB_STATUS.review).length;
  const approved = byTrack.data ? tracks.reduce((n, x) => n + x.approved, 0) : all.filter(TAB_STATUS.approved).length;
  const ready = !!squads.data;

  return (
    <AdminSurface>
      <header className="relative overflow-hidden rounded-[1.1em] bg-[linear-gradient(120deg,#e3ecfd_0%,#eef4fe_55%,#f6f9ff_100%)] px-[1.6em] py-[1.8em] shadow-[0_6px_22px_rgba(20,54,90,0.05)]">
        <span aria-hidden className="pointer-events-none absolute -top-[3em] end-[4em] size-[11em] rounded-full border-[0.35em] border-[#cfe8f5]/80" />
        <span aria-hidden className="pointer-events-none absolute -top-[5em] end-[2em] size-[15em] rounded-full border border-dashed border-[#cfe8f5]" />
        <div className="relative flex flex-wrap items-center justify-between gap-x-[1.5em] gap-y-[1em]">
          <div className="min-w-0 max-w-[38em]">
            <p className="flex flex-wrap items-center gap-[0.5em] text-[0.66em]">
              <span className="inline-flex items-center gap-[0.45em] rounded-full bg-[#d6e9fb] px-[0.8em] py-[0.2em] font-semibold text-[#0b6f86]">
                <span className="size-[0.5em] rounded-full bg-[#06b6d4]" />
                {t("Squad Capstones")}
              </span>
              <span className="text-[#5b6b7c]">• {t("Evaluation Phase")}</span>
            </p>
            <h1 className="mt-[0.35em] text-[1.9em] font-extrabold leading-tight text-[#0b1b2b] xl:text-[2.1em]">{t("Projects & Submissions")}</h1>
            <p className="mt-[0.4em] text-[0.85em] leading-snug text-[#3d4f61]">
              {t("Review capstone deliverables, evaluate sprint milestones, and assess squad performance rubrics across tech tracks.")}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-[0.6em]">
            <button
              type="button"
              disabled
              title={t("Coming soon")}
              className="inline-flex cursor-not-allowed items-center gap-[0.5em] rounded-[0.7em] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#0b1b2b]/70 shadow-[0_4px_14px_rgba(20,54,90,0.08)]"
            >
              <SlidersHorizontal className="size-[1em]" /> {t("Evaluation Rubrics")}
            </button>
            <button type="button" onClick={() => setEditing("new")} className={BTN_PRIMARY}>
              <Plus className="size-[1em]" /> {t("New Project Brief")}
            </button>
          </div>
        </div>
      </header>

      <StatGrid busy={!ready}>
        <StatCard
          label={t("Total Capstones")}
          icon={Files}
          value={ready ? <Unit n={two(all.length)} unit={t("briefs")} /> : "—"}
          badge={byTrack.data ? t("{n} tracks", { n: tracks.length }) : undefined}
          badgeTone="neutral"
          hint={t("One project per squad")}
        />
        <StatCard
          label={t("In Development")}
          icon={SquareTerminal}
          value={ready ? <Unit n={two(active.length)} unit={t("squads")} /> : "—"}
          badge={ready && active.length ? `${avgActive}%` : undefined}
          badgeTone="neutral"
          hint={t("Average sprint progress")}
        />
        <StatCard
          label={t("Awaiting Review")}
          icon={Hourglass}
          tone="amber"
          value={ready ? <Unit n={two(inReview)} unit={t("pending")} /> : "—"}
          badge={ready && inReview > 0 ? t("Action Req.") : undefined}
          badgeTone="warn"
          hint={t("Mentor signoff queue")}
        />
        <StatCard
          label={t("Certified & Approved")}
          icon={BadgeCheck}
          tone="green"
          value={ready ? <Unit n={two(approved)} unit={t("shipped")} /> : "—"}
          hint={t("Approved by mentors")}
        />
      </StatGrid>

      <div role="tablist" className="flex flex-wrap gap-[0.4em] text-[0.82em]">
        {(
          [
            { key: "capstones", label: t("Squad Capstones"), icon: Files, count: all.length },
            { key: "library", label: t("Project Library"), icon: Library, count: catalog.data?.length },
          ] as const
        ).map((x) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={view === x.key}
            onClick={() => setView(x.key)}
            className={`inline-flex items-center gap-[0.5em] rounded-[0.7em] px-[1.1em] py-[0.6em] font-semibold shadow-[0_4px_14px_rgba(20,54,90,0.06)] ${
              view === x.key ? "bg-[#0b6f86] text-white" : "bg-white text-[#14365a] hover:bg-[#eef3fa]"
            }`}
          >
            <x.icon className="size-[1.05em]" /> {x.label}
            {x.count !== undefined && <span className="opacity-70">{x.count}</span>}
          </button>
        ))}
      </div>

      {view === "library" ? (
        catalog.data ? (
          <ProjectLibrary
            projects={catalog.data}
            onEdit={setEditing}
            onDeleted={(id) => catalog.setData((catalog.data ?? []).filter((p) => p.id !== id))}
          />
        ) : (
          <LoadState error={catalog.error} onRetry={catalog.reload} />
        )
      ) : (
        <>
          <ProjectFilters
            tab={tab}
            onTab={setTab}
            counts={counts}
            query={query}
            onQuery={setQuery}
            filters={filters}
            onFilters={setFilters}
            squads={all}
            trackCount={byTrack.data ? tracks.length : null}
          />

          {!squads.data ? (
            <LoadState error={squads.error} onRetry={squads.reload} />
          ) : (
            <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
              <ProjectList key={`${tab}|${q}|${filters.squad}|${filters.status}|${filters.level}`} items={items} selectedId={selected?.id ?? null} onSelect={setSelectedId} />
              <ProjectEvaluationPanel key={selected?.id ?? "none"} squad={selected} />
            </div>
          )}

          <ReviewMetrics tracks={byTrack.data} error={byTrack.error} />
        </>
      )}

      {editing && (
        <ProjectFormDialog
          key={editing === "new" ? "new" : editing.id}
          open
          project={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={saved}
        />
      )}
    </AdminSurface>
  );
}

function Unit({ n, unit }: { n: string; unit: string }) {
  return (
    <>
      {n} <span className="text-[0.38em] font-medium text-[#5b6b7c]">{unit}</span>
    </>
  );
}
