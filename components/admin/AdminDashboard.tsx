"use client";

import { activityText } from "@/lib/activity-text";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import Link from "next/link";
import type { Route } from "next";
import {
  ArrowRight,
  ArrowUp,
  BarChart3,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  CircleCheck,
  ClipboardCheck,
  GraduationCap,
  Hourglass,
  LoaderCircle,
  Megaphone,
  Plus,
  RefreshCw,
  Route as Route2,
  School,
  Share,
  Star,
  TrendingDown,
  TrendingUp,
  Trophy,
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
  type DashboardPeriod,
  type AdminSquad,
  type PlatformActivity,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { LoadState, useAdminData } from "./admin-data";
import { STATUS_LABEL } from "./SquadCard";

/** Colours of the "Students by Track" donut, in order of size (Dashboard design). */
const TRACK_COLORS = ["#14b8a6", "#1cb5e0", "#565e80", "#0f5f73", "#c4cbd3", "#7fddc9", "#1a2b57"];

/** The two chart series (Dashboard design: cyan + teal). */
const LESSONS_COLOR = "#1cb5d8";
const TASKS_COLOR = "#16b79b";

/** Progress bar colours of the squad sprint cards, one per card. */
const SQUAD_COLORS = ["#1cb5e0", "#0f6e5f", "#565e80", "#0f5f73"];

const card = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.06)]";

/** Table cell: a labelled row on phones, a normal cell from md up. */
const TD =
  "flex items-center justify-between gap-[1em] px-[0.6em] py-[0.5em] before:shrink-0 before:text-[0.8em] before:font-semibold before:text-[#8a97a6] before:content-[attr(data-label)] md:table-cell md:px-[1em] md:py-[1.1em] md:align-middle md:before:hidden";

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

/** "18m ago", "1h ago", "3d ago". */
function timeAgo(iso: string, t: (key: string, vars?: Record<string, string | number>) => string) {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return t("{count}m ago", { count: Math.max(mins, 1) });
  if (mins < 60 * 24) return t("{count}h ago", { count: Math.floor(mins / 60) });
  return t("{count}d ago", { count: Math.floor(mins / 1440) });
}

const initials = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const weekday = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale(), { weekday: "short" });
const shortDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString(dateLocale("en-GB"), { day: "numeric", month: "short" });
/** Day names for a week, dates for longer periods. */
const dayLabel = (date: string, count: number) => (count <= 7 ? weekday(date) : shortDate(date));

const PERIODS: { days: DashboardPeriod; label: string }[] = [
  { days: 7, label: tk("Last 7 Days") },
  { days: 14, label: tk("Last 14 Days") },
  { days: 30, label: tk("Last 30 Days") },
  { days: 90, label: tk("Last 90 Days") },
];
const PERIOD_KEY = "jh_admin_dashboard_days";

const noSubscribe = () => () => {};
function readSavedPeriod(): DashboardPeriod {
  try {
    const saved = Number(localStorage.getItem(PERIOD_KEY));
    return PERIODS.some((p) => p.days === saved) ? (saved as DashboardPeriod) : 7;
  } catch {
    return 7;
  }
}

