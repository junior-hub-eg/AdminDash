"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FolderKanban, Users } from "lucide-react";
import type { AdminSquad, AdminSquadStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { SQUAD_STATUS_LABEL } from "./ProjectFilters";

const PAGE_SIZE = 4;

const STATUS: Record<AdminSquadStatus, string> = {
  Waiting: "bg-[#eef2f7] text-[#5b6b7c]",
  Active: "bg-[#dff3fb] text-[#0b6f86]",
  InReview: "bg-[#fdf0d4] text-[#a8680c]",
  Completed: "bg-[#d7efe6] text-[#12676b]",
};

const TILE: Record<AdminSquadStatus, string> = {
  Waiting: "bg-[#eef3fb] text-[#5b6b88]",
  Active: "bg-[#e0f6fc] text-[#0b89a6]",
  InReview: "bg-[#e6eefb] text-[#1d6fe0]",
  Completed: "bg-[#dff7ea] text-[#17935f]",
};

/** The squads' projects as cards; the selected one is outlined. Four per page. */
export function ProjectList({ items, selectedId, onSelect }: { items: AdminSquad[]; selectedId: string | null; onSelect: (id: string) => void }) {
  const t = useT();
  const [page, setPage] = useState(1);
  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const from = (current - 1) * PAGE_SIZE;
  const visible = items.slice(from, from + PAGE_SIZE);

  return (
    <div className="grid min-w-0 gap-[0.8em]">
      {items.length === 0 && <p className={`${PANEL} p-[2em] text-center text-[0.85em] text-[#5b6b7c]`}>{t("No projects match your filters.")}</p>}

      {visible.map((s) => {
        const on = s.id === selectedId;
        return (
          <article
            key={s.id}
            className={`${PANEL} relative overflow-hidden p-[1.1em] ${on ? "ring-2 ring-[#22c1dd]" : ""}`}
          >
            {on && <span aria-hidden className="absolute inset-y-0 start-0 w-[0.35em] bg-[#22c1dd]" />}
            <div className="flex items-start gap-[0.9em]">
              <span className={`grid size-[2.8em] shrink-0 place-items-center rounded-[0.7em] ${TILE[s.status]}`}>
                <FolderKanban className="size-[1.25em]" />
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="flex flex-wrap items-center gap-[0.5em] text-[1.05em] font-semibold text-[#0b1b2b]">
                  {s.projectTitle || t("Untitled project")}
                  <span className={`rounded-[0.4em] px-[0.6em] py-[0.1em] text-[0.62em] font-semibold ${STATUS[s.status]}`}>
                    {s.status === "InReview" && "● "}
                    {t(SQUAD_STATUS_LABEL[s.status])}
                  </span>
                </h3>
                <p className="mt-[0.3em] flex flex-wrap items-center gap-[0.4em] text-[0.75em] text-[#5b6b7c]">
                  {t("Squad")}: <b className="font-semibold text-[#0b1b2b]">{s.name}</b>
                  <span aria-hidden>•</span>
                  <span className="rounded-[0.4em] bg-[#dbe8fb] px-[0.6em] py-[0.1em] font-semibold text-[#14365a]">{t(s.level)}</span>
                  <span aria-hidden>•</span>
                  {t("Monitor")}: {s.monitor?.fullName ?? t("Not assigned")}
                </p>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => onSelect(s.id)}
                  className={`mt-[0.6em] inline-flex items-center gap-[0.3em] rounded-[0.5em] px-[0.9em] py-[0.3em] text-[0.75em] font-semibold ${
                    on ? "bg-[#0b6f86] text-white" : "bg-[#eef3fb] text-[#0b1b2b] hover:bg-[#e6eefb]"
                  }`}
                >
                  {on ? t("Selected") : t("Review")}
                  {on && <ChevronRight className="size-[1em] rtl:rotate-180" />}
                </button>
              </div>
            </div>

            <div className="mt-[0.8em] flex flex-wrap items-center gap-x-[0.8em] gap-y-[0.4em] rounded-[0.6em] bg-[#f1f5fd] px-[0.9em] py-[0.6em] text-[0.72em] text-[#3d4f61]">
              <span className="inline-flex items-center gap-[0.35em]">
                <Users className="size-[1.05em]" /> {t("{n} of {cap} students", { n: s.students, cap: s.capacity })}
              </span>
              <span aria-hidden>•</span>
              <span className="inline-flex flex-1 items-center gap-[0.5em]">
                {t("Progress")}
                <span className="h-[0.4em] min-w-[4em] max-w-[10em] flex-1 overflow-hidden rounded-full bg-[#dfe7f1]">
                  <span className="block h-full rounded-full bg-[#10b9a0]" style={{ width: `${Math.min(100, s.progress)}%` }} />
                </span>
                <b className="text-[#0b1b2b]">{s.progress}%</b>
              </span>
            </div>
          </article>
        );
      })}

      <footer className={`${PANEL} flex flex-wrap items-center justify-between gap-[0.8em] px-[1.1em] py-[0.8em] text-[0.75em] text-[#5b6b7c]`}>
        <span>
          {t("Showing")}{" "}
          <b className="text-[#0b1b2b]" dir="ltr">
            {items.length ? from + 1 : 0}–{from + visible.length}
          </b>{" "}
          {t("of")} <b className="text-[#0b1b2b]">{items.length}</b> {t("capstone deliverables")}
        </span>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button
            type="button"
            aria-label={t("Previous page")}
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40"
          >
            <ChevronLeft className="size-[1.1em] rtl:rotate-180" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === current ? "page" : undefined}
              className={`grid size-[2.2em] place-items-center rounded-[0.4em] font-semibold ${n === current ? "bg-[#06b6d4] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label={t("Next page")}
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40"
          >
            <ChevronRight className="size-[1.1em] rtl:rotate-180" />
          </button>
        </nav>
      </footer>
    </div>
  );
}
