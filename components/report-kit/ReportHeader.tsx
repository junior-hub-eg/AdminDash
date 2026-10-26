"use client";

/**
 * ReportHeader: page title row of a report.
 *   eyebrow?: small tag above the title.
 *   title, subtitle?.
 *   range: DateRange; onRangeChange(range): the date-range picker (hidden when range is omitted).
 *   filters?: extra controls next to the picker (a track select...).
 *   actions?: buttons on the far side (ExportMenu...).
 *   The whole header is hidden when printing; PrintHeader takes its place.
 *
 * DateRangePicker: presets Last 7 days / Last 30 days / Last 12 weeks / This month / Custom from–to.
 *   value: DateRange, onChange(range).
 *
 * rangeFor(preset): the from/to (yyyy-MM-dd, today included) of a preset.
 */

import { useState, type ReactNode } from "react";
import { CalendarDays } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { FIELD, isoDay } from "./tokens";

export type RangePreset = "7d" | "30d" | "12w" | "month" | "custom";
export type DateRange = { preset: RangePreset; from: string; to: string };

const PRESETS: { id: RangePreset; label: string }[] = [
  { id: "7d", label: tk("Last 7 days") },
  { id: "30d", label: tk("Last 30 days") },
  { id: "12w", label: tk("Last 12 weeks") },
  { id: "month", label: tk("This month") },
  { id: "custom", label: tk("Custom range") },
];

export function rangeFor(preset: Exclude<RangePreset, "custom">, today = new Date()): DateRange {
  const to = isoDay(today);
  const back = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return isoDay(d);
  };
  switch (preset) {
    case "7d":
      return { preset, from: back(6), to };
    case "30d":
      return { preset, from: back(29), to };
    case "12w":
      return { preset, from: back(83), to };
    case "month":
      return { preset, from: isoDay(new Date(today.getFullYear(), today.getMonth(), 1)), to };
  }
}

export function DateRangePicker({ value, onChange }: { value: DateRange; onChange: (range: DateRange) => void }) {
  const t = useT();
  // The custom dates being typed; applied once both are valid.
  const [draft, setDraft] = useState({ from: value.from, to: value.to });
  const invalid = !draft.from || !draft.to || draft.from > draft.to;

  const pick = (preset: RangePreset) => {
    if (preset === "custom") {
      setDraft({ from: value.from, to: value.to });
      onChange({ ...value, preset });
    } else onChange(rangeFor(preset));
  };

  const setDay = (key: "from" | "to", day: string) => {
    const next = { ...draft, [key]: day };
    setDraft(next);
    if (next.from && next.to && next.from <= next.to) onChange({ preset: "custom", ...next });
  };

  return (
    <div className="flex flex-wrap items-center gap-[0.5em]">
      <label className="relative">
        <span className="sr-only">{t("Date range")}</span>
        <CalendarDays className="pointer-events-none absolute start-[0.8em] top-1/2 size-[1em] -translate-y-1/2 text-[#5b6b7c]" />
        <select value={value.preset} onChange={(e) => pick(e.target.value as RangePreset)} className={`${FIELD} ps-[2.4em] font-semibold`}>
          {PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {t(p.label)}
            </option>
          ))}
        </select>
      </label>
      {value.preset === "custom" && (
        <div className="flex flex-wrap items-center gap-[0.4em]">
          <label className="flex items-center gap-[0.35em] text-[0.72em] font-semibold text-[#5b6b7c]">
            {t("From")}
            <input type="date" value={draft.from} max={draft.to || undefined} onChange={(e) => setDay("from", e.target.value)} className={`${FIELD} text-[1.1em]`} />
          </label>
          <label className="flex items-center gap-[0.35em] text-[0.72em] font-semibold text-[#5b6b7c]">
            {t("To")}
            <input type="date" value={draft.to} min={draft.from || undefined} onChange={(e) => setDay("to", e.target.value)} className={`${FIELD} text-[1.1em]`} />
          </label>
          {invalid && (
            <span role="alert" className="text-[0.7em] font-semibold text-[#c03d3d]">
              {t("Pick a start date on or before the end date.")}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export function ReportHeader({
  eyebrow,
  title,
  subtitle,
  range,
  onRangeChange,
  filters,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  range?: DateRange;
  onRangeChange?: (range: DateRange) => void;
  filters?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-[1em] print:hidden">
      <div className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[1em]">
        <div className="min-w-0 max-w-[44em]">
          {eyebrow && (
            <span className="mb-[0.7em] inline-flex items-center gap-[0.5em] rounded-full bg-[#dff3fb] px-[0.9em] py-[0.25em] text-[0.62em] font-bold uppercase tracking-[0.08em] text-[#0b6f86]">
              <span className="size-[0.6em] rounded-full bg-[#06b6d4]" />
              {eyebrow}
            </span>
          )}
          <h1 className="text-[1.9em] font-extrabold leading-tight text-[#0b1b2b] xl:text-[2.2em]">{title}</h1>
          {subtitle && <p className="mt-[0.4em] text-[0.82em] leading-snug text-[#5b6b7c]">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-[0.6em]">{actions}</div>}
      </div>
      {(range || filters) && (
        <div className="flex flex-wrap items-center gap-[0.6em] rounded-[0.9em] bg-white/70 p-[0.6em] shadow-[0_4px_14px_rgba(20,54,90,0.05)]">
          {range && onRangeChange && <DateRangePicker value={range} onChange={onRangeChange} />}
          {filters}
        </div>
      )}
    </header>
  );
}
