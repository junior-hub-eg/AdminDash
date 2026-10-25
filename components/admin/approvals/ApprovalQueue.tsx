"use client";

import { ChevronLeft, ChevronRight, Clock, ListFilter, LoaderCircle, RefreshCw } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import type { Priority, QueueItem } from "./types";

type Props = {
  rows: QueueItem[];
  /** Number of requests after filtering (all pages). */
  total: number;
  page: number;
  pageSize: number;
  onPage: (page: number) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
  checked: Set<string>;
  onToggle: (id: string) => void;
  onToggleVisible: () => void;
  selectedCount: number;
  priority: Priority | "all";
  onPriority: (value: Priority | "all") => void;
  onRefresh: () => void;
  /** Id of the request being saved ("bulk" while a bulk approve runs). */
  busyId: string | null;
  onApprove: (item: QueueItem) => void;
  onDecline: (item: QueueItem) => void;
};

const PRIORITY_UI: Record<Priority, { label: string; pill: string; dot: string }> = {
  urgent: { label: "Urgent", pill: "bg-[#ffe1e4] text-[#c0263f]", dot: "bg-[#e04848]" },
  medium: { label: "Medium", pill: "bg-[#e3e9ff] text-[#3b3fb0]", dot: "bg-[#6b63d6]" },
  normal: { label: "Normal", pill: "bg-[#eef2f7] text-[#14365a]/70", dot: "bg-[#9aa9ba]" },
};

const AVATAR_TONES = [
  "bg-[#06b6d4] text-white",
  "bg-[#dbe7ff] text-[#1d4ed8]",
  "bg-[#e0e4ff] text-[#3b3fb0]",
  "bg-[#d4f3ec] text-[#0f766e]",
  "bg-[#ffe1e4] text-[#c0263f]",
];

const initials = (name: string) =>
  name
    .replace(/^(Dr|Eng)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

/** 1 2 3 … style page list. */
function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 6) return Array.from({ length: count }, (_, i) => i + 1);

  const out: (number | "gap")[] = [];
  const near = new Set([1, count, page - 1, page, page + 1]);

  for (let i = 1; i <= count; i++) {
    if (near.has(i)) out.push(i);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }

  return out;
}

