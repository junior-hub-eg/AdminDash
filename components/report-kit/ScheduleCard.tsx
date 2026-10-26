"use client";

/**
 * ScheduleCard: "Email me this report" settings.
 *   value: ReportScheduleValue | null (null = loading), error: string | null, onRetry: load again.
 *   onSave(settings) → Promise<ReportScheduleValue>: saves; the returned value refreshes next send time.
 *   onSendNow() → Promise<void>: sends the report at once.
 *   Both callbacks reject with an Error whose message is shown to the user.
 *   Form: enable switch, Weekly / Monthly, day of week (0 = Sunday) or day of month (1-28), language,
 *   plus the email it goes to, the last and next send time.
 */

import { useState } from "react";
import { CalendarClock, CheckCircle2, LoaderCircle, Mail, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { ReportCard, StateBlock } from "./ReportCard";
import { BTN_PRIMARY, BTN_SECONDARY, FIELD } from "./tokens";

export type ReportScheduleValue = {
  enabled: boolean;
  frequency: "Weekly" | "Monthly";
  dayOfWeek: number;
  dayOfMonth: number;
  language: "en" | "ar";
  email: string | null;
  lastSentUtc: string | null;
  nextSendUtc: string | null;
};

export type ReportScheduleInput = Pick<ReportScheduleValue, "enabled" | "frequency" | "dayOfWeek" | "dayOfMonth" | "language">;

const DAYS = [tk("Sunday"), tk("Monday"), tk("Tuesday"), tk("Wednesday"), tk("Thursday"), tk("Friday"), tk("Saturday")];

export function ScheduleCard({
  value,
  error,
  onRetry,
  onSave,
  onSendNow,
  title,
  description,
}: {
  value: ReportScheduleValue | null;
  error: string | null;
  onRetry: () => void;
  onSave: (settings: ReportScheduleInput) => Promise<ReportScheduleValue>;
  onSendNow: () => Promise<void>;
  title?: string;
  description?: string;
}) {
  const { t } = useI18n();
  return (
    <ReportCard
      icon={CalendarClock}
      title={title ?? t("Email schedule")}
      description={description ?? t("Get a summary of this report by email, every week or month.")}
      className="print:hidden"
    >
      {value ? <ScheduleForm initial={value} onSave={onSave} onSendNow={onSendNow} /> : <StateBlock error={error} onRetry={onRetry} />}
    </ReportCard>
  );
}

function ScheduleForm({
  initial,
  onSave,
  onSendNow,
}: {
  initial: ReportScheduleValue;
  onSave: (settings: ReportScheduleInput) => Promise<ReportScheduleValue>;
  onSendNow: () => Promise<void>;
}) {
  const { t, intl } = useI18n();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState<ReportScheduleInput>({
    enabled: initial.enabled,
    frequency: initial.frequency,
    dayOfWeek: initial.dayOfWeek,
    dayOfMonth: Math.min(28, Math.max(1, initial.dayOfMonth || 1)),
    language: initial.language,
  });
  const [busy, setBusy] = useState<"save" | "send" | null>(null);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);

  const dirty =
    form.enabled !== saved.enabled ||
    form.frequency !== saved.frequency ||
    form.dayOfWeek !== saved.dayOfWeek ||
    form.dayOfMonth !== saved.dayOfMonth ||
    form.language !== saved.language;

  const set = <K extends keyof ReportScheduleInput>(key: K, v: ReportScheduleInput[K]) => {
    setNote(null);
    setForm((f) => ({ ...f, [key]: v }));
  };

  const when = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString(intl, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : t("Not yet");

  const save = async () => {
    setBusy("save");
    setNote(null);
    try {
      const next = await onSave(form);
      setSaved(next);
      setNote({ ok: true, text: t("Schedule saved.") });
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error && e.message ? e.message : t("We couldn't save the schedule. Please try again.") });
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    setBusy("send");
    setNote(null);
    try {
      await onSendNow();
      setNote({ ok: true, text: t("The report is on its way to {email}.", { email: saved.email ?? "" }) });
    } catch (e) {
      setNote({ ok: false, text: e instanceof Error && e.message ? e.message : t("We couldn't send the report. Please try again.") });
    } finally {
      setBusy(null);
    }
  };

  const label = "flex min-w-0 flex-col gap-[0.35em] text-[0.7em] font-semibold text-[#5b6b7c]";

  return (
    <div className="mt-[1em] grid gap-[1em] lg:grid-cols-[1fr_auto]">
      <div className="grid gap-[0.9em] rounded-[0.9em] bg-[#f1f6fb] p-[1em] sm:grid-cols-2 xl:grid-cols-4">
        <div className="flex items-center justify-between gap-[0.8em] sm:col-span-2 xl:col-span-4">
          <span className="text-[0.82em] font-semibold text-[#0b1b2b]">{t("Send this report by email")}</span>
          <button
            type="button"
            role="switch"
            aria-checked={form.enabled}
            aria-label={t("Send this report by email")}
            onClick={() => set("enabled", !form.enabled)}
            className={`relative h-[1.5em] w-[2.7em] shrink-0 rounded-full transition-colors ${form.enabled ? "bg-[#06b6d4]" : "bg-[#c4cfdb]"}`}
          >
            <span className={`absolute top-[0.2em] size-[1.1em] rounded-full bg-white shadow transition-all ${form.enabled ? "start-[1.4em]" : "start-[0.2em]"}`} />
          </button>
        </div>

        <fieldset className={label} disabled={!form.enabled}>
          <legend className="mb-[0.35em]">{t("How often")}</legend>
          <div className="flex gap-[0.3em] rounded-[0.7em] bg-white p-[0.2em]">
            {(["Weekly", "Monthly"] as const).map((f) => (
              <button
                key={f}
                type="button"
                aria-pressed={form.frequency === f}
                onClick={() => set("frequency", f)}
                className={`flex-1 rounded-[0.55em] px-[0.8em] py-[0.45em] text-[1.1em] font-semibold disabled:opacity-60 ${
                  form.frequency === f ? "bg-[#13233a] text-[#5ee0f5]" : "text-[#14365a] hover:bg-[#f1f6fb]"
                }`}
              >
                {t(f)}
              </button>
            ))}
          </div>
        </fieldset>

        {form.frequency === "Weekly" ? (
          <label className={label}>
            {t("Day of the week")}
            <select disabled={!form.enabled} value={form.dayOfWeek} onChange={(e) => set("dayOfWeek", Number(e.target.value))} className={`${FIELD} text-[1.1em]`}>
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {t(d)}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <label className={label}>
            {t("Day of the month")}
            <select disabled={!form.enabled} value={form.dayOfMonth} onChange={(e) => set("dayOfMonth", Number(e.target.value))} className={`${FIELD} text-[1.1em]`}>
              {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </label>
        )}

        <label className={label}>
          {t("Report language")}
          <select disabled={!form.enabled} value={form.language} onChange={(e) => set("language", e.target.value as "en" | "ar")} className={`${FIELD} text-[1.1em]`}>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </label>

        <div className="flex items-end">
          <button type="button" onClick={save} disabled={!dirty || busy != null} className={`${BTN_PRIMARY} w-full`}>
            {busy === "save" ? <LoaderCircle className="size-[1em] animate-spin" /> : <CheckCircle2 className="size-[1em]" />}
            {t("Save schedule")}
          </button>
        </div>
      </div>

      <aside className="flex min-w-[15em] flex-col gap-[0.6em] rounded-[0.9em] border border-[#e6edf3] p-[1em] text-[0.75em]">
        <p className="flex items-center gap-[0.5em] text-[#5b6b7c]">
          <Mail className="size-[1.1em] shrink-0 text-[#0b89a6]" />
          <span className="min-w-0">
            {t("Sent to")} <b className="break-all text-[#0b1b2b]">{saved.email ?? t("No email on your account")}</b>
          </span>
        </p>
        <dl className="grid grid-cols-[auto_1fr] gap-x-[0.8em] gap-y-[0.3em]">
          <dt className="text-[#8a97a6]">{t("Next send")}</dt>
          <dd className="font-semibold text-[#0b1b2b]">{saved.enabled ? when(saved.nextSendUtc) : t("Off")}</dd>
          <dt className="text-[#8a97a6]">{t("Last sent")}</dt>
          <dd className="font-semibold text-[#0b1b2b]">{when(saved.lastSentUtc)}</dd>
        </dl>
        <button type="button" onClick={send} disabled={busy != null || !saved.email} className={`${BTN_SECONDARY} mt-auto`}>
          {busy === "send" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Send className="size-[1em]" />}
          {t("Email it now")}
        </button>
      </aside>

      {note && (
        <p role={note.ok ? "status" : "alert"} className={`text-[0.75em] font-semibold lg:col-span-2 ${note.ok ? "text-[#17935f]" : "text-[#c03d3d]"}`}>
          {note.text}
        </p>
      )}
    </div>
  );
}
