"use client";

import { LayoutDashboard } from "lucide-react";
import { useT } from "@/lib/i18n/client";

export type MentorTab = "overview" | "squads" | "students" | "schedule" | "reviews" | "performance";

export function MentorTabs({ value, onChange, counts }: { value: MentorTab; onChange: (v: MentorTab) => void; counts: { squads: number; students: number } }) {
  const t = useT();
  const tabs: { key: MentorTab; label: string; count?: number }[] = [
    { key: "overview", label: t("Overview") },
    { key: "squads", label: t("Assigned Squads"), count: counts.squads },
    { key: "students", label: t("Mentored Students"), count: counts.students },
    { key: "schedule", label: t("Weekly Schedule & Availability") },
    { key: "reviews", label: t("Student Reviews") },
    { key: "performance", label: t("Performance & Evaluation") },
  ];
  return (
    <div role="tablist" className="flex gap-[0.3em] overflow-x-auto rounded-[0.9em] bg-white/80 p-[0.35em] text-[0.8em] shadow-[0_4px_14px_rgba(20,54,90,0.05)] [scrollbar-width:none]">
      {tabs.map((x) => (
        <button
          key={x.key}
          type="button"
          role="tab"
          aria-selected={value === x.key}
          onClick={() => onChange(x.key)}
          className={`inline-flex shrink-0 items-center gap-[0.4em] whitespace-nowrap rounded-[0.6em] px-[1em] py-[0.55em] font-semibold ${
            value === x.key ? "bg-white text-[#0b6f86] shadow-[0_2px_8px_rgba(20,54,90,0.1)]" : "text-[#14365a] hover:bg-white"
          }`}
        >
          {x.key === "overview" && <LayoutDashboard className="size-[1em]" />}
          {x.label}
          {x.count !== undefined && <span className="rounded-full bg-[#e6f1fb] px-[0.6em] py-[0.05em] text-[0.85em] text-[#0b6f86]">{x.count}</span>}
        </button>
      ))}
    </div>
  );
}
