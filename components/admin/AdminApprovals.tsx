"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeftRight,
  BadgeCheck,
  CalendarCheck,
  CheckCheck,
  ClipboardList,
  LoaderCircle,
  Rocket,
  SlidersHorizontal,
  UserCheck,
  UsersRound,
} from "lucide-react";

import {
  APPROVALS_CHANGED,
  approveMentorRequest,
  approveTrackChangeRequest,
  approveSignup,
  approveTrackRequest,
  getApprovals,
  getMentorRequests,
  getTrackChangeRequests,
  getTrackRequests,
  rejectMentorRequest,
  rejectTrackChangeRequest,
  rejectSignup,
  rejectTrackRequest,
  type AdminApproval,
  type AdminMentorRequest,
  type AdminTrackChangeRequest,
  type AdminTrackRequest,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { AdminDialog } from "./AdminPageFrame";
import { LoadState, useAdminData } from "./admin-data";
import ApprovalInspector from "./approvals/ApprovalInspector";
import ApprovalQueue from "./approvals/ApprovalQueue";
import ApprovalTabs from "./approvals/ApprovalTabs";
import ResolutionVelocity from "./approvals/ResolutionVelocity";
import type { ApprovalTab, Priority, QueueItem } from "./approvals/types";
import { ageHours, priorityFor, shortSpan, SLA_HOURS } from "./approvals/age";
import { SquadStat } from "./squad-detail/SquadStat";
import { AdminSurface } from "./page-parts";
import { StarterStudents } from "./StarterStudents";

const PAGE_SIZE = 5;

const SUBJECT_LABEL: Record<AdminApproval["subjects"][number], string> = {
  Math: tk("Mathematics"),
  Science: tk("Science"),
  Physics: tk("Physics"),
  Language: tk("Language"),
};

const RANK: Record<Priority, number> = { urgent: 0, medium: 1, normal: 2 };

/** The time a set of lists arrived (so ages stay stable between renders). */
const stamp = (lists: unknown[]) => (lists.length ? Date.now() : 0);

type T = ReturnType<typeof useT>;

/** Age, priority and SLA line of a request, read from when it was sent. */
function timing(createdUtc: string, now: number, t: T) {
  const hours = ageHours(createdUtc, now);
  const left = SLA_HOURS - hours;

  return {
    createdUtc,
    priority: priorityFor(hours),
    submitted: t("{time} ago", { time: shortSpan(hours) }),
    sla: left > 0 ? t("SLA: {time} remain", { time: shortSpan(left) }) : t("SLA breached by {time}", { time: shortSpan(-left) }),
    slaAlert: left <= 0,
    slaProgress: {
      label: tk("SLA window used"),
      pct: Math.min(100, (hours / SLA_HOURS) * 100),
      note: t("{used} of {total}", { used: shortSpan(hours), total: `${SLA_HOURS}h` }),
    },
  };
}

/** A real mentor / teacher sign-up becomes one row of the queue. */
function signupToItem(a: AdminApproval, t: T, now: number): QueueItem {
  const isMentor = a.role === "Mentor";
  const { slaProgress, ...time } = timing(a.createdUtc, now, t);

  return {
    id: a.id,
    source: "signup",
    ...time,
    email: a.email,
    mentor: isMentor && a.trackCode ? { id: a.id, name: a.fullName, trackCode: a.trackCode } : undefined,
    kind: "signup",
    name: a.fullName,
    subtitle: isMentor ? t("Mentor Applicant") : t("Teacher Applicant"),
    note: a.phone ? `${a.email} · ${a.phone}` : a.email,
    typeLabel: isMentor ? t("Mentor Onboarding") : t("Teacher Onboarding"),
    context: (isMentor ? a.trackName : a.schoolName) ?? "—",
    primaryLabel: t("Approve"),
    inspector: {
      ticket: `#SU-${a.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
      idLabel: a.email,
      chips: [isMentor ? t("Monitor / Mentor") : t("Teacher")],
      cards: isMentor
        ? [
            { label: "Track", value: a.trackName ? t(a.trackName) : "—" },
            { label: "Job title", value: a.title ?? "—" },
            { label: "Experience", value: t("{count} years", { count: a.yearsOfExperience ?? 0 }) },
          ]
        : [
            { label: "School", value: a.schoolName ?? "—" },
            { label: "Subjects", value: a.subjects.map((s) => t(SUBJECT_LABEL[s])).join(" · ") || "—" },
            { label: "Grades", value: a.grades.join(", ") || "—" },
          ],
      progress: slaProgress,
      approveLabel: t("Approve & Notify"),
    },
  };
}

/** A student asked to change their mentor: approving gives them the requested mentor in that track. */
function mentorChangeToItem(r: AdminMentorRequest, t: T, now: number): QueueItem {
  const { slaProgress, ...time } = timing(r.createdUtc, now, t);

  return {
    id: r.id,
    source: "mentorChange",
    ...time,
    kind: "session",
    name: r.student.fullName,
    subtitle: t("Student • {track}", { track: r.trackName }),
    note: t("Wants {mentor} as their mentor", { mentor: r.requestedMentor.fullName }),
    typeLabel: t("Mentor Change"),
    context: r.trackName,
    primaryLabel: t("Approve"),
    inspector: {
      ticket: `#MC-${r.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
      idLabel: r.student.fullName,
      chips: [t("Mentor Change"), r.trackName],
      cards: [
        { label: "Current mentor", value: r.currentMentor?.fullName ?? t("No mentor yet") },
        { label: "Requested mentor", value: r.requestedMentor.fullName, accent: true },
      ],
      progress: slaProgress,
      approveLabel: t("Approve & Notify"),
    },
  };
}

/** A student who learns a track asked to change to another one: approving starts it and puts it in focus. */
function trackChangeToItem(r: AdminTrackChangeRequest, t: T, now: number): QueueItem {
  const { slaProgress, ...time } = timing(r.createdUtc, now, t);
  const from = r.currentTrack ? t(r.currentTrack.name) : "—";
  const to = t(r.requestedTrack.name);

  return {
    id: r.id,
    source: "trackChange",
    ...time,
    kind: "session",
    name: r.student.fullName,
    subtitle: t("Student • {track}", { track: from }),
    note: t("Wants to change their track to {track}", { track: to }),
    typeLabel: t("Track Change"),
    context: to,
    primaryLabel: t("Approve"),
    inspector: {
      ticket: `#TC-${r.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
      idLabel: r.student.fullName,
      chips: [t("Track Change"), to],
      cards: [
        { label: "Current track", value: from },
        { label: "Requested track", value: to, accent: true },
        ...(r.level ? [{ label: "Level", value: t(r.level) }] : []),
      ],
      progress: slaProgress,
      approveLabel: t("Approve & Notify"),
    },
  };
}

/** A mentor asked to teach another track too: approving lists, matches and books them in it. */
function trackRequestToItem(r: AdminTrackRequest, t: T, now: number): QueueItem {
  const { slaProgress, ...time } = timing(r.createdUtc, now, t);

  return {
    id: r.id,
    source: "trackRequest",
    ...time,
    kind: "session",
    name: r.mentor.fullName,
    subtitle: t("Mentor • {track}", { track: r.currentTrackName }),
    note: r.note ?? t("Wants to teach {track} too", { track: r.trackName }),
    typeLabel: t("New Track Request"),
    context: r.trackName,
    primaryLabel: t("Approve"),
    inspector: {
      ticket: `#TR-${r.id.replace(/-/g, "").slice(0, 4).toUpperCase()}`,
      idLabel: r.mentor.fullName,
      chips: [t("New Track Request")],
      cards: [
        { label: "Current track", value: r.currentTrackName },
        { label: "Requested track", value: r.trackName, accent: true },
      ],
      progress: slaProgress,
      quote: r.note ? { title: t("Note"), by: r.mentor.fullName, text: r.note } : undefined,
      approveLabel: t("Approve & Notify"),
    },
  };
}

/**
 * Everything waiting for the admin, from the API: monitor / teacher sign-ups, students asking for
 * another mentor, and mentors asking to teach another track. Squad transfers, milestones and
 * certificates have no requests in the backend yet, so their tabs stay empty.
 */
export default function AdminApprovals() {
  const t = useT();
  const approvals = useAdminData(getApprovals, tk("We couldn't load the sign-ups. Please try again."));
  const mentorRequests = useAdminData(getMentorRequests, tk("We couldn't load the requests. Please try again."));
  const trackRequests = useAdminData(getTrackRequests, tk("We couldn't load the requests. Please try again."));
  const trackChanges = useAdminData(getTrackChangeRequests, tk("We couldn't load the requests. Please try again."));
  const [starter, setStarter] = useState<QueueItem["mentor"] | null>(null);

  const [tab, setTab] = useState<ApprovalTab>("all");
  const [priority, setPriority] = useState<Priority | "all">("all");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [declining, setDeclining] = useState<QueueItem | null>(null);
  const [reason, setReason] = useState("");

  // The time the lists arrived: ages, priorities and "Updated" are read against it.
  const now = useMemo(
    () => stamp([approvals.data, mentorRequests.data, trackRequests.data, trackChanges.data]),
    [approvals.data, mentorRequests.data, trackRequests.data, trackChanges.data],
  );

  const queue = useMemo(() => {
    const rows = [
      ...(approvals.data ?? []).map((a) => signupToItem(a, t, now)),
      ...(mentorRequests.data ?? []).map((r) => mentorChangeToItem(r, t, now)),
      ...(trackRequests.data ?? []).map((r) => trackRequestToItem(r, t, now)),
      ...(trackChanges.data ?? []).map((r) => trackChangeToItem(r, t, now)),
    ];

    // Most urgent first, then the oldest.
    return rows.sort((a, b) => RANK[a.priority] - RANK[b.priority] || a.createdUtc.localeCompare(b.createdUtc));
  }, [approvals.data, mentorRequests.data, trackRequests.data, trackChanges.data, t, now]);

  // Everything except the tab: the tab counts are computed on this.
  const base = useMemo(() => (priority === "all" ? queue : queue.filter((r) => r.priority === priority)), [queue, priority]);

  const counts = useMemo<Record<ApprovalTab, number>>(
    () => ({
      all: base.length,
      squad: base.filter((r) => r.kind === "squad").length,
      session: base.filter((r) => r.kind === "session").length,
      milestone: base.filter((r) => r.kind === "milestone").length,
      certificate: base.filter((r) => r.kind === "certificate").length,
      signup: base.filter((r) => r.kind === "signup").length,
    }),
    [base],
  );

  const filtered = useMemo(() => (tab === "all" ? base : base.filter((r) => r.kind === tab)), [base, tab]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const selected = queue.find((r) => r.id === selectedId) ?? pageRows[0] ?? null;
  const selectedCount = queue.filter((r) => checked.has(r.id)).length;

  const urgent = queue.filter((r) => r.priority === "urgent").length;
  const ready = !!approvals.data && !!mentorRequests.data && !!trackRequests.data && !!trackChanges.data;
  const studentCount = queue.filter((r) => r.source === "mentorChange" || r.source === "trackChange").length;
  const mentorSignups = (approvals.data ?? []).filter((a) => a.role === "Mentor").length;
  const mentorCount = (trackRequests.data?.length ?? 0) + mentorSignups;
  const two = (n: number) => String(n).padStart(2, "0");

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });

  const toggleVisible = () =>
    setChecked((prev) => {
      const next = new Set(prev);
      const all = pageRows.every((r) => next.has(r.id));

      for (const r of pageRows) {
        if (all) next.delete(r.id);
        else next.add(r.id);
      }

      return next;
    });

  function drop(item: QueueItem) {
    if (item.source === "signup") approvals.setData((list) => list?.filter((a) => a.id !== item.id) ?? null);
    if (item.source === "mentorChange") mentorRequests.setData((list) => list?.filter((a) => a.id !== item.id) ?? null);
    if (item.source === "trackRequest") trackRequests.setData((list) => list?.filter((a) => a.id !== item.id) ?? null);
    if (item.source === "trackChange") trackChanges.setData((list) => list?.filter((a) => a.id !== item.id) ?? null);
    window.dispatchEvent(new Event(APPROVALS_CHANGED)); // the sidebar count
  }

  const closeStarter = useCallback(() => setStarter(null), []);

  const fail = (e: unknown) => setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));

  /** Returns true when the request was approved. */
  async function approveOne(item: QueueItem) {
    try {
      if (item.source === "signup") await approveSignup(item.id);
      else if (item.source === "mentorChange") await approveMentorRequest(item.id);
      else if (item.source === "trackChange") await approveTrackChangeRequest(item.id);
      else await approveTrackRequest(item.id);
      drop(item);

      return true;
    } catch (e) {
      fail(e);

      return false;
    }
  }

  async function approve(item: QueueItem) {
    setBusyId(item.id);
    setError(null);
    setDone(null);

    if (await approveOne(item)) {
      setDone(
        item.source === "signup"
          ? t("{name} is approved and can sign in now.", { name: item.name })
          : t("Approved: {name}", { name: item.name }),
      );
      if (item.mentor) setStarter(item.mentor);
    }

    setBusyId(null);
  }

  async function bulkApprove() {
    const targets = queue.filter((r) => checked.has(r.id));

    if (targets.length === 0) return;

    setBusyId("bulk");
    setError(null);
    setDone(null);

    let ok = 0;

    for (const item of targets) {
      if (await approveOne(item)) ok++;
    }

    setChecked(new Set());
    setDone(t("{count} requests approved.", { count: ok }));
    setBusyId(null);
  }

  const openDecline = (item: QueueItem) => {
    setReason("");
    setError(null);
    setDeclining(item);
  };

  async function confirmDecline() {
    const item = declining;

    if (!item) return;

    setBusyId(item.id);
    setError(null);

    try {
      if (item.source === "signup") await rejectSignup(item.id, reason.trim());
      else if (item.source === "mentorChange") await rejectMentorRequest(item.id, reason.trim());
      else if (item.source === "trackChange") await rejectTrackChangeRequest(item.id, reason.trim());
      else await rejectTrackRequest(item.id, reason.trim());
      drop(item);

      setDone(t("{name} was rejected.", { name: item.name }));
      setDeclining(null);
    } catch (e) {
      fail(e);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <AdminSurface>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0 max-w-2xl">
            <p className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#dff3f9] px-3 py-1 text-[0.66rem] font-bold uppercase tracking-wider text-[#0a7f99]">
                <span className="size-1.5 rounded-full bg-[#06b6d4]" />
                {t("Live Queue Monitor")}
              </span>
              {ready && (
                <span className="text-[0.72rem] text-[#14365a]/60">
                  {t("Updated {time}", {
                    time: new Date(now).toLocaleTimeString(dateLocale("en-GB"), { hour: "2-digit", minute: "2-digit" }),
                  })}
                </span>
              )}
            </p>
            <h1 className="mt-2 text-[1.9rem] font-extrabold leading-tight text-[#0d2a45] sm:text-[2.1rem]">
              {t("Pending Requests & Approvals")}
            </h1>
            <p className="mt-1 text-[0.85rem] leading-relaxed text-[#14365a]/75">
              {t(
                "Review, verify, and resolve administrative requests, squad join applications, mentor allocations, and capstone approvals across active cohorts.",
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* TODO(api): approval policies screen does not exist yet. */}
            <button
              type="button"
              disabled
              title={t("Coming soon")}
              className="flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[0.78rem] font-semibold text-[#14365a] shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              <SlidersHorizontal className="size-4 text-[#12676b]" /> {t("Approval Policies")}
            </button>

            <button
              type="button"
              onClick={bulkApprove}
              disabled={selectedCount === 0 || busyId !== null}
              className="flex items-center gap-2 rounded-xl bg-[#06b6d4] px-4 py-2.5 text-[0.78rem] font-semibold text-white shadow-sm hover:bg-[#0597b1] disabled:opacity-50"
            >
              {busyId === "bulk" ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
              {t("Bulk Approve Selected")}
              <span className="rounded-full bg-white/25 px-2 py-0.5 text-[0.66rem] font-bold">{selectedCount}</span>
            </button>
          </div>
        </header>

        {done && (
          <p role="status" className="rounded-xl bg-[#d7efe6] px-4 py-2.5 text-[0.82rem] font-semibold text-[#12676b]">
            {done}
          </p>
        )}

        {error && !declining && (
          <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2.5 text-[0.82rem] font-semibold text-[#b83232]">
            {error}
          </p>
        )}

        <ul aria-label={t("Queue statistics")} aria-busy={!ready} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SquadStat
            label={t("Total Pending")}
            icon={ClipboardList}
            tone="cyan"
            value={ready ? two(queue.length) : "—"}
            suffix={
              urgent > 0 ? (
                <span className="rounded-full bg-[#ffe1e4] px-2 py-0.5 text-[#c0263f]">{t("{count} Urgent", { count: urgent })}</span>
              ) : undefined
            }
            hint={
              urgent > 0 ? (
                <span className="inline-flex items-center gap-1 font-medium text-[#14365a]">
                  <AlertCircle className="size-3.5 text-[#c0263f]" /> {t("Requires immediate triage")}
                </span>
              ) : (
                t("Nothing waits longer than {hours}h", { hours: SLA_HOURS })
              )
            }
          />
          <SquadStat
            label={t("Student Requests")}
            icon={UsersRound}
            tone="slate"
            value={ready ? two(studentCount) : "—"}
            suffix={t("in review")}
            hint={
              <span className="inline-flex items-center gap-1">
                <ArrowLeftRight className="size-3.5 text-[#0a7f99]" /> {t("Mentor change requests")}
              </span>
            }
          />
          <SquadStat
            label={t("Mentor Allocations")}
            icon={UserCheck}
            tone="slate"
            value={ready ? two(mentorCount) : "—"}
            suffix={
              <span className="rounded-full bg-[#e3e9ff] px-2 py-0.5 text-[#3b3fb0]">{t("{count} sign-ups", { count: mentorSignups })}</span>
            }
            hint={
              <span className="inline-flex items-center gap-1">
                <CalendarCheck className="size-3.5 text-[#0a7f99]" /> {t("Track requests & mentor sign-ups")}
              </span>
            }
          />
          <SquadStat
            label={t("Project Sign-offs")}
            icon={BadgeCheck}
            tone="slate"
            value={ready ? two(counts.milestone) : "—"}
            suffix={<span className="rounded-full bg-[#e3e9ff] px-2 py-0.5 text-[#3b3fb0]">{t("Milestone")}</span>}
            hint={
              <span className="inline-flex items-center gap-1">
                <Rocket className="size-3.5 text-[#0a7f99]" /> {t("Capstone sprint transitions")}
              </span>
            }
          />
        </ul>

        <ApprovalTabs
          tab={tab}
          onTab={(v) => {
            setTab(v);
            setPage(1);
          }}
          counts={counts}
        />

        {!approvals.data && <LoadState error={approvals.error} onRetry={approvals.reload} />}
        {mentorRequests.error && <LoadState error={mentorRequests.error} onRetry={mentorRequests.reload} />}
        {trackRequests.error && <LoadState error={trackRequests.error} onRetry={trackRequests.reload} />}
        {trackChanges.error && <LoadState error={trackChanges.error} onRetry={trackChanges.reload} />}

        <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="min-w-0">
            <ApprovalQueue
              rows={pageRows}
              total={filtered.length}
              page={safePage}
              pageSize={PAGE_SIZE}
              onPage={(p) => setPage(Math.min(Math.max(1, p), pageCount))}
              selectedId={selected?.id ?? null}
              onSelect={setSelectedId}
              checked={checked}
              onToggle={toggle}
              onToggleVisible={toggleVisible}
              selectedCount={selectedCount}
              priority={priority}
              onPriority={(v) => {
                setPriority(v);
                setPage(1);
              }}
              onRefresh={() => {
                approvals.reload();
                mentorRequests.reload();
                trackRequests.reload();
                trackChanges.reload();
              }}
              busyId={busyId}
              onApprove={approve}
              onDecline={openDecline}
            />
          </div>

          <div className="min-w-0 space-y-5">
            <ApprovalInspector
              item={selected}
              busy={!!selected && busyId === selected.id}
              locked={busyId !== null}
              onApprove={approve}
              onDecline={openDecline}
            />
            <ResolutionVelocity created={queue.map((r) => r.createdUtc)} now={now} ready={ready} />
          </div>
        </div>
      </div>

      <AdminDialog open={!!declining} title="Decline request" onClose={() => setDeclining(null)}>
        <div className="space-y-3 text-sm">
          <p className="text-[0.8rem]">
            {declining ? t("Decline the request from {name}?", { name: declining.name }) : null}
          </p>

          <label className="grid gap-1 text-[0.8rem]">
            <span className="font-semibold">
              {declining?.source === "signup" ? t("Reason (optional, sent by email)") : t("Reason (optional)")}
            </span>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={500}
              rows={3}
              className="rounded-lg border border-[#d5dee8] px-3 py-2 outline-none focus:border-[#06b6d4]"
            />
          </label>

          {error && (
            <p role="alert" className="text-[0.75rem] font-medium text-[#b83232]">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setDeclining(null)}
              className="rounded-lg border border-[#cfe0ee] px-4 py-2 text-[0.75rem] font-semibold hover:bg-[#eef4fa]"
            >
              {t("Cancel")}
            </button>
            <button
              type="button"
              onClick={confirmDecline}
              disabled={busyId !== null}
              className="inline-flex items-center gap-2 rounded-lg bg-[#b83232] px-4 py-2 text-[0.75rem] font-semibold text-white disabled:opacity-50"
            >
              {busyId !== null && <LoaderCircle className="size-3.5 animate-spin" />}
              {t("Decline")}
            </button>
          </div>
        </div>
      </AdminDialog>

      <AdminDialog open={!!starter} title="Assign students" onClose={() => setStarter(null)}>
        {starter && (
          <StarterStudents mentorId={starter.id} mentorName={starter.name} trackCode={starter.trackCode} onDone={closeStarter} />
        )}
      </AdminDialog>
    </AdminSurface>
  );
}