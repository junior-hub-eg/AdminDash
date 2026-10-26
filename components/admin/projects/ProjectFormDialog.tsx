"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { ImagePlus, LoaderCircle, Plus, Trash2, X } from "lucide-react";
import {
  createProject,
  formatSeats,
  parseSeats,
  PROJECT_LINK_KINDS,
  SQUAD_ROLES,
  updateProject,
  type AdminProject,
  type ProjectLink,
  type ProjectLinkKind,
  type SquadRole,
  type TrackLevel,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";
import { ProjectLogo } from "./ProjectLogo";

const LEVELS: TrackLevel[] = ["Beginner", "Intermediate", "Advanced"];
const MAX_LINKS = 15;
const LOGO_SIZE = 256;

export const LINK_LABEL: Record<ProjectLinkKind, string> = {
  Chat: tk("Chat group"),
  Meeting: tk("Meeting"),
  Figma: tk("Figma"),
  GitHub: tk("GitHub"),
  Drive: tk("Drive folder"),
  Docs: tk("Docs / board"),
  Other: tk("Other link"),
};

const PLACEHOLDER: Record<ProjectLinkKind, string> = {
  Chat: "https://chat.whatsapp.com/…",
  Meeting: "https://meet.google.com/…",
  Figma: "https://www.figma.com/design/…",
  GitHub: "https://github.com/…",
  Drive: "https://drive.google.com/…",
  Docs: "https://docs.google.com/…",
  Other: "https://…",
};

/** The picture shrunk to a 256px square WebP, so the logo stays small enough to save with the project. */
function shrinkImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = LOGO_SIZE;
      canvas.height = LOGO_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("canvas"));
      const side = Math.min(img.width, img.height);
      ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, LOGO_SIZE, LOGO_SIZE);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/webp", 0.85));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image"));
    };
    img.src = url;
  });
}

/**
 * "New Project Brief" and "Edit": the project in full (POST / PUT admin/projects) — name, description, logo, level,
 * team by role, duration and the links its squads open (chat, meeting, Figma, ...). While a squad builds the project its
 * level and team are locked.
 */
