"use client";

import { useState } from "react";
import {
  BellRing,
  Download,
  FileClock,
  Fingerprint,
  Laptop,
  LogIn,
  MonitorSmartphone,
  ScrollText,
  ShieldAlert,
  ShieldCheck,
  ShieldHalf,
  UserCog,
} from "lucide-react";
import { downloadAuditCsv, getAdminSessions, getSecurityOverview } from "@/lib/admin-security-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, PageHeader, StatCard, StatGrid } from "./page-parts";
import { useAdminData } from "./admin-data";
import { DASH, Section, TabBar, fmt } from "./reports/ui";
import { AdminSignIns } from "./security/AdminSignIns";
import { AccountSecurity, ActiveInspector, EventLog, HardeningStatus, POLICIES, policyStatus, SessionList } from "./security/SecurityPanels";

type Tab = "audit" | "sessions" | "logins" | "policies";

export default function AdminSecurity() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("audit");
  const [now] = useState(() => Date.now());
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const overview = useAdminData(getSecurityOverview, tk("We couldn't load the security overview. Please try again."));
  const sessions = useAdminData(getAdminSessions, tk("We couldn't load the admin sessions. Please try again."));

  const o = overview.data;
  const refreshSessions = () => {
    sessions.reload();
    overview.reload();
  };

  async function exportLog() {
    setExporting(true);
    setExportError(null);
    try {
      await downloadAuditCsv();
    } catch (e) {
      setExportError(errorMessage(e, tk("We couldn't export the audit log. Please try again.")));
    } finally {
      setExporting(false);
    }
  }

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Shield active")}
        title={t("Security & Access Monitoring")}
        description={t("Monitor administrative sessions, audit system actions, review admin sign-ins and security policies across Junior Hub.")}
        actions={
          <>
            <button type="button" onClick={exportLog} disabled={exporting} title={exportError ?? undefined} className={BTN_SECONDARY}>
              <Download className="size-[1.1em]" /> {t("Export Security Log")}
            </button>
            <button type="button" onClick={() => setTab("policies")} className={BTN_PRIMARY}>
              <ShieldCheck className="size-[1.1em]" /> {t("Security Policies")}
            </button>
          </>
        }
      />

      <StatGrid>
        <StatCard
          label={t("Active Sessions")}
          value={o ? fmt(o.activeSessions) : DASH}
          icon={MonitorSmartphone}
          tone="cyan"
          hint={t("Admin sessions that stay signed in")}
        />
        <StatCard
          label={t("Failed Login Attempts")}
          value={o ? fmt(o.failedLogins24h) : DASH}
          icon={ShieldAlert}
          tone="red"
          badge={o && o.failedLogins24h > 0 ? t("Review") : undefined}
          badgeTone="warn"
          hint={t("In the last 24 hours")}
        />
        <StatCard
          label={t("Security Alerts")}
          value={o ? fmt(o.criticalEvents7d) : DASH}
          icon={BellRing}
          tone="violet"
          hint={t("Critical events in the last 7 days")}
        />
        <StatCard
          label={t("Admin Accounts")}
          value={o ? fmt(o.admins) : DASH}
          icon={UserCog}
          tone="green"
          badge={o ? t("{count} this week", { count: o.adminsSignedInThisWeek }) : undefined}
          badgeTone="up"
          hint={t("Signed in during the last 7 days")}
        />
      </StatGrid>

      <TabBar<Tab>
        label={t("Security sections")}
        value={tab}
        onChange={setTab}
        tabs={[
          { id: "audit", label: t("Audit Trail Ledger"), icon: ScrollText },
          { id: "sessions", label: t("Active Admin Sessions"), icon: Laptop, count: sessions.data?.length },
          { id: "logins", label: t("Login History"), icon: LogIn },
          { id: "policies", label: t("Security Policies"), icon: ShieldHalf },
        ]}
      />

      <div className="grid items-start gap-[1.4em] xl:grid-cols-[minmax(0,1fr)_22em]">
        <div className="flex min-w-0 flex-col gap-[1.4em]">
          {tab === "audit" && <EventLog now={now} />}

          {tab === "sessions" && (
            <Section
              icon={Laptop}
              title={t("Active Admin Sessions")}
              description={t("Admin sessions that stay signed in on a device. Revoke one to sign it out.")}
            >
              <SessionList sessions={sessions.data} error={sessions.error} onRetry={sessions.reload} onRevoked={refreshSessions} now={now} />
            </Section>
          )}

          {tab === "logins" && (
            <Section
              icon={LogIn}
              title={t("Login History")}
              description={t("Every sign-in attempt on the main and admin login pages.")}
            >
              <div className="mt-[1em]">
                <AdminSignIns now={now} />
              </div>
            </Section>
          )}

          {tab === "policies" && (
            <Section icon={ShieldHalf} title={t("Security Policies")} description={t("Rules that protect the admin panel.")}>
              <ul className="mt-[1em] grid gap-[0.8em] md:grid-cols-2">
                {POLICIES.map((p) => (
                  <li key={p.id} className="rounded-[0.9em] bg-[#f5f8fe] p-[1em]">
                    <p.icon className="size-[1.3em] text-[#0b89a6]" />
                    <p className="mt-[0.5em] text-[0.88em] font-bold text-[#0b1b2b]">{t(p.title)}</p>
                    <p className="text-[0.72em] text-[#5b6b7c]">{t(p.text)}</p>
                    <p className="mt-[0.6em] text-[0.72em] font-semibold text-[#8a97a6]">
                      {t("Status")}: {policyStatus(t, p.id, o)}
                    </p>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* Ledger integrity banner */}
          <section className="flex flex-wrap items-center gap-[1em] rounded-[1.1em] bg-[#13233a] p-[1.2em] text-white sm:p-[1.4em]">
            <span className="grid size-[2.8em] shrink-0 place-items-center rounded-[0.8em] bg-white/10 text-[#5ee0f5]">
              <Fingerprint className="size-[1.4em]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[1.05em] font-bold text-[#5ee0f5]">{t("Tamper-proof audit ledger")}</p>
              <p className="text-[0.75em] text-white/70">{t("Hash-verified audit records are coming soon.")}</p>
            </div>
            <button
              type="button"
              disabled
              className="inline-flex items-center gap-[0.5em] rounded-[0.7em] border border-white/20 px-[1.1em] py-[0.6em] text-[0.72em] font-bold uppercase tracking-[0.06em] text-white/80 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileClock className="size-[1.1em]" /> {t("Verify ledger")}
            </button>
          </section>
        </div>

        <aside className="flex min-w-0 flex-col gap-[1.4em]">
          <ActiveInspector sessions={sessions.data} error={sessions.error} onRetry={sessions.reload} onRevoked={refreshSessions} now={now} />
          <HardeningStatus overview={o} />
          <AccountSecurity overview={o} now={now} onChanged={refreshSessions} />
        </aside>
      </div>
    </AdminSurface>
  );
}
