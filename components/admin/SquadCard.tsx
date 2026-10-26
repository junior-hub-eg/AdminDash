"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock,
  Code2,
  LayoutTemplate,
  LoaderCircle,
  Palette,
  Pencil,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import { setSquadMonitor, type AdminMentor, type AdminSquad, type AdminSquadFull, type AdminSquadStatus } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { Avatar } from "./squad-detail/parts";

const STATUS_STYLE: Record<AdminSquadStatus, string> = {
  Active: "bg-[#5ef0d0] text-[#06463c]",
  Waiting: "bg-[#ffd27a] text-[#5b3a00]",
  InReview: "bg-white text-[#14365a]",
  Completed: "bg-[#bfe0ff] text-[#0d3b66]",
};

export const STATUS_LABEL: Record<AdminSquadStatus, string> = {
  Active: tk("Active"),
  Waiting: tk("Waiting for members"),
  InReview: tk("In review"),
  Completed: tk("Completed"),
};

/** The banner has no photo in the API, so each card gets one of these dark gradients by its position. */
const BANNERS = [
  "from-[#0b2233] via-[#123f55] to-[#1b6f86]",
  "from-[#08162b] via-[#13305a] to-[#1d5a8f]",
  "from-[#071a24] via-[#0f3a46] to-[#13706e]",
  "from-[#0c1630] via-[#1d2f6b] to-[#2f63a8]",
];

const BANNER_ICONS: LucideIcon[] = [Palette, Code2, Server, Smartphone];

/** The sprint whose tasks the squad works on: the active one, else the latest. */
export function currentSprint(full: AdminSquadFull | null | undefined) {
  if (!full) return null;
  return full.sprints.find((p) => p.status === "Active") ?? full.sprints[full.sprints.length - 1] ?? null;
}

/**
 * A squad with its monitor; the admin can pick another monitor (active mentors only).
 * `full` is the squad's workspace (description, members, sprint, tasks); null while it loads.
 * `index` is the squad's position (for the "Squad 01" label and the banner colour).
 */
