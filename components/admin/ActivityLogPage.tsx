"use client";

import { useMemo, useState } from "react";
import { ListChecks, LogIn, Search, ShieldAlert, UserCheck } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { AdminCard, AdminDialog, AdminPageHero, FIELD, type HeroStat } from "./AdminPageFrame";

const MODULES = ["Permissions", "Assignments", "Students", "Certificates"] as const;
type AdminModule = (typeof MODULES)[number];

type Log = {
  id: number;
  admin: string;
  module: AdminModule;
  action: string;
  minutesAgo: number;
};

// Mock data: replace with your API call (e.g. getActivityLogs()).
const LOGS: Log[] = [
  { id: 1, admin: "Mohammed Yasser", module: "Permissions", action: "Updated role permissions", minutesAgo: 1440 },
  { id: 2, admin: "Sarah Ahmed", module: "Assignments", action: "Published a new assignment", minutesAgo: 10 },
  { id: 3, admin: "Amr Hassan", module: "Students", action: "Approved a student registration", minutesAgo: 45 },
  { id: 4, admin: "Nada Ali", module: "Certificates", action: "Issued a certificate", minutesAgo: 120 },
];

const AVATAR_COLORS = ["#ffc531", "#ff9f6b", "#7fcdf1", "#9de0d0"];

type TFn = (key: string, vars?: Record<string, string | number>) => string;

function ago(t: TFn, minutes: number) {
  if (minutes < 60) return t("{count}m ago", { count: minutes });
  if (minutes < 1440) return t("{count}h ago", { count: Math.floor(minutes / 60) });
  const days = Math.floor(minutes / 1440);

  return days === 1 ? t("Yesterday") : t("{count}d ago", { count: days });
}

export default function ActivityLogPage() {
  const { t } = useI18n();

  const [query, setQuery] = useState("");
  const [moduleFilter, setModuleFilter] = useState<"all" | AdminModule>("all");
  const [selected, setSelected] = useState<Log | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();

    return LOGS.filter(
      (l) =>
        (moduleFilter === "all" || l.module === moduleFilter) &&
        l.admin.toLowerCase().includes(q),
    );
  }, [query, moduleFilter]);

  const stats: HeroStat[] = [
    { label: "Total Logs", value: "1,420", icon: ListChecks },
    { label: "Active Admins", value: "12", icon: UserCheck, valueClass: "text-[#0f8a86]" },
    { label: "Security Alerts", value: "0", icon: ShieldAlert, valueClass: "text-[#e0245e]" },
    { label: "Successful Logins", value: "1,280", icon: LogIn, valueClass: "text-[#1b9a4a]" },
  ];

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
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search by admin name")}
                className={`${FIELD} ps-9 sm:w-52`}
              />
            </label>

            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value as "all" | AdminModule)}
              aria-label={t("Filter by module")}
              className={`${FIELD} sm:w-40`}
            >
              <option value="all">{t("All modules")}</option>
              {MODULES.map((m) => (
                <option key={m} value={m}>
                  {t(m)}
                </option>
              ))}
            </select>
          </div>
        </div>

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
              {rows.map((log, i) => (
                <tr key={log.id} className="border-b border-[#eef2f7] last:border-0">
                  <td className="py-2.5 pe-3">
                    <span className="flex items-center gap-2 font-medium">
                      <span
                        aria-hidden
                        className="grid size-7 shrink-0 place-items-center rounded-full text-[0.65rem] font-bold text-[#14365a]"
                        style={{ backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }}
                      >
                        {log.admin
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .slice(0, 2)}
                      </span>
                      {log.admin}
                    </span>
                  </td>

                  <td className="py-2.5 pe-3 text-[#14365a]/60">{t(log.module)}</td>
                  <td className="py-2.5 pe-3 text-[#14365a]/60">{ago(t, log.minutesAgo)}</td>

                  <td className="py-2.5 text-end">
                    <button
                      type="button"
                      onClick={() => setSelected(log)}
                      className="rounded-full border border-[#cfe0ee] px-3 py-1 text-[0.68rem] font-semibold hover:bg-[#eef4fa]"
                    >
                      {t("View Details")}
                    </button>
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#14365a]/55">
                    {t("No activity found")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      <AdminDialog open={!!selected} title="Activity Details" onClose={() => setSelected(null)}>
        {selected && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Admin")}</dt>
              <dd className="font-semibold">{selected.admin}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Module")}</dt>
              <dd className="font-semibold">{t(selected.module)}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Action")}</dt>
              <dd className="font-semibold">{t(selected.action)}</dd>
            </div>
            <div>
              <dt className="text-[0.7rem] text-[#14365a]/55">{t("Time & Date")}</dt>
              <dd className="font-semibold">{ago(t, selected.minutesAgo)}</dd>
            </div>
          </dl>
        )}
      </AdminDialog>
    </AdminPageHero>
  );
}