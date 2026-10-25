"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Rocket, Sparkles } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_TD_LEVELS } from "../dashboardMock";
import { Bar, Section } from "../mentor-detail/parts";

const BOX: Record<string, string> = {
  done: "bg-[#f1f5fd]",
  current: "border-s-[0.3em] border-[#06b6d4] bg-[#eaf8fc]",
  focus: "border-s-[0.3em] border-[#12676b] bg-[#e8f6f2]",
};

export function CurriculumPathway() {
  const t = useT();
  const [open, setOpen] = useState(true);
  return (
    <Section
      title={t("Curriculum Pathway & Level Architecture")}
      sub={t("Structured mastery progression across 4 structured developmental stages.")}
      action={
        <button type="button" onClick={() => setOpen(!open)} className="inline-flex items-center gap-[0.4em] text-[0.75em] font-semibold text-[#0b6f86]">
          {open ? t("Collapse All Units") : t("Expand All Units")} <ChevronsUpDown className="size-[1em]" />
        </button>
      }
    >
      <ul className="grid gap-[0.9em]">
        {MOCK_TD_LEVELS.map((l) => (
          <li key={l.phase} className={`flex gap-[1em] rounded-[0.9em] p-[1em] ${BOX[l.state]}`}>
            <span className={`grid size-[2.6em] shrink-0 place-items-center rounded-[0.8em] ${l.state === "done" ? "bg-[#d7efe6] text-[#12676b]" : l.state === "current" ? "bg-[#06b6d4] text-white" : "bg-[#12676b] text-white"}`}>
              {l.state === "done" ? <Check className="size-[1.2em]" /> : l.state === "current" ? <Sparkles className="size-[1.2em]" /> : <Rocket className="size-[1.2em]" />}
            </span>
            <div className="min-w-0 flex-1 text-[0.8em]">
              <p className="flex flex-wrap items-center gap-[0.5em] text-[0.85em] font-bold text-[#5b6b7c]">
                {t(l.phase)} <span className="rounded-full bg-[#0b6f86] px-[0.7em] py-[0.1em] text-white">{t(l.badge)}</span>
              </p>
              <h3 className="mt-[0.3em] text-[1.15em] font-bold text-[#0b1b2b]">{t(l.title)}</h3>
              {open && <p className="mt-[0.3em] text-[#5b6b7c]">{t(l.desc)}</p>}
              <p className="mt-[0.5em] text-[0.9em] font-semibold text-[#14365a]">{t(l.meta)}</p>
              {l.state === "current" && l.done && l.total && (
                <div className="mt-[0.7em] rounded-[0.7em] bg-white p-[0.7em]">
                  <p className="mb-[0.3em] flex justify-between text-[0.85em] font-semibold"><span>{t("Students Finished")}</span><span>{l.done} / {l.total}</span></p>
                  <Bar pct={(l.done / l.total) * 100} />
                </div>
              )}
              {l.state === "done" && <p className="mt-[0.4em] text-[0.85em] font-semibold text-[#12676b]">{t("Status: Completed")}</p>}
            </div>
            <div className="shrink-0 text-end text-[0.8em]">
              <p className="text-[#5b6b7c]">{t(l.scoreLabel)}</p>
              {l.score && <p className="text-[1.5em] font-extrabold text-[#0b1b2b]">{t(l.score)}</p>}
              <p className="text-[0.85em] font-semibold text-[#12676b]">{t(l.note)}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}