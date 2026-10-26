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
import { getAdmins } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, PageHeader, StatCard, StatGrid } from "./page-parts";
import { useAdminData } from "./admin-data";
import { DASH, Empty, Section, Soon, TabBar } from "./reports/ui";
import { AdminSignIns } from "./security/AdminSignIns";
import { AccountSecurity, ActiveInspector, EventLog, HardeningStatus, POLICIES } from "./security/SecurityPanels";

type Tab = "audit" | "sessions" | "logins" | "policies";

const WEEK = 7 * 24 * 60 * 60 * 1000;

export default function AdminSecurity() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("audit");
  const [now] = useState(() => Date.now());
  const admins = useAdminData(getAdmins, tk("We couldn't load the admin accounts. Please try again."));

  const list = admins.data;
  const recent = list?.filter((a) => a.lastLoginUtc && now - new Date(a.lastLoginUtc).getTime() < WEEK).length ?? 0;

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Shield active")}
        title={t("Security & Access Monitoring")}
        description={t("Monitor administrative sessions, audit system actions, review admin sign-ins and security policies across Junior Hub.")}
        actions={
          <>
            <button type="button" disabled title={t("Coming soon")} className={BTN_SECONDARY}>
              <Download className="size-[1.1em]" /> {t("Export Security Log")}
            </button>
            <button type="button" onClick={() => setTab("policies")} className={BTN_PRIMARY}>
              <ShieldCheck className="size-[1.1em]" /> {t("Security Policies")}
            </button>
          </>
        }
      />

      <StatGrid>
        <StatCard label={t("Active Sessions")} value={DASH} icon={MonitorSmartphone} tone="cyan" hint={t("Session tracking coming soon")} />
        <StatCard label={t("Failed Login Attempts")} value={DASH} icon={ShieldAlert} tone="red" hint={t("Login monitoring coming soon")} />
        <StatCard label={t("Security Alerts")} value={DASH} icon={BellRing} tone="violet" hint={t("Alerting coming soon")} />
        <StatCard
          label={t("Admin Accounts")}
          value={list ? list.length : DASH}
          icon={UserCog}
          tone="green"
          badge={list ? t("{count} this week", { count: recent }) : undefined}
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
          { id: "sessions", label: t("Active Admin Sessions"), icon: Laptop },
          { id: "logins", label: t("Login History"), icon: LogIn, count: list?.length },
          { id: "policies", label: t("Security Policies"), icon: ShieldHalf },
        ]}
      />

      <div className="grid items-start gap-[1.4em] xl:grid-cols-[minmax(0,1fr)_22em]">
        <div className="flex min-w-0 flex-col gap-[1.4em]">
          {tab === "audit" && <EventLog />}

          {tab === "sessions" && (
            <Section icon={Laptop} title={t("Active Admin Sessions")} aside={<Soon />}>
              <Empty
                icon={Laptop}
                title={t("Session tracking is not available yet")}
                text={t("Signed-in devices, locations and idle time will be listed here.")}
                className="mt-[1em]"
              />
            </Section>
          )}

          {tab === "logins" && (
            <Section
              icon={LogIn}
              title={t("Admin sign-ins")}
              description={t("Every admin account and when it last signed in.")}
            >
              <div className="mt-[1em]">
                <AdminSignIns admins={list} error={admins.error} onRetry={admins.reload} now={now} />
              </div>
              <p className="mt-[0.8em] text-[0.7em] text-[#8a97a6]">{t("Geo-IP and device details are coming soon.")}</p>
            </Section>
          )}

          {tab === "policies" && (
            <Section icon={ShieldHalf} title={t("Security Policies")} description={t("Rules that protect the admin panel.")} aside={<Soon />}>
              <ul className="mt-[1em] grid gap-[0.8em] md:grid-cols-2">
                {POLICIES.map((p) => (
                  <li key={p.title} className="rounded-[0.9em] bg-[#f5f8fe] p-[1em]">
                    <p.icon className="size-[1.3em] text-[#0b89a6]" />
                    <p className="mt-[0.5em] text-[0.88em] font-bold text-[#0b1b2b]">{t(p.title)}</p>
                    <p className="text-[0.72em] text-[#5b6b7c]">{t(p.text)}</p>
                    <p className="mt-[0.6em] text-[0.72em] font-semibold text-[#8a97a6]">
                      {t("Status")}: {DASH}
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
          <ActiveInspector />
          <HardeningStatus />
          <AccountSecurity />
        </aside>
      </div>
    </AdminSurface>
  );
}
