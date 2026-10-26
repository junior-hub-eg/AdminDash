"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Filter } from "lucide-react";
import { getAdminMentors, getAdminReport, getAdminSquads, getAdminTracks, getSystemReport, type ReportPeriod } from "@/lib/admin-api";
import {
  downloadReportExport,
  getReportSchedule,
  getReportTrends,
  saveReportSchedule,
  sendReportNow,
  type ReportTrends,
} from "@/lib/admin-reports-api";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import {
  daysBetween,
  ExportMenu,
  FIELD,
  fmtRange,
  PrintHeader,
  PrintRoot,
  PrintSection,
  printReport,
  rangeFor,
  ReportHeader,
  ScheduleCard,
  type DateRange,
  type ExportFormat,
  type ExportLang,
} from "@/components/report-kit";
import { AdminSurface } from "./page-parts";
import { useAdminData } from "./admin-data";
import { QualityKpis, TrendKpis } from "./ReportStats";
import { ReportCharts } from "./ReportCharts";
import { SystemReportPanel } from "./SystemReportPanel";
import { TrackCompletion } from "./reports/TrackCompletion";
import { LevelDonut } from "./reports/LevelDonut";
import { SquadVelocity } from "./reports/SquadVelocity";
import { MentorWorkload } from "./reports/MentorWorkload";
import { ReportBuilder } from "./reports/ReportBuilder";

const FAIL = tk("We couldn't load the report. Please try again.");
const TRENDS_FAIL = tk("We couldn't load the trends. Please try again.");

/** The standard period of reports?period= closest to the picked range. */
function periodFor(range: DateRange): ReportPeriod {
  const days = daysBetween(range.from, range.to);
  return days <= 7 ? "week" : days <= 31 ? "month" : "year";
}

/** Trends for one range + track. Results are keyed by the request, so a new range never shows the old numbers. */
function useTrends(from: string, to: string, trackCode: string | null) {
  const key = `${from}|${to}|${trackCode ?? ""}`;
  const [result, setResult] = useState<{ key: string; data: ReportTrends | null; error: string | null } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    getReportTrends({ from, to, trackCode }).then(
      (data) => active && setResult({ key, data, error: null }),
      (e) => active && setResult({ key, data: null, error: errorMessage(e, TRENDS_FAIL) }),
    );
    return () => {
      active = false;
    };
  }, [key, from, to, trackCode, attempt]);

  const current = result?.key === key ? result : null;
  const reload = useCallback(() => {
    setResult(null);
    setAttempt((n) => n + 1);
  }, []);
  return { data: current?.data ?? null, error: current?.error ?? null, reload };
}

/** Rejections the kit shows to the user: always an Error with a translated message. */
async function friendly<T>(work: Promise<T>, fallback: string): Promise<T> {
  try {
    return await work;
  } catch (e) {
    throw new Error(errorMessage(e, fallback));
  }
}

export default function AdminReports() {
  const { t, locale, intl } = useI18n();
  const [range, setRange] = useState<DateRange>(() => rangeFor("12w"));
  const [track, setTrack] = useState("all");
  const trackCode = track === "all" ? null : track;

  const trends = useTrends(range.from, range.to, trackCode);
  const period = periodFor(range);
  const loadReport = useCallback(() => getAdminReport(period), [period]);
  const report = useAdminData(loadReport, FAIL);
  const system = useAdminData(getSystemReport, FAIL);
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const schedule = useAdminData(getReportSchedule, tk("We couldn't load your email schedule. Please try again."));

  const allTracks = useMemo(() => tracks.data?.tracks ?? [], [tracks.data]);
  const inTrack = (code: string) => !trackCode || code === trackCode;
  const shownTracks = tracks.data ? allTracks.filter((tr) => inTrack(tr.code)) : null;
  const shownMentors = mentors.data ? mentors.data.mentors.filter((m) => inTrack(m.trackCode)) : null;
  const trackName = trackCode ? (allTracks.find((tr) => tr.code === trackCode)?.name ?? trackCode) : t("All Technical Tracks");
  const rangeText = fmtRange(range.from, range.to, intl);

  const onExport = async (format: ExportFormat, lang: ExportLang) => {
    if (format === "pdf") return printReport();
    await friendly(downloadReportExport({ from: range.from, to: range.to, trackCode, lang }), tk("The export failed. Please try again."));
  };

  return (
    <AdminSurface>
      <PrintRoot>
        <ReportHeader
          eyebrow={t("Telemetry live feed")}
          title={t("Analytics & Reports")}
          subtitle={t("Comprehensive telemetry on student engagement, learning milestones, track progress, squads and mentors.")}
          range={range}
          onRangeChange={setRange}
          filters={
            <label className="relative">
              <span className="sr-only">{t("Track")}</span>
              <Filter className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
              <select value={track} onChange={(e) => setTrack(e.target.value)} className={`${FIELD} max-w-[16em] ps-[2.4em] font-semibold`}>
                <option value="all">{t("All Technical Tracks")}</option>
                {allTracks.map((tr) => (
                  <option key={tr.id} value={tr.code}>
                    {tr.name}
                  </option>
                ))}
              </select>
            </label>
          }
          actions={<ExportMenu onExport={onExport} pdfLanguages={[locale]} />}
        />

        <PrintHeader title={t("Analytics & Reports")} range={rangeText} extra={trackName} />

        <TrendKpis trends={trends.data} error={trends.error} onRetry={trends.reload} />

        <ReportCharts trends={trends.data} system={system.data} error={trends.error} onRetry={trends.reload} />

        <QualityKpis report={report.data} error={report.error} onRetry={report.reload} />

        <div className="grid gap-[1.4em] lg:grid-cols-2 print:grid-cols-1">
          <TrackCompletion tracks={shownTracks} error={tracks.error} onRetry={tracks.reload} />
          <LevelDonut levels={system.data?.students.byLevel ?? null} error={system.error} onRetry={system.reload} />
        </div>

        <PrintSection breakBefore className="grid gap-[1.4em] 2xl:grid-cols-2 print:grid-cols-1">
          <SquadVelocity squads={squads.data} error={squads.error} onRetry={squads.reload} />
          <MentorWorkload mentors={shownMentors} mentorship={system.data?.mentorship ?? null} error={mentors.error} onRetry={mentors.reload} />
        </PrintSection>

        <ScheduleCard
          value={schedule.data}
          error={schedule.error}
          onRetry={schedule.reload}
          onSave={async (settings) => {
            const next = await friendly(saveReportSchedule(settings), tk("We couldn't save the schedule. Please try again."));
            schedule.setData(next);
            return next;
          }}
          onSendNow={() => friendly(sendReportNow(), tk("We couldn't send the report. Please try again."))}
        />

        <ReportBuilder
          tracks={allTracks}
          data={{ report: report.data, system: system.data, tracks: tracks.data?.tracks ?? null, squads: squads.data, mentors: mentors.data?.mentors ?? null }}
        />

        <PrintSection breakBefore>
          <SystemReportPanel report={system.data} error={system.error} onRetry={system.reload} />
        </PrintSection>
      </PrintRoot>
    </AdminSurface>
  );
}
