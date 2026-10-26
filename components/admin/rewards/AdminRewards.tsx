"use client";

import { useState } from "react";
import { Award, BarChart3, CirclePlus, Gift, ListChecks, Medal, SlidersHorizontal, Star, Users } from "lucide-react";
import { getSystemReport } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { getAdminBadges, getRewardsOverview, updateBadge, type AdminBadge } from "@/lib/admin-rewards-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, PageHeader, StatCard, StatGrid } from "../page-parts";
import { useAdminData } from "../admin-data";
import { DASH, fmt, TabBar } from "../reports/ui";
import { AwardDialog, BadgeDialog } from "./BadgeDialogs";
import { Leaderboard } from "./Leaderboard";
import { BadgeCollection, StoreRedemptions, XpLedger, XpRulebook } from "./RewardPanels";

type Tab = "leaderboard" | "badges" | "rules" | "store";
type Dialog = { kind: "badge"; badge: AdminBadge | null } | { kind: "award"; badge: AdminBadge } | null;

export default function AdminRewards() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("leaderboard");
  const [dialog, setDialog] = useState<Dialog>(null);
  const [note, setNote] = useState<string | null>(null);
  const [ledgerKey, setLedgerKey] = useState(0);
  const overview = useAdminData(getRewardsOverview, tk("We couldn't load the rewards overview. Please try again."));
  const badges = useAdminData(getAdminBadges, tk("We couldn't load the badges. Please try again."));
  const system = useAdminData(getSystemReport, tk("We couldn't load the report. Please try again."));

  const o = overview.data;
  const studentTotal = system.data?.students.total;

  const refresh = () => {
    void overview.reload();
    void badges.reload();
    setLedgerKey((k) => k + 1);
  };

  const saved = (b: AdminBadge) => {
    const list = badges.data ?? [];
    badges.setData(list.some((x) => x.id === b.id) ? list.map((x) => (x.id === b.id ? b : x)) : [b, ...list]);
    setDialog(null);
    void overview.reload();
  };

  const toggle = async (b: AdminBadge) => {
    setNote(null);
    try {
      saved(await updateBadge(b.id, { name: b.name, description: b.description, isActive: !b.isActive }));
    } catch (e) {
      setNote(errorMessage(e, tk("We couldn't save the badge. Please try again.")));
    }
  };

  const collection = (compact: boolean) => (
    <BadgeCollection
      badges={badges.data}
      error={badges.error}
      onRetry={badges.reload}
      compact={compact}
      onManage={() => setTab("badges")}
      onCreate={() => setDialog({ kind: "badge", badge: null })}
      onEdit={(badge) => setDialog({ kind: "badge", badge })}
      onToggle={toggle}
      onAward={(badge) => setDialog({ kind: "award", badge })}
    />
  );

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("XP economy")}
        title={t("Rewards & Gamification")}
        description={t("Track the XP economy, achievement badges and student leaderboards.")}
        actions={
          <>
            <button
              type="button"
              className={BTN_SECONDARY}
              onClick={() => {
                setTab("rules");
                document.getElementById("rewards-rules")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              <SlidersHorizontal className="size-[1.1em]" /> {t("Configure XP Rules")}
            </button>
            <button type="button" className={BTN_PRIMARY} onClick={() => setDialog({ kind: "badge", badge: null })}>
              <CirclePlus className="size-[1.1em]" /> {t("Create New Badge")}
            </button>
          </>
        }
      />

      <StatGrid busy={!o}>
        <StatCard
          label={t("Total XP Distributed")}
          value={o ? fmt(o.xpAwarded) : DASH}
          icon={Star}
          tone="cyan"
          badge={o ? t("{count} avg / student", { count: fmt(Math.round(o.averageXp)) }) : undefined}
          badgeTone="neutral"
          hint={o ? t("+{count} XP in the last 7 days", { count: fmt(o.xpAwardedLast7Days) }) : undefined}
        />
        <StatCard
          label={t("Badges Earned")}
          value={o ? fmt(o.badgesEarned) : DASH}
          icon={Medal}
          tone="violet"
          hint={o ? t("{active} of {total} badges active", { active: o.activeBadges, total: o.totalBadges }) : t("Across all students")}
        />
        <StatCard
          label={t("Students on Leaderboard")}
          value={o ? fmt(o.studentsWithXp) : DASH}
          icon={Users}
          tone="green"
          badge={o && studentTotal ? `${Math.round((o.studentsWithXp / studentTotal) * 100)}%` : undefined}
          badgeTone="up"
          hint={t("Students with XP")}
        />
        <StatCard label={t("Store Redemptions")} value={DASH} icon={Gift} tone="amber" hint={t("Rewards store coming soon")} />
      </StatGrid>

      {note && (
        <p role="status" className="mx-auto mt-[1em] w-full rounded-[0.7em] bg-[#dff3fb] px-[1em] py-[0.6em] text-[0.8em] font-semibold text-[#0b6f86]">
          {note}
        </p>
      )}

      <div className="grid items-start gap-[1.4em] xl:grid-cols-[minmax(0,1fr)_22em]">
        <div className="flex min-w-0 flex-col gap-[1.4em]">
          <TabBar<Tab>
            label={t("Rewards sections")}
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "leaderboard", label: t("Leaderboard Rankings"), icon: BarChart3 },
              { id: "badges", label: t("Badge Collection"), icon: Award, count: badges.data?.length },
              { id: "rules", label: t("XP Rulebook Engine"), icon: ListChecks },
              { id: "store", label: t("Store Redemptions"), icon: Gift },
            ]}
          />

          {tab === "leaderboard" && <Leaderboard longestStreak={system.data?.students.longestStreak ?? null} />}
          {tab === "badges" && collection(false)}
          {tab === "store" && <StoreRedemptions />}

          <XpRulebook />
        </div>

        <aside className="flex min-w-0 flex-col gap-[1.4em]">
          {tab !== "badges" && collection(true)}
          <XpLedger refreshKey={ledgerKey} />
        </aside>
      </div>

      {dialog?.kind === "badge" && <BadgeDialog badge={dialog.badge} onClose={() => setDialog(null)} onSaved={saved} />}
      {dialog?.kind === "award" && (
        <AwardDialog
          badge={dialog.badge}
          onClose={() => setDialog(null)}
          onAwarded={(text) => {
            setDialog(null);
            setNote(text);
            refresh();
          }}
        />
      )}
    </AdminSurface>
  );
}
