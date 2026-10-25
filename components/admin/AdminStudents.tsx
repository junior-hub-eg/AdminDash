"use client";

import { getAdminOverview, getAdminStudents } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage, PageHero } from "./AdminPage";
import { StatCards } from "./StatCards";
import { StudentsTable } from "./StudentsTable";
import { LoadState, useAdminData } from "./admin-data";

export default function AdminStudents() {
  const t = useT();
  const overview = useAdminData(getAdminOverview, tk("We couldn't load the dashboard. Please try again."));
  const students = useAdminData(getAdminStudents, tk("We couldn't load the students. Please try again."));

  return (
    <AdminPage>
      <PageHero title={t("Students Management")} contentClassName="pb-[1.8em]">
        {overview.error && <LoadState error={overview.error} onRetry={overview.reload} className="mt-[1em]" />}
        <StatCards overview={overview.data} className="mt-[1.2em]" />
      </PageHero>

      {/* The table is narrower than the cards and centered, like the design */}
      <div className="mx-auto mt-[2.5em] w-full lg:w-[76%]">
        {students.data ? <StudentsTable students={students.data} /> : <LoadState error={students.error} onRetry={students.reload} />}
      </div>
    </AdminPage>
  );
}
