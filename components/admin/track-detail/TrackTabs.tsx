"use client";

import { BarChart3, ClipboardList, GraduationCap, Network, UsersRound, Workflow } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export type TrackTab = "curriculum" | "squads" | "students" | "mentors" | "rubrics" | "analytics";

export function TrackTabs({
  value,
  onChange,
  squads,
  students,
  mentors,
}: {
  value: TrackTab;
  onChange: (v: TrackTab) => void;
  squads: number;
  students: number;
  mentors: number | null;
}) {
  const t = useT();
  const tabs = [
    { key: "curriculum" as const, label: t("Curriculum & Levels"), icon: Workflow },
    { key: "squads" as const, label: t("Active Squads"), icon: Network, count: squads },
    { key: "students" as const, label: t("Enrolled Students"), icon: GraduationCap, count: students },
    { key: "mentors" as const, label: t("Mentors & Reviewers"), icon: UsersRound, count: mentors ?? undefined },
    { key: "rubrics" as const, label: t("Rubrics & Capstone"), icon: ClipboardList },
    { key: "analytics" as const, label: t("Analytics"), icon: BarChart3 },
  ];
  return (
    <div role="tablist" className="flex gap-[0.3em] overflow-x-auto rounded-[0.9em] bg-white/80 p-[0.35em] text-[0.8em] shadow-[0_4px_14px_rgba(20,54,90,0.05)] [scrollbar-width:none]">
      {tabs.map(({ key, label, icon: Icon, count }) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={value === key}
          onClick={() => onChange(key)}
          className={`inline-flex shrink-0 items-center gap-[0.45em] whitespace-nowrap rounded-[0.6em] px-[1em] py-[0.55em] font-semibold ${
            value === key ? "bg-white text-[#0b6f86] shadow-[0_2px_8px_rgba(20,54,90,0.1)]" : "text-[#14365a] hover:bg-white"
          }`}
        >
          <Icon className="size-[1em]" />
          {label}
          {count !== undefined && <span className="rounded-full bg-[#e6f1fb] px-[0.6em] py-[0.05em] text-[0.85em] text-[#0b6f86]">{count}</span>}
        </button>
      ))}
    </div>
  );
}
