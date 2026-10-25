"use client";

import { useState, type ReactNode } from "react";
import { Globe, LoaderCircle, Mail, Tag } from "lucide-react";
import { getPlatformSettings, savePlatformSettings, type PlatformSettings } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { LoadState, useAdminData } from "./admin-data";

/** What "Reset defaults" puts back (the same defaults as the backend). */
const DEFAULTS: PlatformSettings = {
  platformName: "Junior Hub",
  supportEmail: "support@junior-hub.com",
  timeZone: "(UTC+02:00) Cairo",
  maintenanceMode: false,
  allowStudentRegistration: true,
  emailNotifications: true,
};

/** The value is what is saved; the label is translated when shown. */
const TIMEZONES = [
  tk("(UTC+02:00) Cairo"),
  tk("(UTC+00:00) London"),
  tk("(UTC+03:00) Riyadh"),
  tk("(UTC+04:00) Dubai"),
  tk("(UTC-05:00) New York"),
];

/** Only the fields the form edits, to compare with what is saved. */
const editable = (s: PlatformSettings) =>
  JSON.stringify([s.platformName, s.supportEmail, s.timeZone, s.maintenanceMode, s.allowStudentRegistration, s.emailNotifications]);

const glass = "rounded-[1.1em] border border-white/60 bg-white/75 p-[1.3em] shadow-[0_6px_22px_rgba(20,54,90,0.1)] backdrop-blur-[6px]";
const field =
  "flex h-[2.4em] items-center gap-[0.6em] rounded-full bg-[#b7dcd8]/80 px-[1em] text-[0.8em] text-[#14365a] focus-within:ring-2 focus-within:ring-[#12939b]/40";

function Field({ label, icon, children }: { label: string; icon: ReactNode; children: ReactNode }) {
  return (
    <label className="block">
      <span className="text-[0.95em] font-medium text-[#0b1b2b]">{label}</span>
      <span className={`mt-[0.4em] ${field}`}>
        <span className="shrink-0 text-[#14365a]/60">{icon}</span>
        {children}
      </span>
    </label>
  );
}