/** A round picture, or the person's initials when there is none. */
function Avatar({ name, src, className = "" }: { name: string; src?: string | null; className?: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element -- photos come from the API's own host
    <img src={src} alt="" className={`shrink-0 rounded-full object-cover ring-2 ring-white ${className}`} />
  ) : (
    <span className={`grid shrink-0 place-items-center rounded-full bg-[#1a2b57] font-semibold text-white ring-2 ring-white ${className}`}>
      {initials(name)}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* small pieces                                                        */
/* ------------------------------------------------------------------ */

type StatTone = "blue" | "teal" | "red";

const STAT_TONES: Record<StatTone, { icon: string; chip: string; blob: string }> = {
  blue: { icon: "bg-[#e3f0fd] text-[#1d6fe0]", chip: "bg-[#e3f0fd] text-[#1d5fb8]", blob: "bg-[#e3f4fb]" },
  teal: { icon: "bg-[#e0f5f1] text-[#0f8a7a]", chip: "bg-[#e0f5f1] text-[#0f7366]", blob: "bg-[#ddf7f0]" },
  red: { icon: "bg-[#fde6e6] text-[#d23b3b]", chip: "bg-[#fde6e6] text-[#c23030]", blob: "bg-[#fdecec]" },
};

function StatTile({ label, value, delta, hint, icon, tone }: { label: string; value: string; delta: ReactNode; hint: string; icon: ReactNode; tone: StatTone }) {
  const c = STAT_TONES[tone];
  return (
    <li className={`${card} relative overflow-hidden p-[1.4em]`}>
      <span aria-hidden className={`pointer-events-none absolute -bottom-[2.2em] -end-[1.6em] size-[6.5em] rounded-full opacity-70 ${c.blob}`} />
      <div className="relative flex items-start justify-between gap-[0.6em]">
        <span className="pt-[0.4em] text-[0.82em] text-[#5b6b7c]">{label}</span>
        <span className={`grid size-[2.7em] shrink-0 place-items-center rounded-full ${c.icon}`}>{icon}</span>
      </div>
      <p className="relative mt-[0.5em] text-[2.1em] font-bold leading-none tracking-tight text-[#0b1b2b]">{value}</p>
      <p className="relative mt-[0.9em] flex flex-wrap items-center gap-[0.6em] text-[0.75em] text-[#6b7686]">
        <span className={`inline-flex items-center gap-[0.3em] rounded-[0.4em] px-[0.5em] py-[0.15em] font-semibold ${c.chip}`}>{delta}</span>
        <span className="min-w-0 truncate">{hint}</span>
      </p>
    </li>
  );
}

function SectionTitle({ title, sub, aside }: { title: ReactNode; sub?: string; aside?: ReactNode }) {
  return (
    <header className="flex shrink-0 items-start justify-between gap-[0.8em]">
      <div className="min-w-0">
        <h2 className="text-[1.1em] font-semibold text-[#0b1b2b]">{title}</h2>
        {sub && <p className="mt-[0.2em] text-[0.78em] text-[#6b7686]">{sub}</p>}
      </div>
      {aside}
    </header>
  );
}

function ActivityChart({ w, h, days, label, peakLabel }: { w: number; h: number; days: AdminOverview["activity"]; label: string; peakLabel: (d: AdminOverview["activity"][number]) => string }) {
  if (w < 40 || h < 40 || days.length < 2) return null;
  const A = days.map((d) => d.lessonsPassed);
  const B = days.map((d) => d.tasksDone);
  const max = niceMax(Math.max(...A, ...B, 1));
  const L = 4;
  const R = 4;
  const T = 44;
  const Bt = 30;
  const n = days.length - 1;
  const x = (i: number) => L + (i / n) * (w - L - R);
  const y = (v: number) => T + (h - T - Bt) - (v / max) * (h - T - Bt);
  const line = (vals: number[]) => smooth(vals.map((v, i) => [x(i), y(v)] as [number, number]));
  const area = (vals: number[]) => `${line(vals)} L${x(n)},${y(0)} L${x(0)},${y(0)} Z`;

  // The busiest day gets the dark tooltip, like "Sprint Hackathon Peak" in the design.
  const peak = days.reduce((best, d, i) => (d.lessonsPassed + d.tasksDone > days[best].lessonsPassed + days[best].tasksDone ? i : best), 0);
  const hasPeak = days[peak].lessonsPassed + days[peak].tasksDone > 0;
  const tipX = Math.min(Math.max(x(peak), 90), w - 90);

  return (
    <>
      <svg width={w} height={h} role="img" aria-label={label} className="absolute inset-0" direction="ltr">
        <defs>
          <linearGradient id="dashA" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={LESSONS_COLOR} stopOpacity="0.35" />
            <stop offset="1" stopColor={LESSONS_COLOR} stopOpacity="0.02" />
          </linearGradient>
          <linearGradient id="dashB" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={TASKS_COLOR} stopOpacity="0.45" />
            <stop offset="1" stopColor={TASKS_COLOR} stopOpacity="0.04" />
          </linearGradient>
        </defs>
        {[0, 0.5, 1].map((f) => (
          <line key={f} x1={L} x2={w - R} y1={y(f * max)} y2={y(f * max)} stroke="#e8eef4" strokeDasharray="4 5" />
        ))}
        {days.map((d, i) =>
          // At most about 7 labels, always the first and the last day.
          days.length <= 7 || i === n || i % Math.ceil(days.length / 7) === 0 ? (
            <text key={d.date} x={x(i)} y={h - 8} textAnchor={i === 0 ? "start" : i === n ? "end" : "middle"} fontSize="11" fill="#6b7686">
              {dayLabel(d.date, days.length)}
            </text>
          ) : null,
        )}
        <path d={area(A)} fill="url(#dashA)" />
        <path d={area(B)} fill="url(#dashB)" />
        <path d={line(A)} fill="none" stroke={LESSONS_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        <path d={line(B)} fill="none" stroke={TASKS_COLOR} strokeWidth="2.5" strokeLinecap="round" />
        {hasPeak && (
          <>
            <circle cx={x(peak)} cy={y(A[peak])} r="4.5" fill={LESSONS_COLOR} stroke="#fff" strokeWidth="2" />
            <circle cx={x(peak)} cy={y(B[peak])} r="4.5" fill={TASKS_COLOR} stroke="#fff" strokeWidth="2" />
          </>
        )}
      </svg>
      {hasPeak && (
        <div
          dir="auto"
          className="pointer-events-none absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-[0.5em] bg-[#1a2b57] px-[0.9em] py-[0.4em] text-center text-[0.72em] text-white shadow-lg"
          style={{ left: tipX }}
        >
          <span className="block font-semibold text-[#5eead4]">{dayLabel(days[peak].date, days.length)}</span>
          {peakLabel(days[peak])}
        </div>
      )}
    </>
  );
}

function Donut({ size, segments, center }: { size: number; segments: { value: number; color: string }[]; center?: ReactNode }) {
  if (size < 40) return null;
  const r = 44;
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
              <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={s.color} strokeWidth="14"
                strokeDasharray={`${Math.max(len - 2, 0)} ${c - len + 2}`} strokeDashoffset={-start} />
            );
          })}
        </g>
      </svg>
      <div className="absolute inset-[22%] grid place-items-center rounded-full bg-white text-center shadow-[0_8px_24px_rgba(20,54,90,0.14)]">{center}</div>
    </div>
  );
}

