"use client";

import { Clock, Star, UsersRound, GraduationCap, Zap } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";
import { MOCK_MENTOR_EXTRAS as X } from "../dashboardMock";

export function MentorKpiStrip({ mentor: m }: { mentor: AdminMentor }) {
  const t = useT();
  const items = [
    { icon: Star, value: m.rating.toFixed(2), unit: "/ 5.0", label: t("Student Rating") },
    { icon: UsersRound, value: String(m.monitoredSquads), unit: t("Squads"), label: t("Masters & Pioneers") },
    { icon: GraduationCap, value: String(m.students), unit: t("Optimal"), label: t("Assigned Students") },
    { icon: Clock, value: `${X.hours} hrs`, unit: "", label: t("Completed Office Hours") },
    { icon: Zap, value: X.responseSla, unit: t("Top 5%"), label: t("Response SLA") },
  ];
  return (
    <ul className={`${PANEL} grid gap-[0.8em] p-[1em] sm:grid-cols-2 xl:grid-cols-5`}>
      {items.map(({ icon: Icon, value, unit, label }) => (
        <li key={label} className="flex min-w-0 items-center gap-[0.8em] rounded-[0.9em] bg-[#f1f5fd] p-[0.9em]">
          <span className="grid size-[2.6em] shrink-0 place-items-center rounded-full bg-[#dbe8fb] text-[#1d6fe0]"><Icon className="size-[1.2em]" /></span>
          <div className="min-w-0">
            <p className="font-bold text-[#0b1b2b]">{value} <span className="text-[0.7em] font-medium text-[#8a97a6]">{unit}</span></p>
            <p className="text-[0.7em] text-[#8a97a6]">{label}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}