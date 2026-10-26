"use client";

import { Gauge } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { Section, SOFT } from "./parts";

/**
 * Real counts only. There are no capacity limits or booked hours in the API yet, so the maxima and the
 * load percentage show "—". The zone uses the same squad rule as the Mentors page (0 / 1-2 / more than 2).
 */
export function CapacityWorkloadCard({ mentor: m, students, squads }: { mentor: AdminMentor; students: number; squads: number }) {
  const t = useT();
  const zone = !m.isActive
    ? { label: t("On Leave"), cls: "bg-[#eef2f7] text-[#5b6b7c]" }
    : squads === 0
      ? { label: t("Available Capacity"), cls: "bg-[#dff3fb] text-[#0b6f86]" }
      : squads > 2
        ? { label: t("High Load"), cls: "bg-[#fde4e4] text-[#d04a4a]" }
        : { label: t("Optimal Zone"), cls: "bg-[#d7efe6] text-[#12676b]" };
  const rows = [
    { label: t("Assigned Students"), value: String(students) },
    { label: t("Assigned Squads"), value: String(squads) },
    { label: t("Weekly Mentorship Hours"), value: "—" },
  ];
  return (
    <Section
      title={t("Capacity & Workload")}
      icon={<Gauge className="size-[1.1em]" />}
      action={<span className={`rounded-full px-[0.8em] py-[0.2em] text-[0.7em] font-semibold ${zone.cls}`}>● {zone.label}</span>}
    >
      <div className={`${SOFT} flex items-center justify-between gap-[1em]`}>
        <div>
          <p className="text-[0.65em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">{t("Total Mentorship Load")}</p>
          <p className="text-[2em] font-extrabold text-[#0b1b2b]">—</p>
          <p className="text-[0.72em] text-[#5b6b7c]">{t("Capacity limits aren't set yet")}</p>
        </div>
        <div className="grid size-[5em] shrink-0 place-items-center rounded-full border-[0.45em] border-[#06b6d4] text-center">
          <span className="text-[0.85em] font-bold leading-tight text-[#0b1b2b]">
            {students}
            <span className="block text-[0.7em] font-medium text-[#5b6b7c]">{t("Students")}</span>
          </span>
        </div>
      </div>
      <ul className="mt-[1em] grid gap-[0.7em] text-[0.75em] text-[#14365a]">
        {rows.map((x) => (
          <li key={x.label} className="flex justify-between border-b border-[#eef2f6] pb-[0.5em] last:border-0">
            <span>{x.label}</span>
            <b>{x.value}</b>
          </li>
        ))}
      </ul>
    </Section>
  );
}
