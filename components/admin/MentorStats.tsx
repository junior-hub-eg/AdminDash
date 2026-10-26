"use client";

import type { ReactNode } from "react";
import { CalendarCheck, ClipboardX, Clock, Contact, Star, UserCheck } from "lucide-react";
import type { AdminMentor, AdminMentorsPage } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";

const card = "relative overflow-hidden rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** A mentor is "balanced" with 1-2 monitored squads, so each active mentor has room for 2 squads. */
export const SQUADS_PER_MENTOR = 2;

/** The four cards at the top of Mentors Management. `pending` is the number of mentor sign-ups waiting for approval. */
export function MentorStats({
  stats,
  mentors,
  pending,
  className = "",
}: {
  stats: AdminMentorsPage["stats"] | null;
  mentors: AdminMentor[];
  pending: number | null;
  className?: string;
}) {
  const t = useT();
  const active = mentors.filter((m) => m.isActive);
  // Utilization: active mentors who monitor at least one squad.
  const utilization = active.length ? Math.round((active.filter((m) => m.monitoredSquads > 0).length / active.length) * 100) : 0;
  const openSlots = active.reduce((sum, m) => sum + Math.max(0, SQUADS_PER_MENTOR - m.monitoredSquads), 0);

  return (
    <ul className={`grid grid-cols-1 gap-[1em] min-[480px]:grid-cols-2 xl:grid-cols-4 ${className}`} aria-busy={!stats}>
      <li className={card}>
        <Head label={t("Total Mentors")} icon={<Contact className="size-[1.1em]" />} />
        <Value>{stats?.totalMentors ?? "—"}</Value>
        <Foot>
          {stats && (
            <Chip className="bg-[#e0f6fc] text-[#0b6f86]">
              <Star className="size-[0.9em] fill-current" /> {stats.averageRating.toFixed(2)}
            </Chip>
          )}
          {t("average rating")}
        </Foot>
      </li>

      <li className={card}>
        <Head label={t("Active Mentors")} icon={<UserCheck className="size-[1.1em]" />} />
        <Value>{stats?.activeMentors ?? "—"}</Value>
        <Foot>
          {stats && <Chip className="bg-[#e0f6fc] text-[#0b6f86]">{utilization}%</Chip>}
          {t("utilization rate")}
        </Foot>
      </li>

      <li className={card}>
        <Head label={t("Available Capacity")} icon={<CalendarCheck className="size-[1.1em]" />} />
        <Value>{stats ? t("{n} Slots", { n: openSlots }) : "—"}</Value>
        <Foot>
          <Chip className="bg-[#e0f6fc] text-[#0b6f86]">{t("Open")}</Chip>
          {t("for squad pairing")}
        </Foot>
      </li>

      <li className={card}>
        <Head label={t("Pending Apps")} icon={<ClipboardX className="size-[1.1em]" />} danger />
        <p className="mt-[0.9em] flex flex-wrap items-center gap-[0.5em]">
          <span className="text-[2em] font-extrabold leading-none text-[#0b1b2b]">{pending === null ? "—" : String(pending).padStart(2, "0")}</span>
          {pending !== null && pending > 0 && <Chip className="bg-[#fdd9d9] text-[#b83232]">{t("Attention")}</Chip>}
        </p>
        <p className="mt-[0.7em] inline-flex items-center gap-[0.35em] text-[0.75em] font-semibold text-[#d04a4a]">
          <Clock className="size-[1em]" /> {t("Requires screening")}
        </p>
      </li>
    </ul>
  );
}

function Head({ label, icon, danger = false }: { label: string; icon: ReactNode; danger?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-[0.6em]">
      <span className="text-[0.72em] font-semibold uppercase tracking-[0.08em] text-[#5b6b7c]">{label}</span>
      <span className={`grid size-[2.5em] shrink-0 place-items-center rounded-full ${danger ? "bg-[#fde0e0] text-[#d04a4a]" : "bg-[#e6f1fb] text-[#0b89a6]"}`}>
        {icon}
      </span>
    </div>
  );
}

function Value({ children }: { children: ReactNode }) {
  return <p className="mt-[0.9em] text-[2em] font-extrabold leading-none text-[#0b1b2b]">{children}</p>;
}

function Foot({ children }: { children: ReactNode }) {
  return <p className="mt-[0.7em] flex flex-wrap items-center gap-[0.4em] text-[0.75em] text-[#5b6b7c]">{children}</p>;
}

function Chip({ children, className }: { children: ReactNode; className: string }) {
  return <span className={`inline-flex items-center gap-[0.25em] rounded-full px-[0.6em] py-[0.1em] font-semibold ${className}`}>{children}</span>;
}
