"use client";

import { CalendarOff, CalendarRange } from "lucide-react";
import type { AdminMentorProfile } from "@/lib/admin-mentor-sessions-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { EmptyNote, Section, SOFT } from "./parts";
import { DAYS, plainDate } from "./format";

/**
 * The mentor's weekly slots (45 minutes each, school time) and coming time off. `full` is the
 * "Weekly Schedule & Availability" tab: every day of the week as a column.
 */
export function WeeklyAvailabilityCard({
  profile,
  error,
  onRetry,
  full = false,
}: {
  profile: AdminMentorProfile | null;
  error: string | null;
  onRetry: () => void;
  full?: boolean;
}) {
  const t = useT();
  const title = full ? t("Weekly Schedule & Availability") : t("Weekly Availability");
  if (!profile) {
    return (
      <Section title={title} icon={<CalendarRange className="size-[1.1em]" />}>
        <LoadState error={error} onRetry={onRetry} />
      </Section>
    );
  }
  const byDay = DAYS.map((d, i) => ({ day: d, slots: profile.availability.filter((s) => s.dayOfWeek === i) }));
  const days = full ? byDay : byDay.filter((d) => d.slots.length > 0);
  return (
    <Section
      title={title}
      sub={profile.availability.length ? t("{n} hrs offered each week", { n: profile.weeklyAvailableHours }) : undefined}
      icon={<CalendarRange className="size-[1.1em]" />}
    >
      {profile.availability.length === 0 ? (
        <EmptyNote text={t("This mentor hasn't shared a weekly schedule yet.")} />
      ) : (
        <ul className={full ? "grid gap-[0.6em] sm:grid-cols-4 xl:grid-cols-7" : "grid gap-[0.5em]"}>
          {days.map((d) => (
            <li key={d.day} className={full ? `${SOFT} min-h-[6em]` : "flex flex-wrap items-center gap-[0.5em] text-[0.78em]"}>
              <span className={full ? "block text-[0.75em] font-bold uppercase text-[#5b6b7c]" : "w-[3em] font-bold text-[#14365a]"}>{t(d.day)}</span>
              <span className={full ? "mt-[0.4em] grid gap-[0.3em]" : "flex flex-wrap gap-[0.3em]"}>
                {d.slots.length === 0 ? (
                  <span className="text-[0.75em] text-[#8a97a6]">—</span>
                ) : (
                  d.slots.map((s) => (
                    <span key={s.startTime} dir="ltr" className="rounded-full bg-[#dff3fb] px-[0.7em] py-[0.15em] text-[0.75em] font-semibold text-[#0b6f86]">
                      {s.startTime}–{s.endTime}
                    </span>
                  ))
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
      {profile.timeOff.length > 0 && (
        <div className="mt-[1em]">
          <p className="mb-[0.4em] flex items-center gap-[0.4em] text-[0.72em] font-bold uppercase tracking-[0.05em] text-[#5b6b7c]">
            <CalendarOff className="size-[1.1em]" /> {t("Time off")}
          </p>
          <ul className="grid gap-[0.35em] text-[0.78em] text-[#14365a]">
            {profile.timeOff.map((o) => (
              <li key={o.id} className="flex flex-wrap justify-between gap-[0.5em] rounded-[0.6em] bg-[#fdf4e6] px-[0.8em] py-[0.4em]">
                <span>
                  {plainDate(o.startDate)}
                  {o.endDate !== o.startDate && <> – {plainDate(o.endDate)}</>}
                </span>
                {o.reason && <span className="text-[#8a6d3b]">{o.reason}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
