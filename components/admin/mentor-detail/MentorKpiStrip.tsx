"use client";

import { Clock, GraduationCap, Star, UsersRound, Zap } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";

/** Rating, squads and students are real; office hours and response time have no API yet. */
export function MentorKpiStrip({ mentor: m }: { mentor: AdminMentor }) {
  const t = useT();
  const items = [
    { icon: Star, value: m.rating.toFixed(2), unit: "/ 5.0", label: t("Student Rating") },
    {
      icon: UsersRound,
      value: `${m.monitoredSquads} ${m.monitoredSquads === 1 ? t("Squad") : t("Squads")}`,
      unit: "",
      label: m.squadNames.length ? m.squadNames.join(" & ") : t("No squad yet"),
    },
    { icon: GraduationCap, value: String(m.students), unit: "", label: t("Assigned Students") },
    { icon: Clock, value: "—", unit: "", label: t("Completed Office Hours") },
    { icon: Zap, value: "—", unit: "", label: t("Response SLA") },
  ];
  return (
    <ul className="grid gap-[0.7em] rounded-[1em] bg-[#f4f8fd] p-[0.8em] min-[480px]:grid-cols-2 lg:grid-cols-5">
      {items.map(({ icon: Icon, value, unit, label }) => (
        <li key={label + value} className="flex min-w-0 items-center gap-[0.7em] rounded-[0.8em] bg-white p-[0.8em]">
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#e6f1fb] text-[#0b6f86]">
            <Icon className="size-[1.1em]" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-[#0b1b2b]">
              {value} {unit && <span className="text-[0.7em] font-medium text-[#8a97a6]">{unit}</span>}
            </p>
            <p className="truncate text-[0.7em] text-[#8a97a6]">{label}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
