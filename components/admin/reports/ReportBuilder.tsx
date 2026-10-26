"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Play, SlidersHorizontal } from "lucide-react";
import type { AdminMentor, AdminReport, AdminSquad, AdminTrack, SystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import { INPUT } from "../page-parts";
import { STATUS_LABEL } from "../SquadCard";
import { systemCsvRows } from "../SystemReportPanel";
import { downloadCsv, Empty, fmt, Pill, Section } from "./ui";

export type BuilderData = {
  report: AdminReport | null;
  system: SystemReport | null;
  tracks: AdminTrack[] | null;
  squads: AdminSquad[] | null;
  mentors: AdminMentor[] | null;
};

type SectionId = "kpis" | "activity" | "tracks" | "levels" | "squads" | "mentors" | "system";

const SECTIONS: { id: SectionId; label: string }[] = [
  { id: "kpis", label: tk("KPI summary") },
  { id: "activity", label: tk("Learning activity") },
  { id: "tracks", label: tk("Course completion by track") },
  { id: "levels", label: tk("Students by level") },
  { id: "squads", label: tk("Squad progress") },
  { id: "mentors", label: tk("Mentor workload") },
  { id: "system", label: tk("Full system report") },
];

type Row = (string | number)[];
type Generated = { id: number; name: string; scope: string; at: Date; rows: Row[] };

/** The rows of the chosen sections, as (section, item, value...) lines. */
function buildRows(d: BuilderData, picked: SectionId[], trackCode: string, t: TFunction): Row[] {
  const rows: Row[] = [[t("Section"), t("Item"), t("Value"), t("Detail")]];
  const inTrack = (code: string | null | undefined) => trackCode === "all" || code === trackCode;

  if (picked.includes("kpis") && d.report) {
    const s = d.report.stats;
    const sec = t("KPI summary");
    rows.push([sec, t("Course Completion Rate"), `${s.completionRate}%`, ""]);
    rows.push([sec, t("Active Engagement"), `${s.activeEngagement}%`, ""]);
    rows.push([sec, t("Average Student Score"), s.averageScore, "/100"]);
    rows.push([sec, t("Certificates issued"), s.certificatesIssued, ""]);
  }
  if (picked.includes("activity") && d.report) {
    for (const p of d.report.performance) {
      rows.push([t("Learning activity"), p.from.slice(0, 10), p.lessonsPassed, `${t("Squad tasks done")}: ${p.tasksDone}`]);
    }
  }
  if (picked.includes("tracks") && d.tracks) {
    for (const tr of d.tracks.filter((x) => inTrack(x.code))) {
      rows.push([t("Course completion by track"), tr.name, `${tr.progress}%`, `${t("Students")}: ${tr.students} · ${t("Squads")}: ${tr.squads}`]);
    }
  }
  if (picked.includes("levels") && d.system) {
    for (const l of d.system.students.byLevel) rows.push([t("Students by level"), t(l.key), l.count, ""]);
  }
  if (picked.includes("squads") && d.squads) {
    for (const s of d.squads) {
      rows.push([t("Squad progress"), s.name, `${s.progress}%`, `${t(STATUS_LABEL[s.status])} · ${s.students}/${s.capacity} · ${s.monitor?.fullName ?? ""}`]);
    }
  }
  if (picked.includes("mentors") && d.mentors) {
    for (const m of d.mentors.filter((x) => inTrack(x.trackCode))) {
      rows.push([t("Mentor workload"), m.fullName, m.students, `${t("Squads")}: ${m.monitoredSquads} · ${t("Rating")}: ${m.rating.toFixed(2)} · ${m.trackName}`]);
    }
  }
  if (picked.includes("system") && d.system) {
    for (const r of systemCsvRows(d.system, t)) rows.push([...r, ""]);
  }
  return rows;
}

/** Custom Report Builder: pick a scope and sections, then download them as CSV (built in the browser). */
export function ReportBuilder({ data, tracks }: { data: BuilderData; tracks: AdminTrack[] }) {
  const t = useT();
  const [trackCode, setTrackCode] = useState("all");
  const [picked, setPicked] = useState<SectionId[]>(["kpis", "tracks", "squads", "mentors"]);
  const [made, setMade] = useState<Generated[]>([]);
  const ready = !!(data.report && data.system && data.tracks && data.squads && data.mentors);

  const toggle = (id: SectionId) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const generate = () => {
    const rows = buildRows(data, picked, trackCode, t);
    const scope = trackCode === "all" ? t("All tracks") : (tracks.find((x) => x.code === trackCode)?.name ?? trackCode);
    const at = new Date();
    const name = `junior-hub-report-${trackCode === "all" ? "all" : trackCode.toLowerCase()}-${at.toISOString().slice(0, 16).replace(/[:T]/g, "-")}.csv`;
    downloadCsv(name, rows);
    setMade((m) => [{ id: at.getTime(), name, scope, at, rows }, ...m].slice(0, 5));
  };

  return (
    <Section
      icon={SlidersHorizontal}
      title={t("Custom Report Builder")}
      description={t("Pick a scope and the sections you need, then download them as a spreadsheet.")}
      className="print:hidden"
      aside={
        <span className="inline-flex items-center gap-[0.4em] text-[0.7em] text-[#5b6b7c]">
          {t("Built in your browser from live data")} <span className="size-[0.55em] rounded-full bg-[#14b8a6]" />
        </span>
      }
    >
      <div className="mt-[1em] grid gap-[0.9em] rounded-[0.9em] bg-[#f1f6fb] p-[1em] md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="flex min-w-0 flex-col gap-[0.35em]">
          <span className="text-[0.7em] font-semibold text-[#5b6b7c]">{t("Track scope")}</span>
          <select value={trackCode} onChange={(e) => setTrackCode(e.target.value)} className={INPUT}>
            <option value="all">{t("All tracks")}</option>
            {tracks.map((tr) => (
              <option key={tr.id} value={tr.code}>
                {tr.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex min-w-0 flex-col gap-[0.35em]">
          <span className="text-[0.7em] font-semibold text-[#5b6b7c]">{t("Export format")}</span>
          <select className={INPUT} defaultValue="csv">
            <option value="csv">{t("Spreadsheet (CSV)")}</option>
          </select>
        </label>

        <button
          type="button"
          onClick={generate}
          disabled={!ready || picked.length === 0}
          className="inline-flex h-[2.6em] items-center justify-center gap-[0.5em] rounded-[0.7em] bg-[#13233a] px-[1.4em] text-[0.82em] font-semibold text-white hover:bg-[#1c3150] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Play className="size-[1em] rtl:-scale-x-100" /> {t("Generate Dataset")}
        </button>

        <fieldset className="md:col-span-3">
          <legend className="text-[0.7em] font-semibold text-[#5b6b7c]">{t("Metrics focus")}</legend>
          <div className="mt-[0.4em] flex flex-wrap gap-[0.45em]">
            {SECTIONS.map((s) => {
              const on = picked.includes(s.id);
              return (
                <label
                  key={s.id}
                  className={`inline-flex cursor-pointer items-center gap-[0.4em] rounded-full border px-[0.8em] py-[0.3em] text-[0.72em] font-semibold ${
                    on ? "border-[#06b6d4] bg-[#e0f6fc] text-[#0b6f86]" : "border-[#dfe7f1] bg-white text-[#5b6b7c]"
                  }`}
                >
                  <input type="checkbox" checked={on} onChange={() => toggle(s.id)} className="accent-[#06b6d4]" />
                  {t(s.label)}
                </label>
              );
            })}
          </div>
        </fieldset>
      </div>

      {made.length === 0 ? (
        <Empty
          icon={FileSpreadsheet}
          title={t("No reports generated yet")}
          text={t("Reports you generate in this visit are listed here so you can download them again.")}
          className="mt-[1em]"
        />
      ) : (
        <div className="mt-[1em] overflow-x-auto">
          <table className="w-full min-w-[40em] text-start text-[0.78em]">
            <thead>
              <tr className="bg-[#f1f6fb] text-[0.85em] uppercase tracking-[0.05em] text-[#5b6b7c]">
                <th className="rounded-s-[0.6em] px-[0.9em] py-[0.7em] text-start font-bold">{t("Report name")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Track scope")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Generated on")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("File type")}</th>
                <th className="px-[0.9em] py-[0.7em] text-start font-bold">{t("Records")}</th>
                <th className="rounded-e-[0.6em] px-[0.9em] py-[0.7em] text-start font-bold">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eef2f7]">
              {made.map((g) => (
                <tr key={g.id}>
                  <td className="px-[0.9em] py-[0.8em] font-semibold text-[#0b1b2b]">
                    <span className="inline-flex items-center gap-[0.4em] break-all">
                      <FileSpreadsheet className="size-[1.1em] shrink-0 text-[#0b89a6]" /> {g.name}
                    </span>
                  </td>
                  <td className="px-[0.9em] py-[0.8em] text-[#5b6b7c]">{g.scope}</td>
                  <td className="px-[0.9em] py-[0.8em] text-[#5b6b7c]">
                    {g.at.toLocaleString(dateLocale("en-GB"), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  </td>
                  <td className="px-[0.9em] py-[0.8em]">
                    <Pill tone="green">CSV</Pill>
                  </td>
                  <td className="px-[0.9em] py-[0.8em] font-mono text-[#5b6b7c]">{t("{count} rows", { count: fmt(g.rows.length - 1) })}</td>
                  <td className="px-[0.9em] py-[0.8em]">
                    <button
                      type="button"
                      onClick={() => downloadCsv(g.name, g.rows)}
                      className="inline-flex items-center gap-[0.3em] font-bold text-[#0b89a6] hover:underline"
                    >
                      <Download className="size-[1em]" /> {t("Download")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}
