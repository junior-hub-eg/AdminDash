"use client";

import { ChevronDown, Search } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { MOCK_PROJECT_TABS } from "../dashboardMock";

export type ProjectTab = "all" | "review" | "approved" | "revisions";

const BADGE: Record<ProjectTab, string> = {
  all: "bg-white/20 text-white",
  review: "bg-[#fdf0d4] text-[#a8680c]",
  approved: "bg-[#d7efe6] text-[#12676b]",
  revisions: "bg-[#fde4e4] text-[#d04a4a]",
};

/** Tabs and search are live. The four dropdowns are visual for now (TODO(api): filter on the server). */
export function ProjectFilters({ tab, onTab, query, onQuery }: { tab: ProjectTab; onTab: (v: ProjectTab) => void; query: string; onQuery: (v: string) => void }) {
  const t = useT();
  const tabs: { key: ProjectTab; label: string }[] = [
    { key: "all", label: t("All Projects") },
    { key: "review", label: t("Awaiting Review") },
    { key: "approved", label: t("Approved") },
    { key: "revisions", label: t("Revisions Requested") },
  ];
  const selects = [
    [t("Track"), t("All Tracks (4)")],
    [t("Squad"), t("All Squads")],
    [t("Status"), t("All Statuses")],
    [t("Milestone"), t("Sprint 4 Final")],
  ];

  return (
    <div className="grid gap-[0.8em]">
      <div className={`${PANEL} flex flex-wrap items-center justify-between gap-[0.8em] p-[0.7em]`}>
        <div role="tablist" className="flex flex-wrap gap-[0.3em] text-[0.8em]">
          {tabs.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => onTab(x.key)}
              className={`rounded-[0.6em] px-[1em] py-[0.55em] font-semibold ${tab === x.key ? "bg-[#0b1b2b] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"}`}
            >
              {x.label} <span className={`ms-[0.4em] rounded-full px-[0.6em] py-[0.1em] text-[0.85em] ${tab === x.key && x.key === "all" ? BADGE.all : BADGE[x.key]}`}>{MOCK_PROJECT_TABS[x.key]}</span>
            </button>
          ))}
        </div>
        <label className="relative min-w-[14em]">
          <Search className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("Filter projects or squads...")}
            className="h-[2.4em] w-full rounded-[0.6em] bg-[#f1f5fd] ps-[2.3em] pe-[1em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
          />
        </label>
      </div>

      <div className="grid grid-cols-2 gap-[0.6em] lg:grid-cols-4">
        {selects.map(([label, value]) => (
          <label key={label} className={`${PANEL} relative block px-[1em] py-[0.6em] text-[0.75em]`}>
            <span className="block text-[0.85em] text-[#8a97a6]">{label}</span>
            <select aria-label={label} className="w-full appearance-none bg-transparent pe-[1.5em] font-bold text-[#0b1b2b] outline-none">
              <option>{value}</option>
            </select>
            <ChevronDown className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />
          </label>
        ))}
      </div>
    </div>
  );
}