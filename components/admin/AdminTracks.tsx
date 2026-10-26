"use client";

import { useState } from "react";
import { BadgeCheck, BookOpen, CircleCheck, Compass, Map, PlusCircle, UsersRound } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_PRIMARY, BTN_SECONDARY, AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { EMPTY_FILTERS, matchesTrack, TrackFilters, type TrackFilterState } from "./tracks/TrackFilters";
import { TrackCard } from "./tracks/TrackCard";
import { CurriculumInspector } from "./tracks/CurriculumInspector";
import { EnrollmentRatioCard } from "./tracks/EnrollmentRatioCard";
import { TrackFormDialog } from "./tracks/TrackFormDialog";
import { loadTrackBoard, type TrackItem } from "./tracks/track-data";

export default function AdminTracks() {
  const t = useT();
  const board = useAdminData(loadTrackBoard, tk("We couldn't load the tracks. Please try again."));
  const [filters, setFilters] = useState<TrackFilterState>(EMPTY_FILTERS);
  const [compact, setCompact] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{ edit: TrackItem | null } | null>(null);

  const all = board.data?.items ?? [];
  const total = board.data?.totalStudents ?? 0;
  const items = all.filter((x) => matchesTrack(x, filters));
  const current = items.find((x) => x.track.id === selected) ?? items[0];
  const big = compact ? [] : items.slice(0, 3);
  const small = compact ? items : items.slice(3);
  const stats = board.data?.stats;
  const videos = all.every((x) => x.info) ? all.reduce((s, x) => s + (x.info?.videoCount ?? 0), 0) : null;
  const withLessons = all.filter((x) => x.info?.hasLessons).length;

  return (
    <AdminSurface>
      <section className="rounded-[1.2em] bg-gradient-to-br from-[#e3f1fc] to-[#d4ecfa] p-[1.4em] shadow-[0_6px_22px_rgba(20,54,90,0.06)]">
        <PageHeader
          eyebrow={t("Academic Curriculum Architect")}
          title={t("Track Management")}
          description={t("Design interactive learning pathways, configure progressive curriculum levels, manage technical courses, and evaluate student mastery.")}
          actions={
            <>
              <a href="#curriculum-inspector" className={BTN_SECONDARY}>
                <Map className="size-[1em]" /> {t("Curriculum Map")}
              </a>
              <button type="button" onClick={() => setDialog({ edit: null })} className={BTN_PRIMARY}>
                <PlusCircle className="size-[1em]" /> {t("Create Track")}
              </button>
            </>
          }
        />
      </section>

      <StatGrid busy={!stats}>
        <StatCard
          label={t("Active Tracks")}
          icon={Compass}
          value={stats ? String(stats.totalTracks).padStart(2, "0") : "—"}
          hint={board.data ? t("{n} with students", { n: all.filter((x) => x.track.students > 0).length }) : undefined}
        />
        <StatCard
          label={t("Track Videos")}
          icon={BookOpen}
          tone="green"
          value={videos ?? "—"}
          hint={videos === null ? undefined : t("{n} tracks with lessons", { n: withLessons })}
        />
        <StatCard
          label={t("Enrolled Students")}
          icon={UsersRound}
          tone="violet"
          value={board.data ? total.toLocaleString() : "—"}
          hint={stats?.topTrack ? t("Top track: {name}", { name: t(stats.topTrack) }) : t("Youth Coders")}
        />
        <StatCard
          label={t("Avg. Completion Rate")}
          icon={BadgeCheck}
          tone="amber"
          value={stats ? `${Math.round(stats.averageCompletion * 10) / 10}%` : "—"}
          hint={stats ? t("{n} active sprints", { n: stats.activeSprints }) : undefined}
        />
      </StatGrid>

      <TrackFilters value={filters} onChange={setFilters} compact={compact} onCompact={setCompact} />

      {!board.data ? (
        <LoadState error={board.error} onRetry={board.reload} />
      ) : (
        <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="grid min-w-0 gap-[1.2em]">
            {big.map((x) => (
              <TrackCard key={x.track.id} item={x} total={total} selected={x.track.id === current?.track.id} onSelect={() => setSelected(x.track.id)} />
            ))}
            {small.length > 0 && (
              <div className="grid gap-[1.2em] md:grid-cols-2">
                {small.map((x) => (
                  <TrackCard key={x.track.id} item={x} total={total} compact selected={x.track.id === current?.track.id} onSelect={() => setSelected(x.track.id)} />
                ))}
              </div>
            )}
            {items.length === 0 && (
              <p className="flex items-center justify-center gap-[0.5em] rounded-[1.1em] bg-white p-[2em] text-center text-[0.85em] text-[#5b6b7c]">
                <CircleCheck className="size-[1em]" /> {all.length === 0 ? t("No tracks yet. Create the first one.") : t("No tracks match your filters.")}
              </p>
            )}
          </div>

          <div className="grid min-w-0 gap-[1.2em]">
            {current && <CurriculumInspector item={current} onEdit={() => setDialog({ edit: current })} />}
            <EnrollmentRatioCard tracks={all.map((x) => x.track)} total={total} />
          </div>
        </div>
      )}

      <TrackFormDialog
        open={dialog !== null}
        edit={dialog?.edit ?? null}
        nextOrder={all.length}
        onClose={() => setDialog(null)}
        onSaved={board.reload}
      />
    </AdminSurface>
  );
}
