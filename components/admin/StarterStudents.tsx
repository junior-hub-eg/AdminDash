"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, UserCheck } from "lucide-react";
import { assignStudentToMentor, getStudentsWithoutMentor, type UnassignedStudent } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { Avatar } from "./squad-detail/parts";

/** How many waiting students the screen offers a new mentor. */
const OFFER = 2;

/**
 * Shown right after a mentor joins (added by the admin or approved): when students of the
 * mentor's track have no mentor yet, the two who waited longest are offered, ticked, and
 * the admin assigns them to the new mentor in one click. `onDone` runs after assigning or skipping.
 */
export function StarterStudents({
  mentorId,
  mentorName,
  trackCode,
  onDone,
}: {
  mentorId: string;
  mentorName: string;
  trackCode: string;
  onDone: () => void;
}) {
  const t = useT();
  const [students, setStudents] = useState<UnassignedStudent[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);

  useEffect(() => {
    let active = true;
    getStudentsWithoutMentor().then(
      (all) => {
        if (!active) return;
        const offer = all.filter((s) => s.trackCode === trackCode).slice(0, OFFER);
        setStudents(offer);
        setPicked(new Set(offer.map((s) => s.studentId)));
      },
      () => active && setStudents([]),
    );
    return () => {
      active = false;
    };
  }, [trackCode]);

  // Nobody waits in this track: nothing to offer.
  useEffect(() => {
    if (students?.length === 0) onDone();
  }, [students, onDone]);

  async function assign() {
    setSaving(true);
    setError(null);
    try {
      for (const id of picked) await assignStudentToMentor(mentorId, id);
      setAssigned(true);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't assign the student. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  if (!students || students.length === 0) {
    return (
      <div role="status" className="grid place-items-center py-[2em]">
        <LoaderCircle className="size-[2em] animate-spin text-[#0f7378]" />
      </div>
    );
  }

  if (assigned) {
    return (
      <div className="grid justify-items-center gap-[0.8em] py-[1em] text-center">
        <CheckCircle2 className="size-[2.6em] text-[#17935f]" />
        <p className="text-[1em] font-bold text-[#0b1b2b]">{t("{name} now mentors {count} students.", { name: mentorName, count: picked.size })}</p>
        <button type="button" onClick={onDone} className="rounded-[0.6em] bg-[#06b6d4] px-[1.2em] py-[0.55em] text-[0.85em] font-semibold text-white">
          {t("Done")}
        </button>
      </div>
    );
  }

  return (
    <div className="grid gap-[1em]">
      <div>
        <p className="text-[1.05em] font-bold text-[#0b1b2b]">{t("These students are waiting for a mentor")}</p>
        <p className="text-[0.8em] text-[#5b6b7c]">
          {t("They learn the same track as {name} and have no mentor yet. Assign them to {name}?", { name: mentorName })}
        </p>
      </div>

      <ul className="grid gap-[0.6em]">
        {students.map((s) => {
          const on = picked.has(s.studentId);
          return (
            <li key={s.studentId}>
              <label
                className={`flex cursor-pointer items-center gap-[0.8em] rounded-[0.8em] border p-[0.8em] text-[0.85em] ${
                  on ? "border-[#06b6d4] bg-[#f0fbfe]" : "border-[#e1e8f0]"
                }`}
              >
                <input
                  type="checkbox"
                  checked={on}
                  onChange={() =>
                    setPicked((p) => {
                      const next = new Set(p);
                      if (next.has(s.studentId)) next.delete(s.studentId);
                      else next.add(s.studentId);
                      return next;
                    })
                  }
                  className="size-[1.1em] accent-[#06b6d4]"
                />
                <Avatar name={s.fullName} photoUrl={s.photoUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold text-[#0b1b2b]">{s.fullName}</span>
                  <span className="block text-[0.85em] text-[#5b6b7c]">
                    {s.trackName} · {t(s.level)}
                    {s.gender && ` · ${t(s.gender)}`}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 text-[0.8em] font-semibold text-[#b83232]">{error}</p>}

      <div className="flex flex-wrap justify-end gap-[0.6em] text-[0.85em]">
        <button type="button" onClick={onDone} className="rounded-[0.6em] border border-[#d5dee8] bg-white px-[1.1em] py-[0.5em] font-semibold text-[#14365a]">
          {t("Skip")}
        </button>
        <button
          type="button"
          onClick={assign}
          disabled={saving || picked.size === 0}
          className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#06b6d4] px-[1.2em] py-[0.5em] font-semibold text-white disabled:opacity-50"
        >
          {saving ? <LoaderCircle className="size-[1em] animate-spin" /> : <UserCheck className="size-[1em]" />}
          {t("Assign to {name}", { name: mentorName })}
        </button>
      </div>
    </div>
  );
}
