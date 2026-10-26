"use client";

import { certificateTitle } from "@/lib/certificate-title";
import { Award, ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";

import type { AdminCertificate, AdminCertificatePage, CertificateStatus } from "@/lib/admin-certificates-api";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { StudentAvatar } from "../StudentsTable";
import { PANEL } from "../page-parts";

export const STATUS_STYLE: Record<CertificateStatus, string> = {
  Pending: "bg-[#fdeec2] text-[#a8740a]",
  Issued: "bg-[#d7efe6] text-[#12676b]",
  Revoked: "bg-[#fdecec] text-[#b83232]",
};

export const STATUS_LABEL: Record<CertificateStatus, string> = {
  Pending: tk("Awaiting Approval"),
  Issued: tk("Issued"),
  Revoked: tk("Revoked"),
};

export const KIND_LABEL = { TrackCompletion: tk("Track Completion"), Capstone: tk("Capstone") } as const;

export const formatCertificateDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(dateLocale("en-US"), { dateStyle: "medium" }) : "—";

/** Page numbers to show: the first, the last, and two around the current one. */
function pages(current: number, last: number): (number | "…")[] {
  const out: (number | "…")[] = [];
  for (let p = 1; p <= last; p++) {
    if (p === 1 || p === last || Math.abs(p - current) <= 1) out.push(p);
    else if (out[out.length - 1] !== "…") out.push("…");
  }
  return out;
}

/** The certificates of the current tab and filters, one page at a time; a click selects a row for the preview. */
export default function CertificatesTable({
  data,
  loading,
  selectedId,
  onSelect,
  onPage,
}: {
  data: AdminCertificatePage | null;
  loading: boolean;
  selectedId: string | null;
  onSelect: (certificate: AdminCertificate) => void;
  onPage: (page: number) => void;
}) {
  const { t } = useI18n();
  const th = "px-[1.3em] py-[1.1em] text-start text-[0.85em] font-semibold uppercase tracking-[0.04em] text-[#3d4f61]";
  const items = data?.items ?? [];
  const page = data?.page ?? 1;
  const last = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const from = data && data.total > 0 ? (page - 1) * data.pageSize + 1 : 0;
  const to = data ? Math.min(data.total, page * data.pageSize) : 0;

  return (
    <div className={`${PANEL} min-w-0 overflow-hidden`}>
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[46em] text-[0.78em] text-[#14365a]">
          <thead className="bg-[#eaf1fd]">
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
            {items.map((c, i) => {
              const selected = c.id === selectedId;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelect(c)}
                  aria-selected={selected}
                  className={`cursor-pointer border-t border-[#eef2f7] ${selected ? "bg-[#e9f7fc]" : "hover:bg-[#f6f9fd]"}`}
                >
                  <td className="px-[1.3em] py-[0.9em]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(c);
                      }}
                      className="flex items-center gap-[0.7em] text-start"
                    >
                      <StudentAvatar student={{ photoUrl: c.photoUrl, gender: null }} index={i} />
                      <span className="font-semibold text-[#0b1b2b]">{c.studentName}</span>
                    </button>
                  </td>
                  <td className="px-[1.3em] py-[0.9em]">
                    <p className="font-semibold text-[#0b1b2b]">{certificateTitle(c.title, t)}</p>
                    <p className="text-[0.9em] text-[#5b6b7c]">{t(KIND_LABEL[c.kind])}</p>
                  </td>
                  <td className="px-[1.3em] py-[0.9em]">{c.trackName}</td>
                  <td className="whitespace-nowrap px-[1.3em] py-[0.9em]">
                    {c.issuedUtc ? formatCertificateDate(c.issuedUtc) : (
                      <span className="text-[#8a97a6]">{t("Requested {date}", { date: formatCertificateDate(c.requestedUtc) })}</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-[1.3em] py-[0.9em] font-mono text-[0.95em]" dir="ltr">
                    {c.credentialId}
                  </td>
                  <td className="px-[1.3em] py-[0.9em]">
                    <span className={`whitespace-nowrap rounded-full px-[0.7em] py-[0.25em] text-[0.9em] font-semibold ${STATUS_STYLE[c.status]}`}>
                      {t(STATUS_LABEL[c.status])}
                    </span>
                  </td>
                </tr>
              );
            })}

            {items.length === 0 && !loading && (
              <tr>
                <td colSpan={6} className="px-[1.3em] py-[3em] text-center">
                  <span className="mx-auto grid size-[2.8em] place-items-center rounded-full bg-[#e6eefb] text-[#0b6f86]">
                    <Award className="size-[1.3em]" />
                  </span>
                  <p className="mt-[0.7em] font-semibold text-[#0b1b2b]">{t("No certificates found")}</p>
                  <p className="mt-[0.2em] text-[0.92em] text-[#5b6b7c]">
                    {t("Use \"Find eligible students\" or issue a certificate to fill this list.")}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && (
          <div role="status" aria-label={t("Loading")} className="absolute inset-0 grid place-items-center bg-white/60">
            <LoaderCircle className="size-[1.8em] animate-spin text-[#0f7378]" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[0.8em] px-[1.3em] py-[1em] text-[0.72em] text-[#5b6b7c]">
        <p>{t("Showing {from}–{to} of {total} certificates", { from, to, total: data?.total ?? 0 })}</p>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => onPage(page - 1)}
            aria-label={t("Previous page")}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] hover:bg-[#eef3fb] disabled:opacity-35"
          >
            <ChevronLeft className="size-[1.1em]" />
          </button>
          {pages(page, last).map((p, i) =>
            p === "…" ? (
              <span key={`gap-${i}`} className="px-[0.3em]">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                aria-current={p === page ? "page" : undefined}
                disabled={loading}
                onClick={() => onPage(p)}
                className={`grid size-[2.2em] place-items-center rounded-[0.4em] font-semibold ${
                  p === page ? "bg-[#06b6d4] text-white" : "hover:bg-[#eef3fb]"
                }`}
              >
                {p}
              </button>
            ),
          )}
          <button
            type="button"
            disabled={page >= last || loading}
            onClick={() => onPage(page + 1)}
            aria-label={t("Next page")}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] hover:bg-[#eef3fb] disabled:opacity-35"
          >
            <ChevronRight className="size-[1.1em]" />
          </button>
        </nav>
      </div>
    </div>
  );
}
