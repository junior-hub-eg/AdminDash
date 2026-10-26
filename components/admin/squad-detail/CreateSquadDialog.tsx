"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import {
  createSquad,
  getProjects,
  SQUAD_ROLES,
  type AdminMentor,
  type AdminProject,
  type AdminSquad,
  type SquadRole,
  type TrackLevel,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";
import { ProjectLogo } from "../projects/ProjectLogo";

const LEVELS: TrackLevel[] = ["Beginner", "Intermediate", "Advanced"];

/**
 * "+ Create Squad": name, project, level, seats per role and an optional monitor (POST admin/squads). The project comes
 * from the project library (27 Oct 2026), which gives the level and team, or is written here for this squad only.
 */
export function CreateSquadDialog({
  open,
  onClose,
  mentors,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  mentors: AdminMentor[] | null;
  onCreated: (squad: AdminSquad) => void;
}) {
  const t = useT();
  const [name, setName] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [level, setLevel] = useState<TrackLevel>("Beginner");
  const [seats, setSeats] = useState<Partial<Record<SquadRole, number>>>({ Frontend: 2, Backend: 2, UIUX: 1 });
  const [monitorId, setMonitorId] = useState("");
  const [projects, setProjects] = useState<AdminProject[] | null>(null);
  // A library project's id, or "" to write the project here.
  const [projectId, setProjectId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || projects) return;
    let active = true;
    getProjects().then(
      (list) => active && setProjects(list),
      () => active && setProjects([]),
    );
    return () => {
      active = false;
    };
  }, [open, projects]);

  const project = projects?.find((p) => p.id === projectId) ?? null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const squad = await createSquad({
        name: name.trim(),
        projectTitle: projectTitle.trim(),
        projectDescription: projectDescription.trim(),
        level,
        seats: SQUAD_ROLES.filter((r) => (seats[r] ?? 0) > 0).map((r) => `${r}:${seats[r]}`).join(","),
        monitorId: monitorId || null,
        projectId: project?.id ?? null,
      });
      onCreated(squad);
      setName("");
      setProjectTitle("");
      setProjectDescription("");
      setProjectId("");
      onClose();
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't create the squad. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog open={open} title="Create Squad" onClose={onClose}>
      <form onSubmit={submit} className="grid max-h-[70vh] gap-3 overflow-y-auto text-[0.8rem]">
        <label className="grid gap-1 font-semibold">
          {t("Squad name")}
          <input required maxLength={60} value={name} onChange={(e) => setName(e.target.value)} className={FIELD} />
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Project")}
          <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className={FIELD}>
            <option value="">{projects ? t("Write the project for this squad") : t("Loading…")}</option>
            {projects?.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title} · {t(p.level)} · {t("{n} members", { n: p.teamSize })}
              </option>
            ))}
          </select>
        </label>
        {project ? (
          <div className="flex items-start gap-3 rounded-lg bg-[#f1f5fd] p-3">
            <ProjectLogo src={project.logoUrl} title={project.title} className="size-11 text-[1rem]" />
            <div className="min-w-0 text-[0.75rem] text-[#3d4f61]">
              <p className="font-semibold text-[#0b1b2b]">{project.title}</p>
              <p className="line-clamp-2">{project.description}</p>
              <p className="mt-1 font-semibold text-[#14365a]">
                {t(project.level)} · {t("{n} members", { n: project.teamSize })} · {t("{n} weeks", { n: project.durationWeeks })}
              </p>
            </div>
          </div>
        ) : (
          <>
            <label className="grid gap-1 font-semibold">
              {t("Project title")}
              <input required maxLength={120} value={projectTitle} onChange={(e) => setProjectTitle(e.target.value)} className={FIELD} />
            </label>
            <label className="grid gap-1 font-semibold">
              {t("Project description")}
              <textarea
                required
                maxLength={1000}
                rows={3}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                className={`${FIELD} h-auto py-2`}
              />
            </label>
          </>
        )}
        <div className={`grid gap-3 ${project ? "" : "grid-cols-2"}`}>
          <label className={`grid gap-1 font-semibold ${project ? "hidden" : ""}`}>
            {t("Level")}
            <select value={level} onChange={(e) => setLevel(e.target.value as TrackLevel)} className={FIELD}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {t(l)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            {t("Monitor")}
            <select value={monitorId} onChange={(e) => setMonitorId(e.target.value)} className={FIELD}>
              <option value="">{t("No monitor yet")}</option>
              {mentors?.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.fullName}
                </option>
              ))}
            </select>
          </label>
        </div>

        <fieldset className={`grid gap-2 ${project ? "hidden" : ""}`}>
          <legend className="mb-1 font-semibold">{t("Seats per role")}</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SQUAD_ROLES.map((r) => (
              <label key={r} className="grid gap-1 text-[0.72rem] text-[#5b6b7c]">
                {t(r)}
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={seats[r] ?? 0}
                  onChange={(e) => setSeats((s) => ({ ...s, [r]: Math.max(0, Number(e.target.value) || 0) }))}
                  className={FIELD}
                />
              </label>
            ))}
          </div>
        </fieldset>

        {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            {t("Cancel")}
          </button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-4 animate-spin" />} {t("Create Squad")}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
