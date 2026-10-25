"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, ArrowRight, LoaderCircle } from "lucide-react";
import {
  changeStudentMentor,
  getAdminMentors,
  getAdminSquadFull,
  getAdminSquads,
  getAdminStudent,
  moveStudentSquad,
  type AdminMentor,
  type AdminSquadMember,
  type AdminStudentDetail as Detail,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { STUDENT_STATUS_LABEL, STUDENT_STATUS_STYLE, StudentAvatar } from "./StudentsTable";
import { LoadState, useAdminData } from "./admin-data";
import { Bar } from "./squad-detail/parts";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** One student: profile, and the mentor in each track they learn, which the admin can change. */
export default function AdminStudentDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getAdminStudent(id), [id]);
  const student = useAdminData(load, tk("We couldn't load this student. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const s = student.data;

  return (
    <AdminPage>
      <PageHero title={s?.fullName ?? t("Student profile")} contentClassName="pb-[3em]" pictureTop>
        <Link href={"/admin/students" as Route} className="mt-[0.8em] inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
          <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All students")}
        </Link>
      </PageHero>

      <div className="mx-auto mt-[1.5em] grid w-full gap-[1.2em] lg:w-[80%]">
        {!s ? (
          <LoadState error={student.error} onRetry={student.reload} />
        ) : (
          <>
            <section className={`${card} flex flex-wrap items-center gap-[1.2em]`}>
              <StudentAvatar student={s} index={0} size="4.5em" />
              <div className="min-w-0 flex-1">
                <h2 className="text-[1.2em] font-bold text-[#0b1b2b]">{s.fullName}</h2>
                <p className="text-[0.85em] text-[#5b6b7c]">{s.email}</p>
                <span className={`mt-[0.4em] inline-block rounded-full px-[0.8em] py-[0.15em] text-[0.75em] font-medium ${STUDENT_STATUS_STYLE[s.status]}`}>
                  {t(STUDENT_STATUS_LABEL[s.status])}
                </span>
              </div>
              <dl className="grid grid-cols-2 gap-x-[1.5em] gap-y-[0.4em] text-[0.85em] sm:grid-cols-3">
                <Fact label={t("School")} value={s.schoolName ?? t("Independent")} />
                <Fact label={t("Grade")} value={s.grade ? `${s.grade}${s.className ? ` · ${s.className}` : ""}` : "—"} />
                <Fact label={t("Squad")} value={s.squadName ?? "—"} />
                <Fact label={t("XP")} value={String(s.totalXp)} />
                <Fact label={t("Streak")} value={t("{count} days", { count: s.streakDays })} />
                <Fact
                  label={t("Last login")}
                  value={s.lastLoginUtc ? new Date(s.lastLoginUtc).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric" }) : "—"}
                />
              </dl>
            </section>

            <section className={card}>
              <h2 className="text-[1em] font-bold text-[#14365a]">{t("Tracks and mentors")}</h2>
              {s.tracks.length === 0 ? (
                <p className="mt-[0.6em] text-[0.85em] text-[#8a97a6]">{t("This student has not chosen a track yet.")}</p>
              ) : (
                <ul className="mt-[0.8em] divide-y divide-[#e6edf3]">
                  {s.tracks.map((track) => (
                    <TrackMentorRow
                      key={track.trackId}
                      studentId={s.id}
                      track={track}
                      mentors={mentors.data?.mentors.filter((m) => m.trackCode === track.trackCode && m.isActive) ?? null}
                      onSaved={student.setData}
                    />
                  ))}
                </ul>
              )}
              {mentors.error && <LoadState error={mentors.error} onRetry={mentors.reload} className="mt-[0.8em]" />}
            </section>

            <SquadSection student={s} onMoved={student.reload} />

            {s.recentActivity && s.recentActivity.length > 0 && (
              <section className={card}>
                <h2 className="text-[1em] font-bold text-[#14365a]">{t("Recent activity")}</h2>
                <ul className="mt-[0.8em] grid gap-[0.5em] text-[0.85em]">
                  {s.recentActivity.map((a, i) => (
                    <li key={i} className="flex flex-wrap justify-between gap-[0.6em] border-b border-[#eef3f9] pb-[0.4em] last:border-0">
                      <span className="text-[#14365a]">{a.text}</span>
                      <span className="text-[#8a97a6]">
                        {new Date(a.createdUtc).toLocaleString(dateLocale("en-GB"), { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </div>
    </AdminPage>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[0.8em] text-[#8a97a6]">{label}</dt>
      <dd className="font-semibold text-[#14365a]">{value}</dd>
    </div>
  );
}

function TrackMentorRow({
  studentId,
  track,
  mentors,
  onSaved,
}: {
  studentId: string;
  track: Detail["tracks"][number];
  mentors: AdminMentor[] | null;
  onSaved: (detail: Detail) => void;
}) {
  const t = useT();
  const [choice, setChoice] = useState(track.mentor?.id ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      onSaved(await changeStudentMentor(studentId, choice));
      setSaved(true);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't change the mentor. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-wrap items-center gap-[0.8em] py-[0.8em] text-[0.85em]">
      <div className="min-w-[10em] flex-1">
        <p className="font-semibold text-[#0b1b2b]">{track.trackName}</p>
        <p className="text-[#8a97a6]">{t(track.level)}</p>
      </div>
      <label className="flex items-center gap-[0.5em]">
        <span className="text-[#5b6b7c]">{t("Mentor")}</span>
        <select
          value={choice}
          onChange={(e) => {
            setChoice(e.target.value);
            setSaved(false);
          }}
          disabled={!mentors || saving}
          className="rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.6em] py-[0.35em]"
        >
          {!track.mentor && <option value="">{t("No mentor yet")}</option>}
          {track.mentor && !mentors?.some((m) => m.id === track.mentor!.id) && <option value={track.mentor.id}>{track.mentor.fullName}</option>}
          {mentors?.map((m) => (
            <option key={m.id} value={m.id}>
              {m.fullName}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={save}
        disabled={saving || !choice || choice === track.mentor?.id}
        className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#1d6fe0] px-[1em] py-[0.4em] font-semibold text-white disabled:opacity-50"
      >
        {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save")}
      </button>
      {saved && <span className="text-[#12676b]">{t("Saved")}</span>}
      {error && <p role="alert" className="w-full text-[#b83232]">{error}</p>}
    </li>
  );
}

/** The student's squad, their progress in it, and moving them to another squad (or out of it). */
function SquadSection({ student, onMoved }: { student: Detail; onMoved: () => Promise<void> }) {
  const t = useT();
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const squadId = student.squadId;
  const loadMember = useCallback(
    async (): Promise<AdminSquadMember | null> =>
      squadId ? ((await getAdminSquadFull(squadId)).members.find((m) => m.studentId === student.id) ?? null) : null,
    [squadId, student.id],
  );
  const member = useAdminData(loadMember, tk("We couldn't load this squad. Please try again."));
  const [target, setTarget] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function move(to: string | null) {
    if (to === null && !window.confirm(t("Take {name} out of this squad?", { name: student.fullName }))) return;
    setSaving(true);
    setError(null);
    try {
      await moveStudentSquad(student.id, to);
      setTarget("");
      await onMoved();
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't move the student. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  const m = member.data;
  return (
    <section className={card}>
      <div className="flex flex-wrap items-center justify-between gap-[0.6em]">
        <h2 className="text-[1em] font-bold text-[#14365a]">{t("Squad")}</h2>
        {squadId && (
          <Link
            href={`/admin/squads/${squadId}` as Route}
            className="inline-flex items-center gap-[0.3em] text-[0.85em] font-semibold text-[#0b89a6] hover:underline"
          >
            {t("Open Workspace")} <ArrowRight className="size-[1em] rtl:rotate-180" />
          </Link>
        )}
      </div>

      {!squadId ? (
        <p className="mt-[0.6em] text-[0.85em] text-[#8a97a6]">{t("This student is not in a squad.")}</p>
      ) : m ? (
        <div className="mt-[0.8em] grid gap-[0.6em] text-[0.85em] sm:grid-cols-4">
          <Fact label={t("Squad")} value={student.squadName ?? "—"} />
          <Fact label={t("Role")} value={t(m.role)} />
          <Fact label={t("Tasks")} value={`${m.tasksDone}/${m.tasksTotal}`} />
          <Fact label={t("Story points")} value={String(m.storyPointsDone)} />
          <div className="flex items-center gap-[0.6em] sm:col-span-4">
            <Bar value={m.progress} />
            <span className="shrink-0 font-semibold text-[#14365a]">{Math.round(m.progress)}%</span>
          </div>
        </div>
      ) : (
        member.error && <LoadState error={member.error} onRetry={member.reload} className="mt-[0.8em]" />
      )}

      <div className="mt-[1em] flex flex-wrap items-center gap-[0.6em] text-[0.85em]">
        <label className="flex items-center gap-[0.5em]">
          <span className="text-[#5b6b7c]">{t("Move to squad")}</span>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            disabled={!squads.data || saving}
            className="rounded-[0.5em] border border-[#d5dee8] bg-white px-[0.6em] py-[0.35em]"
          >
            <option value="">{t("Choose a squad")}</option>
            {squads.data
              ?.filter((x) => x.id !== squadId && x.status !== "Completed")
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name} ({x.students}/{x.capacity})
                </option>
              ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => move(target)}
          disabled={saving || !target}
          className="inline-flex items-center gap-[0.4em] rounded-[0.5em] bg-[#1d6fe0] px-[1em] py-[0.4em] font-semibold text-white disabled:opacity-50"
        >
          {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Move")}
        </button>
        {squadId && (
          <button type="button" onClick={() => move(null)} disabled={saving} className="font-semibold text-[#b83232] hover:underline">
            {t("Remove from squad")}
          </button>
        )}
      </div>
      {error && <p role="alert" className="mt-[0.5em] text-[0.85em] text-[#b83232]">{error}</p>}
    </section>
  );
}
