"use client";

/**
 * BarList: labelled horizontal bars with their %.
 *   items: { key, label, value, hint?, href? }[]: shown in the given order.
 *   max?: the value of a full bar (default 100, so values are already percents).
 *   format?(value): the figure at the end of the row (default "value%").
 *   colors?: bar colors by position (default: cyan first).
 *   label: accessible name of the list.
 */

import Link from "next/link";
import type { Route } from "next";
import type { ReactNode } from "react";
import { SERIES_COLORS } from "./tokens";

export type BarItem = { key: string; label: string; value: number; hint?: ReactNode; href?: string };

export function BarList({
  items,
  max = 100,
  format = (v) => `${Math.round(v)}%`,
  colors = SERIES_COLORS,
  label,
}: {
  items: BarItem[];
  max?: number;
  format?: (value: number) => string;
  colors?: string[];
  label: string;
}) {
  return (
    <ul aria-label={label} className="space-y-[0.95em]">
      {items.map((it, i) => {
        const color = colors[i % colors.length];
        const width = max > 0 ? Math.max(0, Math.min(100, (it.value / max) * 100)) : 0;
        const name = (
          <span className="flex min-w-0 items-center gap-[0.5em]">
            <span className="size-[0.6em] shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <span className="truncate">{it.label}</span>
          </span>
        );
        return (
          <li key={it.key} className="break-inside-avoid">
            <div className="flex items-center justify-between gap-[0.6em] text-[0.8em] font-semibold text-[#0b1b2b]">
              {it.href ? (
                <Link href={it.href as Route} className="min-w-0 hover:underline">
                  {name}
                </Link>
              ) : (
                name
              )}
              <span dir="ltr" className="shrink-0">
                {format(it.value)}
              </span>
            </div>
            <div
              className="mt-[0.35em] h-[0.55em] overflow-hidden rounded-full bg-[#e8eef5]"
              role="meter"
              aria-label={it.label}
              aria-valuemin={0}
              aria-valuemax={max}
              aria-valuenow={it.value}
            >
              <div className="h-full rounded-full" style={{ width: `${width}%`, backgroundColor: color }} />
            </div>
            {it.hint && <div className="mt-[0.3em] text-[0.68em] text-[#8a97a6]">{it.hint}</div>}
          </li>
        );
      })}
    </ul>
  );
}
