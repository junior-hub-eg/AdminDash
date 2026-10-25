"use client";

import { CircleCheck, Clock, ListChecks, Star } from "lucide-react";
import type { AdminReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";

export function ReportStats({ stats, className = "" }: { stats: AdminReport["stats"] | null; className?: string }) {
  const t = useT();
  const items = [
    { label: tk("Completion Rate"), value: stats ? `${stats.completionRate}%` : undefined, icon: ListChecks, bg: "bg-white/10" },
    { label: tk("Active Engagement"), value: stats ? `${stats.activeEngagement}%` : undefined, icon: CircleCheck, bg: "bg-[#cfe9dc]/70" },
    { label: tk("Avg. Student Score"), value: stats ? `${stats.averageScore}/100` : undefined, icon: Clock, bg: "bg-[#f3b9be]/60" },
    { label: tk("Total Certificates Issued"), value: stats ? String(stats.certificatesIssued) : undefined, icon: Star, bg: "bg-[#f0e8a6]/75" },
  ];

  return (
    <ul className={`grid grid-cols-2 gap-[1em] lg:grid-cols-4 ${className}`} aria-busy={!stats}>
      {items.map((s) => (
        <li
          key={s.label}
          className={`flex items-center gap-[0.8em] rounded-[0.9em] border border-white/45 px-[1em] py-[0.7em] backdrop-blur-[3px] ${s.bg}`}
        >
          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-[0.6em] bg-white/90 text-[#14365a]">
            <s.icon className="size-[1.15em]" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[0.7em] text-[#14365a]/80">{t(s.label)}</span>
            <span dir="ltr" className="block truncate text-[1.1em] font-bold leading-tight text-[#0b1b2b] rtl:text-end">
              {s.value ?? "—"}
            </span>
          </span>
        </li>
      ))}
    </ul>
  );
}
