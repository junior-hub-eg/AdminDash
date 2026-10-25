"use client";

import { useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowRightLeft, LoaderCircle, UserMinus, UserPlus } from "lucide-react";
import { moveStudentSquad, removeStudentFromSquad, type AdminSquad, type AdminSquadFull, type AdminSquadMember } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, INPUT, PANEL } from "../page-parts";
import { Avatar, Bar, shortDate } from "./parts";

/**
 * The squad's team: each member's role, tasks, story points, XP and progress, a link to the
 * student's page, and the admin's actions: move to another squad, take out, add a member.
 */
export function MembersPanel({
  squad,
  squads,
  onAdd,
  onChanged,
}: {
  squad: AdminSquadFull;
  squads: AdminSquad[] | null;
  onAdd: () => void;
  onChanged: () => Promise<void>;
}) {
  const t = useT();
  const [moving, setMoving] = useState<string | null>(null);
  const [target, setTarget] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const others = squads?.filter((s) => s.id !== squad.id && s.status !== "Completed") ?? [];

  async function act(member: AdminSquadMember, work: () => Promise<unknown>, fail: string) {
    setBusy(member.studentId);
    setError(null);
    try {
      await work();
      setMoving(null);
      await onChanged();
    } catch (e) {
      setError(errorMessage(e, fail));
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className={`${PANEL} p-[1.3em]`}>
      <div className="mb-[1em] flex flex-wrap items-center justify-between gap-[0.8em]">
        <div>
          <h3 className="text-[1.05em] font-bold text-[#0b1b2b]">{t("Squad Members")}</h3>
          <p className="text-[0.78em] text-[#5b6b7c]">
            {squad.seats.map((s) => `${t(s.role)} ${s.filled}/${s.needed}`).join(" · ")}
          </p>
        </div>
        <button type="button" onClick={onAdd} className={BTN_PRIMARY}>
          <UserPlus className="size-[1em]" /> {t("Add Member")}
        </button>
      </div>

      {error && <p role="alert" className="mb-[0.8em] rounded-lg bg-[#fdecec] px-3 py-2 text-[0.8em] font-semibold text-[#b83232]">{error}</p>}

      {squad.members.length === 0 ? (
        <p className="py-[1.5em] text-center text-[0.85em] text-[#8a97a6]">{t("No members yet.")}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46em] text-start text-[0.8em]">
            <thead>
              <tr className="bg-[#eef3f9] text-[0.78em] uppercase tracking-wider text-[#5b6b7c]">
                <th className="rounded-s-[0.6em] px-[0.8em] py-[0.7em] text-start">{t("Student")}</th>
                <th className="px-[0.8em] text-start">{t("Role")}</th>
                <th className="px-[0.8em] text-start">{t("Tasks")}</th>
                <th className="w-[10em] px-[0.8em] text-start">{t("Progress")}</th>
                <th className="px-[0.8em] text-start">{t("Story points")}</th>
                <th className="px-[0.8em] text-start">XP</th>
                <th className="px-[0.8em] text-start">{t("Last active")}</th>
                <th className="rounded-e-[0.6em] px-[0.8em] text-end">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody>
              {squad.members.map((m) => (
                <tr key={m.studentId} className="border-b border-[#eef3f9] align-middle last:border-0">
                  <td className="px-[0.8em] py-[0.7em]">
                    <Link
                      href={`/admin/students/${m.studentId}` as Route}
                      className="flex items-center gap-[0.6em] font-semibold text-[#0b1b2b] hover:underline"
                    >
                      <Avatar name={m.fullName} photoUrl={m.photoUrl} />
                      {m.fullName}
                    </Link>
                  </td>
                  <td className="px-[0.8em]">
                    <span className="rounded-md bg-[#e0f6fc] px-[0.5em] py-[0.15em] font-semibold text-[#0b89a6]">{t(m.role)}</span>
                  </td>
                  <td className="px-[0.8em]">
                    {m.tasksDone}/{m.tasksTotal}
                  </td>
                  <td className="px-[0.8em]">
                    <div className="flex items-center gap-[0.5em]">
                      <Bar value={m.progress} />
                      <span className="w-[3em] text-end font-semibold">{Math.round(m.progress)}%</span>
                    </div>
                  </td>
                  <td className="px-[0.8em]">{m.storyPointsDone}</td>
                  <td className="px-[0.8em] font-semibold text-[#17935f]">{m.totalXp}</td>
                  <td className="px-[0.8em] text-[#5b6b7c]">{shortDate(m.lastActiveDate)}</td>
                  <td className="px-[0.8em] text-end">
                    {moving === m.studentId ? (
                      <span className="inline-flex items-center gap-[0.4em]">
                        <select value={target} onChange={(e) => setTarget(e.target.value)} aria-label={t("Move to squad")} className={INPUT}>
                          <option value="">{t("Choose a squad")}</option>
                          {others.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={!target || busy === m.studentId}
                          onClick={() =>
                            act(m, () => moveStudentSquad(m.studentId, target), tk("We couldn't move the student. Please try again."))
                          }
                          className={BTN_PRIMARY}
                        >
                          {busy === m.studentId ? <LoaderCircle className="size-[1em] animate-spin" /> : t("Move")}
                        </button>
                        <button type="button" onClick={() => setMoving(null)} className="text-[#5b6b7c] hover:underline">
                          {t("Cancel")}
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex gap-[0.3em]">
                        <button
                          type="button"
                          onClick={() => {
                            setTarget("");
                            setMoving(m.studentId);
                          }}
                          title={t("Move to another squad")}
                          aria-label={t("Move to another squad")}
                          className="grid size-[2.1em] place-items-center rounded-full text-[#0b89a6] hover:bg-[#e0f6fc]"
                        >
                          <ArrowRightLeft className="size-[1em]" />
                        </button>
                        <button
                          type="button"
                          disabled={busy === m.studentId}
                          onClick={() => {
                            if (!window.confirm(t("Take {name} out of this squad?", { name: m.fullName }))) return;
                            act(m, () => removeStudentFromSquad(squad.id, m.studentId), tk("We couldn't remove the student. Please try again."));
                          }}
                          title={t("Remove from squad")}
                          aria-label={t("Remove from squad")}
                          className="grid size-[2.1em] place-items-center rounded-full text-[#d04a4a] hover:bg-[#fdecec]"
                        >
                          <UserMinus className="size-[1em]" />
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
