"use client";

import { Archive, ChevronRight, Download, ListChecks, Star, UserPlus, TriangleAlert } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_TD_MENTORS, MOCK_TD_MILESTONES, MOCK_TD_TOOLS } from "../dashboardMock";
import { Bar, Section, SOFT } from "../mentor-detail/parts";

const initials = (n: string) => n.replace(/^(Dr\.|Eng\.)\s*/, "").split(" ").map((w) => w[0]).slice(0, 2).join("");

export function AssignedMentorsCard() {
  const t = useT();
  return (
    <Section title={t("Assigned Mentors")} action={<span className="text-[0.7em] text-[#8a97a6]">{MOCK_TD_MENTORS.length + 2} {t("Total")}</span>}>
      <ul className="grid gap-[0.6em]">
        {MOCK_TD_MENTORS.map((m) => (
          <li key={m.name} className={`${SOFT} flex items-center gap-[0.8em] !p-[0.7em] text-[0.8em]`}>
            <span className="grid size-[2.6em] shrink-0 place-items-center rounded-full bg-[#dbe8fb] font-bold text-[#14365a]">{initials(m.name)}</span>
            <div className="min-w-0 flex-1"><b className="block text-[#0b1b2b]">{m.name}</b><span className="text-[0.85em] text-[#5b6b7c]">{t(m.role)}</span></div>
            <span className="inline-flex items-center gap-[0.3em] text-[0.85em] font-semibold text-[#0b6f86]"><Star className="size-[0.9em]" />{m.rating}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="mt-[0.8em] flex w-full items-center justify-center gap-[0.4em] rounded-[0.7em] bg-[#e6edfb] py-[0.7em] text-[0.8em] font-semibold text-[#14365a]"><UserPlus className="size-[1em]" /> {t("Assign New Track Mentor")}</button>
    </Section>
  );
}

export function DemographicsCard({ students }: { students: number }) {
  const t = useT();
  const junior = Math.round(students * 0.35);
  return (
    <Section title={t("Demographics & Software")} action={<span className="text-[0.7em] text-[#8a97a6]">{students} {t("Active")}</span>}>
      <div className="text-[0.75em]">
        <p className="mb-[0.3em] flex justify-between"><span>{t("Age Distribution")}</span><b>{t("Junior")} 35% • {t("Senior")} 65%</b></p>
        <div className="flex h-[0.5em] overflow-hidden rounded-full"><span className="w-[35%] bg-[#06b6d4]" /><span className="w-[65%] bg-[#12676b]" /></div>
        <p className="mt-[0.3em] flex justify-between text-[#8a97a6]"><span>{t("Ages 12-14")} ({junior})</span><span>{t("Ages 15-18")} ({students - junior})</span></p>
      </div>
      <p className="mb-[0.6em] mt-[1em] text-[0.7em] font-bold uppercase text-[#5b6b7c]">{t("Design Tool Competency")}</p>
      <ul className="grid gap-[0.7em] text-[0.75em]">
        {MOCK_TD_TOOLS.map((x) => (
          <li key={x.name}><p className="mb-[0.25em] flex justify-between"><span>{x.name}</span><b>{x.pct}%</b></p><Bar pct={x.pct} color={x.pct > 80 ? "#12676b" : "#06b6d4"} /></li>
        ))}
      </ul>
    </Section>
  );
}

export function UpcomingMilestonesCard() {
  const t = useT();
  return (
    <Section title={t("Upcoming Milestones")}>
      <ul className="grid gap-[0.7em]">
        {MOCK_TD_MILESTONES.map((m) => (
          <li key={m.title} className={`${SOFT} text-[0.8em]`}>
            <p className="flex justify-between text-[0.85em]"><span className="rounded-[0.4em] bg-[#dff3fb] px-[0.6em] py-[0.1em] font-semibold text-[#0b6f86]">{t(m.tag)}</span><span className="text-[#5b6b7c]">{m.when}</span></p>
            <b className="mt-[0.4em] block text-[#0b1b2b]">{t(m.title)}</b>
            <span className="text-[0.85em] text-[#5b6b7c]">{t(m.sub)}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function TrackGovernance() {
  const t = useT();
  const row = "flex w-full items-center gap-[0.7em] rounded-[0.7em] px-[0.9em] py-[0.8em] text-start text-[0.8em] font-semibold";
  return (
    <Section title={t("Track Governance & Export")}>
      <div className="grid gap-[0.6em]">
        <button type="button" className={`${row} bg-[#f1f5fd] text-[#14365a]`}><Download className="size-[1.1em]" /><span className="flex-1">{t("Export Syllabus (PDF)")}</span><ChevronRight className="size-[1em] rtl:rotate-180" /></button>
        <button type="button" className={`${row} bg-[#f1f5fd] text-[#14365a]`}><ListChecks className="size-[1.1em]" /><span className="flex-1">{t("Manage Rubric Criteria")}</span><ChevronRight className="size-[1em] rtl:rotate-180" /></button>
        <button type="button" className={`${row} bg-[#fdecec] text-[#b83232]`}><Archive className="size-[1.1em]" /><span className="flex-1">{t("Archive Track Cohort")}</span><TriangleAlert className="size-[1em]" /></button>
      </div>
    </Section>
  );
}