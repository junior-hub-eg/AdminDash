"use client";

import { CalendarDays, ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";

export type CertTab = "all" | "pending" | "issued" | "revoked";

type Props = {
  tab: CertTab;
  onTab: (tab: CertTab) => void;
  counts: Record<CertTab, number>;
  query: string;
  onQuery: (value: string) => void;
  track: string;
  onTrack: (value: string) => void;
  tracks: string[];
  cohort: string;
  onCohort: (value: string) => void;
  cohorts: string[];
  onReset: () => void;
};

const TABS: { key: CertTab; label: string }[] = [
  { key: "all", label: "All Certificates" },
  { key: "pending", label: "Awaiting Approval" },
  { key: "issued", label: "Issued & Verified" },
  { key: "revoked", label: "Revoked" },
];

const SELECT =
  "h-10 w-full appearance-none rounded-xl border border-[#e1e8f0] bg-[#f4f8fb] ps-3.5 pe-9 text-[0.78rem] font-medium text-[#14365a] outline-none focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20";

export default function CertificateFilters({
  tab,
  onTab,
  counts,
  query,
  onQuery,
  track,
  onTrack,
  tracks,
  cohort,
  onCohort,
  cohorts,
  onReset,
}: Props) {
  const { t } = useI18n();

  return (
    <div className="space-y-3">
      <div role="tablist" aria-label={t("Certificate status")} className="flex flex-wrap gap-1.5 rounded-2xl bg-white p-2 shadow-sm">
        {TABS.map(({ key, label }) => {
          const active = tab === key;

          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(key)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-[0.78rem] font-semibold transition-colors ${
                active ? "bg-[#e3f6fb] text-[#0a7f99]" : "text-[#14365a]/70 hover:bg-[#f1f6fa]"
              }`}
            >
              {t(label)}
              <span
                className={`rounded-full px-2 py-0.5 text-[0.66rem] font-bold ${
                  active ? "bg-[#bfeaf5] text-[#0a7f99]" : "bg-[#e8eef4] text-[#14365a]/70"
                }`}
              >
                {counts[key].toLocaleString("en")}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2.5 rounded-2xl bg-white p-3 shadow-sm">
        <label className="relative min-w-[12rem] flex-1">
          <span className="sr-only">{t("Search certificates")}</span>
          <Search className="pointer-events-none absolute start-3.5 top-1/2 size-4 -translate-y-1/2 text-[#14365a]/45" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder={t("Search by student name, hash ID, capstone title...")}
            className="h-10 w-full rounded-xl border border-[#e1e8f0] bg-[#f4f8fb] ps-10 pe-3 text-[0.78rem] text-[#14365a] outline-none placeholder:text-[#14365a]/45 focus:border-[#06b6d4] focus:ring-2 focus:ring-[#06b6d4]/20"
          />
        </label>

        <label className="relative w-40">
          <span className="sr-only">{t("Track")}</span>
          <select value={track} onChange={(e) => onTrack(e.target.value)} className={SELECT}>
            <option value="all">{t("All Tracks")}</option>
            {tracks.map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[#14365a]/55" />
        </label>

        <label className="relative w-44">
          <span className="sr-only">{t("Cohort")}</span>
          <select value={cohort} onChange={(e) => onCohort(e.target.value)} className={SELECT}>
            <option value="all">{t("All Cohorts")}</option>
            {cohorts.map((x) => (
              <option key={x} value={x}>
                {t(x)}
              </option>
            ))}
          </select>
          <CalendarDays className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-[#14365a]/55" />
        </label>

        <button
          type="button"
          onClick={onReset}
          title={t("Reset filters")}
          aria-label={t("Reset filters")}
          className="grid size-10 place-items-center rounded-xl border border-[#e1e8f0] bg-[#f4f8fb] text-[#14365a]/60 hover:bg-[#e8f1f7]"
        >
          <SlidersHorizontal className="size-4" />
        </button>
      </div>
    </div>
  );
}