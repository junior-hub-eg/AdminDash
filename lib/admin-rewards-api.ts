/**
 * Rewards & gamification for the admin (AdminRewardsController, 26 Oct 2026): overview, leaderboards, the XP ledger,
 * badges and the XP rulebook.
 */
import { API_BASE_URL, ApiError, api, refreshAccessToken } from "@/lib/api-client";
import { getToken } from "@/lib/auth/token";

export type XpReason =
  | "VideoWatched"
  | "TrackQuizPassed"
  | "LessonPassed"
  | "TaskDone"
  | "SimulationCompleted"
  | "ProjectCompleted"
  | "LevelExamPassed"
  | "VideoLinkChecked"
  | "GrammarSentenceRight"
  | "GrammarQuickCheck"
  | "BadgeBonus";

export type BadgeRarity = "Common" | "Rare" | "Epic" | "Legendary";
export type BadgeType = "SubjectLink" | "Track" | "Recruitment";

export interface RewardsOverview {
  xpAwarded: number;
  xpAwardedLast7Days: number;
  badgesEarned: number;
  activeBadges: number;
  totalBadges: number;
  studentsWithXp: number;
  averageXp: number;
}

export interface StudentLeader {
  rank: number;
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  totalXp: number;
  badges: number;
  schoolName: string | null;
  tracks: string[];
}

export interface SquadLeader {
  rank: number;
  squadId: string;
  name: string;
  projectTitle: string;
  members: number;
  totalXp: number;
}

export interface XpLedgerEntry {
  id: string;
  studentId: string;
  studentName: string;
  reason: XpReason;
  points: number;
  sourceId: string;
  createdUtc: string;
}

export interface XpLedgerPage {
  items: XpLedgerEntry[];
  page: number;
  pageSize: number;
  total: number;
}

export interface AdminBadge {
  id: string;
  code: string;
  name: string;
  description: string | null;
  type: BadgeType;
  rarity: BadgeRarity;
  iconKey: string;
  xpBonus: number;
  isActive: boolean;
  createdUtc: string;
  holders: number;
}

export interface SaveBadge {
  name: string;
  description?: string | null;
  type?: BadgeType;
  rarity?: BadgeRarity;
  iconKey?: string;
  xpBonus?: number;
  isActive?: boolean;
}

export interface XpRule {
  reason: XpReason;
  points: number;
  dailyLimit: number | null;
  isActive: boolean;
  defaultPoints: number;
  updatedUtc: string | null;
}

export interface LedgerFilter {
  page?: number;
  pageSize?: number;
  studentId?: string;
  reason?: XpReason;
}

const query = (params: Record<string, string | number | undefined>) => {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
};

const BASE = "/api/v1/admin";

export const getRewardsOverview = () => api.get<RewardsOverview>(`${BASE}/rewards/overview`);

export const getStudentLeaders = (top = 10, trackCode?: string) =>
  api.get<StudentLeader[]>(`${BASE}/rewards/leaderboard/students${query({ top, trackCode })}`);

export const getSquadLeaders = (top = 10) => api.get<SquadLeader[]>(`${BASE}/rewards/leaderboard/squads${query({ top })}`);

export const getXpLedger = (filter: LedgerFilter = {}) =>
  api.get<XpLedgerPage>(`${BASE}/rewards/ledger${query({ page: filter.page, pageSize: filter.pageSize, studentId: filter.studentId, reason: filter.reason })}`);

export const getAdminBadges = () => api.get<AdminBadge[]>(`${BASE}/badges`);

/** 409 BADGE_CODE_TAKEN, 400 VALIDATION_FAILED. */
export const createBadge = (body: SaveBadge) => api.post<AdminBadge>(`${BASE}/badges`, body);

/** isActive false deactivates the badge: students keep it, nobody earns it any more. */
export const updateBadge = (id: string, body: SaveBadge) => api.put<AdminBadge>(`${BASE}/badges/${id}`, body);

/** Gives the badge and its XP bonus once; again answers awarded: false. 409 BADGE_INACTIVE. */
export const awardBadge = (id: string, studentId: string) =>
  api.post<{ awarded: boolean; xpAwarded: number; totalXp: number }>(`${BASE}/badges/${id}/award`, { studentId });

export const getXpRules = () => api.get<XpRule[]>(`${BASE}/xp-rules`);

export const updateXpRule = (reason: XpReason, body: { points: number; dailyLimit: number | null; isActive: boolean }) =>
  api.put<XpRule>(`${BASE}/xp-rules/${reason}`, body);

/** GET admin/rewards/ledger/export, saved as a CSV file. */
export async function downloadXpLedgerCsv(filter: Pick<LedgerFilter, "studentId" | "reason"> = {}) {
  const path = `${BASE}/rewards/ledger/export${query({ studentId: filter.studentId, reason: filter.reason })}`;
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
  a.download = `xp-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
