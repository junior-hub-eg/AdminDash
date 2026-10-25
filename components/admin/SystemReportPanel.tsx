"use client";

import { Download, Printer } from "lucide-react";
import { getSystemReport, type CountItem, type SystemReport } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk, type TFunction } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "./admin-data";

const card = "rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

type Row = [label: string, value: number | string];
type Group = { title: string; rows: Row[]; lists: [label: string, items: CountItem[]][] };

/** Every number of the system report, grouped the way the page and the CSV show them. */
function groups(r: SystemReport): Group[] {
  return [
    {
      title: tk("Users"),
      rows: [
        [tk("Total accounts"), r.users.total],
        [tk("New in the last 30 days"), r.users.newLast30Days],
        [tk("Signed in during the last 7 days"), r.users.activeLast7Days],
      ],
      lists: [
        [tk("By role"), r.users.byRole],
        [tk("By status"), r.users.byStatus],
      ],
    },
    {
      title: tk("Students"),
      rows: [
        [tk("Total students"), r.students.total],
        [tk("Independent"), r.students.independent],
        [tk("In schools"), r.students.inSchools],
        [tk("Without a track"), r.students.withoutTrack],
        [tk("Active in the last 7 days"), r.students.activeLast7Days],
        [tk("Active in the last 30 days"), r.students.activeLast30Days],
        [tk("Average XP"), Math.round(r.students.averageXp)],
        [tk("Longest streak (days)"), r.students.longestStreak],
      ],
      lists: [
        [tk("By track"), r.students.byTrack],
        [tk("By level"), r.students.byLevel],
        [tk("By gender"), r.students.byGender],
      ],
    },
    {
      title: tk("Learning"),
      rows: [
        [tk("Tracks"), r.learning.tracks],
        [tk("Lessons"), r.learning.lessons],
        [tk("Lessons completed"), r.learning.lessonsCompleted],
        [tk("Lessons completed in the last 30 days"), r.learning.lessonsCompletedLast30Days],
        [tk("Level exams taken"), r.learning.levelExams],
        [tk("Track quizzes taken"), r.learning.trackQuizzes],
        [tk("Badges earned"), r.learning.badgesEarned],
        [tk("XP awarded"), r.learning.xpAwarded],
      ],
      lists: [],
    },
    {
      title: tk("Mentorship"),
      rows: [
        [tk("Mentors"), r.mentorship.mentors],
        [tk("Active mentors"), r.mentorship.activeMentors],
        [tk("Average rating"), r.mentorship.averageRating.toFixed(1)],
        [tk("Students with a mentor"), r.mentorship.studentsWithMentor],
        [tk("Students without a mentor"), r.mentorship.studentsWithoutMentor],
        [tk("Pending mentor changes"), r.mentorship.pendingChangeRequests],
        [tk("Upcoming sessions"), r.mentorship.sessionsUpcoming],
        [tk("Completed sessions"), r.mentorship.sessionsCompleted],
        [tk("No-shows"), r.mentorship.sessionsNoShow],
        [tk("Cancelled sessions"), r.mentorship.sessionsCancelled],
        [tk("Feedbacks"), r.mentorship.feedbacks],
        [tk("Messages"), r.mentorship.messages],
      ],
      lists: [],
    },
    {
      title: tk("Squads"),
      rows: [
        [tk("Squads"), r.squads.total],
        [tk("Current members"), r.squads.currentMembers],
        [tk("Average size"), r.squads.averageSize.toFixed(1)],
        [tk("Without a monitor"), r.squads.withoutMonitor],
        [tk("Use cases"), r.squads.useCases],
        [tk("Tasks"), r.squads.tasksTotal],
        [tk("Tasks done"), r.squads.tasksDone],
      ],
      lists: [[tk("By status"), r.squads.byStatus]],
    },
    {
      title: tk("Teaching"),
      rows: [
        [tk("Schools"), r.teaching.schools],
        [tk("Teachers"), r.teaching.teachers],
        [tk("Classes"), r.teaching.classes],
        [tk("Assignments"), r.teaching.assignments],
        [tk("Submissions"), r.teaching.submissions],
        [tk("Graded"), r.teaching.graded],
        [tk("Waiting for a grade"), r.teaching.waitingForGrade],
        [tk("Questions"), r.teaching.questions],
        [tk("Open questions"), r.teaching.questionsOpen],
      ],
      lists: [],
    },
    {
      title: tk("Recruitment"),
      rows: [
        [tk("Jobs"), r.recruitment.jobs],
        [tk("Applications"), r.recruitment.applications],
        [tk("Certificates"), r.recruitment.certificates],
      ],
      lists: [[tk("Applications by status"), r.recruitment.applicationsByStatus]],
    },
    {
      title: tk("Platform"),
      rows: [
        [tk("Notifications"), r.platform.notifications],
        [tk("Unread notifications"), r.platform.unreadNotifications],
        [tk("Announcements"), r.platform.announcements],
        [tk("Pending approvals"), r.platform.pendingApprovals],
        [tk("Assistant conversations"), r.platform.assistantConversations],
      ],
      lists: [],
    },
  ];
}

