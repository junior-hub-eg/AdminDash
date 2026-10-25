"use client";

import { useState, type FormEvent } from "react";
import { LoaderCircle } from "lucide-react";
import { createSquad, SQUAD_ROLES, type AdminMentor, type AdminSquad, type SquadRole, type TrackLevel } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";

const LEVELS: TrackLevel[] = ["Beginner", "Intermediate", "Advanced"];

/** "+ Create Squad": name, project, level, seats per role and an optional monitor (POST admin/squads). */
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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      });
      onCreated(squad);
      setName("");
      setProjectTitle("");
      setProjectDescription("");
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
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1 font-semibold">
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

        <fieldset className="grid gap-2">
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
