"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  BarChart3,
  Check,
  ClipboardCheck,
  Download,
  FileText,
  GraduationCap,
  LoaderCircle,
  Megaphone,
  Plus,
  Route as Route2,
  School,
  UserCheck,
  UsersRound,
} from "lucide-react";
import {
  APPROVALS_CHANGED,
  approveMentorRequest,
  approveSignup,
  approveTrackRequest,
  getAdminOverview,
  getAdminSquads,
  getAdminTracks,
  getApprovals,
  getMentorRequests,
  getPlatformActivity,
  getSystemReport,
  getTrackRequests,
  rejectMentorRequest,
  rejectSignup,
  rejectTrackRequest,
  type AdminOverview,
  type AdminSquad,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "./admin-data";
import { STATUS_LABEL } from "./SquadCard";

/** Colours of the "Students by Track" donut, in order of size. */
const TRACK_COLORS = ["#12939b", "#12676b", "#1a2b57", "#7fddc9", "#06b6d4", "#5b6b88", "#b8c4d0"];

const LESSONS_COLOR = "#12939b";
const TASKS_COLOR = "#7fddc9";

const card = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

/** Table cell: a labelled row on phones, a normal cell from md up. */
const TD =
  "flex items-center justify-between gap-[1em] px-[0.6em] py-[0.5em] before:shrink-0 before:text-[0.8em] before:font-semibold before:text-[#8a97a6] before:content-[attr(data-label)] md:table-cell md:px-[1em] md:py-[1em] md:before:hidden";

/* ------------------------------------------------------------------ */
/* helpers                                                             */
/* ------------------------------------------------------------------ */

function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) =>
      setBox({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }),
    );
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

