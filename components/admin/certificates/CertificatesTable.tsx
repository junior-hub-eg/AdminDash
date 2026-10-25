"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import type { CertStatus, MockCertificate } from "../dashboardMock";

type Props = {
  rows: MockCertificate[];
  /** Number of certificates after filtering (all pages). */
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
};

const AVATAR_TONES = [
  "bg-[#06b6d4] text-white",
  "bg-[#dbe7ff] text-[#1d4ed8]",
  "bg-[#e0e4ff] text-[#3b3fb0]",
  "bg-[#d4f3ec] text-[#0f766e]",
  "bg-[#ffe1e4] text-[#c0263f]",
];

const TRACK_TONE: Record<string, string> = {
  "UI/UX Track": "bg-[#e0f4fa] text-[#0a7f99]",
  "Frontend Track": "bg-[#dff7f0] text-[#0f766e]",
  "Backend Track": "bg-[#e1f1fb] text-[#12676b]",
  "Mobile Track": "bg-[#e1f1fb] text-[#12676b]",
  "Game Dev": "bg-[#eceff4] text-[#3f4b63]",
};

const STATUS_UI: Record<CertStatus, { label: string; pill: string; dot: string }> = {
  issued: { label: "Issued", pill: "bg-[#e1f6ea] text-[#16794a]", dot: "bg-[#1b9a4a]" },
  pending: { label: "Awaiting", pill: "bg-[#ece9ff] text-[#4f46b5]", dot: "bg-[#6b63d6]" },
  revoked: { label: "Revoked", pill: "bg-[#ffe6e6] text-[#b42a2a]", dot: "bg-[#e04848]" },
};

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** 1 2 3 … 98 style page list. */
function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 6) return Array.from({ length: count }, (_, i) => i + 1);

  const out: (number | "gap")[] = [];
  const near = new Set([1, count, page - 1, page, page + 1]);

  for (let i = 1; i <= count; i++) {
    if (near.has(i)) out.push(i);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }

  return out;
}

export default function CertificatesTable({ rows, total, page, pageSize, onPage, selectedId, onSelect }: Props) {
  const { t } = useI18n();

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  const formatDate = (iso: string) =>
    new Date(`${iso}T00:00:00`).toLocaleDateString(dateLocale(), { dateStyle: "medium" });

  const th = "px-4 py-3 text-start text-[0.66rem] font-semibold uppercase tracking-wider text-[#14365a]/55";

  return (
    <div className="rounded-2xl bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[50rem] text-[0.78rem] text-[#14365a]">
          <thead className="bg-[#f1f6fa]">
            <tr>
              <th scope="col" className={th}>{t("Recipient Student")}</th>
              <th scope="col" className={th}>{t("Certificate Title")}</th>
              <th scope="col" className={th}>{t("Track")}</th>
              <th scope="col" className={th}>{t("Issue Date")}</th>
              <th scope="col" className={th}>{t("Credential ID")}</th>
              <th scope="col" className={th}>{t("Status")}</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#14365a]/55">
                  {t("No certificates match your filters.")}
                </td>
              </tr>
            )}

            {rows.map((r, i) => {
              const selected = r.id === selectedId;
              const st = STATUS_UI[r.status];

              return (
                <tr
                  key={r.id}
                  onClick={() => onSelect(r.id)}
                  className={`cursor-pointer border-b border-[#eef2f7] last:border-0 transition-colors ${
                    selected ? "bg-[#eaf8fc]" : "hover:bg-[#f6fafc]"
                  }`}
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onSelect(r.id)}
                      aria-pressed={selected}
                      className="flex items-center gap-3 text-start"
                    >
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full text-[0.72rem] font-bold ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                      >
                        {initials(r.student)}
                      </span>
                      <span className="whitespace-nowrap">
                        <span className="block font-semibold">{r.student}</span>
                        <span className="block text-[0.68rem] text-[#14365a]/55">{r.studentCode}</span>
                      </span>
                    </button>
                  </td>

                  <td className="max-w-[10rem] px-4 py-3">
                    <span className="block truncate" title={r.title}>
                      {r.title}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${TRACK_TONE[r.track] ?? "bg-[#eceff4] text-[#3f4b63]"}`}
                    >
                      {t(r.track)}
                    </span>
                  </td>

                  <td className="whitespace-nowrap px-4 py-3 text-[#14365a]/65">{formatDate(r.date)}</td>

                  <td className="px-4 py-3">
                    <span dir="ltr" className="whitespace-nowrap rounded-md bg-[#eef2f7] px-2 py-1 font-mono text-[0.7rem] font-semibold">
                      #{r.credentialId}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${st.pill}`}
                    >
                      <span className={`size-1.5 rounded-full ${st.dot}`} />
                      {t(st.label)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-[0.72rem] text-[#14365a]/65">
        <p>
          {t("Showing")} {from} {t("to")} {to} {t("of")} {total.toLocaleString("en")} {t("certificates")}
        </p>

        <nav aria-label={t("Pagination")} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPage(page - 1)}
            disabled={page <= 1}
            aria-label={t("Previous page")}
            className="grid size-8 place-items-center rounded-lg hover:bg-[#eef4fa] disabled:opacity-35"
          >
            <ChevronLeft className="size-4 rtl:rotate-180" />
          </button>

          {pageList(page, pageCount).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-1">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPage(p)}
                aria-current={p === page ? "page" : undefined}
                className={`grid size-8 place-items-center rounded-lg text-[0.74rem] font-semibold ${
                  p === page ? "bg-[#06b6d4] text-white" : "hover:bg-[#eef4fa]"
                }`}
              >
                {p}
              </button>
            ),
          )}

          <button
            type="button"
            onClick={() => onPage(page + 1)}
            disabled={page >= pageCount}
            aria-label={t("Next page")}
            className="grid size-8 place-items-center rounded-lg hover:bg-[#eef4fa] disabled:opacity-35"
          >
            <ChevronRight className="size-4 rtl:rotate-180" />
          </button>
        </nav>
      </div>
    </div>
  );
}