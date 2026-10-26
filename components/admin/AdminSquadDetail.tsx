"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  Activity,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Flag,
  Flame,
  GraduationCap,
  Hourglass,
  Kanban,
  Layers,
  ListChecks,
  Settings,
  SquarePlus,
  Star,
  TrendingUp,
  Wand2,
  Zap,
} from "lucide-react";
import { getAdminMentors, getAdminSquadFull, getAdminSquads, type AdminSquad, type AdminSquadFull } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, PANEL } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { STATUS_LABEL } from "./SquadCard";
import { Avatar, Bar, shortDate } from "./squad-detail/parts";
import { TaskBoard } from "./squad-detail/TaskBoard";
import { MembersPanel } from "./squad-detail/MembersPanel";
import { SquadStat } from "./squad-detail/SquadStat";
import { ActivityFeed, Leaderboard, LiveActivity, MentorNotes, taskActivity } from "./squad-detail/SquadSide";
import { ProjectBrief } from "./squad-detail/ProjectBrief";
import { SprintLink } from "./squad-detail/SprintDetails";
import { AddMemberDialog, AddTaskDialog, SquadSettingsDialog } from "./squad-detail/SquadDialogs";

type Tab = "overview" | "members" | "brief" | "sprints" | "board" | "leaderboard" | "activity";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: tk("Overview") },
  { key: "members", label: tk("Members") },
  { key: "brief", label: tk("Project Brief") },
  { key: "sprints", label: tk("Sprints") },
  { key: "board", label: tk("Task Board (Kanban)") },
  { key: "leaderboard", label: tk("Leaderboard") },
  { key: "activity", label: tk("Activity Feed") },
];

const SECONDARY =
  "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] bg-[#eef3fb] px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#14365a] hover:bg-[#e3ecf7] disabled:cursor-not-allowed disabled:opacity-55";

