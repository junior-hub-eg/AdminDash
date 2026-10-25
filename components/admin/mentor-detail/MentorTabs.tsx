"use client";

import { useT } from "@/lib/i18n/client";

export type MentorTab = "overview" | "squads" | "students" | "schedule" | "reviews" | "performance";

export function MentorTabs({ value, onChange, counts }: { value: MentorTab; onChange: (v: MentorTab) => void; counts: { squads: number; students: number; reviews: number } }) {
  const t = useT();
  const tabs: { key: MentorTab; label: string; count?: number }[] = [
    { key: "overview", label: t("Overview") },
    { key: "squads", label: t("Assigned Squads"), count: counts.squads },
    { key: "students", label: t("Mentored Students"), count: counts.students },
    { key: "schedule", label: t("Weekly Schedule & Availability") },
    { key: "reviews", label: t("Student Reviews"), count: counts.reviews },
    { key: "performance", label: t("Performance & Evaluation") },
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