"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Download, LoaderCircle, UserPlus } from "lucide-react";
import { setSquadMonitor, type AdminMentor, type AdminMentorStudent, type AdminSquad } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, INPUT } from "../page-parts";
import { Section } from "./parts";

const ROW = "flex w-full items-center gap-[0.7em] rounded-[0.7em] bg-[#f1f5fd] px-[0.9em] py-[0.8em] text-start text-[0.8em] font-semibold text-[#14365a]";

/** Downloads the mentor and their students as a CSV file that opens in Excel. */
function exportReport(m: AdminMentor, students: AdminMentorStudent[]) {
  const esc = (v: string | number | null) => {
    const s = String(v ?? "");
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const lines = [
    ["Mentor", "Email", "Track", "Rating", "Squads"],
    [m.fullName, m.email ?? "", m.trackName, m.rating, m.squadNames.join(" / ")],
    [],
    ["Student", "Email", "Grade", "Class", "Total XP", "Streak days", "Last active", "Assigned"],
    ...students.map((s) => [s.fullName, s.email, s.grade ?? "", s.className ?? "", s.totalXp, s.streakDays, s.lastActiveDate ?? "", s.assignedUtc.slice(0, 10)]),
  ];
  const csv = "﻿" + lines.map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `mentor-${m.fullName.replace(/\s+/g, "-").toLowerCase()}-report.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Assign one more squad to this mentor (PUT /admin/squads/{id}/monitor) and export the coaching report. */
export function AdminDirectControls({
  mentor,
  squads,
  students,
  picking,
  onPicking,
  onAssigned,
}: {
  mentor: AdminMentor;
  squads: AdminSquad[] | null;
  students: AdminMentorStudent[] | null;
  picking: boolean;
  onPicking: (v: boolean) => void;
  onAssigned: () => void;
}) {
  const t = useT();
  const [squadId, setSquadId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const others = (squads ?? []).filter((s) => s.monitor?.id !== mentor.id && s.status !== "Completed");

  async function assign() {
    setSaving(true);
    setError(null);
    try {
      const s = await setSquadMonitor(squadId, mentor.id);
      setDone(s.name);
      setSquadId("");
      onAssigned();
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't assign the squad. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Section title={t("Admin Direct Controls")} id="admin-direct-controls">
      <div className="grid gap-[0.6em]">
        <div className="rounded-[0.7em] bg-[#f1f5fd]">
          <button type="button" aria-expanded={picking} onClick={() => onPicking(!picking)} className={ROW}>
            <UserPlus className="size-[1.1em]" />
            <span className="flex-1">{t("Assign Additional Squad")}</span>
            {picking ? <ChevronDown className="size-[1em]" /> : <ChevronRight className="size-[1em] rtl:rotate-180" />}
          </button>
          {picking && (
            <div className="grid gap-[0.5em] px-[0.9em] pb-[0.9em] text-[0.8em]">
              {!squads ? (
                <p className="text-[#5b6b7c]">{t("Loading")}…</p>
              ) : others.length === 0 ? (
                <p className="text-[#5b6b7c]">{t("No other squad to assign.")}</p>
              ) : (
                <>
                  <select value={squadId} onChange={(e) => setSquadId(e.target.value)} aria-label={t("Squad")} className={`${INPUT} w-full !text-[1em]`}>
                    <option value="">{t("Choose a squad")}</option>
                    {others.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} — {s.monitor ? t("monitor: {name}", { name: s.monitor.fullName }) : t("no monitor")}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={assign} disabled={!squadId || saving} className={`${BTN_PRIMARY} !text-[1em]`}>
                    {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Assign")}
                  </button>
                </>
              )}
              {error && <p role="alert" className="text-[#b83232]">{error}</p>}
              {done && !error && <p role="status" className="text-[#17935f]">{t("{name} is now monitored by this mentor.", { name: done })}</p>}
            </div>
          )}
        </div>
        <button type="button" disabled={!students} onClick={() => students && exportReport(mentor, students)} className={`${ROW} disabled:opacity-50`}>
          <Download className="size-[1.1em]" />
          <span className="flex-1">{t("Export Coaching Report (CSV)")}</span>
          <ChevronRight className="size-[1em] rtl:rotate-180" />
        </button>
      </div>
    </Section>
  );
}