export function SquadCard({
  squad,
  full,
  trackName,
  mentors,
  onChanged,
  index = 0,
  href,
}: {
  squad: AdminSquad;
  full?: AdminSquadFull | null;
  trackName?: string | null;
  mentors: AdminMentor[] | null;
  onChanged: (squad: AdminSquad) => void;
  index?: number;
  href?: string;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [choice, setChoice] = useState(squad.monitor?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      onChanged(await setSquadMonitor(squad.id, choice));
      setEditing(false);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't change the monitor. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  const sprint = currentSprint(full);
  const members = full?.members ?? [];
  const done = sprint?.tasksDone ?? 0;
  const total = sprint?.tasksTotal ?? 0;
  const pct = sprint ? Math.round(sprint.progress) : squad.progress;
  const inReview = full?.tasks?.filter((x) => x.status === "Review").length ?? 0;
  const BannerIcon = BANNER_ICONS[index % BANNER_ICONS.length];
  const sprintPill = sprint
    ? t("{sprint} ({status})", { sprint: sprint.name, status: t(sprint.status === "Active" ? STATUS_LABEL[squad.status] : sprint.status) })
    : t(STATUS_LABEL[squad.status]);

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.08)]">
      {/* Banner */}
      <header className={`relative flex h-[8em] flex-col justify-end overflow-hidden bg-gradient-to-br p-[1em] ${BANNERS[index % BANNERS.length]}`}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-25 [background-image:linear-gradient(rgba(125,211,252,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(125,211,252,0.35)_1px,transparent_1px)] [background-size:1.6em_1.6em]"
        />
        <span aria-hidden className="pointer-events-none absolute -end-[2em] -top-[3em] size-[10em] rounded-full bg-[#22d3ee]/25 blur-[2em]" />
        <span aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-[#06121d]/85 to-transparent" />

        <span className="absolute start-[1em] top-[0.9em] inline-flex max-w-[60%] items-center gap-[0.4em] rounded-full bg-white px-[0.8em] py-[0.25em] text-[0.68em] font-semibold text-[#0b4f63] shadow-sm">
          <span className="size-[0.55em] shrink-0 rounded-full bg-[#06b6d4]" />
          <span className="truncate">{trackName ? t(trackName) : t(squad.level)}</span>
        </span>

        <span
          className={`absolute end-[1em] top-[0.9em] max-w-[45%] truncate rounded-full px-[0.9em] py-[0.25em] text-[0.68em] font-bold ${STATUS_STYLE[squad.status]}`}
        >
          {sprintPill}
        </span>

        <div className="relative flex items-end justify-between gap-[0.6em]">
          <div className="min-w-0">
            <p className="text-[0.66em] font-bold uppercase tracking-[0.14em] text-white/80">
              {t("Squad {n}", { n: String(index + 1).padStart(2, "0") })}
            </p>
            <h3 className="truncate text-[1.35em] font-bold text-white" title={squad.name}>
              {squad.name}
            </h3>
          </div>
          <BannerIcon aria-hidden className="mb-[0.2em] size-[1.4em] shrink-0 text-[#5eead4]" />
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-[1em] p-[1.2em]">
        {/* Active project */}
        <div className="rounded-[0.8em] bg-[#eef3fb] px-[1em] py-[0.8em]">
          <p className="flex items-center gap-[0.4em] text-[0.62em] font-semibold uppercase tracking-[0.1em] text-[#3d4f61]">
            <LayoutTemplate className="size-[1.3em] text-[#0b89a6]" />
            {t("Active project")}
          </p>
          <p className="mt-[0.25em] truncate text-[1em] font-bold text-[#0b1b2b]" title={squad.projectTitle}>
            {squad.projectTitle}
          </p>
          <p className="mt-[0.1em] truncate text-[0.74em] text-[#5b6b7c]" title={full?.projectDescription}>
            {full === undefined || full === null ? " " : full.projectDescription || "—"}
          </p>
        </div>

        {/* Members and monitor */}
        <div className="flex items-center justify-between gap-[0.8em]">
          <div className="min-w-0">
            <p className="text-[0.64em] font-semibold uppercase tracking-[0.1em] text-[#3d4f61]">
              {t("{count} Members", { count: full ? members.length : squad.students })}
            </p>
            <div className="mt-[0.35em] flex -space-x-[0.55em] rtl:space-x-reverse">
              {members.slice(0, 4).map((m) => (
                <Avatar key={m.studentId} name={m.fullName} photoUrl={m.photoUrl} className="size-[2.2em]" />
              ))}
              {members.length > 4 && (
                <span className="z-10 grid size-[2.2em] place-items-center rounded-full bg-[#0b1b2b] text-[0.7em] font-bold text-white ring-2 ring-white">
                  +{members.length - 4}
                </span>
              )}
              {full && members.length === 0 && <span className="text-[0.75em] text-[#8a97a6]">{t("No members yet.")}</span>}
            </div>
          </div>

          {!editing && (
            <div className="flex min-w-0 items-center gap-[0.5em] rounded-[0.8em] bg-[#eef3fb] px-[0.7em] py-[0.45em]">
              <span className="grid size-[2em] shrink-0 place-items-center rounded-full bg-[#0f5f6b] text-white">
                <BadgeCheck className="size-[1.1em]" />
              </span>

              <span className="min-w-0 leading-tight">
                <span className="block text-[0.64em] font-semibold text-[#5b6b7c]">{t("Mentor")}</span>
                <span className="block max-w-[8em] truncate text-[0.8em] font-bold text-[#0b1b2b]" title={squad.monitor?.fullName}>
                  {squad.monitor?.fullName ?? <span className="text-[#c0392b]">{t("None yet")}</span>}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={t("Change monitor")}
                title={t("Change monitor")}
                className="grid size-[1.8em] shrink-0 place-items-center rounded-full text-[#5b6b7c] hover:bg-white"
              >
                <Pencil className="size-[0.8em]" />
              </button>
            </div>
          )}
        </div>

        {editing && (
          <div className="flex flex-wrap items-center gap-[0.5em] text-[0.8em]">
            <select
              value={choice}
              onChange={(e) => setChoice(e.target.value)}
              disabled={!mentors || saving}
              aria-label={t("Monitor")}
              className="min-w-0 flex-1 rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.6em] py-[0.35em]"
            >
              <option value="" disabled>
                {t("Choose a mentor")}
              </option>
              {mentors?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName} · {m.trackName}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={save}
              disabled={saving || !choice || choice === squad.monitor?.id}
              className="inline-flex items-center gap-[0.3em] rounded-[0.5em] bg-[#06b6d4] px-[0.9em] py-[0.35em] font-semibold text-white disabled:opacity-50"
            >
              {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save")}
            </button>
            <button type="button" onClick={() => setEditing(false)} className="px-[0.4em] py-[0.35em] text-[#5b6b7c] hover:underline">
              {t("Cancel")}
            </button>
          </div>
        )}
        {error && (
          <p role="alert" className="text-[0.75em] text-[#b83232]">
            {error}
          </p>
        )}

        {/* Progress */}
        <div>
          <div className="flex items-center justify-between gap-[0.5em] text-[0.78em]">
            <span className="font-semibold text-[#0b1b2b]">
              {sprint ? t("{sprint} Completion", { sprint: sprint.name }) : t("Sprint progress")}
            </span>
            <span dir="ltr" className="shrink-0 text-[#5b6b7c]">
              <b className="text-[#0b6f86]">{pct}%</b>
              {sprint && ` (${t("{done}/{total} Tasks", { done, total })})`}
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("Sprint progress")}
            className="mt-[0.5em] h-[0.55em] overflow-hidden rounded-full bg-[#e6edf3]"
          >
            <div
              className={`h-full rounded-full ${pct >= 90 ? "bg-[#14b8a6]" : pct < 40 ? "bg-[#0f5f6b]" : "bg-[#06b6d4]"}`}
              style={{ width: `${Math.max(0, Math.min(100, pct))}%` }}
            />
          </div>
        </div>

        <div className="mt-auto flex flex-wrap items-center justify-between gap-[0.6em] pt-[0.4em]">
          <p className="flex flex-wrap items-center gap-x-[0.9em] gap-y-[0.3em] text-[0.76em] text-[#3d4f61]">
            <span className="inline-flex items-center gap-[0.3em]">
              <CheckCircle2 className="size-[1.1em] text-[#0b89a6]" />
              {sprint ? t("{count} done", { count: done }) : "—"}
            </span>
            {inReview > 0 ? (
              <span className="inline-flex items-center gap-[0.3em]">
                <AlertCircle className="size-[1.1em] text-[#d04a4a]" />
                {t("{count} in review", { count: inReview })}
              </span>
            ) : (
              <span className="inline-flex items-center gap-[0.3em]">
                <Clock className="size-[1.1em] text-[#5b6b7c]" />
                {sprint ? t("{count} left", { count: Math.max(0, total - done) }) : "—"}
              </span>
            )}
          </p>

          {href && (
            <Link
              href={href as Route}
              className="inline-flex items-center gap-[0.4em] rounded-[0.7em] bg-[#e3f0fb] px-[1.1em] py-[0.6em] text-[0.8em] font-semibold text-[#0d3b66] hover:bg-[#d4e8f8]"
            >
              {t("Open Workspace")} <ArrowRight className="size-[1em]" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
