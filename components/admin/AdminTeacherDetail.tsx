"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { ArrowLeft, CalendarDays, ClipboardList, GraduationCap, LayoutDashboard, Mail, MessageCircleQuestion, School, UsersRound } from "lucide-react";
import { getAdminTeacher, STATUS_LABEL } from "@/lib/admin-teachers-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, PANEL } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { initials, shortDate } from "./mentor-detail/format";
import {
  TeacherAssignmentsTab,
  TeacherCalendarTab,
  TeacherMessagesTab,
  TeacherOverviewTab,
  TeacherProgressTab,
  TeacherQuestionsTab,
  TeacherStudentsTab,
} from "./teacher-detail/tabs";

type Tab = "overview" | "students" | "assignments" | "questions" | "messages" | "calendar" | "progress";

/** One teacher, as the teacher sees their own pages: classes, students, assignments, questions, messages, calendar and progress. */
export default function AdminTeacherDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getAdminTeacher(id), [id]);
  const teacher = useAdminData(load, tk("We couldn't load this teacher. Please try again."));
  const [tab, setTab] = useState<Tab>("overview");
  const x = teacher.data;

  const tabs: { key: Tab; label: string; count?: number }[] = x
    ? [
        { key: "overview", label: t("Overview") },
        { key: "students", label: t("Students"), count: x.students },
        { key: "assignments", label: t("Assignments & Grading"), count: x.assignments },
        { key: "questions", label: t("Student Questions"), count: x.openQuestions },
        { key: "messages", label: t("Messages") },
        { key: "calendar", label: t("Calendar") },
        { key: "progress", label: t("Progress") },
      ]
    : [];

  const kpis = x
    ? [
        { icon: School, value: String(x.classes), label: t("Classes") },
        { icon: UsersRound, value: `${x.weeklyActive} / ${x.students}`, label: t("Students active this week") },
        { icon: ClipboardList, value: String(x.toGrade), label: x.overdue ? t("To grade ({n} past due)", { n: x.overdue }) : t("Submissions to Grade") },
        { icon: MessageCircleQuestion, value: String(x.openQuestions), label: t("Open Student Questions") },
        { icon: GraduationCap, value: x.averageScore == null ? "—" : `${x.averageScore}%`, label: t("Average Score") },
      ]
    : [];

  return (
    <AdminSurface>
      <Link href={"/admin/teachers" as Route} className="inline-flex items-center gap-[0.4em] text-[0.85em] font-semibold text-[#14365a] hover:underline">
        <ArrowLeft className="size-[1em] rtl:rotate-180" /> {t("All teachers")}
      </Link>

      {!x ? (
        <LoadState error={teacher.error} onRetry={teacher.reload} />
      ) : (
        <>
          <section className={`${PANEL} p-[1.5em]`}>
            <div className="flex flex-wrap items-start gap-[1.2em]">
              <span className="grid size-[5em] shrink-0 place-items-center rounded-[1em] bg-[#12939b] text-[1.4em] font-extrabold text-white">{initials(x.fullName)}</span>
              <div className="min-w-0 flex-1">
                <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{x.fullName}</h1>
                <div className="mt-[0.4em] flex flex-wrap gap-[0.4em] text-[0.7em] font-semibold">
                  <span className={`rounded-full px-[0.8em] py-[0.2em] ${x.status === "Active" ? "bg-[#d7efe6] text-[#12676b]" : "bg-[#fff3d6] text-[#9a6a00]"}`}>{t(STATUS_LABEL[x.status] ?? x.status)}</span>
                  {x.subjects.map((s) => (
                    <span key={s} className="rounded-full bg-[#dff3fb] px-[0.8em] py-[0.2em] text-[#0b6f86]">{t(s)}</span>
                  ))}
                  <span className="rounded-full bg-[#eef2f7] px-[0.8em] py-[0.2em] text-[#14365a]">{t("Grades {list}", { list: x.grades.join(", ") })}</span>
                </div>
                <ul className="mt-[0.6em] grid gap-[0.25em] text-[0.78em] text-[#5b6b7c]">
                  <li className="flex items-center gap-[0.5em]"><School className="size-[1em]" /> {x.schoolName}</li>
                  <li className="flex items-center gap-[0.5em]"><Mail className="size-[1em]" /> <span dir="ltr">{x.email}</span></li>
                  <li className="flex items-center gap-[0.5em]">
                    <CalendarDays className="size-[1em]" /> {t("Joined {date}", { date: shortDate(x.createdUtc) })} •{" "}
                    {x.lastLoginUtc ? t("Last sign-in {date}", { date: shortDate(x.lastLoginUtc) }) : t("Never signed in")}
                  </li>
                </ul>
              </div>
              <a href={`mailto:${x.email}`} className="inline-flex items-center gap-[0.5em] rounded-[0.7em] border border-[#e1e8f0] bg-white px-[1.1em] py-[0.6em] text-[0.85em] font-semibold text-[#14365a] hover:bg-[#f1f6fb]">
                <Mail className="size-[1em]" /> {t("Email Teacher")}
              </a>
            </div>
            <ul className="mt-[1.3em] grid gap-[0.7em] rounded-[1em] bg-[#f4f8fd] p-[0.8em] min-[480px]:grid-cols-2 lg:grid-cols-5">
              {kpis.map(({ icon: Icon, value, label }) => (
                <li key={label} className="flex min-w-0 items-center gap-[0.7em] rounded-[0.8em] bg-white p-[0.8em]">
                  <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#e6f1fb] text-[#0b6f86]">
                    <Icon className="size-[1.1em]" />
                  </span>
                  <div className="min-w-0">
                    <p className="font-bold text-[#0b1b2b]">{value}</p>
                    <p className="truncate text-[0.7em] text-[#8a97a6]">{label}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div role="tablist" className="flex gap-[0.3em] overflow-x-auto rounded-[0.9em] bg-white/80 p-[0.35em] text-[0.8em] shadow-[0_4px_14px_rgba(20,54,90,0.05)] [scrollbar-width:none]">
            {tabs.map((v) => (
              <button
                key={v.key}
                type="button"
                role="tab"
                aria-selected={tab === v.key}
                onClick={() => setTab(v.key)}
                className={`inline-flex shrink-0 items-center gap-[0.4em] whitespace-nowrap rounded-[0.6em] px-[1em] py-[0.55em] font-semibold ${
                  tab === v.key ? "bg-white text-[#0b6f86] shadow-[0_2px_8px_rgba(20,54,90,0.1)]" : "text-[#14365a] hover:bg-white"
                }`}
              >
                {v.key === "overview" && <LayoutDashboard className="size-[1em]" />}
                {v.label}
                {v.count !== undefined && <span className="rounded-full bg-[#e6f1fb] px-[0.6em] py-[0.05em] text-[0.85em] text-[#0b6f86]">{v.count}</span>}
              </button>
            ))}
          </div>

          {x.status !== "Active" ? (
            <p className={`${PANEL} p-[1.5em] text-center text-[0.85em] text-[#5b6b7c]`}>{t("This teacher's account is not active yet, so there is nothing to follow.")}</p>
          ) : tab === "overview" ? (
            <TeacherOverviewTab id={id} />
          ) : tab === "students" ? (
            <TeacherStudentsTab id={id} />
          ) : tab === "assignments" ? (
            <TeacherAssignmentsTab id={id} />
          ) : tab === "questions" ? (
            <TeacherQuestionsTab id={id} />
          ) : tab === "messages" ? (
            <TeacherMessagesTab id={id} />
          ) : tab === "calendar" ? (
            <TeacherCalendarTab id={id} />
          ) : (
            <TeacherProgressTab id={id} />
          )}
        </>
      )}
    </AdminSurface>
  );
}
