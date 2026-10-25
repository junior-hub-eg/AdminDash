"use client";

import type { ReactNode } from "react";
import { CalendarClock, ClipboardList, UserCheck, UsersRound } from "lucide-react";
import type { AdminMentorsPage } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";

const card = "rounded-[1.1em] bg-white p-[1.1em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** The four cards at the top of Mentors Management. `pending` is the number of mentor sign-ups waiting for approval. */
export function MentorStats({
  stats,
  pending,
  className = "",
}: {
  stats: AdminMentorsPage["stats"] | null;
  pending: number | null;
  className?: string;
}) {
  const t = useT();
  const share = stats && stats.totalMentors > 0 ? Math.round((stats.activeMentors / stats.totalMentors) * 100) : 0;

  return (
    <ul className={`grid grid-cols-1 gap-[1em] min-[480px]:grid-cols-2 xl:grid-cols-4 ${className}`} aria-busy={!stats}>
      <li className={card}>
        <Head label={t("Total Mentors")} icon={<UsersRound className="size-[1.1em]" />} />
        <p className="mt-[0.5em] text-[2em] font-extrabold leading-none text-[#0b1b2b]">{stats?.totalMentors ?? "—"}</p>
        <p className="mt-[0.6em] text-[0.75em] text-[#8a97a6]">
          {stats && (
            <span className="me-[0.4em] rounded-full bg-[#fdf1cf] px-[0.6em] py-[0.1em] font-semibold text-[#a8740a]">★ {stats.averageRating}</span>
          )}
          {t("average rating")}
        </p>
      </li>

      <li className={card}>
        <Head label={t("Active Mentors")} icon={<UserCheck className="size-[1.1em]" />} />
        <p className="mt-[0.5em] text-[2em] font-extrabold leading-none text-[#0b1b2b]">{stats?.activeMentors ?? "—"}</p>
        <p className="mt-[0.6em] text-[0.75em] text-[#8a97a6]">
          {stats && <span className="me-[0.4em] rounded-full bg-[#d7efe6] px-[0.6em] py-[0.1em] font-semibold text-[#12676b]">{share}%</span>}
          {t("of all mentors")}
        </p>
      </li>

      <li className={card}>
        <Head label={t("Upcoming Sessions")} icon={<CalendarClock className="size-[1.1em]" />} />
        <p className="mt-[0.5em] text-[2em] font-extrabold leading-none text-[#0b1b2b]">{stats?.upcomingSessions ?? "—"}</p>
        <p className="mt-[0.6em] text-[0.75em] text-[#8a97a6]">{t("scheduled coaching sessions")}</p>
      </li>

      <li className={card}>
        <Head label={t("Pending Apps")} icon={<ClipboardList className="size-[1.1em]" />} danger />
        <p className="mt-[0.5em] text-[2em] font-extrabold leading-none text-[#0b1b2b]">
          {pending === null ? "—" : String(pending).padStart(2, "0")}
        </p>
        <p className="mt-[0.6em] text-[0.75em] text-[#8a97a6]">
          {pending !== null && pending > 0 && (
            <span className="me-[0.4em] rounded-full bg-[#fdd9d9] px-[0.6em] py-[0.1em] font-semibold text-[#b83232]">{t("Attention")}</span>
          )}
          {t("Requires screening")}
        </p>
      </li>
    </ul>
  );
}

function Head({ label, icon, danger = false }: { label: string; icon: ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-center justify-between text-[0.75em] font-semibold uppercase tracking-wide text-[#5b6b7c]">
      <span>{label}</span>
      <span className={`grid size-[2.4em] place-items-center rounded-[0.7em] ${danger ? "bg-[#fdecec] text-[#b83232]" : "bg-[#eef3fa] text-[#14365a]"}`}>
        {icon}
      </span>
    </div>
  );
}