"use client";

import Link from "next/link";
import { ChevronRight, Flame, Trophy, User, Users } from "lucide-react";
import type { AdminStudent } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { Empty, fmt, Initials, Pill, Section } from "../reports/ui";

/** Students with XP, highest first. */
export function rankStudents(students: AdminStudent[]) {
  return students.filter((s) => s.totalXp > 0).sort((a, b) => b.totalXp - a.totalXp);
}

/** Velocity Standings: the student XP leaderboard (squad standings need a heavier API, so that toggle is disabled). */
export function Leaderboard({
  ranked,
  longestStreak,
  error,
  onRetry,
}: {
  ranked: AdminStudent[] | null;
  longestStreak: number | null;
  error: string | null;
  onRetry: () => void;
}) {
  const t = useT();
  const top = ranked?.slice(0, 8) ?? [];
  const [first, ...rest] = top;

  return (
    <Section
      title={t("Velocity Standings")}
      description={t("Top students by total XP earned.")}
      aside={
        <div className="flex rounded-[0.7em] bg-[#f1f6fb] p-[0.25em] text-[0.72em] font-semibold">
          <button type="button" disabled title={t("Coming soon")} className="inline-flex items-center gap-[0.35em] rounded-[0.5em] px-[0.8em] py-[0.35em] text-[#8a97a6] disabled:cursor-not-allowed">
            <Users className="size-[1.1em]" /> {t("Top Squads")}
          </button>
          <span aria-current="true" className="inline-flex items-center gap-[0.35em] rounded-[0.5em] bg-white px-[0.8em] py-[0.35em] text-[#0b6f86] shadow-sm">
            <User className="size-[1.1em]" /> {t("Top Students")}
          </span>
        </div>
      }
    >
      {longestStreak != null && (
        <div className="mt-[0.6em]">
          <Pill tone="amber">
            <Flame className="size-[1em]" /> {t("Longest streak: {count} days", { count: longestStreak })}
          </Pill>
        </div>
      )}

      {!ranked ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : !first ? (
        <Empty icon={Trophy} title={t("No student has earned XP yet")} className="mt-[1em]" />
      ) : (
        <ol className="mt-[1em] space-y-[0.7em]">
          <li>
            <Link
              href={`/admin/students/${first.id}`}
              className="flex flex-wrap items-center gap-[0.9em] rounded-[1em] bg-[linear-gradient(100deg,#fde9c0,#fff7e6_60%,#ffffff)] p-[1em] shadow-[0_6px_18px_rgba(199,133,26,0.15)] sm:flex-nowrap"
            >
              <span className="grid size-[2.8em] shrink-0 place-items-center rounded-[0.8em] bg-[#f5b72b] text-[#5a3a00]">
                <Trophy className="size-[1.4em]" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-[0.4em]">
                  <span className="truncate text-[1.05em] font-extrabold text-[#0b1b2b]">{first.fullName}</span>
                  {first.trackName && <Pill tone="cyan">{first.trackName}</Pill>}
                  <Pill tone="amber">{t("#1 Champion")}</Pill>
                </span>
                <span className="mt-[0.2em] block text-[0.72em] text-[#5b6b7c]">{first.squadName ?? t("No squad")}</span>
              </span>
              <span className="text-end">
                <span className="block text-[1.5em] font-extrabold text-[#0b1b2b]">{fmt(first.totalXp)}</span>
                <span className="block text-[0.62em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">{t("Total XP")}</span>
              </span>
              <ChevronRight className="size-[1.2em] shrink-0 text-[#5b6b7c] rtl:rotate-180" />
            </Link>
          </li>
          {rest.map((s, i) => (
            <li key={s.id}>
              <Link href={`/admin/students/${s.id}`} className="flex items-center gap-[0.9em] rounded-[0.9em] bg-[#f5f8fe] px-[1em] py-[0.8em] hover:bg-[#ecf3fb]">
                <span className="grid size-[2.2em] shrink-0 place-items-center rounded-[0.6em] bg-[#e3eaf2] text-[0.85em] font-bold text-[#14365a]">
                  {i + 2}
                </span>
                <Initials name={s.fullName} className="hidden sm:grid" />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-[0.4em]">
                    <span className="truncate text-[0.92em] font-bold text-[#0b1b2b]">{s.fullName}</span>
                    {s.trackName && <Pill tone="cyan">{s.trackName}</Pill>}
                  </span>
                  <span className="block truncate text-[0.7em] text-[#8a97a6]">{s.squadName ?? t("No squad")}</span>
                </span>
                <span className="text-end">
                  <span className="block text-[1.1em] font-extrabold text-[#0b1b2b]">{fmt(s.totalXp)}</span>
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
