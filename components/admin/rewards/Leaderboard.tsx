"use client";

import { useState } from "react";
import type { Route } from "next";
import Link from "next/link";
import { ChevronRight, Flame, Medal, Trophy, User, Users } from "lucide-react";
import { getSquadLeaders, getStudentLeaders } from "@/lib/admin-rewards-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "../admin-data";
import { Empty, fmt, Initials, Pill, Section } from "../reports/ui";

type Mode = "students" | "squads";

const loadStudents = () => getStudentLeaders(8);
const loadSquads = () => getSquadLeaders(8);

interface Row {
  key: string;
  href: Route;
  name: string;
  pill: string | null;
  sub: string;
  xp: number;
}

/** Velocity Standings: top students or top squads (sum of current members' XP). */
export function Leaderboard({ longestStreak }: { longestStreak: number | null }) {
  const t = useT();
  const [mode, setMode] = useState<Mode>("students");
  const students = useAdminData(loadStudents, tk("We couldn't load the leaderboard. Please try again."));
  const squads = useAdminData(loadSquads, tk("We couldn't load the leaderboard. Please try again."));
  const active = mode === "students" ? students : squads;

  const rows: Row[] | null =
    mode === "students"
      ? (students.data
          ?.filter((s) => s.totalXp > 0)
          .map((s) => ({
            key: s.studentId,
            href: `/admin/students/${s.studentId}` as Route,
            name: s.fullName,
            pill: s.tracks[0] ?? null,
            sub: [s.schoolName ?? t("Independent"), t("{count} badges", { count: s.badges })].join(" · "),
            xp: s.totalXp,
          })) ?? null)
      : (squads.data?.map((s) => ({
          key: s.squadId,
          href: `/admin/squads/${s.squadId}` as Route,
          name: s.name,
          pill: null,
          sub: [s.projectTitle, t("{count} members", { count: s.members })].join(" · "),
          xp: s.totalXp,
        })) ?? null);

  const [first, ...rest] = rows ?? [];
  const toggle = (id: Mode, label: string, Icon: typeof User) => (
    <button
      type="button"
      onClick={() => setMode(id)}
      aria-pressed={mode === id}
      className={`inline-flex items-center gap-[0.35em] rounded-[0.5em] px-[0.8em] py-[0.35em] ${
        mode === id ? "bg-white text-[#0b6f86] shadow-sm" : "text-[#5b6b7c] hover:text-[#14365a]"
      }`}
    >
      <Icon className="size-[1.1em]" /> {label}
    </button>
  );

  return (
    <Section
      title={t("Velocity Standings")}
      description={mode === "students" ? t("Top students by total XP earned.") : t("Top squads by their members' total XP.")}
      aside={
        <div className="flex rounded-[0.7em] bg-[#f1f6fb] p-[0.25em] text-[0.72em] font-semibold">
          {toggle("squads", t("Top Squads"), Users)}
          {toggle("students", t("Top Students"), User)}
        </div>
      }
    >
      {longestStreak != null && mode === "students" && (
        <div className="mt-[0.6em]">
          <Pill tone="amber">
            <Flame className="size-[1em]" /> {t("Longest streak: {count} days", { count: longestStreak })}
          </Pill>
        </div>
      )}

      {!rows ? (
        <LoadState error={active.error} onRetry={active.reload} />
      ) : !first ? (
        <Empty
          icon={mode === "students" ? Trophy : Medal}
          title={mode === "students" ? t("No student has earned XP yet") : t("No squad has members yet")}
          className="mt-[1em]"
        />
      ) : (
        <ol className="mt-[1em] space-y-[0.7em]">
          <li>
            <Link
              href={first.href}
              className="flex flex-wrap items-center gap-[0.9em] rounded-[1em] bg-[linear-gradient(100deg,#fde9c0,#fff7e6_60%,#ffffff)] p-[1em] shadow-[0_6px_18px_rgba(199,133,26,0.15)] sm:flex-nowrap"
            >
              <span className="grid size-[2.8em] shrink-0 place-items-center rounded-[0.8em] bg-[#f5b72b] text-[#5a3a00]">
                <Trophy className="size-[1.4em]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-[0.4em]">
                  <span className="truncate text-[1.05em] font-extrabold text-[#0b1b2b]">{first.name}</span>
                  {first.pill && <Pill tone="cyan">{first.pill}</Pill>}
                  <Pill tone="amber">{t("#1 Champion")}</Pill>
                </span>
                <span className="mt-[0.2em] block text-[0.72em] text-[#5b6b7c]">{first.sub}</span>
              </span>
              <span className="text-end">
                <span className="block text-[1.5em] font-extrabold text-[#0b1b2b]">{fmt(first.xp)}</span>
                <span className="block text-[0.62em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">{t("Total XP")}</span>
              </span>
              <ChevronRight className="size-[1.2em] shrink-0 text-[#5b6b7c] rtl:rotate-180" />
            </Link>
          </li>
          {rest.map((s, i) => (
            <li key={s.key}>
              <Link href={s.href} className="flex items-center gap-[0.9em] rounded-[0.9em] bg-[#f5f8fe] px-[1em] py-[0.8em] hover:bg-[#ecf3fb]">
                <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#e3eaf2] text-[0.85em] font-bold text-[#14365a]">
                  {i + 2}
                </span>
                <Initials name={s.name} className="hidden sm:grid" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-[0.4em]">
                    <span className="truncate text-[0.92em] font-bold text-[#0b1b2b]">{s.name}</span>
                    {s.pill && <Pill tone="cyan">{s.pill}</Pill>}
                  </span>
                  <span className="block truncate text-[0.7em] text-[#8a97a6]">{s.sub}</span>
                </span>
                <span className="text-end">
                  <span className="block text-[1.1em] font-extrabold text-[#0b1b2b]">{fmt(s.xp)}</span>
                  <span className="block text-[0.6em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">XP</span>
                </span>
                <ChevronRight className="size-[1.1em] shrink-0 text-[#8a97a6] rtl:rotate-180" />
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}
