"use client";

import { useCallback, useDeferredValue, useState } from "react";
import { ListChecks, LogIn, Search, ShieldAlert, UserCheck } from "lucide-react";

import { AUDIT_MODULES, getAuditLog, getLoginAttempts, getSecurityOverview, type AuditEntry } from "@/lib/admin-security-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminCard, AdminDialog, AdminPageHero, FIELD, type HeroStat } from "./AdminPageFrame";
import { LoadState, useAdminData } from "./admin-data";
import { DASH, fmt } from "./reports/ui";
import { ago, deviceOf, moduleLabel, SeverityPill, stamp, summaryOf } from "./security/audit-ui";
import { Pager } from "./security/SecurityPanels";

const AVATAR_COLORS = ["#ffc531", "#ff9f6b", "#7fcdf1", "#9de0d0"];
const PAGE_SIZE = 20;

const successfulLogins = () => getLoginAttempts(true, 1, 1);

/** Activity Log & System Audit: the admin audit trail (GET admin/audit). */
export default function ActivityLogPage() {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditEntry | null>(null);
  const [now] = useState(() => Date.now());
  const actor = useDeferredValue(query.trim());

  const load = useCallback(
    () => getAuditLog({ actor: actor || undefined, module: moduleFilter || undefined, page, pageSize: PAGE_SIZE }),
    [actor, moduleFilter, page],
  );
  const log = useAdminData(load, tk("We couldn't load the audit log. Please try again."));
  const overview = useAdminData(getSecurityOverview, tk("We couldn't load the security overview. Please try again."));
  const logins = useAdminData(successfulLogins, tk("We couldn't load the sign-in history. Please try again."));

  const o = overview.data;
  const stats: HeroStat[] = [
    { label: "Total Logs", value: log.data ? fmt(log.data.total) : DASH, icon: ListChecks },
    { label: "Active Admins", value: o ? fmt(o.adminsSignedInThisWeek) : DASH, icon: UserCheck, valueClass: "text-[#0f8a86]", hint: "Signed in during the last 7 days" },
    { label: "Security Alerts", value: o ? fmt(o.criticalEvents7d) : DASH, icon: ShieldAlert, valueClass: "text-[#e0245e]", hint: "Critical events in the last 7 days" },
    { label: "Successful Logins", value: logins.data ? fmt(logins.data.total) : DASH, icon: LogIn, valueClass: "text-[#1b9a4a]" },
  ];
  const pages = log.data ? Math.max(1, Math.ceil(log.data.total / PAGE_SIZE)) : 1;

  return (
    <AdminPageHero title="Activity Log & System Audit" stats={stats}>
      <AdminCard className="mx-auto max-w-3xl">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-bold text-[#14365a]">{t("Recent System Activities")}</h2>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative">
              <span className="sr-only">{t("Search by admin name")}</span>
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#14365a]/50" />
              <input
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setPage(1);
                }}
                placeholder={t("Search by admin name")}
                className={`${FIELD} ps-9 sm:w-52`}
              />
            </label>

            <select
              value={moduleFilter}
              onChange={(e) => {
                setModuleFilter(e.target.value);
                setPage(1);
              }}
              aria-label={t("Filter by module")}
              className={`${FIELD} sm:w-40`}
            >
              <option value="">{t("All modules")}</option>
              {AUDIT_MODULES.map((m) => (
                <option key={m} value={m}>
                  {moduleLabel(t, m)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!log.data ? (
          <LoadState error={log.error} onRetry={log.reload} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-[0.78rem] text-[#14365a]">
              <thead>
                <tr className="border-b border-[#e1e8f0] text-[0.68rem] text-[#14365a]/55">
                  <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Admin")}</th>
                  <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Module")}</th>
                  <th scope="col" className="py-2 pe-3 text-start font-medium">{t("Time & Date")}</th>
                  <th scope="col" className="py-2 text-end font-medium">{t("Actions")}</th>
                </tr>
              </thead>

              <tbody>
                {log.data.items.map((entry, i) => (
                  <tr key={entry.id} className="border-b border-[#eef2f7] last:border-0">
                    <td className="py-2.5 pe-3">
                      <span className="flex items-center gap-2 font-medium">
                        <span
                          aria-hidden
                          className="grid size-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold text-[#14365a]"
                          style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                        >
                          {entry.actorName
                            .split(" ")
                            .map((w) => w[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                        {entry.actorName === "Anonymous" ? t("Anonymous") : entry.actorName}
                      </span>
                    </td>

                    <td className="py-2.5 pe-3 text-[#14365a]/60">{moduleLabel(t, entry.module)}</td>
                    <td className="py-2.5 pe-3 text-[#14365a]/60" title={stamp(entry.createdUtc)}>
                      {ago(t, entry.createdUtc, now)}
                    </td>

                    <td className="py-2.5 text-end">
                      <button
                        type="button"
                        onClick={() => setSelected(entry)}
                        className="rounded-full border border-[#cfe0ee] px-3 py-1 text-[0.68rem] font-semibold hover:bg-[#eef4fa]"
                      >
                        {t("View Details")}
                      </button>
                    </td>
                  </tr>
                ))}

                {log.data.items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-[#14365a]/55">
                      {t("No activity found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-3 flex justify-end text-[0.75rem] text-[#14365a]/70">
          <Pager page={page} pages={pages} onChange={setPage} />
        </div>
      </AdminCard>

      <AdminDialog open={!!selected} title="Activity Details" onClose={() => setSelected(null)}>
        {selected && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Admin")}</dt>
              <dd className="font-semibold">
                {selected.actorName === "Anonymous" ? t("Anonymous") : selected.actorName}
                {selected.actorRole ? ` · ${t(selected.actorRole)}` : ""}
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Module")}</dt>
              <dd className="flex items-center gap-2 font-semibold">
                {moduleLabel(t, selected.module)} <SeverityPill severity={selected.severity} />
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Action")}</dt>
              <dd className="font-semibold">{summaryOf(t, selected)}</dd>
              <dd dir="ltr" className="break-all font-mono text-[0.72rem] text-[#14365a]/60 rtl:text-end">
                {selected.action} → {selected.statusCode}
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("IP & Client")}</dt>
              <dd className="font-semibold">
                <span dir="ltr">{selected.ip ?? DASH}</span> · {deviceOf(t, selected.userAgent)}
              </dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Time & Date")}</dt>
              <dd className="font-semibold">
                {stamp(selected.createdUtc)} ({ago(t, selected.createdUtc, now)})
              </dd>
            </div>
          </dl>
        )}
      </AdminDialog>
    </AdminPageHero>
  );
}
