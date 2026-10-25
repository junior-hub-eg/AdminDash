"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { CalendarDays, CheckCircle2, Flag, Flame, ListChecks, Settings, SquarePlus, Trophy, Wand2, Zap } from "lucide-react";
import { getAdminSquadFull, getAdminSquads, type AdminSquad, type AdminSquadFull } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { AdminSurface, BTN_PRIMARY, BTN_SECONDARY, PANEL, StatCard, StatGrid } from "./page-parts";
import { LoadState, useAdminData } from "./admin-data";
import { STATUS_LABEL } from "./SquadCard";
import { Avatar, Bar, shortDate } from "./squad-detail/parts";
import { TaskBoard } from "./squad-detail/TaskBoard";
import { MembersPanel } from "./squad-detail/MembersPanel";
import { ProjectBrief } from "./squad-detail/ProjectBrief";
import { AddMemberDialog, AddTaskDialog, SquadSettingsDialog } from "./squad-detail/SquadDialogs";

type Tab = "overview" | "members" | "brief" | "sprints" | "board" | "leaderboard";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: tk("Overview") },
  { key: "members", label: tk("Members") },
  { key: "brief", label: tk("Project Brief") },
  { key: "sprints", label: tk("Sprints") },
  { key: "board", label: tk("Task Board (Kanban)") },
  { key: "leaderboard", label: tk("Leaderboard") },
];

