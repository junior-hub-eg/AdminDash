"use client";

import { useState } from "react";
import { Bell, CalendarClock, CircleCheck, FilePen, History, Plus } from "lucide-react";
import { announcementStatus, getAdminAnnouncements, getAdminTracks, type Announcement } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { NotificationFilters, type NotifFilters, type NotifTab } from "./notifications/NotificationFilters";
import { BroadcastTable } from "./notifications/BroadcastTable";
import { QuickComposer } from "./notifications/QuickComposer";
import { AudienceEngagement } from "./notifications/AudienceEngagement";

const TAB_STATUS: Record<NotifTab, (a: Announcement) => boolean> = {
  all: () => true,
  sent: (a) => ["live", "expired"].includes(announcementStatus(a)),
  scheduled: (a) => announcementStatus(a) === "scheduled",
  drafts: (a) => announcementStatus(a) === "draft",
};

/**
 * Announcements the admin publishes for everyone, students (all or one track), mentors or teachers.
 * They show in each person's area; drafts wait, scheduled ones show from their time on.
 */
export default function AdminNotificationsCenter() {
  const t = useT();
  const list = useAdminData(getAdminAnnouncements, tk("We couldn't load the announcements. Please try again."));
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const [tab, setTab] = useState<NotifTab>("all");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<NotifFilters>({ audience: "all", track: "all" });
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [composerKey, setComposerKey] = useState(0);

  const all = list.data ?? [];
  const q = query.trim().toLowerCase();
  const matches = all.filter(
    (a) =>
      (filters.audience === "all" || a.audience === filters.audience) &&
      (filters.track === "all" || a.trackCode === filters.track) &&
      (!q || [a.title, a.body, a.trackName ?? ""].some((s) => s.toLowerCase().includes(q))),
  );
  const items = matches.filter(TAB_STATUS[tab]);
  const counts = Object.fromEntries((Object.keys(TAB_STATUS) as NotifTab[]).map((k) => [k, matches.filter(TAB_STATUS[k]).length])) as Record<
    NotifTab,
    number
  >;
  const count = (k: NotifTab) => (list.data ? all.filter(TAB_STATUS[k]).length : "—");

  const saved = (a: Announcement) => {
    list.setData((l) => (l?.some((x) => x.id === a.id) ? l.map((x) => (x.id === a.id ? a : x)) : [a, ...(l ?? [])]));
    void list.reload(); // only the list carries each announcement's reach
    setEditing(null);
    setComposerKey((k) => k + 1);
  };

  const compose = () => {
    setEditing(null);
    setComposerKey((k) => k + 1);
    document.getElementById("quick-composer")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Broadcast Operations • Multi-channel relay")}
        title={t("Notifications Center")}
        description={t("Compose, broadcast, and schedule targeted system alerts, sprint reminders, and platform updates across students, squads, and mentors.")}
        actions={
          <>
            <button type="button" onClick={() => setTab("sent")} className={BTN_SECONDARY}>
              <History className="size-[1em]" /> {t("Broadcast History")}
            </button>
            <button type="button" onClick={compose} className={BTN_PRIMARY}>
              <Plus className="size-[1em]" /> {t("Compose Notification")}
            </button>
          </>
        }
      />

      <StatGrid busy={!list.data}>
        <StatCard label={t("Total Notifications")} icon={Bell} value={count("all")} hint={t("announcements so far")} />
        <StatCard label={t("Scheduled")} icon={CalendarClock} tone="violet" value={count("scheduled")} hint={t("pending release")} />
        <StatCard label={t("Sent / Delivered")} icon={CircleCheck} tone="green" value={count("sent")} hint={t("published to their audience")} />
        <StatCard label={t("Drafts")} icon={FilePen} tone="amber" value={count("drafts")} hint={t("saved, not published")} />
      </StatGrid>

      <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="grid min-w-0 gap-[1em]">
          <NotificationFilters
            tab={tab}
            onTab={setTab}
            counts={counts}
            query={query}
            onQuery={setQuery}
            filters={filters}
            onFilters={setFilters}
            tracks={tracks.data?.tracks ?? []}
            onReset={() => {
              setTab("all");
              setQuery("");
              setFilters({ audience: "all", track: "all" });
            }}
          />
          {list.data ? (
            <BroadcastTable
              items={items}
              onEdit={(a) => {
                setEditing(a);
                setComposerKey((k) => k + 1);
                document.getElementById("quick-composer")?.scrollIntoView({ behavior: "smooth" });
              }}
              onChanged={saved}
              onDeleted={(id) => list.setData((l) => l?.filter((x) => x.id !== id) ?? null)}
            />
          ) : (
            <LoadState error={list.error} onRetry={list.reload} />
          )}
        </div>
        <div className="grid min-w-0 gap-[1.2em]">
          <QuickComposer key={composerKey} editing={editing} tracks={tracks.data?.tracks ?? []} onSaved={saved} onCancel={() => setEditing(null)} />
          <AudienceEngagement items={all} />
        </div>
      </div>
    </AdminSurface>
  );
}
