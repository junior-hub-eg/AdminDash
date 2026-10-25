"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRight, LoaderCircle, Pencil } from "lucide-react";
import { setSquadMonitor, type AdminMentor, type AdminSquad, type AdminSquadStatus } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { MentorPicture } from "./MentorsTable";
import { BTN_SECONDARY } from "./page-parts";

const STATUS_STYLE: Record<AdminSquadStatus, string> = {
  Active: "bg-[#c9f1dd] text-[#1a7f55]",
  Waiting: "bg-[#ffb21f] text-white",
  InReview: "bg-[#7c5cff] text-white",
  Completed: "bg-[#2f9cf4] text-white",
};

export const STATUS_LABEL: Record<AdminSquadStatus, string> = {
  Active: tk("Active"),
  Waiting: tk("Waiting for members"),
  InReview: tk("In review"),
  Completed: tk("Completed"),
};

/** The banner has no photo yet, so each card gets one of these gradients by its position. */
const BANNERS = [
  "from-[#0e4a5a] via-[#127a8a] to-[#1fb5c4]",
  "from-[#10264d] via-[#1f4f8f] to-[#3b82d6]",
  "from-[#17304a] via-[#1c5c63] to-[#2bb3a0]",
  "from-[#241a4d] via-[#4a3aa8] to-[#7c6cf0]",
];

/**
 * A squad with its monitor; the admin can pick another monitor (active mentors only).
 * `index` is the squad's position (for the "Squad 01" label and the banner colour).
 * `href` shows the "Open Workspace" button; leave it out until the squad page exists.
 */
export function SquadCard({
  squad,
  mentors,
  onChanged,
  index = 0,
  href,
}: {
  squad: AdminSquad;
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

  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.08)]">
      {/* Banner */}
      <header className={`relative flex h-[7.2em] flex-col justify-end bg-gradient-to-br p-[1em] ${BANNERS[index % BANNERS.length]}`}>
        <span className="absolute start-[1em] top-[0.9em] inline-flex items-center gap-[0.4em] rounded-full bg-white/20 px-[0.8em] py-[0.15em] text-[0.68em] font-semibold text-white backdrop-blur">
          <span className="size-[0.5em] rounded-full bg-[#7ff0d5]" />
          {t(squad.level)}
        </span>

        <span className={`absolute end-[1em] top-[0.9em] rounded-full px-[0.9em] py-[0.15em] text-[0.68em] font-semibold ${STATUS_STYLE[squad.status]}`}>
          {t(STATUS_LABEL[squad.status])}
        </span>

        <p className="text-[0.62em] font-bold uppercase tracking-[0.1em] text-white/75">
          {t("Squad {n}", { n: String(index + 1).padStart(2, "0") })}
        </p>
        <h3 className="truncate text-[1.3em] font-bold text-white" title={squad.name}>
          {squad.name}
        </h3>
      </header>

      <div className="flex flex-1 flex-col gap-[0.9em] p-[1em]">
        {/* Active project */}
        <div className="rounded-[0.8em] bg-[#f3f7fc] p-[0.8em]">
          <p className="text-[0.6em] font-bold uppercase tracking-[0.1em] text-[#0b89a6]">{t("Active project")}</p>
          <p className="mt-[0.2em] truncate text-[0.95em] font-semibold text-[#0b1b2b]" title={squad.projectTitle}>
            {squad.projectTitle}
          </p>
        </div>

        {/* Members and monitor */}
        <div className="flex items-center justify-between gap-[0.8em]">
          <div className="min-w-0">
            <p className="text-[0.6em] font-bold uppercase tracking-[0.1em] text-[#8a97a6]">{t("Members")}</p>
            <p className="text-[0.95em] font-semibold text-[#0b1b2b]">
              {t("{students}/{capacity} Students", { students: squad.students, capacity: squad.capacity })}
            </p>
          </div>

          {!editing && (
            <div className="flex min-w-0 items-center gap-[0.5em] rounded-[0.8em] border border-[#e6edf3] px-[0.6em] py-[0.4em]">
              {squad.monitor ? (
                <MentorPicture mentor={squad.monitor} size="1.8em" />
              ) : (
                <span className="size-[1.8em] shrink-0 rounded-full bg-[#e6edf3]" />
              )}

              <span className="min-w-0 leading-tight">
                <span className="block text-[0.6em] font-bold uppercase tracking-[0.08em] text-[#8a97a6]">{t("Monitor")}</span>
                <span className="block max-w-[9em] truncate text-[0.8em] font-semibold text-[#14365a]">
                  {squad.monitor?.fullName ?? <span className="text-[#c0392b]">{t("None yet")}</span>}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label={t("Change monitor")}
                title={t("Change monitor")}
                className="grid size-[1.8em] shrink-0 place-items-center rounded-full text-[#5b6b7c] hover:bg-[#eef4fa]"
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
          <div className="flex items-center justify-between text-[0.75em]">
            <span className="font-semibold text-[#14365a]">{t("Sprint progress")}</span>
            <span dir="ltr" className="font-bold text-[#0b1b2b]">
              {squad.progress}%
            </span>
          </div>

          <div
            role="progressbar"
            aria-valuenow={squad.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t("Sprint progress")}
            className="mt-[0.4em] h-[0.5em] overflow-hidden rounded-full bg-[#e6edf3]"
          >
            <div className="h-full rounded-full bg-gradient-to-r from-[#06b6d4] to-[#2dd4bf]" style={{ width: `${squad.progress}%` }} />
          </div>
        </div>

        {href && (
          <Link href={href as Route} className={`${BTN_SECONDARY} mt-auto w-full bg-[#eaf3fb]`}>
            {t("Open Workspace")} <ArrowRight className="size-[1em] rtl:rotate-180" />
          </Link>
        )}
      </div>
    </article>
  );
}