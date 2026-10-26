"use client";

import { TrendingUp } from "lucide-react";
import type { AdminReport, SystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import { LoadState } from "./admin-data";
import { DASH, fmt, Pill, Section, useBox } from "./reports/ui";

const MAIN = "#06b6d4";
const SECOND = "#7c8ea3";

/** A rounded top for the y axis: 4, 8, 20, 40, 100... */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

/** The start of each part: the day for a week or month, the month for a year. */
function pointLabel(iso: string, period: AdminReport["period"]) {
  const date = new Date(iso);
  return period === "Year"
    ? date.toLocaleDateString(dateLocale("en-GB"), { month: "short" })
    : date.toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" });
}

/** A smooth path through the points (Catmull-Rom turned into cubic Béziers). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function ActivityChart({ w, h, report, label }: { w: number; h: number; report: AdminReport; label: string }) {
  if (w < 60 || h < 60 || report.performance.length < 2) return null;
  const main = report.performance.map((p) => p.lessonsPassed);
  const second = report.performance.map((p) => p.tasksDone);
  const last = report.performance.length - 1;
  const max = niceMax(Math.max(...main, ...second, 1));
  const L = 34;
  const R = 14;
  const T = 14;
  const B = 26;
  const x = (i: number) => L + (i / last) * (w - L - R);
  const y = (v: number) => T + (h - T - B) - (v / max) * (h - T - B);
  const mainPts = main.map((v, i) => [x(i), y(v)] as [number, number]);
  const line = smooth(mainPts);
  const area = `${line} L${x(last)},${y(0)} L${x(0)},${y(0)} Z`;
  const ticks = [0, 0.5, 1].map((f) => Math.round(f * max));

  return (
    <svg width={w} height={h} role="img" aria-label={label} className="absolute inset-0" direction="ltr">
      <defs>
        <linearGradient id="report-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={MAIN} stopOpacity="0.35" />
          <stop offset="100%" stopColor={MAIN} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {ticks.map((tick) => (
        <g key={tick}>
          <line x1={L} x2={w - R} y1={y(tick)} y2={y(tick)} stroke="#e6edf3" strokeDasharray="3 4" />
          <text x={L - 8} y={y(tick) + 3.5} textAnchor="end" fontSize="10" fill="#8a97a6">
            {tick}
          </text>
        </g>
      ))}
      {report.performance.map((p, i) => (
        <text key={p.from} x={x(i)} y={h - 6} textAnchor="middle" fontSize="10" fill="#8a97a6">
          {pointLabel(p.from, report.period)}
        </text>
      ))}
      <path d={area} fill="url(#report-area)" />
      <path d={smooth(second.map((v, i) => [x(i), y(v)]))} fill="none" stroke={SECOND} strokeWidth="1.6" strokeDasharray="5 5" />
      <path d={line} fill="none" stroke="#0e93ad" strokeWidth="2.4" />
      {mainPts.map(([px, py], i) => (
        <circle key={i} cx={px} cy={py} r="4" fill="white" stroke="#0e93ad" strokeWidth="2">
          <title>{`${main[i]} / ${second[i]}`}</title>
        </circle>
      ))}
    </svg>
  );
}

/** "Student Enrollment & Weekly Active Engagement": the period's learning activity plus a strip of live totals. */
export function ReportCharts({
  report,
  system,
  error,
  onRetry,
}: {
  report: AdminReport | null;
  system: SystemReport | null;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useT();
  const [chartRef, box] = useBox<HTMLDivElement>();
  const empty = report && report.performance.every((p) => p.lessonsPassed === 0 && p.tasksDone === 0);

  const strip = [
    { label: t("Active in the last 7 days"), value: system ? fmt(system.students.activeLast7Days) : DASH, hint: t("students") },
    {
      label: t("Lessons completed"),
      value: system ? fmt(system.learning.lessonsCompletedLast30Days) : DASH,
      hint: t("in the last 30 days"),
    },
    {
      label: t("Squad tasks done"),
      value: system ? fmt(system.squads.tasksDone) : DASH,
      hint: system ? t("of {total} tasks", { total: fmt(system.squads.tasksTotal) }) : "",
    },
    { label: t("Certificates issued"), value: report ? fmt(report.stats.certificatesIssued) : DASH, hint: t("in the selected period") },
  ];

  return (
    <Section
      icon={TrendingUp}
      title={t("Student Learning & Engagement")}
      description={t("Lessons passed and squad tasks done across the selected period.")}
      aside={
        <ul className="flex flex-wrap gap-[0.8em] rounded-[0.7em] bg-[#f1f6fb] px-[0.9em] py-[0.45em] text-[0.7em] font-semibold text-[#14365a]">
          <li className="flex items-center gap-[0.4em]">
            <span className="size-[0.7em] rounded-full" style={{ backgroundColor: MAIN }} /> {t("Lessons passed")}
          </li>
          <li className="flex items-center gap-[0.4em]">
            <span className="h-[2px] w-[1.1em] border-t-2 border-dashed" style={{ borderColor: SECOND }} /> {t("Squad tasks done")}
          </li>
        </ul>
      }
    >
      <div className="mt-[0.4em]">
        <Pill tone="cyan">{t("Live series")}</Pill>
      </div>
      <div ref={chartRef} className="relative mt-[0.6em] h-[15em] sm:h-[18em]">
        {!report ? (
          <LoadState error={error} onRetry={onRetry} />
        ) : empty ? (
          <p className="grid h-full place-items-center text-[0.85em] text-[#8a97a6]">{t("No learning activity in this period yet.")}</p>
        ) : (
          <ActivityChart w={box.w} h={box.h} report={report} label={t("Student Learning & Engagement")} />
        )}
      </div>

      <dl className="mt-[1em] grid grid-cols-2 gap-[1em] rounded-[0.9em] bg-[#f5f8fe] p-[1em] lg:grid-cols-4">
        {strip.map((s) => (
          <div key={s.label} className="min-w-0">
            <dt className="text-[0.62em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">{s.label}</dt>
            <dd className="mt-[0.2em] text-[1.05em] font-bold text-[#0b1b2b]">{s.value}</dd>
            <dd className="text-[0.68em] text-[#0b89a6]">{s.hint}</dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}
