"use client";

import { useT } from "@/lib/i18n/client";

export type TrackTab = "curriculum" | "squads" | "students" | "mentors" | "rubrics" | "analytics";

export function TrackTabs({ value, onChange, squads, students }: { value: TrackTab; onChange: (v: TrackTab) => void; squads: number; students: number }) {
  const t = useT();
  const tabs: { key: TrackTab; label: string; count?: number }[] = [
    { key: "curriculum", label: t("Curriculum & Levels") },
    { key: "squads", label: t("Active Squads"), count: squads },
    { key: "students", label: t("Enrolled Students"), count: students },
    { key: "mentors", label: t("Mentors & Reviewers"), count: 5 },
    { key: "rubrics", label: t("Rubrics & Capstone") },
    { key: "analytics", label: t("Analytics") },
  ];
  return (
    <div role="tablist" className="flex gap-[0.4em] overflow-x-auto rounded-[0.9em] bg-white/70 p-[0.4em] text-[0.8em] [scrollbar-width:none]">
      {tabs.map((x) => (
        <button
          key={x.key}
          type="button"
          role="tab"
          aria-selected={value === x.key}
          onClick={() => onChange(x.key)}
          className={`shrink-0 whitespace-nowrap rounded-[0.6em] px-[1em] py-[0.55em] font-semibold ${value === x.key ? "bg-white text-[#0b6f86] shadow-sm" : "text-[#14365a] hover:bg-white/80"}`}
        >
          {x.label}
          {x.count !== undefined && <span className="ms-[0.5em] rounded-full bg-[#dbe8fb] px-[0.6em] py-[0.1em] text-[0.85em]">{x.count}</span>}
        </button>
      ))}
    </div>
  );
}