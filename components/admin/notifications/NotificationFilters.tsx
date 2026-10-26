"use client";

import { ChevronDown, RotateCcw, Search } from "lucide-react";
import type { AdminTrack, AnnouncementAudience } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

export type NotifTab = "all" | "sent" | "scheduled" | "drafts";

export type NotifFilters = { audience: AnnouncementAudience | "all"; track: string };

const AUDIENCES: AnnouncementAudience[] = ["Everyone", "Students", "Mentors", "Teachers"];

/** Search, status tabs (with their counts) and the audience / track dropdowns. */
export function NotificationFilters({
  tab,
  onTab,
  counts,
  query,
  onQuery,
  filters,
  onFilters,
  tracks,
  onReset,
}: {
  tab: NotifTab;
  onTab: (v: NotifTab) => void;
  counts: Record<NotifTab, number>;
  query: string;
  onQuery: (v: string) => void;
  filters: NotifFilters;
  onFilters: (v: NotifFilters) => void;
  tracks: AdminTrack[];
  onReset: () => void;
}) {
  const t = useT();
  const tabs: { key: NotifTab; label: string }[] = [
    { key: "all", label: t("All") },
    { key: "sent", label: t("Sent") },
    { key: "scheduled", label: t("Scheduled") },
    { key: "drafts", label: t("Drafts") },
  ];
  const select =
    "h-[2.7em] min-w-[13em] appearance-none rounded-[0.6em] bg-[#e6eefb] ps-[1em] pe-[2.4em] text-[0.75em] font-semibold text-[#0b1b2b] outline-none focus:ring-2 focus:ring-[#06b6d4]/40 disabled:opacity-100";

  return (
    <div className={`${PANEL} grid gap-[0.9em] p-[1em]`}>
      <div className="flex flex-wrap items-center gap-[0.8em]">
        <label className="relative min-w-[14em] flex-1">
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
          <input
            type="search"
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("Search broadcasts, topics, tags...")}
            className="h-[2.9em] w-full rounded-[0.6em] bg-[#eef3fb] ps-[2.6em] pe-[1em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
          />
        </label>
        <div role="tablist" className="flex flex-wrap gap-[0.2em] rounded-[0.6em] bg-[#eef3fb] p-[0.3em] text-[0.72em]">
          {tabs.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => onTab(x.key)}
              className={`rounded-[0.45em] px-[1em] py-[0.55em] font-semibold ${tab === x.key ? "bg-white text-[#0b6f86] shadow-sm" : "text-[#14365a] hover:text-[#0b6f86]"}`}
            >
              {x.label} ({counts[x.key].toLocaleString("en")})
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-[0.6em]">
        <label className="relative">
          <select
            aria-label={t("Audience")}
            value={filters.audience}
            onChange={(e) => onFilters({ ...filters, audience: e.target.value as NotifFilters["audience"] })}
            className={select}
          >
            <option value="all">{`${t("Audience")}: ${t("All Audiences")}`}</option>
            {AUDIENCES.map((a) => (
              <option key={a} value={a}>
                {`${t("Audience")}: ${t(a)}`}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.7em] top-1/2 size-[0.9em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>
        <label className="relative">
          <select aria-label={t("Channel")} disabled title={t("Only in-app delivery exists for now")} className={select}>
            <option>{`${t("Channel")}: ${t("All Channels")}`}</option>
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.7em] top-1/2 size-[0.9em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>
        <label className="relative">
          <select aria-label={t("Cohort")} value={filters.track} onChange={(e) => onFilters({ ...filters, track: e.target.value })} className={select}>
            <option value="all">{`${t("Cohort")}: ${t("All Tracks")}`}</option>
            {tracks.map((tr) => (
              <option key={tr.code} value={tr.code}>
                {`${t("Cohort")}: ${tr.name}`}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.7em] top-1/2 size-[0.9em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>
      </div>
      <button type="button" onClick={onReset} className="inline-flex items-center gap-[0.4em] justify-self-end text-[0.72em] font-semibold text-[#0b6f86] hover:underline">
        <RotateCcw className="size-[1em]" /> {t("Reset Filters")}
      </button>
    </div>
  );
}
