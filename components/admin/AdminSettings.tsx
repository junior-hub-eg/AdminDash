"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AtSign,
  BadgeCheck,
  BellRing,
  Building2,
  CloudUpload,
  Globe,
  History,
  LoaderCircle,
  RotateCcw,
  SlidersHorizontal,
  Undo2,
  Users,
  Webhook,
  CircleCheck,
} from "lucide-react";
import { getPlatformSettings, savePlatformSettings, type PlatformSettings } from "@/lib/admin-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, PageHeader, PANEL } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { Pill, Section, Switch, TabBar } from "./reports/ui";
import { BOX, Field } from "./settings/fields";
import { Integrations, Localization, RuntimeEnvironment, SquadRules, VisualIdentity } from "./settings/SoonSections";

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

type Tab = "general" | "controls" | "squads" | "localization" | "integrations";
const TAB_TARGET: Record<Tab, string> = {
  general: "settings-general",
  controls: "settings-controls",
  squads: "settings-squads",
  localization: "settings-localization",
  integrations: "settings-integrations",
};

export default function AdminSettings() {
  const t = useT();
  const loaded = useAdminData(getPlatformSettings, tk("We couldn't load the settings. Please try again."));

  if (!loaded.data) {
    return (
      <AdminSurface>
        <PageHeader eyebrow={t("System preferences")} title={t("Platform Settings")} />
        <LoadState error={loaded.error} onRetry={loaded.reload} />
      </AdminSurface>
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
  const [tab, setTab] = useState<Tab>("general");

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

  const discard = () => {
    setForm(saved);
    setFieldErrors({});
    setError(null);
  };

  const fieldError = (key: string) => {
    const message = Object.entries(fieldErrors).find(([k]) => k.toLowerCase() === key.toLowerCase())?.[1];
    return message ? t(message) : null;
  };

  const goTo = (id: Tab) => {
    setTab(id);
    document.getElementById(TAB_TARGET[id])?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const savedAt = saved.updatedUtc
    ? new Date(saved.updatedUtc).toLocaleString(dateLocale("en-GB"), { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  const saveButton = (label: string) => (
    <button type="button" onClick={save} disabled={!dirty || saving} className={BTN_PRIMARY}>
      {saving ? <LoaderCircle className="size-[1.1em] animate-spin" /> : <CloudUpload className="size-[1.1em]" />} {label}
    </button>
  );

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("System preferences")}
        title={t("Platform Settings")}
        description={t("Configure global system preferences, branding, squad parameters, localization, notifications and integrations.")}
        actions={
          <>
            <Link href="/admin/activity-log" className={BTN_SECONDARY}>
              <History className="size-[1.1em]" /> {t("Audit Log")}
            </Link>
            {saveButton(t("Save All Changes"))}
          </>
        }
      />

      <TabBar<Tab>
        label={t("Settings sections")}
        value={tab}
        onChange={goTo}
        tabs={[
          { id: "general", label: t("General & Branding"), icon: SlidersHorizontal },
          { id: "controls", label: t("Access & Notifications"), icon: BellRing },
          { id: "squads", label: t("Squad Rules"), icon: Users },
          { id: "localization", label: t("Localization & Languages"), icon: Globe },
          { id: "integrations", label: t("Integrations"), icon: Webhook },
        ]}
      />

      {form.maintenanceMode && saved.maintenanceMode && (
        <p role="status" className="rounded-[0.9em] bg-[#fdf0d4] px-[1em] py-[0.7em] text-[0.85em] font-semibold text-[#a8680c]">
          {t("Maintenance mode is on: only admins can use Junior Hub right now.")}
        </p>
      )}

      <div className="grid items-start gap-[1.4em] xl:grid-cols-[minmax(0,1fr)_22em]">
        <div className="flex min-w-0 flex-col gap-[1.4em]">
          {/* General Platform Information (saved) */}
          <Section
            id="settings-general"
            icon={Building2}
            title={t("General Platform Information")}
            description={t("Platform identity, support contact and the master timezone.")}
            aside={<Pill tone="violet">{t("Global tenant")}</Pill>}
          >
            <div className="mt-[1.2em] grid gap-[1em] md:grid-cols-2">
              <Field label={t("Platform Name")} error={fieldError("platformName")}>
                <span className={BOX}>
                  <input
                    value={form.platformName}
                    onChange={(e) => set("platformName", e.target.value)}
                    placeholder={t("Platform Name")}
                    className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8a97a6]"
                  />
                  {form.platformName.trim() && <BadgeCheck className="size-[1.1em] shrink-0 text-[#14b8a6]" />}
                </span>
              </Field>

              <Field label={t("Official Tagline / Mission")} soon>
                <span className={BOX}>
                  <input disabled placeholder="—" className="min-w-0 flex-1 bg-transparent outline-none" />
                </span>
              </Field>

              <div className="md:col-span-2">
                <Field
                  label={t("Support & Admin Email")}
                  hint={t("This address is shown to users who need help.")}
                  error={fieldError("supportEmail")}
                >
                  <span className={BOX}>
                    <AtSign className="size-[1em] shrink-0 text-[#8a97a6]" />
                    <input
                      type="email"
                      dir="ltr"
                      value={form.supportEmail}
                      onChange={(e) => set("supportEmail", e.target.value)}
                      placeholder="support@example.com"
                      className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8a97a6] rtl:text-end"
                    />
                  </span>
                </Field>
              </div>

              <Field label={t("Default Timezone")} error={fieldError("timeZone")}>
                <span className={BOX}>
                  <select
                    value={form.timeZone}
                    onChange={(e) => set("timeZone", e.target.value)}
                    className="min-w-0 flex-1 cursor-pointer bg-transparent outline-none"
                  >
                    {(TIMEZONES.includes(form.timeZone) ? TIMEZONES : [form.timeZone, ...TIMEZONES]).map((tz) => (
                      <option key={tz} value={tz}>
                        {t(tz)}
                      </option>
                    ))}
                  </select>
                </span>
              </Field>

              <Field label={t("Date Format Presentation")} soon>
                <span className={BOX}>
                  <select disabled className="min-w-0 flex-1 bg-transparent outline-none">
                    <option>—</option>
                  </select>
                </span>
              </Field>
            </div>
          </Section>

          {/* The three switches (saved) */}
          <Section
            id="settings-controls"
            icon={BellRing}
            title={t("Access & Notifications")}
            description={t("These take effect as soon as you save.")}
            aside={<Pill tone="green">{t("Live")}</Pill>}
          >
            <ul className="mt-[1.2em] grid gap-[0.9em] md:grid-cols-3">
              {(
                [
                  ["maintenanceMode", tk("Maintenance Mode"), tk("Only admins can use the site while it is on")],
                  [
                    "allowStudentRegistration",
                    tk("Allow Student Registration"),
                    tk("New students can create accounts (monitors and teachers wait for approval anyway)"),
                  ],
                  ["emailNotifications", tk("Email notifications"), tk("Send approval emails; sign-up and password codes are always sent")],
                ] as const
              ).map(([key, label, hint]) => (
                <li key={key} className="flex items-start justify-between gap-[0.8em] rounded-[0.9em] bg-[#f3f7fc] p-[1em]">
                  <div className="min-w-0">
                    <p className="text-[0.85em] font-bold text-[#0b1b2b]">{t(label)}</p>
                    <p className="mt-[0.2em] text-[0.7em] text-[#8a97a6]">{t(hint)}</p>
                  </div>
                  <Switch checked={form[key]} onChange={(v) => set(key, v)} label={t(label)} />
                </li>
              ))}
            </ul>
          </Section>

          <SquadRules />
          <Localization />
          <Integrations />
        </div>

        <aside className="flex min-w-0 flex-col gap-[1.4em]">
          <VisualIdentity platformName={form.platformName} />
          <RuntimeEnvironment />
        </aside>
      </div>

      {error && (
        <p role="alert" className="rounded-[0.9em] bg-[#fdecec] px-[1em] py-[0.7em] text-center text-[0.85em] font-semibold text-[#b83232]">
          {error}
        </p>
      )}

      {/* Save bar */}
      <div className={`${PANEL} sticky bottom-[1em] z-20 flex flex-wrap items-center justify-between gap-[0.8em] px-[1.1em] py-[0.8em]`}>
        <p className="flex items-center gap-[0.5em] text-[0.75em] text-[#5b6b7c]" role="status">
          {justSaved && !dirty ? (
            <>
              <CircleCheck className="size-[1.1em] text-[#17935f]" /> {t("Saved")}
            </>
          ) : dirty ? (
            t("You have unsaved changes.")
          ) : savedAt ? (
            t("Last saved {date}", { date: savedAt })
          ) : (
            t("No unsaved changes.")
          )}
        </p>
        <div className="flex flex-wrap gap-[0.6em]">
          <button type="button" onClick={reset} className={BTN_SECONDARY}>
            <RotateCcw className="size-[1.05em]" /> {t("Reset defaults")}
          </button>
          <button type="button" onClick={discard} disabled={!dirty || saving} className={BTN_SECONDARY}>
            <Undo2 className="size-[1.05em]" /> {t("Discard Changes")}
          </button>
          {saveButton(t("Save Changes"))}
        </div>
      </div>
    </AdminSurface>
  );
}
