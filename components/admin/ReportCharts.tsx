"use client";

import { useEffect, useRef, useState } from "react";
import { BarChart3, Presentation } from "lucide-react";
import type { AdminReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState } from "./admin-data";

const LESSONS_COLOR = "#12676b";
const TASKS_COLOR = "#7fddc9";

/** Active student tracks by level; the colours of the legend. */
const LEVELS = [
  { key: "beginner", name: tk("Beginner"), color: "#f5b72b" },
  { key: "intermediate", name: tk("Intermediate"), color: "#1a2b57" },
  { key: "advanced", name: tk("Advanced"), color: "#2fb5b5" },
] as const;

const card = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.1)]";

/** Measures an element so the charts can draw at its real pixel size. */
function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

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

function PerformanceChart({ w, h, report, label }: { w: number; h: number; report: AdminReport; label: string }) {
  if (w < 40 || h < 40) return null;
  const DARK = report.performance.map((p) => p.lessonsPassed);
  const LIGHT = report.performance.map((p) => p.tasksDone);
  const last = report.performance.length - 1;
  const max = niceMax(Math.max(...DARK, ...LIGHT, 1));
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * max));
  const L = 34;
  const R = 10;
  const T = 10;
  const B = 22;
  const x = (i: number) => L + (i / last) * (w - L - R);
  const y = (v: number) => T + (h - T - B) - (v / max) * (h - T - B);
  const poly = (vals: number[]) =>
    `${x(0)},${y(0)} ${vals.map((v, i) => `${x(i)},${y(v)}`).join(" ")} ${x(last)},${y(0)}`;

  return (
    <svg width={w} height={h} role="img" aria-label={label} className="absolute inset-0" direction="ltr">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={L} x2={w - R} y1={y(t)} y2={y(t)} stroke="#e6edf3" />
          <text x={L - 8} y={y(t) + 3.5} textAnchor="end" fontSize="10" fill="#8a97a6">
            {t}
          </text>
        </g>
      ))}
      {report.performance.map((p, i) => (
        <g key={p.from}>
          <line x1={x(i)} x2={x(i)} y1={y(0)} y2={y(0) + 4} stroke="#cfd8e1" />
          <text x={x(i)} y={h - 5} textAnchor="middle" fontSize="10" fill="#8a97a6">
            {pointLabel(p.from, report.period)}
          </text>
        </g>
      ))}
      <polygon points={poly(DARK)} fill={LESSONS_COLOR} />
      <polygon points={poly(LIGHT)} fill={TASKS_COLOR} fillOpacity={0.85} />
    </svg>
  );
}

function Donut({ size, levels, label }: { size: number; levels: AdminReport["levels"]; label: string }) {
  if (size < 40) return null;
  const r = 38;
  const c = 2 * Math.PI * r;
  const total = LEVELS.reduce((a, l) => a + levels[l.key], 0);
  if (total === 0) return null;
  // Each segment starts where the ones before it end.
  const segments = LEVELS.map((l, i) => ({
    color: l.color,
    len: (levels[l.key] / total) * c,
    start: (LEVELS.slice(0, i).reduce((a, p) => a + levels[p.key], 0) / total) * c,
  }));

  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      role="img"
      aria-label={label}
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
    >
      <g transform="rotate(-90 60 60)">
        {segments.map((s) => (
          <circle
            key={s.color}
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth="22"
            strokeDasharray={`${s.len} ${c - s.len}`}
            strokeDashoffset={-s.start}
          />
        ))}
      </g>
    </svg>
  );
}

export function ReportCharts({ report, className = "" }: { report: AdminReport | null; className?: string }) {
  const t = useT();
  const [chartRef, chartBox] = useBox<HTMLDivElement>();
  const [donutRef, donutBox] = useBox<HTMLDivElement>();

  return (
    <div className={`grid gap-[1.4em] lg:grid-cols-[minmax(0,1.67fr)_minmax(0,1fr)] ${className}`}>
      {/* Overall performance */}
      <article className={`${card} flex h-[21em] min-w-0 flex-col p-[1.2em] lg:h-[23em]`}>
        <header className="flex shrink-0 items-center gap-[0.7em]">
          <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#eef2f6]">
            <BarChart3 className="size-[1.1em] text-[#14365a]" />
          </span>
          <h2 className="text-[1.05em] font-bold leading-tight text-[#14365a]">{t("Overall Student Performance Over Time")}</h2>
        </header>
        <ul className="mt-[0.5em] flex shrink-0 flex-wrap gap-x-[1.2em] gap-y-[0.3em] text-[0.75em] text-[#14365a]">
          <li className="flex items-center gap-[0.4em]">
            <span className="size-[0.7em] rounded-full" style={{ backgroundColor: LESSONS_COLOR }} /> {t("Lessons passed")}
          </li>
          <li className="flex items-center gap-[0.4em]">
            <span className="size-[0.7em] rounded-full" style={{ backgroundColor: TASKS_COLOR }} /> {t("Squad tasks done")}
          </li>
        </ul>
        <div ref={chartRef} className="relative mt-[0.5em] min-h-0 flex-1">
          {report ? (
            <PerformanceChart w={chartBox.w} h={chartBox.h} report={report} label={t("Overall Student Performance Over Time")} />
          ) : (
            <LoadState error={null} onRetry={() => {}} />
          )}
        </div>
      </article>

      {/* Track completion ratio */}
      <article className={`${card} flex h-[21em] min-w-0 flex-col p-[1.2em] lg:h-[23em]`}>
        <header className="flex shrink-0 items-center gap-[0.7em]">
          <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#eef2f6]">
            <Presentation className="size-[1.1em] text-[#14365a]" />
          </span>
          <h2 className="text-[1.05em] font-bold leading-tight text-[#14365a]">{t("Track Completion Ratio")}</h2>
        </header>
        <div ref={donutRef} className="relative mt-[0.5em] min-h-0 flex-1">
          {report ? (
            <Donut size={Math.min(donutBox.w, donutBox.h) * 0.8} levels={report.levels} label={t("Track Completion Ratio")} />
          ) : (
            <LoadState error={null} onRetry={() => {}} />
          )}
        </div>
        <ul className="mx-auto mt-[0.5em] shrink-0 space-y-[0.35em] text-[0.8em] text-[#14365a]">
          {LEVELS.map((s) => (
            <li key={s.key} className="flex items-center gap-[0.9em]">
              <span className="w-[7.5em] text-end">{t(s.name)}</span>
              <span className="size-[0.65em] rounded-full" style={{ backgroundColor: s.color }} />
              <span className="w-[2em] font-semibold">{report ? report.levels[s.key] : ""}</span>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