/** Squad Details & Task Board: one squad's workspace for the admin (GET admin/squads/{id}/full). */
export default function AdminSquadDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getAdminSquadFull(id), [id]);
  const res = useAdminData(load, tk("We couldn't load this squad. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const mentors = useAdminData(getAdminMentors, tk("We couldn't load the mentors. Please try again."));
  const [tab, setTab] = useState<Tab>("overview");
  const [dialog, setDialog] = useState<"settings" | "task" | "member" | null>(null);
  const s = res.data;

  const refresh = async () => {
    await res.reload();
  };

  return (
    <AdminSurface>
      <nav aria-label={t("Breadcrumb")} className="text-[0.78em] text-[#5b6b7c]">
        <Link href={"/admin/dashboard" as Route} className="hover:underline">
          {t("Admin")}
        </Link>
        {" › "}
        <Link href={"/admin/squads" as Route} className="hover:underline">
          {t("Squad Management")}
        </Link>
        {s && (
          <>
            {" › "}
            <span className="font-semibold text-[#14365a]">{s.name}</span>
            {" › "}
            <span className="text-[#0b89a6]">{t("Workspace & Task Board")}</span>
          </>
        )}
      </nav>

      {!s ? (
        <LoadState error={res.error} onRetry={res.reload} />
      ) : (
        <SquadWorkspace
          s={s}
          tab={tab}
          setTab={setTab}
          openDialog={setDialog}
          squads={squads.data}
          trackName={mentors.data?.mentors.find((m) => m.id === s.monitor?.id)?.trackName ?? null}
          refresh={refresh}
          setSquad={(next) => res.setData(next)}
        />
      )}

      {s && dialog === "settings" && (
        <SquadSettingsDialog open squad={s} onClose={() => setDialog(null)} onSaved={(next) => res.setData(next)} />
      )}
      {s && dialog === "task" && <AddTaskDialog open squad={s} onClose={() => setDialog(null)} onSaved={(next) => res.setData(next)} />}
      {s && dialog === "member" && <AddMemberDialog open squad={s} onClose={() => setDialog(null)} onSaved={refresh} />}
    </AdminSurface>
  );
}

function SquadWorkspace({
  s,
  tab,
  setTab,
  openDialog,
  squads,
  trackName,
  refresh,
  setSquad,
}: {
  s: AdminSquadFull;
  tab: Tab;
  setTab: (tab: Tab) => void;
  openDialog: (d: "settings" | "task" | "member") => void;
  squads: AdminSquad[] | null;
  trackName: string | null;
  refresh: () => Promise<void>;
  setSquad: (s: AdminSquadFull) => void;
}) {
  const t = useT();
  const [now] = useState(() => Date.now());
  const sprint = s.sprints.find((p) => p.status === "Active") ?? s.sprints[s.sprints.length - 1] ?? null;
  const sprintIndex = sprint ? s.sprints.indexOf(sprint) : -1;
  const previous = sprintIndex > 0 ? s.sprints[sprintIndex - 1] : null;
  const tasks = s.tasks ?? [];
  const pointsTotal = tasks.reduce((n, x) => n + x.storyPoints, 0);
  const pointsDone = tasks.filter((x) => x.status === "Done").reduce((n, x) => n + x.storyPoints, 0);
  const daysLeft = sprint ? Math.ceil((new Date(sprint.endDate).getTime() - now) / 86_400_000) : null;
  const squadXp = s.members.reduce((n, m) => n + m.totalXp, 0);
  const ranked = [...s.members].sort((a, b) => b.totalXp - a.totalXp);
  const events = taskActivity(tasks);
  const completion = Math.round(sprint?.progress ?? s.progress);

  const tabLabel = (key: Tab, label: string) =>
    key === "sprints" && sprint
      ? sprint.status === "Active"
        ? t("{sprint} (Active)", { sprint: sprint.name })
        : sprint.name
      : t(label);

  const side = (
    <aside className="grid min-w-0 content-start gap-[1.2em]">
      <MentorNotes mentorName={s.monitor?.fullName ?? null} />
      <Leaderboard ranked={ranked} sprintName={sprint?.name ?? null} />
      <LiveActivity events={events} now={now} onViewAll={() => setTab("activity")} />
    </aside>
  );

  return (
    <>
      <section className={`${PANEL} relative grid gap-[1.2em] overflow-hidden p-[1.3em]`}>
        <span
          aria-hidden
          className="pointer-events-none absolute -bottom-[6em] end-[10%] size-[14em] rounded-full bg-[#c9f2fb] opacity-50 blur-[2.5em]"
        />
        <div className="relative flex flex-wrap gap-[0.6em]">
          <button type="button" onClick={() => openDialog("settings")} className={SECONDARY}>
            <Settings className="size-[1.1em]" /> {t("Squad Settings")}
          </button>
          <button type="button" disabled title={t("Coming soon")} className={SECONDARY}>
            <Flag className="size-[1.1em]" /> {t("Complete Sprint")}
          </button>
          <button type="button" onClick={() => openDialog("task")} disabled={!sprint || sprint.status !== "Active"} className={BTN_PRIMARY}>
            <SquarePlus className="size-[1.1em]" /> {t("Add Task")}
          </button>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-[1em]">
          <div className="flex min-w-0 items-start gap-[1em]">
            <span className="relative grid size-[3.8em] shrink-0 place-items-center rounded-[0.9em] bg-gradient-to-br from-[#14365a] to-[#0b1b2b] text-white shadow-[0_8px_18px_rgba(11,27,43,0.25)]">
              <Wand2 className="size-[1.6em]" />
              {sprint && (
                <span className="absolute -bottom-[0.35em] -end-[0.35em] grid size-[1.5em] place-items-center rounded-full bg-[#17935f] text-[0.7em] font-bold ring-2 ring-white">
                  {sprintIndex + 1}
                </span>
              )}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-[0.5em]">
                <h1 className="text-[1.65em] font-extrabold leading-tight text-[#0b1b2b]">{s.name}</h1>
                <span className="inline-flex items-center gap-[0.35em] rounded-full bg-[#e0f6fc] px-[0.7em] py-[0.15em] text-[0.68em] font-semibold text-[#0b6f86]">
                  <span className="size-[0.5em] rounded-full bg-[#06b6d4]" />
                  {trackName ? t(trackName) : t(s.level)}
                </span>
                <span className="inline-flex items-center gap-[0.35em] rounded-full bg-[#dff7ea] px-[0.7em] py-[0.15em] text-[0.68em] font-semibold text-[#17935f]">
                  <span className="size-[0.5em] rounded-full bg-[#17935f]" />
                  {t(STATUS_LABEL[s.status])}
                  {sprint && (
                    <>
                      {" · "}
                      <SprintLink squadId={s.id} sprintId={sprint.id}>
                        {sprint.name}
                      </SprintLink>
                    </>
                  )}
                </span>
              </div>
              <p className="mt-[0.35em] flex items-center gap-[0.4em] text-[0.88em] text-[#3d4f61]">
                <Layers className="size-[1em] shrink-0" />
                {t("Project")}: <span className="truncate font-semibold text-[#0b1b2b]">{s.projectTitle}</span>
              </p>
              <p className="flex items-center gap-[0.4em] text-[0.88em] text-[#5b6b7c]">
                <GraduationCap className="size-[1em] shrink-0" />
                {t("Mentor")}: <span className="font-medium text-[#0b1b2b]">{s.monitor?.fullName ?? t("No monitor yet")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[0.8em] rounded-[0.9em] bg-[#f3f6fb] px-[1em] py-[0.6em]">
            <span className="flex -space-x-[0.6em] rtl:space-x-reverse">
              {s.members.slice(0, 4).map((m) => (
                <Avatar key={m.studentId} name={m.fullName} photoUrl={m.photoUrl} />
              ))}
              {s.members.length > 4 && (
                <span className="z-10 grid size-[2.2em] place-items-center rounded-full bg-[#0b6f86] text-[0.7em] font-bold text-white ring-2 ring-white">
                  +{s.members.length - 4}
                </span>
              )}
            </span>
            <span className="leading-tight">
              <span className="block text-[0.78em] font-semibold text-[#14365a]">{t("{count} Squad Builders", { count: s.members.length })}</span>
              <span className="block text-[0.7em] text-[#5b6b7c]">{t(s.level)}</span>
            </span>
          </div>
        </div>

        <div role="tablist" className="relative flex flex-wrap gap-[0.3em]">
          {TABS.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => setTab(x.key)}
              className={`inline-flex items-center gap-[0.4em] rounded-[0.7em] px-[1em] py-[0.55em] text-[0.82em] font-semibold ${
                tab === x.key ? "bg-[#14365a] text-white shadow-[0_6px_14px_rgba(20,54,90,0.25)]" : "text-[#3d4f61] hover:bg-[#eef3f9]"
              }`}
            >
              {x.key === "board" && <Kanban className="size-[1em]" />}
              {x.key === "brief" && tab === x.key && <BookOpen className="size-[1em]" />}
              {x.key === "activity" && tab === x.key && <Activity className="size-[1em]" />}
              {tabLabel(x.key, x.label)}
              {x.key === "leaderboard" && <Star className={`size-[0.95em] ${tab === x.key ? "" : "text-[#0b89a6]"}`} />}
              {x.key === "members" && (
                <span className="rounded-full bg-[#e0f6fc] px-[0.45em] text-[0.8em] text-[#0b89a6]">{s.members.length}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <ul className="grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4">
        <SquadStat
          label={t("Sprint Duration")}
          icon={CalendarDays}
          tone="slate"
          valueClass="text-[1.15em]"
          value={sprint ? `${shortDate(sprint.startDate)} – ${shortDate(sprint.endDate)}` : "—"}
          hint={
            <span className="inline-flex items-center gap-[0.3em] font-semibold text-[#17935f]">
              <Hourglass className="size-[1.1em]" />
              {daysLeft == null ? t("No sprint yet") : daysLeft >= 0 ? t("{days} days remaining", { days: daysLeft }) : t("Sprint ended")}
            </span>
          }
        />
        <SquadStat
          label={t("Story Points Burned")}
          icon={Flame}
          tone="cyan"
          value={pointsDone}
          suffix={<span dir="ltr">/ {pointsTotal} SP</span>}
          bar={{ value: pointsTotal ? (pointsDone / pointsTotal) * 100 : 0 }}
        />
        <SquadStat
          label={t("Task Completion")}
          icon={CheckCircle2}
          tone="slate"
          value={`${completion}%`}
          suffix={t("{done} / {total} Tasks", { done: sprint?.tasksDone ?? 0, total: sprint?.tasksTotal ?? 0 })}
          bar={{ value: completion, color: "bg-[#0f5f6b]" }}
        />
        <SquadStat
          label={t("Velocity & XP")}
          icon={Zap}
          tone="violet"
          value={`+${squadXp}`}
          suffix={<span className="font-bold text-[#0b6f86]">XP</span>}
          hint={
            previous && sprint ? (
              <span className="inline-flex items-center gap-[0.3em] font-semibold text-[#0b6f86]">
                <TrendingUp className="size-[1.1em]" />
                {t("{count} tasks done vs {done} in {sprint}", { count: sprint.tasksDone, done: previous.tasksDone, sprint: previous.name })}
              </span>
            ) : (
              t("XP earned by the squad")
            )
          }
        />
      </ul>

      {(tab === "overview" || tab === "board") && (
        <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,3fr)_minmax(15em,1fr)]">
          <TaskBoard sprintName={sprint?.name ?? null} tasks={tasks} members={s.members} onAdd={() => openDialog("task")} />
          {side}
        </div>
      )}
      {tab === "members" && <MembersPanel squad={s} squads={squads} onAdd={() => openDialog("member")} onChanged={refresh} />}
      {tab === "brief" && (
        <ProjectBrief squad={s} onEditProject={() => openDialog("settings")} onUseCases={(useCases) => setSquad({ ...s, useCases })} />
      )}
      {tab === "leaderboard" && (
        <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,2fr)_minmax(15em,1fr)]">
          <Leaderboard ranked={ranked} sprintName={sprint?.name ?? null} />
          <LiveActivity events={events} now={now} onViewAll={() => setTab("activity")} />
        </div>
      )}
      {tab === "activity" && <ActivityFeed events={events} now={now} />}
      {tab === "sprints" && (
        <section className={`${PANEL} p-[1.3em]`}>
          <h3 className="mb-[0.9em] flex items-center gap-[0.5em] text-[1.05em] font-bold text-[#0b1b2b]">
            <ListChecks className="size-[1.1em]" /> {t("Sprints")}
          </h3>
          {s.sprints.length === 0 ? (
            <p className="py-[1.5em] text-center text-[0.85em] text-[#8a97a6]">{t("No sprint yet")}</p>
          ) : (
            <ul className="grid gap-[0.8em]">
              {s.sprints.map((p) => (
                <li key={p.id} className={`rounded-[0.8em] border p-[0.9em] ${p.id === sprint?.id ? "border-[#06b6d4] bg-[#f3fbfe]" : "border-[#e3ebf3]"}`}>
                  <div className="flex flex-wrap items-center justify-between gap-[0.5em] text-[0.85em]">
                    <SprintLink squadId={s.id} sprintId={p.id} className="font-bold text-[#0b1b2b]">
                      {p.name}
                    </SprintLink>
                    <span className="text-[#5b6b7c]">
                      {shortDate(p.startDate)} – {shortDate(p.endDate)} · {t(p.status)}
                    </span>
                  </div>
                  <div className="mt-[0.5em] flex items-center gap-[0.6em] text-[0.78em]">
                    <Bar value={p.progress} />
                    <span className="shrink-0 font-semibold">
                      {Math.round(p.progress)}% ({p.tasksDone}/{p.tasksTotal})
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
