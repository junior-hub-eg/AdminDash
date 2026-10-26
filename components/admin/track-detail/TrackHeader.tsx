"use client";

import { BadgeCheck, Layers, Network, Pencil, PlayCircle, Star, UsersRound } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { BTN_SECONDARY, PANEL, StatCard, StatGrid } from "../page-parts";
import { MentorPicture } from "../MentorsTable";
import { TrackIcon, type TrackItem } from "../tracks/track-data";

export function TrackHeader({ item, total, academyAvg, onEdit }: { item: TrackItem; total: number; academyAvg: number; onEdit: () => void }) {
  const t = useT();
  const { track, info, lead } = item;
  const share = total > 0 ? Math.round((track.students / total) * 100) : 0;
  const progress = Math.round(track.progress * 10) / 10;
  const diff = Math.round((track.progress - academyAvg) * 10) / 10;
  const live = track.students > 0;
  const ratings = item.mentors?.filter((m) => m.isActive) ?? [];

  return (
    <section className={`${PANEL} relative overflow-hidden bg-gradient-to-br from-white to-[#e9f6fb] p-[1.5em]`}>
      <div className="flex flex-wrap items-start gap-[1.2em]">
        <span className="grid size-[5em] shrink-0 place-items-center rounded-[1.2em] bg-gradient-to-br from-[#12939b] to-[#0b6f86] text-white shadow-[0_8px_20px_rgba(11,111,134,0.35)]">
          <TrackIcon iconKey={info?.iconKey} className="size-[2.2em]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-[0.4em] text-[0.68em] font-semibold">
            <span className={`rounded-full px-[0.8em] py-[0.2em] ${live ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#eef2f7] text-[#5b6b7c]"}`}>
              ● {live ? t("Active Track") : t("No students")}
            </span>
            <span dir="ltr" className="rounded-full bg-[#eef3fa] px-[0.8em] py-[0.2em] text-[#14365a]">{track.code}</span>
            {info && (
              <span className="rounded-full bg-[#eef3fa] px-[0.8em] py-[0.2em] text-[#14365a]">{info.hasLessons ? t("Lessons & videos") : t("Videos only")}</span>
            )}
          </div>
          <h1 className="mt-[0.3em] text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t(track.name)}</h1>
          <p className="mt-[0.4em] inline-flex items-center gap-[0.5em] rounded-full bg-white/80 px-[0.8em] py-[0.25em] text-[0.78em] text-[#5b6b7c]">
            {lead && <MentorPicture mentor={lead} size="1.6em" />}
            {t("Lead Mentor")}: <b className="text-[#0b6f86]">{lead?.fullName ?? "—"}</b>
          </p>
          {info?.shortDescription && <p className="mt-[0.6em] max-w-[44em] text-[0.82em] text-[#14365a]">{info.shortDescription}</p>}
          <p className="mt-[0.6em] flex flex-wrap gap-[1.2em] text-[0.78em] text-[#5b6b7c]">
            <span className="inline-flex items-center gap-[0.4em]">
              <PlayCircle className="size-[1em]" /> {info ? t("{n} Videos", { n: info.videoCount }) : "—"}
            </span>
            <span className="inline-flex items-center gap-[0.4em]">
              <Layers className="size-[1em]" /> {t("{n} Squads", { n: track.squads })}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-[0.5em]">
          <button type="button" onClick={onEdit} className={BTN_SECONDARY}>
            <Pencil className="size-[1em]" /> {t("Edit Details")}
          </button>
        </div>
      </div>

      <StatGrid className="mt-[1.4em]">
        <StatCard label={t("Enrolled Students")} icon={UsersRound} value={track.students} hint={t("{pct}% of all students", { pct: share })} />
        <StatCard label={t("Active Squads")} icon={Network} tone="violet" value={<>{track.squads} <span className="text-[0.5em] font-semibold">{t("Squads")}</span></>} />
        <StatCard
          label={t("Avg. Completion Rate")}
          icon={BadgeCheck}
          tone="green"
          value={`${progress}%`}
          badge={`${diff >= 0 ? "+" : ""}${diff}%`}
          badgeTone={diff >= 0 ? "up" : "down"}
          hint={t("vs Academy Avg")}
        />
        <StatCard
          label={t("Mentor Rating")}
          icon={Star}
          tone="amber"
          value={
            ratings.length ? (
              <>
                {(ratings.reduce((s, m) => s + m.rating, 0) / ratings.length).toFixed(2)}
                <span className="text-[0.5em] font-medium text-[#8a97a6]"> / 5.0</span>
              </>
            ) : (
              "—"
            )
          }
          hint={t("average of {n} active mentors", { n: ratings.length })}
        />
      </StatGrid>
    </section>
  );
}
