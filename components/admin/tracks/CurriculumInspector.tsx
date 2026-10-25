"use client";

import { Check, Lock, Pencil, Plus } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_TRACK_BLUEPRINT } from "../dashboardMock";
import { Section } from "../mentor-detail/parts";

export function CurriculumInspector({ name }: { name: string }) {
  const t = useT();
  return (
    <Section
      title={`${name} ${t("Blueprint")}`}
      sub={t("4-Level Progressive Learning Pathway leading to real-client Capstone deployment.")}
      action={<button type="button" aria-label={t("Edit")} className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#eef3fa] text-[#14365a]"><Pencil className="size-[1em]" /></button>}
    >
      <ol className="grid gap-[0.8em]">
        {MOCK_TRACK_BLUEPRINT.map((l) => (
          <li key={l.title} className="flex gap-[0.8em]">
            <span className={`mt-[0.5em] grid size-[1.8em] shrink-0 place-items-center rounded-full text-white ${l.state === "locked" ? "bg-[#c5d0dc]" : l.state === "current" ? "bg-[#12676b]" : "bg-[#06b6d4]"}`}>
              {l.state === "locked" ? <Lock className="size-[0.9em]" /> : <Check className="size-[0.9em]" />}
            </span>
            <div className={`min-w-0 flex-1 rounded-[0.9em] p-[0.9em] text-[0.8em] ${l.state === "current" ? "border-2 border-[#12676b]/50 bg-white" : "bg-[#f1f5fd]"}`}>
              <div className="flex items-start justify-between gap-[0.5em]">
                <b className="text-[#0b1b2b]">{t(l.title)}</b>
                {l.courses > 0 && <span className="shrink-0 rounded-[0.4em] bg-white px-[0.5em] py-[0.1em] text-[0.8em] font-semibold">{l.courses} {t("Courses")}</span>}
              </div>
              <p className="mt-[0.3em] text-[0.9em] text-[#5b6b7c]">{t(l.desc)}</p>
              <p className="mt-[0.4em] text-[0.8em] font-semibold text-[#0b6f86]">{t(l.meta)}</p>
            </div>
          </li>
        ))}
      </ol>
      <button type="button" className="mt-[1em] flex w-full items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#e6edfb] py-[0.7em] text-[0.8em] font-semibold text-[#14365a]">
        <Plus className="size-[1em]" /> {t("Add Curriculum Level")}
      </button>
    </Section>
  );
}