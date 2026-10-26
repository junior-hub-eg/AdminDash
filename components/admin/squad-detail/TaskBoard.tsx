"use client";

import { useState } from "react";
import { ArrowDownUp, CheckCircle2, Hourglass, ListFilter, Plus, Rows3, UsersRound } from "lucide-react";
import type { AdminSquadMember, AdminSquadTask, SquadTaskStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { Avatar, shortDate } from "./parts";

const COLUMNS: { status: SquadTaskStatus; label: string; dot: string }[] = [
  { status: "ToDo", label: tk("To Do"), dot: "bg-[#3d4f61]" },
  { status: "InProgress", label: tk("In Progress"), dot: "bg-[#06b6d4]" },
  { status: "Review", label: tk("Review"), dot: "bg-[#3d4f61]" },
  { status: "Done", label: tk("Done"), dot: "bg-[#17935f]" },
];

type Sort = "points" | "recent" | "title";
const SORTS: { key: Sort; label: string }[] = [
  { key: "points", label: tk("Story Points") },
  { key: "recent", label: tk("Recently updated") },
  { key: "title", label: tk("Title") },
];

const UNASSIGNED = "__squad";

const CONTROL =
  "inline-flex h-[2.3em] items-center gap-[0.4em] rounded-[0.6em] bg-[#eef3fb] px-[0.8em] text-[0.74em] font-semibold text-[#14365a] hover:bg-[#e3ecf7]";

/**
 * The sprint's Kanban board, read from the squad's tasks (the students move their own tasks).
 * Filter by assignee, sort and compact mode work on the loaded tasks only.
 */
export function TaskBoard({
  sprintName,
  tasks,
  members,
  onAdd,
}: {
  sprintName: string | null;
  tasks: AdminSquadTask[];
  members: AdminSquadMember[];
  onAdd: () => void;
}) {
  const t = useT();
  const [assignee, setAssignee] = useState("all");
  const [sort, setSort] = useState<Sort>("points");
  const [compact, setCompact] = useState(false);
  const byId = new Map(members.map((m) => [m.studentId, m]));

  const shown = tasks
    .filter((x) => assignee === "all" || (assignee === UNASSIGNED ? !x.assigneeStudentId : x.assigneeStudentId === assignee))
    .sort((a, b) =>
      sort === "points"
        ? b.storyPoints - a.storyPoints
        : sort === "recent"
          ? new Date(b.updatedUtc).getTime() - new Date(a.updatedUtc).getTime()
          : a.title.localeCompare(b.title),
    );
  const sortLabel = SORTS.find((s) => s.key === sort)!.label;
  const nextSort = () => setSort(SORTS[(SORTS.findIndex((s) => s.key === sort) + 1) % SORTS.length].key);

  return (
    <section className="grid min-w-0 gap-[0.9em]">
      <header className={`${PANEL} flex flex-wrap items-center justify-between gap-[0.6em] px-[1.1em] py-[0.7em]`}>
        <p className="text-[0.9em] font-bold text-[#0b1b2b]">
          {sprintName ? t("{name} Board", { name: sprintName }) : t("Sprint Board")}
          <span className="ms-[0.7em] border-s border-[#dfe7f1] ps-[0.7em] text-[0.78em] font-medium text-[#5b6b7c]">
            {t("Showing {count} active sprint tasks", { count: shown.length })}
          </span>
        </p>

        <div className="flex flex-wrap items-center gap-[0.4em]">
          <label className={`${CONTROL} relative`}>
            <ListFilter className="size-[1.1em]" />
            <span className="sr-only">{t("Filter Assignee")}</span>
            <select
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
              className="max-w-[10em] cursor-pointer appearance-none bg-transparent font-semibold outline-none"
            >
              <option value="all">{t("Filter Assignee")}</option>
              {members.map((m) => (
                <option key={m.studentId} value={m.studentId}>
                  {m.fullName}
                </option>
              ))}
              <option value={UNASSIGNED}>{t("Whole Squad")}</option>
            </select>
          </label>
          <button type="button" onClick={nextSort} className={CONTROL} title={t("Change sort")}>
            <ArrowDownUp className="size-[1.1em]" /> {t("Sort: {by}", { by: t(sortLabel) })}
          </button>
          <button type="button" onClick={() => setCompact((c) => !c)} aria-pressed={compact} className={`${CONTROL} ${compact ? "!bg-[#14365a] text-white" : ""}`}>
            <Rows3 className="size-[1.1em]" /> {t("Compact")}
          </button>
        </div>
      </header>

      <div className="grid gap-[0.9em] sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = shown.filter((x) => x.status === col.status);
          const earned = items.reduce((n, x) => n + x.storyPoints, 0);
          return (
            <div key={col.status} className="flex min-w-0 flex-col gap-[0.6em] rounded-[1em] bg-[#eef3fb] p-[0.7em]">
              <div className="flex items-center justify-between gap-[0.4em] px-[0.2em] py-[0.2em]">
                <p className="flex items-center gap-[0.5em] text-[0.95em] font-bold text-[#0b1b2b]">
                  <span className={`size-[0.6em] rounded-full ${col.dot}`} />
                  {t(col.label)}
                  <span className="rounded-full bg-[#dbe5f1] px-[0.55em] text-[0.7em] text-[#3d4f61]">{items.length}</span>
                </p>
                {col.status === "Done" ? (
                  earned > 0 && (
                    <span className="text-end text-[0.66em] font-bold leading-tight text-[#0b6f86]">
                      {t("+{points} SP Earned", { points: earned })}
                    </span>
                  )
                ) : (
                  col.status === "ToDo" && (
                    <button type="button" onClick={onAdd} aria-label={t("Add Task")} className="text-[#3d4f61] hover:text-[#0b89a6]">
                      <Plus className="size-[1.1em]" />
                    </button>
                  )
                )}
              </div>

              {items.map((task) => {
                const member = task.assigneeStudentId ? byId.get(task.assigneeStudentId) : undefined;
                const done = task.status === "Done";
                return (
                  <article key={task.id} className={`rounded-[0.8em] bg-white shadow-[0_2px_8px_rgba(20,54,90,0.06)] ${compact ? "p-[0.6em]" : "p-[0.8em]"}`}>
                    <div className="flex items-start justify-between gap-[0.5em]">
                      <span
                        className={`inline-flex items-center gap-[0.3em] rounded-[0.4em] px-[0.55em] py-[0.15em] text-[0.66em] font-semibold ${
                          done ? "bg-[#dff7ea] text-[#17935f]" : "bg-[#e3f3fb] text-[#0b6f86]"
                        }`}
                      >
                        {done && <CheckCircle2 className="size-[1.1em]" />}
                        {member ? t(member.role) : t("Squad")}
                      </span>
                      <span dir="ltr" className="shrink-0 rounded-[0.4em] bg-[#eef3fb] px-[0.5em] py-[0.1em] text-[0.66em] font-semibold text-[#3d4f61]">
                        {task.storyPoints} SP
                      </span>
                    </div>

                    <h4
                      className={`mt-[0.45em] font-bold leading-snug ${compact ? "text-[0.85em]" : "text-[0.98em]"} ${
                        done ? "text-[#3d4f61] line-through decoration-[#3d4f61]/70" : "text-[#0b1b2b]"
                      }`}
                    >
                      {task.title}
                    </h4>

                    {!compact && task.description && <p className="mt-[0.3em] line-clamp-2 text-[0.72em] text-[#5b6b7c]">{task.description}</p>}

                    {!compact && task.status === "Review" && (
                      <p className="mt-[0.6em] flex items-center gap-[0.4em] rounded-[0.6em] bg-[#e3ecf9] px-[0.7em] py-[0.5em] text-[0.7em] font-medium text-[#3d4f61]">
                        <Hourglass className="size-[1.1em] shrink-0" /> {t("Pending Mentor Signoff")}
                      </p>
                    )}

                    <div className="mt-[0.6em] flex items-center justify-between gap-[0.5em] text-[0.72em] text-[#5b6b7c]">
                      <span className="flex min-w-0 items-center gap-[0.4em]">
                        {task.assigneeName ? (
                          <>
                            <Avatar name={task.assigneeName} photoUrl={member?.photoUrl ?? null} className="size-[1.9em]" />
                            <span className="truncate">{task.assigneeName}</span>
                          </>
                        ) : (
                          <>
                            <UsersRound className="size-[1.2em]" /> {t("Whole Squad")}
                          </>
                        )}
                      </span>
                      {done ? (
                        <span className="flex shrink-0 items-center gap-[0.3em] text-[#17935f]">
                          {task.completedUtc && <span className="text-[0.92em]">{shortDate(task.completedUtc)}</span>}
                          <CheckCircle2 className="size-[1.3em]" />
                        </span>
                      ) : (
                        task.status === "InProgress" && (
                          <span className="shrink-0 rounded-full bg-[#e0f6fc] px-[0.6em] py-[0.1em] text-[0.88em] font-semibold text-[#0b89a6]">
                            {t("In Progress")}
                          </span>
                        )
                      )}
                    </div>
                  </article>
                );
              })}

              {items.length === 0 && col.status !== "ToDo" && (
                <p className="py-[0.8em] text-center text-[0.72em] text-[#8a97a6]">{t("No tasks")}</p>
              )}

              {col.status === "ToDo" && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="rounded-[0.8em] border border-dashed border-[#b9c8d8] py-[0.7em] text-[0.75em] text-[#5b6b7c] hover:bg-white"
                >
                  + {t("Quick create task")}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
