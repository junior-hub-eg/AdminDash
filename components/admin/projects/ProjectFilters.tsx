"use client";

import { ChevronDown, Search } from "lucide-react";
import type { AdminSquad, AdminSquadStatus, TrackLevel } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

export type ProjectTab = "all" | "review" | "approved" | "revisions";

export type ProjectFilterState = { squad: string; status: AdminSquadStatus | "all"; level: TrackLevel | "all" };

export const SQUAD_STATUS_LABEL: Record<AdminSquadStatus, string> = {
  Waiting: tk("Forming"),
  Active: tk("In Development"),
  InReview: tk("Under Review"),
  Completed: tk("Approved"),
};

const LEVELS: TrackLevel[] = ["Beginner", "Intermediate", "Advanced"];

const BADGE: Record<ProjectTab, string> = {
  all: "bg-white/20 text-white",
  review: "bg-[#fdf0d4] text-[#a8680c]",
  approved: "bg-[#d7efe6] text-[#12676b]",
  revisions: "bg-[#fde4e4] text-[#d04a4a]",
};

/** Status tabs and search, plus the squad / status / level dropdowns. Squads carry no track in the list, so Track is shown only. */
export function ProjectFilters({
  tab,
  onTab,
  counts,
  query,
  onQuery,
  filters,
  onFilters,
  squads,
  trackCount,
}: {
  tab: ProjectTab;
  onTab: (v: ProjectTab) => void;
  counts: Record<"all" | "review" | "approved", number>;
  query: string;
  onQuery: (v: string) => void;
  filters: ProjectFilterState;
  onFilters: (v: ProjectFilterState) => void;
  squads: AdminSquad[];
  trackCount: number | null;
}) {
  const t = useT();
  const tabs: { key: ProjectTab; label: string; count: number | null }[] = [
    { key: "all", label: t("All Projects"), count: counts.all },
    { key: "review", label: t("Awaiting Review"), count: counts.review },
    { key: "approved", label: t("Approved"), count: counts.approved },
    { key: "revisions", label: t("Revisions Requested"), count: null },
  ];
  const box = `${PANEL} relative block px-[1em] py-[0.55em] text-[0.75em]`;
  const select = "w-full appearance-none bg-transparent pe-[1.5em] font-semibold text-[#0b1b2b] outline-none disabled:cursor-not-allowed";
  const chevron = <ChevronDown className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />;

  return (
    <div className="grid gap-[0.8em]">
      <div className={`${PANEL} flex flex-wrap items-center justify-between gap-[0.8em] p-[0.6em]`}>
        <div role="tablist" className="flex flex-wrap gap-[0.3em] text-[0.78em]">
          {tabs.map((x) => {
            const soon = x.count === null;
            return (
              <button
                key={x.key}
                type="button"
                role="tab"
                aria-selected={tab === x.key}
                disabled={soon}
                title={soon ? t("Not tracked yet") : undefined}
                onClick={() => onTab(x.key)}
                className={`rounded-[0.6em] px-[1em] py-[0.6em] font-semibold disabled:cursor-not-allowed ${
                  tab === x.key ? "bg-[#0b1b2b] text-white" : "text-[#14365a] hover:bg-[#eef3fa] disabled:hover:bg-transparent"
                }`}
              >
                {x.label}{" "}
                <span className={`ms-[0.3em] rounded-[0.4em] px-[0.5em] py-[0.1em] text-[0.85em] ${tab === x.key && x.key === "all" ? BADGE.all : BADGE[x.key]}`}>
                  {soon ? "—" : x.count}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex min-w-[14em] flex-1 items-center gap-[0.5em] sm:flex-none">
          <label className="relative min-w-0 flex-1 sm:w-[17em]">
            <Search className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#8a97a6]" />
            <input
              type="search"
              value={query}
              onChange={(e) => onQuery(e.target.value)}
              placeholder={t("Filter projects or squads...")}
              className="h-[2.6em] w-full rounded-[0.6em] bg-[#eef3fb] ps-[2.4em] pe-[1em] text-[0.78em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
            />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-[0.6em] lg:grid-cols-4">
        <label className={box} title={t("Squads are not linked to a track in this list yet")}>
          <span className="block text-[0.85em] text-[#5b6b7c]">{t("Track")}</span>
          <select aria-label={t("Track")} disabled className={select}>
            <option>{trackCount === null ? t("All Tracks") : `${t("All Tracks")} (${trackCount})`}</option>
          </select>
          {chevron}
        </label>
        <label className={box}>
          <span className="block text-[0.85em] text-[#5b6b7c]">{t("Squad")}</span>
          <select aria-label={t("Squad")} value={filters.squad} onChange={(e) => onFilters({ ...filters, squad: e.target.value })} className={select}>
            <option value="all">{t("All Squads")}</option>
            {squads.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          {chevron}
        </label>
        <label className={box}>
          <span className="block text-[0.85em] text-[#5b6b7c]">{t("Status")}</span>
          <select
            aria-label={t("Status")}
            value={filters.status}
            onChange={(e) => onFilters({ ...filters, status: e.target.value as ProjectFilterState["status"] })}
            className={select}
          >
            <option value="all">{t("All Statuses")}</option>
            {(Object.keys(SQUAD_STATUS_LABEL) as AdminSquadStatus[]).map((s) => (
              <option key={s} value={s}>
                {t(SQUAD_STATUS_LABEL[s])}
              </option>
            ))}
          </select>
          {chevron}
        </label>
        <label className={box}>
          <span className="block text-[0.85em] text-[#5b6b7c]">{t("Level")}</span>
          <select
            aria-label={t("Level")}
            value={filters.level}
            onChange={(e) => onFilters({ ...filters, level: e.target.value as ProjectFilterState["level"] })}
            className={select}
          >
            <option value="all">{t("All Levels")}</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {t(l)}
              </option>
            ))}
          </select>
          {chevron}
        </label>
      </div>
    </div>
  );
}
