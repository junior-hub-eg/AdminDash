"use client";

import { ChevronDown, LayoutGrid, List, Search } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import type { TrackItem } from "./track-data";

export interface TrackFilterState {
  query: string;
  content: "" | "lessons" | "videos";
  mentors: "" | "with" | "without";
  status: "" | "active" | "empty";
}

export const EMPTY_FILTERS: TrackFilterState = { query: "", content: "", mentors: "", status: "" };

/** Filters on the real fields: name/code/description, the lessons flag, the track's mentors and its students. */
export function matchesTrack(x: TrackItem, f: TrackFilterState) {
  const q = f.query.trim().toLowerCase();
  const text = [x.track.name, x.track.code, x.info?.shortDescription ?? "", ...(x.mentors?.map((m) => m.fullName) ?? [])];
  const mentorCount = x.mentors?.filter((m) => m.isActive).length ?? 0;
  return (
    (!q || text.some((s) => s.toLowerCase().includes(q))) &&
    (!f.content || (f.content === "lessons") === Boolean(x.info?.hasLessons)) &&
    (!f.mentors || (f.mentors === "with") === mentorCount > 0) &&
    (!f.status || (f.status === "active") === x.track.students > 0)
  );
}

const SELECT =
  "h-[2.6em] appearance-none rounded-[0.7em] border-0 bg-[#eef3fa] ps-[0.9em] pe-[2.2em] text-[0.8em] font-semibold text-[#0b6f86] outline-none focus:ring-2 focus:ring-[#06b6d4]/40";

export function TrackFilters({
  value,
  onChange,
  compact,
  onCompact,
}: {
  value: TrackFilterState;
  onChange: (v: TrackFilterState) => void;
  compact: boolean;
  onCompact: (v: boolean) => void;
}) {
  const t = useT();
  const selects = [
    {
      key: "content" as const,
      label: t("Content"),
      options: [
        ["", tk("All Content")],
        ["lessons", tk("With lessons")],
        ["videos", tk("Videos only")],
      ],
    },
    {
      key: "mentors" as const,
      label: t("Mentors"),
      options: [
        ["", tk("All")],
        ["with", tk("Has mentors")],
        ["without", tk("Needs a mentor")],
      ],
    },
    {
      key: "status" as const,
      label: t("Status"),
      options: [
        ["", tk("All")],
        ["active", tk("Active")],
        ["empty", tk("No students")],
      ],
    },
  ];
  return (
    <div className={`${PANEL} flex flex-wrap items-center gap-[0.7em] p-[0.8em]`}>
      <label className="relative min-w-[14em] flex-1">
        <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1.1em] -translate-y-1/2 text-[#8a97a6]" />
        <input
          type="search"
          value={value.query}
          onChange={(e) => onChange({ ...value, query: e.target.value })}
          placeholder={t("Search tracks, mentors, or descriptions...")}
          className="h-[2.6em] w-full rounded-[0.7em] bg-[#f1f5fd] ps-[2.6em] pe-[1em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40"
        />
      </label>

      {selects.map((f) => (
        <label key={f.key} className="relative">
          <select aria-label={f.label} value={value[f.key]} onChange={(e) => onChange({ ...value, [f.key]: e.target.value })} className={SELECT}>
            {f.options.map(([v, label]) => (
              <option key={v} value={v}>
                {`${f.label}: ${t(label)}`}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.7em] top-1/2 size-[1em] -translate-y-1/2 text-[#14365a]" />
        </label>
      ))}

      <button
        type="button"
        onClick={() => onCompact(!compact)}
        aria-pressed={compact}
        aria-label={compact ? t("List view") : t("Grid view")}
        className={`grid size-[2.6em] place-items-center rounded-[0.7em] ${compact ? "bg-[#e0f6fc] text-[#0b6f86]" : "bg-[#eef3fa] text-[#14365a]"}`}
      >
        {compact ? <List className="size-[1.1em]" /> : <LayoutGrid className="size-[1.1em]" />}
      </button>
    </div>
  );
}