function niceMax(value: number) {
  if (value <= 4) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

/** Smooth path through points (Catmull-Rom to Bezier). */
function smooth(pts: [number, number][]) {
  if (pts.length < 2) return "";
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0]},${c1[1]} ${c2[0]},${c2[1]} ${p2[0]},${p2[1]}`;
  }
  return d;
}

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

function StatTile({ label, value, delta, hint, icon }: { label: string; value: string; delta: string; hint: string; icon: ReactNode }) {
  return (
    <li className={`${card} flex flex-col gap-[0.5em] p-[1.1em]`}>
      <div className="flex items-center justify-between text-[0.8em] text-[#5b6b7c]">
        <span>{label}</span>
        <span className="grid size-[2em] place-items-center rounded-[0.6em] bg-[#eef3fa] text-[#14365a]">{icon}</span>
      </div>
      <p className="text-[2em] font-extrabold leading-none text-[#0b1b2b]">{value}</p>
      <p className="text-[0.75em] text-[#8a97a6]">
        <span className="me-[0.4em] rounded-full bg-[#d7efe6] px-[0.6em] py-[0.1em] font-semibold text-[#12676b]">{delta}</span>
        {hint}
      </p>
    </li>
  );
}

function CardTitle({ icon, children, aside }: { icon?: ReactNode; children: ReactNode; aside?: ReactNode }) {
  return (
    <header className="flex shrink-0 items-center gap-[0.7em]">
      {icon && <span className="grid size-[2.2em] place-items-center rounded-[0.6em] bg-[#14365a] text-white">{icon}</span>}
      <h2 className="flex-1 text-[1.05em] font-bold text-[#14365a]">{children}</h2>
      {aside}
    </header>
  );
}

function ActivityChart({ w, h, days, label }: { w: number; h: number; days: AdminOverview["activity"]; label: string }) {
  if (w < 40 || h < 40 || days.length < 2) return null;
  const A = days.map((d) => d.lessonsPassed);
  const B = days.map((d) => d.tasksDone);
  const max = niceMax(Math.max(...A, ...B, 1));
  const ticks = [0, 0.5, 1].map((f) => Math.round(f * max));
  const names = days.map((d) => new Date(`${d.date}T00:00:00`).toLocaleDateString(dateLocale(), { weekday: "short" }));
  const L = 30;
  const R = 10;
  const T = 10;
  const Bt = 22;
  const n = days.length - 1;
  const x = (i: number) => L + (i / n) * (w - L - R);
  const y = (v: number) => T + (h - T - Bt) - (v / max) * (h - T - Bt);
  const area = (vals: number[]) => {
    const pts = vals.map((v, i) => [x(i), y(v)] as [number, number]);
    return `${smooth(pts)} L${x(n)},${y(0)} L${x(0)},${y(0)} Z`;
  };

  return (
    <svg width={w} height={h} role="img" aria-label={label} className="absolute inset-0" direction="ltr">
      <defs>
        <linearGradient id="gA" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={LESSONS_COLOR} stopOpacity="0.55" />
          <stop offset="1" stopColor={LESSONS_COLOR} stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="gB" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={TASKS_COLOR} stopOpacity="0.6" />
          <stop offset="1" stopColor={TASKS_COLOR} stopOpacity="0.05" />
        </linearGradient>
      </defs>
      {ticks.map((tk2) => (
        <g key={tk2}>
          <line x1={L} x2={w - R} y1={y(tk2)} y2={y(tk2)} stroke="#e6edf3" strokeDasharray="3 4" />
          <text x={L - 8} y={y(tk2) + 3.5} textAnchor="end" fontSize="10" fill="#8a97a6">{tk2}</text>
        </g>
      ))}
      {names.map((nm, i) => (
        <text key={i} x={x(i)} y={h - 5} textAnchor="middle" fontSize="10" fill="#8a97a6">{nm}</text>
      ))}
      <path d={area(B)} fill="url(#gB)" stroke={TASKS_COLOR} strokeWidth="2" />
      <path d={area(A)} fill="url(#gA)" stroke={LESSONS_COLOR} strokeWidth="2" />
    </svg>
  );
}

function Donut({ size, segments, center }: { size: number; segments: { value: number; color: string }[]; center?: ReactNode }) {
  if (size < 40) return null;
  const r = 38;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0);
  if (total === 0) return null;
  return (
    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-hidden>
        <g transform="rotate(-90 60 60)">
          {segments.map((s, i) => {
            const len = (s.value / total) * c;
            const start = (segments.slice(0, i).reduce((a, p) => a + p.value, 0) / total) * c;
            return (
              <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="16"
                strokeDasharray={`${Math.max(len - 1.5, 0)} ${c - len + 1.5}`} strokeDashoffset={-start} />
            );
          })}
        </g>
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{center}</div>
    </div>
  );
}

function SquadTile({ s }: { s: AdminSquad }) {
  const { t } = useI18n();
  return (
    <Link href={`/admin/squads/${s.id}` as Route} className="block rounded-[0.9em] border border-[#e6edf3] p-[1em] hover:border-[#12939b]">
      <header className="flex items-center justify-between gap-[0.5em]">
        <h3 className="truncate font-bold text-[#0b1b2b]">{s.name}</h3>
        <span className="shrink-0 rounded-full bg-[#eef3fa] px-[0.6em] py-[0.1em] text-[0.7em] font-semibold text-[#14365a]">{t(STATUS_LABEL[s.status])}</span>
      </header>
      <p className="mt-[0.3em] truncate text-[0.75em] text-[#5b6b7c]">
        <span className="me-[0.5em] rounded bg-[#e6f4f1] px-[0.5em] py-[0.1em] font-semibold text-[#0f7378]">{t(s.level)}</span>
        {s.projectTitle}
      </p>
      <div className="mt-[0.7em] flex items-center justify-between text-[0.7em] text-[#8a97a6]">
        <span>{t("Sprint Progress")}</span>
        <span className="font-semibold text-[#14365a]">{Math.round(s.progress)}%</span>
      </div>
      <div className="mt-[0.3em] h-[0.45em] overflow-hidden rounded-full bg-[#e6edf3]">
        <div className="h-full rounded-full bg-[#12939b]" style={{ width: `${s.progress}%` }} />
      </div>
      <p className="mt-[0.6em] flex items-center justify-between gap-[0.5em] text-[0.7em] text-[#5b6b7c]">
        <span className="inline-flex items-center gap-[0.3em]">
          <UsersRound className="size-[1em]" /> {s.students}/{s.capacity}
        </span>
        <span className="truncate text-[#12676b]">{s.monitor?.fullName ?? t("No monitor yet")}</span>
      </p>
    </Link>
  );
}

/* ------------------------------------------------------------------ */
/* pending requests (real data from getApprovals)                      */
/* ------------------------------------------------------------------ */

/** "18m ago", "1h ago", "3d ago". */
function timeAgo(iso: string, t: (key: string, vars?: Record<string, string | number>) => string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return t("{count}m ago", { count: Math.max(mins, 1) });
  if (mins < 60 * 24) return t("{count}h ago", { count: Math.floor(mins / 60) });
  return t("{count}d ago", { count: Math.floor(mins / 1440) });
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

type Kind = "signup" | "mentorChange" | "trackRequest";

/** One request waiting for the admin, whatever API it comes from. */
type Pending = {
  id: string;
  kind: Kind;
  name: string;
  sub: string;
  typeLabel: string;
  track: string | null;
  createdUtc: string;
  approve: () => Promise<unknown>;
  reject: () => Promise<unknown>;
};

const KIND_LABEL: Record<Kind, string> = {
  signup: tk("Sign-ups"),
  mentorChange: tk("Mentor Change"),
  trackRequest: tk("New Track Request"),
};

/** Every request waiting for the admin: sign-ups, students' mentor changes, mentors' new tracks. */
async function loadPending(): Promise<Pending[]> {
  const [signups, changes, tracks] = await Promise.all([getApprovals(), getMentorRequests(), getTrackRequests()]);
  return [
    ...signups.map(
      (a): Pending => ({
        id: a.id,
        kind: "signup",
        name: a.fullName,
        sub: a.email,
        typeLabel: a.role === "Mentor" ? tk("Mentor Signup") : tk("Teacher Signup"),
        track: a.trackName ?? a.schoolName,
        createdUtc: a.createdUtc,
        approve: () => approveSignup(a.id),
        reject: () => rejectSignup(a.id, ""),
      }),
    ),
    ...changes.map(
      (r): Pending => ({
        id: r.id,
        kind: "mentorChange",
        name: r.student.fullName,
        sub: r.requestedMentor.fullName,
        typeLabel: tk("Mentor Change"),
        track: r.trackName,
        createdUtc: r.createdUtc,
        approve: () => approveMentorRequest(r.id),
        reject: () => rejectMentorRequest(r.id),
      }),
    ),
    ...tracks.map(
      (r): Pending => ({
        id: r.id,
        kind: "trackRequest",
        name: r.mentor.fullName,
        sub: r.currentTrackName,
        typeLabel: tk("New Track Request"),
        track: r.trackName,
        createdUtc: r.createdUtc,
        approve: () => approveTrackRequest(r.id),
        reject: () => rejectTrackRequest(r.id),
      }),
    ),
  ].sort((x, y) => x.createdUtc.localeCompare(y.createdUtc));
}

function PendingRow({ a, onDone }: { a: Pending; onDone: (id: string) => void }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function act(kind: "approve" | "reject") {
    setBusy(kind);
    setError(null);
    try {
      await (kind === "approve" ? a.approve() : a.reject());
      onDone(a.id);
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  return (
    <tr className="mb-[0.8em] block rounded-[0.9em] border border-[#e6edf3] p-[0.4em] md:mb-0 md:table-row md:rounded-none md:border-0 md:border-b md:border-[#eef2f6] md:p-0 md:last:border-b-0">
      <td data-label={t("Student requester")} className={TD}>
        <span className="flex min-w-0 items-center gap-[0.8em]">
          <span className="grid size-[2.8em] shrink-0 place-items-center rounded-full bg-[#14365a] text-[0.9em] font-bold text-white">
            {initials(a.name)}
          </span>
          <span className="min-w-0">
            <span className="block font-bold text-[#0b1b2b]">{a.name}</span>
            <span dir={a.kind === "signup" ? "ltr" : undefined} className="block truncate text-[0.85em] text-[#8a97a6] rtl:text-end">
              {a.kind === "mentorChange" ? t("Wants {mentor} as their mentor", { mentor: a.sub }) : a.sub}
            </span>
          </span>
        </span>
      </td>
      <td data-label={t("Request Type")} className={TD}>
        <span className="inline-flex items-center gap-[0.5em] rounded-[1.2em] bg-[#dbe8fb] px-[0.9em] py-[0.5em] text-[0.8em] font-bold leading-tight text-[#14365a]">
          {a.kind === "signup" ? <School className="size-[1.1em] shrink-0" /> : <UsersRound className="size-[1.1em] shrink-0" />}
          {t(a.typeLabel)}
        </span>
      </td>
      <td data-label={t("Track")} className={`${TD} text-[#14365a]/80`}>{a.track ? t(a.track) : "—"}</td>
      <td data-label={t("Submitted")} className={`${TD} text-[#8a97a6]`}>{timeAgo(a.createdUtc, t)}</td>
      <td data-label={t("Quick Actions")} className={TD}>
        <span className="inline-flex gap-[0.5em]">
          <button type="button" disabled={!!busy} onClick={() => act("approve")}
            className="inline-flex items-center gap-[0.3em] rounded-[0.4em] bg-[#0e6b5c] px-[0.9em] py-[0.35em] text-[0.9em] font-semibold text-white hover:bg-[#0b5a4d] disabled:opacity-50">
            {busy === "approve" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Check className="size-[1em]" />} {t("Approve")}
          </button>
          <button type="button" disabled={!!busy} onClick={() => act("reject")}
            className="inline-flex items-center gap-[0.3em] rounded-[0.4em] bg-[#e7edf8] px-[0.9em] py-[0.35em] text-[0.9em] font-semibold text-[#5b6b7c] hover:bg-[#dbe4f3] disabled:opacity-50">
            {busy === "reject" && <LoaderCircle className="size-[1em] animate-spin" />} {t("Reject")}
          </button>
        </span>
        {error && <span role="alert" className="mt-[0.3em] block text-[0.8em] text-[#b83232]">{error}</span>}
      </td>
    </tr>
  );
}

