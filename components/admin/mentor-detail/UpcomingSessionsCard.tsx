"use client";

import { useState } from "react";
import { CalendarX2, ExternalLink, LoaderCircle, Video } from "lucide-react";
import { cancelMentorSession, type AdminSession } from "@/lib/admin-mentor-sessions-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { LoadState } from "../admin-data";
import { EmptyNote, Section } from "./parts";
import { dayTime, time } from "./format";

/** The mentor's next sessions; the admin can cancel one with a reason (the student and the mentor are told). */
export function UpcomingSessionsCard({
  mentorId,
  sessions,
  error,
  onRetry,
  onCancelled,
}: {
  mentorId: string;
  sessions: AdminSession[] | null;
  error: string | null;
  onRetry: () => void;
  onCancelled: () => void;
}) {
  const t = useT();
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState<string | null>(null);

  async function confirm(id: string) {
    setBusy(true);
    setFailure(null);
    try {
      await cancelMentorSession(mentorId, id, reason.trim());
      setCancelling(null);
      setReason("");
      onCancelled();
    } catch (e) {
      setFailure(errorMessage(e, tk("We couldn't cancel the session. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title={t("Upcoming Sessions")} icon={<Video className="size-[1.1em]" />}>
      {!sessions ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : sessions.length === 0 ? (
        <EmptyNote icon={<CalendarX2 className="size-[1.6em]" />} text={t("No upcoming sessions")} />
      ) : (
        <ul className="grid gap-[0.7em]">
          {sessions.map((s) => (
            <li key={s.id} className="rounded-[0.8em] border border-[#eef2f6] p-[0.8em] text-[0.78em]">
              <div className="flex items-start justify-between gap-[0.6em]">
                <div className="min-w-0">
                  <p className="truncate font-bold text-[#0b1b2b]">{s.title || (s.type === "Group" ? t("Group session") : t("1:1 session"))}</p>
                  <p className="text-[#5b6b7c]">
                    {dayTime(s.startsUtc)} – {time(s.endsUtc)}
                  </p>
                  <p className="truncate text-[#14365a]">
                    {s.squadName ? `${s.squadName} · ` : ""}
                    {s.students.map((x) => x.fullName).join(", ")}
                  </p>
                </div>
                {s.meetingLink && (
                  <a
                    href={s.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex shrink-0 items-center gap-[0.3em] rounded-[0.5em] bg-[#e6f1fb] px-[0.7em] py-[0.3em] font-semibold text-[#0b6f86] hover:bg-[#d6e8f8]"
                  >
                    <ExternalLink className="size-[0.95em]" /> {t("Join")}
                  </a>
                )}
              </div>
              {cancelling === s.id ? (
                <div className="mt-[0.6em] grid gap-[0.4em]">
                  <input
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    maxLength={300}
                    placeholder={t("Reason (shown to the student and the mentor)")}
                    className="rounded-[0.5em] border border-[#d5dfea] px-[0.6em] py-[0.35em] text-[#0b1b2b]"
                  />
                  <div className="flex gap-[0.4em]">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => void confirm(s.id)}
                      className="inline-flex items-center gap-[0.3em] rounded-[0.5em] bg-[#b83232] px-[0.8em] py-[0.3em] font-semibold text-white disabled:opacity-50"
                    >
                      {busy && <LoaderCircle className="size-[1em] animate-spin" />} {t("Cancel session")}
                    </button>
                    <button type="button" onClick={() => setCancelling(null)} className="rounded-[0.5em] px-[0.8em] py-[0.3em] font-semibold text-[#14365a] hover:bg-[#f1f6fb]">
                      {t("Keep it")}
                    </button>
                  </div>
                  {failure && (
                    <p role="alert" className="text-[#b83232]">
                      {failure}
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCancelling(s.id);
                    setReason("");
                    setFailure(null);
                  }}
                  className="mt-[0.4em] font-semibold text-[#b83232] hover:underline"
                >
                  {t("Cancel session")}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
