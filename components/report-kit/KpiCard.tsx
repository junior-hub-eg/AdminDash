"use client";

/**
 * KpiCard: one headline number compared with the previous period.
 *   label, value: number | null (null = loading), previous?: number | null,
 *   format?(n) (default: grouped Latin digits), icon?, hint? (replaces "vs previous period"),
 *   downIsGood? (a drop shows green, for things like no-shows).
 *   Change: green arrow up / red arrow down with the %; "New" when the previous period had 0.
 *
 * KpiGrid: responsive row of KpiCards (as many per row as fit, at least 11em each).
 */

import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, Minus, type LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { Skeleton } from "./ReportCard";
import { CARD, changePct, fmtNumber } from "./tokens";

export function KpiGrid({ children, busy }: { children: ReactNode; busy?: boolean }) {
  return (
    <ul aria-busy={busy} className="jh-print-section grid grid-cols-1 gap-[1em] sm:grid-cols-[repeat(auto-fill,minmax(11em,1fr))]">
      {children}
    </ul>
  );
}

export function KpiCard({
  label,
  value,
  previous,
  format = fmtNumber,
  icon: Icon,
  hint,
  downIsGood = false,
}: {
  label: string;
  value: number | null;
  previous?: number | null;
  format?: (n: number) => string;
  icon?: LucideIcon;
  hint?: string;
  downIsGood?: boolean;
}) {
  const t = useT();
  const pct = value == null ? null : changePct(value, previous);
  const isNew = value != null && previous === 0 && value > 0;
  const flat = pct != null && Math.abs(pct) < 0.05;
  const up = pct != null && pct > 0;
  const good = flat ? null : downIsGood ? !up : up;
  const tone = good == null ? "bg-[#eef2f7] text-[#5b6b7c]" : good ? "bg-[#e3f7ee] text-[#17935f]" : "bg-[#fde8e8] text-[#d04a4a]";
  const Arrow = flat ? Minus : up ? ArrowUp : ArrowDown;

  return (
    <li className={`${CARD} relative flex min-h-[7.6em] break-inside-avoid flex-col overflow-hidden p-[1em]`}>
      <div className="flex items-start justify-between gap-[0.6em]">
        <h3 className="text-[0.74em] font-semibold leading-snug text-[#5b6b7c]">{label}</h3>
        {Icon && (
          <span className="grid size-[2.1em] shrink-0 place-items-center rounded-[0.65em] bg-[#e0f6fc] text-[#0b89a6]">
            <Icon className="size-[1.05em]" />
          </span>
        )}
      </div>
      {value == null ? (
        <Skeleton className="mt-[0.5em] h-[1.8em] w-[5em]" />
      ) : (
        <p dir="ltr" className="mt-[0.35em] text-start text-[1.75em] font-extrabold leading-none text-[#0b1b2b] rtl:text-end">
          {format(value)}
        </p>
      )}
      <div className="mt-auto flex flex-wrap items-center gap-[0.45em] pt-[0.7em] text-[0.66em]">
        {value != null && previous != null && (pct != null || isNew) && (
          <span className={`inline-flex items-center gap-[0.2em] rounded-full px-[0.6em] py-[0.15em] font-bold ${isNew ? "bg-[#e3f7ee] text-[#17935f]" : tone}`}>
            {isNew ? (
              t("New")
            ) : (
              <>
                <Arrow className="size-[1em]" aria-hidden />
                <span dir="ltr">{`${Math.abs(pct!).toFixed(Math.abs(pct!) < 10 ? 1 : 0)}%`}</span>
              </>
            )}
          </span>
        )}
        {value != null && (
          <span className="text-[#8a97a6]">
            {hint ?? (previous != null ? t("vs previous period ({value})", { value: format(previous) }) : "")}
          </span>
        )}
      </div>
    </li>
  );
}
