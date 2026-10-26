"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft } from "lucide-react";
import { getAdminMentor, getAdminSquads, getMentorStudents, setMentorActive } from "@/lib/admin-api";
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
import { EmptyCard } from "./mentor-detail/parts";

/** One mentor: profile, workload, squads, students. Sessions, availability and reviews have no API yet. */
export default function AdminMentorDetail({ id }: { id: string }) {
  const t = useT();
  const loadMentor = useCallback(() => getAdminMentor(id), [id]);
  const loadStudents = useCallback(() => getMentorStudents(id), [id]);
  const mentor = useAdminData(loadMentor, tk("We couldn't load this mentor. Please try again."));
  const students = useAdminData(loadStudents, tk("We couldn't load the students. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<MentorTab>("overview");
  const [picking, setPicking] = useState(false);
  const m = mentor.data;
  const mine = squads.data?.filter((s) => s.monitor?.id === id) ?? null;

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

  const onSquadAssigned = () => {
    squads.reload();
    mentor.reload();
  };

  const openPicker = () => {
    setTab("overview");
    setPicking(true);
    requestAnimationFrame(() => document.getElementById("admin-direct-controls")?.scrollIntoView({ behavior: "smooth", block: "center" }));
  };

  const squadsSection = (
    <ActiveSquadsOversight squads={mine} error={squads.error} onRetry={squads.reload} full={tab === "squads"} />
  );
  const roster = (
    <MentoredStudentsRoster
      students={students.data}
      error={students.error}
      onRetry={students.reload}
      limit={tab === "students" ? undefined : 4}
      onViewAll={() => setTab("students")}
    />
  );

  return (
    <AdminSurface>
      <Link href={"/admin/mentors" as Route} className="inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
        <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All mentors")}
      </Link>

      {!m ? (
        <LoadState error={mentor.error} onRetry={mentor.reload} />
      ) : (
        <>
          <MentorProfileHeader mentor={m} saving={saving} error={error} onToggle={toggle} onReassign={openPicker}>
            <MentorKpiStrip mentor={m} />
          </MentorProfileHeader>
          <MentorTabs
            value={tab}
            onChange={setTab}
            counts={{ squads: mine?.length ?? m.monitoredSquads, students: students.data?.length ?? m.students }}
          />

          {tab === "overview" ? (
            <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
              <div className="grid min-w-0 gap-[1.2em]">
                {squadsSection}
                {roster}
                <RecentStudentFeedback />
              </div>
              <div className="grid min-w-0 gap-[1.2em]">
                <CapacityWorkloadCard mentor={m} students={students.data?.length ?? m.students} squads={mine?.length ?? m.monitoredSquads} />
                <UpcomingSessionsCard />
                <WeeklyAvailabilityCard />
                <AdminDirectControls
                  mentor={m}
                  squads={squads.data}
                  students={students.data}
                  picking={picking}
                  onPicking={setPicking}
                  onAssigned={onSquadAssigned}
                />
              </div>
            </div>
          ) : tab === "squads" ? (
            squadsSection
          ) : tab === "students" ? (
            roster
          ) : tab === "schedule" ? (
            <EmptyCard title={t("Weekly Schedule & Availability")} text={t("This mentor hasn't shared a weekly schedule yet.")} />
          ) : tab === "reviews" ? (
            <EmptyCard title={t("Student Reviews")} text={t("No student reviews to show yet.")} />
          ) : (
            <EmptyCard title={t("Performance & Evaluation")} text={t("No performance evaluations recorded yet.")} />
          )}
        </>
      )}
    </AdminSurface>
  );
}
