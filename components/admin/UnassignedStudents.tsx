"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { LoaderCircle, UserCheck } from "lucide-react";
import { assignStudentToMentor, getStudentsWithoutMentor, type AdminMentor, type UnassignedStudent } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "./admin-data";
import { Avatar } from "./squad-detail/parts";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/**
 * Students who learn a track but have no mentor in it (oldest first). The admin picks one of the
 * track's active mentors for each and assigns them.
 */
export function UnassignedStudents({ mentors, onAssigned }: { mentors: AdminMentor[]; onAssigned: () => void }) {
  const t = useT();
  const list = useAdminData(getStudentsWithoutMentor, tk("We couldn't load the students. Please try again."));
  const [track, setTrack] = useState("all");
  const students = list.data ?? [];
  const tracks = Array.from(new Map(students.map((s) => [s.trackCode, s.trackName])).entries());
  const shown = students.filter((s) => track === "all" || s.trackCode === track);

  const done = (s: UnassignedStudent) => {
    list.setData((l) => l?.filter((x) => !(x.studentId === s.studentId && x.trackId === s.trackId)) ?? null);
    onAssigned();
  };

  return (
    <section className={card} aria-labelledby="unassigned-title">
      <div className="flex flex-wrap items-center justify-between gap-[0.8em]">
        <div>
          <h2 id="unassigned-title" className="text-[1.05em] font-bold text-[#0b1b2b]">
            {t("Students without a mentor")}
            {list.data && <span className="ms-[0.5em] rounded-full bg-[#fdf0d4] px-[0.6em] text-[0.8em] text-[#a8680c]">{students.length}</span>}
          </h2>
          <p className="text-[0.78em] text-[#5b6b7c]">{t("They learn a track but nobody mentors them in it yet. Pick a mentor of the same track.")}</p>
        </div>
        {tracks.length > 1 && (
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            aria-label={t("Track")}
            className="rounded-[0.6em] border border-[#d5dee8] bg-white px-[0.8em] py-[0.45em] text-[0.8em]"
          >
            <option value="all">{t("All Tracks")}</option>
            {tracks.map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        )}
      </div>

      {!list.data ? (
        <LoadState error={list.error} onRetry={list.reload} />
      ) : shown.length === 0 ? (
        <p className="py-[1.5em] text-center text-[0.85em] text-[#17935f]">{t("Every student has a mentor.")}</p>
      ) : (
        <ul className="mt-[0.9em] divide-y divide-[#eef3f9]">
          {shown.map((s) => (
            <UnassignedRow
              key={`${s.studentId}-${s.trackId}`}
              student={s}
              mentors={mentors.filter((m) => m.isActive && m.trackCode === s.trackCode)}
              onDone={() => done(s)}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function UnassignedRow({ student, mentors, onDone }: { student: UnassignedStudent; mentors: AdminMentor[]; onDone: () => void }) {
  const t = useT();
  const [mentorId, setMentorId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function assign() {
    setSaving(true);
    setError(null);
    try {
      await assignStudentToMentor(mentorId, student.studentId);
      onDone();
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't assign the student. Please try again.")));
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-[0.8em] py-[0.7em] text-[0.82em]">
      <Link href={`/admin/students/${student.studentId}` as Route} className="flex min-w-[12em] flex-1 items-center gap-[0.6em] hover:underline">
        <Avatar name={student.fullName} photoUrl={student.photoUrl} />
        <span>
          <span className="block font-semibold text-[#0b1b2b]">{student.fullName}</span>
          <span className="block text-[0.85em] text-[#5b6b7c]">
            {student.trackName} · {t(student.level)} ·{" "}
            {t("since {date}", {
              date: new Date(student.sinceUtc).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" }),
            })}
          </span>
        </span>
      </Link>
      {mentors.length === 0 ? (
        <span className="text-[#a8680c]">{t("No active mentor in this track")}</span>
      ) : (
        <>
          <select
            value={mentorId}
            onChange={(e) => setMentorId(e.target.value)}
            aria-label={t("Mentor")}
            className="rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.6em] py-[0.35em]"
          >
            <option value="">{t("Choose a mentor")}</option>
            {mentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.fullName} ({t("{count} students", { count: m.students })})
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={assign}
            disabled={!mentorId || saving}
            className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#06b6d4] px-[1em] py-[0.4em] font-semibold text-white disabled:opacity-50"
          >
            {saving ? <LoaderCircle className="size-[1em] animate-spin" /> : <UserCheck className="size-[1em]" />} {t("Assign")}
          </button>
        </>
      )}
      {error && <p role="alert" className="w-full text-[#b83232]">{error}</p>}
    </li>
  );
}
