"use client";

import { useState } from "react";
import { Award, BarChart3, CirclePlus, Gift, ListChecks, Medal, SlidersHorizontal, Star, Users } from "lucide-react";
import { getAdminStudents, getSystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, PageHeader, StatCard, StatGrid } from "../page-parts";
import { useAdminData } from "../admin-data";
import { DASH, fmt, TabBar } from "../reports/ui";
import { Leaderboard, rankStudents } from "./Leaderboard";
import { BadgeCollection, StoreRedemptions, XpLedger, XpRulebook } from "./RewardPanels";

type Tab = "leaderboard" | "badges" | "rules" | "store";

export default function AdminRewards() {
  const t = useT();
  const [tab, setTab] = useState<Tab>("leaderboard");
  const system = useAdminData(getSystemReport, tk("We couldn't load the report. Please try again."));
  const students = useAdminData(getAdminStudents, tk("We couldn't load the students. Please try again."));

  const learning = system.data?.learning;
  const ranked = students.data ? rankStudents(students.data) : null;
  const avgXp = system.data ? Math.round(system.data.students.averageXp) : null;

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("XP economy")}
        title={t("Rewards & Gamification")}
        description={t("Track the XP economy, achievement badges and student leaderboards.")}
        actions={
          <>
            <button type="button" disabled title={t("Coming soon")} className={BTN_SECONDARY}>
              <SlidersHorizontal className="size-[1.1em]" /> {t("Configure XP Rules")}
            </button>
            <button type="button" disabled title={t("Coming soon")} className={BTN_PRIMARY}>
              <CirclePlus className="size-[1.1em]" /> {t("Create New Badge")}
            </button>
          </>
        }
      />

      <StatGrid busy={!system.data || !students.data}>
        <StatCard
          label={t("Total XP Distributed")}
          value={learning ? fmt(learning.xpAwarded) : DASH}
          icon={Star}
          tone="cyan"
          badge={avgXp != null ? t("{count} avg / student", { count: fmt(avgXp) }) : undefined}
          badgeTone="neutral"
        />
        <StatCard
          label={t("Badges Earned")}
          value={learning ? fmt(learning.badgesEarned) : DASH}
          icon={Medal}
          tone="violet"
          hint={t("Across all students")}
        />
        <StatCard
          label={t("Students on Leaderboard")}
          value={ranked ? fmt(ranked.length) : DASH}
          icon={Users}
          tone="green"
          badge={ranked && students.data?.length ? `${Math.round((ranked.length / students.data.length) * 100)}%` : undefined}
          badgeTone="up"
          hint={t("Students with XP")}
        />
        <StatCard label={t("Store Redemptions")} value={DASH} icon={Gift} tone="amber" hint={t("Rewards store coming soon")} />
      </StatGrid>

      <div className="grid items-start gap-[1.4em] xl:grid-cols-[minmax(0,1fr)_22em]">
        <div className="flex min-w-0 flex-col gap-[1.4em]">
          <TabBar<Tab>
            label={t("Rewards sections")}
            value={tab}
            onChange={setTab}
            tabs={[
              { id: "leaderboard", label: t("Leaderboard Rankings"), icon: BarChart3 },
              { id: "badges", label: t("Badge Collection"), icon: Award },
              { id: "rules", label: t("XP Rulebook Engine"), icon: ListChecks },
              { id: "store", label: t("Store Redemptions"), icon: Gift },
            ]}
          />

          {tab === "leaderboard" && (
            <Leaderboard
              ranked={ranked}
              longestStreak={system.data?.students.longestStreak ?? null}
              error={students.error}
              onRetry={students.reload}
            />
          )}
          {tab === "badges" && <BadgeCollection badgesEarned={learning?.badgesEarned ?? null} />}
          {tab === "store" && <StoreRedemptions />}

          <XpRulebook />
        </div>

        <aside className="flex min-w-0 flex-col gap-[1.4em]">
          {tab !== "badges" && <BadgeCollection badgesEarned={learning?.badgesEarned ?? null} />}
          <XpLedger ranked={ranked} />
        </aside>
      </div>
    </AdminSurface>
  );
}
