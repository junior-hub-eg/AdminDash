/**
 * Security & audit log of the admin (AdminSecurityController, 26 Oct 2026): the audit trail, sign-in history,
 * admin sessions that stay signed in, and the admin's own password.
 */
import { API_BASE_URL, ApiError, api, refreshAccessToken } from "@/lib/api-client";
import { getToken } from "@/lib/auth/token";

export type AuditSeverity = "Info" | "Warning" | "Critical";

/** Modules the backend names audit entries with (from the admin URL). */
export const AUDIT_MODULES = [
  "Students",
  "Squads",
  "Mentors",
  "Tracks",
  "Roles",
  "Admins",
  "Announcements",
  "Settings",
  "Approvals",
  "Certificates",
  "Rewards",
  "Security",
  "Auth",
] as const;

export interface AdminSecurityOverview {
  activeSessions: number;
  failedLogins24h: number;
  criticalEvents7d: number;
  admins: number;
  adminsSignedInThisWeek: number;
  /** Failed sign-ins that lock an account, and for how long. */
  lockoutMaxAttempts: number;
  lockoutMinutes: number;
  passwordMinLength: number;
  /** How long "Remember me" keeps a session. */
  sessionDays: number;
  passwordChangedUtc: string | null;
}

export interface AuditEntry {
  id: string;
  actorId: string | null;
  actorName: string;
  actorRole: string | null;
  /** "POST /api/v1/admin/squads" */
  action: string;
  module: string;
  summary: string;
  targetId: string | null;
  statusCode: number;
  ip: string | null;
  userAgent: string | null;
  severity: AuditSeverity;
  createdUtc: string;
}

export interface LoginAttempt {
  id: string;
  email: string;
  userId: string | null;
  role: string | null;
  succeeded: boolean;
  failureReason: string | null;
  adminLogin: boolean;
  ip: string | null;
  userAgent: string | null;
  createdUtc: string;
}

export interface AdminSession {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  ip: string | null;
  userAgent: string | null;
  createdUtc: string;
  expiresUtc: string;
  /** This browser's session. */
  isCurrent: boolean;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditFilter {
  module?: string;
  severity?: AuditSeverity;
  actor?: string;
  fromUtc?: string;
  toUtc?: string;
  page?: number;
  pageSize?: number;
}

function query(params: Record<string, string | number | boolean | undefined | null>) {
  const q = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) if (value !== undefined && value !== null && value !== "") q.set(key, String(value));
  const s = q.toString();
  return s ? `?${s}` : "";
}

export const getSecurityOverview = () => api.get<AdminSecurityOverview>("/api/v1/admin/security/overview");

/** GET admin/audit: newest first, with the total for paging. */
export const getAuditLog = (filter: AuditFilter = {}) => api.get<Paged<AuditEntry>>(`/api/v1/admin/audit${query({ ...filter })}`);

/** GET admin/security/logins: both login pages; succeeded=false for the failed ones. */
export const getLoginAttempts = (succeeded?: boolean, page = 1, pageSize = 20) =>
  api.get<Paged<LoginAttempt>>(`/api/v1/admin/security/logins${query({ succeeded, page, pageSize })}`);

export const getAdminSessions = () => api.get<AdminSession[]>("/api/v1/admin/security/sessions");

export const revokeAdminSession = (id: string) => api.delete<void>(`/api/v1/admin/security/sessions/${id}`);

/** PUT admin/me/password: 400 CURRENT_PASSWORD_WRONG, SAME_PASSWORD or VALIDATION_FAILED. */
export const changeAdminPassword = (currentPassword: string, newPassword: string) =>
  api.put<void>("/api/v1/admin/me/password", { currentPassword, newPassword, confirmPassword: newPassword });

/** GET admin/audit/export with the list's filters, saved as a CSV file. */
export async function downloadAuditCsv(filter: AuditFilter = {}) {
  const path = `/api/v1/admin/audit/export${query({ ...filter, page: undefined, pageSize: undefined })}`;
  const send = () => {
    const token = getToken();
    return fetch(`${API_BASE_URL}${path}`, {
      credentials: "include",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  };
  let res: Response;
  try {
    res = await send();
    if (res.status === 401 && (await refreshAccessToken())) res = await send();
  } catch {
    throw new ApiError(`Request to ${path} could not be sent`, 0);
  }
  if (!res.ok) throw new ApiError(`Request to ${path} failed with ${res.status}`, res.status);

  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
