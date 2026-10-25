"use client";

import Link from "next/link";
import type { Route } from "next";
import { BarChart3, Code2, Gamepad2, Palette, Server, SlidersHorizontal, Smartphone } from "lucide-react";
import type { AdminTrack } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { PANEL, BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";
import { Bar } from "../mentor-detail/parts";
import type { MOCK_TRACK_EXTRAS } from "../dashboardMock";

const ICONS = [Palette, Code2, Server, Smartphone, Gamepad2];
type Extra = (typeof MOCK_TRACK_EXTRAS)[number];

export function TrackCard({
  track,
  extra,
  index,
  total,
  selected,
  compact = false,
  onSelect,
}: {
  track: AdminTrack;
  extra: Extra;
  index: number;
  total: number;
  selected: boolean;
  compact?: boolean;
  onSelect: () => void;
}) {
  const t = useT();
  const Icon = ICONS[index % ICONS.length];
  const pct = total > 0 ? Math.round((track.students / total) * 100) : 0;
  const href = `/admin/tracks/${track.id}` as Route;
  const ring = selected ? "ring-2 ring-[#06b6d4]/60" : "";

  const icon = (
    <span className="grid size-[3em] shrink-0 place-items-center rounded-[0.8em] bg-[#e0f6fc] text-[#0b89a6]">
      <Icon className="size-[1.3em]" />
    </span>
  );
  const active = <span className="rounded-full bg-[#7fe9d3] px-[0.7em] py-[0.1em] text-[0.7em] font-bold text-[#0b4f4a]">{t("Active")}</span>;

  if (compact) {
    return (
      <article onClick={onSelect} className={`${PANEL} ${ring} cursor-pointer p-[1.3em]`}>
        <div className="flex items-start justify-between">{icon}{active}</div>
        <h3 className="mt-[0.8em] font-bold text-[#0b1b2b]">{track.name}</h3>
        <p className="text-[0.75em] text-[#8a97a6]">{t(extra.audience)}</p>
        <p className="mt-[0.7em] text-[0.8em] text-[#5b6b7c]">{t(extra.desc)}</p>
        <p className="mt-[1em] flex justify-between text-[0.7em] font-semibold text-[#14365a]">
          <span>{track.students} {t("Students")} ({pct}%)</span>
          <span>{extra.courses} {t("Courses")} • {extra.levels} {t("Levels")}</span>
        </p>
        <Link href={href} className={`${BTN_SECONDARY} mt-[0.8em] w-full !bg-[#eef3fa]`}>{t("Configure Track")}</Link>
      </article>
    );
  }

  const facts = [
    { label: t("Students"), value: `${track.students} (${pct}%)` },
    { label: t("Curriculum"), value: `${extra.courses} ${t("Courses")}` },
    { label: t("Levels"), value: `${extra.levels} ${t("Phases")}` },
    { label: t("Squad Mentors"), value: `${extra.mentors} ${t("Leads")}` },
  ];

  return (
    <article onClick={onSelect} className={`${PANEL} ${ring} cursor-pointer p-[1.4em]`}>
      <div className="flex items-start gap-[0.9em]">
        {icon}
        <div className="min-w-0 flex-1">
          <h3 className="flex flex-wrap items-center gap-[0.5em] text-[1.1em] font-bold text-[#0b1b2b]">{track.name} {active}</h3>
          <p className="text-[0.75em] text-[#8a97a6]">{t("Target Group")}: {t(extra.audience)}</p>
        </div>
        {selected && <span className="rounded-full bg-[#dff3fb] px-[0.8em] py-[0.2em] text-[0.7em] font-semibold text-[#0b6f86]">{t("Current Selection")}</span>}
      </div>

      <p className="mt-[1em] text-[0.85em] text-[#5b6b7c]">{t(extra.desc)}</p>

      <dl className="mt-[1em] grid grid-cols-2 gap-[0.8em] rounded-[0.9em] bg-[#f1f5fd] p-[1em] sm:grid-cols-4">
        {facts.map((f) => (
          <div key={f.label}><dt className="text-[0.7em] text-[#8a97a6]">{f.label}</dt><dd className="font-bold text-[#14365a]">{f.value}</dd></div>
        ))}
      </dl>

      <div className="mt-[1em] grid items-end gap-[0.8em] sm:grid-cols-[minmax(0,1fr)_auto]">
        <div>
          <p className="mb-[0.3em] flex justify-between text-[0.75em]"><span>{t("Track Progress")}</span><b>{track.progress}%</b></p>
          <Bar pct={track.progress} />
        </div>
        <p className="text-[0.75em] text-[#5b6b7c]">{t("Lead Mentor")}: <b className="text-[#14365a]">{extra.lead}</b></p>
      </div>

      <div className="mt-[1em] flex flex-wrap items-center justify-between gap-[0.6em]">
        <div className="flex flex-wrap gap-[0.4em]">
          {extra.tags.map((x) => <span key={x} className="rounded-[0.4em] bg-[#dbe8fb] px-[0.7em] py-[0.25em] text-[0.7em] font-semibold text-[#14365a]">{x}</span>)}
        </div>
        <div className="flex gap-[0.5em]">
          <button type="button" className={`${BTN_SECONDARY} !py-[0.5em]`}><BarChart3 className="size-[1em]" /> {t("Analytics")}</button>
          <Link href={href} className={`${BTN_PRIMARY} !py-[0.5em]`}><SlidersHorizontal className="size-[1em]" /> {t("Manage Curriculum")}</Link>
        </div>
      </div>
    </article>
  );
}