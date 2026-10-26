"use client";

import { CalendarDays, ChevronDown, Search, SlidersHorizontal } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

const TABS = [
  { key: "all", label: tk("All Certificates") },
  { key: "pending", label: tk("Awaiting Approval") },
  { key: "issued", label: tk("Issued & Verified") },
  { key: "revoked", label: tk("Revoked") },
];

const BOX = "h-[2.9em] rounded-[0.6em] bg-[#eef3fb] text-[0.78em] text-[#0b1b2b] outline-none disabled:cursor-not-allowed";

/**
 * Status tabs and the search / track / cohort bar of the design. With no certificates to list,
 * the counts show "—" and the controls stay disabled until the certificates API exists.
 */
export default function CertificateFilters({ tracks }: { tracks: string[] }) {
  const { t } = useI18n();
  const soon = t("Coming soon");

  return (
    <div className="space-y-[0.8em]">
      <div role="tablist" aria-label={t("Certificate status")} className={`${PANEL} flex flex-wrap gap-[0.3em] p-[0.5em]`}>
        {TABS.map(({ key, label }, i) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={i === 0}
            disabled={i !== 0}
            title={i !== 0 ? soon : undefined}
            className={`flex items-center gap-[0.5em] rounded-[0.6em] px-[1em] py-[0.6em] text-[0.78em] font-semibold disabled:cursor-not-allowed ${
              i === 0 ? "bg-[#e3f3fb] text-[#0b6f86]" : "text-[#3d4f61]"
            }`}
          >
            {t(label)}
            <span className={`rounded-[0.4em] px-[0.5em] py-[0.05em] text-[0.85em] font-bold ${i === 0 ? "bg-[#c4e9f6] text-[#0b6f86]" : "bg-[#e6eefb] text-[#3d4f61]"}`}>
              —
            </span>
          </button>
        ))}
      </div>

      <div className={`${PANEL} flex flex-wrap items-center gap-[0.6em] p-[0.9em]`}>
        <label className="relative min-w-[12em] flex-1">
          <span className="sr-only">{t("Search certificates")}</span>
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
          <input
            disabled
            title={soon}
            placeholder={t("Search by student name, hash ID, capstone title...")}
            className={`${BOX} w-full ps-[2.6em] pe-[0.9em] placeholder:text-[#8a97a6]`}
          />
        </label>

        <label className="relative w-[11em]">
          <span className="sr-only">{t("Track")}</span>
          <select disabled title={soon} className={`${BOX} w-full appearance-none ps-[0.9em] pe-[2.2em]`}>
            <option>{t("All Tracks")}</option>
            {tracks.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>

        <label className="relative w-[10em]">
          <span className="sr-only">{t("Cohort")}</span>
          <select disabled title={soon} className={`${BOX} w-full appearance-none ps-[0.9em] pe-[2.2em]`}>
            <option>{t("All Cohorts")}</option>
          </select>
          <CalendarDays className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>

        <button
          type="button"
          disabled
          title={soon}
          aria-label={t("Filter")}
          className="grid size-[2.3em] place-items-center rounded-[0.6em] bg-[#eef3fb] text-[#5b6b7c] disabled:cursor-not-allowed"
        >
          <SlidersHorizontal className="size-[1em]" />
        </button>
      </div>
    </div>
  );
}