export default function ApprovalQueue({
  rows,
  total,
  page,
  pageSize,
  onPage,
  selectedId,
  onSelect,
  checked,
  onToggle,
  onToggleVisible,
  selectedCount,
  priority,
  onPriority,
  onRefresh,
  busyId,
  onApprove,
  onDecline,
}: Props) {
  const { t } = useI18n();

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const locked = busyId !== null;
  const allChecked = rows.length > 0 && rows.every((r) => checked.has(r.id));

  const th = "px-4 py-3 text-start text-[0.66rem] font-semibold uppercase tracking-wider text-[#14365a]/55";

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
        <label className="flex items-center gap-2.5 text-[0.78rem] font-medium text-[#14365a]">
          <input
            type="checkbox"
            checked={allChecked}
            onChange={onToggleVisible}
            disabled={rows.length === 0}
            className="size-4 accent-[#06b6d4]"
          />
          {t("Select All")} ({rows.length} {t("Visible")})
          <span className="text-[#14365a]/30">|</span>
          <span className="text-[#0a7f99]">
            {selectedCount} {t("selected")}
          </span>
        </label>

        <div className="flex items-center gap-2">
          <label className="relative">
            <span className="sr-only">{t("Filter by Priority")}</span>
            <ListFilter className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-[#14365a]/55" />
            <select
              value={priority}
              onChange={(e) => onPriority(e.target.value as Priority | "all")}
              className="h-10 appearance-none rounded-xl border border-[#e1e8f0] bg-[#f4f8fb] ps-9 pe-4 text-[0.78rem] font-medium text-[#14365a] outline-none focus:border-[#06b6d4]"
            >
              <option value="all">{t("Filter by Priority (All)")}</option>
              <option value="urgent">{t("Urgent")}</option>
              <option value="medium">{t("Medium")}</option>
              <option value="normal">{t("Normal")}</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onRefresh}
            title={t("Refresh")}
            aria-label={t("Refresh")}
            className="grid size-10 place-items-center rounded-xl border border-[#e1e8f0] bg-[#f4f8fb] text-[#14365a]/60 hover:bg-[#e8f1f7]"
          >
            <RefreshCw className="size-4" />
          </button>
        </div>
      </div>

      <div className="rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-[0.78rem] text-[#14365a]">
            <thead className="bg-[#f1f6fa]">
              <tr>
                <th scope="col" className={th}>{t("Requester & Details")}</th>
                <th scope="col" className={th}>{t("Type & Track")}</th>
                <th scope="col" className={th}>{t("Submitted")}</th>
                <th scope="col" className={`${th} text-end`}>{t("Actions & Decision")}</th>
              </tr>
            </thead>

            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-[#14365a]/55">
                    {t("No requests are waiting for approval.")}
                  </td>
                </tr>
              )}

              {rows.map((r, i) => {
                const selected = r.id === selectedId;
                const pr = PRIORITY_UI[r.priority];
                const busy = busyId === r.id;

                return (
                  <tr
                    key={r.id}
                    onClick={() => onSelect(r.id)}
                    className={`cursor-pointer border-b border-[#eef2f7] last:border-0 transition-colors ${
                      selected ? "bg-[#eaf8fc]" : "hover:bg-[#f6fafc]"
                    }`}
                  >
                    <td
                      className={`border-s-[3px] px-4 py-3.5 ${selected ? "border-s-[#06b6d4]" : "border-s-transparent"}`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={checked.has(r.id)}
                          onChange={() => onToggle(r.id)}
                          onClick={(e) => e.stopPropagation()}
                          aria-label={`${t("Select")} ${r.name}`}
                          className="mt-3 size-4 shrink-0 accent-[#06b6d4]"
                        />

                        <span
                          className={`grid size-10 shrink-0 place-items-center rounded-full text-[0.74rem] font-bold ${AVATAR_TONES[i % AVATAR_TONES.length]}`}
                        >
                          {initials(r.name)}
                        </span>

                        <div className="min-w-0">
                          <p className="truncate font-semibold">{r.name}</p>
                          <span
                            className={`mt-0.5 inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[0.62rem] font-bold ${pr.pill}`}
                          >
                            <span className={`size-1.5 rounded-full ${pr.dot}`} />
                            {t(pr.label)}
                          </span>
                          <p className="mt-0.5 truncate text-[0.7rem] text-[#14365a]/60">{r.subtitle}</p>
                          <p className="max-w-[14rem] truncate text-[0.7rem] italic text-[#14365a]/45" title={r.note}>
                            “{r.note}”
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold">{t(r.typeLabel)}</p>
                      <span className="mt-1 inline-block rounded-md bg-[#e8f4fa] px-2 py-1 text-[0.68rem] font-medium text-[#0a7f99]">
                        {t(r.context)}
                      </span>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="flex items-center gap-1.5 whitespace-nowrap font-medium">
                        <Clock className="size-3.5 text-[#14365a]/50" />
                        {r.submitted}
                      </p>
                      <p
                        className={`mt-0.5 text-[0.7rem] ${r.slaAlert ? "font-semibold text-[#c0263f]" : "text-[#14365a]/55"}`}
                      >
                        {t(r.sla)}
                      </p>
                    </td>

                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={locked}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDecline(r);
                          }}
                          className="rounded-lg bg-[#ffe6e6] px-3 py-1.5 text-[0.72rem] font-semibold text-[#b42a2a] hover:bg-[#ffd8d8] disabled:opacity-50"
                        >
                          {t("Decline")}
                        </button>

                        <button
                          type="button"
                          disabled={locked}
                          onClick={(e) => {
                            e.stopPropagation();
                            onApprove(r);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-[#06b6d4] px-3 py-1.5 text-[0.72rem] font-semibold text-white hover:bg-[#0597b1] disabled:opacity-50"
                        >
                          {busy && <LoaderCircle className="size-3.5 animate-spin" />}
                          {t(r.primaryLabel)}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5 text-[0.72rem] text-[#14365a]/65">
          <p>
            {t("Showing")} {rows.length} {t("of")} {total} {t("pending approval tickets")}
          </p>

          <nav aria-label={t("Pagination")} className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onPage(page - 1)}
              disabled={page <= 1}
              aria-label={t("Previous page")}
              className="grid size-8 place-items-center rounded-lg hover:bg-[#eef4fa] disabled:opacity-35"
            >
              <ChevronLeft className="size-4 rtl:rotate-180" />
            </button>

            {pageList(page, pageCount).map((p, i) =>
              p === "gap" ? (
                <span key={`gap-${i}`} className="px-1">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => onPage(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={`grid size-8 place-items-center rounded-lg text-[0.74rem] font-semibold ${
                    p === page ? "bg-[#0d2a45] text-white" : "hover:bg-[#eef4fa]"
                  }`}
                >
                  {p}
                </button>
              ),
            )}

            <button
              type="button"
              onClick={() => onPage(page + 1)}
              disabled={page >= pageCount}
              aria-label={t("Next page")}
              className="grid size-8 place-items-center rounded-lg hover:bg-[#eef4fa] disabled:opacity-35"
            >
              <ChevronRight className="size-4 rtl:rotate-180" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
}