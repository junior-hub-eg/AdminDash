"use client";

/**
 * DonutChart: share of each part, with a legend (count and %).
 *   items: { key, label, value }[].
 *   centerValue?: big text in the hole (default: the total); centerLabel?: small text under it.
 *   colors?: by position (default: cyan first). label: accessible name.
 *   Hover a segment or legend row to highlight it.
 */

import { useState } from "react";
import { fmtNumber, SERIES_COLORS } from "./tokens";

export type DonutItem = { key: string; label: string; value: number };

export function DonutChart({
  items,
  centerValue,
  centerLabel,
  colors = SERIES_COLORS,
  label,
}: {
  items: DonutItem[];
  centerValue?: string;
  centerLabel?: string;
  colors?: string[];
  label: string;
}) {
  const [hot, setHot] = useState<string | null>(null);
  const total = items.reduce((a, it) => a + Math.max(0, it.value), 0);
  const r = 40;
  const c = 2 * Math.PI * r;
  const lens = items.map((it) => (total ? (Math.max(0, it.value) / total) * c : 0));
  // Each segment starts where the ones before it end.
  const segs = items.map((it, i) => ({
    ...it,
    len: lens[i],
    start: lens.slice(0, i).reduce((a, l) => a + l, 0),
    color: colors[i % colors.length],
  }));

  return (
    <div className="flex flex-col items-center gap-[1.2em] sm:flex-row">
      <div className="relative size-[10em] shrink-0">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={label}>
          <circle cx="60" cy="60" r={r} fill="none" stroke="#eef2f7" strokeWidth="16" />
          {segs.map((s) =>
            s.len > 0 ? (
              <circle
                key={s.key}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={s.color}
                strokeWidth={hot === s.key ? 19 : 16}
                strokeDasharray={`${s.len} ${c - s.len}`}
                strokeDashoffset={-s.start}
                opacity={hot && hot !== s.key ? 0.45 : 1}
                onMouseEnter={() => setHot(s.key)}
                onMouseLeave={() => setHot(null)}
              >
                <title>{`${s.label}: ${fmtNumber(s.value)}`}</title>
              </circle>
            ) : null,
          )}
        </svg>
        <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
          <div>
            <p className="text-[1.6em] font-extrabold leading-none text-[#0b1b2b]">{centerValue ?? fmtNumber(total)}</p>
            {centerLabel && <p className="text-[0.68em] text-[#5b6b7c]">{centerLabel}</p>}
          </div>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-[0.45em]">
        {segs.map((s) => (
          <li
            key={s.key}
            onMouseEnter={() => setHot(s.key)}
            onMouseLeave={() => setHot(null)}
            className={`flex items-center gap-[0.6em] rounded-[0.7em] px-[0.8em] py-[0.5em] text-[0.75em] transition ${hot === s.key ? "bg-[#e0f6fc]" : "bg-[#f5f8fe]"}`}
          >
            <span className="size-[0.75em] shrink-0 rounded-[0.2em]" style={{ backgroundColor: s.color }} />
            <span className="min-w-0 flex-1 truncate font-semibold text-[#0b1b2b]">{s.label}</span>
            <span className="font-bold text-[#0b1b2b]">{fmtNumber(s.value)}</span>
            <span dir="ltr" className="w-[3em] text-end text-[#0b89a6]">
              {total ? Math.round((s.value / total) * 100) : 0}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
