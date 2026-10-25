"use client";

import { useState, type FormEvent } from "react";

import { useI18n } from "@/lib/i18n/client";
import { AdminBody, AdminHero, AdminPage } from "./page-parts";
import { AdminDialog, FIELD } from "./AdminPageFrame";

type Session = {
  id: number;
  device: string;
  place: string;
  minutesAgo: number;
  current?: boolean;
};

// Mock data: replace with your API call (e.g. getSessions()).
const SESSIONS: Session[] = [
  { id: 1, device: "Chrome on macOS", place: "Alexandria, Egypt", minutesAgo: 0, current: true },
  { id: 2, device: "Safari on iPhone", place: "Alexandria, Egypt", minutesAgo: 120 },
];

type TFn = (key: string, vars?: Record<string, string | number>) => string;

function ago(t: TFn, minutes: number) {
  if (minutes < 60) return t("{count}m ago", { count: minutes });
  if (minutes < 1440) return t("{count}h ago", { count: Math.floor(minutes / 60) });
  const days = Math.floor(minutes / 1440);

  return days === 1 ? t("Yesterday") : t("{count}d ago", { count: days });
}

const glass =
  "rounded-[1.1em] border border-white/70 bg-white/80 p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.1)] backdrop-blur-[6px]";

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
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
  );
}

export default function AdminSecurity() {
  const { t } = useI18n();

  const [twoFactor, setTwoFactor] = useState(true);
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [changed, setChanged] = useState(false);

  const openDialog = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    setChanged(false);
    setOpen(true);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();

    if (!current || !next || !confirm) return setError("Please fill in all fields.");
    if (next.length < 8) return setError("The new password must be at least 8 characters.");
    if (next !== confirm) return setError("The passwords do not match.");

    // TODO: send { current, next } to the API here
    setOpen(false);
    setChanged(true);
  };

  return (
    <AdminPage>
      {/* Tall hero: the cards sit on top of its bottom edge */}
      <AdminHero className="min-h-[calc(var(--u)*22)]">
        <h1 className="text-[1.9em] font-extrabold leading-none text-[#0f7378] sm:text-[2.2em] xl:text-[2.5em]">
          {t("Security & Login History")}
        </h1>
      </AdminHero>

      <AdminBody className="relative z-10 -mt-[calc(var(--u)*4)]">
        <div className="mx-auto w-full lg:w-[74%]">
          <div className="grid items-start gap-[1.2em] lg:grid-cols-2">
            {/* Two-factor authentication */}
            <section className={glass}>
              <h2 className="text-[1.15em] font-semibold text-[#0b1b2b]">{t("Two-Factor Authentication (2FA)")}</h2>

              <div className="mt-[0.6em] flex items-center justify-between gap-[1em]">
                <p className="text-[0.85em] text-[#14365a]">{t("Add an extra layer of security to your account")}</p>
                <Switch checked={twoFactor} onChange={setTwoFactor} label={t("Two-Factor Authentication (2FA)")} />
              </div>
            </section>

            {/* Active sessions */}
            <section className={glass}>
              <h2 className="text-[1.15em] font-semibold text-[#0b1b2b]">{t("Active Sessions & Devices")}</h2>

              <ul className="mt-[0.6em] divide-y divide-[#14365a]/10">
                {SESSIONS.map((s) => (
                  <li key={s.id} className="py-[0.55em] text-[0.85em] text-[#14365a]">
                    {t(s.device)} — {t(s.place)}{" "}
                    <span className="text-[#14365a]/70">
                      ({s.current ? t("Current Session") : ago(t, s.minutesAgo)})
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          {/* Password */}
          <div className="mx-auto mt-[1.4em] flex max-w-[24em] items-center justify-between gap-[1em] rounded-full border border-white/70 bg-white/85 py-[0.6em] ps-[1.6em] pe-[0.7em] shadow-[0_6px_22px_rgba(20,54,90,0.1)] backdrop-blur-[6px]">
            <h2 className="text-[1.1em] font-semibold text-[#0b1b2b]">{t("Password & Security")}</h2>

            <button
              type="button"
              onClick={openDialog}
              className="rounded-full bg-[#14365a] px-[1.1em] py-[0.5em] text-[0.75em] font-semibold text-white hover:bg-[#0f2a47]"
            >
              {t("Change Password")}
            </button>
          </div>

          {changed && (
            <p role="status" className="mt-[0.8em] text-center text-[0.8em] font-medium text-[#1a7f55]">
              {t("Password updated")}
            </p>
          )}
        </div>
      </AdminBody>

      <AdminDialog open={open} title="Change Password" onClose={() => setOpen(false)}>
        <form onSubmit={submit} className="space-y-3 text-sm">
          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Current password")}</span>
            <input
              type="password"
              autoComplete="current-password"
              value={current}
              onChange={(e) => setCurrent(e.target.value)}
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("New password")}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              className={FIELD}
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-[0.72rem] font-medium">{t("Confirm new password")}</span>
            <input
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={FIELD}
            />
          </label>

          {error && (
            <p role="alert" className="text-[0.75rem] font-medium text-[#e0245e]">
              {t(error)}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#1d5bd8] px-4 py-2 text-[0.75rem] font-semibold text-white hover:bg-[#1749ad]"
            >
              {t("Change Password")}
            </button>
          </div>
        </form>
      </AdminDialog>
    </AdminPage>
  );
}