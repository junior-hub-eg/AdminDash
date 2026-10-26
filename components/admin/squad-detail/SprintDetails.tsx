"use client";

import { useCallback, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { CalendarClock, CalendarDays, CheckCircle2, Flame, Hourglass, TriangleAlert } from "lucide-react";
import { getAdminSquadMonitorView, type AdminSprint, type AdminSquadMonitorView, type SquadTaskStatus } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminDialog } from "../AdminPageFrame";
import { LoadState, useAdminData } from "../admin-data";
import { Avatar, Bar, shortDate } from "./parts";

const COLUMNS: { status: SquadTaskStatus; label: string; dot: string }[] = [
  { status: "ToDo", label: tk("To Do"), dot: "bg-[#3d4f61]" },
  { status: "InProgress", label: tk("In Progress"), dot: "bg-[#06b6d4]" },
  { status: "Review", label: tk("Review"), dot: "bg-[#f59e0b]" },
  { status: "Done", label: tk("Done"), dot: "bg-[#17935f]" },
];

const DELAY_REASONS: Record<string, string> = {
  TechnicalBlock: tk("Technical block"),
  MissingMember: tk("Missing member"),
  ScopeTooBig: tk("Scope too big"),
  Other: tk("Other"),
};

const ROLE_LABEL = (role: string) => (role === "UIUX" ? "UI/UX" : role);

/** Done, running or planned, the way the monitor's sprint timeline shows it. */
function sprintState(s: AdminSprint) {
  if (s.status === "Closed" || s.progress >= 100) return { label: tk("Done"), cls: "bg-[#dff7ea] text-[#17935f]" };
  if (s.status === "Active") return { label: tk("In progress"), cls: "bg-[#e0f6fc] text-[#0b6f86]" };
  return { label: tk("Planned"), cls: "bg-[#eef1f5] text-[#5b6b7c]" };
}

/**
 * A sprint's name that opens the sprint's details: dates, progress, its board, the members' share and delays.
 * The details are the squad as its monitor sees it (GET admin/squads/{id}/monitor-detail).
 */
export function SprintLink({
  squadId,
  sprintId,
  children,
  className = "",
}: {
  squadId: string;
  sprintId: string | null;
  children: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        aria-haspopup="dialog"
        className={`cursor-pointer text-start underline decoration-dotted underline-offset-[0.2em] hover:decoration-solid ${className}`}
      >
        {children}
      </button>
      {/* On the body, so the dialog is never inside the name's <p> or the card's link. */}
      {open &&
        createPortal(
          <div onClick={(e) => e.stopPropagation()}>
            <SprintDetailsDialog squadId={squadId} sprintId={sprintId} onClose={() => setOpen(false)} />
          </div>,
          document.body,
        )}
    </>
  );
}

export function SprintDetailsDialog({ squadId, sprintId, onClose }: { squadId: string; sprintId: string | null; onClose: () => void }) {
  const load = useCallback(() => getAdminSquadMonitorView(squadId), [squadId]);
  const res = useAdminData(load, tk("We couldn't load this sprint. Please try again."));
  return (
    <AdminDialog open wide title={tk("Sprint details")} onClose={onClose}>
      {res.data ? <SprintDetails view={res.data} initial={sprintId} /> : <LoadState error={res.error} onRetry={res.reload} />}
    </AdminDialog>
  );
}

