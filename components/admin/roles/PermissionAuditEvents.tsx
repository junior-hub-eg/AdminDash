"use client";

import { useState } from "react";
import Link from "next/link";
import { History, ShieldHalf } from "lucide-react";
import { getAuditLog } from "@/lib/admin-security-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";
import { PANEL } from "../page-parts";
import { ago, SeverityPill, summaryOf } from "../security/audit-ui";

const loadRoleEvents = () => getAuditLog({ module: "Roles", pageSize: 6 });

/** Recent Permission Audit Events: the newest audit entries of the Roles module. */
export function PermissionAuditEvents() {
  const t = useT();
  const [now] = useState(() => Date.now());
  const events = useAdminData(loadRoleEvents, tk("We couldn't load the audit log. Please try again."));

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
      </header>

      {!events.data ? (
        <LoadState error={events.error} onRetry={events.reload} className="flex-1" />
      ) : events.data.items.length === 0 ? (
        <div className="grid flex-1 place-items-center rounded-[0.8em] border border-dashed border-[#d5dfeb] bg-[#f7faff] px-[1em] py-[2.5em] text-center">
          <div>
            <span className="mx-auto grid size-[2.8em] place-items-center rounded-full bg-[#e6eefb] text-[#0b6f86]">
              <History className="size-[1.3em]" />
            </span>
            <p className="mt-[0.7em] text-[0.85em] font-semibold text-[#0b1b2b]">{t("No permission changes recorded yet")}</p>
            <p className="mt-[0.2em] text-[0.72em] text-[#5b6b7c]">{t("Changes to roles and their privileges will be listed here.")}</p>
          </div>
        </div>
      ) : (
        <ul className="flex-1 space-y-[0.6em]">
          {events.data.items.map((e) => (
            <li key={e.id} className="flex items-start gap-[0.7em] rounded-[0.8em] bg-[#f7faff] px-[0.9em] py-[0.7em]">
              <History className="mt-[0.15em] size-[1.1em] shrink-0 text-[#0b6f86]" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.82em] font-semibold text-[#0b1b2b]">{summaryOf(t, e)}</p>
                <p className="text-[0.7em] text-[#5b6b7c]">
                  {e.actorName === "Anonymous" ? t("Anonymous") : e.actorName} · {ago(t, e.createdUtc, now)}
                </p>
              </div>
              <SeverityPill severity={e.severity} />
            </li>
          ))}
        </ul>
      )}

      <p className="mt-[1.2em] flex flex-wrap justify-between gap-[0.5em] text-[0.75em] text-[#5b6b7c]">
        <span>{t("{count} role changes recorded", { count: events.data?.total ?? 0 })}</span>
        <Link href="/admin/security" className="font-semibold text-[#0b6f86] hover:underline">
          {t("Open Audit Log Console")} <span className="inline-block rtl:rotate-180">→</span>
        </Link>
      </p>
    </section>
  );
}
