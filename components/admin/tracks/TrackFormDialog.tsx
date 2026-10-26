"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";
import { createTrack, updateTrack, TRACK_ICON_KEYS, type TrackInput } from "@/lib/admin-tracks-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, BTN_SECONDARY } from "../page-parts";
import { TrackIcon, type TrackItem } from "./track-data";

const FIELD =
  "w-full rounded-[0.7em] border border-[#e1e8f0] bg-white px-[0.9em] py-[0.6em] text-[0.9em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40";
const LABEL = "grid gap-[0.3em] text-[0.8em] font-semibold text-[#14365a]";

/**
 * Create a track (POST /admin/tracks) or edit one (PUT /admin/tracks/{id}). The API does not return a
 * track's discovery profile, so on edit the admin writes it again.
 */
export function TrackFormDialog({
  open,
  onClose,
  onSaved,
  edit,
  nextOrder,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  /** The track to edit; create when missing. */
  edit?: TrackItem | null;
  /** Default sort order for a new track. */
  nextOrder: number;
}) {
  const t = useT();
  const ref = useRef<HTMLDialogElement>(null);
  const [code, setCode] = useState("");
  const [form, setForm] = useState<TrackInput>({ name: "", shortDescription: "", discoveryProfile: "", iconKey: "monitor", sortOrder: nextOrder, hasLessons: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) {
      setError(null);
      setCode(edit?.track.code ?? "");
      setForm({
        name: edit?.track.name ?? "",
        shortDescription: edit?.info?.shortDescription ?? "",
        discoveryProfile: "",
        iconKey: edit?.info?.iconKey || "monitor",
        sortOrder: edit ? edit.order : nextOrder,
        hasLessons: edit?.info?.hasLessons ?? false,
      });
      d.showModal();
    } else if (!open && d.open) {
      d.close();
    }
  }, [open, edit, nextOrder]);

  const set = <K extends keyof TrackInput>(k: K, v: TrackInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const body = { ...form, name: form.name.trim(), shortDescription: form.shortDescription.trim(), discoveryProfile: form.discoveryProfile.trim() };
    try {
      if (edit) await updateTrack(edit.track.id, body);
      else await createTrack({ ...body, code: code.trim().toUpperCase() });
      onSaved();
      onClose();
    } catch (err) {
      setError(
        err instanceof ApiError && err.code === "TRACK_CODE_TAKEN"
          ? t("A track with this code already exists.")
          : err instanceof ApiError && err.code === "TRACK_HAS_LESSONS"
            ? t("Lessons can't be turned off while the track has lessons.")
            : errorMessage(err, tk("We couldn't save the track. Please try again.")),
      );
    } finally {
      setSaving(false);
    }
  }


  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-labelledby="track-form-title"
      className="m-auto w-[min(34em,calc(100vw-2em))] rounded-[1.2em] bg-white p-0 text-[#14365a] shadow-[0_20px_60px_rgba(11,27,43,0.25)] backdrop:bg-[#0b1b2b]/40"
    >
      <form onSubmit={submit} className="grid max-h-[85vh] gap-[0.9em] overflow-y-auto p-[1.4em]">
        <header className="flex items-center justify-between gap-[1em]">
          <h2 id="track-form-title" className="inline-flex items-center gap-[0.6em] text-[1.2em] font-bold text-[#0b1b2b]">
            <span className="grid size-[2em] place-items-center rounded-[0.6em] bg-[#e0f6fc] text-[#0b89a6]">
              <TrackIcon iconKey={form.iconKey} className="size-[1em]" />
            </span>
            {edit ? t("Edit Track Details") : t("Create Track")}
          </h2>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-[2em] place-items-center rounded-full hover:bg-[#f1f6fb]">
            <X className="size-[1.1em]" />
          </button>
        </header>

        <div className="grid gap-[0.9em] sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
          <label className={LABEL}>
            {t("Code")}
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              disabled={Boolean(edit)}
              required
              maxLength={20}
              pattern="[A-Za-z][A-Za-z0-9_]*"
              dir="ltr"
              placeholder="CYBER"
              className={`${FIELD} uppercase disabled:bg-[#f4f7fb]`}
            />
          </label>
          <label className={LABEL}>
            {t("Name")}
            <input value={form.name} onChange={(e) => set("name", e.target.value)} required maxLength={60} className={FIELD} />
          </label>
        </div>

        <label className={LABEL}>
          {t("Short description")}
          <textarea value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} required maxLength={200} rows={2} className={FIELD} />
        </label>

        <label className={LABEL}>
          {t("Discovery profile")}
          <textarea
            value={form.discoveryProfile}
            onChange={(e) => set("discoveryProfile", e.target.value)}
            required
            maxLength={2000}
            rows={4}
            placeholder={t("What kind of student fits this track? The discovery interview uses this text.")}
            className={FIELD}
          />
          {edit && <span className="text-[0.9em] font-normal text-[#8a97a6]">{t("The current profile isn't shown here; write it again to save.")}</span>}
        </label>

        <div className="grid gap-[0.9em] sm:grid-cols-2">
          <label className={LABEL}>
            {t("Icon")}
            <select value={form.iconKey} onChange={(e) => set("iconKey", e.target.value)} className={FIELD}>
              {TRACK_ICON_KEYS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
              {!TRACK_ICON_KEYS.includes(form.iconKey as (typeof TRACK_ICON_KEYS)[number]) && <option value={form.iconKey}>{form.iconKey}</option>}
            </select>
          </label>
          <label className={LABEL}>
            {t("Sort order")}
            <input type="number" min={0} value={form.sortOrder} onChange={(e) => set("sortOrder", Math.max(0, Number(e.target.value) || 0))} className={FIELD} />
          </label>
        </div>

        <label className="flex items-center gap-[0.6em] text-[0.85em] font-semibold">
          <input type="checkbox" checked={form.hasLessons} onChange={(e) => set("hasLessons", e.target.checked)} className="size-[1.1em] accent-[#06b6d4]" />
          {t("This track has lessons")}
        </label>

        {error && (
          <p role="alert" className="rounded-[0.6em] bg-[#fdecec] px-[0.9em] py-[0.6em] text-[0.8em] font-semibold text-[#b83232]">
            {error}
          </p>
        )}

        <footer className="flex flex-wrap justify-end gap-[0.6em]">
          <button type="button" onClick={onClose} className={BTN_SECONDARY}>
            {t("Cancel")}
          </button>
          <button type="submit" disabled={saving} className={BTN_PRIMARY}>
            {saving && <LoaderCircle className="size-[1em] animate-spin" />}
            {edit ? t("Save Changes") : t("Create Track")}
          </button>
        </footer>
      </form>
    </dialog>
  );
}
