"use client";

import { ListFilter } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_ROLE_AUDIT } from "../dashboardMock";
import { Section } from "../mentor-detail/parts";

export function PermissionAuditEvents() {
  const t = useT();
  return (
    <Section
      title={t("Recent Permission Audit Events")}
      sub={t("Immutable ledger of privileges modifications")}
      action={<button type="button" aria-label={t("Filter")} className="text-[#5b6b7c]"><ListFilter className="size-[1.2em]" /></button>}
    >
      <ol className="grid gap-[1em]">
        {MOCK_ROLE_AUDIT.map((e) => (
          <li key={e.title} className="flex gap-[0.8em] text-[0.8em]">
            <span className="mt-[0.3em] size-[0.9em] shrink-0 rounded-full" style={{ background: e.color }} />
            <div className="min-w-0 flex-1">
              <p className="flex justify-between gap-[0.5em]"><b className="text-[#0b1b2b]">{t(e.title)}</b><span className="shrink-0 text-[0.85em] text-[#8a97a6]">{t(e.when)}</span></p>
              <p className="text-[0.9em] text-[#5b6b7c]">{t(e.text)}</p>
              {e.hash && <p className="mt-[0.2em] font-mono text-[0.75em] text-[#8a97a6]">AUTH-HASH: {e.hash} • <span className="font-sans font-semibold text-[#0b6f86]">{t(e.tag)}</span></p>}
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-[1em] flex justify-between text-[0.75em] text-[#5b6b7c]">
        <span>{t("Exportable cryptographic trail")}</span>
        <button type="button" className="font-semibold text-[#0b6f86]">{t("Open Audit Log Console")} →</button>
      </p>
    </Section>
  );
}