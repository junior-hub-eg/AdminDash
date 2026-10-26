"use client";

import { Activity, BellRing, CalendarClock, MessageSquareText, Trophy } from "lucide-react";
import type { AdminSquadFull, AdminSquadTask, SquadTaskStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { Avatar } from "./parts";

export const TASK_STATUS_LABEL: Record<SquadTaskStatus, string> = {
  ToDo: tk("To Do"),
  InProgress: tk("In Progress"),
  Review: tk("Review"),
  Done: tk("Done"),
};

const DOT: Record<SquadTaskStatus, string> = {
  ToDo: "bg-[#8a97a6]",
  InProgress: "bg-[#06b6d4]",
  Review: "bg-[#d04a4a]",
  Done: "bg-[#17935f]",
};

export type SquadEvent = { id: string; at: string; who: string | null; task: string; status: SquadTaskStatus };

/**
 * The squad has no activity API, so the feed is read from its tasks: a done task gives
 * "moved to Done" at completedUtc, any other task its last change at updatedUtc. Newest first.
 */
export function taskActivity(tasks: AdminSquadTask[]): SquadEvent[] {
  return tasks
    .map((x) => ({
      id: x.id,
      at: x.status === "Done" && x.completedUtc ? x.completedUtc : x.updatedUtc,
      who: x.assigneeName,
      task: x.title,
      status: x.status,
    }))
    .filter((e) => !!e.at)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

/** "12 minutes ago" in the page language. */
export function timeAgo(iso: string, now: number) {
  const rtf = new Intl.RelativeTimeFormat(dateLocale("en"), { numeric: "auto" });
  const mins = Math.round((new Date(iso).getTime() - now) / 60000);
  if (Math.abs(mins) < 60) return rtf.format(mins, "minute");
  const hours = Math.round(mins / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

/** Mentor Notes: there is no notes API yet, so the designed card shows its empty state. */
export function MentorNotes({ mentorName }: { mentorName: string | null }) {
  const t = useT();
  return (
    <section className={`${PANEL} p-[1.1em]`}>
      <div className="mb-[0.8em] flex items-center justify-between gap-[0.5em]">
        <h3 className="flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
          <MessageSquareText className="size-[1.1em] text-[#0b89a6]" /> {t("Mentor Notes")}
        </h3>
        {mentorName && (
          <span className="rounded-full bg-[#eef3fb] px-[0.7em] py-[0.15em] text-[0.68em] font-semibold text-[#3d4f61]">{t("Active")}</span>
        )}
      </div>
      <div className="grid place-items-center gap-[0.4em] rounded-[0.8em] bg-[#eef3fb] px-[1em] py-[1.4em] text-center">
        <MessageSquareText className="size-[1.6em] text-[#9fb3c8]" />
        <p className="text-[0.8em] font-semibold text-[#3d4f61]">{t("No notes from the mentor yet")}</p>
        {mentorName && <p className="text-[0.7em] text-[#8a97a6]">{mentorName}</p>}
      </div>
    </section>
  );
}

export function Leaderboard({ ranked, sprintName }: { ranked: AdminSquadFull["members"]; sprintName: string | null }) {
  const t = useT();
  return (
    <section className={`${PANEL} p-[1.1em]`}>
      <div className="mb-[0.8em] flex items-start justify-between gap-[0.5em]">
        <h3 className="flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
          <Trophy className="size-[1.1em] text-[#0b89a6]" /> {t("Squad XP Leaderboard")}
        </h3>
        {sprintName && <span className="text-[0.72em] font-semibold text-[#0b89a6]">{sprintName}</span>}
      </div>
      {ranked.length === 0 ? (
        <p className="py-[1em] text-center text-[0.8em] text-[#8a97a6]">{t("No members yet.")}</p>
      ) : (
        <ol className="grid gap-[0.4em]">
          {ranked.map((m, i) => (
            <li
              key={m.studentId}
              className={`flex items-center gap-[0.6em] rounded-[0.7em] px-[0.6em] py-[0.55em] ${i === 0 ? "bg-[#eef3fb]" : ""}`}
            >
              <span className="w-[1.8em] text-[0.8em] font-bold text-[#0b89a6]">#{i + 1}</span>
              <Avatar name={m.fullName} photoUrl={m.photoUrl} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.82em] font-semibold text-[#0b1b2b]">{m.fullName}</span>
                <span className="block text-[0.7em] text-[#5b6b7c]">{t("{count} Tasks Done", { count: m.tasksDone })}</span>
              </span>
              <span dir="ltr" className="text-[0.8em] font-bold text-[#0b6f86]">
                +{m.totalXp} <span className="text-[0.8em] font-semibold text-[#8a97a6]">XP</span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}

function EventLine({ e, now }: { e: SquadEvent; now: number }) {
  const t = useT();
  return (
    <li className="relative ps-[1.4em]">
      <span className={`absolute start-0 top-[0.35em] size-[0.6em] rounded-full ${DOT[e.status]}`} />
      <p className="text-[0.7em] text-[#8a97a6]">{timeAgo(e.at, now)}</p>
      <p className="text-[0.8em] leading-snug text-[#14365a]">
        <span className="font-semibold text-[#0b89a6]">{e.who ?? t("Whole Squad")}</span>
        {" · "}
        {t("{task} moved to {status}", { task: e.task, status: t(TASK_STATUS_LABEL[e.status]) })}
      </p>
    </li>
  );
}

/** The last few task changes, with a link to the full feed. */
export function LiveActivity({ events, now, onViewAll }: { events: SquadEvent[]; now: number; onViewAll: () => void }) {
  const t = useT();
  return (
    <section className={`${PANEL} p-[1.1em]`}>
      <div className="mb-[0.9em] flex items-center justify-between gap-[0.5em]">
        <h3 className="flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
          <BellRing className="size-[1.1em] text-[#0b89a6]" /> {t("Live Activity")}
        </h3>
        <span className="size-[0.55em] rounded-full bg-[#14b8a6]" aria-hidden />
      </div>
      {events.length === 0 ? (
        <p className="py-[1em] text-center text-[0.8em] text-[#8a97a6]">{t("No activity yet.")}</p>
      ) : (
        <ul className="grid gap-[0.9em]">
          {events.slice(0, 4).map((e) => (
            <EventLine key={e.id} e={e} now={now} />
          ))}
        </ul>
      )}
      {events.length > 0 && (
        <button type="button" onClick={onViewAll} className="mt-[1em] w-full text-center text-[0.74em] font-semibold text-[#0b89a6] hover:underline">
          {t("View full audit log")} <span className="inline-block rtl:rotate-180">→</span>
        </button>
      )}
    </section>
  );
}

/** The "Activity Feed" tab: every task change of the sprint, newest first, grouped by day. */
export function ActivityFeed({ events, now }: { events: SquadEvent[]; now: number }) {
  const t = useT();
  const days = new Map<string, SquadEvent[]>();
  for (const e of events) {
    const key = new Date(e.at).toLocaleDateString(dateLocale("en-GB"), { weekday: "short", day: "numeric", month: "short" });
    days.set(key, [...(days.get(key) ?? []), e]);
  }
  return (
    <section className={`${PANEL} p-[1.3em]`}>
      <h3 className="mb-[1em] flex items-center gap-[0.5em] text-[1.05em] font-bold text-[#0b1b2b]">
        <Activity className="size-[1.1em] text-[#0b89a6]" /> {t("Activity Feed")}
      </h3>
      {events.length === 0 ? (
        <p className="py-[1.5em] text-center text-[0.85em] text-[#8a97a6]">{t("No activity yet.")}</p>
      ) : (
        <div className="grid gap-[1.2em]">
          {[...days].map(([day, list]) => (
            <div key={day}>
              <p className="mb-[0.6em] flex items-center gap-[0.4em] text-[0.72em] font-bold uppercase tracking-[0.08em] text-[#5b6b7c]">
                <CalendarClock className="size-[1.1em]" /> {day}
              </p>
              <ul className="grid gap-[0.8em] border-s border-[#e3ebf3] ps-[0.9em]">
                {list.map((e) => (
                  <EventLine key={e.id} e={e} now={now} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
