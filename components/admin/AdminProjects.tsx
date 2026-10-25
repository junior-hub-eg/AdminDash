"use client";

import { useState } from "react";
import { BadgeCheck, FolderKanban, Hourglass, Plus, SlidersHorizontal, SquareTerminal } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import { MOCK_PROJECTS, MOCK_PROJECT_STATS } from "./dashboardMock";
import { ProjectFilters, type ProjectTab } from "./projects/ProjectFilters";
import { ProjectList } from "./projects/ProjectList";
import { ProjectEvaluationPanel } from "./projects/ProjectEvaluationPanel";
import { ReviewMetrics } from "./projects/ReviewMetrics";

// TODO(api): replace the mock with the Projects API (Sprint 4-5 backend).
export default function AdminProjects() {
  const t = useT();
  const [tab, setTab] = useState<ProjectTab>("all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(MOCK_PROJECTS[0].id);
  const S = MOCK_PROJECT_STATS;

  const q = query.trim().toLowerCase();
  const items = MOCK_PROJECTS.filter(
    (p) => (tab === "all" || p.status === tab) && (!q || [p.title, p.squad, p.track].some((s) => s.toLowerCase().includes(q))),
  );
  const selected = MOCK_PROJECTS.find((p) => p.id === selectedId) ?? MOCK_PROJECTS[0];

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Capstone Sprint 2026.1 • Evaluation Phase")}
        title={t("Projects & Submissions")}
        description={t("Review capstone deliverables, evaluate sprint milestones, and assess squad performance rubrics across tech tracks.")}
        actions={
          <>
            <button type="button" className={BTN_SECONDARY}><SlidersHorizontal className="size-[1em]" /> {t("Evaluation Rubrics")}</button>
            <button type="button" className={BTN_PRIMARY}><Plus className="size-[1em]" /> {t("New Project Brief")}</button>
          </>
        }
      />

      <StatGrid>
        <StatCard label={t("Total Capstones")} icon={FolderKanban} value={S.total} badge="+4" hint={t("Active cohort intake")} />
        <StatCard label={t("In Development")} icon={SquareTerminal} tone="violet" value={S.inDev} badge="63%" hint={t("Active sprint velocity")} />
        <StatCard label={t("Awaiting Review")} icon={Hourglass} tone="amber" value={String(S.awaiting).padStart(2, "0")} badge={t("Action Req.")} badgeTone="warn" hint={t("Mentor signoff queue")} />
        <StatCard label={t("Certified & Approved")} icon={BadgeCheck} tone="green" value={S.approved} badge="+500 XP" hint={t("Production certified")} />
      </StatGrid>

      <ProjectFilters tab={tab} onTab={setTab} query={query} onQuery={setQuery} />

      <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ProjectList items={items} selectedId={selected.id} onSelect={setSelectedId} />
        <ProjectEvaluationPanel project={selected} />
      </div>

      <ReviewMetrics />
    </AdminSurface>
  );
}