/** Ring with the percentage inside (Course Milestones). */
function Ring({ value }: { value: number }) {
  const r = 16;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, value));
  return (
    <span className="relative grid size-[3.3em] shrink-0 place-items-center">
      <svg viewBox="0 0 40 40" className="absolute inset-0 size-full -rotate-90" aria-hidden>
        <circle cx="20" cy="20" r={r} fill="none" stroke="#e8eef4" strokeWidth="3.5" />
        <circle cx="20" cy="20" r={r} fill="none" stroke="#14b8a6" strokeWidth="3.5" strokeLinecap="round" strokeDasharray={`${(v / 100) * c} ${c}`} />
      </svg>
      <span className="relative text-[0.72em] font-bold text-[#0b1b2b]">{Math.round(v)}%</span>
    </span>
  );
}

function SquadTile({ s, color }: { s: AdminSquad; color: string }) {
  const { t } = useI18n();
  const progress = Math.round(s.progress);
  return (
    <Link href={`/admin/squads/${s.id}` as Route} className={`${card} block p-[1.2em] transition hover:shadow-[0_10px_28px_rgba(20,54,90,0.12)]`}>
      <header className="flex items-start justify-between gap-[0.5em]">
        <h3 className="flex min-w-0 items-center gap-[0.55em] text-[1.05em] font-semibold text-[#0b1b2b]">
          <span className="size-[0.6em] shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="truncate">{s.name}</span>
        </h3>
        <span className="shrink-0 rounded-[0.4em] bg-[#eef3fa] px-[0.55em] py-[0.15em] text-[0.68em] font-semibold text-[#5b6b88]">
          {t(STATUS_LABEL[s.status])}
        </span>
      </header>
      <p className="mt-[0.45em] flex min-w-0 items-center gap-[0.7em] text-[0.75em] text-[#6b7686]">
        <span className="shrink-0 rounded-[0.35em] bg-[#e0f2fe] px-[0.5em] py-[0.1em] font-semibold text-[#0b4f6c]">{t(s.level)}</span>
        <span className="truncate">{s.projectTitle}</span>
      </p>
      <div className="mt-[1em] flex items-center justify-between text-[0.72em] text-[#5b6b7c]">
        <span>{t("Sprint Progress")}</span>
        <span className="font-bold text-[#0b1b2b]">{progress}%</span>
      </div>
      <div className="mt-[0.4em] h-[0.45em] overflow-hidden rounded-full bg-[#eef2f7]">
        <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
      </div>
      <div className="mt-[1em] flex items-center justify-between gap-[0.5em] text-[0.72em] text-[#5b6b7c]">
        <span className="flex items-center">
          {s.monitor ? (
            <Avatar name={s.monitor.fullName} src={s.monitor.photoUrl} className="size-[2.2em] text-[0.8em]" />
          ) : (
            <span className="grid size-[2.2em] place-items-center rounded-full bg-[#eef2f7] text-[0.8em] text-[#8a97a6] ring-2 ring-white">?</span>
          )}
          <span className="-ms-[0.4em] grid h-[2.2em] min-w-[2.2em] place-items-center rounded-full bg-[#e8eef8] px-[0.4em] text-[0.8em] font-semibold text-[#14365a] ring-2 ring-white">
            +{s.students}
          </span>
        </span>
        <span className="inline-flex min-w-0 items-center gap-[0.35em]">
          <CircleCheck className="size-[1.1em] shrink-0 text-[#0f8a7a]" />
          <span className="truncate">{t("{count}/{total} members", { count: s.students, total: s.capacity })}</span>
        </span>
      </div>
    </Link>
  );
}

function FeedItem({ f, last }: { f: PlatformActivity; last: boolean }) {
  const { t } = useI18n();
  return (
    <li className="relative flex gap-[0.8em] pb-[1em]">
      {!last && <span aria-hidden className="absolute bottom-0 start-[1.05em] top-[2.3em] w-px bg-[#e3e9f0]" />}
      <Avatar name={f.studentName} src={f.photoUrl} className="size-[2.1em] text-[0.75em]" />
      <span className="min-w-0 text-[0.8em]">
        <span className="block leading-snug text-[#0b1b2b]">
          <Link href={`/admin/students/${f.studentId}` as Route} className="font-semibold hover:underline">
            {f.studentName}
          </Link>{" "}
          <span className="text-[#14365a]">{activityText(f.text, t)}</span>
        </span>
        <span className="mt-[0.15em] block text-[0.88em] text-[#6b7686]">
          {timeAgo(f.createdUtc, t)}
          {f.trackName && ` • ${t(f.trackName)}`}
        </span>
      </span>
    </li>
  );
}

