"use client";

import { CheckCheck, Medal, Timer } from "lucide-react";
import type { TrackSubmissions } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/** The bottom row, from the submissions per track (GET admin/submissions/by-track). */
export function ReviewMetrics({ tracks, error }: { tracks: TrackSubmissions[] | null; error: string | null }) {
  const t = useT();
  const list = tracks ?? [];
  const submitted = list.reduce((n, x) => n + x.submitted, 0);
  const inReview = list.reduce((n, x) => n + x.inReview, 0);
  const approved = list.reduce((n, x) => n + x.approved, 0);
  const busiest = [...list].sort((a, b) => b.submitted - a.submitted)[0];
  const dash = tracks ? null : "—";

  const cards = [
    {
      icon: Timer,
      label: t("Submissions In Review"),
      value: dash ?? t("{n} of {total}", { n: inReview, total: submitted }),
      hint: tracks ? t("Submitted projects waiting for a mentor") : (error ?? ""),
    },
    {
      icon: CheckCheck,
      label: t("Approval Rate"),
      value: dash ?? (submitted ? `${Math.round((approved / submitted) * 1000) / 10}%` : "—"),
      hint: tracks ? t("Across all {n} technical tracks", { n: list.length }) : "",
    },
    {
      icon: Medal,
      label: t("Most Active Track"),
      value: dash ?? (busiest && busiest.submitted > 0 ? busiest.trackName : "—"),
      hint: tracks && busiest && busiest.submitted > 0 ? t("{n} submissions from {squads} squads", { n: busiest.submitted, squads: busiest.squads }) : "",
    },
  ];

  return (
    <ul className="grid gap-[1em] md:grid-cols-3">
      {cards.map(({ icon: Icon, label, value, hint }) => (
        <li key={label} className={`${PANEL} flex items-center gap-[1em] p-[1.1em]`}>
          <span className="grid size-[3em] shrink-0 place-items-center rounded-[0.8em] bg-[#eef3fb] text-[#14365a]">
            <Icon className="size-[1.3em]" />
          </span>
          <div className="min-w-0">
            <p className="text-[0.65em] font-semibold uppercase tracking-[0.04em] text-[#5b6b7c]">{label}</p>
            <p className="truncate text-[1.25em] font-bold text-[#0b1b2b]">{value}</p>
            {hint && <p className="text-[0.75em] font-medium text-[#0b6f86]">{hint}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
