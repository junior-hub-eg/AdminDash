"use client";

import { useState } from "react";
import { announcementStatus, type Announcement, type AnnouncementAudience } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import { Bar, Section } from "../mentor-detail/parts";

const AUDIENCES: { key: AnnouncementAudience; color: string }[] = [
  { key: "Everyone", color: "#06b6d4" },
  { key: "Students", color: "#12676b" },
  { key: "Mentors", color: "#5b6b88" },
  { key: "Teachers", color: "#7c5cff" },
];

/**
 * From the announcements themselves: how many published ones each audience has and how many
 * people they reach, and how many were published on each of the last 7 days.
 */
export function AudienceEngagement({ items }: { items: Announcement[] }) {
  const t = useT();
  const [now] = useState(() => Date.now());
  const live = items.filter((a) => announcementStatus(a, now) === "live");
  const most = Math.max(1, ...AUDIENCES.map((x) => live.filter((a) => a.audience === x.key).length));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * 86_400_000);
    const key = d.toDateString();
    return {
      label: d.toLocaleDateString(dateLocale("en-US"), { weekday: "narrow" }),
      count: items.filter((a) => !a.isDraft && new Date(a.publishAtUtc ?? a.createdUtc).toDateString() === key).length,
    };
  });
  const peak = Math.max(1, ...days.map((d) => d.count));

  return (
    <Section title={t("Audience Engagement")} action={<span className="text-[0.7em] text-[#8a97a6]">{t("Live announcements")}</span>}>
      <ul className="grid gap-[1em] text-[0.8em]">
        {AUDIENCES.map(({ key, color }) => {
          const mine = live.filter((a) => a.audience === key);
          const reach = mine.reduce((n, a) => Math.max(n, a.reach), 0);
          return (
            <li key={key}>
              <p className="mb-[0.3em] flex justify-between font-semibold text-[#14365a]">
                <span className="inline-flex items-center gap-[0.5em]">
                  <span className="size-[0.6em] rounded-full" style={{ background: color }} />
                  {t(key)}
                </span>
                <b className="text-[#0b1b2b]">{mine.length}</b>
              </p>
              <Bar pct={(mine.length / most) * 100} color={color} />
              <p className="mt-[0.3em] text-[0.85em] text-[#8a97a6]">{t("Reaches up to {count} people", { count: reach })}</p>
            </li>
          );
        })}
      </ul>

      <div className="mt-[1.2em] rounded-[0.9em] bg-[#f1f5fd] p-[1em]">
        <p className="flex justify-between text-[0.75em] font-semibold text-[#14365a]">
          <span>{t("Weekly Delivery Velocity")}</span>
          <span className="text-[0.85em] text-[#0b6f86]">{t("{count} this week", { count: days.reduce((n, d) => n + d.count, 0) })}</span>
        </p>
        <div className="mt-[0.8em] flex h-[5em] items-end gap-[0.4em]" aria-hidden>
          {days.map((d, i) => (
            <span
              key={i}
              className="flex-1 rounded-[0.3em]"
              style={{ height: `${Math.max(6, (d.count / peak) * 100)}%`, background: d.count ? "#22c1dd" : "#dbe8fb" }}
            />
          ))}
        </div>
        <div className="mt-[0.3em] flex gap-[0.4em] text-center text-[0.65em] text-[#8a97a6]">
          {days.map((d, i) => (
            <span key={i} className="flex-1">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