export function ProjectFormDialog({
  open,
  project,
  onClose,
  onSaved,
}: {
  open: boolean;
  /** Null for a new project. */
  project: AdminProject | null;
  onClose: () => void;
  onSaved: (project: AdminProject) => void;
}) {
  const t = useT();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [logoUrl, setLogoUrl] = useState(project?.logoUrl ?? "");
  const [level, setLevel] = useState<TrackLevel>(project?.level ?? "Beginner");
  const [weeks, setWeeks] = useState(project?.durationWeeks ?? 4);
  const [seats, setSeats] = useState<Partial<Record<SquadRole, number>>>(
    project ? parseSeats(project.seats) : { UIUX: 1, Frontend: 2, Backend: 2 },
  );
  const [links, setLinks] = useState<ProjectLink[]>(project?.links ?? [{ kind: "Chat", label: "", url: "" }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const locked = (project?.activeSquads ?? 0) > 0;
  const teamSize = SQUAD_ROLES.reduce((n, r) => n + (seats[r] ?? 0), 0);

  async function pickLogo(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setLogoUrl(await shrinkImage(file));
    } catch {
      setError(t("We couldn't read this image. Try a PNG or JPEG."));
    }
  }

  const setLink = (i: number, patch: Partial<ProjectLink>) => setLinks((all) => all.map((l, j) => (j === i ? { ...l, ...patch } : l)));

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (teamSize === 0) {
      setError(t("Add at least one seat to the team."));
      return;
    }
    setSaving(true);
    setError(null);
    const body = {
      title: title.trim(),
      description: description.trim(),
      logoUrl: logoUrl.trim() || null,
      level,
      seats: formatSeats(seats),
      durationWeeks: weeks,
      // Empty rows are left out.
      links: links.filter((l) => l.url.trim()).map((l) => ({ ...l, label: l.label.trim(), url: l.url.trim() })),
    };
    try {
      onSaved(project ? await updateProject(project.id, body) : await createProject(body));
      onClose();
    } catch (err) {
      setError(errorMessage(err, tk("We couldn't save the project. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminDialog open={open} title={project ? "Edit project" : "New Project Brief"} onClose={onClose}>
      <form onSubmit={submit} className="grid max-h-[72vh] gap-3 overflow-y-auto pe-1 text-[0.8rem]">
        <div className="flex items-start gap-3">
          <ProjectLogo src={logoUrl || null} title={title || "?"} className="size-16 text-[1.2rem]" />
          <div className="grid min-w-0 flex-1 gap-1.5">
            <span className="font-semibold">{t("Project logo")}</span>
            <div className="flex flex-wrap gap-2">
              <label className={`${BTN_SECONDARY} cursor-pointer`}>
                <ImagePlus className="size-4" /> {t("Upload image")}
                <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={pickLogo} className="sr-only" />
              </label>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl("")} className={BTN_SECONDARY}>
                  <X className="size-4" /> {t("Remove")}
                </button>
              )}
            </div>
            <input
              type="url"
              dir="ltr"
              placeholder={t("…or paste an image link")}
              value={logoUrl.startsWith("data:") ? "" : logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className={FIELD}
            />
          </div>
        </div>

        <label className="grid gap-1 font-semibold">
          {t("Project name")}
          <input required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} className={FIELD} />
        </label>
        <label className="grid gap-1 font-semibold">
          {t("Project description")}
          <textarea
            required
            maxLength={1000}
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${FIELD} h-auto py-2`}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 font-semibold">
            {t("Project level")}
            <select disabled={locked} value={level} onChange={(e) => setLevel(e.target.value as TrackLevel)} className={FIELD}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {t(l)}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 font-semibold">
            {t("Project time (weeks)")}
            <input
              type="number"
              required
              min={1}
              max={52}
              value={weeks}
              onChange={(e) => setWeeks(Math.max(1, Math.min(52, Number(e.target.value) || 1)))}
              className={FIELD}
            />
          </label>
        </div>

        <fieldset className="grid gap-2" disabled={locked}>
          <legend className="mb-1 flex w-full items-center justify-between font-semibold">
            <span>{t("Team")}</span>
            <span className="rounded-full bg-[#dbe8fb] px-2 py-0.5 text-[0.7rem] text-[#14365a]">{t("{n} members", { n: teamSize })}</span>
          </legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {SQUAD_ROLES.map((r) => (
              <label key={r} className="grid gap-1 text-[0.72rem] text-[#5b6b7c]">
                {t(r)}
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={seats[r] ?? 0}
                  onChange={(e) => setSeats((s) => ({ ...s, [r]: Math.max(0, Math.min(10, Number(e.target.value) || 0)) }))}
                  className={FIELD}
                />
              </label>
            ))}
          </div>
          {locked && (
            <p className="rounded-lg bg-[#fdf0d4] px-3 py-2 text-[0.72rem] font-semibold text-[#a8680c]">
              {t("A squad is building this project, so its level and team stay as they are.")}
            </p>
          )}
        </fieldset>

        <fieldset className="grid gap-2">
          <legend className="mb-1 font-semibold">{t("Project links")}</legend>
          <p className="-mt-1 text-[0.72rem] text-[#5b6b7c]">{t("The squad sees these when its project is revealed: the chat, the meetings, Figma and more.")}</p>
          {links.map((l, i) => (
            <div key={i} className="grid grid-cols-[8.5rem_minmax(0,1fr)_auto] gap-2 rounded-lg bg-[#f6f9fd] p-2">
              <select
                aria-label={t("Link type")}
                value={l.kind}
                onChange={(e) => setLink(i, { kind: e.target.value as ProjectLinkKind })}
                className={FIELD}
              >
                {PROJECT_LINK_KINDS.map((k) => (
                  <option key={k} value={k}>
                    {t(LINK_LABEL[k])}
                  </option>
                ))}
              </select>
              <input
                aria-label={t("Link name")}
                placeholder={t("Name (optional)")}
                maxLength={60}
                value={l.label}
                onChange={(e) => setLink(i, { label: e.target.value })}
                className={FIELD}
              />
              <button
                type="button"
                aria-label={t("Remove link")}
                onClick={() => setLinks((all) => all.filter((_, j) => j !== i))}
                className="grid size-9 place-items-center rounded-lg text-[#b83232] hover:bg-[#fdecec]"
              >
                <Trash2 className="size-4" />
              </button>
              <input
                type="url"
                dir="ltr"
                aria-label={t("Link")}
                placeholder={PLACEHOLDER[l.kind]}
                value={l.url}
                onChange={(e) => setLink(i, { url: e.target.value })}
                className={`${FIELD} col-span-3`}
              />
            </div>
          ))}
          {links.length < MAX_LINKS && (
            <button
              type="button"
              onClick={() => setLinks((all) => [...all, { kind: all.length === 0 ? "Chat" : "Meeting", label: "", url: "" }])}
              className={`${BTN_SECONDARY} justify-self-start`}
            >
              <Plus className="size-4" /> {t("Add link")}
            </button>
          )}
        </fieldset>

        {error && <p role="alert" className="rounded-lg bg-[#fdecec] px-3 py-2 font-semibold text-[#b83232]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            {t("Cancel")}
          </button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-4 animate-spin" />} {project ? t("Save changes") : t("Create project")}
          </button>
        </div>
      </form>
    </AdminDialog>
  );
}
