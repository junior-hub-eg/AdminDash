/**
 * Real auth — the .NET backend's /api/v1/auth and /api/v1/me (JH-SRS §5.2).
 * Backend roles: Student → "learner", Mentor → "mentor", Admin → "admin", Teacher → "teacher" (23 Oct 2026). The admin signs in on its own
 * page (/admin/login → POST /api/v1/auth/admin/login); the main login refuses the admin (separate systems, 26 Oct 2026).
 */
import { api, refreshAccessToken } from "@/lib/api-client";
import { decodeToken, getToken, setToken, TOKEN_CHANGE_EVENT } from "@/lib/auth/token";
import type { User } from "@/lib/types";
import type { Gender } from "@/lib/avatars";

const CURRENT_USER_KEY = "jh_api_user";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribe(listener: Listener) {
  listeners.add(listener);
  window.addEventListener(TOKEN_CHANGE_EVENT, listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener(TOKEN_CHANGE_EVENT, listener);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

/** POST /api/v1/auth/login (JH-SRS §5.3). */
interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  /** Student, Mentor or Admin. */
  role?: string;
  student: { id: string; firstName: string; grade: number | null; className: string | null } | null;
  mentor?: { id: string; firstName: string; fullName: string; title: string; trackCode: string } | null;
  admin?: { id: string; firstName: string; fullName: string; isOwner: boolean } | null;
  teacher?: { id: string; firstName: string; fullName: string; schoolName: string } | null;
}

/** GET /api/v1/teacher/me for a teacher's account (23 Oct 2026). */
interface TeacherMeResponse {
  id: string;
  fullName: string;
  email: string;
}

function teacherUser(t: { id: string; fullName: string }, email: string): User {
  const [firstName, ...rest] = t.fullName.split(/\s+/);
  return { id: t.id, role: "teacher", firstName, lastName: rest.join(" ") || undefined, email, createdAt: new Date().toISOString() };
}

/** GET /api/v1/monitor/me for a mentor's account. */
interface MentorMeResponse {
  mentor: { id: string; fullName: string; title: string; trackCode: string; photoUrl: string };
}

const sessionRole = () => decodeToken(getToken() ?? "")?.role;
const isMentorSession = () => sessionRole() === "Mentor";

function adminUser(a: { id: string; fullName: string; isOwner?: boolean }, email: string): User {
  const [firstName, ...rest] = a.fullName.split(/\s+/);
  return {
    id: a.id,
    role: "admin",
    firstName,
    lastName: rest.join(" ") || undefined,
    email,
    isOwner: a.isOwner ?? false,
    createdAt: new Date().toISOString(),
  };
}

function mentorUser(m: { id: string; fullName: string }, email: string): User {
  const [firstName, ...rest] = m.fullName.split(/\s+/);
  return { id: m.id, role: "mentor", firstName, lastName: rest.join(" ") || undefined, email, createdAt: new Date().toISOString() };
}

/** GET /api/v1/me. School, grade and class are empty for a student who registered alone. */
interface MeResponse {
  id: string;
  fullName: string;
  firstName: string;
  email: string;
  school: { id: string; name: string } | null;
  grade: number | null;
  className: string | null;
  photoUrl: string | null;
  totalXp: number;
  streakDays: number;
  gender: Gender | null;
}

function toUser(me: MeResponse): User {
  const lastName = me.fullName.split(/\s+/).slice(1).join(" ");
  return {
    id: me.id,
    role: "learner",
    firstName: me.firstName,
    lastName: lastName || undefined,
    email: me.email,
    photoUrl: me.photoUrl,
    gender: me.gender,
    createdAt: new Date().toISOString(),
  };
}

function storeUser(user: User) {
  window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  emitChange();
}

async function loadProfile(): Promise<User> {
  if (sessionRole() === "Teacher") {
    const me = await api.get<TeacherMeResponse>("/api/v1/teacher/me");
    const user = teacherUser(me, me.email);
    storeUser(user);
    return user;
  }
  if (sessionRole() === "Admin") {
    // The admin has no profile endpoint: keep what the login stored, or rebuild it from the token.
    const cached = getCurrentUserSnapshot();
    if (cached?.role === "admin") return cached;
    const user = adminUser({ id: decodeToken(getToken() ?? "")?.sub ?? "", fullName: "Admin" }, "");
    storeUser(user);
    return user;
  }
  if (isMentorSession()) {
    const cached = getCurrentUserSnapshot();
    const me = await api.get<MentorMeResponse>("/api/v1/monitor/me");
    const user = mentorUser(me.mentor, cached?.email ?? "");
    storeUser(user);
    return user;
  }
  const user = toUser(await api.get<MeResponse>("/api/v1/me"));
  storeUser(user);
  return user;
}

/** Reloads the profile (for example the avatar) for a session that is already signed in. */
export async function refreshProfile(): Promise<User | null> {
  if (typeof window === "undefined" || !getToken()) return null;
  try {
    return await loadProfile();
  } catch {
    return null;
  }
}

/** Saves one of the catalogue avatars (lib/avatars.ts) and updates the cached profile. */
export async function changeAvatar(avatarKey: string): Promise<User> {
  const user = toUser(await api.put<MeResponse>("/api/v1/me/avatar", { avatar: avatarKey }));
  storeUser(user);
  return user;
}

/** Boy or girl, once, for a student who was not asked at sign-up (PUT /api/v1/me/gender). Updates the cached profile. */
export async function setGender(gender: Gender): Promise<User> {
  const user = toUser(await api.put<MeResponse>("/api/v1/me/gender", { gender }));
  storeUser(user);
  return user;
}

/** Signs in, stores the JWT, and caches the profile for useAuth(). With rememberMe the backend also sets the refresh cookie. */
export async function login(email: string, password: string, rememberMe = false): Promise<User> {
  const res = await api.post<LoginResponse>("/api/v1/auth/login", { email, password, rememberMe });
  return startSession(res, email);
}

/** The admin login page: only the admin account can sign in (others get NOT_AN_ADMIN). */
export async function adminLogin(email: string, password: string, rememberMe = false): Promise<User> {
  const res = await api.post<LoginResponse>("/api/v1/auth/admin/login", { email, password, rememberMe });
  return startSession(res, email);
}

async function startSession(res: LoginResponse, email: string): Promise<User> {
  setToken(res.accessToken);
  if (res.role === "Admin" && res.admin) {
    const user = adminUser(res.admin, email.trim().toLowerCase());
    storeUser(user);
    return user;
  }
  if (res.role === "Teacher" && res.teacher) {
    const user = teacherUser(res.teacher, email.trim().toLowerCase());
    storeUser(user);
    return user;
  }
  if (res.role === "Mentor" && res.mentor) {
    const user = mentorUser(res.mentor, email.trim().toLowerCase());
    storeUser(user);
    return user;
  }
  try {
    return await loadProfile();
  } catch {
    // /me failed — fall back to what the login response carried.
    const user: User = {
      id: res.student!.id,
      role: "learner",
      firstName: res.student!.firstName,
      email: email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    emitChange();
    return user;
  }
}

/**
 * On page load without an access token: a "Remember me" refresh cookie may still sign the student in.
 * Returns the user, or null when there is no session to restore.
 */
export async function restoreSession(): Promise<User | null> {
  if (typeof window === "undefined" || getToken()) return null;
  if (!(await refreshAccessToken())) return null;
  try {
    return await loadProfile();
  } catch {
    return null;
  }
}

/** Revokes the refresh cookie on the server (best effort) and clears the local session. */
export function logout() {
  void api.post("/api/v1/auth/logout").catch(() => {});
  setToken(null);
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(CURRENT_USER_KEY);
  }
  emitChange();
}

let cachedRaw: string | null = null;
let cachedUser: User | null = null;

/** Stable-reference snapshot getter for useSyncExternalStore. */
export function getCurrentUserSnapshot(): User | null {
  if (typeof window === "undefined") return null;
  // No token (never logged in, logged out, or expired) means no session, even if a
  // stale cached profile is still sitting in localStorage.
  if (!getToken()) return null;
  const raw = window.localStorage.getItem(CURRENT_USER_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedUser = raw ? (JSON.parse(raw) as User) : null;
  }
  return cachedUser;
}

export function getServerUserSnapshot(): User | null {
  return null;
}
