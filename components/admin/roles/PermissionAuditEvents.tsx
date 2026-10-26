"use client";

import { History, ListFilter, ShieldHalf } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/**
 * The designed audit card. The backend does not record permission changes yet,
 * so it shows an empty state instead of invented events.
 */
export function PermissionAuditEvents() {
  const t = useT();
  return (
    <section className={`${PANEL} flex min-w-0 flex-col p-[1.3em]`}>
      <header className="mb-[1em] flex items-start justify-between gap-[0.6em]">
        <div className="flex items-center gap-[0.8em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-[#e6eefb] text-[#14365a]">
            <ShieldHalf className="size-[1.15em]" />
          </span>
          <div>
            <h2 className="text-[1.05em] font-bold text-[#0b1b2b]">{t("Recent Permission Audit Events")}</h2>
            <p className="text-[0.75em] text-[#5b6b7c]">{t("Immutable ledger of privileges modifications")}</p>
          </div>
        </div>
        <button type="button" disabled title={t("Coming soon")} aria-label={t("Filter")} className="cursor-not-allowed text-[#8a97a6]">
          <ListFilter className="size-[1.2em]" />
        </button>
      </header>

      <div className="grid flex-1 place-items-center rounded-[0.8em] border border-dashed border-[#d5dfeb] bg-[#f7faff] px-[1em] py-[2.5em] text-center">
        <div>
          <span className="mx-auto grid size-[2.8em] place-items-center rounded-full bg-[#e6eefb] text-[#0b6f86]">
            <History className="size-[1.3em]" />
          </span>
          <p className="mt-[0.7em] text-[0.85em] font-semibold text-[#0b1b2b]">{t("No permission changes recorded yet")}</p>
          <p className="mt-[0.2em] text-[0.72em] text-[#5b6b7c]">{t("Changes to role privileges will be listed here once the audit log is available.")}</p>
        </div>
      </div>

      <p className="mt-[1.2em] flex flex-wrap justify-between gap-[0.5em] text-[0.75em] text-[#5b6b7c]">
        <span>{t("Exportable cryptographic trail")}</span>
        <button type="button" disabled title={t("Coming soon")} className="cursor-not-allowed font-semibold text-[#0b6f86]/60">
          {t("Open Audit Log Console")} <span className="inline-block rtl:rotate-180">→</span>
        </button>
      </p>
    </section>
  );
}
