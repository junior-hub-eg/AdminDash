"use client";

import { ChevronDown, Layers, RotateCcw, Search } from "lucide-react";

import type { AdminCertificateCounts, CertificateKind, CertificateStatus } from "@/lib/admin-certificates-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

export type CertificateTab = "all" | "pending" | "issued" | "revoked";

export const TAB_STATUS: Record<CertificateTab, CertificateStatus | null> = {
  all: null,
  pending: "Pending",
  issued: "Issued",
  revoked: "Revoked",
};

const TABS: { key: CertificateTab; label: string }[] = [
  { key: "all", label: tk("All Certificates") },
  { key: "pending", label: tk("Awaiting Approval") },
  { key: "issued", label: tk("Issued & Verified") },
  { key: "revoked", label: tk("Revoked") },
];

const BOX = "h-[2.9em] rounded-[0.6em] bg-[#eef3fb] text-[0.78em] text-[#0b1b2b] outline-none focus:ring-2 focus:ring-[#06b6d4]/40";

export interface CertificateFilterValues {
  search: string;
  trackCode: string;
  kind: CertificateKind | "";
}

/** Status tabs with their counts, and the search / track / kind bar. */
export default function CertificateFilters({
  tab,
  onTab,
  counts,
  tracks,
  values,
  onChange,
}: {
  tab: CertificateTab;
  onTab: (tab: CertificateTab) => void;
  counts: AdminCertificateCounts | null;
  tracks: { code: string; name: string }[];
  values: CertificateFilterValues;
  onChange: (values: CertificateFilterValues) => void;
}) {
  const { t } = useI18n();
  const filtered = values.search !== "" || values.trackCode !== "" || values.kind !== "";

  return (
    <div className="space-y-[0.8em]">
      <div role="tablist" aria-label={t("Certificate status")} className={`${PANEL} flex flex-wrap gap-[0.3em] p-[0.5em]`}>
        {TABS.map(({ key, label }) => {
          const active = key === tab;
          return (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onTab(key)}
              className={`flex items-center gap-[0.5em] rounded-[0.6em] px-[1em] py-[0.6em] text-[0.78em] font-semibold ${
                active ? "bg-[#e3f3fb] text-[#0b6f86]" : "text-[#3d4f61] hover:bg-[#f1f6fb]"
              }`}
            >
              {t(label)}
              <span className={`rounded-[0.4em] px-[0.5em] py-[0.05em] text-[0.85em] font-bold ${active ? "bg-[#c4e9f6] text-[#0b6f86]" : "bg-[#e6eefb] text-[#3d4f61]"}`}>
                {counts ? counts[key] : "—"}
              </span>
            </button>
          );
        })}
      </div>

      <div className={`${PANEL} flex flex-wrap items-center gap-[0.6em] p-[0.9em]`}>
        <label className="relative min-w-[12em] flex-1">
          <span className="sr-only">{t("Search certificates")}</span>
          <Search className="pointer-events-none absolute start-[0.9em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
          <input
            type="search"
            value={values.search}
            onChange={(e) => onChange({ ...values, search: e.target.value })}
            placeholder={t("Search by student name, credential ID, title...")}
            className={`${BOX} w-full ps-[2.6em] pe-[0.9em] placeholder:text-[#8a97a6]`}
          />
        </label>

        <label className="relative w-[11em]">
          <span className="sr-only">{t("Track")}</span>
          <select
            value={values.trackCode}
            onChange={(e) => onChange({ ...values, trackCode: e.target.value })}
            className={`${BOX} w-full appearance-none ps-[0.9em] pe-[2.2em]`}
          >
            <option value="">{t("All Tracks")}</option>
            {tracks.map((x) => (
              <option key={x.code} value={x.code}>
                {x.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>

        <label className="relative w-[11em]">
          <span className="sr-only">{t("Certificate type")}</span>
          <select
            value={values.kind}
            onChange={(e) => onChange({ ...values, kind: e.target.value as CertificateKind | "" })}
            className={`${BOX} w-full appearance-none ps-[0.9em] pe-[2.2em]`}
          >
            <option value="">{t("All Types")}</option>
            <option value="TrackCompletion">{t("Track Completion")}</option>
            <option value="Capstone">{t("Capstone")}</option>
          </select>
          <Layers className="pointer-events-none absolute end-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
        </label>

        <button
          type="button"
          disabled={!filtered}
          onClick={() => onChange({ search: "", trackCode: "", kind: "" })}
          title={t("Clear filters")}
          aria-label={t("Clear filters")}
          className="grid size-[2.3em] place-items-center rounded-[0.6em] bg-[#eef3fb] text-[#5b6b7c] hover:bg-[#e3ecf8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="size-[1em]" />
        </button>
      </div>
    </div>
  );
}
