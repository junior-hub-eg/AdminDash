"use client";

import { useCallback, useState, type FormEvent } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Database,
  Download,
  Gauge,
  KeyRound,
  Lock,
  Monitor,
  Power,
  ShieldCheck,
  Timer,
  UserCheck,
} from "lucide-react";
import { ApiError, errorMessage } from "@/lib/api-client";
import {
  AUDIT_MODULES,
  changeAdminPassword,
  downloadAuditCsv,
  getAuditLog,
  revokeAdminSession,
  type AdminSecurityOverview,
  type AdminSession,
  type AuditFilter,
  type AuditSeverity,
} from "@/lib/admin-security-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog, FIELD } from "../AdminPageFrame";
import { LoadState, useAdminData } from "../admin-data";
import { BTN_PRIMARY, BTN_SECONDARY, INPUT } from "../page-parts";
import { DASH, Empty, Initials, Pill, Section, fmt } from "../reports/ui";
import { ago, deviceOf, moduleLabel, SEVERITIES, SEVERITY_LABEL, SeverityPill, stamp, summaryOf } from "./audit-ui";

const PAGE_SIZE = 15;

const RANGES = [
  { id: "24h", label: tk("Last 24 Hours"), hours: 24 },
  { id: "7d", label: tk("Last 7 Days"), hours: 24 * 7 },
  { id: "30d", label: tk("Last 30 Days"), hours: 24 * 30 },
  { id: "all", label: tk("All time"), hours: 0 },
] as const;
type Range = (typeof RANGES)[number]["id"];

