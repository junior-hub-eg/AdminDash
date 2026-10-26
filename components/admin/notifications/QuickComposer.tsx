"use client";

import { useState } from "react";
import { BellRing, GraduationCap, LoaderCircle, Mail, Monitor, Send, Zap } from "lucide-react";
import { createAnnouncement, updateAnnouncement, type AdminTrack, type Announcement, type AnnouncementAudience } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, INPUT, PANEL } from "../page-parts";

const AUDIENCES: AnnouncementAudience[] = ["Everyone", "Students", "Mentors", "Teachers"];
/** Only in-app delivery exists; email and push stay off until the backend sends them. */
const CHANNELS = [
  { key: "app", label: "In-App Notification", tag: "Real-time", icon: Monitor, ready: true },
  { key: "email", label: "Email Digest", tag: "Coming soon", icon: Mail, ready: false },
  { key: "push", label: "Push Mobile", tag: "Coming soon", icon: BellRing, ready: false },
];

/** "2026-10-26T09:00" for a datetime-local input, in local time. */
const toLocalInput = (iso: string | null) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
const fromLocalInput = (v: string) => (v ? new Date(v).toISOString() : null);

/** Writes (or edits) an announcement: audience, optional track, pin, schedule and expiry. Save Draft or publish. */
export function QuickComposer({
  editing,
  tracks,
  onSaved,
  onCancel,
}: {
  editing: Announcement | null;
  tracks: AdminTrack[];
  onSaved: (a: Announcement) => void;
  onCancel: () => void;
}) {
  const t = useT();
  const [title, setTitle] = useState(editing?.title ?? "");
  const [audience, setAudience] = useState<AnnouncementAudience>(editing?.audience ?? "Students");
  const [trackCode, setTrackCode] = useState(editing?.trackCode ?? "");
  const [message, setMessage] = useState(editing?.body ?? "");
  const [pinned, setPinned] = useState(editing?.isPinned ?? false);
  const [publishAt, setPublishAt] = useState(toLocalInput(editing?.publishAtUtc ?? null));
  const [expires, setExpires] = useState(toLocalInput(editing?.expiresUtc ?? null));
  const [saving, setSaving] = useState<"draft" | "send" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canSend = title.trim() !== "" && message.trim() !== "";

  async function save(isDraft: boolean) {
    setSaving(isDraft ? "draft" : "send");
    setError(null);
    try {
      const body = {
        title: title.trim(),
        body: message.trim(),
        audience,
        trackCode: audience === "Students" && trackCode ? trackCode : null,
        isPinned: pinned,
        isDraft,
        publishAtUtc: fromLocalInput(publishAt),
        expiresUtc: fromLocalInput(expires),
      };
      const saved = editing ? await updateAnnouncement(editing.id, body) : await createAnnouncement(body);
      onSaved(saved);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the announcement. Please try again.")));
      setSaving(null);
    }
  }

  const label = "block text-[0.78em] font-medium text-[#3d4f61]";
  const soft = "rounded-[0.6em] bg-[#eef3fb]";

  return (
    <section id="quick-composer" className={`${PANEL} min-w-0 p-[1.3em]`}>
      <header className="mb-[1.1em] flex items-start justify-between gap-[0.8em]">
        <h2 className="flex items-center gap-[0.7em] text-[1.1em] font-bold leading-tight text-[#0b1b2b]">
          <span className="grid size-[2.1em] shrink-0 place-items-center rounded-[0.6em] bg-[#e0f6fc] text-[#0b89a6]">
            <Zap className="size-[1.05em]" />
          </span>
          <span className="max-w-[6em]">{editing ? t("Edit Announcement") : t("Quick Composer")}</span>
        </h2>
        <span className="rounded-[0.3em] bg-[#e6eefb] px-[0.8em] py-[0.45em] text-[0.62em] font-semibold uppercase tracking-[0.08em] text-[#3d4f61]">
          {t("LIVE PREVIEW")}
        </span>
      </header>

      <label className={label}>
        {t("Title")}
        <input
          value={title}
          maxLength={150}
          onChange={(e) => setTitle(e.target.value)}
          className={`${soft} mt-[0.5em] h-[2.6em] w-full px-[0.8em] text-[1.15em] font-normal text-[#0b1b2b] outline-none focus:ring-2 focus:ring-[#06b6d4]/40`}
        />
      </label>

      <p className={`${label} mb-[0.5em] mt-[1.1em]`}>{t("Target Audience")}</p>
      <div className="flex flex-wrap gap-[0.45em] text-[0.72em]">
        {AUDIENCES.map((a) => (
          <button
            key={a}
            type="button"
            aria-pressed={audience === a}
            onClick={() => setAudience(a)}
            className={`rounded-[0.5em] px-[0.9em] py-[0.35em] font-semibold ${audience === a ? "bg-[#06b6d4] text-white" : "bg-[#e6eefb] text-[#14365a] hover:bg-[#dbe7f8]"}`}
          >
            {t(a)}
          </button>
        ))}
      </div>
      {audience === "Students" && (
        <label className={`${label} mt-[0.7em]`}>
          {t("Track")}
          <select value={trackCode} onChange={(e) => setTrackCode(e.target.value)} className={`${INPUT} mt-[0.3em] w-full`}>
            <option value="">{t("All students")}</option>
            {tracks.map((tr) => (
              <option key={tr.code} value={tr.code}>
                {tr.name}
              </option>
            ))}
          </select>
        </label>
      )}

      <p className={`${label} mb-[0.5em] mt-[1.1em]`}>{t("Delivery Channels")}</p>
      <ul className="grid gap-[0.45em] text-[0.75em]">
        {CHANNELS.map(({ key, label: name, tag, icon: Icon, ready }) => (
          <li key={key}>
            <label
              title={ready ? undefined : t("Coming soon")}
              className={`flex items-center gap-[0.7em] ${soft} px-[0.8em] py-[0.65em] ${ready ? "" : "cursor-not-allowed text-[#8a97a6]"}`}
            >
              <input type="checkbox" checked={ready} disabled readOnly className="size-[1.15em] accent-[#1d6fe0] disabled:opacity-100" />
              <Icon className={`size-[1.1em] ${ready ? "text-[#14365a]" : ""}`} />
              <span className={`flex-1 ${ready ? "text-[#14365a]" : ""}`}>{t(name)}</span>
              <span className="text-[0.9em] text-[#5b6b7c]">{t(tag)}</span>
            </label>
          </li>
        ))}
      </ul>

      <p className={`${label} mb-[0.5em] mt-[1.1em]`}>{t("Message Body & Tags")}</p>
      <div className="rounded-[0.8em] bg-[#eef3fb] p-[0.9em] text-[0.78em]">
        <p className="flex items-center justify-between font-semibold text-[#0b1b2b]">
          <span className="inline-flex items-center gap-[0.5em]">
            <span className="grid size-[1.9em] place-items-center rounded-full bg-[#dbe8fb] text-[#1d6fe0]">
              <GraduationCap className="size-[1em]" />
            </span>
            {t("Junior Hub Relay")}
          </span>
          <span className="text-[0.85em] font-normal text-[#8a97a6]">{publishAt ? t("Scheduled") : t("Just now")}</span>
        </p>
        <textarea
          aria-label={t("Message Body & Tags")}
          value={message}
          maxLength={4000}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={t("Write the message people will see...")}
          className="mt-[0.6em] w-full resize-y rounded-[0.5em] bg-transparent p-[0.2em] leading-relaxed text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:bg-white/60 focus:ring-2 focus:ring-[#06b6d4]/40"
        />
      </div>

      <div className="mt-[0.9em] grid gap-[0.6em] sm:grid-cols-2">
        <label className={label}>
          {t("Schedule (optional)")}
          <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={`${INPUT} mt-[0.3em] w-full`} />
        </label>
        <label className={label}>
          {t("Expires (optional)")}
          <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} className={`${INPUT} mt-[0.3em] w-full`} />
        </label>
      </div>
      <label className="mt-[0.7em] flex items-center gap-[0.5em] text-[0.78em] font-medium text-[#14365a]">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-[1.1em] accent-[#06b6d4]" />
        {t("Pin to the top")}
      </label>

      {error && <p role="alert" className="mt-[0.6em] rounded-lg bg-[#fdecec] px-3 py-2 text-[0.75em] font-semibold text-[#b83232]">{error}</p>}

      <div className="mt-[1.1em] grid grid-cols-2 gap-[0.6em]">
        <button
          type="button"
          disabled={!canSend || saving !== null}
          onClick={() => save(true)}
          className="inline-flex items-center justify-center gap-[0.5em] rounded-[0.6em] bg-[#e6eefb] py-[0.75em] text-[0.82em] font-semibold text-[#0b1b2b] hover:bg-[#dbe7f8] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving === "draft" && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save Draft")}
        </button>
        <button type="button" disabled={!canSend || saving !== null} onClick={() => save(false)} className={`${BTN_PRIMARY} !rounded-[0.6em]`}>
          {saving === "send" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Send className="size-[1em] rtl:-scale-x-100" />}{" "}
          {publishAt ? t("Schedule") : t("Send Broadcast")}
        </button>
      </div>
      {editing && (
        <button type="button" onClick={onCancel} className="mt-[0.6em] w-full text-center text-[0.75em] font-semibold text-[#5b6b7c] hover:underline">
          {t("Cancel editing")}
        </button>
      )}
    </section>
  );
}
