"use client";

import {
  CalendarDays,
  Database,
  Gauge,
  KeyRound,
  Lock,
  Monitor,
  Power,
  ShieldCheck,
  Timer,
  UserCheck,
} from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_SECONDARY, INPUT } from "../page-parts";
import { DASH, Empty, Section, Soon } from "../reports/ui";

const EVENT_FILTERS = [tk("All Administrators"), tk("All Action Types"), tk("Severity: All Levels")];

/** Immutable Admin Event Log: the designed table, empty until the backend records admin actions. */
export function EventLog() {
  const t = useT();
  return (
    <Section
      icon={Database}
      title={t("Immutable Admin Event Log")}
      description={t("Every administrative action, who made it and from where.")}
      aside={<Soon />}
    >
      <div className="mt-[1em] grid gap-[0.6em] sm:grid-cols-2 xl:grid-cols-4">
        {EVENT_FILTERS.map((f) => (
          <select key={f} disabled aria-label={t(f)} className={`${INPUT} w-full disabled:opacity-60`}>
            <option>{t(f)}</option>
          </select>
        ))}
        <span className={`${INPUT} flex w-full items-center justify-between opacity-60`}>
          {t("Last 24 Hours")} <CalendarDays className="size-[1.1em]" />
        </span>
      </div>

      <div className="mt-[1em] overflow-x-auto rounded-[0.8em] bg-white">
        <table className="w-full min-w-[40em] text-[0.75em]">
          <thead>
            <tr className="text-[0.85em] uppercase tracking-[0.05em] text-[#5b6b7c]">
              {[tk("Timestamp / Hash"), tk("Administrator"), tk("Module"), tk("Action description"), tk("IP & Client")].map((h) => (
                <th key={h} className="px-[0.9em] py-[0.8em] text-start font-bold">
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={5} className="p-[0.8em]">
                <Empty
                  icon={Database}
                  title={t("No audit events recorded yet")}
                  text={t("Admin actions will appear here once audit logging is enabled on the server.")}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-[0.8em] text-[0.72em] text-[#5b6b7c]">{t("Showing {count} verified events", { count: 0 })}</p>
    </Section>
  );
}

/** Active Inspector: live admin sessions (no session store yet). */
export function ActiveInspector() {
  const t = useT();
  return (
    <Section
      icon={Monitor}
      title={t("Active Inspector")}
      description={t("Authorized administrative sessions with active write scopes.")}
      aside={<Soon />}
    >
      <Empty
        icon={Monitor}
        title={t("Session tracking is not available yet")}
        text={t("Signed-in devices, locations and idle time will be listed here.")}
        className="mt-[1em]"
      />
      <button type="button" disabled className={`${BTN_SECONDARY} mt-[0.9em] w-full`}>
        <Power className="size-[1.1em]" /> {t("Revoke All Other Sessions")}
      </button>
    </Section>
  );
}

export const POLICIES = [
  { icon: Timer, title: tk("Inactivity Timeout"), text: tk("Signs out idle admin sessions automatically.") },
  { icon: KeyRound, title: tk("Password Complexity"), text: tk("Minimum length, symbols and breach checks for admin passwords.") },
  { icon: UserCheck, title: tk("Single Sign-On (SSO)"), text: tk("Sign in to the admin panel with your organisation account.") },
  { icon: Gauge, title: tk("API Rate Limiter"), text: tk("Limits repeated requests and blocks brute-force attempts.") },
] as const;

/** Hardening Status: each policy and its state ("—" until the server reports it). */
export function HardeningStatus() {
  const t = useT();
  return (
    <Section icon={ShieldCheck} title={t("Hardening Status")} aside={<Soon />}>
      <ul className="mt-[1em] space-y-[0.9em]">
        {POLICIES.map((p) => (
          <li key={p.title} className="flex items-start gap-[0.7em]">
            <p.icon className="mt-[0.15em] size-[1.1em] shrink-0 text-[#0b89a6]" />
            <div className="min-w-0 flex-1">
              <p className="text-[0.85em] font-semibold text-[#0b1b2b]">{t(p.title)}</p>
              <p className="text-[0.7em] text-[#8a97a6]">{t(p.text)}</p>
            </div>
            <span className="rounded-[0.5em] bg-[#eef2f7] px-[0.7em] py-[0.2em] text-[0.72em] font-bold text-[#5b6b7c]">{DASH}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** Your account: changing the admin password needs an endpoint that does not exist yet. */
export function AccountSecurity() {
  const t = useT();
  return (
    <Section icon={Lock} title={t("Password & Security")} description={t("Change the password of your admin account.")}>
      <div className="mt-[1em] flex flex-wrap items-center justify-between gap-[0.6em] rounded-[0.8em] bg-[#f1f6fb] px-[0.9em] py-[0.7em]">
        <Soon />
        <button type="button" disabled className={BTN_SECONDARY}>
          <KeyRound className="size-[1.05em]" /> {t("Change Password")}
        </button>
      </div>
    </Section>
  );
}
