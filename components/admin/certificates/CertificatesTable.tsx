"use client";

import { Award, ChevronLeft, ChevronRight } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/**
 * The designed certificates table. There is no admin certificates API yet, so it shows the
 * columns with an empty state instead of rows.
 */
export default function CertificatesTable() {
  const { t } = useI18n();
  const th = "px-[1.3em] py-[1.1em] text-start text-[0.85em] font-semibold uppercase tracking-[0.04em] text-[#3d4f61]";

  return (
    <div className={`${PANEL} min-w-0 overflow-hidden`}>
      <div className="overflow-x-auto">
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
            <tr>
              <td colSpan={6} className="px-[1.3em] py-[3em] text-center">
                <span className="mx-auto grid size-[2.8em] place-items-center rounded-full bg-[#e6eefb] text-[#0b6f86]">
                  <Award className="size-[1.3em]" />
                </span>
                <p className="mt-[0.7em] font-semibold text-[#0b1b2b]">{t("No certificates issued yet")}</p>
                <p className="mt-[0.2em] text-[0.92em] text-[#5b6b7c]">{t("Issued capstone and track certificates will be listed here.")}</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-[0.8em] px-[1.3em] py-[1em] text-[0.72em] text-[#5b6b7c]">
        <p>{t("Showing 0 of 0 certificates")}</p>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button type="button" disabled aria-label={t("Previous page")} className="grid size-[2.2em] place-items-center rounded-[0.4em] opacity-35">
            <ChevronLeft className="size-[1.1em] rtl:rotate-180" />
          </button>
          <span aria-current="page" className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#06b6d4] font-semibold text-white">
            1
          </span>
          <button type="button" disabled aria-label={t("Next page")} className="grid size-[2.2em] place-items-center rounded-[0.4em] opacity-35">
            <ChevronRight className="size-[1.1em] rtl:rotate-180" />
          </button>
        </nav>
      </div>
    </div>
  );
}
