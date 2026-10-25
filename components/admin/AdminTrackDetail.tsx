"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { getAdminTracks } from "@/lib/admin-api";
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

/** One track. The API has no "get one track" call yet, so it takes it from the list. */
export default function AdminTrackDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(async () => {
    const page = await getAdminTracks();
    const track = page.tracks.find((x) => x.id === id);
    if (!track) throw new Error("not found");
    return { track, total: page.tracks.reduce((s, x) => s + x.students, 0) };
  }, [id]);
  const res = useAdminData(load, tk("We couldn't load this track. Please try again."));
  const [tab, setTab] = useState<TrackTab>("curriculum");
  const d = res.data;

  return (
    <AdminSurface>
      <Link href={"/admin/tracks" as Route} className="inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
        <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All tracks")}
      </Link>

      {!d ? (
        <LoadState error={res.error} onRetry={res.reload} />
      ) : (
        <>
          <TrackHeader track={d.track} total={d.total} />
          <TrackTabs value={tab} onChange={setTab} squads={d.track.squads} students={d.track.students} />

          {tab === "curriculum" ? (
            <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="grid min-w-0 gap-[1.2em]">
                <CurriculumPathway />
                <SquadPerformance squads={d.track.squads} />
                <CapstoneDeliverables />
              </div>
              <div className="grid min-w-0 gap-[1.2em]">
                <AssignedMentorsCard />
                <DemographicsCard students={d.track.students} />
                <UpcomingMilestonesCard />
                <TrackGovernance />
              </div>
            </div>
          ) : (
            <p className="rounded-[1.1em] bg-white p-[2em] text-center text-[0.9em] text-[#5b6b7c]">{t("Coming soon")}</p>
          )}
        </>
      )}
    </AdminSurface>
  );
}