/* ------------------------------------------------------------------ */
/* pending requests (real data from getApprovals)                      */
/* ------------------------------------------------------------------ */

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

/** Pill colours of the request type chips (blue / cyan / red like the design). */
const KIND_CHIP: Record<Kind, string> = {
  signup: "bg-[#dbe8fb] text-[#14365a]",
  mentorChange: "bg-[#dff3fb] text-[#0b5f78]",
  trackRequest: "bg-[#fde2e2] text-[#b83232]",
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
    <tr className="mb-[0.8em] block rounded-[0.9em] border border-[#e6edf3] p-[0.4em] md:mb-0 md:table-row md:rounded-none md:border-0 md:p-0">
      <td data-label={t("Student requester")} className={TD}>
        <span className="flex min-w-0 items-center gap-[0.8em]">
          <Avatar name={a.name} className="size-[2.6em] text-[0.85em]" />
          <span className="min-w-0">
            <span className="block text-[1.1em] font-semibold text-[#0b1b2b]">{a.name}</span>
            <span dir={a.kind === "signup" ? "ltr" : undefined} className="block truncate text-[0.9em] text-[#6b7686] rtl:text-end">
              {a.kind === "mentorChange" ? t("Wants {mentor} as their mentor", { mentor: a.sub }) : a.sub}
            </span>
          </span>
        </span>
      </td>
      <td data-label={t("Request Type")} className={TD}>
        <span className={`inline-flex max-w-[9em] items-center gap-[0.5em] rounded-full px-[0.9em] py-[0.5em] text-[0.85em] font-semibold leading-tight ${KIND_CHIP[a.kind]}`}>
          {a.kind === "signup" ? <School className="size-[1.1em] shrink-0" /> : <UsersRound className="size-[1.1em] shrink-0" />}
          {t(a.typeLabel)}
        </span>
      </td>
      <td data-label={t("Track")} className={`${TD} text-[#3d4a5c]`}>{a.track ? t(a.track) : "—"}</td>
      <td data-label={t("Submitted")} className={`${TD} text-[#6b7686]`}>{timeAgo(a.createdUtc, t)}</td>
      <td data-label={t("Quick Actions")} className={TD}>
        <span className="inline-flex gap-[0.5em]">
          <button type="button" disabled={!!busy} onClick={() => act("approve")}
            className="inline-flex items-center gap-[0.3em] rounded-[0.35em] bg-[#0e6b5c] px-[0.8em] py-[0.3em] text-[0.88em] font-semibold text-white hover:bg-[#0b5a4d] disabled:opacity-50">
            {busy === "approve" ? <LoaderCircle className="size-[1em] animate-spin" /> : <Check className="size-[1em]" />} {t("Approve")}
          </button>
          <button type="button" disabled={!!busy} onClick={() => act("reject")}
            className="inline-flex items-center gap-[0.3em] rounded-[0.35em] bg-[#eef2f7] px-[0.8em] py-[0.3em] text-[0.88em] font-medium text-[#6b7686] hover:bg-[#e2e8f0] disabled:opacity-50">
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
    <section className={`${card} p-[1.5em]`}>
      <div className="flex flex-wrap items-start justify-between gap-[1em]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-[0.7em]">
            <h2 className="text-[1.1em] font-semibold text-[#0b1b2b]">{t("Pending Administrative Requests")}</h2>
            {pending.data && (
              <span className="rounded-[0.4em] bg-[#fde2e2] px-[0.55em] py-[0.1em] text-[0.7em] font-semibold text-[#c23030]">
                {all.length} {t("Total")}
              </span>
            )}
          </div>
          <p className="mt-[0.2em] max-w-[28em] text-[0.78em] text-[#6b7686]">
            {t("Action items requiring administrative verification or mentor dispatch")}
          </p>
        </div>
        <div className="flex w-full items-stretch gap-[0.6em] text-[0.78em] font-semibold sm:w-auto">
          <button type="button" onClick={() => setFilter(nextFilter[filter])}
            className="max-w-[9em] rounded-[0.5em] bg-[#eaf1fd] px-[1.3em] py-[0.6em] text-center leading-tight text-[#14365a] hover:bg-[#dde8fa]">
            {filterLabel}
          </button>
          <Link href={"/admin/approvals" as Route}
            className="grid max-w-[7em] place-items-center rounded-[0.5em] bg-[#dde9fb] px-[1.3em] py-[0.6em] text-start leading-tight text-[#1d5fb8] hover:bg-[#cfe0f8]">
            {t("Review All")}
          </Link>
        </div>
      </div>

      {!pending.data ? (
        <LoadState error={pending.error} onRetry={pending.reload} />
      ) : list.length === 0 ? (
        <p className="py-[2em] text-center text-[0.85em] text-[#5b6b7c]">{t("No one is waiting for approval.")}</p>
      ) : (
        <div className="mt-[1.2em] overflow-x-auto">
          <table className="block w-full text-start text-[0.8em] md:table">
            <thead className="hidden md:table-header-group">
              <tr className="bg-[#eaf1fd] text-[0.82em] font-semibold uppercase tracking-[0.06em] text-[#5b6b7c]">
                <th className="rounded-s-[0.4em] px-[1em] py-[1.4em] text-start font-semibold">{t("Student requester")}</th>
                <th className="px-[1em] py-[1.4em] text-start font-semibold">{t("Request Type")}</th>
                <th className="px-[1em] py-[1.4em] text-start font-semibold">{t("Track")}</th>
                <th className="px-[1em] py-[1.4em] text-start font-semibold">{t("Submitted")}</th>
                <th className="rounded-e-[0.4em] px-[1em] py-[1.4em] text-start font-semibold">{t("Quick Actions")}</th>
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
        <span className="grid size-[2.6em] shrink-0 place-items-center rounded-full bg-[#e0f5f1] text-[#0f7378]">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-[0.75em] text-[#5b6b7c]">{label}</span>
          <span className="block text-[1.35em] font-bold leading-tight text-[#0b1b2b]">{value}</span>
          <span className="block truncate text-[0.7em] text-[#8a97a6]">{hint}</span>
        </span>
        <ArrowRight className="size-[1.1em] shrink-0 text-[#8a97a6] transition-transform group-hover:translate-x-0.5" />
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

const pill =
  "inline-flex items-center gap-[0.5em] rounded-[0.5em] bg-white px-[1em] py-[0.6em] font-medium text-[#0b1b2b] shadow-[0_4px_14px_rgba(20,54,90,0.08)]";

export default function AdminDashboard() {
  const { t } = useI18n();
  const [chartRef, chartBox] = useBox<HTMLDivElement>();
  const [donutRef, donutBox] = useBox<HTMLDivElement>();
  // The saved choice is read on the client only (the server renders 7), so the first render matches.
  const savedDays = useSyncExternalStore(noSubscribe, readSavedPeriod, () => 7 as DashboardPeriod);
  const [chosenDays, setChosenDays] = useState<DashboardPeriod | null>(null);
  const days = chosenDays ?? savedDays;
  const [periodOpen, setPeriodOpen] = useState(false);
  const choosePeriod = (d: DashboardPeriod) => {
    setChosenDays(d);
    setPeriodOpen(false);
    try {
      localStorage.setItem(PERIOD_KEY, String(d));
    } catch {
      // The choice is only a convenience; without storage it resets on the next visit.
    }
  };
  const loadOverview = useCallback(() => getAdminOverview(days), [days]);
  const { data: overview, error, reload } = useAdminData(loadOverview, tk("We couldn't load the dashboard. Please try again."));
  const periodLabel = PERIODS.find((p) => p.days === days)!.label;
  const report = useAdminData(getSystemReport, tk("We couldn't load the dashboard. Please try again."));
  const squads = useAdminData(getAdminSquads, tk("We couldn't load the squads. Please try again."));
  const tracks = useAdminData(getAdminTracks, tk("We couldn't load the tracks. Please try again."));
  const feed = useAdminData(useCallback(() => getPlatformActivity(4), []), tk("We couldn't load the activity. Please try again."));
  const pending = useAdminData(loadPending, tk("We couldn't load the requests. Please try again."));
  const [quickOpen, setQuickOpen] = useState(false);

  const r = report.data;
  const dash = "—";
  const byTrack = (r?.students.byTrack ?? []).filter((x) => x.key !== "None").sort((a, b) => b.count - a.count);
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
  const peakDay = week.length ? week.reduce((b, d) => (d.lessonsPassed + d.tasksDone > b.lessonsPassed + b.tasksDone ? d : b)) : null;
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
      className="min-w-0 flex-1 bg-[#f6f8fc] px-3 pb-8 pt-[calc(var(--u)*5.4)] sm:px-[calc(var(--u)*1.6)] xl:absolute xl:inset-0 xl:overflow-y-auto"
      style={{ fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" }}
    >
      {/* ---------- Header ---------- */}
      <section className="flex flex-wrap items-end justify-between gap-[1em]">
        <div>
          <p className="flex items-center gap-[0.6em] text-[0.7em] font-semibold uppercase tracking-[0.12em] text-[#5b6b7c]">
            <span className="size-[0.75em] rounded-full bg-[#1cb5e0]" />
            {t("Telemetry & cohort pulse")}
          </p>
          <h1 className="mt-[0.2em] text-[2.1em] font-bold leading-tight tracking-tight text-[#0b1b2b]">{t("Dashboard Overview")}</h1>
          <p className="text-[0.85em] text-[#5b6b7c]">{t("Monitor learning activity and manage your community.")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-[0.7em] text-[0.82em]">
          {/* The period the activity chart and the active-students comparison cover. */}
          <div className="relative">
            <button type="button" aria-haspopup="listbox" aria-expanded={periodOpen} onClick={() => setPeriodOpen((o) => !o)} className={`${pill} hover:bg-[#f1f6fb]`}>
              <CalendarDays className="size-[1.1em]" /> {t(periodLabel)} <ChevronDown className="size-[1em] text-[#8a97a6]" />
            </button>
            {periodOpen && (
              <>
                <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-20 cursor-default" onClick={() => setPeriodOpen(false)} />
                <ul role="listbox" aria-label={t("Period")} className="absolute end-0 top-full z-30 mt-[0.4em] w-[12em] overflow-hidden rounded-[0.8em] bg-white py-[0.3em] shadow-xl ring-1 ring-[#e6edf3]">
                  {PERIODS.map((p) => (
                    <li key={p.days} role="option" aria-selected={p.days === days}>
                      <button
                        type="button"
                        onClick={() => choosePeriod(p.days)}
                        className={`flex w-full items-center justify-between px-[1em] py-[0.55em] text-start hover:bg-[#f1f6fb] ${p.days === days ? "font-semibold text-[#0b89a6]" : "text-[#14365a]"}`}
                      >
                        {t(p.label)}
                        {p.days === days && <Check className="size-[1em]" />}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
          <Link href={"/admin/reports" as Route} className={`${pill} hover:bg-[#f1f6fb]`}>
            <Share className="size-[1.05em]" /> {t("Export Report")}
          </Link>
          <div className="relative">
            <button
              type="button"
              aria-expanded={quickOpen}
              onClick={() => setQuickOpen((o) => !o)}
              className="inline-flex items-center gap-[0.5em] rounded-[0.5em] bg-[#12a5dc] px-[1.1em] py-[0.6em] font-semibold text-white shadow-[0_6px_16px_rgba(18,165,220,0.35)] hover:bg-[#0f93c5]"
            >
              <Plus className="size-[1.1em]" /> {t("Quick Action")} <ChevronDown className="size-[1em]" />
            </button>
            {quickOpen && (
              <>
                <button type="button" aria-label={t("Close menu")} className="fixed inset-0 z-20 cursor-default" onClick={() => setQuickOpen(false)} />
                <ul className="absolute end-0 top-full z-30 mt-[0.4em] w-[15em] overflow-hidden rounded-[0.8em] bg-white py-[0.3em] shadow-xl ring-1 ring-[#e6edf3]">
                  {QUICK_ACTIONS.map((q) => (
                    <li key={q.href + q.label}>
                      <Link href={q.href as Route} className="block px-[1em] py-[0.55em] text-[#14365a] hover:bg-[#f1f6fb]">
                        {t(q.label)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </section>

      {error && <LoadState error={error} onRetry={reload} className="mt-[1em]" />}

      {/* ---------- Stats ---------- */}
      <ul className="mt-[1.6em] grid grid-cols-1 gap-[1.2em] min-[480px]:grid-cols-2 xl:grid-cols-4">
        <StatTile
          tone="blue"
          label={t("Total Students")}
          value={overview ? overview.totalStudents.toLocaleString("en") : dash}
          delta={
            change == null ? (
              t("{count} active", { count: overview?.activeStudents ?? 0 })
            ) : (
              <>
                {change < 0 ? <TrendingDown className="size-[1.1em]" /> : <TrendingUp className="size-[1.1em]" />}
                {`${change > 0 ? "+" : ""}${Math.round(change)}%`}
              </>
            )
          }
          hint={change == null ? t("in the last {days} days", { days }) : t("active vs the {days} days before", { days })}
          icon={<UsersRound className="size-[1.15em]" />}
        />
        <StatTile
          tone="blue"
          label={t("Active Squads")}
          value={squads.data ? String(activeSquads) : dash}
          delta={t("{count} total", { count: squadList.length })}
          hint={t("{count} without a monitor", { count: overview?.squadsWithoutMonitor ?? 0 })}
          icon={<UsersRound className="size-[1.15em]" />}
        />
        <StatTile
          tone="teal"
          label={t("Active Mentors")}
          value={r ? String(r.mentorship.activeMentors) : dash}
          delta={r ? <><Star className="size-[1em]" /> {r.mentorship.averageRating.toFixed(1)}</> : dash}
          hint={t("{count} students without a mentor", { count: r?.mentorship.studentsWithoutMentor ?? 0 })}
          icon={<CircleCheck className="size-[1.15em]" />}
        />
        <StatTile
          tone="red"
          label={t("Pending Requests")}
          value={pendingCount == null ? dash : String(pendingCount)}
          delta={t("{count} reviews", { count: overview?.pendingReviews ?? 0 })}
          hint={t("need review")}
          icon={<Hourglass className="size-[1.15em]" />}
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
        <AreaCard href="/admin/reports" icon={<BarChart3 className="size-[1.2em]" />} label={t("System Report")} value={r ? r.users.total : dash}
          hint={t("accounts · full report and export")} />
      </ul>

      {/* ---------- Two columns like the design: main (left) + side (right) ---------- */}
      <div className="mt-[1.6em] grid gap-[1.4em] xl:grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-[1.6em]">
          {/* Platform Learning Activity */}
          <article className={`${card} flex min-h-[26em] min-w-0 flex-col p-[1.5em]`}>
            <div className="flex flex-wrap items-start justify-between gap-[1em]">
              <div className="min-w-0">
                <h2 className="flex flex-wrap items-center gap-[0.6em] text-[1.1em] font-semibold text-[#0b1b2b]">
                  {t("Platform Learning Activity")}
                  <span className="rounded-[0.4em] bg-[#dff3fb] px-[0.6em] py-[0.15em] text-[0.62em] font-medium text-[#0b6f86]">{t("Live Telemetry")}</span>
                </h2>
                <p className="mt-[0.2em] max-w-[26em] text-[0.78em] text-[#6b7686]">
                  {t("Daily lessons passed vs squad tasks done over the last {days} days", { days })}
                </p>
              </div>
              <ul className="flex shrink-0 flex-wrap gap-x-[1.6em] gap-y-[0.3em] text-[0.72em] text-[#14365a]">
                <li className="flex items-center gap-[0.5em]"><span className="size-[0.8em] rounded-full" style={{ backgroundColor: LESSONS_COLOR }} /> {t("Lessons passed")}</li>
                <li className="flex items-center gap-[0.5em]"><span className="size-[0.8em] rounded-full" style={{ backgroundColor: TASKS_COLOR }} /> {t("Squad tasks done")}</li>
              </ul>
            </div>
            <dl className="mt-[1em] grid shrink-0 grid-cols-1 gap-[0.6em] rounded-[0.6em] bg-[#eef4fc] px-[1em] py-[0.7em] sm:grid-cols-3">
              <div>
                <dt className="text-[0.72em] text-[#5b6b7c]">{t("Peak Day")}</dt>
                <dd className="flex items-baseline gap-[0.4em] text-[1.05em] font-semibold text-[#0b1b2b]">
                  {peakDay ? peakDay.lessonsPassed + peakDay.tasksDone : dash}
                  {peakDay && (
                    <span className="inline-flex items-center text-[0.65em] font-semibold text-[#0f8a7a]">
                      <ArrowUp className="size-[1em]" /> {dayLabel(peakDay.date, week.length)}
                    </span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-[0.72em] text-[#5b6b7c]">{t("Lessons passed")}</dt>
                <dd className="text-[1.05em] font-semibold text-[#0b1b2b]">{overview ? lessonsWeek : dash}</dd>
              </div>
              <div>
                <dt className="text-[0.72em] text-[#5b6b7c]">{t("Active Rate")}</dt>
                <dd className="text-[1.05em] font-semibold text-[#0b1b2b]">
                  {overview && overview.totalStudents ? `${Math.round((overview.activeStudents / overview.totalStudents) * 100)}%` : dash}
                </dd>
              </div>
            </dl>
            <p className="sr-only">{t("{count} squad tasks done", { count: tasksWeek })}</p>
            <div ref={chartRef} className="relative mt-[0.6em] min-h-[14em] flex-1">
              {overview ? (
                <ActivityChart
                  w={chartBox.w}
                  h={chartBox.h}
                  days={overview.activity}
                  label={t("Platform Learning Activity")}
                  peakLabel={(d) => t("{lessons} lessons • {tasks} tasks", { lessons: d.lessonsPassed, tasks: d.tasksDone })}
                />
              ) : (
                !error && <LoadState error={null} onRetry={reload} />
              )}
            </div>
          </article>

          {/* Squad Sprint Status */}
          <section className="min-w-0">
            <SectionTitle
              title={t("Squad Sprint Status")}
              sub={t("Real-time velocity and sprint deliverables across active cohorts")}
              aside={
                <Link href={"/admin/squads" as Route} className="mt-[0.3em] inline-flex shrink-0 items-center gap-[0.2em] text-[0.75em] font-semibold text-[#0b6f86] hover:underline">
                  {t("View All {count} Squads", { count: squadList.length })}
                  <ChevronRight className="size-[1.1em]" />
                </Link>
              }
            />
            {!squads.data ? (
              <LoadState error={squads.error} onRetry={squads.reload} />
            ) : (
              <div className="mt-[1em] grid gap-[1em] sm:grid-cols-2">
                {topSquads.map((s, i) => (
                  <SquadTile key={s.id} s={s} color={SQUAD_COLORS[i % SQUAD_COLORS.length]} />
                ))}
              </div>
            )}
          </section>

          {/* Pending requests */}
          <PendingRequests pending={pending} onDone={dropPending} />
        </div>

        <div className="grid min-w-0 content-start gap-[1.6em] md:grid-cols-2 xl:grid-cols-1">
          {/* Students by Track */}
          <article className={`${card} flex min-h-[26em] min-w-0 flex-col p-[1.5em] md:col-span-2 xl:col-span-1`}>
            <SectionTitle
              title={t("Students by Track")}
              sub={t("Current enrollment distribution")}
              aside={
                <button type="button" onClick={report.reload} aria-label={t("Refresh")} className="grid size-[2em] shrink-0 place-items-center rounded-full text-[#5b6b7c] hover:bg-[#eef3fa]">
                  <RefreshCw className="size-[1.1em]" />
                </button>
              }
            />
            <div ref={donutRef} className="relative mt-[0.8em] min-h-[12em] flex-1">
              <Donut
                size={Math.min(donutBox.w, donutBox.h, 220)}
                segments={byTrack.map((x, i) => ({ value: x.count, color: TRACK_COLORS[i % TRACK_COLORS.length] }))}
                center={
                  <span>
                    <span className="block text-[1.5em] font-bold leading-none text-[#0b1b2b]">{trackTotal.toLocaleString("en")}</span>
                    <span className="mt-[0.3em] block text-[0.62em] font-medium uppercase tracking-[0.08em] text-[#5b6b7c]">{t("Enrolled")}</span>
                  </span>
                }
              />
              {!r && <LoadState error={report.error} onRetry={report.reload} />}
            </div>
            <ul className="mt-[1em] space-y-[0.75em] text-[0.78em] text-[#0b1b2b]">
              {byTrack.map((x, i) => (
                <li key={x.key} className="flex items-center gap-[0.7em]">
                  <span className="size-[0.8em] shrink-0 rounded-full" style={{ backgroundColor: TRACK_COLORS[i % TRACK_COLORS.length] }} />
                  <span className="min-w-0 flex-1 truncate">{t(x.key)}</span>
                  <span className="text-[0.92em] text-[#6b7686]">{t("{count} std", { count: x.count })}</span>
                  <span className="w-[3em] text-end font-semibold">{trackTotal ? Math.round((x.count / trackTotal) * 100) : 0}%</span>
                </li>
              ))}
            </ul>
          </article>

          {/* Course Milestones */}
          <article className={`${card} p-[1.5em]`}>
            <SectionTitle
              title={t("Course Milestones")}
              sub={t("Cohort completion velocity")}
              aside={<Trophy className="size-[1.2em] shrink-0 text-[#5b6b7c]" />}
            />
            {!tracks.data ? (
              <LoadState error={tracks.error} onRetry={tracks.reload} />
            ) : (
              <ul className="mt-[1.1em] space-y-[1.3em]">
                {topTracks.map((m) => (
                  <li key={m.id}>
                    <Link href={`/admin/tracks/${m.id}` as Route} className="group flex items-center gap-[1em]">
                      <Ring value={m.progress} />
                      <span className="min-w-0 text-[0.85em]">
                        <span className="block font-semibold text-[#0b1b2b] group-hover:underline">{t(m.name)}</span>
                        <span className="block text-[0.88em] text-[#6b7686]">
                          {t("{students} students · {squads} squads", { students: m.students, squads: m.squads })}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </article>

          {/* Recent Platform Activity */}
          <article className={`${card} p-[1.5em]`}>
            <SectionTitle
              title={t("Recent Platform Activity")}
              aside={
                <span className="mt-[0.3em] inline-flex shrink-0 items-center gap-[0.5em] text-[0.72em] text-[#6b7686]">
                  <span className="size-[0.6em] rounded-full bg-[#14b8a6]" /> {t("Real-time")}
                </span>
              }
            />
            {!feed.data ? (
              <LoadState error={feed.error} onRetry={feed.reload} />
            ) : feed.data.length === 0 ? (
              <p className="py-[1em] text-center text-[0.8em] text-[#8a97a6]">{t("Nothing yet.")}</p>
            ) : (
              <ul className="mt-[1em]">
                {feed.data.map((f, i, all) => (
                  <FeedItem key={`${f.studentId}-${f.createdUtc}-${i}`} f={f} last={i === all.length - 1} />
                ))}
              </ul>
            )}
            <Link
              href={"/admin/security" as Route}
              className="mt-[0.4em] block rounded-[0.5em] bg-[#eef3fb] py-[0.7em] text-center text-[0.78em] font-medium text-[#5b6b7c] hover:bg-[#e2eaf7]"
            >
              {t("View Complete System Log")}
            </Link>
          </article>
        </div>
      </div>
    </div>
  );
}