/** The report as a CSV that opens in Excel (section, item, value), in the page's language. */
function exportCsv(r: SystemReport, t: TFunction) {
  const cell = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const lines: (string | number)[][] = [[t("Section"), t("Item"), t("Value")]];
  for (const g of groups(r)) {
    for (const [label, value] of g.rows) lines.push([t(g.title), t(label), value]);
    for (const [label, items] of g.lists) for (const i of items) lines.push([t(g.title), `${t(label)}: ${t(i.key)}`, i.count]);
  }
  const csv = "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `junior-hub-system-report-${r.generatedUtc.slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/** Review notes: "ريبورت فيها كل تفاصيل السستم". GET admin/reports/system, with CSV export and print (save as PDF). */
export function SystemReportPanel({ className = "" }: { className?: string }) {
  const t = useT();
  const report = useAdminData(getSystemReport, tk("We couldn't load the report. Please try again."));
  const r = report.data;

  return (
    <section id="system-report" className={`${card} ${className}`}>
      <header className="flex flex-wrap items-end justify-between gap-[0.8em]">
        <div>
          <h2 className="text-[1.2em] font-extrabold text-[#0b1b2b]">{t("Full System Report")}</h2>
          <p className="text-[0.78em] text-[#5b6b7c]">
            {r
              ? t("Every part of the system in numbers · generated {date}", {
                  date: new Date(r.generatedUtc).toLocaleString(dateLocale("en-GB"), {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  }),
                })
              : t("Every part of the system in numbers")}
          </p>
        </div>
        <div className="flex gap-[0.5em] text-[0.8em] print:hidden">
          <button
            type="button"
            disabled={!r}
            onClick={() => window.print()}
            className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#d5dee8] bg-white px-[1em] py-[0.5em] font-medium text-[#14365a] disabled:opacity-50"
          >
            <Printer className="size-[1em]" /> {t("Print / PDF")}
          </button>
          <button
            type="button"
            disabled={!r}
            onClick={() => r && exportCsv(r, t)}
            className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#06b6d4] px-[1em] py-[0.5em] font-semibold text-white disabled:opacity-50"
          >
            <Download className="size-[1em]" /> {t("Export Full Report")}
          </button>
        </div>
      </header>

      {!r ? (
        <LoadState error={report.error} onRetry={report.reload} />
      ) : (
        <div className="mt-[1em] grid gap-[1em] md:grid-cols-2 2xl:grid-cols-4">
          {groups(r).map((g) => (
            <article key={g.title} className="break-inside-avoid rounded-[0.9em] border border-[#e6edf3] p-[1em]">
              <h3 className="text-[0.95em] font-bold text-[#14365a]">{t(g.title)}</h3>
              <dl className="mt-[0.5em] grid gap-[0.3em] text-[0.78em]">
                {g.rows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-[0.8em]">
                    <dt className="text-[#5b6b7c]">{t(label)}</dt>
                    <dd className="font-bold text-[#0b1b2b]">{typeof value === "number" ? value.toLocaleString("en") : value}</dd>
                  </div>
                ))}
              </dl>
              {g.lists.map(([label, items]) =>
                items.length === 0 ? null : (
                  <div key={label} className="mt-[0.7em]">
                    <p className="text-[0.7em] font-bold uppercase tracking-wide text-[#8a97a6]">{t(label)}</p>
                    <ul className="mt-[0.3em] flex flex-wrap gap-[0.3em] text-[0.72em]">
                      {items.map((i) => (
                        <li key={i.key} className="rounded-full bg-[#eef3fa] px-[0.7em] py-[0.15em] text-[#14365a]">
                          {t(i.key)}: <b>{i.count}</b>
                        </li>
                      ))}
                    </ul>
                  </div>
                ),
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