/** Squad Details & Task Board: one squad's workspace for the admin (GET admin/squads/{id}/full). */
export default function AdminSquadDetail({ id }: { id: string }) {
  const t = useT();
  const load = useCallback(() => getAdminSquadFull(id), [id]);
  const res = useAdminData(load, tk("We couldn't load this squad. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const [tab, setTab] = useState<Tab>("overview");
  const [dialog, setDialog] = useState<"settings" | "task" | "member" | null>(null);
  const s = res.data;

  const refresh = async () => {
    await res.reload();
  };

  return (
    <AdminSurface>
      <nav className="text-[0.78em] text-[#5b6b7c]">
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
  refresh,
  setSquad,
}: {
  s: AdminSquadFull;
  tab: Tab;
  setTab: (tab: Tab) => void;
  openDialog: (d: "settings" | "task" | "member") => void;
  squads: AdminSquad[] | null;
  refresh: () => Promise<void>;
  setSquad: (s: AdminSquadFull) => void;
}) {
  const t = useT();
  const [now] = useState(() => Date.now());
  const sprint = s.sprints.find((p) => p.status === "Active") ?? s.sprints[s.sprints.length - 1] ?? null;
  const tasks = s.tasks ?? [];
  const pointsTotal = tasks.reduce((n, x) => n + x.storyPoints, 0);
  const pointsDone = tasks.filter((x) => x.status === "Done").reduce((n, x) => n + x.storyPoints, 0);
  const daysLeft = sprint ? Math.ceil((new Date(sprint.endDate).getTime() - now) / 86_400_000) : null;
  const squadXp = s.members.reduce((n, m) => n + m.totalXp, 0);
  const ranked = [...s.members].sort((a, b) => b.totalXp - a.totalXp);

  return (
    <>
      <section className={`${PANEL} grid gap-[1.1em] p-[1.3em]`}>
        <div className="flex flex-wrap gap-[0.6em]">
          <button type="button" onClick={() => openDialog("settings")} className={BTN_SECONDARY}>
            <Settings className="size-[1em]" /> {t("Squad Settings")}
          </button>
          <button type="button" disabled title={t("Coming soon")} className={BTN_SECONDARY}>
            <Flag className="size-[1em]" /> {t("Complete Sprint")}
          </button>
          <button type="button" onClick={() => openDialog("task")} disabled={!sprint || sprint.status !== "Active"} className={BTN_PRIMARY}>
            <SquarePlus className="size-[1em]" /> {t("Add Task")}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-[1em]">
          <div className="flex min-w-0 items-start gap-[1em]">
            <span className="grid size-[3.6em] shrink-0 place-items-center rounded-[0.9em] bg-[#14365a] text-white">
              <Wand2 className="size-[1.6em]" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-[0.5em]">
                <h1 className="text-[1.6em] font-extrabold text-[#0b1b2b]">{s.name}</h1>
                <span className="rounded-full bg-[#e0f6fc] px-[0.7em] py-[0.15em] text-[0.7em] font-semibold text-[#0b89a6]">{t(s.level)}</span>
                <span className="rounded-full bg-[#dff7ea] px-[0.7em] py-[0.15em] text-[0.7em] font-semibold text-[#17935f]">
                  {t(STATUS_LABEL[s.status])}
                  {sprint && ` · ${sprint.name}`}
                </span>
              </div>
              <p className="mt-[0.3em] text-[0.85em] text-[#3d4f61]">
                {t("Project")}: <span className="font-semibold text-[#0b1b2b]">{s.projectTitle}</span>
              </p>
              <p className="text-[0.85em] text-[#3d4f61]">
                {t("Mentor")}: <span className="font-semibold text-[#0b1b2b]">{s.monitor?.fullName ?? t("No monitor yet")}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-[0.8em] rounded-[0.9em] bg-[#f5f8fe] px-[1em] py-[0.6em]">
            <span className="flex -space-x-[0.6em] rtl:space-x-reverse">
              {s.members.slice(0, 4).map((m) => (
                <Avatar key={m.studentId} name={m.fullName} photoUrl={m.photoUrl} />
              ))}
              {s.members.length > 4 && (
                <span className="grid size-[2.2em] place-items-center rounded-full bg-[#0b1b2b] text-[0.7em] font-bold text-white ring-2 ring-white">
                  +{s.members.length - 4}
                </span>
              )}
            </span>
            <span className="text-[0.78em] font-semibold text-[#14365a]">{t("{count} Squad Builders", { count: s.members.length })}</span>
          </div>
        </div>

        <div role="tablist" className="flex flex-wrap gap-[0.3em]">
          {TABS.map((x) => (
            <button
              key={x.key}
              type="button"
              role="tab"
              aria-selected={tab === x.key}
              onClick={() => setTab(x.key)}
              className={`rounded-[0.7em] px-[1em] py-[0.5em] text-[0.82em] font-semibold ${
                tab === x.key ? "bg-[#14365a] text-white" : "text-[#3d4f61] hover:bg-[#eef3f9]"
              }`}
            >
              {t(x.label)}
              {x.key === "members" && (
                <span className="ms-[0.4em] rounded-full bg-[#e0f6fc] px-[0.45em] text-[0.8em] text-[#0b89a6]">{s.members.length}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      <StatGrid>
        <StatCard
          label={t("Sprint Duration")}
          value={sprint ? `${shortDate(sprint.startDate)} – ${shortDate(sprint.endDate)}` : "—"}
          valueClass="text-[#0b1b2b] !text-[1.15em]"
          icon={CalendarDays}
          tone="cyan"
          hint={daysLeft == null ? t("No sprint yet") : daysLeft >= 0 ? t("{days} days remaining", { days: daysLeft }) : t("Sprint ended")}
        />
        <StatCard
          label={t("Story Points Burned")}
          value={`${pointsDone} / ${pointsTotal} SP`}
          icon={Flame}
          tone="amber"
          hint={t("Done tasks of this sprint")}
        />
        <StatCard
          label={t("Task Completion")}
          value={`${Math.round(sprint?.progress ?? s.progress)}%`}
          icon={CheckCircle2}
          tone="green"
          hint={t("{done} / {total} Tasks", { done: sprint?.tasksDone ?? 0, total: sprint?.tasksTotal ?? 0 })}
        />
        <StatCard label={t("Velocity & XP")} value={`+${squadXp} XP`} icon={Zap} tone="violet" hint={t("XP earned by the squad")} />
      </StatGrid>

      {tab === "overview" && (
        <div className="grid items-start gap-[1.2em] xl:grid-cols-[minmax(0,3fr)_minmax(0,1fr)]">
          <TaskBoard sprintName={sprint?.name ?? null} tasks={tasks} onAdd={() => openDialog("task")} />
          <Leaderboard ranked={ranked} sprintName={sprint?.name ?? null} />
        </div>
      )}
      {tab === "board" && <TaskBoard sprintName={sprint?.name ?? null} tasks={tasks} onAdd={() => openDialog("task")} />}
      {tab === "members" && <MembersPanel squad={s} squads={squads} onAdd={() => openDialog("member")} onChanged={refresh} />}
      {tab === "brief" && (
        <ProjectBrief squad={s} onEditProject={() => openDialog("settings")} onUseCases={(useCases) => setSquad({ ...s, useCases })} />
      )}
      {tab === "leaderboard" && <Leaderboard ranked={ranked} sprintName={sprint?.name ?? null} />}
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
                <li key={p.id} className="rounded-[0.8em] border border-[#e3ebf3] p-[0.9em]">
                  <div className="flex flex-wrap items-center justify-between gap-[0.5em] text-[0.85em]">
                    <span className="font-bold text-[#0b1b2b]">{p.name}</span>
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

function Leaderboard({ ranked, sprintName }: { ranked: AdminSquadFull["members"]; sprintName: string | null }) {
  const t = useT();
  return (
    <section className={`${PANEL} p-[1.1em]`}>
      <div className="mb-[0.8em] flex items-start justify-between gap-[0.5em]">
        <h3 className="flex items-center gap-[0.5em] text-[1em] font-bold text-[#0b1b2b]">
          <Trophy className="size-[1.1em]" /> {t("Squad XP Leaderboard")}
        </h3>
        {sprintName && <span className="text-[0.72em] font-semibold text-[#0b89a6]">{sprintName}</span>}
      </div>
      {ranked.length === 0 ? (
        <p className="py-[1em] text-center text-[0.8em] text-[#8a97a6]">{t("No members yet.")}</p>
      ) : (
        <ol className="grid gap-[0.5em]">
          {ranked.map((m, i) => (
            <li
              key={m.studentId}
              className={`flex items-center gap-[0.6em] rounded-[0.7em] px-[0.6em] py-[0.5em] ${i === 0 ? "bg-[#eef3f9]" : ""}`}
            >
              <span className="w-[1.8em] text-[0.8em] font-bold text-[#0b89a6]">#{i + 1}</span>
              <Avatar name={m.fullName} photoUrl={m.photoUrl} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[0.82em] font-semibold text-[#0b1b2b]">{m.fullName}</span>
                <span className="block text-[0.7em] text-[#5b6b7c]">{t("{count} Tasks Done", { count: m.tasksDone })}</span>
              </span>
              <span className="text-[0.8em] font-bold text-[#17935f]">+{m.totalXp} XP</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
