"use client";

import { useState, type FormEvent } from "react";
import { Check, KeyRound, LoaderCircle, Pencil, Power, Trash2, X } from "lucide-react";
import { approveSignup, APPROVALS_CHANGED, rejectSignup } from "@/lib/admin-api";
import {
  deleteTeacher,
  getAdminTeacher,
  setTeacherActive,
  setTeacherPassword,
  updateTeacher,
  type AdminTeacher,
} from "@/lib/admin-teachers-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_SECONDARY, INPUT } from "../page-parts";
import { TeacherForm } from "./TeacherForm";

type Panel = "edit" | "password" | "delete" | "reject" | null;

const DANGER = "!border-[#f0c9c9] !text-[#b83232]";

/**
 * The admin's buttons on a teacher: edit the account, set a password, deactivate or activate it, delete it (only when the
 * teacher has no work yet), or approve / turn down a sign-up.
 */
export function AccountControls({
  teacher: x,
  onChanged,
  onDeleted,
}: {
  teacher: AdminTeacher;
  onChanged: (t: AdminTeacher) => void;
  onDeleted: () => void;
}) {
  const t = useT();
  const [panel, setPanel] = useState<Panel>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [reason, setReason] = useState("");

  const open = (p: Panel) => {
    setPanel(panel === p ? null : p);
    setError(null);
    setDone(null);
  };

  async function run(action: () => Promise<void>, fail: string) {
    setBusy(true);
    setError(null);
    setDone(null);
    try {
      await action();
    } catch (e) {
      const fields = e instanceof ApiError ? Object.values(e.fieldErrors) : [];
      setError(fields.length ? fields.map((m) => t(m)).join(" ") : errorMessage(e, fail));
    } finally {
      setBusy(false);
    }
  }

  const toggle = () =>
    run(async () => {
      onChanged(await setTeacherActive(x.id, x.status !== "Active"));
      setPanel(null);
    }, tk("We couldn't save the change. Please try again."));

  const decide = (approve: boolean) =>
    run(async () => {
      if (approve) await approveSignup(x.id);
      else await rejectSignup(x.id, reason.trim());
      window.dispatchEvent(new Event(APPROVALS_CHANGED));
      onChanged(await getAdminTeacher(x.id));
      setPanel(null);
    }, tk("We couldn't save the change. Please try again."));

  const remove = () =>
    run(async () => {
      // 409 TEACHER_HAS_WORK comes back with its own message: deactivate instead.
      await deleteTeacher(x.id);
      onDeleted();
    }, tk("We couldn't delete the teacher. Please try again."));

  function savePassword(e: FormEvent) {
    e.preventDefault();
    void run(async () => {
      await setTeacherPassword(x.id, password);
      setPassword("");
      setPanel(null);
      setDone(t("The new password is saved. The teacher was signed out everywhere."));
    }, tk("We couldn't save the password. Please try again."));
  }

  const pending = x.status === "PendingApproval";
  const canToggle = x.status === "Active" || x.status === "Suspended";

  return (
    <div className="grid gap-[0.8em]">
      <div className="flex flex-wrap gap-[0.5em]">
        {pending ? (
          <>
            <button type="button" disabled={busy} onClick={() => decide(true)} className={`${BTN_SECONDARY} !border-[#bfe6d6] !text-[#12676b]`}>
              <Check className="size-[1em]" /> {t("Approve")}
            </button>
            <button type="button" disabled={busy} onClick={() => open("reject")} className={`${BTN_SECONDARY} ${DANGER}`}>
              <X className="size-[1em]" /> {t("Reject")}
            </button>
          </>
        ) : (
          <>
            <button type="button" onClick={() => open("edit")} aria-expanded={panel === "edit"} className={BTN_SECONDARY}>
              <Pencil className="size-[1em]" /> {t("Edit Teacher")}
            </button>
            {x.status === "Active" && (
              <button type="button" onClick={() => open("password")} aria-expanded={panel === "password"} className={BTN_SECONDARY}>
                <KeyRound className="size-[1em]" /> {t("Change Password")}
              </button>
            )}
            {canToggle && (
              <button type="button" disabled={busy} onClick={toggle} className={`${BTN_SECONDARY} ${x.status === "Active" ? DANGER : ""}`}>
                {busy && panel === null ? <LoaderCircle className="size-[1em] animate-spin" /> : <Power className="size-[1em]" />}
                {x.status === "Active" ? t("Deactivate") : t("Activate")}
              </button>
            )}
          </>
        )}
        <button type="button" onClick={() => open("delete")} aria-expanded={panel === "delete"} className={`${BTN_SECONDARY} ${DANGER}`}>
          <Trash2 className="size-[1em]" /> {t("Delete Teacher")}
        </button>
      </div>

      {panel === "edit" && (
        <div className="rounded-[0.9em] bg-[#f4f8fd] p-[1.1em]">
          <TeacherForm
            initial={{ fullName: x.fullName, schoolId: x.schoolId, subjects: x.subjects, grades: x.grades }}
            submitLabel={t("Save Changes")}
            onCancel={() => setPanel(null)}
            onSave={async (body) => {
              onChanged(await updateTeacher(x.id, { fullName: body.fullName, schoolId: body.schoolId, subjects: body.subjects, grades: body.grades }));
              setPanel(null);
              setDone(t("The changes are saved."));
            }}
          />
        </div>
      )}

      {panel === "password" && (
        <form onSubmit={savePassword} className="flex flex-wrap items-end gap-[0.6em] rounded-[0.9em] bg-[#f4f8fd] p-[1.1em] text-[0.85em]">
          <label className="grid min-w-[16em] flex-1 gap-[0.3em]">
            <span className="font-semibold text-[#0b1b2b]">{t("New password")}</span>
            <input type="text" dir="ltr" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className={`${INPUT} !text-[1em]`} />
            <span className="text-[0.85em] text-[#8a97a6]">{t("At least 8 characters with letters, numbers and a special character. The teacher is signed out everywhere.")}</span>
          </label>
          <button type="submit" disabled={busy || !password} className={BTN_SECONDARY}>
            {busy && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save Password")}
          </button>
        </form>
      )}

      {panel === "reject" && (
        <div className="flex flex-wrap items-end gap-[0.6em] rounded-[0.9em] bg-[#fdf3f3] p-[1.1em] text-[0.85em]">
          <label className="grid min-w-[16em] flex-1 gap-[0.3em]">
            <span className="font-semibold text-[#0b1b2b]">{t("Reason (optional)")}</span>
            <input value={reason} onChange={(e) => setReason(e.target.value)} className={`${INPUT} !text-[1em]`} />
          </label>
          <button type="button" disabled={busy} onClick={() => decide(false)} className={`${BTN_SECONDARY} ${DANGER}`}>
            {busy && <LoaderCircle className="size-[1em] animate-spin" />} {t("Reject Sign-up")}
          </button>
        </div>
      )}

      {panel === "delete" && (
        <div className="flex flex-wrap items-center justify-between gap-[0.6em] rounded-[0.9em] bg-[#fdf3f3] p-[1.1em] text-[0.85em]">
          <p className="max-w-[36em] text-[#14365a]">
            {t("Delete {name}'s account for good? Only a teacher who has no assignments, lessons, messages or content yet can be deleted.", { name: x.fullName })}
          </p>
          <span className="flex gap-[0.5em]">
            <button type="button" onClick={() => setPanel(null)} className={BTN_SECONDARY}>
              {t("Cancel")}
            </button>
            <button type="button" disabled={busy} onClick={remove} className={`${BTN_SECONDARY} ${DANGER}`}>
              {busy && <LoaderCircle className="size-[1em] animate-spin" />} {t("Delete")}
            </button>
          </span>
        </div>
      )}

      {error && <p role="alert" className="text-[0.8em] font-semibold text-[#b83232]">{error}</p>}
      {done && !error && <p role="status" className="text-[0.8em] font-semibold text-[#17935f]">{done}</p>}
    </div>
  );
}
