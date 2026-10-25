"use client";

import { useCallback, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getAdminReport, type ReportPeriod } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { ReportStats } from "./ReportStats";
import { ReportCharts } from "./ReportCharts";
import { LoadState, useAdminData } from "./admin-data";
import { SystemReportPanel } from "./SystemReportPanel";

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "week", label: tk("This Week") },
  { id: "month", label: tk("This Month") },
  { id: "year", label: tk("This Year") },
];

export default function AdminReports() {
  const t = useT();
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const load = useCallback(() => getAdminReport(period), [period]);
  const report = useAdminData(load, tk("We couldn't load the report. Please try again."));
  // A new period loads in place; keep showing the last report until it arrives.
  const data = report.data;

  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the charts can sit on top of it */}
      <PageHero title={t("Reports & Analytics")} contentClassName="pb-[6em]">
        <label className="pointer-events-auto absolute end-[1.6em] top-[calc(var(--u)*5.6)] flex items-center gap-[0.4em] text-[0.8em] font-medium text-[#14365a]/80 lg:end-[9%]">
          <span className="sr-only">{t("Period")}</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as ReportPeriod)}
            className="cursor-pointer appearance-none bg-transparent pe-[1.4em] outline-none"
          >
            {PERIODS.map((p) => (
              <option key={p.id} value={p.id}>
                {t(p.label)}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none -ms-[1.4em] size-[1em]" />
        </label>

        {report.error && <LoadState error={report.error} onRetry={report.reload} className="mt-[1em]" />}
        <ReportStats stats={data?.stats ?? null} className="mt-[1.6em] lg:w-[85%]" />
      </PageHero>

      <div className="relative z-10 mx-auto -mt-[3.5em] w-full lg:w-[82%]">
        <ReportCharts report={data} />
        <SystemReportPanel className="mt-[1.2em]" />
      </div>
    </AdminPage>
  );
}
