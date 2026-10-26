"use client";

import { TrendingUp } from "lucide-react";
import type { AdminMentorProfile } from "@/lib/admin-mentor-sessions-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { Bar, Section, SOFT } from "./parts";

/** The Performance & Evaluation tab: session outcomes, the rating spread and how responsive the mentor is. */
export function PerformanceCard({ profile, error, onRetry }: { profile: AdminMentorProfile | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  if (!profile) {
    return (
      <Section title={t("Performance & Evaluation")} icon={<TrendingUp className="size-[1.1em]" />}>
        <LoadState error={error} onRetry={onRetry} />
      </Section>
    );
  }
  const p = profile;
  const past = p.sessionsCompleted + p.sessionsNoShow;
  const attendance = past ? Math.round((p.sessionsCompleted / past) * 100) : null;
  const tiles = [
    { label: t("Sessions completed"), value: String(p.sessionsCompleted) },
    { label: t("Upcoming Sessions"), value: String(p.sessionsUpcoming) },
    { label: t("No-shows"), value: String(p.sessionsNoShow) },
    { label: t("Cancelled"), value: String(p.sessionsCancelled) },
    { label: t("Mentoring hours"), value: String(p.mentoringHours) },
    { label: t("Attendance rate"), value: attendance === null ? "—" : `${attendance}%` },
    { label: t("Feedback rate"), value: p.feedbackRatePercent === null ? "—" : `${p.feedbackRatePercent}%` },
    { label: t("Average reply time"), value: p.averageReplyHours === null ? "—" : t("{n} hrs", { n: p.averageReplyHours }) },
  ];
  const most = Math.max(1, ...p.ratingBreakdown);
  return (
    <Section title={t("Performance & Evaluation")} icon={<TrendingUp className="size-[1.1em]" />}>
      <div className="grid gap-[1.2em] lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <ul className="grid grid-cols-2 gap-[0.7em] sm:grid-cols-4">
          {tiles.map((x) => (
            <li key={x.label} className={SOFT}>
              <p className="text-[1.4em] font-extrabold text-[#0b1b2b]">{x.value}</p>
              <p className="text-[0.7em] text-[#5b6b7c]">{x.label}</p>
            </li>
          ))}
        </ul>
        <div className={SOFT}>
          <p className="text-[0.7em] font-bold uppercase tracking-[0.05em] text-[#5b6b7c]">{t("Rating breakdown")}</p>
          <p className="mt-[0.2em] text-[1.6em] font-extrabold text-[#0b1b2b]">
            {p.averageRating.toFixed(2)} <span className="text-[0.5em] font-medium text-[#8a97a6]">{t("{n} reviews", { n: p.ratingsCount })}</span>
          </p>
          <ul className="mt-[0.6em] grid gap-[0.4em] text-[0.75em]">
            {p.ratingBreakdown.map((count, i) => (
              <li key={i} className="grid grid-cols-[2.5em_1fr_2em] items-center gap-[0.5em]">
                <span className="text-[#14365a]">{5 - i} ★</span>
                <Bar pct={(count / most) * 100} color="#f5b301" />
                <span className="text-end text-[#5b6b7c]">{count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  );
}
