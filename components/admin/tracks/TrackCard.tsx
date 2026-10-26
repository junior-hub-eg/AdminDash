"use client";

import Link from "next/link";
import type { Route } from "next";
import { BarChart3, SlidersHorizontal } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL, BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";
import { Bar } from "../mentor-detail/parts";
import { initials, TrackIcon, type TrackItem } from "./track-data";

export function TrackCard({
  item,
  total,
  selected,
  compact = false,
  onSelect,
}: {
  item: TrackItem;
  total: number;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const { track, info, lead } = item;
  const pct = total > 0 ? Math.round((track.students / total) * 100) : 0;
  const mentorCount = item.mentors ? item.mentors.filter((m) => m.isActive).length : null;
  const href = `/admin/tracks/${track.id}` as Route;
  const ring = selected ? "ring-2 ring-[#06b6d4]/60" : "";
  const live = track.students > 0;
  const progress = Math.round(track.progress);

  const icon = (
    <span className="grid size-[3em] shrink-0 place-items-center rounded-[0.8em] bg-[#e0f6fc] text-[#0b89a6]">
      <TrackIcon iconKey={info?.iconKey} className="size-[1.3em]" />
    </span>
  );
  const status = (
    <span className={`rounded-full px-[0.7em] py-[0.1em] text-[0.7em] font-bold ${live ? "bg-[#7fe9d3] text-[#0b4f4a]" : "bg-[#eef2f7] text-[#5b6b7c]"}`}>
      {live ? t("Active") : t("No students")}
    </span>
  );
  const sub = [track.code, info ? (info.hasLessons ? t("Lessons & videos") : t("Videos only")) : null].filter(Boolean).join(" • ");
  const videos = info ? t("{n} Videos", { n: info.videoCount }) : "—";

  if (compact) {
    return (
      <article onClick={onSelect} className={`${PANEL} ${ring} flex cursor-pointer flex-col p-[1.3em]`}>
        <div className="flex items-start justify-between">
          {icon}
          {status}
        </div>
        <h3 className="mt-[0.8em] font-bold text-[#0b1b2b]">{t(track.name)}</h3>
        <p dir="auto" className="text-[0.75em] text-[#8a97a6]">{sub}</p>
        <p className="mt-[0.7em] flex-1 text-[0.8em] text-[#5b6b7c]">{info?.shortDescription ?? "—"}</p>
        <p className="mt-[1em] flex flex-wrap justify-between gap-[0.4em] text-[0.7em] font-semibold text-[#14365a]">
          <span>{t("{n} Students ({pct}%)", { n: track.students, pct })}</span>
          <span>
            {t("{n} Squads", { n: track.squads })} • {videos}
          </span>
        </p>
        <Link href={href} onClick={(e) => e.stopPropagation()} className={`${BTN_SECONDARY} mt-[0.8em] w-full !border-0 !bg-[#eef3fa] !text-[#0b6f86]`}>
          {t("Configure Track")}
        </Link>
      </article>
    );
  }

  const facts = [
    { label: t("Students"), value: `${track.students} (${pct}%)` },
    { label: t("Squads"), value: t("{n} Squads", { n: track.squads }) },
    { label: t("Curriculum"), value: videos },
    { label: t("Squad Mentors"), value: mentorCount === null ? "—" : t("{n} Mentors", { n: mentorCount }) },
  ];

  return (
    <article onClick={onSelect} className={`${PANEL} ${ring} cursor-pointer p-[1.4em]`}>
      <div className="flex items-start gap-[0.9em]">
        {icon}
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-[0.5em] text-[1.15em] font-bold text-[#0b1b2b]">
            {t(track.name)} {status}
          </h3>
          <p dir="auto" className="text-[0.75em] text-[#5b6b7c]">{sub}</p>
        </div>
        {selected && <span className="shrink-0 rounded-full bg-[#dff3fb] px-[0.8em] py-[0.2em] text-[0.7em] font-semibold text-[#0b6f86]">{t("Current Selection")}</span>}
      </div>

      <p className="mt-[1em] text-[0.85em] text-[#14365a]">{info?.shortDescription ?? "—"}</p>

      <dl className="mt-[1em] grid grid-cols-2 gap-[0.8em] rounded-[0.9em] bg-[#f1f5fd] p-[1em] sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}>
            <dt className="text-[0.7em] text-[#5b6b7c]">{f.label}</dt>
            <dd className="font-bold text-[#0b1b2b]">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-[1em] grid items-end gap-[0.8em] sm:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div>
          <p className="mb-[0.3em] flex justify-between text-[0.72em] text-[#14365a]">
            <span>{t("Track Progress")}</span>
            <b className="text-[#0b6f86]">{progress}%</b>
          </p>
          <Bar pct={progress} />
        </div>
        <div className="flex items-center gap-[0.5em] sm:justify-end">
          <span className="grid size-[2.2em] shrink-0 place-items-center rounded-full bg-[#e6f1fb] text-[0.75em] font-bold text-[#0b6f86]">
            {lead ? initials(lead.fullName) : "—"}
          </span>
          <span className="min-w-0 text-[0.72em] leading-tight text-[#5b6b7c]">
            {t("Lead Mentor")}
            <b className="block truncate text-[#0b1b2b]">{lead?.fullName ?? "—"}</b>
          </span>
        </div>
      </div>

      <div className="mt-[1.1em] flex flex-wrap items-center justify-between gap-[0.6em]">
        <div className="flex flex-wrap gap-[0.4em]">
          {(item.mentors ?? [])
            .filter((m) => m.isActive)
            .flatMap((m) => m.squadNames)
            .slice(0, 3)
            .map((x) => (
              <span key={x} className="rounded-[0.4em] bg-[#e6f1fb] px-[0.7em] py-[0.25em] text-[0.7em] font-semibold text-[#0b6f86]">
                {x}
              </span>
            ))}
        </div>
        <div className="flex gap-[0.5em]">
          <Link href={"/admin/reports" as Route} onClick={(e) => e.stopPropagation()} className={`${BTN_SECONDARY} !py-[0.5em]`}>
            <BarChart3 className="size-[1em]" /> {t("Analytics")}
          </Link>
          <Link href={href} onClick={(e) => e.stopPropagation()} className={`${BTN_PRIMARY} !py-[0.5em]`}>
            <SlidersHorizontal className="size-[1em]" /> {t("Manage Curriculum")}
          </Link>
        </div>
      </div>
    </article>
  );
}
