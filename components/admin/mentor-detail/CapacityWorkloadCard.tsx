"use client";

import { useState } from "react";
import { Check, Gauge, LoaderCircle, Pencil, X } from "lucide-react";
import type { AdminMentor } from "@/lib/admin-api";
import { setMentorCapacity, type AdminMentorProfile } from "@/lib/admin-mentor-sessions-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { Bar, Section, SOFT } from "./parts";

/**
 * Students against the capacity the admin sets (editable here), squads, and the weekly hours the mentor offers.
 * The zone uses the same squad rule as the Mentors page (0 / 1-2 / more than 2), or the student load when it is over 90%.
 */
export function CapacityWorkloadCard({
  mentor: m,
  students,
  squads,
  profile,
  onCapacitySaved,
}: {
  mentor: AdminMentor;
  students: number;
  squads: number;
  profile?: AdminMentorProfile | null;
  onCapacitySaved?: (maxStudents: number) => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const max = profile?.maxStudents ?? null;
  const load = max ? Math.round((students / max) * 100) : null;
  const zone = !m.isActive
    ? { label: t("On Leave"), cls: "bg-[#eef2f7] text-[#5b6b7c]" }
    : squads > 2 || (load ?? 0) > 90
      ? { label: t("High Load"), cls: "bg-[#fde4e4] text-[#d04a4a]" }
      : squads === 0
        ? { label: t("Available Capacity"), cls: "bg-[#dff3fb] text-[#0b6f86]" }
        : { label: t("Optimal Zone"), cls: "bg-[#d7efe6] text-[#12676b]" };
  const rows = [
    { label: t("Assigned Students"), value: max ? `${students} / ${max}` : String(students) },
    { label: t("Assigned Squads"), value: profile ? `${squads} / ${profile.maxSquads}` : String(squads) },
    { label: t("Weekly Mentorship Hours"), value: profile ? t("{n} hrs", { n: profile.weeklyAvailableHours }) : "—" },
    { label: t("Upcoming Sessions"), value: profile ? String(profile.sessionsUpcoming) : "—" },
  ];

  function startEdit() {
    setValue(String(max ?? ""));
    setError(null);
    setEditing(true);
  }

  async function save() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      setError(t("Enter a whole number from 1 to 500."));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const saved = await setMentorCapacity(m.id, n);
      onCapacitySaved?.(saved.maxStudents);
      setEditing(false);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section
      title={t("Capacity & Workload")}
      icon={<Gauge className="size-[1.1em]" />}
      action={<span className={`rounded-full px-[0.8em] py-[0.2em] text-[0.7em] font-semibold ${zone.cls}`}>● {zone.label}</span>}
    >
      <div className={`${SOFT} flex items-center justify-between gap-[1em]`}>
        <div className="min-w-0">
          <p className="text-[0.65em] font-bold uppercase tracking-[0.06em] text-[#5b6b7c]">{t("Total Mentorship Load")}</p>
          <p className="text-[2em] font-extrabold text-[#0b1b2b]">{load === null ? "—" : `${load}%`}</p>
          {editing ? (
            <form
              className="mt-[0.3em] flex flex-wrap items-center gap-[0.4em] text-[0.75em]"
              onSubmit={(e) => {
                e.preventDefault();
                void save();
              }}
            >
              <label className="text-[#5b6b7c]" htmlFor="mentor-capacity">
                {t("Max students")}
              </label>
              <input
                id="mentor-capacity"
                type="number"
                min={1}
                max={500}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-[5em] rounded-[0.5em] border border-[#d5dfea] bg-white px-[0.5em] py-[0.25em] text-[#0b1b2b]"
              />
              <button type="submit" disabled={saving} aria-label={t("Save")} className="grid size-[1.9em] place-items-center rounded-[0.5em] bg-[#0b6f86] text-white disabled:opacity-50">
                {saving ? <LoaderCircle className="size-[1em] animate-spin" /> : <Check className="size-[1em]" />}
              </button>
              <button type="button" onClick={() => setEditing(false)} aria-label={t("Cancel")} className="grid size-[1.9em] place-items-center rounded-[0.5em] bg-white text-[#14365a]">
                <X className="size-[1em]" />
              </button>
            </form>
          ) : (
            <p className="flex items-center gap-[0.4em] text-[0.72em] text-[#5b6b7c]">
              {max ? t("Capacity: {n} students", { n: max }) : t("Capacity limits aren't set yet")}
              {profile && (
                <button type="button" onClick={startEdit} className="inline-flex items-center gap-[0.25em] font-semibold text-[#0b6f86] hover:underline">
                  <Pencil className="size-[0.9em]" /> {t("Edit")}
                </button>
              )}
            </p>
          )}
          {error && (
            <p role="alert" className="mt-[0.3em] text-[0.72em] text-[#b83232]">
              {error}
            </p>
          )}
        </div>
        <div className="grid size-[5em] shrink-0 place-items-center rounded-full border-[0.45em] border-[#06b6d4] text-center">
          <span className="text-[0.85em] font-bold leading-tight text-[#0b1b2b]">
            {students}
            <span className="block text-[0.7em] font-medium text-[#5b6b7c]">{t("Students")}</span>
          </span>
        </div>
      </div>
      {load !== null && (
        <div className="mt-[0.8em]">
          <Bar pct={load} color={load > 90 ? "#d04a4a" : "#06b6d4"} />
        </div>
      )}
      <ul className="mt-[1em] grid gap-[0.7em] text-[0.75em] text-[#14365a]">
        {rows.map((x) => (
          <li key={x.label} className="flex justify-between border-b border-[#eef2f6] pb-[0.5em] last:border-0">
            <span>{x.label}</span>
            <b>{x.value}</b>
          </li>
        ))}
      </ul>
    </Section>
  );
}
