"use client";

/**
 * TrendChart: multi-series line chart (the first shown series gets a soft area), drawn in SVG.
 *   points: { start: yyyy-MM-dd; values: Record<key, number> }[] (oldest first).
 *   metrics: { key, label, color? }[]: the series that can be shown.
 *   active?: string[] + onActiveChange?(keys): controlled legend toggles; uncontrolled when omitted
 *            (defaultActive?, else the first three). At least one series always stays on.
 *   height?: CSS height of the plot (default "17em"). label: accessible name.
 *   formatX?(start): x labels (default "12 Oct" in the page language).
 *   Hover or focus a column for a tooltip with every shown value. Time runs right-to-left in Arabic.
 *   The SVG scales with its viewBox, so the chart keeps its shape when printed.
 */

import { useId, useRef, useState, useEffect } from "react";
import { useI18n } from "@/lib/i18n/client";
import { fmtDay, fmtNumber, SERIES_COLORS } from "./tokens";

export type TrendPoint = { start: string; values: Record<string, number> };
export type TrendMetric = { key: string; label: string; color?: string };

function niceMax(v: number) {
  if (v <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(v));
  const n = v / step;
  return (n <= 2 ? 2 : n <= 5 ? 5 : 10) * step;
}

function smooth(pts: [number, number][]) {
  if (pts.length === 0) return "";
  if (pts.length === 1) return `M${pts[0][0]},${pts[0][1]}`;
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    // Clamp control points vertically so the curve never dips below the floor.
    const c1y = Math.min(Math.max(p1[1] + (p2[1] - p0[1]) / 6, Math.min(p1[1], p2[1])), Math.max(p1[1], p2[1]));
    const c2y = Math.min(Math.max(p2[1] - (p3[1] - p1[1]) / 6, Math.min(p1[1], p2[1])), Math.max(p1[1], p2[1]));
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${c1y} ${p2[0] - (p3[0] - p1[0]) / 6},${c2y} ${p2[0]},${p2[1]}`;
  }
  return d;
}

function useSize<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [size, setSize] = useState({ w: 640, h: 260 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const w = Math.floor(e.contentRect.width);
      const h = Math.floor(e.contentRect.height);
      if (w > 0 && h > 0) setSize({ w, h });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, size] as const;
}

export function TrendChart({
  points,
  metrics,
  active: activeProp,
  onActiveChange,
  defaultActive,
  height = "17em",
  label,
  formatX,
}: {
  points: TrendPoint[];
  metrics: TrendMetric[];
  active?: string[];
  onActiveChange?: (keys: string[]) => void;
  defaultActive?: string[];
  height?: string;
  label: string;
  formatX?: (start: string) => string;
}) {
  const { t, intl, dir } = useI18n();
  const gradId = useId().replace(/:/g, "");
  const [own, setOwn] = useState<string[]>(defaultActive ?? metrics.slice(0, 3).map((m) => m.key));
  const active = activeProp ?? own;
  const setActive = (keys: string[]) => (onActiveChange ? onActiveChange(keys) : setOwn(keys));
  const [hover, setHover] = useState<number | null>(null);
  const [boxRef, { w, h: H }] = useSize<HTMLDivElement>();

  const colored = metrics.map((m, i) => ({ ...m, color: m.color ?? SERIES_COLORS[i % SERIES_COLORS.length] }));
  const shown = colored.filter((m) => active.includes(m.key));
  const toggle = (key: string) => {
    if (active.includes(key)) {
      if (active.length > 1) setActive(active.filter((k) => k !== key));
    } else setActive([...active, key]);
  };

  const rtl = dir === "rtl";
  const AXIS = 40;
  const SIDE = 14;
  const T = 12;
  const B = 26;
  const plotW = Math.max(10, w - AXIS - SIDE);
  const n = points.length;
  const max = niceMax(Math.max(1, ...points.flatMap((p) => shown.map((m) => p.values[m.key] ?? 0))));
  const frac = (i: number) => (n <= 1 ? 0.5 : i / (n - 1));
  const x = (i: number) => (rtl ? w - AXIS - frac(i) * plotW : AXIS + frac(i) * plotW);
  const y = (v: number) => T + (H - T - B) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(f * max));
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor(plotW / 64))));
  const xLabel = formatX ?? ((s: string) => fmtDay(s, intl, false));

  const colW = n <= 1 ? plotW : plotW / (n - 1);

  return (
    <div className="min-w-0">
      <ul className="flex flex-wrap gap-[0.45em] print:hidden" aria-label={t("Metrics")}>
        {colored.map((m) => {
          const on = active.includes(m.key);
          return (
            <li key={m.key}>
              <button
                type="button"
                aria-pressed={on}
                onClick={() => toggle(m.key)}
                className={`inline-flex items-center gap-[0.45em] rounded-full border px-[0.8em] py-[0.3em] text-[0.7em] font-semibold transition ${
                  on ? "border-transparent bg-[#f1f6fb] text-[#0b1b2b]" : "border-[#dfe7f1] bg-white text-[#8a97a6] hover:bg-[#f8fbfe]"
                }`}
              >
                <span className="size-[0.7em] rounded-full" style={{ backgroundColor: on ? m.color : "#cbd5e1" }} />
                {m.label}
              </button>
            </li>
          );
        })}
      </ul>
      {/* In print only the shown series are listed. */}
      <ul className="hidden flex-wrap gap-[1em] text-[0.7em] font-semibold text-[#14365a] print:flex">
        {shown.map((m) => (
          <li key={m.key} className="flex items-center gap-[0.4em]">
            <span className="size-[0.7em] rounded-full" style={{ backgroundColor: m.color }} /> {m.label}
          </li>
        ))}
      </ul>

      <div ref={boxRef} className="relative mt-[0.8em] w-full" style={{ height }} onMouseLeave={() => setHover(null)}>
        <svg
          viewBox={`0 0 ${w} ${H}`}
          width="100%"
          height="100%"
          role="img"
          aria-label={label}
          className="absolute inset-0 overflow-visible"
        >
          <defs>
            <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={shown[0]?.color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={shown[0]?.color} stopOpacity="0.02" />
            </linearGradient>
          </defs>
          {ticks.map((tick) => (
            <g key={tick}>
              <line x1={AXIS} x2={w - SIDE} y1={y(tick)} y2={y(tick)} stroke="#e6edf3" strokeDasharray="3 4" />
              <text x={rtl ? w - AXIS + 8 : AXIS - 8} y={y(tick) + 3.5} textAnchor={rtl ? "start" : "end"} fontSize="10" fill="#8a97a6">
                {fmtNumber(tick)}
              </text>
            </g>
          ))}
          {points.map((p, i) =>
            i % every === 0 || i === n - 1 ? (
              <text key={p.start} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#8a97a6">
                {xLabel(p.start)}
              </text>
            ) : null,
          )}
          {hover != null && <line x1={x(hover)} x2={x(hover)} y1={T} y2={H - B} stroke="#94a3b8" strokeDasharray="3 3" />}
          {shown.map((m, si) => {
            const pts = points.map((p, i) => [x(i), y(p.values[m.key] ?? 0)] as [number, number]);
            const line = smooth(pts);
            return (
              <g key={m.key}>
                {si === 0 && n > 1 && <path d={`${line} L${x(n - 1)},${y(0)} L${x(0)},${y(0)} Z`} fill={`url(#${gradId})`} />}
                <path d={line} fill="none" stroke={m.color} strokeWidth={si === 0 ? 2.4 : 1.8} strokeLinejoin="round" strokeLinecap="round" />
                {pts.map(([px, py], i) => (
                  <circle key={i} cx={px} cy={py} r={hover === i ? 4.5 : n > 20 ? 0 : 3} fill="white" stroke={m.color} strokeWidth="2" />
                ))}
              </g>
            );
          })}
          {/* Hover targets, one column per point. */}
          {points.map((p, i) => (
            <rect
              key={p.start}
              x={x(i) - colW / 2}
              y={T}
              width={colW}
              height={H - T - B}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              tabIndex={-1}
            />
          ))}
        </svg>

        {hover != null && points[hover] && (
          <div
            role="tooltip"
            className="pointer-events-none absolute top-[0.2em] z-10 min-w-[10em] rounded-[0.7em] bg-[#13233a] px-[0.8em] py-[0.6em] text-[0.7em] text-white shadow-lg print:hidden"
            style={
              x(hover) > w / 2
                ? { right: `${Math.max(0, w - x(hover) + 10)}px` }
                : { left: `${x(hover) + 10}px` }
            }
          >
            <p className="mb-[0.3em] font-bold text-[#5ee0f5]">{t("Week of {date}", { date: fmtDay(points[hover].start, intl) })}</p>
            <ul className="space-y-[0.15em]">
              {shown.map((m) => (
                <li key={m.key} className="flex items-center justify-between gap-[1em]">
                  <span className="flex items-center gap-[0.4em]">
                    <span className="size-[0.6em] rounded-full" style={{ backgroundColor: m.color }} />
                    {m.label}
                  </span>
                  <b dir="ltr">{fmtNumber(points[hover].values[m.key] ?? 0)}</b>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
