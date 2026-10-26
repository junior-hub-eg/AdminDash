"use client";

import { useCallback } from "react";
import Link from "next/link";
import type { Route } from "next";
import { CalendarX2, ExternalLink, Video } from "lucide-react";
import { getAdminSessions } from "@/lib/admin-mentor-sessions-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

const when = (iso: string) =>
  new Date(iso).toLocaleString(dateLocale("en-GB"), { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/** The Mentors page card: the next three sessions across all mentors, with the join link when there is one. */
export function UpcomingSessions() {
  const t = useT();
  const load = useCallback(() => getAdminSessions({ status: "Upcoming", pageSize: 3 }), []);
  const page = useAdminData(load, tk("We couldn't load the sessions. Please try again."));
  const data = page.data;

  return (
    <article className={card}>
      <header className="flex items-start justify-between gap-[0.6em]">
        <h2 className="inline-flex items-center gap-[0.5em] text-[1.05em] font-bold text-[#0b1b2b]">
          <Video className="size-[1.05em] text-[#0b6f86]" /> {t("Upcoming Sessions")}
        </h2>
        <span className="text-[0.72em] font-semibold text-[#0b6f86]">{data ? t("{count} scheduled", { count: data.total }) : "—"}</span>
      </header>
      {!data ? (
        <LoadState error={page.error} onRetry={page.reload} />
      ) : data.items.length === 0 ? (
        <div className="mt-[0.9em] grid place-items-center gap-[0.4em] rounded-[0.8em] bg-[#f4f8fd] px-[1em] py-[1.6em] text-center">
          <CalendarX2 className="size-[1.6em] text-[#8a97a6]" />
          <p className="text-[0.8em] font-semibold text-[#14365a]">{t("No upcoming sessions")}</p>
        </div>
      ) : (
        <ul className="mt-[0.9em] grid gap-[0.6em]">
          {data.items.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-[0.6em] rounded-[0.8em] bg-[#f4f8fd] px-[0.9em] py-[0.7em] text-[0.78em]">
              <div className="min-w-0">
                <p className="truncate font-bold text-[#0b1b2b]">{s.title || (s.type === "Group" ? t("Group session") : t("1:1 session"))}</p>
                <p className="truncate text-[#5b6b7c]">
                  <Link href={`/admin/mentors/${s.mentorId}` as Route} className="font-semibold text-[#14365a] hover:underline">
                    {s.mentorName}
                  </Link>
                  {" · "}
                  {s.squadName ?? s.students.map((x) => x.fullName).join(", ")}
                </p>
                <p className="text-[#0b6f86]">{when(s.startsUtc)}</p>
              </div>
              {s.meetingLink && (
                <a
                  href={s.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex shrink-0 items-center gap-[0.3em] rounded-[0.5em] bg-white px-[0.7em] py-[0.3em] font-semibold text-[#0b6f86] shadow-sm hover:bg-[#eef4fa]"
                >
                  <ExternalLink className="size-[0.95em]" /> {t("Join")}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
