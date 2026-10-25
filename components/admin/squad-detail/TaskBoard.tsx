"use client";

import { CheckCircle2, Plus } from "lucide-react";
import type { AdminSquadTask, SquadTaskStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";
import { Avatar } from "./parts";

const COLUMNS: { status: SquadTaskStatus; label: string; dot: string }[] = [
  { status: "ToDo", label: tk("To Do"), dot: "bg-[#5b6b7c]" },
  { status: "InProgress", label: tk("In Progress"), dot: "bg-[#06b6d4]" },
  { status: "Review", label: tk("Review"), dot: "bg-[#5b6b7c]" },
  { status: "Done", label: tk("Done"), dot: "bg-[#17935f]" },
];

/** The sprint's Kanban board, read from the squad's tasks. The students move their own tasks. */
export function TaskBoard({ sprintName, tasks, onAdd }: { sprintName: string | null; tasks: AdminSquadTask[]; onAdd: () => void }) {
  const t = useT();
  return (
    <section className="grid gap-[0.9em]">
      <header className={`${PANEL} flex flex-wrap items-center justify-between gap-[0.6em] px-[1.1em] py-[0.8em]`}>
        <p className="text-[0.9em] font-bold text-[#0b1b2b]">
          {sprintName ? t("{name} Board", { name: sprintName }) : t("Sprint Board")}
          <span className="ms-[0.8em] border-s border-[#dfe7f1] ps-[0.8em] text-[0.8em] font-normal text-[#5b6b7c]">
            {t("Showing {count} sprint tasks", { count: tasks.length })}
          </span>
        </p>
      </header>

      <div className="grid gap-[0.9em] sm:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const items = tasks.filter((x) => x.status === col.status);
          return (
            <div key={col.status} className="flex min-w-0 flex-col gap-[0.6em] rounded-[1em] bg-[#eef3f9] p-[0.7em]">
              <div className="flex items-center justify-between px-[0.2em]">
                <p className="flex items-center gap-[0.5em] text-[0.9em] font-bold text-[#0b1b2b]">
                  <span className={`size-[0.55em] rounded-full ${col.dot}`} />
                  {t(col.label)}
                  <span className="rounded-full bg-white px-[0.5em] text-[0.75em] text-[#5b6b7c]">{items.length}</span>
                </p>
                {col.status === "ToDo" && (
                  <button type="button" onClick={onAdd} aria-label={t("Add Task")} className="text-[#5b6b7c] hover:text-[#0b89a6]">
                    <Plus className="size-[1.1em]" />
                  </button>
                )}
              </div>

              {items.map((task) => (
                <article key={task.id} className="rounded-[0.8em] bg-white p-[0.8em] shadow-sm">
                  <div className="flex items-start justify-between gap-[0.5em]">
                    <h4
                      className={`text-[0.85em] font-bold leading-snug text-[#0b1b2b] ${task.status === "Done" ? "line-through decoration-[#0b1b2b]/50" : ""}`}
                    >
                      {task.title}
                    </h4>
                    <span className="shrink-0 rounded-md bg-[#eef3f9] px-[0.45em] py-[0.1em] text-[0.68em] font-semibold text-[#5b6b7c]">
                      {task.storyPoints} SP
                    </span>
                  </div>
                  {task.description && <p className="mt-[0.3em] line-clamp-2 text-[0.72em] text-[#5b6b7c]">{task.description}</p>}
                  <div className="mt-[0.6em] flex items-center justify-between gap-[0.5em] text-[0.72em] text-[#5b6b7c]">
                    <span className="flex min-w-0 items-center gap-[0.4em]">
                      {task.assigneeName ? (
                        <>
                          <Avatar name={task.assigneeName} photoUrl={null} className="size-[1.8em]" />
                          <span className="truncate">{task.assigneeName}</span>
                        </>
                      ) : (
                        t("Whole Squad")
                      )}
                    </span>
                    {task.status === "Done" && <CheckCircle2 className="size-[1.2em] shrink-0 text-[#17935f]" />}
                  </div>
                </article>
              ))}

              {col.status === "ToDo" && (
                <button
                  type="button"
                  onClick={onAdd}
                  className="rounded-[0.8em] border border-dashed border-[#b9c8d8] py-[0.6em] text-[0.75em] text-[#5b6b7c] hover:bg-white"
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
