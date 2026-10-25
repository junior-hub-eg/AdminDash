"use client";

import { ChevronDown, LayoutGrid, Search } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

const select =
  "h-[2.6em] appearance-none rounded-[0.7em] border-0 bg-[#eef3fa] ps-[0.9em] pe-[2em] text-[0.8em] font-semibold text-[#14365a] outline-none";

/** Search is live. Domain / Level / Status are visual for now (TODO(api): filter on the server). */
export function TrackFilters({ query, onQuery }: { query: string; onQuery: (v: string) => void }) {
  const t = useT();
  return (
    <div className={`${PANEL} flex flex-wrap items-center gap-[0.7em] p-[0.8em]`}>
      <label className="relative min-w-[14em] flex-1">
        <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder={t("Search tracks, courses, technologies, or skills...")}
          className="h-[2.6em] w-full rounded-[0.7em] bg-[#f1f5fd] ps-[2.6em] pe-[1em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
        />
      </label>

      {[
        { label: t("Domain"), options: [t("All Domains")] },
        { label: t("Level"), options: [t("All Levels (L1-L4)")] },
        { label: t("Status"), options: [t("Active"), t("Archived")] },
      ].map((f) => (
        <label key={f.label} className="relative">
          <select aria-label={f.label} className={select}>
            {f.options.map((o) => (
              <option key={o}>{`${f.label}: ${o}`}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.7em] top-1/2 size-[1em] -translate-y-1/2 text-[#14365a]" />
        </label>
      ))}

      <button type="button" aria-label={t("Grid view")} className="grid size-[2.6em] place-items-center rounded-[0.7em] bg-[#eef3fa] text-[#14365a]">
        <LayoutGrid className="size-[1.1em]" />
      </button>
    </div>
  );
}