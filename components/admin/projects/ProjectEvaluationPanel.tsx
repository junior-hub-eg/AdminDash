"use client";

import { Ban, GraduationCap, ListPlus, Sparkles, Star } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL, BTN_PRIMARY } from "../page-parts";
import { MOCK_PROJECT_FEEDBACK as F, MOCK_PROJECT_RUBRIC, type MockProject } from "../dashboardMock";
import { Bar } from "../mentor-detail/parts";

export function ProjectEvaluationPanel({ project: p }: { project: MockProject }) {
  const t = useT();
  const total = MOCK_PROJECT_RUBRIC.reduce((s, x) => s + x.score, 0); // TODO(api): rubric per project
  const max = MOCK_PROJECT_RUBRIC.length * 10;

  return (
    <aside className={`${PANEL} min-w-0 p-[1.3em]`}>
      <p className="flex items-center justify-between text-[0.7em]">
        <span className="rounded-[0.4em] bg-[#dbe8fb] px-[0.7em] py-[0.2em] font-bold uppercase text-[#14365a]">{t("Capstone Evaluation")}</span>
        <span className="text-[#8a97a6]">ID: {p.code}</span>
      </p>
      <h2 className="mt-[0.6em] text-[1.3em] font-bold text-[#0b1b2b]">{p.title}</h2>

      <div className="mt-[0.8em] flex items-center gap-[0.8em] rounded-[0.8em] bg-[#f1f5fd] p-[0.7em] text-[0.75em]">
        <span className="grid size-[2.6em] place-items-center rounded-[0.6em] bg-[#0b1b2b] font-bold text-white">{p.squad.split(" ").map((w) => w[0]).join("")}</span>
        <div className="flex-1"><b className="block text-[#0b1b2b]">{t("Squad")}: {p.squad}</b><span className="text-[#5b6b7c]">{p.members.length + 2} {t("Student Contributors")}</span></div>
        <span className="flex -space-x-[0.5em] rtl:space-x-reverse">{p.members.map((m) => <span key={m} className="grid size-[2em] place-items-center rounded-full border-2 border-white bg-[#06b6d4] text-[0.8em] font-bold text-white">{m}</span>)}</span>
      </div>

      <p className="mb-[0.5em] mt-[1.2em] text-[0.7em] font-bold uppercase text-[#5b6b7c]">{t("Attached Deliverables")}</p>
      <div className="grid grid-cols-2 gap-[0.6em] text-[0.75em]">
        <div className="rounded-[0.7em] bg-[#f1f5fd] p-[0.7em]"><b className="block text-[#14365a]">Figma Canvas</b><span className="text-[#8a97a6]">v2.4 Interactive</span></div>
        <div className="rounded-[0.7em] bg-[#f1f5fd] p-[0.7em]"><b className="block text-[#14365a]">Design Spec</b><span className="text-[#8a97a6]">PDF (14.2 MB)</span></div>
      </div>

      <div className="mt-[1.2em] flex items-end justify-between">
        <h3 className="font-bold text-[#0b1b2b]">{t("Sprint Rubric Assessment")}</h3>
        <p><b className="text-[2em] text-[#0b6f86]">{total}</b> <span className="text-[0.75em] text-[#8a97a6]">/ {max} pts</span></p>
      </div>

      <ul className="mt-[0.6em] grid gap-[0.6em]">
        {MOCK_PROJECT_RUBRIC.map((r) => (
          <li key={r.name} className="rounded-[0.8em] bg-[#f1f5fd] p-[0.8em] text-[0.75em]">
            <p className="flex justify-between font-semibold text-[#14365a]"><span>{r.name}</span><span className="text-[#0b6f86]">{r.score} / 10</span></p>
            <span className="my-[0.3em] flex">{Array.from({ length: 5 }, (_, i) => <Star key={i} className={`size-[1.1em] ${i < Math.round(r.score / 2) ? "fill-[#f5a623] text-[#f5a623]" : "text-[#c5d0dc]"}`} />)}</span>
            <Bar pct={r.score * 10} color="#10b9a0" />
          </li>
        ))}
      </ul>

      <figure className="mt-[1em] rounded-[0.9em] bg-[#f1f5fd] p-[1em] text-[0.8em]">
        <figcaption className="flex items-center justify-between font-semibold text-[#0b1b2b]">
          <span className="inline-flex items-center gap-[0.5em]"><span className="grid size-[2em] place-items-center rounded-full bg-[#0b6f86] text-white"><GraduationCap className="size-[1em]" /></span>{t("Mentor Feedback")}: {F.by}</span>
          <span className="text-[0.85em] font-normal text-[#8a97a6]">{t(F.when)}</span>
        </figcaption>
        <blockquote className="mt-[0.6em] border-s-[0.2em] border-[#06b6d4] ps-[0.8em] italic text-[#14365a]">“{t(F.text)}”</blockquote>
      </figure>

      <button type="button" className={`${BTN_PRIMARY} mt-[1em] w-full`}><Sparkles className="size-[1em]" /> {t("Approve & Award +500 Squad XP")}</button>
      <div className="mt-[0.6em] grid grid-cols-2 gap-[0.6em] text-[0.8em] font-semibold">
        <button type="button" className="inline-flex items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#fdf0d4] py-[0.6em] text-[#a8680c]"><ListPlus className="size-[1em]" /> {t("Request Changes")}</button>
        <button type="button" className="inline-flex items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#fde4e4] py-[0.6em] text-[#d04a4a]"><Ban className="size-[1em]" /> {t("Reject")}</button>
      </div>
    </aside>
  );
}