function Toggle({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-[1em] py-[0.55em]">
      <div className="min-w-0">
        <p className="text-[0.95em] font-medium text-[#0b1b2b]">{label}</p>
        <p className="text-[0.7em] text-[#14365a]/70">{hint}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-[1.5em] w-[2.6em] shrink-0 rounded-full transition-colors ${
          checked ? "bg-[#34c759]" : "bg-[#b8c4d0]"
        }`}
      >
        <span
          className={`absolute top-[0.2em] size-[1.1em] rounded-full bg-white shadow transition-all ${
            checked ? "start-[1.4em]" : "start-[0.2em]"
          }`}
        />
      </button>
    </div>
  );
}

export default function AdminSettings() {
  const t = useT();
  const loaded = useAdminData(getPlatformSettings, tk("We couldn't load the settings. Please try again."));

  if (!loaded.data) {
    return (
      <AdminPage>
        <PageHero title={t("System Settings")} contentClassName="pb-[3em]" />
        <LoadState error={loaded.error} onRetry={loaded.reload} className="mt-[1.5em]" />
      </AdminPage>
    );
  }
  return <SettingsForm initial={loaded.data} />;
}

/** The form starts from what is saved, and keeps the last saved values to know what changed. */
function SettingsForm({ initial }: { initial: PlatformSettings }) {
  const t = useT();
  const [saved, setSaved] = useState(initial);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const dirty = editable(form) !== editable(saved);
  const set = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setJustSaved(false);
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const result = await savePlatformSettings(form);
      setSaved(result);
      setForm(result);
      setJustSaved(true);
    } catch (e) {
      if (e instanceof ApiError && e.code === "VALIDATION_FAILED") setFieldErrors(e.fieldErrors);
      setError(errorMessage(e, tk("We couldn't save the settings. Please try again.")));
    } finally {
      setSaving(false);
    }
  };

  const reset = () => {
    setForm({ ...DEFAULTS });
    setJustSaved(false);
  };

  const fieldError = (key: string) => {
    const message = Object.entries(fieldErrors).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
    return message ? <span className="mt-[0.3em] block text-[0.75em] text-[#b83232]">{t(message)}</span> : null;
  };

  return (
    <AdminPage>
      {/* The hero is taller at the bottom so the cards can sit on top of it */}
      <PageHero title={t("System Settings")} contentClassName="pb-[10em] lg:pb-[11em]" />

      <div className="relative z-10 mx-auto -mt-[7.5em] w-full lg:-mt-[8.5em] lg:w-[72%]">
        {form.maintenanceMode && saved.maintenanceMode && (
          <p role="status" className="mb-[1em] rounded-[0.9em] bg-[#fdeec2] px-[1em] py-[0.6em] text-[0.85em] font-semibold text-[#a8740a]">
            {t("Maintenance mode is on: only admins can use Junior Hub right now.")}
          </p>
        )}
        <div className="grid gap-[1.2em] lg:grid-cols-2">
          {/* Platform profile */}
          <section className={glass}>
            <h2 className="text-[1.2em] font-semibold text-[#0b1b2b]">{t("Platform Profile")}</h2>
            <div className="mt-[0.8em] space-y-[0.9em]">
              <div>
                <Field label={t("Platform Name")} icon={<Tag className="size-[1em]" />}>
                  <input
                    value={form.platformName}
                    onChange={(e) => set("platformName", e.target.value)}
                    placeholder={t("Platform Name")}
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#14365a]/50"
                  />
                </Field>
                {fieldError("platformName")}
              </div>

              <div>
                <Field label={t("Support Email")} icon={<Mail className="size-[1em]" />}>
                  <input
                    type="email"
                    dir="ltr"
                    value={form.supportEmail}
                    onChange={(e) => set("supportEmail", e.target.value)}
                    placeholder="support@example.com"
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#14365a]/50"
                  />
                </Field>
                {fieldError("supportEmail")}
              </div>

              <Field label={t("Timezone")} icon={<Globe className="size-[1em]" />}>
                <select
                  value={form.timeZone}
                  onChange={(e) => set("timeZone", e.target.value)}
                  className="min-w-0 flex-1 cursor-pointer bg-transparent outline-none"
                  dir="ltr"
                >
                  {(TIMEZONES.includes(form.timeZone) ? TIMEZONES : [form.timeZone, ...TIMEZONES]).map((tz) => (
                    <option key={tz} value={tz}>
                      {t(tz)}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </section>

          {/* System controls */}
          <section className={glass}>
            <h2 className="text-[1.2em] font-semibold text-[#0b1b2b]">{t("System Controls")}</h2>
            <div className="mt-[0.5em] divide-y divide-[#14365a]/10">
              <Toggle
                label={t("Maintenance Mode")}
                hint={t("Only admins can use the site while it is on")}
                checked={form.maintenanceMode}
                onChange={(v) => set("maintenanceMode", v)}
              />
              <Toggle
                label={t("Allow Student Registration")}
                hint={t("New students can create accounts (monitors and teachers wait for approval anyway)")}
                checked={form.allowStudentRegistration}
                onChange={(v) => set("allowStudentRegistration", v)}
              />
              <Toggle
                label={t("Email notifications")}
                hint={t("Send approval emails; sign-up and password codes are always sent")}
                checked={form.emailNotifications}
                onChange={(v) => set("emailNotifications", v)}
              />
            </div>
          </section>
        </div>

        {error && (
          <p role="alert" className="mt-[1em] rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.6em] text-center text-[0.85em] font-semibold text-[#b83232]">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="mt-[1.2em] flex flex-wrap items-center justify-center gap-[0.8em] rounded-full border border-white/60 bg-white/70 px-[1.2em] py-[0.6em] shadow-[0_6px_22px_rgba(20,54,90,0.08)] backdrop-blur-[6px]">
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="inline-flex items-center gap-[0.4em] rounded-full bg-[#3d4f7c] px-[1.6em] py-[0.55em] text-[0.95em] font-medium text-white shadow-sm transition hover:bg-[#2f3f66] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving && <LoaderCircle className="size-[1em] animate-spin" />} {t("Save Changes")}
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-[#14365a]/40 bg-white/60 px-[1.4em] py-[0.55em] text-[0.95em] font-medium text-[#14365a] hover:bg-white"
          >
            {t("Reset defaults")}
          </button>
          {justSaved && !dirty && (
            <span role="status" className="text-[0.8em] font-medium text-[#1a7f55]">
              {t("Saved")}
            </span>
          )}
        </div>
      </div>
    </AdminPage>
  );
}
