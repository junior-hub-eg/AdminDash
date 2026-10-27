/**
 * Analytics & Reports: weekly trends, the Excel export and the emailed report schedule.
 *   GET  /api/v1/admin/reports/trends?from&to&trackCode
 *   GET  /api/v1/admin/reports/export?from&to&trackCode&lang  → .xlsx
 *   GET/PUT /api/v1/me/report-schedule, POST /api/v1/me/report-schedule/send-now
 */
import { api, API_BASE_URL, ApiError, refreshAccessToken } from "@/lib/api-client";
import { getToken, setToken } from "@/lib/auth/token";

export const TREND_KEYS = [
  "activeStudents",
  "newStudents",
  "lessonsPassed",
  "tasksDone",
  "submissions",
  "sessionsCompleted",
  "xpAwarded",
] as const;

export type TrendKey = (typeof TREND_KEYS)[number];
export type TrendValues = Record<TrendKey, number>;

export interface ReportTrends {
  from: string;
  to: string;
  bucket: "Week";
  /** One bucket per week, oldest first; `start` is the week's first day. */
  series: { start: string; values: TrendValues }[];
  /** Totals of the selected range. */
  current: TrendValues;
  /** Totals of the same length of time just before it. */
  previous: TrendValues;
}

export type ReportQuery = { from: string; to: string; trackCode?: string | null };

function query(q: ReportQuery & { lang?: "en" | "ar" }) {
  const p = new URLSearchParams({ from: q.from, to: q.to });
  if (q.trackCode) p.set("trackCode", q.trackCode);
  if (q.lang) p.set("lang", q.lang);
  return p.toString();
}

export const getReportTrends = (q: ReportQuery) => api.get<ReportTrends>(`/api/v1/admin/reports/trends?${query(q)}`);

/** The file name from Content-Disposition (filename* first), or null. */
function fileNameOf(header: string | null) {
  if (!header) return null;
  const star = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/.exec(header);
  if (star) {
    try {
      return decodeURIComponent(star[1].trim().replace(/^"|"$/g, ""));
    } catch {
      // fall through to the plain name
    }
  }
  const plain = /filename\s*=\s*"?([^";]+)"?/.exec(header);
  return plain ? plain[1].trim() : null;
}

/** Downloads the report as an Excel file in the chosen language. Throws ApiError like api.get. */
export function downloadReportExport(q: ReportQuery & { lang: "en" | "ar" }) {
  return downloadAdminFile(
    `/api/v1/admin/reports/export?${query(q)}`,
    `junior-hub-report-${q.from}-to-${q.to}${q.trackCode ? `-${q.trackCode.toLowerCase()}` : ""}-${q.lang}.xlsx`,
  );
}

/** Saves a file an admin endpoint sends (with the access token), named as the server says or `fallbackName`. Throws ApiError like api.get. */
export async function downloadAdminFile(path: string, fallbackName: string) {
  if (!API_BASE_URL) throw new ApiError(`No API base URL configured for "${path}".`, 0);

  const send = async () => {
    const token = getToken();
    try {
      return await fetch(`${API_BASE_URL}${path}`, {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      throw new ApiError(`Request to ${path} could not be sent`, 0);
    }
  };

  const hadToken = getToken() !== null;
  let res = await send();
  if (res.status === 401 && hadToken) {
    if (await refreshAccessToken()) res = await send();
    else setToken(null);
  }
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      // no JSON body
    }
    throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status, body);
  }

  const blob = await res.blob();
  const name = fileNameOf(res.headers.get("Content-Disposition")) ?? fallbackName;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export interface ReportSchedule {
  enabled: boolean;
  frequency: "Weekly" | "Monthly";
  /** 0 = Sunday ... 6 = Saturday. */
  dayOfWeek: number;
  /** 1-28. */
  dayOfMonth: number;
  language: "en" | "ar";
  email: string | null;
  lastSentUtc: string | null;
  nextSendUtc: string | null;
}

export type ReportScheduleUpdate = Pick<ReportSchedule, "enabled" | "frequency" | "dayOfWeek" | "dayOfMonth" | "language">;

export const getReportSchedule = () => api.get<ReportSchedule>("/api/v1/me/report-schedule");
export const saveReportSchedule = (body: ReportScheduleUpdate) => api.put<ReportSchedule>("/api/v1/me/report-schedule", body);
export const sendReportNow = () => api.post<void>("/api/v1/me/report-schedule/send-now");
