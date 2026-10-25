"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { getAdminMentor, setMentorActive } from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { MentorProfileHeader } from "./mentor-detail/MentorProfileHeader";
import { MentorKpiStrip } from "./mentor-detail/MentorKpiStrip";
import { MentorTabs, type MentorTab } from "./mentor-detail/MentorTabs";
import { ActiveSquadsOversight } from "./mentor-detail/ActiveSquadsOversight";
import { MentoredStudentsRoster } from "./mentor-detail/MentoredStudentsRoster";
import { RecentStudentFeedback } from "./mentor-detail/RecentStudentFeedback";
import { CapacityWorkloadCard } from "./mentor-detail/CapacityWorkloadCard";
import { UpcomingSessionsCard } from "./mentor-detail/UpcomingSessionsCard";
import { WeeklyAvailabilityCard } from "./mentor-detail/WeeklyAvailabilityCard";
import { AdminDirectControls } from "./mentor-detail/AdminDirectControls";

/** One mentor: profile, workload, squads, students, sessions and feedback. */
export default function AdminMentorDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getAdminMentor(id), [id]);
  const mentor = useAdminData(load, tk("We couldn't load this mentor. Please try again."));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MentorTab>("overview");
  const m = mentor.data;

  async function toggle() {
    if (!m) return;
    setSaving(true);
    setError(null);
    try {
      mentor.setData(await setMentorActive(m.id, !m.isActive));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminSurface>
      <Link href={"/admin/mentors" as Route} className="inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
        <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All mentors")}
      </Link>

      {!m ? (
        <LoadState error={mentor.error} onRetry={mentor.reload} />
      ) : (
        <>
          <MentorProfileHeader mentor={m} saving={saving} error={error} onToggle={toggle} />
          <MentorKpiStrip mentor={m} />
          <MentorTabs value={tab} onChange={setTab} counts={{ squads: m.monitoredSquads, students: m.students, reviews: 142 }} />

          {tab === "overview" ? (
            <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="grid min-w-0 gap-[1.2em]">
                <ActiveSquadsOversight />
                <MentoredStudentsRoster total={m.students} />
                <RecentStudentFeedback total={142} />
              </div>
              <div className="grid min-w-0 gap-[1.2em]">
                <CapacityWorkloadCard />
                <UpcomingSessionsCard />
                <WeeklyAvailabilityCard />
                <AdminDirectControls />
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