function PendingRequests({ pending, onDone }: { pending: ReturnType<typeof useAdminData<Pending[]>>; onDone: (id: string) => void }) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<Kind | "all">("all");

  const all = pending.data ?? [];
  const list = filter === "all" ? all : all.filter((a) => a.kind === filter);
  // "Filter By Type" cycles through the kinds.
  const nextFilter: Record<Kind | "all", Kind | "all"> = { all: "signup", signup: "mentorChange", mentorChange: "trackRequest", trackRequest: "all" };
  const filterLabel = filter === "all" ? t("Filter By Type") : t(KIND_LABEL[filter]);

  return (
    <section className={`${card} p-[1.2em]`}>
      <div className="flex flex-wrap items-start justify-between gap-[1em]">
        <div className="min-w-0">
          <div className="flex items-center gap-[0.7em]">
            <h2 className="text-[1.05em] font-bold text-[#14365a]">{t("Pending Administrative Requests")}</h2>
            {pending.data && (
              <span className="rounded-full bg-[#fdd9d9] px-[0.7em] py-[0.1em] text-[0.75em] font-semibold text-[#b83232]">
                {all.length} {t("Total")}
              </span>
            )}
          </div>
          <p className="mt-[0.2em] max-w-[28em] text-[0.8em] text-[#8a97a6]">
            {t("Action items requiring administrative verification or mentor dispatch")}
          </p>
        </div>
        <div className="flex w-full items-stretch gap-[0.6em] text-[0.8em] font-bold sm:w-auto">
          <button type="button" onClick={() => setFilter(nextFilter[filter])}
            className="max-w-[9em] rounded-[0.5em] bg-[#eaf1fd] px-[1.2em] py-[0.6em] text-center leading-tight text-[#14365a] hover:bg-[#dde8fa]">
            {filterLabel}
          </button>
          <Link href={"/admin/approvals" as Route}
            className="grid max-w-[6em] place-items-center rounded-[0.5em] bg-[#d9e9fb] px-[1.2em] py-[0.6em] text-center leading-tight text-[#1d6fe0] hover:bg-[#cbe0f8]">
            {t("Review All")}
          </Link>
        </div>
      </div>

      {!pending.data ? (
        <LoadState error={pending.error} onRetry={pending.reload} />
      ) : list.length === 0 ? (
        <p className="py-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No one is waiting for approval.")}</p>
      ) : (
        <div className="mt-[1em] overflow-x-auto">
          <table className="block w-full text-start text-[0.8em] md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-[#eaf1fd] text-[0.8em] font-bold uppercase tracking-wide text-[#14365a]/70">
                <th className="rounded-s-[0.6em] px-[1em] py-[0.9em] text-start font-bold">{t("Student requester")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Request Type")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Track")}</th>
                <th className="px-[1em] py-[0.9em] text-start font-bold">{t("Submitted")}</th>
                <th className="rounded-e-[0.6em] px-[1em] py-[0.9em] text-start font-bold">{t("Quick Actions")}</th>
              </tr>
            </thead>
            <tbody className="block md:table-row-group">
              {list.slice(0, 3).map((a) => (
                <PendingRow key={a.id} a={a} onDone={onDone} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* page                                                                */
/* ------------------------------------------------------------------ */

/** "Everything is a card": one card per part of the system with its live number, linking to its page. */
function AreaCard({ href, icon, label, value, hint }: { href: string; icon: ReactNode; label: string; value: ReactNode; hint: string }) {
  return (
    <li>
      <Link href={href as Route} className={`${card} group flex h-full items-center gap-[0.8em] p-[1em] hover:ring-2 hover:ring-[#12939b]/40`}>
        <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.8em] bg-[#e6f4f1] text-[#0f7378]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.75em] text-[#5b6b7c]">{label}</span>
          <span className="block text-[1.35em] font-extrabold leading-tight text-[#0b1b2b]">{value}</span>
          <span className="block truncate text-[0.7em] text-[#8a97a6]">{hint}</span>
        </span>
        <ArrowRight className="size-[1.1em] shrink-0 text-[#8a97a6] transition-transform group-hover:translate-x-0.5 rtl:rotate-180" />
      </Link>
    </li>
  );
}

const QUICK_ACTIONS: { href: string; label: string }[] = [
  { href: "/admin/squads", label: tk("Create Squad") },
  { href: "/admin/mentors/new", label: tk("Add Mentor") },
  { href: "/admin/notifications", label: tk("Compose Notification") },
  { href: "/admin/mentors", label: tk("Students without a mentor") },
  { href: "/admin/approvals", label: tk("Review requests") },
];

export default function AdminDashboard() {
  const { t } = useI18n();
  const [chartRef, chartBox] = useBox<HTMLDivElement>();
  const [donutRef, donutBox] = useBox<HTMLDivElement>();
  const { data: overview, error, reload } = useAdminData(getAdminOverview, tk("We couldn't load the dashboard. Please try again."));
  const report = useAdminData(getSystemReport, tk("We couldn't load the dashboard. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const feed = useAdminData(useCallback(() => getPlatformActivity(6), []), tk("We couldn't load the activity. Please try again."));
  const pending = useAdminData(loadPending, tk("We couldn't load the requests. Please try again."));
  const [quickOpen, setQuickOpen] = useState(false);

  const r = report.data;
  const dash = "—";
  const byTrack = (r?.students.byTrack ?? []).filter((x) => x.key !== "None");
  const trackTotal = byTrack.reduce((a, x) => a + x.count, 0);
  const squadList = squads.data ?? [];
  const activeSquads = squadList.filter((s) => s.status === "Active").length;
  const topSquads = [...squadList]
    .sort((a, b) => Number(b.status === "Active") - Number(a.status === "Active") || b.progress - a.progress)
    .slice(0, 4);
  const topTracks = [...(tracks.data?.tracks ?? [])].sort((a, b) => b.students - a.students).slice(0, 3);
  const week = overview?.activity ?? [];
  const lessonsWeek = week.reduce((a, d) => a + d.lessonsPassed, 0);
  const tasksWeek = week.reduce((a, d) => a + d.tasksDone, 0);
  const change = overview?.activeStudentsChangePercent;
  const pendingCount = pending.data?.length;
  const sessionsDone = r ? r.mentorship.sessionsCompleted : null;

  const dropPending = (id: string) => {
    pending.setData((l) => l?.filter((x) => x.id !== id) ?? null);
    window.dispatchEvent(new Event(APPROVALS_CHANGED));
  };

  return (
    // The shell's top bar floats over the page (absolute), so the top padding clears it.
    // < xl: the shell's <main> scrolls. xl+: <main> is overflow-hidden, so this box scrolls itself.
    <div
      className="min-w-0 flex-1 bg-[#f5f8fe] px-3 pb-6 pt-[calc(var(--u)*5.4)] sm:px-5 xl:absolute xl:inset-0 xl:overflow-y-auto"
      style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
    >
      {/* ---------- Header ---------- */}
      <section className="flex flex-wrap items-end justify-between gap-[1em]">
        <div>
          <p className="text-[0.7em] font-semibold uppercase tracking-wide text-[#12939b]">{t("Telemetry & cohort pulse")}</p>
          <h1 className="text-[2em] font-extrabold leading-tight text-[#0b1b2b]">{t("Dashboard Overview")}</h1>
          <p className="text-[0.85em] text-[#5b6b7c]">{t("Monitor learning activity and manage your community.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-[0.6em] text-[0.8em]">
          <span className="rounded-[0.6em] border border-[#d5dee8] bg-white px-[1em] py-[0.5em] font-medium text-[#14365a]">
            {t("Last 7 Days")}
          </span>
          <Link
            href={"/admin/reports" as Route}
            className="inline-flex items-center gap-[0.4em] rounded-[0.6em] border border-[#d5dee8] bg-white px-[1em] py-[0.5em] font-medium text-[#14365a]"
          >
            <Download className="size-[1em]" /> {t("Export Report")}
          </Link>
          <div className="relative">
            <button
              type="button"
              aria-expanded={quickOpen}
              onClick={() => setQuickOpen((o) => !o)}
              className="inline-flex items-center gap-[0.3em] rounded-[0.6em] bg-[#1d6fe0] px-[1.1em] py-[0.5em] font-semibold text-white hover:bg-[#1859b5]"
            >
              <Plus className="size-[1em]" /> {t("Quick Action")}
            </button>
            {quickOpen && (
              <ul className="absolute end-0 top-full z-30 mt-[0.4em] w-[15em] overflow-hidden rounded-[0.8em] bg-white py-[0.3em] shadow-xl ring-1 ring-[#e6edf3]">
                {QUICK_ACTIONS.map((q) => (
                  <li key={q.href + q.label}>
                    <Link href={q.href as Route} className="block px-[1em] py-[0.55em] text-[#14365a] hover:bg-[#f1f6fb]">
                      {t(q.label)}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>

      {error && <LoadState error={error} onRetry={reload} className="mt-[1em]" />}

      {/* ---------- Stats ---------- */}
      <ul className="mt-[1.2em] grid grid-cols-1 gap-[1em] min-[480px]:grid-cols-2 xl:grid-cols-4">
        <StatTile
          label={t("Total Students")}
          value={overview ? overview.totalStudents.toLocaleString("en") : dash}
          delta={change == null ? t("{count} active", { count: overview?.activeStudents ?? 0 }) : `${change > 0 ? "+" : ""}${Math.round(change)}%`}
          hint={change == null ? t("this week") : t("active vs last week")}
          icon={<UsersRound className="size-[1.1em]" />}
        />
        <StatTile
          label={t("Active Squads")}
          value={squads.data ? String(activeSquads) : dash}
          delta={t("{count} total", { count: squadList.length })}
          hint={t("{count} without a monitor", { count: overview?.squadsWithoutMonitor ?? 0 })}
          icon={<UsersRound className="size-[1.1em]" />}
        />
        <StatTile
          label={t("Active Mentors")}
          value={r ? String(r.mentorship.activeMentors) : dash}
          delta={r ? `★ ${r.mentorship.averageRating.toFixed(1)}` : dash}
          hint={t("{count} students without a mentor", { count: r?.mentorship.studentsWithoutMentor ?? 0 })}
          icon={<Check className="size-[1.1em]" />}
        />
        <StatTile
          label={t("Pending Requests")}
          value={pendingCount == null ? dash : String(pendingCount)}
          delta={t("{count} reviews", { count: overview?.pendingReviews ?? 0 })}
          hint={t("need review")}
          icon={<School className="size-[1.1em]" />}
        />
      </ul>

      {/* ---------- Every part of the system as a card ---------- */}
      <ul className="mt-[1.2em] grid grid-cols-1 gap-[1em] min-[480px]:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        <AreaCard href="/admin/students" icon={<GraduationCap className="size-[1.2em]" />} label={t("Students")} value={r ? r.students.total : dash}
          hint={r ? t("{count} active in the last 7 days", { count: r.students.activeLast7Days }) : ""} />
        <AreaCard href="/admin/squads" icon={<UsersRound className="size-[1.2em]" />} label={t("Squads")} value={r ? r.squads.total : dash}
          hint={r ? t("{done} of {total} tasks done", { done: r.squads.tasksDone, total: r.squads.tasksTotal }) : ""} />
        <AreaCard href="/admin/mentors" icon={<UserCheck className="size-[1.2em]" />} label={t("Mentors")} value={r ? r.mentorship.mentors : dash}
          hint={sessionsDone == null ? "" : t("{count} sessions completed", { count: sessionsDone })} />
        <AreaCard href="/admin/tracks" icon={<Route2 className="size-[1.2em]" />} label={t("Tracks")} value={r ? r.learning.tracks : dash}
          hint={r ? t("{count} lessons", { count: r.learning.lessons }) : ""} />
        <AreaCard href="/admin/approvals" icon={<ClipboardCheck className="size-[1.2em]" />} label={t("Pending Requests")} value={pendingCount ?? dash}
          hint={t("Sign-ups, mentor changes, new tracks")} />
        <AreaCard href="/admin/notifications" icon={<Megaphone className="size-[1.2em]" />} label={t("Announcements")} value={r ? r.platform.announcements : dash}
          hint={r ? t("{count} unread notifications", { count: r.platform.unreadNotifications }) : ""} />
        <AreaCard href="/admin/assignments" icon={<FileText className="size-[1.2em]" />} label={t("Assignments & Submissions")} value={r ? r.teaching.submissions : dash}
          hint={r ? t("{count} waiting for a grade", { count: r.teaching.waitingForGrade }) : ""} />
        <AreaCard href="/admin/reports" icon={<BarChart3 className="size-[1.2em]" />} label={t("System Report")} value={r ? r.users.total : dash}
          hint={t("accounts · full report and export")} />
      </ul>

      {/* ---------- Activity + Students by track ---------- */}
      <section className="mt-[1.2em] grid gap-[1.2em] xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <article className={`${card} flex min-h-[20em] min-w-0 flex-col p-[1.2em]`}>
          <CardTitle icon={<BarChart3 className="size-[1.1em]" />}>{t("Platform Learning Activity")}</CardTitle>
          <dl className="mt-[0.8em] grid shrink-0 grid-cols-1 gap-[0.6em] sm:grid-cols-3 rounded-[0.7em] bg-[#f4f7fb] px-[1em] py-[0.6em] text-[0.8em]">
            <div>
              <dt className="text-[0.85em] text-[#8a97a6]">{t("Lessons passed")}</dt>
              <dd className="font-bold text-[#14365a]">{overview ? lessonsWeek : dash}</dd>
            </div>
            <div>
              <dt className="text-[0.85em] text-[#8a97a6]">{t("Squad tasks done")}</dt>
              <dd className="font-bold text-[#14365a]">{overview ? tasksWeek : dash}</dd>
            </div>
            <div>
              <dt className="text-[0.85em] text-[#8a97a6]">{t("Weekly Active Rate")}</dt>
              <dd className="font-bold text-[#14365a]">
                {overview && overview.totalStudents ? `${Math.round((overview.activeStudents / overview.totalStudents) * 100)}%` : dash}
              </dd>
            </div>
          </dl>
          <ul className="mt-[0.6em] flex shrink-0 flex-wrap gap-x-[1.2em] gap-y-[0.3em] text-[0.75em] text-[#14365a]">
            <li className="flex items-center gap-[0.4em]"><span className="size-[0.7em] rounded-full" style={{ backgroundColor: LESSONS_COLOR }} /> {t("Lessons passed")}</li>
            <li className="flex items-center gap-[0.4em]"><span className="size-[0.7em] rounded-full" style={{ backgroundColor: TASKS_COLOR }} /> {t("Squad tasks done")}</li>
          </ul>
          <div ref={chartRef} className="relative mt-[0.5em] min-h-[11em] flex-1">
            {overview ? (
              <ActivityChart w={chartBox.w} h={chartBox.h} days={overview.activity} label={t("Platform Learning Activity")} />
            ) : (
              !error && <LoadState error={null} onRetry={reload} />
            )}
          </div>
        </article>

        <article className={`${card} flex min-h-[20em] min-w-0 flex-col p-[1.2em]`}>
          <CardTitle>{t("Students by Track")}</CardTitle>
          <p className="text-[0.75em] text-[#8a97a6]">{t("Current enrollment distribution")}</p>
          <div ref={donutRef} className="relative mt-[0.5em] min-h-[10em] flex-1">
            <Donut
              size={Math.min(donutBox.w, donutBox.h) * 0.92}
              segments={byTrack.map((x, i) => ({ value: x.count, color: TRACK_COLORS[i % TRACK_COLORS.length] }))}
              center={
                <span>
                  <span className="block text-[1.4em] font-extrabold text-[#0b1b2b]">{trackTotal.toLocaleString("en")}</span>
                  <span className="block text-[0.6em] uppercase text-[#8a97a6]">{t("Enrolled")}</span>
                </span>
              }
            />
            {!r && <LoadState error={report.error} onRetry={report.reload} />}
          </div>
          <ul className="mt-[0.6em] space-y-[0.35em] text-[0.75em] text-[#14365a]">
            {byTrack.map((x, i) => (
              <li key={x.key} className="flex items-center gap-[0.6em]">
                <span className="size-[0.65em] rounded-full" style={{ backgroundColor: TRACK_COLORS[i % TRACK_COLORS.length] }} />
                <span className="flex-1">{t(x.key)}</span>
                <span className="text-[#8a97a6]">{x.count}</span>
                <span className="w-[3em] text-end font-semibold">{trackTotal ? Math.round((x.count / trackTotal) * 100) : 0}%</span>
              </li>
            ))}
          </ul>
        </article>
      </section>

      {/* ---------- Sprints + Tracks + Feed ---------- */}
      <section className="mt-[1.2em] grid gap-[1.2em] xl:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]">
        <article className={`${card} min-w-0 p-[1.2em]`}>
          <CardTitle
            aside={
              <Link href={"/admin/squads" as Route} className="text-[0.75em] font-semibold text-[#1d6fe0] hover:underline">
                {t("View All {count} Squads", { count: squadList.length })} →
              </Link>
            }
          >
            {t("Squad Sprint Status")}
          </CardTitle>
          <p className="mt-[0.2em] text-[0.8em] text-[#8a97a6]">{t("Real-time velocity and sprint-bell enables across active cohorts")}</p>
          {!squads.data ? (
            <LoadState error={squads.error} onRetry={squads.reload} />
          ) : (
            <div className="mt-[0.8em] grid gap-[0.9em] sm:grid-cols-2">
              {topSquads.map((s) => (
                <SquadTile key={s.id} s={s} />
              ))}
            </div>
          )}
        </article>

        <div className="grid min-w-0 gap-[1.2em] md:grid-cols-2 xl:grid-cols-1">
          <article className={`${card} p-[1.2em]`}>
            <CardTitle>{t("Course Milestones")}</CardTitle>
            <p className="text-[0.75em] text-[#8a97a6]">{t("Cohort completion velocity")}</p>
            <ul className="mt-[0.8em] space-y-[0.8em]">
              {topTracks.map((m) => (
                <li key={m.id}>
                  <Link href={`/admin/tracks/${m.id}` as Route} className="flex items-center gap-[0.8em] hover:underline">
                    <span className="grid size-[2.8em] shrink-0 place-items-center rounded-full border-[3px] border-[#12939b] text-[0.7em] font-bold text-[#14365a]">
                      {Math.round(m.progress)}%
                    </span>
                    <span className="min-w-0 text-[0.85em]">
                      <span className="block font-semibold text-[#0b1b2b]">{t(m.name)}</span>
                      <span className="block text-[0.85em] text-[#8a97a6]">
                        {t("{students} students · {squads} squads", { students: m.students, squads: m.squads })}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </article>

          <article className={`${card} p-[1.2em]`}>
            <CardTitle>{t("Recent Platform Activity")}</CardTitle>
            {!feed.data ? (
              <LoadState error={feed.error} onRetry={feed.reload} />
            ) : feed.data.length === 0 ? (
              <p className="py-[1em] text-center text-[0.8em] text-[#8a97a6]">{t("Nothing yet.")}</p>
            ) : (
              <ul className="mt-[0.8em] space-y-[0.7em] text-[0.8em]">
                {feed.data.map((f, i) => (
                  <li key={i} className="flex gap-[0.6em]">
                    <span className="mt-[0.45em] size-[0.55em] shrink-0 rounded-full bg-[#12939b]" />
                    <span>
                      <span className="block text-[#14365a]">
                        <Link href={`/admin/students/${f.studentId}` as Route} className="font-semibold hover:underline">
                          {f.studentName}
                        </Link>{" "}
                        · {f.text}
                      </span>
                      <span className="block text-[0.85em] text-[#8a97a6]">
                        {timeAgo(f.createdUtc, t)}
                        {f.trackName && ` · ${t(f.trackName)}`}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </section>

      {/* ---------- Pending requests ---------- */}
      <div className="mt-[1.2em]">
        <PendingRequests pending={pending} onDone={dropPending} />
      </div>
    </div>
  );
}
