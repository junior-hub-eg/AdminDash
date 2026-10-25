"use client";

import { useT } from "@/lib/i18n/client";
import { MOCK_MENTOR_CAPACITY as C } from "../dashboardMock";
import { Bar, Section, SOFT } from "./parts";

export function CapacityWorkloadCard() {
  const t = useT();
  const load = Math.round((C.students / C.maxStudents) * 100);
  const r = 40;
  const len = 2 * Math.PI * r;
  const rows = [
    { label: t("Assigned Students"), text: `${C.students} / ${C.maxStudents}`, pct: (C.students / C.maxStudents) * 100 },
    { label: t("Assigned Squads"), text: `${C.squads} / ${C.maxSquads}`, pct: (C.squads / C.maxSquads) * 100 },
    { label: t("Weekly Mentorship Hours"), text: `${C.hours} / ${C.maxHours}`, pct: (C.hours / C.maxHours) * 100 },
  ];
  return (
    <Section title={t("Capacity & Workload")} action={<span className="rounded-full bg-[#d7efe6] px-[0.8em] py-[0.2em] text-[0.7em] font-semibold text-[#12676b]">{t("Optimal Zone")}</span>}>
      <div className={`${SOFT} flex items-center justify-between`}>
        <div>
          <p className="text-[0.65em] font-bold uppercase text-[#5b6b7c]">{t("Total Mentorship Load")}</p>
          <p className="text-[2em] font-extrabold text-[#0b1b2b]">{load}%</p>
          <p className="text-[0.75em] text-[#1d6fe0]">{t("{n} student slots open", { n: C.maxStudents - C.students })}</p>
        </div>
        <div className="relative size-[5.5em]">
          <svg viewBox="0 0 100 100" className="size-full -rotate-90">
            <circle cx="50" cy="50" r={r} fill="none" stroke="#dbe8fb" strokeWidth="9" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="#06b6d4" strokeWidth="9" strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - load / 100)} />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-[0.85em] font-bold text-[#0b1b2b]">{C.students}/{C.maxStudents}</span>
        </div>
      </div>
      <ul className="mt-[1em] grid gap-[0.8em] text-[0.75em]">
        {rows.map((x) => (
          <li key={x.label}><p className="mb-[0.3em] flex justify-between"><span>{x.label}</span><b>{x.text}</b></p><Bar pct={x.pct} color="#12676b" /></li>
        ))}
      </ul>
    </Section>
  );
}