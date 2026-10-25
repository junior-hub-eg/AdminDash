"use client";

import { FileText } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { MOCK_TD_DELIVERABLES } from "../dashboardMock";
import { Section, SOFT } from "../mentor-detail/parts";

const BADGE: Record<string, string> = {
  review: "bg-[#fdf0d4] text-[#a8680c]",
  progress: "bg-[#dff3fb] text-[#0b6f86]",
  approved: "bg-[#d7efe6] text-[#12676b]",
};

export function CapstoneDeliverables() {
  const t = useT();
  return (
    <Section
      title={t("Capstone Deliverables & Artifact Reviews")}
      sub={t("Jury assessments, Figma prototype links, and benchmark evaluation scores.")}
      action={<span className="rounded-full bg-[#eef3fa] px-[0.9em] py-[0.3em] text-[0.7em] font-semibold text-[#5b6b7c]">{t("Cohort Cycle")} 2024.B</span>}
    >
      <ul className="grid gap-[0.8em]">
        {MOCK_TD_DELIVERABLES.map((d) => (
          <li key={d.title} className={`${SOFT} flex flex-wrap items-center gap-[0.9em] text-[0.8em]`}>
            <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.7em] bg-white text-[#0b6f86]"><FileText className="size-[1.2em]" /></span>
            <div className="min-w-0 flex-1">
              <p className="flex flex-wrap items-center gap-[0.5em] font-bold text-[#0b1b2b]">
                {d.title} <span className="rounded-[0.4em] bg-[#dbe8fb] px-[0.6em] py-[0.1em] text-[0.8em] font-semibold text-[#14365a]">{d.tag}</span>
              </p>
              <p className="text-[0.9em] text-[#5b6b7c]">{t("Submitted by")} {d.by} • {t("Evaluator")}: {d.evaluator}</p>
            </div>
            <span className={`rounded-full px-[0.8em] py-[0.25em] font-semibold ${BADGE[d.status]}`}>{t(d.label)}</span>
            <button type="button" className="rounded-[0.5em] bg-white px-[0.9em] py-[0.4em] font-semibold text-[#14365a] shadow-sm">{t(d.action)}</button>
          </li>
        ))}
      </ul>
    </Section>
  );
}