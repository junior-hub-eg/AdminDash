"use client";

/**
 * DataTable: sortable table with a sticky header and an empty state.
 *   rows: T[]; rowKey(row): string.
 *   columns: { key, header, cell(row): ReactNode, sort?(row): number | string, align?: "start" | "end",
 *              className? }[]. Columns with `sort` get a sort button (asc → desc).
 *   defaultSort?: { key, dir: "asc" | "desc" }.
 *   empty: { icon, title, text? }: shown when there are no rows.
 *   maxHeight?: CSS max height of the scroll area (default "22em"); printing shows every row.
 *   label: accessible caption.
 */

import { useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ChevronsUpDown, type LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { EmptyState } from "./ReportCard";

export type Column<T> = {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  sort?: (row: T) => number | string;
  align?: "start" | "end";
  className?: string;
};

export type SortState = { key: string; dir: "asc" | "desc" };

export function DataTable<T>({
  rows,
  rowKey,
  columns,
  defaultSort,
  empty,
  maxHeight = "22em",
  label,
}: {
  rows: T[];
  rowKey: (row: T) => string;
  columns: Column<T>[];
  defaultSort?: SortState;
  empty: { icon: LucideIcon; title: string; text?: string };
  maxHeight?: string;
  label: string;
}) {
  const t = useT();
  const [sort, setSort] = useState<SortState | undefined>(defaultSort);

  if (rows.length === 0) return <EmptyState icon={empty.icon} title={empty.title} text={empty.text} className="mt-[1em]" />;

  const col = sort && columns.find((c) => c.key === sort.key && c.sort);
  const sorted = col
    ? [...rows].sort((a, b) => {
        const va = col.sort!(a);
        const vb = col.sort!(b);
        const cmp = typeof va === "number" && typeof vb === "number" ? va - vb : String(va).localeCompare(String(vb));
        return sort!.dir === "asc" ? cmp : -cmp;
      })
    : rows;

  const flip = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: typeof columns.find((c) => c.key === key)?.sort?.(rows[0]) === "number" ? "desc" : "asc" }));

  return (
    <div className="mt-[1em] overflow-auto rounded-[0.8em] border border-[#eef2f7] print:max-h-none! print:overflow-visible" style={{ maxHeight }}>
      <table className="w-full min-w-[34em] border-collapse text-[0.78em]">
        <caption className="sr-only">{label}</caption>
        <thead className="sticky top-0 z-[1] bg-[#f1f6fb]">
          <tr className="text-[0.85em] uppercase tracking-[0.04em] text-[#5b6b7c]">
            {columns.map((c) => {
              const on = sort?.key === c.key;
              const Icon = on ? (sort!.dir === "asc" ? ArrowUp : ArrowDown) : ChevronsUpDown;
              return (
                <th
                  key={c.key}
                  scope="col"
                  aria-sort={on ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined}
                  className={`whitespace-nowrap px-[0.9em] py-[0.7em] font-bold ${c.align === "end" ? "text-end" : "text-start"}`}
                >
                  {c.sort ? (
                    <button
                      type="button"
                      onClick={() => flip(c.key)}
                      title={t("Sort")}
                      className={`inline-flex items-center gap-[0.3em] uppercase hover:text-[#0b1b2b] ${on ? "text-[#0b6f86]" : ""}`}
                    >
                      {c.header}
                      <Icon className="size-[1.05em] print:hidden" aria-hidden />
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#eef2f7]">
          {sorted.map((row) => (
            <tr key={rowKey(row)} className="break-inside-avoid hover:bg-[#f8fbfe]">
              {columns.map((c) => (
                <td key={c.key} className={`px-[0.9em] py-[0.65em] text-[#14365a] ${c.align === "end" ? "text-end" : "text-start"} ${c.className ?? ""}`}>
                  {c.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
