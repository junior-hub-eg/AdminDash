"use client";

import { AlertTriangle, BarChart3, Users } from "lucide-react";
import type { AdminOverview } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";

/** "+30%", "-5%" or "New" when last week had nobody. */
function change(percent: number | null, t: (s: string) => string) {
  if (percent === null) return t("New");
  return `${percent > 0 ? "+" : ""}${percent}%`;
}

/** The four dashboard numbers. Shows dashes until the overview has loaded. */
export function StatCards({ overview, className = "" }: { overview: AdminOverview | null; className?: string }) {
  const t = useT();
  const dash = "—";

  return (
    <ul className={`grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4 ${className}`} aria-busy={!overview}>
      {/* Active students */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#cfe9dc]/70 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">{t("Active Students")}</h2>
        <div className="my-[0.4em] flex flex-1 items-center justify-center gap-[1.2em]">
          <BarChart3 className="size-[3.2em] text-[#0f7378]" strokeWidth={2.6} />
          <span className="flex flex-col items-center">
            <span className="text-[1.6em] font-bold leading-none text-[#0b1b2b]">{overview ? overview.activeStudents : dash}</span>
            <span dir="ltr" className="text-[0.95em] font-medium text-[#0f7378]">
              {overview ? change(overview.activeStudentsChangePercent, t) : ""}
            </span>
          </span>
        </div>
        <p className="text-center text-[0.75em] text-[#0b1b2b]/85">
          {overview ? t("{active} of {total} students, change vs last week", { active: overview.activeStudents, total: overview.totalStudents }) : t("Change vs last week")}
        </p>
      </li>

      {/* Pending reviews */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#c4e8dc]/70 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">{t("Pending Reviews")}</h2>
        <span className="mt-[0.5em] inline-flex w-fit items-center gap-[0.4em] rounded-full bg-[#0b1b2b] px-[0.8em] py-[0.15em] text-[0.7em] font-semibold text-[#f5b72b]">
          <span className="size-[0.6em] rounded-full bg-[#f5b72b]" /> {t("Pending")}
        </span>
        <span className="mt-[0.4em] inline-block w-fit rounded-full bg-[#0b1b2b] px-[0.9em] py-[0.1em] text-[1.1em] font-bold text-[#f5b72b]">
          {overview ? overview.pendingReviews : dash}
        </span>
        <p className="mt-auto pt-[0.4em] text-center text-[0.75em] text-[#0b1b2b]/85">{t("Projects waiting for the monitor's review")}</p>
      </li>

      {/* Avg squad size */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#f3b9be]/75 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">{t("Avg Squads")}</h2>
        <div className="my-[0.4em] flex flex-1 items-center justify-center gap-[0.9em]">
          <span className="grid size-[4em] place-items-center rounded-full bg-[#a6d6d0]/85">
            <Users className="size-[2.1em] text-[#0f7378]" strokeWidth={1.8} />
          </span>
          <span className="text-[1.6em] font-bold text-[#0b1b2b]">{overview ? overview.averageSquadSize : dash}</span>
        </div>
        <p className="text-center text-[0.75em] text-[#0b1b2b]/85">
          {overview ? t("Students per squad, {count} squads", { count: overview.totalSquads }) : t("Students per squad")}
        </p>
      </li>

      {/* Squads without monitor */}
      <li className="flex min-h-[9em] flex-col rounded-[1em] border border-white/45 bg-[#f0e8a6]/80 p-[1.1em] backdrop-blur-[3px] xl:min-h-0">
        <h2 className="text-[1.15em] font-bold leading-tight text-[#0b1b2b]">{t("Squads without monitor")}</h2>
        <div className="flex flex-1 flex-col items-center justify-center">
          <span className="inline-flex items-center gap-[0.4em] rounded-full bg-white px-[0.9em] py-[0.15em] text-[0.7em] font-semibold text-[#c0392b]">
            <AlertTriangle className="size-[1em]" /> {t("Waiting")}
          </span>
          <span className="text-[2.6em] font-medium leading-none text-[#0b1b2b]">{overview ? overview.squadsWithoutMonitor : dash}</span>
        </div>
        <p className="text-center text-[0.75em] text-[#0b1b2b]/85">{t("Assign one on the Squads page")}</p>
      </li>
    </ul>
  );
}
