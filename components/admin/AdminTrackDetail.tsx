"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { getAdminSquads } from "@/lib/admin-api";
import { deleteTrack } from "@/lib/admin-tracks-api";
import { ApiError, errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { TrackHeader } from "./track-detail/TrackHeader";
import { TrackTabs, type TrackTab } from "./track-detail/TrackTabs";
import { CurriculumPathway } from "./track-detail/CurriculumPathway";
import { SquadPerformance } from "./track-detail/SquadPerformance";
import { CapstoneDeliverables } from "./track-detail/CapstoneDeliverables";
import { AssignedMentorsCard, DemographicsCard, UpcomingMilestonesCard, TrackGovernance } from "./track-detail/SideCards";
import { EmptyCard } from "./mentor-detail/parts";
import { TrackFormDialog } from "./tracks/TrackFormDialog";
import { loadTrackBoard } from "./tracks/track-data";

/** One track. The API has no "get one track" call, so it is taken from the list (plus catalog and mentors). */
export default function AdminTrackDetail({ id }: { id: string }) {
  const t = useT();
  const router = useRouter();
  const load = useCallback(async () => {
    const board = await loadTrackBoard();
    const item = board.items.find((x) => x.track.id === id);
    if (!item) throw new Error(tk("This track doesn't exist anymore."));
    return { item, board };
  }, [id]);
  const res = useAdminData(load, tk("We couldn't load this track. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const [tab, setTab] = useState<TrackTab>("curriculum");
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const d = res.data;

  // Squads monitored by this track's mentors.
  const mentorIds = new Set(d?.item.mentors?.map((m) => m.id) ?? []);
  const trackSquads = squads.data && d ? squads.data.filter((s) => s.monitor && mentorIds.has(s.monitor.id)) : null;

  async function remove() {
    if (!d || !window.confirm(t("Delete the track “{name}”? This can't be undone.", { name: t(d.item.track.name) }))) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteTrack(d.item.track.id);
      router.push("/admin/tracks" as Route);
    } catch (e) {
      setDeleteError(
        e instanceof ApiError && e.code === "TRACK_IN_USE"
          ? t("This track has students or content, so it can't be deleted.")
          : errorMessage(e, tk("We couldn't delete the track. Please try again.")),
      );
      setDeleting(false);
    }
  }

  const mentorsCard = d && <AssignedMentorsCard mentors={d.item.mentors} lead={d.item.lead} />;

  return (
    <AdminSurface>
      <Link href={"/admin/tracks" as Route} className="inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
        <ArrowLeft className="size-[1em]" /> {t("All tracks")}
      </Link>

      {!d ? (
        <LoadState error={res.error} onRetry={res.reload} />
      ) : (
        <>
          <TrackHeader item={d.item} total={d.board.totalStudents} academyAvg={d.board.stats.averageCompletion} onEdit={() => setEditing(true)} />
          <TrackTabs
            value={tab}
            onChange={setTab}
            squads={d.item.track.squads}
            students={d.item.track.students}
            mentors={d.item.mentors?.length ?? null}
          />

          {tab === "curriculum" ? (
            <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="grid min-w-0 gap-[1.2em]">
                <CurriculumPathway />
                <SquadPerformance squads={trackSquads} total={d.item.track.squads} error={squads.error} onRetry={squads.reload} />
                <CapstoneDeliverables />
              </div>
              <div className="grid min-w-0 gap-[1.2em]">
                {mentorsCard}
                <DemographicsCard students={d.item.track.students} />
                <UpcomingMilestonesCard />
                <TrackGovernance onEdit={() => setEditing(true)} onDelete={remove} deleting={deleting} error={deleteError} />
              </div>
            </div>
          ) : tab === "squads" ? (
            <SquadPerformance squads={trackSquads} total={d.item.track.squads} error={squads.error} onRetry={squads.reload} />
          ) : tab === "mentors" ? (
            mentorsCard
          ) : tab === "students" ? (
            <EmptyCard title={t("Enrolled Students")} text={t("{n} students learn this track. The per-track student list isn't available yet.", { n: d.item.track.students })} />
          ) : tab === "rubrics" ? (
            <EmptyCard title={t("Rubrics & Capstone")} text={t("No rubrics or capstone deliverables have been set up for this track yet.")} />
          ) : (
            <EmptyCard title={t("Analytics")} text={t("Track analytics aren't available yet.")} />
          )}

          <TrackFormDialog open={editing} edit={d.item} nextOrder={d.board.items.length} onClose={() => setEditing(false)} onSaved={res.reload} />
        </>
      )}
    </AdminSurface>
  );
}
