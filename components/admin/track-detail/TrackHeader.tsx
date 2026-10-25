"use client";

import { Palette, Map, Pencil, Plus, Clock, Layers } from "lucide-react";
import { BadgeCheck, Star, UsersRound, Network } from "lucide-react";
import type { AdminTrack } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { BTN_PRIMARY, BTN_SECONDARY, PANEL, StatCard, StatGrid } from "../page-parts";
import { MOCK_TD_HEADER as H } from "../dashboardMock";

export function TrackHeader({ track, total }: { track: AdminTrack; total: number }) {
  const t = useT();
  const share = total > 0 ? Math.round((track.students / total) * 100) : 0;
  return (
    <section className={`${PANEL} p-[1.5em]`}>
      <div className="flex flex-wrap items-start gap-[1.2em]">
        <span className="grid size-[5em] shrink-0 place-items-center rounded-[1.2em] bg-gradient-to-br from-[#06b6d4] to-[#0b6f86] text-white shadow-[0_8px_20px_rgba(6,182,212,0.35)]">
          <Palette className="size-[2.2em]" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-[0.4em] text-[0.7em] font-semibold">
            <span className="rounded-full bg-[#d7efe6] px-[0.8em] py-[0.2em] text-[#12676b]">● {t("Active Track")}</span>
            <span className="rounded-full bg-[#eef3fa] px-[0.8em] py-[0.2em] text-[#14365a]">{t(H.cohort)}</span>
            <span className="rounded-full bg-[#eef3fa] px-[0.8em] py-[0.2em] text-[#14365a]">{t(H.activeLevel)}</span>
          </div>
          <h1 className="mt-[0.3em] text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{track.name}</h1>
          <p className="mt-[0.5em] inline-block rounded-full bg-[#eef3fa] px-[0.9em] py-[0.3em] text-[0.8em] text-[#5b6b7c]">
            {t("Lead Mentor")}: <b className="text-[#0b6f86]">{H.lead}</b>
          </p>
          <p className="mt-[0.7em] flex flex-wrap gap-[1.2em] text-[0.8em] text-[#5b6b7c]">
            <span className="inline-flex items-center gap-[0.4em]"><Clock className="size-[1em]" /> {H.weeks} {t("Weeks Total")}</span>
            <span className="inline-flex items-center gap-[0.4em]"><Layers className="size-[1em]" /> {H.levels} {t("Pathway Levels")}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-[0.5em]">
          <button type="button" className={BTN_SECONDARY}><Map className="size-[1em]" /> {t("Curriculum Map")}</button>
          <button type="button" className={BTN_SECONDARY}><Pencil className="size-[1em]" /> {t("Edit Details")}</button>
          <button type="button" className={BTN_PRIMARY}><Plus className="size-[1em]" /> {t("Add Course / Level")}</button>
        </div>
      </div>

      <StatGrid className="mt-[1.2em]">
        <StatCard label={t("Enrolled Students")} icon={UsersRound} value={track.students} hint={`${share}% ${t("total")}`} />
        <StatCard label={t("Active Squads")} icon={Network} tone="violet" value={track.squads} hint={t("active sprint engagement")} />
        <StatCard label={t("Avg. Completion Rate")} icon={BadgeCheck} tone="green" value={`${track.progress}%`} hint={t("vs Academy Avg")} />
        <StatCard label={t("Student CSAT")} icon={Star} tone="amber" value={<>{H.csat}<span className="text-[0.5em] font-medium text-[#8a97a6]"> / 5.0</span></>} hint={`${H.reviews} ${t("reviews")}`} />
      </StatGrid>
    </section>
  );
}