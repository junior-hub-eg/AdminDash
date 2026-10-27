"use client";

import { useCallback, useState } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Download, Hash, LoaderCircle, Megaphone, User } from "lucide-react";
import {
  downloadTeacherReport,
  getTeacherAssignment,
  getTeacherAssignments,
  getTeacherCalendar,
  getTeacherChannel,
  getTeacherClasses,
  getTeacherDashboard,
  getTeacherMessages,
  getTeacherProgress,
  getTeacherQuestions,
  getTeacherStudentThread,
  getTeacherStudents,
  type AssignmentStatus,
  type MessageThread,
  type StudentStatus,
  type TeacherAssignmentDetail,
} from "@/lib/admin-teachers-api";
import { errorMessage } from "@/lib/api-client";
import { useI18n, useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { BTN_SECONDARY } from "../page-parts";
import { LoadState, useAdminData } from "../admin-data";
import { Bar, EmptyNote, Section, SOFT } from "../mentor-detail/parts";
import { dayTime, plainDate, shortDate } from "../mentor-detail/format";

const STATUS_COLOR: Record<StudentStatus, string> = {
  TopQuartile: "bg-[#d7efe6] text-[#12676b]",
  OnTrack: "bg-[#dff3fb] text-[#0b6f86]",
  NeedsAssistance: "bg-[#fdecec] text-[#b83232]",
};

const WORK_COLOR: Record<AssignmentStatus, string> = {
  Graded: "bg-[#d7efe6] text-[#12676b]",
  Submitted: "bg-[#dff3fb] text-[#0b6f86]",
  Late: "bg-[#fff3d6] text-[#9a6a00]",
  Missing: "bg-[#fdecec] text-[#b83232]",
  NotStarted: "bg-[#eef2f7] text-[#5b6b7c]",
};

const LABELS: Record<string, string> = {
  TopQuartile: tk("Top Quartile"),
  OnTrack: tk("On Track"),
  NeedsAssistance: tk("Needs Assistance"),
  NotStarted: tk("Not Started"),
  MissedDeadline: tk("Missed a deadline"),
  LowScore: tk("Low score"),
  Inactive: tk("Inactive"),
  JoinRequest: tk("Asks to join"),
};

function Pill({ value, color }: { value: string; color: string }) {
  const t = useT();
  return <span className={`inline-block whitespace-nowrap rounded-full px-[0.7em] py-[0.1em] text-[0.85em] font-semibold ${color}`}>{t(LABELS[value] ?? value)}</span>;
}

const pct = (v: number | null | undefined) => (v == null ? "—" : `${v}%`);

/** Loads one call of the teacher's pages for a tab. */
function useTeacherData<T>(id: string, load: (id: string) => Promise<T>, fail: string) {
  const call = useCallback(() => load(id), [id, load]);
  return useAdminData(call, fail);
}

// ---------- Overview ----------

export function TeacherOverviewTab({ id }: { id: string }) {
  const t = useT();
  const dash = useTeacherData(id, getTeacherDashboard, tk("We couldn't load the teacher's dashboard. Please try again."));
  const classes = useTeacherData(id, getTeacherClasses, tk("We couldn't load the classes. Please try again."));
  const d = dash.data;

  return (
    <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="grid min-w-0 gap-[1.2em]">
        <Section title={t("Classes")} sub={t("The teacher's school classes in their grades.")}>
          {!classes.data ? (
            <LoadState error={classes.error} onRetry={classes.reload} />
          ) : classes.data.length === 0 ? (
            <EmptyNote text={t("No classes yet.")} />
          ) : (
            <ul className="grid gap-[0.7em] md:grid-cols-2">
              {classes.data.map((c) => {
                const progress = d?.classProgress.find((p) => p.classId === c.id);
                return (
                  <li key={c.id} className={SOFT}>
                    <div className="flex items-start justify-between gap-[0.5em]">
                      <p className="font-bold text-[#0b1b2b]">{t("Class {name}", { name: c.name })}</p>
                      <span className="text-[0.7em] text-[#5b6b7c]" dir="ltr">{c.joinCode}</span>
                    </div>
                    <p className="text-[0.75em] text-[#5b6b7c]">
                      {t("{n} students", { n: c.students })} • {t("{n}% active", { n: c.activeRate })} • {t("Avg. {v}", { v: pct(c.averageScore) })}
                    </p>
                    {progress && (
                      <div className="mt-[0.5em] grid gap-[0.3em] text-[0.72em] text-[#14365a]">
                        <Bar pct={progress.percent} />
                        <span>{t("{n}% of the work handed in • {k} on track", { n: progress.percent, k: progress.onTrack })}</span>
                      </div>
                    )}
                    <p className="mt-[0.4em] text-[0.72em] text-[#5b6b7c]">
                      {c.currentPlan ? t("This week: {title}", { title: c.currentPlan }) : t("No lesson planned this week")}
                      {c.pendingRequests > 0 && <> • <b className="text-[#9a6a00]">{t("{n} join requests", { n: c.pendingRequests })}</b></>}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title={t("Students who need attention")} sub={t("Missed deadlines, low scores and students inactive for 7 days.")}>
          {!d ? (
            <LoadState error={dash.error} onRetry={dash.reload} />
          ) : d.alerts.length === 0 ? (
            <EmptyNote text={t("No student needs attention right now.")} />
          ) : (
            <ul className="grid gap-[0.5em]">
              {d.alerts.slice(0, 12).map((a, i) => (
                <li key={`${a.studentId}-${a.kind}-${i}`} className="flex flex-wrap items-center justify-between gap-[0.6em] rounded-[0.7em] bg-[#f7fafd] px-[0.9em] py-[0.6em] text-[0.8em]">
                  <span className="min-w-0">
                    <b className="text-[#0b1b2b]">{a.fullName}</b> <span className="text-[#5b6b7c]">• {a.className}</span>
                    {a.detail && <span className="block truncate text-[0.9em] text-[#5b6b7c]">{a.detail}</span>}
                  </span>
                  <Pill value={a.kind} color={a.kind === "JoinRequest" ? "bg-[#fff3d6] text-[#9a6a00]" : "bg-[#fdecec] text-[#b83232]"} />
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>

      <div className="grid min-w-0 gap-[1.2em]">
        <Section title={t("This Week")}>
          {!d ? (
            <LoadState error={dash.error} onRetry={dash.reload} />
          ) : (
            <ul className="grid grid-cols-2 gap-[0.6em] text-[0.8em]">
              {[
                [t("Enrolled"), d.stats.totalEnrolled],
                [t("Active this week"), d.stats.weeklyActive],
                [t("Due this week"), d.stats.dueThisWeek],
                [t("Average Score"), pct(d.stats.averageScore)],
                [t("Planned lessons"), d.stats.plannedLessons],
                [t("Need focus"), d.stats.needsFocus],
              ].map(([label, value]) => (
                <li key={String(label)} className={SOFT}>
                  <p className="text-[1.3em] font-extrabold text-[#0b1b2b]">{value}</p>
                  <p className="text-[0.85em] text-[#5b6b7c]">{label}</p>
                </li>
              ))}
            </ul>
          )}
        </Section>
        <Section title={t("Coming Up")}>
          {!d ? (
            <LoadState error={dash.error} onRetry={dash.reload} />
          ) : d.schedule.length === 0 ? (
            <EmptyNote text={t("Nothing due or planned soon.")} />
          ) : (
            <ul className="grid gap-[0.5em] text-[0.8em]">
              {d.schedule.slice(0, 8).map((s, i) => (
                <li key={i} className="flex items-start justify-between gap-[0.6em] border-b border-[#eef2f7] pb-[0.4em] last:border-0">
                  <span className="min-w-0">
                    <b className="block truncate text-[#0b1b2b]">{s.title}</b>
                    <span className="text-[#5b6b7c]">{s.className} • {s.kind === "Due" ? t("Due") : t("Lesson")}</span>
                  </span>
                  <span className="shrink-0 text-[#5b6b7c]">{shortDate(s.dateUtc)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  );
}

// ---------- Students ----------

export function TeacherStudentsTab({ id }: { id: string }) {
  const t = useT();
  const data = useTeacherData(id, getTeacherStudents, tk("We couldn't load the students. Please try again."));
  const [filter, setFilter] = useState<StudentStatus | "">("");
  const d = data.data;
  if (!d) return <Section title={t("Students")}><LoadState error={data.error} onRetry={data.reload} /></Section>;
  const rows = d.students.filter((s) => !filter || s.status === filter);
  const chips: [StudentStatus | "", string, number][] = [
    ["", t("All"), d.stats.total],
    ["NeedsAssistance", t("Needs Assistance"), d.stats.needsAssistance],
    ["OnTrack", t("On Track"), d.stats.onTrack],
    ["TopQuartile", t("Top Quartile"), d.stats.topQuartile],
  ];

  return (
    <Section title={t("Students")} sub={t("Average mastery: {v}", { v: pct(d.stats.averageMastery) })}>
      <div className="mb-[0.9em] flex flex-wrap gap-[0.4em] text-[0.75em]">
        {chips.map(([key, label, n]) => (
          <button
            key={key || "all"}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-full px-[0.9em] py-[0.3em] font-semibold ${filter === key ? "bg-[#06b6d4] text-white" : "bg-[#eef4fa] text-[#14365a]"}`}
          >
            {label} ({n})
          </button>
        ))}
      </div>
      {rows.length === 0 ? (
        <EmptyNote text={t("No students here.")} />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46em] text-[0.8em]">
            <thead className="text-[0.85em] uppercase text-[#8a97a6]">
              <tr className="[&>th]:px-[0.6em] [&>th]:py-[0.5em] [&>th]:text-start [&>th]:font-semibold">
                <th>{t("Student")}</th>
                <th>{t("Class")}</th>
                <th>{t("Lessons")}</th>
                <th>{t("Problems")}</th>
                <th>{t("Mastery")}</th>
                <th>{t("Time")}</th>
                <th>{t("Last active")}</th>
                <th>{t("Status")}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={`${s.classId}-${s.studentId}`} className="border-t border-[#eef2f7] text-[#14365a] [&>td]:px-[0.6em] [&>td]:py-[0.55em]">
                  <td>
                    <b className="block text-[#0b1b2b]">{s.fullName}</b>
                    <span className="text-[0.85em] text-[#5b6b7c]" dir="ltr">{s.email}</span>
                  </td>
                  <td>{s.className}</td>
                  <td>{s.lessonsDone} / {s.lessonsTotal}</td>
                  <td>{s.problemsSolved} / {s.problemsTotal}</td>
                  <td>{pct(s.mastery)}</td>
                  <td>{t("{n} min", { n: s.timeSpentMinutes })}</td>
                  <td className="text-[#5b6b7c]">{s.lastActiveUtc ? shortDate(s.lastActiveUtc) : "—"}</td>
                  <td><Pill value={s.status} color={STATUS_COLOR[s.status]} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Section>
  );
}

// ---------- Assignments ----------

function AssignmentStudents({ id, assignmentId }: { id: string; assignmentId: string }) {
  const t = useT();
  const load = useCallback(() => getTeacherAssignment(id, assignmentId), [id, assignmentId]);
  const data = useAdminData<TeacherAssignmentDetail>(load, tk("We couldn't load the assignment. Please try again."));
  if (!data.data) return <LoadState error={data.error} onRetry={data.reload} />;
  const a = data.data;
  return (
    <div className="grid gap-[0.5em] pt-[0.6em]">
      {a.instructions && <p className="text-[0.8em] text-[#14365a]">{a.instructions}</p>}
      <ul className="grid gap-[0.4em] text-[0.78em]">
        {a.students.map((s) => (
          <li key={s.studentId} className="rounded-[0.6em] bg-white px-[0.8em] py-[0.5em]">
            <div className="flex flex-wrap items-center justify-between gap-[0.5em]">
              <b className="text-[#0b1b2b]">{s.fullName}</b>
              <span className="flex items-center gap-[0.5em]">
                {s.score != null && <span className="font-bold text-[#14365a]">{s.score} / {a.maxPoints}</span>}
                <Pill value={s.status} color={WORK_COLOR[s.status]} />
              </span>
            </div>
            {s.answer && <p dir="auto" className="mt-[0.3em] whitespace-pre-wrap text-[#5b6b7c]">{s.answer}</p>}
            {s.feedback && <p className="mt-[0.2em] text-[#0b6f86]">{t("Teacher feedback: {text}", { text: s.feedback })}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TeacherAssignmentsTab({ id }: { id: string }) {
  const t = useT();
  const data = useTeacherData(id, getTeacherAssignments, tk("We couldn't load the assignments. Please try again."));
  const [open, setOpen] = useState<string | null>(null);
  const [now] = useState(() => Date.now());
  if (!data.data) return <Section title={t("Assignments & Grading")}><LoadState error={data.error} onRetry={data.reload} /></Section>;
  const list = [...data.data].sort((a, b) => b.dueUtc.localeCompare(a.dueUtc));

  return (
    <Section title={t("Assignments & Grading")} sub={t("Open an assignment to see every student's answer, score and feedback.")}>
      {list.length === 0 ? (
        <EmptyNote text={t("The teacher has not given any assignment yet.")} />
      ) : (
        <ul className="grid gap-[0.6em]">
          {list.map((a) => {
            const waiting = a.submitted - a.graded;
            const late = waiting > 0 && new Date(a.dueUtc).getTime() < now;
            return (
              <li key={a.id} className={SOFT}>
                <button type="button" aria-expanded={open === a.id} onClick={() => setOpen(open === a.id ? null : a.id)} className="flex w-full flex-wrap items-center justify-between gap-[0.6em] text-start">
                  <span className="min-w-0">
                    <b className="block text-[#0b1b2b]">{a.title}</b>
                    <span className="text-[0.75em] text-[#5b6b7c]">
                      {a.className} • {t(a.subject)} • {t("Due {date}", { date: shortDate(a.dueUtc) })}
                    </span>
                  </span>
                  <span className="flex items-center gap-[0.8em] text-[0.75em] text-[#14365a]">
                    <span>{t("{s}/{n} handed in", { s: a.submitted, n: a.enrolled })}</span>
                    <span className={late ? "font-bold text-[#b83232]" : waiting > 0 ? "font-bold text-[#9a6a00]" : ""}>
                      {t("{n} to grade", { n: waiting })}
                    </span>
                    <span>{t("Avg. {v}", { v: pct(a.averagePercent) })}</span>
                    <ChevronDown className={`size-[1.1em] transition-transform ${open === a.id ? "rotate-180" : ""}`} />
                  </span>
                </button>
                {open === a.id && <AssignmentStudents id={id} assignmentId={a.id} />}
              </li>
            );
          })}
        </ul>
      )}
    </Section>
  );
}

// ---------- Questions ----------

export function TeacherQuestionsTab({ id }: { id: string }) {
  const t = useT();
  const data = useTeacherData(id, getTeacherQuestions, tk("We couldn't load the questions. Please try again."));
  if (!data.data) return <Section title={t("Student Questions")}><LoadState error={data.error} onRetry={data.reload} /></Section>;
  const list = [...data.data].sort((a, b) => Number(!!a.answeredUtc) - Number(!!b.answeredUtc) || b.createdUtc.localeCompare(a.createdUtc));
  return (
    <Section title={t("Student Questions")} sub={t("Unanswered questions first.")}>
      {list.length === 0 ? (
        <EmptyNote text={t("No student has asked a question yet.")} />
      ) : (
        <ul className="grid gap-[0.6em] text-[0.8em]">
          {list.map((q) => (
            <li key={q.id} className={SOFT}>
              <div className="flex flex-wrap items-center justify-between gap-[0.5em]">
                <span><b className="text-[#0b1b2b]">{q.studentName}</b> <span className="text-[#5b6b7c]">• {q.className} • {dayTime(q.createdUtc)}</span></span>
                {q.answeredUtc ? (
                  <span className="rounded-full bg-[#d7efe6] px-[0.7em] py-[0.1em] text-[0.85em] font-semibold text-[#12676b]">{t("Answered")}</span>
                ) : (
                  <span className="rounded-full bg-[#fff3d6] px-[0.7em] py-[0.1em] text-[0.85em] font-semibold text-[#9a6a00]">{t("Waiting")}</span>
                )}
              </div>
              <p dir="auto" className="mt-[0.3em] whitespace-pre-wrap text-[#14365a]">{q.text}</p>
              {q.answer && (
                <p className="mt-[0.4em] whitespace-pre-wrap rounded-[0.6em] bg-white px-[0.8em] py-[0.5em] text-[#0b6f86]">
                  {q.answer} <span className="text-[0.85em] text-[#8a97a6]">• {q.answeredUtc && dayTime(q.answeredUtc)}</span>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

// ---------- Messages ----------

type Open = { kind: "class" | "student"; key: string } | null;

export function TeacherMessagesTab({ id }: { id: string }) {
  const t = useT();
  const data = useTeacherData(id, getTeacherMessages, tk("We couldn't load the messages. Please try again."));
  const [open, setOpen] = useState<Open>(null);
  const [thread, setThread] = useState<MessageThread | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function show(next: Open) {
    if (!next) return;
    setOpen(next);
    setThread(null);
    setError(null);
    setLoading(true);
    try {
      setThread(next.kind === "class" ? await getTeacherChannel(id, next.key) : await getTeacherStudentThread(id, next.key));
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't load the conversation. Please try again.")));
    } finally {
      setLoading(false);
    }
  }

  if (!data.data) return <Section title={t("Messages")}><LoadState error={data.error} onRetry={data.reload} /></Section>;
  const d = data.data;
  const item = (active: boolean) =>
    `flex w-full items-start gap-[0.6em] rounded-[0.7em] px-[0.8em] py-[0.6em] text-start text-[0.78em] ${active ? "bg-[#e0f6fc]" : "hover:bg-[#f4f8fd]"}`;

  return (
    <div className="grid items-start gap-[1.2em] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
      <Section
        title={t("Conversations")}
        sub={t("{n} unread by the teacher • average reply {m}", {
          n: d.stats.unreadDirect,
          m: d.stats.averageReplyMinutes == null ? "—" : t("{n} min", { n: d.stats.averageReplyMinutes }),
        })}
      >
        <p className="mb-[0.4em] text-[0.7em] font-bold uppercase tracking-[0.08em] text-[#8a97a6]">{t("Class Channels")}</p>
        <ul className="grid gap-[0.2em]">
          {d.channels.map((c) => (
            <li key={c.classId}>
              <button type="button" onClick={() => show({ kind: "class", key: c.classId })} className={item(open?.key === c.classId)}>
                <Hash className="mt-[0.2em] size-[1em] shrink-0 text-[#0b6f86]" />
                <span className="min-w-0 flex-1">
                  <b className="block text-[#0b1b2b]">{t("Class {name}", { name: c.name })} <span className="font-normal text-[#8a97a6]">({c.messages})</span></b>
                  <span className="block truncate text-[#5b6b7c]">{c.lastText ? `${c.lastSender}: ${c.lastText}` : t("No messages yet")}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mb-[0.4em] mt-[0.9em] text-[0.7em] font-bold uppercase tracking-[0.08em] text-[#8a97a6]">{t("Direct Messages")}</p>
        {d.direct.filter((m) => m.lastUtc).length === 0 ? (
          <EmptyNote text={t("No direct messages yet.")} />
        ) : (
          <ul className="grid gap-[0.2em]">
            {d.direct
              .filter((m) => m.lastUtc)
              .map((m) => (
                <li key={m.studentId}>
                  <button type="button" onClick={() => show({ kind: "student", key: m.studentId })} className={item(open?.key === m.studentId)}>
                    <User className="mt-[0.2em] size-[1em] shrink-0 text-[#0b6f86]" />
                    <span className="min-w-0 flex-1">
                      <b className="block text-[#0b1b2b]">
                        {m.fullName} <span className="font-normal text-[#8a97a6]">• {m.className}</span>
                      </b>
                      <span dir="auto" className="block truncate text-[#5b6b7c]">{m.lastText}</span>
                    </span>
                    {m.unread > 0 && <span className="rounded-full bg-[#06b6d4] px-[0.55em] text-[0.85em] font-bold text-white">{m.unread}</span>}
                  </button>
                </li>
              ))}
          </ul>
        )}
      </Section>

      <Section title={thread?.name ?? t("Conversation")} sub={t("Read only. Opening a conversation does not mark it read for the teacher.")}>
        {!open ? (
          <EmptyNote text={t("Choose a class channel or a student to read the conversation.")} />
        ) : loading ? (
          <div className="grid place-items-center py-[2em]"><LoaderCircle className="size-[1.6em] animate-spin text-[#0f7378]" /></div>
        ) : error ? (
          <p role="alert" className="text-[0.8em] text-[#b83232]">{error}</p>
        ) : thread && thread.messages.length === 0 ? (
          <EmptyNote text={t("No messages yet")} />
        ) : (
          <ul className="grid max-h-[32em] gap-[0.5em] overflow-y-auto pe-[0.3em] text-[0.8em]">
            {thread?.messages.map((m) => {
              const fromTeacher = m.senderRole === "Teacher";
              return (
                <li key={m.id} className={`max-w-[85%] rounded-[0.8em] px-[0.9em] py-[0.55em] ${fromTeacher ? "ms-auto bg-[#e0f6fc]" : "bg-[#f1f5fd]"}`}>
                  <p className="flex items-center gap-[0.4em] text-[0.8em] font-semibold text-[#5b6b7c]">
                    {m.broadcast && <Megaphone className="size-[1em] text-[#0b6f86]" />}
                    {m.senderName} • {dayTime(m.createdUtc)}
                  </p>
                  <p dir="auto" className="whitespace-pre-wrap text-[#0b1b2b]">{m.text}</p>
                </li>
              );
            })}
          </ul>
        )}
      </Section>
    </div>
  );
}

// ---------- Calendar ----------

const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/** This week's Sunday, as yyyy-MM-dd. */
function thisSunday() {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return isoDay(d);
}

/** A yyyy-MM-dd day moved by `days`. */
function shiftDay(day: string, days: number) {
  const [y, m, d] = day.split("-").map(Number);
  return isoDay(new Date(y, m - 1, d + days, 12));
}

export function TeacherCalendarTab({ id }: { id: string }) {
  const t = useT();
  const [thisWeek] = useState(thisSunday);
  const [fromKey, setFromKey] = useState(thisWeek);
  const toKey = shiftDay(fromKey, 7);
  const load = useCallback(() => getTeacherCalendar(id, fromKey, toKey), [id, fromKey, toKey]);
  const data = useAdminData(load, tk("We couldn't load the calendar. Please try again."));
  const items = [...(data.data?.items ?? [])].sort((a, b) => a.startUtc.localeCompare(b.startUtc));

  return (
    <Section
      title={t("Calendar")}
      sub={`${plainDate(fromKey)} – ${plainDate(shiftDay(fromKey, 6))}`}
      action={
        <span className="flex gap-[0.4em]">
          <button type="button" aria-label={t("Previous week")} onClick={() => setFromKey(shiftDay(fromKey, -7))} className={BTN_SECONDARY}><ChevronLeft className="size-[1em] rtl:rotate-180" /></button>
          <button type="button" onClick={() => setFromKey(thisWeek)} className={BTN_SECONDARY}>{t("This week")}</button>
          <button type="button" aria-label={t("Next week")} onClick={() => setFromKey(shiftDay(fromKey, 7))} className={BTN_SECONDARY}><ChevronRight className="size-[1em] rtl:rotate-180" /></button>
        </span>
      }
    >
      {!data.data ? (
        <LoadState error={data.error} onRetry={data.reload} />
      ) : (
        <>
          {data.data.channels.length > 0 && (
            <ul className="mb-[0.9em] flex flex-wrap gap-[0.4em] text-[0.72em]">
              {data.data.channels.map((c) => (
                <li key={c.kind} className="rounded-full bg-[#eef4fa] px-[0.8em] py-[0.25em] font-semibold text-[#14365a]">
                  {t(c.kind)}: {c.count} • {t("{n} hrs", { n: c.hours })}
                </li>
              ))}
            </ul>
          )}
          {items.length === 0 ? (
            <EmptyNote text={t("Nothing on the calendar this week.")} />
          ) : (
            <ul className="grid gap-[0.5em] text-[0.8em]">
              {items.map((e) => (
                <li key={`${e.source}-${e.id}-${e.startUtc}`} className="flex flex-wrap items-start justify-between gap-[0.6em] rounded-[0.7em] bg-[#f7fafd] px-[0.9em] py-[0.6em]">
                  <span className="min-w-0">
                    <b className="block text-[#0b1b2b]">{e.title}</b>
                    <span className="text-[#5b6b7c]">
                      {t(e.source === "Event" ? e.kind : e.source === "Due" ? "Due" : "Lesson")}
                      {e.className && <> • {e.className}</>}
                      {e.studentName && <> • {e.studentName}</>}
                      {e.location && <> • {e.location}</>}
                    </span>
                  </span>
                  <span className="shrink-0 text-[#5b6b7c]">{dayTime(e.startUtc)}</span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </Section>
  );
}

// ---------- Progress ----------

export function TeacherProgressTab({ id }: { id: string }) {
  const { t, locale } = useI18n();
  const data = useTeacherData(id, getTeacherProgress, tk("We couldn't load the progress. Please try again."));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function exportReport() {
    setBusy(true);
    setError(null);
    try {
      await downloadTeacherReport(id, locale === "ar" ? "ar" : "en");
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't download the report. Please try again.")));
    } finally {
      setBusy(false);
    }
  }

  const d = data.data;
  return (
    <Section
      title={t("Progress")}
      sub={d ? (d.basis === "Grammar" ? t("By grammar topic") : t("By graded assignment")) : undefined}
      action={
        <button type="button" onClick={exportReport} disabled={busy} className={BTN_SECONDARY}>
          {busy ? <LoaderCircle className="size-[1em] animate-spin" /> : <Download className="size-[1em]" />} {t("Export Class Report (Excel)")}
        </button>
      }
    >
      {error && <p role="alert" className="mb-[0.6em] text-[0.8em] text-[#b83232]">{error}</p>}
      {!d ? (
        <LoadState error={data.error} onRetry={data.reload} />
      ) : (
        <div className="grid gap-[1em]">
          <ul className="grid grid-cols-2 gap-[0.6em] text-[0.8em] md:grid-cols-4">
            {[
              [t("Mastery"), pct(d.stats.mastery)],
              [t("Ready"), `${d.stats.ready} / ${d.stats.total}`],
              [t("Need focus"), d.stats.needsFocus],
              [t("Weekly hours per student"), d.stats.weeklyHoursPerStudent],
            ].map(([label, value]) => (
              <li key={String(label)} className={SOFT}>
                <p className="text-[1.3em] font-extrabold text-[#0b1b2b]">{value}</p>
                <p className="text-[0.85em] text-[#5b6b7c]">{label}</p>
              </li>
            ))}
          </ul>
          {d.skillGaps.length > 0 && (
            <div>
              <p className="mb-[0.4em] text-[0.8em] font-bold text-[#0b1b2b]">{t("Skill Gaps")}</p>
              <ul className="grid gap-[0.4em] text-[0.75em] md:grid-cols-2">
                {d.skillGaps.map((g) => (
                  <li key={g.title} className="grid gap-[0.2em]">
                    <span className="flex justify-between text-[#14365a]"><span>{g.title}</span><b>{g.percent}%</b></span>
                    <Bar pct={g.percent} color={g.percent < 50 ? "#d92d2d" : "#f59e0b"} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          {d.rows.length === 0 ? (
            <EmptyNote text={t("No grades yet.")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[0.75em]">
                <thead className="text-[#8a97a6]">
                  <tr className="[&>th]:px-[0.5em] [&>th]:py-[0.4em] [&>th]:text-start [&>th]:font-semibold">
                    <th>{t("Student")}</th>
                    {d.columns.map((c) => <th key={c.key}>{c.title}</th>)}
                    <th>{t("Mastery")}</th>
                    <th>{t("Status")}</th>
                  </tr>
                </thead>
                <tbody>
                  {d.rows.map((r) => (
                    <tr key={r.studentId} className="border-t border-[#eef2f7] text-[#14365a] [&>td]:px-[0.5em] [&>td]:py-[0.4em]">
                      <td><b className="text-[#0b1b2b]">{r.fullName}</b> <span className="text-[#8a97a6]">{r.className}</span></td>
                      {r.scores.map((s, i) => <td key={i}>{pct(s)}</td>)}
                      <td className="font-bold">{pct(r.mastery)}</td>
                      <td><Pill value={r.status} color={STATUS_COLOR[r.status]} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