/** Immutable Admin Event Log: GET admin/audit with filters, pages and the CSV export. */
export function EventLog({ now }: { now: number }) {
  const t = useT();
  const [module, setModule] = useState("");
  const [severity, setSeverity] = useState<"" | AuditSeverity>("");
  const [actor, setActor] = useState("");
  const [range, setRange] = useState<Range>("7d");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const hours = RANGES.find((r) => r.id === range)?.hours ?? 0;
  const filter: AuditFilter = {
    module: module || undefined,
    severity: severity || undefined,
    actor: actor.trim() || undefined,
    fromUtc: hours ? new Date(now - hours * 3600_000).toISOString() : undefined,
  };
  const key = JSON.stringify(filter);
  // eslint-disable-next-line react-hooks/exhaustive-deps -- the filter is captured through its JSON key
  const load = useCallback(() => getAuditLog({ ...filter, page, pageSize: PAGE_SIZE }), [key, page]);
  const log = useAdminData(load, tk("We couldn't load the audit log. Please try again."));

  const pages = log.data ? Math.max(1, Math.ceil(log.data.total / PAGE_SIZE)) : 1;
  const reset = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setPage(1);
  };

  async function exportCsv() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadAuditCsv(filter);
    } catch (e) {
      setExportError(errorMessage(e, tk("We couldn't export the audit log. Please try again.")));
    } finally {
      setExporting(false);
    }
  }

  return (
    <Section
      icon={Database}
      title={t("Immutable Admin Event Log")}
      description={t("Every administrative action, who made it and from where.")}
      aside={
        <button type="button" onClick={exportCsv} disabled={exporting} className={BTN_SECONDARY}>
          <Download className="size-[1.1em]" /> {t("Export CSV")}
        </button>
      }
    >
      <div className="mt-[1em] grid gap-[0.6em] sm:grid-cols-2 xl:grid-cols-4">
        <input
          type="search"
          value={actor}
          onChange={(e) => reset(setActor)(e.target.value)}
          placeholder={t("All Administrators")}
          aria-label={t("Search by admin name")}
          className={`${INPUT} w-full`}
        />
        <select value={module} onChange={(e) => reset(setModule)(e.target.value)} aria-label={t("Filter by module")} className={`${INPUT} w-full`}>
          <option value="">{t("All modules")}</option>
          {AUDIT_MODULES.map((m) => (
            <option key={m} value={m}>
              {moduleLabel(t, m)}
            </option>
          ))}
        </select>
        <select
          value={severity}
          onChange={(e) => reset(setSeverity)(e.target.value as "" | AuditSeverity)}
          aria-label={t("Severity")}
          className={`${INPUT} w-full`}
        >
          <option value="">{t("Severity: All Levels")}</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {t(SEVERITY_LABEL[s])}
            </option>
          ))}
        </select>
        <select value={range} onChange={(e) => reset(setRange)(e.target.value as Range)} aria-label={t("Time range")} className={`${INPUT} w-full`}>
          {RANGES.map((r) => (
            <option key={r.id} value={r.id}>
              {t(r.label)}
            </option>
          ))}
        </select>
      </div>
      {exportError && <p role="alert" className="mt-[0.6em] text-[0.75em] font-semibold text-[#b83232]">{exportError}</p>}

      <div className="mt-[1em] overflow-x-auto rounded-[0.8em] bg-white">
        <table className="w-full min-w-[46em] text-[0.75em]">
          <thead>
            <tr className="text-[0.85em] uppercase tracking-[0.05em] text-[#5b6b7c]">
              {[tk("Timestamp"), tk("Administrator"), tk("Module"), tk("Action description"), tk("IP & Client")].map((h) => (
                <th key={h} className="px-[0.9em] py-[0.8em] text-start font-bold">
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e6edf3]">
            {!log.data && (
              <tr>
                <td colSpan={5}>
                  <LoadState error={log.error} onRetry={log.reload} />
                </td>
              </tr>
            )}
            {log.data?.items.length === 0 && (
              <tr>
                <td colSpan={5} className="p-[0.8em]">
                  <Empty icon={Database} title={t("No audit events recorded yet")} text={t("Admin actions matching these filters will appear here.")} />
                </td>
              </tr>
            )}
            {log.data?.items.map((e) => (
              <tr key={e.id} className="align-top">
                <td className="px-[0.9em] py-[0.8em]">
                  <span className="block font-semibold text-[#0b1b2b]">{ago(t, e.createdUtc, now)}</span>
                  <span className="block text-[0.9em] text-[#8a97a6]">{stamp(e.createdUtc)}</span>
                </td>
                <td className="px-[0.9em] py-[0.8em]">
                  <span className="flex items-center gap-[0.6em]">
                    <Initials name={e.actorName} />
                    <span className="min-w-0">
                      <span className="block font-semibold text-[#0b1b2b]">{e.actorName === "Anonymous" ? t("Anonymous") : e.actorName}</span>
                      {e.actorRole && <span className="block text-[0.9em] text-[#8a97a6]">{t(e.actorRole)}</span>}
                    </span>
                  </span>
                </td>
                <td className="px-[0.9em] py-[0.8em]">
                  <span className="block font-semibold text-[#14365a]">{moduleLabel(t, e.module)}</span>
                  <SeverityPill severity={e.severity} />
                </td>
                <td className="px-[0.9em] py-[0.8em]">
                  <span className="block text-[#0b1b2b]">{summaryOf(t, e)}</span>
                  <span dir="ltr" className="block break-all font-mono text-[0.85em] text-[#8a97a6] rtl:text-end">
                    {e.action}
                  </span>
                </td>
                <td className="px-[0.9em] py-[0.8em] text-[#5b6b7c]">
                  <span dir="ltr" className="block font-mono rtl:text-end">
                    {e.ip ?? DASH}
                  </span>
                  <span className="block text-[0.9em] text-[#8a97a6]">{deviceOf(t, e.userAgent)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-[0.8em] flex flex-wrap items-center justify-between gap-[0.6em] text-[0.72em] text-[#5b6b7c]">
        <p>{t("Showing {count} of {total} events", { count: log.data?.items.length ?? 0, total: fmt(log.data?.total ?? 0) })}</p>
        <Pager page={page} pages={pages} onChange={setPage} />
      </div>
    </Section>
  );
}

/** Previous / next with "Page 2 of 5". */
export function Pager({ page, pages, onChange }: { page: number; pages: number; onChange: (page: number) => void }) {
  const t = useT();
  if (pages <= 1) return null;
  return (
    <span className="flex items-center gap-[0.5em]">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label={t("Previous page")}
        className="grid size-[2.2em] place-items-center rounded-[0.6em] border border-[#dfe7f1] bg-white disabled:opacity-40"
      >
        <ChevronLeft className="size-[1.1em] rtl:rotate-180" />
      </button>
      <span>{t("Page {page} of {pages}", { page, pages })}</span>
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pages}
        aria-label={t("Next page")}
        className="grid size-[2.2em] place-items-center rounded-[0.6em] border border-[#dfe7f1] bg-white disabled:opacity-40"
      >
        <ChevronRight className="size-[1.1em] rtl:rotate-180" />
      </button>
    </span>
  );
}

/** Admin sessions that stay signed in ("Remember me"), each with a revoke button. */
export function SessionList({
  sessions,
  error,
  onRetry,
  onRevoked,
  now,
  compact = false,
}: {
  sessions: AdminSession[] | null;
  error: string | null;
  onRetry: () => void;
  onRevoked: () => void;
  now: number;
  compact?: boolean;
}) {
  const t = useT();
  const [busy, setBusy] = useState<string | null>(null);
  const [failed, setFailed] = useState<string | null>(null);

  async function revoke(ids: string[]) {
    setFailed(null);
    for (const id of ids) {
      setBusy(id);
      try {
        await revokeAdminSession(id);
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) setFailed(errorMessage(e, tk("We couldn't end this session. Please try again.")));
      }
    }
    setBusy(null);
    onRevoked();
  }

  if (!sessions) return <LoadState error={error} onRetry={onRetry} className="mt-[1em]" />;
  const others = sessions.filter((s) => !s.isCurrent);

  return (
    <>
      {failed && <p role="alert" className="mt-[0.8em] text-[0.75em] font-semibold text-[#b83232]">{failed}</p>}
      {sessions.length === 0 ? (
        <Empty
          icon={Monitor}
          title={t("No active admin sessions")}
          text={t("Sessions appear here when an admin signs in with \"Remember me\".")}
          className="mt-[1em]"
        />
      ) : (
        <ul className="mt-[1em] space-y-[0.7em]">
          {sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-[0.7em] rounded-[0.8em] bg-[#f5f8fe] p-[0.8em]">
              <Initials name={s.fullName} />
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-[0.4em] text-[0.85em] font-semibold text-[#0b1b2b]">
                  {s.fullName}
                  {s.isCurrent && <Pill tone="green">{t("This device")}</Pill>}
                </p>
                <p className="text-[0.7em] text-[#5b6b7c]">
                  {deviceOf(t, s.userAgent)} · <span dir="ltr">{s.ip ?? DASH}</span>
                </p>
                {!compact && (
                  <p className="text-[0.7em] text-[#8a97a6]">
                    {t("Signed in {when}", { when: ago(t, s.createdUtc, now) })} · {t("Ends {date}", { date: stamp(s.expiresUtc) })}
                  </p>
                )}
              </div>
              <button type="button" onClick={() => revoke([s.id])} disabled={busy !== null} className={BTN_SECONDARY}>
                <Power className="size-[1em]" /> {t("Revoke")}
              </button>
            </li>
          ))}
        </ul>
      )}
      {compact && (
        <button type="button" disabled={others.length === 0 || busy !== null} onClick={() => revoke(others.map((s) => s.id))} className={`${BTN_SECONDARY} mt-[0.9em] w-full`}>
          <Power className="size-[1.1em]" /> {t("Revoke All Other Sessions")}
        </button>
      )}
    </>
  );
}

/** Active Inspector: the admin sessions in the side column. */
export function ActiveInspector(props: {
  sessions: AdminSession[] | null;
  error: string | null;
  onRetry: () => void;
  onRevoked: () => void;
  now: number;
}) {
  const t = useT();
  return (
    <Section icon={Monitor} title={t("Active Inspector")} description={t("Admin sessions that stay signed in on a device.")}>
      <SessionList {...props} compact />
    </Section>
  );
}

export const POLICIES = [
  { id: "timeout", icon: Timer, title: tk("Inactivity Timeout"), text: tk("Signs out idle admin sessions automatically.") },
  { id: "password", icon: KeyRound, title: tk("Password Complexity"), text: tk("Minimum length, symbols and breach checks for admin passwords.") },
  { id: "sso", icon: UserCheck, title: tk("Single Sign-On (SSO)"), text: tk("Sign in to the admin panel with your organisation account.") },
  { id: "lockout", icon: Gauge, title: tk("Account Lockout"), text: tk("Locks an account after repeated failed sign-ins.") },
] as const;

/** What each policy is set to on the server, or "—" when there is no such rule. */
export function policyStatus(t: ReturnType<typeof useT>, id: (typeof POLICIES)[number]["id"], overview: AdminSecurityOverview | null) {
  if (!overview) return DASH;
  switch (id) {
    case "timeout":
      return t("{count} days (Remember me)", { count: overview.sessionDays });
    case "password":
      return t("{count}+ chars, letters, numbers, symbol", { count: overview.passwordMinLength });
    case "lockout":
      return t("{count} attempts → {minutes} min", { count: overview.lockoutMaxAttempts, minutes: overview.lockoutMinutes });
    default:
      return DASH;
  }
}

/** Hardening Status: each policy and what the server enforces. */
export function HardeningStatus({ overview }: { overview: AdminSecurityOverview | null }) {
  const t = useT();
  return (
    <Section icon={ShieldCheck} title={t("Hardening Status")}>
      <ul className="mt-[1em] space-y-[0.9em]">
        {POLICIES.map((p) => {
          const status = policyStatus(t, p.id, overview);
          return (
            <li key={p.id} className="flex items-start gap-[0.7em]">
              <p.icon className="mt-[0.15em] size-[1.1em] shrink-0 text-[#0b89a6]" />
              <div className="min-w-0 flex-1">
                <p className="text-[0.85em] font-semibold text-[#0b1b2b]">{t(p.title)}</p>
                <p className="text-[0.7em] text-[#8a97a6]">{t(p.text)}</p>
              </div>
              <span
                className={`max-w-[9em] rounded-[0.5em] px-[0.7em] py-[0.2em] text-end text-[0.72em] font-bold ${
                  status === DASH ? "bg-[#eef2f7] text-[#5b6b7c]" : "bg-[#dff7ea] text-[#17935f]"
                }`}
              >
                {status}
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

/** Your account: change the admin password (PUT admin/me/password). */
export function AccountSecurity({ overview, now, onChanged }: { overview: AdminSecurityOverview | null; now: number; onChanged: () => void }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const close = useCallback(() => {
    setOpen(false);
    setCurrent("");
    setNext("");
    setConfirm("");
    setError(null);
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (next !== confirm) {
      setError(t("Passwords don't match."));
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await changeAdminPassword(current, next);
      setDone(true);
      close();
      onChanged();
    } catch (err) {
      const fields = err instanceof ApiError ? Object.values(err.fieldErrors) : [];
      setError(fields.length ? t(fields[0]) : errorMessage(err, tk("We couldn't change the password. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  const changed = overview?.passwordChangedUtc;
  return (
    <Section icon={Lock} title={t("Password & Security")} description={t("Change the password of your admin account.")}>
      <div className="mt-[1em] flex flex-wrap items-center justify-between gap-[0.6em] rounded-[0.8em] bg-[#f1f6fb] px-[0.9em] py-[0.7em]">
        <span className="text-[0.72em] text-[#5b6b7c]">
          {done ? t("Password changed.") : changed ? t("Last changed {when}", { when: ago(t, changed, now) }) : t("Last changed: {when}", { when: DASH })}
        </span>
        <button type="button" onClick={() => setOpen(true)} className={BTN_SECONDARY}>
          <KeyRound className="size-[1.05em]" /> {t("Change Password")}
        </button>
      </div>

      <AdminDialog open={open} title={tk("Change Password")} onClose={close}>
        <form onSubmit={submit} className="space-y-3 text-sm">
          {[
            { id: "current", label: tk("Current password"), value: current, set: setCurrent, auto: "current-password" },
            { id: "new", label: tk("New password"), value: next, set: setNext, auto: "new-password" },
            { id: "confirm", label: tk("Confirm new password"), value: confirm, set: setConfirm, auto: "new-password" },
          ].map((f) => (
            <label key={f.id} className="block">
              <span className="mb-1 block text-[0.72rem] font-semibold text-[#14365a]/70">{t(f.label)}</span>
              <input
                type="password"
                required
                autoComplete={f.auto}
                value={f.value}
                onChange={(e) => f.set(e.target.value)}
                className={FIELD}
              />
            </label>
          ))}
          <p className="text-[0.7rem] text-[#14365a]/60">
            {t("At least {count} characters, with letters, numbers and a special character. Your other sessions will be signed out.", {
              count: overview?.passwordMinLength ?? 8,
            })}
          </p>
          {error && (
            <p role="alert" className="text-[0.75rem] font-semibold text-[#b83232]">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={close} className={BTN_SECONDARY}>
              {t("Cancel")}
            </button>
            <button type="submit" disabled={saving} className={BTN_PRIMARY}>
              {t("Change Password")}
            </button>
          </div>
        </form>
      </AdminDialog>
    </Section>
  );
}
