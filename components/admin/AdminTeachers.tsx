"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { BookOpenCheck, ClipboardList, Download, GraduationCap, MessageCircleQuestion, Search, UsersRound } from "lucide-react";
import { getAdminTeachers, STATUS_LABEL, type AdminTeacher } from "@/lib/admin-teachers-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminPage } from "./AdminPage";
import { INPUT, PANEL } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { initials, shortDate } from "./mentor-detail/format";

/** Downloads the teachers as a CSV file that opens in Excel. */
function exportRoster(teachers: AdminTeacher[]) {
  // A leading = + - @ would run as a formula in Excel, so it gets a quote in front.
  const esc = (v: string | number | null) => {
    const s = String(v ?? "");
    return `"${(/^[=+\-@]/.test(s) ? `'${s}` : s).replace(/"/g, '""')}"`;
  };
  const head = ["Name", "Email", "School", "Subjects", "Grades", "Classes", "Students", "Active this week", "Assignments", "To grade", "Open questions", "Average score", "Status", "Last sign-in"];
  const rows = teachers.map((x) => [
    x.fullName, x.email, x.schoolName, x.subjects.join(" / "), x.grades.join(" / "), x.classes, x.students, x.weeklyActive,
    x.assignments, x.toGrade, x.openQuestions, x.averageScore, x.status, x.lastLoginUtc?.slice(0, 10) ?? "",
  ]);
  const csv = "﻿" + [head, ...rows].map((r) => r.map(esc).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "teachers-roster.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const STATUS_STYLE: Record<string, string> = {
  Active: "bg-[#d7efe6] text-[#12676b]",
  PendingApproval: "bg-[#fff3d6] text-[#9a6a00]",
  Rejected: "bg-[#fdecec] text-[#b83232]",
};

/** Every teacher with their classes, students, grading and questions (27 Oct 2026). */
export default function AdminTeachers() {
  const { t } = useI18n();
  const page = useAdminData(getAdminTeachers, tk("We couldn't load the teachers. Please try again."));
  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("");

  const teachers = useMemo(() => page.data?.teachers ?? [], [page.data]);
  const subjects = useMemo(() => [...new Set(teachers.flatMap((x) => x.subjects))].sort(), [teachers]);
  const shown = teachers.filter(
    (x) =>
      (!subject || x.subjects.includes(subject)) &&
      (!query.trim() || `${x.fullName} ${x.email} ${x.schoolName}`.toLowerCase().includes(query.trim().toLowerCase())),
  );
  const s = page.data?.stats;
  const cards = [
    { icon: GraduationCap, label: t("Active Teachers"), value: s ? `${s.active} / ${s.teachers}` : "—" },
    { icon: UsersRound, label: t("Students Taught"), value: s ? String(s.students) : "—" },
    { icon: ClipboardList, label: t("Submissions to Grade"), value: s ? String(s.toGrade) : "—" },
    { icon: MessageCircleQuestion, label: t("Open Student Questions"), value: s ? String(s.openQuestions) : "—" },
    { icon: BookOpenCheck, label: t("Average Score"), value: s?.averageScore == null ? "—" : `${s.averageScore}%` },
  ];

  return (
    <AdminPage>
      <div className="pt-[calc(var(--u)*5.4)] lg:px-[calc(var(--u)*1.6)]">
        <section className="flex flex-wrap items-end justify-between gap-[1em]">
          <div>
            <nav aria-label={t("Breadcrumb")} className="text-[0.7em] font-medium text-[#5b6b7c]">
              <Link href={"/admin/dashboard" as Route} className="hover:underline">
                {t("Admin")}
              </Link>{" "}
              <span aria-hidden className="rtl:inline-block rtl:rotate-180">›</span> <span className="font-semibold text-[#0b6f86]">{t("Teachers Management")}</span>
            </nav>
            <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t("Teachers Management")}</h1>
            <p className="max-w-[36em] text-[0.85em] text-[#5b6b7c]">
              {t("Follow every teacher's classes, students, assignments, grading, questions and messages.")}
            </p>
          </div>
          <button
            type="button"
            onClick={() => exportRoster(shown)}
            disabled={shown.length === 0}
            className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#e1e8f0] bg-white px-[1.1em] py-[0.6em] text-[0.8em] font-semibold text-[#14365a] shadow-sm hover:bg-[#f1f6fb] disabled:opacity-50"
          >
            <Download className="size-[1em]" /> {t("Export Roster")}
          </button>
        </section>

        <ul className="mt-[1.2em] grid gap-[0.8em] min-[480px]:grid-cols-2 lg:grid-cols-5">
          {cards.map(({ icon: Icon, label, value }) => (
            <li key={label} className={`${PANEL} flex items-center gap-[0.8em] p-[1em]`}>
              <span className="grid size-[2.6em] shrink-0 place-items-center rounded-full bg-[#e6f1fb] text-[#0b6f86]">
                <Icon className="size-[1.2em]" />
              </span>
              <div className="min-w-0">
                <p className="text-[1.3em] font-extrabold text-[#0b1b2b]">{value}</p>
                <p className="truncate text-[0.72em] text-[#5b6b7c]">{label}</p>
              </div>
            </li>
          ))}
        </ul>

        <section className={`${PANEL} mt-[1.2em] p-[1.2em]`}>
          <div className="mb-[1em] flex flex-wrap items-center gap-[0.6em]">
            <label className="relative min-w-[14em] flex-1">
              <Search className="pointer-events-none absolute start-[0.8em] top-1/2 size-[0.9em] -translate-y-1/2 text-[#8a97a6]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("Search by name, email or school")}
                aria-label={t("Search")}
                className={`${INPUT} w-full ps-[2.4em]`}
              />
            </label>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label={t("Subject")} className={INPUT}>
              <option value="">{t("All subjects")}</option>
              {subjects.map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </select>
          </div>

          {!page.data ? (
            <LoadState error={page.error} onRetry={page.reload} />
          ) : shown.length === 0 ? (
            <p className="py-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No teachers match.")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[60em] text-start text-[0.8em]">
                <thead className="text-[0.85em] uppercase tracking-[0.06em] text-[#8a97a6]">
                  <tr className="[&>th]:px-[0.7em] [&>th]:py-[0.6em] [&>th]:text-start [&>th]:font-semibold">
                    <th>{t("Teacher")}</th>
                    <th>{t("Subjects & Grades")}</th>
                    <th>{t("Classes")}</th>
                    <th>{t("Students")}</th>
                    <th>{t("Assignments")}</th>
                    <th>{t("To Grade")}</th>
                    <th>{t("Questions")}</th>
                    <th>{t("Avg. Score")}</th>
                    <th>{t("Last Sign-in")}</th>
                  </tr>
                </thead>
                <tbody>
                  {shown.map((x) => (
                    <tr key={x.id} className="border-t border-[#eef2f7] text-[#14365a] hover:bg-[#f7fafd] [&>td]:px-[0.7em] [&>td]:py-[0.7em]">
                      <td>
                        <Link href={`/admin/teachers/${x.id}` as Route} className="flex items-center gap-[0.7em]">
                          <span className="grid size-[2.4em] shrink-0 place-items-center rounded-full bg-[#12939b] text-[0.85em] font-bold text-white">{initials(x.fullName)}</span>
                          <span className="min-w-0">
                            <span className="block font-bold text-[#0b1b2b] hover:underline">{x.fullName}</span>
                            <span className="block truncate text-[0.85em] text-[#5b6b7c]">{x.schoolName}</span>
                            {x.status !== "Active" && (
                              <span className={`mt-[0.2em] inline-block rounded-full px-[0.6em] text-[0.75em] font-semibold ${STATUS_STYLE[x.status] ?? "bg-[#eef2f7] text-[#5b6b7c]"}`}>
                                {t(STATUS_LABEL[x.status] ?? x.status)}
                              </span>
                            )}
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span className="block">{x.subjects.map((v) => t(v)).join(" • ")}</span>
                        <span className="text-[0.85em] text-[#5b6b7c]">{t("Grades {list}", { list: x.grades.join(", ") })}</span>
                      </td>
                      <td>{x.classes}</td>
                      <td>
                        {x.students}
                        <span className="block text-[0.85em] text-[#5b6b7c]">{t("{n} active this week", { n: x.weeklyActive })}</span>
                      </td>
                      <td>{x.assignments}</td>
                      <td>
                        <span className={x.overdue > 0 ? "font-bold text-[#b83232]" : ""}>{x.toGrade}</span>
                        {x.overdue > 0 && <span className="block text-[0.85em] text-[#b83232]">{t("{n} past due", { n: x.overdue })}</span>}
                      </td>
                      <td className={x.openQuestions > 0 ? "font-bold text-[#9a6a00]" : ""}>{x.openQuestions}</td>
                      <td>{x.averageScore == null ? "—" : `${x.averageScore}%`}</td>
                      <td className="text-[#5b6b7c]">{x.lastLoginUtc ? shortDate(x.lastLoginUtc) : t("Never")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </AdminPage>
  );
}
