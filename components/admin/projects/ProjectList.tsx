"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import type { MockProject } from "../dashboardMock";

const STATUS: Record<MockProject["status"], string> = {
  review: "bg-[#fdf0d4] text-[#a8680c]",
  revisions: "bg-[#fde4e4] text-[#d04a4a]",
  approved: "bg-[#d7efe6] text-[#12676b]",
};

export function ProjectList({ items, selectedId, onSelect }: { items: MockProject[]; selectedId: string; onSelect: (id: string) => void }) {
  const t = useT();
  const [page, setPage] = useState(1);
  const pages = [1, 2, 3];

  return (
    <div className="grid min-w-0 gap-[0.8em]">
      {items.length === 0 && <p className={`${PANEL} p-[2em] text-center text-[0.85em] text-[#5b6b7c]`}>{t("No projects match your filters.")}</p>}

      {items.map((p) => {
        const on = p.id === selectedId;
        return (
          <article
            key={p.id}
            onClick={() => onSelect(p.id)}
            className={`${PANEL} cursor-pointer p-[1.1em] ${on ? "border-s-[0.35em] border-[#06b6d4] ring-2 ring-[#06b6d4]/50" : ""}`}
          >
            <div className="flex items-start gap-[0.9em]">
              <span className="grid size-[3em] shrink-0 place-items-center rounded-[0.8em] bg-[#e0f6fc] text-[#0b89a6]"><FileText className="size-[1.3em]" /></span>
              <div className="min-w-0 flex-1">
                <h3 className="flex flex-wrap items-center gap-[0.5em] font-bold text-[#0b1b2b]">
                  {p.title} <span className={`rounded-full px-[0.7em] py-[0.1em] text-[0.7em] font-semibold ${STATUS[p.status]}`}>{t(p.statusLabel)}</span>
                </h3>
                <p className="mt-[0.3em] flex flex-wrap items-center gap-[0.4em] text-[0.75em] text-[#5b6b7c]">
                  {t("Squad")}: <b className="text-[#14365a]">{p.squad}</b>
                  <span className="rounded-[0.4em] bg-[#dbe8fb] px-[0.6em] py-[0.1em] font-semibold text-[#14365a]">{p.track}</span>
                  • {t("Mentor")}: {p.mentor}
                </p>
                <button type="button" className={`mt-[0.6em] rounded-[0.5em] px-[0.9em] py-[0.3em] text-[0.75em] font-semibold ${on ? "bg-[#0b6f86] text-white" : "bg-[#eef3fa] text-[#14365a]"}`}>
                  {t(p.action)}
                </button>
              </div>
            </div>

            <div className="mt-[0.8em] flex items-center justify-between gap-[0.6em] rounded-[0.7em] bg-[#f1f5fd] px-[0.9em] py-[0.6em] text-[0.75em] text-[#5b6b7c]">
              <span className="min-w-0 truncate">{p.files} <span className="mx-[0.3em]">•</span> <span className={p.status === "revisions" ? "text-[#d04a4a]" : ""}>{p.note}</span></span>
              <span className="flex shrink-0 -space-x-[0.5em] rtl:space-x-reverse">
                {p.members.map((m) => <span key={m} className="grid size-[2em] place-items-center rounded-full border-2 border-white bg-[#12676b] text-[0.8em] font-bold text-white">{m}</span>)}
              </span>
            </div>
          </article>
        );
      })}

      <footer className={`${PANEL} flex flex-wrap items-center justify-between gap-[0.8em] px-[1.1em] py-[0.8em] text-[0.75em] text-[#5b6b7c]`}>
        <span>{t("Showing {from}-{to} of {total} capstone deliverables", { from: 1, to: items.length, total: 38 })}</span>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button type="button" aria-label={t("Previous page")} disabled={page <= 1} onClick={() => setPage(page - 1)} className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40 rtl:rotate-180"><ChevronLeft className="size-[1.1em]" /></button>
          {pages.map((n) => (
            <button key={n} type="button" onClick={() => setPage(n)} aria-current={n === page ? "page" : undefined} className={`grid size-[2.2em] place-items-center rounded-[0.4em] font-semibold ${n === page ? "bg-[#06b6d4] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"}`}>{n}</button>
          ))}
          <button type="button" aria-label={t("Next page")} disabled={page >= pages.length} onClick={() => setPage(page + 1)} className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40 rtl:rotate-180"><ChevronRight className="size-[1.1em]" /></button>
        </nav>
      </footer>
    </div>
  );
}