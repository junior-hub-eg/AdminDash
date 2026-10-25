"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle, Pencil, Plus, Trash2 } from "lucide-react";
import {
  addUseCase,
  deleteUseCase,
  SQUAD_ROLES,
  updateUseCase,
  type AdminSquadFull,
  type SquadRole,
  type UseCase,
  type UseCaseInput,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY, PANEL } from "../page-parts";

const EMPTY: UseCaseInput = {
  title: "",
  actor: "",
  description: "",
  preconditions: "",
  mainFlow: "",
  acceptanceCriteria: "",
  role: null,
};

/**
 * The project the admin manages for the squad: its brief and its use cases
 * (actor, description, preconditions, main flow, acceptance criteria, the role that builds it).
 */
export function ProjectBrief({
  squad,
  onEditProject,
  onUseCases,
}: {
  squad: AdminSquadFull;
  onEditProject: () => void;
  onUseCases: (useCases: UseCase[]) => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState<UseCase | "new" | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(u: UseCase) {
    if (!window.confirm(t("Delete the use case \"{title}\"?", { title: u.title }))) return;
    setBusy(u.id);
    setError(null);
    try {
      await deleteUseCase(u.id);
      onUseCases(squad.useCases.filter((x) => x.id !== u.id));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't delete the use case. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-[1.2em]">
      <section className={`${PANEL} p-[1.3em]`}>
        <div className="flex flex-wrap items-start justify-between gap-[0.8em]">
          <div className="min-w-0">
            <p className="text-[0.68em] font-bold uppercase tracking-wider text-[#0b89a6]">{t("Active Project")}</p>
            <h3 className="mt-[0.2em] text-[1.2em] font-extrabold text-[#0b1b2b]">{squad.projectTitle}</h3>
          </div>
          <button type="button" onClick={onEditProject} className={BTN_SECONDARY}>
            <Pencil className="size-[1em]" /> {t("Edit project")}
          </button>
        </div>
        <p className="mt-[0.7em] whitespace-pre-line text-[0.85em] leading-relaxed text-[#3d4f61]">{squad.projectDescription}</p>
      </section>

      <section className={`${PANEL} p-[1.3em]`}>
        <div className="mb-[1em] flex flex-wrap items-center justify-between gap-[0.8em]">
          <div>
            <h3 className="text-[1.05em] font-bold text-[#0b1b2b]">{t("Use Cases")}</h3>
            <p className="text-[0.78em] text-[#5b6b7c]">{t("What the project must do, step by step, and how the mentor checks it.")}</p>
          </div>
          <button type="button" onClick={() => setEditing("new")} className={BTN_PRIMARY}>
            <Plus className="size-[1em]" /> {t("Add use case")}
          </button>
        </div>

        {error && <p role="alert" className="mb-[0.8em] rounded-lg bg-[#fdecec] px-3 py-2 text-[0.8em] font-semibold text-[#b83232]">{error}</p>}

        {squad.useCases.length === 0 ? (
          <p className="py-[1.5em] text-center text-[0.85em] text-[#8a97a6]">{t("No use cases yet.")}</p>
        ) : (
          <ol className="grid gap-[0.8em]">
            {squad.useCases.map((u, i) => (
              <li key={u.id} className="rounded-[0.9em] border border-[#e3ebf3] p-[1em]">
                <div className="flex flex-wrap items-start justify-between gap-[0.6em]">
                  <div className="min-w-0">
                    <p className="text-[0.7em] font-bold uppercase tracking-wider text-[#5b6b7c]">
                      UC-{String(i + 1).padStart(2, "0")} · {t("Actor")}: {u.actor}
                      {u.role && ` · ${t(u.role)}`}
                    </p>
                    <h4 className="mt-[0.2em] text-[0.95em] font-bold text-[#0b1b2b]">{u.title}</h4>
                  </div>
                  <div className="flex gap-[0.4em]">
                    <button
                      type="button"
                      onClick={() => setEditing(u)}
                      aria-label={t("Edit")}
                      className="grid size-[2em] place-items-center rounded-full hover:bg-[#eef4fa]"
                    >
                      <Pencil className="size-[1em]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(u)}
                      disabled={busy === u.id}
                      aria-label={t("Delete")}
                      className="grid size-[2em] place-items-center rounded-full text-[#d04a4a] hover:bg-[#fdecec]"
                    >
                      {busy === u.id ? <LoaderCircle className="size-[1em] animate-spin" /> : <Trash2 className="size-[1em]" />}
                    </button>
                  </div>
                </div>
                {u.description && <p className="mt-[0.5em] text-[0.82em] text-[#3d4f61]">{u.description}</p>}
                <dl className="mt-[0.6em] grid gap-[0.6em] text-[0.78em] md:grid-cols-3">
                  {[
                    [tk("Preconditions"), u.preconditions],
                    [tk("Main flow"), u.mainFlow],
                    [tk("Acceptance criteria"), u.acceptanceCriteria],
                  ].map(([label, value]) =>
                    value ? (
                      <div key={label} className="rounded-[0.6em] bg-[#f5f8fe] p-[0.7em]">
                        <dt className="font-bold text-[#14365a]">{t(label)}</dt>
                        <dd className="mt-[0.2em] whitespace-pre-line text-[#3d4f61]">{value}</dd>
                      </div>
                    ) : null,
                  )}
                </dl>
              </li>
            ))}
          </ol>
        )}
      </section>

      {editing && (
        <UseCaseDialog
          squadId={squad.id}
          useCase={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) =>
            onUseCases(
              editing === "new" ? [...squad.useCases, saved] : squad.useCases.map((x) => (x.id === saved.id ? saved : x)),
            )
          }
        />
      )}
    </div>
  );
}

function UseCaseDialog({
  squadId,
  useCase,
  onClose,
  onSaved,
}: {
  squadId: string;
  useCase: UseCase | null;
  onClose: () => void;
  onSaved: (u: UseCase) => void;
}) {
  const t = useT();
  const [form, setForm] = useState<UseCaseInput>(useCase ? { ...useCase } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (key: keyof UseCaseInput) => (e: { target: { value: string } }) => setForm((f) => ({ ...f, [key]: e.target.value }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      onSaved(useCase ? await updateUseCase(useCase.id, form) : await addUseCase(squadId, form));
      onClose();
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't save the use case. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  const area = `${FIELD} h-auto py-2`;
  return (
    <AdminDialog open title={useCase ? "Edit use case" : "Add use case"} onClose={onClose}>
      <form onSubmit={submit} className="grid max-h-[70vh] gap-3 overflow-y-auto text-[0.8rem]">
        <label className="grid gap-1 font-semibold">
          {t("Title")}
          <input required maxLength={150} value={form.title} onChange={set("title")} className={FIELD} />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 font-semibold">
            {t("Actor")}
            <input required maxLength={80} value={form.actor} onChange={set("actor")} placeholder={t("e.g. Student")} className={FIELD} />
          </label>
          <label className="grid gap-1 font-semibold">
            {t("Role")}
            <select
              value={form.role ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, role: (e.target.value || null) as SquadRole | null }))}
              className={FIELD}
            >
              <option value="">{t("Whole Squad")}</option>
              {SQUAD_ROLES.map((r) => (
                <option key={r} value={r}>
                  {t(r)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="grid gap-1 font-semibold">
          {t("Description")}
          <textarea rows={2} maxLength={2000} value={form.description} onChange={set("description")} className={area} />
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Preconditions")}
          <textarea rows={2} maxLength={1000} value={form.preconditions} onChange={set("preconditions")} className={area} />
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Main flow")}
          <textarea rows={4} maxLength={4000} value={form.mainFlow} onChange={set("mainFlow")} className={area} />
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Acceptance criteria")}
          <textarea rows={3} maxLength={2000} value={form.acceptanceCriteria} onChange={set("acceptanceCriteria")} className={area} />
        </label>
        {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            {t("Cancel")}
          </button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-4 animate-spin" />} {t("Save")}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
