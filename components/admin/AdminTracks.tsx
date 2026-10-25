"use client";

import { useState } from "react";
import { BadgeCheck, BookOpen, Compass, Map, Plus, UsersRound } from "lucide-react";
import { getAdminTracks } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { MOCK_TRACK_EXTRAS, MOCK_TRACK_TOTALS } from "./dashboardMock";
import { TrackFilters } from "./tracks/TrackFilters";
import { TrackCard } from "./tracks/TrackCard";
import { CurriculumInspector } from "./tracks/CurriculumInspector";
import { EnrollmentRatioCard } from "./tracks/EnrollmentRatioCard";

export default function AdminTracks() {
  const t = useT();
  const page = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const all = page.data?.tracks ?? [];
  const total = all.reduce((sum, x) => sum + x.students, 0);
  // The API has no description, mentors or courses yet, so each track gets mock extras by position.
  const items = all
    .map((track, i) => ({ track, i, extra: MOCK_TRACK_EXTRAS[i % MOCK_TRACK_EXTRAS.length] }))
    .filter(({ track }) => track.name.toLowerCase().includes(query.trim().toLowerCase()));
  const selectedId = selected ?? items[0]?.track.id;
  const current = items.find((x) => x.track.id === selectedId) ?? items[0];
  const big = items.slice(0, 3);
  const small = items.slice(3);
  const stats = page.data?.stats;

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Academic Curriculum Architect")}
        title={t("Track Management")}
        description={t("Design interactive learning pathways, configure progressive curriculum levels, manage technical courses, and evaluate student mastery.")}
        actions={
          <>
            <button type="button" className={BTN_SECONDARY}><Map className="size-[1em]" /> {t("Curriculum Map")}</button>
            <button type="button" className={BTN_PRIMARY}><Plus className="size-[1em]" /> {t("Create Track")}</button>
          </>
        }
      />

      <StatGrid busy={!stats}>
        <StatCard label={t("Active Tracks")} icon={Compass} value={stats ? String(stats.totalTracks).padStart(2, "0") : "—"} hint={stats?.topTrack ? t(stats.topTrack) : undefined} />
        <StatCard label={t("Total Courses")} icon={BookOpen} tone="green" value={MOCK_TRACK_TOTALS.courses} badge={MOCK_TRACK_TOTALS.coursesBadge} hint={t(MOCK_TRACK_TOTALS.coursesHint)} />
        <StatCard label={t("Enrolled Students")} icon={UsersRound} tone="violet" value={page.data ? total.toLocaleString() : "—"} hint={t("Youth Coders")} />
        <StatCard label={t("Avg. Completion Rate")} icon={BadgeCheck} tone="amber" value={stats ? `${stats.averageCompletion}%` : "—"} hint={t("Graduation pacing")} />
      </StatGrid>

      <TrackFilters query={query} onQuery={setQuery} />

      {!page.data ? (
        <LoadState error={page.error} onRetry={page.reload} />
      ) : (
        <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-[1.2em]">
            {big.map(({ track, extra, i }) => (
              <TrackCard key={track.id} track={track} extra={extra} index={i} total={total} selected={track.id === selectedId} onSelect={() => setSelected(track.id)} />
            ))}
            {small.length > 0 && (
              <div className="grid gap-[1.2em] md:grid-cols-2">
                {small.map(({ track, extra, i }) => (
                  <TrackCard key={track.id} track={track} extra={extra} index={i} total={total} compact selected={track.id === selectedId} onSelect={() => setSelected(track.id)} />
                ))}
              </div>
            )}
            {items.length === 0 && <p className="rounded-[1.1em] bg-white p-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No tracks match your search.")}</p>}
          </div>

          <div className="grid min-w-0 gap-[1.2em]">
            {current && <CurriculumInspector name={current.track.name} />}
            <EnrollmentRatioCard tracks={all} total={total} />
          </div>
        </div>
      )}
    </AdminSurface>
  );
}