function SprintDetails({ view, initial }: { view: AdminSquadMonitorView; initial: string | null }) {
  const t = useT();
  const fallback = view.sprints.find((s) => s.status === "Active") ?? view.sprints[view.sprints.length - 1];
  const [sprintId, setSprintId] = useState(initial && view.sprints.some((s) => s.id === initial) ? initial : (fallback?.id ?? ""));
  const [role, setRole] = useState("all");
  const [now] = useState(() => Date.now());
  const sprint = view.sprints.find((s) => s.id === sprintId);

  if (!sprint) return <p className="py-[2em] text-center text-[0.85em] text-[#8a97a6]">{t("No sprint yet")}</p>;

  const all = view.board.filter((b) => b.sprintId === sprint.id);
  const roles = [...new Set(all.map((b) => b.role).filter((r): r is string => !!r))];
  const tasks = all.filter((b) => role === "all" || b.role === role);
  const pointsTotal = all.reduce((n, x) => n + x.storyPoints, 0);
  const pointsDone = all.filter((x) => x.status === "Done").reduce((n, x) => n + x.storyPoints, 0);
  const daysLeft = Math.ceil((new Date(sprint.endDate).getTime() - now) / 86_400_000);
  const state = sprintState(sprint);
  const delays = view.delays.filter((d) => d.sprintId === sprint.id);
  const dateChange = sprint.status === "Active" ? view.pendingDateChange : null;
  const share = view.members.map((m) => {
    const mine = all.filter((x) => x.assigneeId === m.studentId);
    const done = mine.filter((x) => x.status === "Done");
    return { ...m, total: mine.length, done: done.length, points: done.reduce((n, x) => n + x.storyPoints, 0) };
  });
  const unassigned = all.filter((x) => !x.assigneeId).length;

  return (
    <div className="grid gap-[1.1em] text-[0.92rem]">
      <div className="flex flex-wrap items-start justify-between gap-[0.8em]">
        <div className="min-w-0">
          <p className="text-[0.78em] text-[#5b6b7c]">
            {view.squad.name} · {view.squad.projectTitle}
          </p>
          <div className="mt-[0.2em] flex flex-wrap items-center gap-[0.5em]">
            <h3 className="text-[1.3em] font-extrabold text-[#0b1b2b]">{sprint.name}</h3>
            <span className={`rounded-full px-[0.7em] py-[0.15em] text-[0.72em] font-semibold ${state.cls}`}>{t(state.label)}</span>
          </div>
        </div>
        {view.sprints.length > 1 && (
          <label className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#eef3fb] px-[0.8em] py-[0.4em] text-[0.78em] font-semibold">
            {t("Sprint")}
            <select value={sprint.id} onChange={(e) => setSprintId(e.target.value)} className="cursor-pointer bg-transparent outline-none">
              {view.sprints.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {/* The timeline of every sprint; a step opens that sprint. */}
      <ol className="grid gap-[0.6em]" style={{ gridTemplateColumns: `repeat(${Math.max(1, view.sprints.length)}, minmax(0, 1fr))` }}>
        {view.sprints.map((s, i) => {
          const finished = s.status === "Closed" || s.progress >= 100;
          return (
            <li key={s.id} className="relative min-w-0">
              {i < view.sprints.length - 1 && (
                <span className={`absolute start-[1.6em] top-[0.8em] h-[3px] w-[calc(100%-0.6em)] ${finished ? "bg-[#86c9a0]" : "bg-[#e6ebf1]"}`} />
              )}
              <button type="button" onClick={() => setSprintId(s.id)} className="relative block w-full text-start">
                <span
                  className={`grid size-[1.7em] place-items-center rounded-full text-[0.8em] text-white ${
                    s.id === sprint.id ? "ring-2 ring-[#06b6d4] ring-offset-2" : ""
                  } ${finished ? "bg-[#17935f]" : s.status === "Active" ? "bg-[#06b6d4]" : "bg-[#cbd5e1]"}`}
                >
                  {finished ? "✓" : i + 1}
                </span>
                <span className={`mt-[0.5em] block truncate text-[0.8em] font-semibold ${s.id === sprint.id ? "text-[#0b6f86]" : "text-[#0b1b2b]"}`}>{s.name}</span>
                <span className="block text-[0.7em] text-[#5b6b7c]">
                  {shortDate(s.startDate)} – {shortDate(s.endDate)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <ul className="grid grid-cols-2 gap-[0.7em] lg:grid-cols-4">
        <Stat icon={<CalendarDays className="size-[1em]" />} label={t("Sprint Duration")} value={`${shortDate(sprint.startDate)} – ${shortDate(sprint.endDate)}`}>
          <span className="inline-flex items-center gap-[0.3em]">
            <Hourglass className="size-[1em]" />
            {sprint.status !== "Active" ? t(state.label) : daysLeft >= 0 ? t("{days} days remaining", { days: daysLeft }) : t("Sprint ended")}
          </span>
        </Stat>
        <Stat icon={<CheckCircle2 className="size-[1em]" />} label={t("Task Completion")} value={`${Math.round(sprint.progress)}%`}>
          <Bar value={sprint.progress} />
          <span className="mt-[0.3em] block">{t("{done} / {total} Tasks", { done: sprint.tasksDone, total: sprint.tasksTotal })}</span>
        </Stat>
        <Stat icon={<Flame className="size-[1em]" />} label={t("Story Points Burned")} value={<span dir="ltr">{pointsDone} / {pointsTotal} SP</span>}>
          <Bar value={pointsTotal ? (pointsDone / pointsTotal) * 100 : 0} color="bg-[#0f5f6b]" />
        </Stat>
        <Stat icon={<TriangleAlert className="size-[1em]" />} label={t("Delays")} value={delays.length}>
          {t("Marked late by the monitor")}
        </Stat>
      </ul>

      {dateChange && (
        <p className="flex items-start gap-[0.5em] rounded-[0.8em] bg-[#f3eefe] px-[1em] py-[0.7em] text-[0.82em] text-[#5b3aa8]">
          <CalendarClock className="mt-[0.1em] size-[1.1em] shrink-0" />
          <span>
            {t("The monitor asks to move the end from {from} to {to}.", { from: shortDate(dateChange.currentEndDate), to: shortDate(dateChange.proposedEndDate) })}
            {dateChange.reason && <span className="block text-[#3d4f61]">“{dateChange.reason}”</span>}
          </span>
        </p>
      )}

      <section className="grid gap-[0.7em]">
        <div className="flex flex-wrap items-center justify-between gap-[0.5em]">
          <h4 className="flex flex-wrap items-baseline gap-x-[0.6em] font-bold text-[#0b1b2b]">
            <bdi>{t("{name} Board", { name: sprint.name })}</bdi>
            <span className="text-[0.8em] font-medium text-[#5b6b7c]">
              {t("{count} tasks · {done} done", { count: tasks.length, done: tasks.filter((x) => x.status === "Done").length })}
            </span>
          </h4>
          {roles.length > 0 && (
            <label className="inline-flex items-center gap-[0.4em] rounded-[0.6em] bg-[#eef3fb] px-[0.8em] py-[0.4em] text-[0.78em] font-semibold">
              {t("Role")}
              <select value={role} onChange={(e) => setRole(e.target.value)} className="cursor-pointer bg-transparent outline-none">
                <option value="all">{t("All roles")}</option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {t(ROLE_LABEL(r))}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
        <div className="grid gap-[0.7em] sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((c) => {
            const col = tasks.filter((x) => x.status === c.status);
            return (
              <section key={c.status} className="min-h-[10em] rounded-[0.9em] border border-[#e6ebf1] bg-[#f7fafc] p-[0.7em]">
                <h5 className="mb-[0.6em] flex items-center gap-[0.45em] text-[0.8em] font-semibold text-[#14365a]">
                  <span className={`size-[0.55em] rounded-full ${c.dot}`} /> {t(c.label)}
                  <span className="ms-auto rounded-full bg-[#e6ebf1] px-[0.5em] text-[0.9em] text-[#3d4f61]">{col.length}</span>
                </h5>
                <ul className="grid gap-[0.5em]">
                  {col.map((task) => (
                    <li key={task.id} className="rounded-[0.7em] bg-white p-[0.7em] shadow-[0_2px_8px_rgba(20,54,90,0.06)]">
                      <p className="text-[0.8em] font-semibold text-[#0b1b2b]">{task.title}</p>
                      <div className="mt-[0.5em] flex items-center gap-[0.4em] text-[0.7em]">
                        {task.role && <span className="rounded-full bg-[#e0f6fc] px-[0.6em] py-[0.1em] font-semibold text-[#0b6f86]">{t(ROLE_LABEL(task.role))}</span>}
                        <span className="rounded-full bg-[#eef1f5] px-[0.6em] py-[0.1em] text-[#3d4f61]">{t("{n} pts", { n: task.storyPoints })}</span>
                        {task.assigneeName && (
                          <span className="ms-auto" title={task.assigneeName}>
                            <Avatar name={task.assigneeName} photoUrl={task.assigneePhotoUrl} className="size-[2.2em]" />
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <div className="grid gap-[1em] lg:grid-cols-2">
        <section>
          <h4 className="mb-[0.5em] font-bold text-[#0b1b2b]">{t("Members in this sprint")}</h4>
          <ul className="divide-y divide-[#eef2f6] rounded-[0.9em] border border-[#e6ebf1]">
            {share.map((m) => (
              <li key={m.studentId} className="flex items-center gap-[0.6em] px-[0.8em] py-[0.55em] text-[0.8em]">
                <Avatar name={m.fullName} photoUrl={m.photoUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-[#0b1b2b]">{m.fullName}</span>
                  <span className="text-[0.9em] text-[#5b6b7c]">{t(ROLE_LABEL(m.role))}</span>
                </span>
                <span className="shrink-0 text-end">
                  <span className="block font-semibold">{t("{done} / {total} Tasks", { done: m.done, total: m.total })}</span>
                  <span className="text-[0.9em] text-[#5b6b7c]">{t("{n} pts", { n: m.points })}</span>
                </span>
              </li>
            ))}
            {unassigned > 0 && (
              <li className="px-[0.8em] py-[0.55em] text-[0.78em] text-[#5b6b7c]">{t("{count} tasks for the whole squad", { count: unassigned })}</li>
            )}
          </ul>
        </section>
        <section>
          <h4 className="mb-[0.5em] font-bold text-[#0b1b2b]">{t("Delays")}</h4>
          {delays.length === 0 ? (
            <p className="rounded-[0.9em] bg-[#f4f7fa] px-[1em] py-[0.8em] text-[0.8em] text-[#5b6b7c]">{t("The monitor marked no delay in this sprint.")}</p>
          ) : (
            <ul className="grid gap-[0.5em]">
              {delays.map((d) => (
                <li key={d.id} className="rounded-[0.9em] bg-[#fdf2e6] px-[1em] py-[0.6em] text-[0.8em] text-[#8a4b00]">
                  <span className="flex justify-between gap-[0.5em] font-semibold">
                    {t(DELAY_REASONS[d.reason] ?? d.reason)}
                    <span className="font-normal">{shortDate(d.createdUtc)}</span>
                  </span>
                  {d.note && <span className="block text-[#3d4f61]">{d.note}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, children }: { icon: ReactNode; label: string; value: ReactNode; children?: ReactNode }) {
  return (
    <li className="rounded-[0.9em] border border-[#e6ebf1] p-[0.8em]">
      <p className="flex items-center gap-[0.4em] text-[0.74em] font-semibold text-[#5b6b7c]">
        {icon} {label}
      </p>
      <p className="mt-[0.3em] text-[1.05em] font-extrabold text-[#0b1b2b]">{value}</p>
      {children && <div className="mt-[0.4em] text-[0.72em] text-[#5b6b7c]">{children}</div>}
    </li>
  );
}
