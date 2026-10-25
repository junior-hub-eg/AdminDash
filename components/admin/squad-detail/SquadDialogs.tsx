"use client";

import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import {
  addSquadTask,
  addStudentToSquad,
  getSquadAvailableStudents,
  SQUAD_ROLES,
  updateSquadProject,
  type AdminSquadFull,
  type AvailableSquadStudent,
  type SquadRole,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";

/** Runs a save, shows its error, and closes the dialog when it worked. */
function useSave(onClose: () => void) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function run(work: () => Promise<void>, fail: string) {
    setSaving(true);
    setError(null);
    try {
      await work();
      onClose();
    } catch (e) {
      setError(errorMessage(e, fail));
    } finally {
      setSaving(false);
    }
  }
  return { saving, error, run };
}

function Footer({ saving, error, onClose, label }: { saving: boolean; error: string | null; onClose: () => void; label: string }) {
  const t = useT();
  return (
    <>
      {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className={BTN_SECONDARY}>
          {t("Cancel")}
        </button>
        <button type="submit" disabled={saving} className={BTN_PRIMARY}>
          {saving && <LoaderCircle className="size-4 animate-spin" />} {t(label)}
        </button>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  const t = useT();
  return (
    <label className="grid gap-1 font-semibold">
      {t(label)}
      {children}
    </label>
  );
}

/** "Squad Settings": the squad's name and its project (PUT admin/squads/{id}/project). */
export function SquadSettingsDialog({
  open,
  onClose,
  squad,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  squad: AdminSquadFull;
  onSaved: (squad: AdminSquadFull) => void;
}) {
  const [name, setName] = useState(squad.name);
  const [title, setTitle] = useState(squad.projectTitle);
  const [description, setDescription] = useState(squad.projectDescription);
  const { saving, error, run } = useSave(onClose);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(
      async () => onSaved(await updateSquadProject(squad.id, { name, projectTitle: title, projectDescription: description })),
      tk("We couldn't save the squad. Please try again."),
    );
  };

  return (
    <AdminDialog open={open} title="Squad Settings" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 text-[0.8rem]">
        <Field label="Squad name">
          <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
        </Field>
        <Field label="Project title">
          <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} />
        </Field>
        <Field label="Project description">
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${FIELD} h-auto py-2`}
          />
        </Field>
        <Footer saving={saving} error={error} onClose={onClose} label="Save" />
      </form>
    </AdminDialog>
  );
}

/** "+ Add Task": a task in the active sprint, for one member or the whole squad. */
export function AddTaskDialog({
  open,
  onClose,
  squad,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  squad: AdminSquadFull;
  onSaved: (squad: AdminSquadFull) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [points, setPoints] = useState(3);
  const { saving, error, run } = useSave(() => {
    setTitle("");
    setDescription("");
    onClose();
  });
  const t = useT();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(
      async () =>
        onSaved(
          await addSquadTask(squad.id, {
            title: title.trim(),
            description: description.trim() || undefined,
            assigneeStudentId: assignee || null,
            storyPoints: points,
          }),
        ),
      tk("We couldn't add the task. Please try again."),
    );
  };

  return (
    <AdminDialog open={open} title="Add Task" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 text-[0.8rem]">
        <Field label="Title">
          <input required maxLength={150} value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} />
        </Field>
        <Field label="Description">
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className={`${FIELD} h-auto py-2`} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Assignee">
            <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className={FIELD}>
              <option value="">{t("Whole Squad")}</option>
              {squad.members.map((m) => (
                <option key={m.studentId} value={m.studentId}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Story points">
            <input
              type="number"
              min={1}
              max={20}
              value={points}
              onChange={(e) => setPoints(Number(e.target.value) || 1)}
              className={FIELD}
            />
          </Field>
        </div>
        <Footer saving={saving} error={error} onClose={onClose} label="Add Task" />
      </form>
    </AdminDialog>
  );
}

/** Adds a student who has no squad yet, in a role. */
export function AddMemberDialog({
  open,
  onClose,
  squad,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  squad: AdminSquadFull;
  onSaved: () => Promise<void>;
}) {
  const t = useT();
  const [students, setStudents] = useState<AvailableSquadStudent[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [studentId, setStudentId] = useState("");
  const [role, setRole] = useState<SquadRole>(squad.seats.find((s) => s.filled < s.needed)?.role ?? "Frontend");
  const { saving, error, run } = useSave(onClose);

  useEffect(() => {
    if (!open) return;
    let active = true;
    getSquadAvailableStudents(squad.id).then(
      (list) => active && setStudents(list),
      (e) => active && setLoadError(errorMessage(e, tk("We couldn't load the students. Please try again."))),
    );
    return () => {
      active = false;
    };
  }, [open, squad.id]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    run(async () => {
      await addStudentToSquad(squad.id, studentId, role);
      await onSaved();
    }, tk("We couldn't add the student. Please try again."));
  };

  return (
    <AdminDialog open={open} title="Add Member" onClose={onClose}>
      <form onSubmit={submit} className="grid gap-3 text-[0.8rem]">
        {loadError && <p className="font-semibold text-[#b83232]">{loadError}</p>}
        <Field label="Student">
          <select required value={studentId} onChange={(e) => setStudentId(e.target.value)} className={FIELD}>
            <option value="">{students ? t("Choose a student") : t("Loading")}</option>
            {students?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.fullName}
                {s.trackName ? ` · ${s.trackName}` : ""}
              </option>
            ))}
          </select>
        </Field>
        {students?.length === 0 && <p className="text-[#5b6b7c]">{t("Every student is already in a squad.")}</p>}
        <Field label="Role">
          <select value={role} onChange={(e) => setRole(e.target.value as SquadRole)} className={FIELD}>
            {SQUAD_ROLES.map((r) => (
              <option key={r} value={r}>
                {t(r)}
              </option>
            ))}
          </select>
        </Field>
        <Footer saving={saving} error={error} onClose={onClose} label="Add Member" />
      </form>
    </AdminDialog>
  );
}
