"use client";

import { useCallback, useState } from "react";
import { CalendarDays, CloudDownload, Filter } from "lucide-react";
import { getAdminMentors, getAdminReport, getAdminSquads, getAdminTracks, getSystemReport, type ReportPeriod } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, INPUT, PageHeader } from "./page-parts";
import { useAdminData } from "./admin-data";
import { ReportStats } from "./ReportStats";
import { ReportCharts } from "./ReportCharts";
import { exportSystemCsv, SystemReportPanel } from "./SystemReportPanel";
import { TrackCompletion } from "./reports/TrackCompletion";
import { LevelDonut } from "./reports/LevelDonut";
import { SquadVelocity } from "./reports/SquadVelocity";
import { MentorWorkload } from "./reports/MentorWorkload";
import { ReportBuilder } from "./reports/ReportBuilder";

const PERIODS: { id: ReportPeriod; label: string }[] = [
  { id: "week", label: tk("Last 7 Days") },
  { id: "month", label: tk("Last 30 Days") },
  { id: "year", label: tk("Last 12 Months") },
];

const FAIL = tk("We couldn't load the report. Please try again.");

export default function AdminReports() {
  const t = useT();
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [track, setTrack] = useState("all");

  const load = useCallback(() => getAdminReport(period), [period]);
  const report = useAdminData(load, FAIL);
  const system = useAdminData(getSystemReport, FAIL);
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));

  const allTracks = tracks.data?.tracks ?? [];
  const inTrack = (code: string) => track === "all" || code === track;
  const shownTracks = tracks.data ? allTracks.filter((tr) => inTrack(tr.code)) : null;
  const shownMentors = mentors.data ? mentors.data.mentors.filter((m) => inTrack(m.trackCode)) : null;

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Telemetry live feed")}
        title={t("Analytics & Reports")}
        description={t("Comprehensive telemetry on student engagement, learning milestones, track progress, squads and mentors.")}
        actions={
          <>
            <label className="relative">
              <span className="sr-only">{t("Period")}</span>
              <CalendarDays className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
              <select value={period} onChange={(e) => setPeriod(e.target.value as ReportPeriod)} className={`${INPUT} ps-[2.4em] font-semibold`}>
                {PERIODS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {t(p.label)}
                  </option>
                ))}
              </select>
            </label>
            <label className="relative">
              <span className="sr-only">{t("Track")}</span>
              <Filter className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
              <select value={track} onChange={(e) => setTrack(e.target.value)} className={`${INPUT} max-w-[16em] ps-[2.4em] font-semibold`}>
                <option value="all">{t("All Technical Tracks")}</option>
                {allTracks.map((tr) => (
                  <option key={tr.id} value={tr.code}>
                    {tr.name}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              disabled={!system.data}
              onClick={() => system.data && exportSystemCsv(system.data, t)}
              className={BTN_PRIMARY}
            >
              <CloudDownload className="size-[1.1em]" /> {t("Export Full Report")}
            </button>
          </>
        }
      />

      <ReportStats stats={report.data?.stats ?? null} system={system.data} />

      <ReportCharts report={report.data} system={system.data} error={report.error} onRetry={report.reload} />

      <div className="grid gap-[1.4em] lg:grid-cols-2">
        <TrackCompletion tracks={shownTracks} error={tracks.error} onRetry={tracks.reload} />
        <LevelDonut levels={system.data?.students.byLevel ?? null} error={system.error} onRetry={system.reload} />
        <SquadVelocity squads={squads.data} error={squads.error} onRetry={squads.reload} />
        <MentorWorkload
          mentors={shownMentors}
          mentorship={system.data?.mentorship ?? null}
          error={mentors.error}
          onRetry={mentors.reload}
        />
      </div>

      <ReportBuilder
        tracks={allTracks}
        data={{ report: report.data, system: system.data, tracks: tracks.data?.tracks ?? null, squads: squads.data, mentors: mentors.data?.mentors ?? null }}
      />

      <SystemReportPanel report={system.data} error={system.error} onRetry={system.reload} />
    </AdminSurface>
  );
}
