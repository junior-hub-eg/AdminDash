"use client";

import { useState } from "react";
import { ChartNoAxesCombined } from "lucide-react";
import type { Announcement, AnnouncementAudience } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

const AUDIENCES: { key: AnnouncementAudience; color: string }[] = [
  { key: "Everyone", color: "#06b6d4" },
  { key: "Students", color: "#12676b" },
  { key: "Mentors", color: "#5b6b88" },
  { key: "Teachers", color: "#7c5cff" },
];

const DAY = 86_400_000;
const BAR_TONES = ["#8fdcec", "#6fd2e6", "#3cc4df", "#06b6d4", "#3cc4df", "#8fdcec", "#6fd2e6"];

/** The publish date of a non-draft announcement (its schedule time, or when it was created). */
const sentAt = (a: Announcement) => new Date(a.publishAtUtc ?? a.createdUtc).getTime();

/**
 * From the announcements themselves (no open / click tracking exists): what share of the
 * last 30 days' broadcasts went to each audience and how many people they reached,
 * and how many were published on each of the last 7 days.
 */
export function AudienceEngagement({ items }: { items: Announcement[] }) {
  const t = useT();
  const [now] = useState(() => Date.now());
  const recent = items.filter((a) => !a.isDraft && sentAt(a) <= now && now - sentAt(a) < 30 * DAY);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now - (6 - i) * DAY);
    const key = d.toDateString();
    return {
      label: d.toLocaleDateString(dateLocale("en-US"), { weekday: "narrow" }),
      count: items.filter((a) => !a.isDraft && new Date(sentAt(a)).toDateString() === key).length,
    };
  });
  const peak = Math.max(1, ...days.map((d) => d.count));
  const week = days.reduce((n, d) => n + d.count, 0);

  return (
    <section className={`${PANEL} min-w-0 p-[1.3em]`}>
      <header className="mb-[1.1em] flex items-start justify-between gap-[0.8em]">
        <h2 className="flex items-center gap-[0.7em] text-[1.1em] font-bold leading-tight text-[#0b1b2b]">
          <span className="grid size-[2.1em] shrink-0 place-items-center rounded-[0.6em] bg-[#e6eefb] text-[#14365a]">
            <ChartNoAxesCombined className="size-[1.05em]" />
          </span>
          <span className="max-w-[7em]">{t("Audience Engagement")}</span>
        </h2>
        <span className="max-w-[5em] text-end text-[0.68em] leading-tight text-[#5b6b7c]">{t("Past 30 Days")}</span>
      </header>

      <ul className="grid gap-[1.1em] text-[0.78em]">
        {AUDIENCES.map(({ key, color }) => {
          const mine = recent.filter((a) => a.audience === key);
          const share = recent.length ? Math.round((mine.length / recent.length) * 1000) / 10 : 0;
          const reach = mine.reduce((n, a) => Math.max(n, a.reach), 0);
          return (
            <li key={key}>
              <p className="mb-[0.4em] flex justify-between font-medium text-[#0b1b2b]">
                <span className="inline-flex items-center gap-[0.5em]">
                  <span className="size-[0.6em] rounded-full" style={{ background: color }} />
                  {t("Broadcasts to {audience}", { audience: t(key) })}
                </span>
                <b dir="ltr">{share}%</b>
              </p>
              <div className="h-[0.4em] w-full overflow-hidden rounded-full bg-[#e6edf3]">
                <div className="h-full rounded-full" style={{ width: `${share}%`, background: color }} />
              </div>
              <p className="mt-[0.4em] flex justify-between text-[0.88em]">
                <span className="text-[#5b6b7c]">{t("{count} broadcasts", { count: mine.length })}</span>
                <span className="font-semibold text-[#12676b]">{t("Reaches up to {count} people", { count: reach.toLocaleString("en") })}</span>
              </p>
            </li>
          );
        })}
      </ul>

      <div className="mt-[1.4em] rounded-[0.8em] bg-[#eef3fb] p-[1em]">
        <p className="flex justify-between text-[0.72em] font-medium text-[#14365a]">
          <span>{t("Weekly Delivery Velocity")}</span>
          <span className="font-semibold text-[#0b6f86]">{t("{count} this week", { count: week })}</span>
        </p>
        <div className="mt-[0.9em] flex h-[3.2em] items-end gap-[0.3em]" aria-hidden>
          {days.map((d, i) => (
            <span
              key={i}
              className="flex-1 rounded-[0.15em]"
              style={{ height: `${Math.max(22, (d.count / peak) * 100)}%`, background: d.count ? BAR_TONES[i] : "#dfe9f8" }}
            />
          ))}
        </div>
        <div className="mt-[0.5em] flex gap-[0.3em] text-center text-[0.62em] text-[#5b6b7c]">
          {days.map((d, i) => (
            <span key={i} className="flex-1">
              {d.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
