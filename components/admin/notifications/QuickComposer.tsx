"use client";

import { useState } from "react";
import { BellRing, GraduationCap, LoaderCircle, Mail, Monitor, Send, Zap } from "lucide-react";
import { createAnnouncement, updateAnnouncement, type AdminTrack, type Announcement, type AnnouncementAudience } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "../page-parts";
import { Section } from "../mentor-detail/parts";

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
  const [done, setDone] = useState<string | null>(null);

  const canSend = title.trim() !== "" && message.trim() !== "";

  async function save(isDraft: boolean) {
    setSaving(isDraft ? "draft" : "send");
    setError(null);
    setDone(null);
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

  const label = "block text-[0.75em] font-semibold text-[#5b6b7c]";

  return (
    <div id="quick-composer">
      <Section
        title={editing ? t("Edit Announcement") : t("Quick Composer")}
        action={<span className="rounded-[0.4em] bg-[#eef3fa] px-[0.7em] py-[0.3em] text-[0.65em] font-bold text-[#5b6b7c]">{t("LIVE PREVIEW")}</span>}
      >
        <label className={label}>
          {t("Title")}
          <input value={title} maxLength={150} onChange={(e) => setTitle(e.target.value)} className={`${INPUT} mt-[0.3em] w-full !text-[1.1em]`} />
        </label>

        <p className="mb-[0.4em] mt-[1em] text-[0.75em] font-semibold text-[#5b6b7c]">{t("Target Audience")}</p>
        <div className="flex flex-wrap gap-[0.4em] text-[0.75em]">
          {AUDIENCES.map((a) => (
            <button
              key={a}
              type="button"
              aria-pressed={audience === a}
              onClick={() => setAudience(a)}
              className={`rounded-full px-[1em] py-[0.35em] font-semibold ${audience === a ? "bg-[#06b6d4] text-white" : "bg-[#eef3fa] text-[#14365a]"}`}
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

        <p className="mb-[0.4em] mt-[1em] text-[0.75em] font-semibold text-[#5b6b7c]">{t("Delivery Channels")}</p>
        <ul className="grid gap-[0.4em] text-[0.8em]">
          {CHANNELS.map(({ key, label: name, tag, icon: Icon, ready }) => (
            <li key={key}>
              <label className={`flex items-center gap-[0.7em] rounded-[0.6em] bg-[#f1f5fd] px-[0.8em] py-[0.6em] ${ready ? "" : "opacity-60"}`}>
                <input type="checkbox" checked={ready} disabled readOnly className="size-[1.1em] accent-[#1d6fe0]" />
                <Icon className="size-[1.1em] text-[#14365a]" />
                <span className="flex-1 text-[#14365a]">{t(name)}</span>
                <span className="text-[0.85em] text-[#8a97a6]">{t(tag)}</span>
              </label>
            </li>
          ))}
        </ul>

        <label className={`${label} mt-[1em]`}>
          {t("Message Body & Tags")}
          <textarea
            value={message}
            maxLength={4000}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="mt-[0.3em] w-full rounded-[0.7em] border border-[#e1e8f0] bg-white p-[0.8em] text-[1.05em] font-normal text-[#14365a] outline-none focus:ring-2 focus:ring-[#06b6d4]/40"
          />
        </label>

        <div className="mt-[0.8em] grid grid-cols-2 gap-[0.6em]">
          <label className={label}>
            {t("Schedule (optional)")}
            <input type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className={`${INPUT} mt-[0.3em] w-full`} />
          </label>
          <label className={label}>
            {t("Expires (optional)")}
            <input type="datetime-local" value={expires} onChange={(e) => setExpires(e.target.value)} className={`${INPUT} mt-[0.3em] w-full`} />
          </label>
        </div>
        <label className="mt-[0.7em] flex items-center gap-[0.5em] text-[0.78em] font-semibold text-[#14365a]">
          <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="size-[1.1em] accent-[#06b6d4]" />
          {t("Pin to the top")}
        </label>

        <div className="mt-[0.8em] rounded-[0.9em] bg-[#f1f5fd] p-[1em] text-[0.8em]">
          <p className="flex items-center justify-between font-semibold text-[#0b1b2b]">
            <span className="inline-flex items-center gap-[0.5em]">
              <span className="grid size-[1.8em] place-items-center rounded-full bg-[#dbe8fb] text-[#1d6fe0]">
                <GraduationCap className="size-[1em]" />
              </span>
              Junior Hub
            </span>
            <span className="text-[0.85em] font-normal text-[#8a97a6]">{publishAt ? t("Scheduled") : t("Just now")}</span>
          </p>
          <p className="mt-[0.5em] font-semibold text-[#14365a]">{title || t("Title")}</p>
          <p className="mt-[0.2em] whitespace-pre-line text-[#14365a]">{message}</p>
        </div>

        {error && <p role="alert" className="mt-[0.6em] rounded-lg bg-[#fdecec] px-3 py-2 text-[0.75em] font-semibold text-[#b83232]">{error}</p>}

        <div className="mt-[1em] grid grid-cols-2 gap-[0.6em]">
          <button type="button" disabled={!canSend || saving !== null} onClick={() => save(true)} className={`${BTN_SECONDARY} !bg-[#eef3fa]`}>
            {saving === "draft" && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save Draft")}
          </button>
          <button type="button" disabled={!canSend || saving !== null} onClick={() => save(false)} className={BTN_PRIMARY}>
            {saving === "send" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Send className="size-[1em]" />}{" "}
            {publishAt ? t("Schedule") : t("Send Broadcast")}
          </button>
        </div>
        {editing && (
          <button type="button" onClick={onCancel} className="mt-[0.6em] w-full text-center text-[0.75em] font-semibold text-[#5b6b7c] hover:underline">
            {t("Cancel editing")}
          </button>
        )}
        {done && (
          <p role="status" className="mt-[0.6em] text-center text-[0.75em] text-[#12676b]">
            <Zap className="me-[0.3em] inline size-[1em]" />
            {done}
          </p>
        )}
      </Section>
    </div>
  );
}
