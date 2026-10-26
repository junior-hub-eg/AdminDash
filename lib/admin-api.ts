/** The admin pages (backend AdminController, 23 Oct 2026). Only the admin account can call these. */
import { api } from "@/lib/api-client";

export type TrackLevel = "Beginner" | "Intermediate" | "Advanced";

export interface AdminOverview {
  totalStudents: number;
  /** Students with activity in the last 7 days. */
  activeStudents: number;
  activeStudentsLastWeek: number;
  /** Change against last week; null when last week had nobody. */
  activeStudentsChangePercent: number | null;
  pendingReviews: number;
  totalSquads: number;
  squadsWithoutMonitor: number;
  averageSquadSize: number;
  /** The last 7 days, oldest first. */
  activity: { date: string; lessonsPassed: number; tasksDone: number }[];
  levels: { beginner: number; intermediate: number; advanced: number };
  /** Monitors and teachers who signed up and wait for approval. */
  pendingApprovals: number;
}

export interface AdminPerson {
  id: string;
  fullName: string;
  photoUrl: string | null;
}

export type AdminStudentStatus = "Active" | "Inactive" | "Pending";

export interface AdminStudent {
  id: string;
  fullName: string;
  photoUrl: string | null;
  gender: "Male" | "Female" | null;
  trackCode: string | null;
  trackName: string | null;
  squadName: string | null;
  status: AdminStudentStatus;
  totalXp: number;
  email: string | null;
  grade: number | null;
  schoolName: string | null;
  /** Level in the active track; null without a track. */
  level: TrackLevel | null;
  joinedUtc: string | null;
  squadId: string | null;
}

export interface AdminStudentDetail {
  id: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  gender: "Male" | "Female" | null;
  schoolName: string | null;
  grade: number | null;
  className: string | null;
  status: AdminStudentStatus;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  lastLoginUtc: string | null;
  squadName: string | null;
  tracks: { trackId: string; trackCode: string; trackName: string; level: TrackLevel; mentor: AdminPerson | null }[];
  squadId: string | null;
  /** The student's last events (lesson passed, task done, squad joined...). */
  recentActivity: { type: string; text: string; createdUtc: string }[] | null;
}

export type AdminSquadStatus = "Waiting" | "Active" | "InReview" | "Completed";

export interface AdminSquad {
  id: string;
  name: string;
  projectTitle: string;
  level: TrackLevel;
  status: AdminSquadStatus;
  monitor: AdminPerson | null;
  /** 0-100 */
  progress: number;
  students: number;
  capacity: number;
  /** The catalog project; null for squads formed before the catalog. */
  projectId?: string | null;
  projectLogoUrl?: string | null;
}

export interface AdminMentor {
  id: string;
  fullName: string;
  title: string;
  photoUrl: string;
  email: string | null;
  trackCode: string;
  trackName: string;
  students: number;
  monitoredSquads: number;
  squadNames: string[];
  rating: number;
  yearsOfExperience: number;
  isActive: boolean;
}

export interface AdminMentorsPage {
  stats: { totalMentors: number; activeMentors: number; upcomingSessions: number; averageRating: number };
  mentors: AdminMentor[];
}

export interface AdminTrack {
  id: string;
  code: string;
  name: string;
  students: number;
  squads: number;
  /** 0-100 */
  progress: number;
}

export interface AdminTracksPage {
  stats: { totalTracks: number; activeSprints: number; averageCompletion: number; topTrack: string | null };
  tracks: AdminTrack[];
}

export interface NewMentor {
  fullName: string;
  email: string;
  password: string;
  title: string;
  trackCode: string;
  photoUrl?: string;
}

/** The dashboard for the last 7, 14, 30 or 90 days: daily activity, and active students against the period before. */
export const getAdminOverview = (days: DashboardPeriod = 7) => api.get<AdminOverview>(`/api/v1/admin/overview?days=${days}`);
export type DashboardPeriod = 7 | 14 | 30 | 90;
export const getAdminStudents = () => api.get<AdminStudent[]>("/api/v1/admin/students");
/** Adds an independent student whose account is active right away (the admin sets the first password). */
export const addStudent = (body: { fullName: string; email: string; password: string; gender: "Male" | "Female"; phone?: string }) =>
  api.post<AdminStudentDetail>("/api/v1/admin/students", body);
export const getAdminStudent = (id: string) => api.get<AdminStudentDetail>(`/api/v1/admin/students/${id}`);
/** Gives the student another mentor in the mentor's track. */
export const changeStudentMentor = (id: string, mentorId: string) =>
  api.put<AdminStudentDetail>(`/api/v1/admin/students/${id}/mentor`, { mentorId });
export const getAdminSquads = () => api.get<AdminSquad[]>("/api/v1/admin/squads");
export const setSquadMonitor = (id: string, mentorId: string) =>
  api.put<AdminSquad>(`/api/v1/admin/squads/${id}/monitor`, { mentorId });
export const getAdminMentors = () => api.get<AdminMentorsPage>("/api/v1/admin/mentors");
export const getAdminMentor = (id: string) => api.get<AdminMentor>(`/api/v1/admin/mentors/${id}`);
export const createMentor = (mentor: NewMentor) => api.post<AdminMentor>("/api/v1/admin/mentors", mentor);
export const setMentorActive = (id: string, isActive: boolean) => api.patch<AdminMentor>(`/api/v1/admin/mentors/${id}`, { isActive });
export const getAdminTracks = () => api.get<AdminTracksPage>("/api/v1/admin/tracks");

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  /** The main admin, who adds the other admins. */
  isOwner: boolean;
  createdUtc: string;
  lastLoginUtc: string | null;
  /** The admin's role in the Roles & Permissions matrix; null = System Admin. */
  customRoleId: string | null;
}

/** Only the main admin can list and add admins (NOT_THE_OWNER otherwise). */
export const getAdmins = () => api.get<AdminAccount[]>("/api/v1/admin/admins");
export const createAdmin = (admin: { fullName: string; email: string; password: string }) =>
  api.post<AdminAccount>("/api/v1/admin/admins", admin);

/** A monitor (Mentor role) or teacher who signed up and waits for approval (23 Oct 2026). */
export interface AdminApproval {
  id: string;
  role: "Mentor" | "Teacher";
  fullName: string;
  email: string;
  phone: string | null;
  createdUtc: string;
  trackCode: string | null;
  trackName: string | null;
  title: string | null;
  yearsOfExperience: number | null;
  schoolId: string | null;
  schoolName: string | null;
  subjects: ("Math" | "Science" | "Physics" | "Language")[];
  grades: number[];
}

export const getApprovals = () => api.get<AdminApproval[]>("/api/v1/admin/approvals");
/** The account becomes active (a monitor is shown to students); the person is emailed. */
export const approveSignup = (id: string) => api.post<void>(`/api/v1/admin/approvals/${id}/approve`);
/** The account cannot sign in; the person is emailed with the reason. */
export const rejectSignup = (id: string, reason: string) => api.post<void>(`/api/v1/admin/approvals/${id}/reject`, { reason });

/** Window event: the waiting sign-ups changed, so the admin sidebar counts them again. */
export const APPROVALS_CHANGED = "jh:approvals-changed";

export type ReportPeriod = "week" | "month" | "year";

/** Reports & Analytics (23 Oct 2026). Percentages are 0-100. */
export interface AdminReport {
  period: "Week" | "Month" | "Year";
  from: string;
  to: string;
  stats: { completionRate: number; activeEngagement: number; averageScore: number; certificatesIssued: number };
  /** 7 equal parts of the period, oldest first. */
  performance: { from: string; to: string; lessonsPassed: number; tasksDone: number }[];
  levels: { beginner: number; intermediate: number; advanced: number };
}

export const getAdminReport = (period: ReportPeriod) => api.get<AdminReport>(`/api/v1/admin/reports?period=${period}`);

/** System Settings; maintenance mode, registration and notifications take effect at once. */
export interface PlatformSettings {
  platformName: string;
  supportEmail: string;
  timeZone: string;
  maintenanceMode: boolean;
  allowStudentRegistration: boolean;
  emailNotifications: boolean;
  updatedUtc?: string;
}

export const getPlatformSettings = () => api.get<PlatformSettings>("/api/v1/admin/settings");
export const savePlatformSettings = (settings: PlatformSettings) => api.put<PlatformSettings>("/api/v1/admin/settings", settings);

/* ---------- Assignments & submissions ---------- */



/* ---------- Roles & permissions ---------- */

/** What a role may do in one admin module; the API checks it on every admin request (26 Oct 2026). */
export interface RolePermission {
  area: string;
  canView: boolean;
  canCreate: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  canExport: boolean;
}

export interface AdminRole {
  id: string;
  name: string;
  /** "Full Access - 3 Users" */
  meta: string;
  isSystemRole: boolean;
  permissions: RolePermission[];
}

export const getAdminRoles = () => api.get<AdminRole[]>("/api/v1/admin/roles");
/** The description is left as it is. */
export const updateAdminRolePermissions = (role: AdminRole, permissions: RolePermission[]) =>
  api.put<AdminRole>(`/api/v1/admin/roles/${role.id}`, { name: role.name, permissions });

/** The System Admin role always has full access; the API refuses changes to it (SYSTEM_ADMIN_LOCKED). */
export const SYSTEM_ADMIN_ROLE = "System Admin";

/** Gives an admin a role of the matrix; null = System Admin (full access). Only the main admin can. */
export const assignAdminRole = (userId: string, customRoleId: string | null) =>
  api.put<void>(`/api/v1/admin/users/${userId}/role`, { role: "Admin", customRoleId });

export interface MyAdminPermissions {
  /** The main admin and System Admins can do everything. */
  fullAccess: boolean;
  roleName: string;
  permissions: RolePermission[];
}

export const getMyAdminPermissions = () => api.get<MyAdminPermissions>("/api/v1/admin/me/permissions");

// ---------- Review notes (backend AdminManagementController, 25 Oct 2026) ----------

export type SquadRole = "Frontend" | "Backend" | "UIUX" | "AI" | "Testing" | "Data" | "Mobile" | "Gaming";
export const SQUAD_ROLES: SquadRole[] = ["Frontend", "Backend", "UIUX", "AI", "Testing", "Data", "Mobile", "Gaming"];

/** The squad seat of a track's students, as the backend sets it (LevelProgress.RoleFor): a Frontend student joins as Frontend. */
export function squadRoleForTrack(trackCode: string): SquadRole {
  const code = trackCode.toUpperCase();
  return SQUAD_ROLES.find((r) => r.toUpperCase() === code && r !== "Gaming") ?? "Gaming";
}

export interface AdminSquadMember {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  role: SquadRole;
  joinedUtc: string;
  submittedUtc: string | null;
  tasksDone: number;
  tasksTotal: number;
  /** Done tasks assigned to the member, 0-100. */
  progress: number;
  storyPointsDone: number;
  totalXp: number;
  lastActiveDate: string | null;
}

export interface AdminSprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "Planned" | "Active" | "Closed";
  tasksDone: number;
  tasksTotal: number;
  progress: number;
}

export interface UseCase {
  id: string;
  title: string;
  actor: string;
  description: string;
  preconditions: string;
  mainFlow: string;
  acceptanceCriteria: string;
  role: SquadRole | null;
  sortOrder: number;
  updatedUtc: string;
}

export type SquadTaskStatus = "ToDo" | "InProgress" | "Review" | "Done";

/** A task of the active sprint (the latest one when none is active). */
export interface AdminSquadTask {
  id: string;
  title: string;
  description: string | null;
  status: SquadTaskStatus;
  storyPoints: number;
  assigneeStudentId: string | null;
  assigneeName: string | null;
  updatedUtc: string;
  completedUtc: string | null;
}

export type UseCaseInput = Omit<UseCase, "id" | "updatedUtc" | "sortOrder"> & { sortOrder?: number };

export interface AdminSquadFull {
  id: string;
  name: string;
  projectTitle: string;
  projectDescription: string;
  level: TrackLevel;
  status: AdminSquadStatus;
  monitor: AdminPerson | null;
  progress: number;
  seats: { role: SquadRole; needed: number; filled: number }[];
  members: AdminSquadMember[];
  sprints: AdminSprint[];
  useCases: UseCase[];
  projectRevealedUtc: string | null;
  completedUtc: string | null;
  tasks: AdminSquadTask[] | null;
}

export interface AvailableSquadStudent {
  id: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  totalXp: number;
  trackCode: string | null;
  trackName: string | null;
}

/** A task on a sprint board, as the squad's monitor sees it. */
export interface SprintBoardTask {
  id: string;
  sprintId: string;
  title: string;
  status: SquadTaskStatus;
  storyPoints: number;
  assigneeId: string | null;
  assigneeName: string | null;
  assigneePhotoUrl: string | null;
  role: string | null;
}

/** The squad as its monitor sees it (GET admin/squads/{id}/monitor-detail); only what the sprint details use. */
export interface AdminSquadMonitorView {
  squad: { id: string; name: string; projectTitle: string; isCurrent: boolean };
  members: { studentId: string; fullName: string; photoUrl: string | null; role: string }[];
  sprints: AdminSprint[];
  board: SprintBoardTask[];
  pendingDateChange: { id: string; currentEndDate: string; proposedEndDate: string; reason: string; status: string; createdUtc: string } | null;
  delays: { id: string; sprintId: string | null; sprintName: string | null; reason: string; note: string | null; createdUtc: string }[];
}

export const getAdminSquadMonitorView = (id: string) => api.get<AdminSquadMonitorView>(`/api/v1/admin/squads/${id}/monitor-detail`);
export const getAdminSquadFull = (id: string) => api.get<AdminSquadFull>(`/api/v1/admin/squads/${id}/full`);
export const updateSquadProject = (id: string, body: { name?: string; projectTitle?: string; projectDescription?: string }) =>
  api.put<AdminSquadFull>(`/api/v1/admin/squads/${id}/project`, body);
export const addUseCase = (squadId: string, body: UseCaseInput) => api.post<UseCase>(`/api/v1/admin/squads/${squadId}/use-cases`, body);
export const updateUseCase = (id: string, body: UseCaseInput) => api.put<UseCase>(`/api/v1/admin/use-cases/${id}`, body);
export const deleteUseCase = (id: string) => api.delete<void>(`/api/v1/admin/use-cases/${id}`);
export const addSquadTask = (
  squadId: string,
  body: { title: string; description?: string; assigneeStudentId?: string | null; storyPoints?: number }
) => api.post<AdminSquadFull>(`/api/v1/admin/squads/${squadId}/tasks`, body);
/** Moves the student to another squad, or out of their squad when squadId is null. */
export const moveStudentSquad = (studentId: string, squadId: string | null, role?: SquadRole) =>
  api.put<{ squad: AdminSquadFull | null }>(`/api/v1/admin/students/${studentId}/move-squad`, { squadId, role: role ?? null });
export const getSquadAvailableStudents = (squadId: string) =>
  api.get<AvailableSquadStudent[]>(`/api/v1/admin/squads/${squadId}/available-students`);
export const addStudentToSquad = (squadId: string, studentId: string, role: SquadRole) =>
  api.post<unknown>(`/api/v1/admin/squads/${squadId}/students`, { studentId, role });
export const removeStudentFromSquad = (squadId: string, studentId: string) =>
  api.delete<unknown>(`/api/v1/admin/squads/${squadId}/students/${studentId}`);
export const createSquad = (body: {
  name: string;
  projectTitle: string;
  projectDescription: string;
  level: TrackLevel;
  seats?: string;
  monitorId?: string | null;
  /** A catalog project: its title, description, level and team replace the fields given. */
  projectId?: string | null;
}) => api.post<AdminSquad>("/api/v1/admin/squads", body);

// ---------- Project catalog (27 Oct 2026) ----------

export type ProjectLinkKind = "Chat" | "Meeting" | "Figma" | "GitHub" | "Drive" | "Docs" | "Other";
export const PROJECT_LINK_KINDS: ProjectLinkKind[] = ["Chat", "Meeting", "Figma", "GitHub", "Drive", "Docs", "Other"];

export interface ProjectLink {
  kind: ProjectLinkKind;
  /** Empty shows the kind. */
  label: string;
  url: string;
}

/** A project of the catalog, apart from the squads; new squads of its level get one at random. */
export interface AdminProject {
  id: string;
  title: string;
  description: string;
  /** A link or a data:image URL; null for none. */
  logoUrl: string | null;
  level: TrackLevel;
  /** The team by role, for example "Frontend:2,Backend:1". */
  seats: string;
  teamSize: number;
  durationWeeks: number;
  /** Every squad that got it; activeSquads are still building it (its level and team are locked then). */
  squads: number;
  activeSquads: number;
  createdUtc: string;
  links: ProjectLink[];
  brief: ProjectBrief;
  /** The links each role of the team submits; roles not set by the admin get their usual links. */
  requiredLinks: RequiredLinks[];
}

/** The PRD the squad reads on its project page; the list fields have one item per line. */
export interface ProjectBrief {
  problem: string;
  goals: string;
  targetUsers: string;
  useCases: string;
  /** User stories, for example "As a student I can post a lost item". */
  requirements: string;
  deliverables: string;
  acceptanceCriteria: string;
}

/** The links a member submits for the project (WorkLinkKind on the backend). */
export type SubmitLinkKind = "Figma" | "GitHub" | "LiveSite" | "Api" | "Demo" | "TestReport" | "Other";
export const SUBMIT_LINK_KINDS: SubmitLinkKind[] = ["Figma", "GitHub", "LiveSite", "Api", "Demo", "TestReport", "Other"];

export interface RequiredLinks {
  role: SquadRole;
  kinds: SubmitLinkKind[];
}

export interface ProjectInput {
  title: string;
  description: string;
  logoUrl: string | null;
  level: TrackLevel;
  seats: string;
  durationWeeks: number;
  links: ProjectLink[];
  brief: ProjectBrief;
  requiredLinks: RequiredLinks[];
}

export const getProjects = () => api.get<AdminProject[]>("/api/v1/admin/projects");
export const createProject = (body: ProjectInput) => api.post<AdminProject>("/api/v1/admin/projects", body);
export const updateProject = (id: string, body: ProjectInput) => api.put<AdminProject>(`/api/v1/admin/projects/${id}`, body);
export const deleteProject = (id: string) => api.delete<unknown>(`/api/v1/admin/projects/${id}`);

/** "Frontend:2,Backend:1" as role counts. */
export function parseSeats(seats: string): Partial<Record<SquadRole, number>> {
  const result: Partial<Record<SquadRole, number>> = {};
  for (const part of seats.split(",")) {
    const [role, count] = part.split(":").map((x) => x.trim());
    if (SQUAD_ROLES.includes(role as SquadRole) && Number(count) > 0) result[role as SquadRole] = Number(count);
  }
  return result;
}

export const formatSeats = (seats: Partial<Record<SquadRole, number>>) =>
  SQUAD_ROLES.filter((r) => (seats[r] ?? 0) > 0).map((r) => `${r}:${seats[r]}`).join(",");

/** Students who learn a track but have no mentor in it, oldest first. */
export interface UnassignedStudent {
  studentId: string;
  fullName: string;
  photoUrl: string | null;
  gender: "Male" | "Female" | null;
  trackId: string;
  trackCode: string;
  trackName: string;
  level: TrackLevel;
  sinceUtc: string;
}

export interface AdminMentorStudent {
  id: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  grade: number | null;
  className: string | null;
  totalXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  assignedUtc: string;
}

export const getStudentsWithoutMentor = () => api.get<UnassignedStudent[]>("/api/v1/admin/students/without-mentor");
export const getMentorStudents = (mentorId: string) => api.get<AdminMentorStudent[]>(`/api/v1/admin/mentors/${mentorId}/students`);
/** Makes the mentor the student's mentor in the mentor's track. */
export const assignStudentToMentor = (mentorId: string, studentId: string) =>
  api.post<AdminMentorStudent>(`/api/v1/admin/mentors/${mentorId}/students`, { studentId });

/** A student asked to change their mentor; the admin decides. */
export interface AdminMentorRequest {
  id: string;
  student: AdminPerson;
  trackCode: string;
  trackName: string;
  currentMentor: AdminPerson | null;
  requestedMentor: AdminPerson;
  createdUtc: string;
}

/** A mentor asked to teach another track too. */
export interface AdminTrackRequest {
  id: string;
  mentor: AdminPerson;
  currentTrackCode: string;
  currentTrackName: string;
  trackCode: string;
  trackName: string;
  note: string | null;
  createdUtc: string;
}

/** A student who learns a track asked to change to another one; the admin decides (26 Oct 2026). */
export interface AdminTrackChangeRequest {
  id: string;
  student: AdminPerson;
  /** The track in focus when they asked. */
  currentTrack: { code: string; name: string } | null;
  requestedTrack: { code: string; name: string };
  /** From the placement test, when the request came from it. */
  level: string | null;
  createdUtc: string;
}

export const getTrackChangeRequests = () => api.get<AdminTrackChangeRequest[]>("/api/v1/admin/track-change-requests");
export const approveTrackChangeRequest = (id: string) => api.post<void>(`/api/v1/admin/track-change-requests/${id}/approve`);
export const rejectTrackChangeRequest = (id: string, reason?: string) =>
  api.post<void>(`/api/v1/admin/track-change-requests/${id}/reject`, { reason: reason || null });

export const getMentorRequests = () => api.get<AdminMentorRequest[]>("/api/v1/admin/mentor-requests");
export const approveMentorRequest = (id: string) => api.post<void>(`/api/v1/admin/mentor-requests/${id}/approve`);
export const rejectMentorRequest = (id: string, reason?: string) =>
  api.post<void>(`/api/v1/admin/mentor-requests/${id}/reject`, { reason: reason || null });
export const getTrackRequests = () => api.get<AdminTrackRequest[]>("/api/v1/admin/mentor-track-requests");
export const approveTrackRequest = (id: string) => api.post<void>(`/api/v1/admin/mentor-track-requests/${id}/approve`);
export const rejectTrackRequest = (id: string, reason?: string) =>
  api.post<void>(`/api/v1/admin/mentor-track-requests/${id}/reject`, { reason: reason || null });

export type AnnouncementAudience = "Everyone" | "Students" | "Mentors" | "Teachers";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  audience: AnnouncementAudience;
  /** Only students of this track see it; null for all. */
  trackCode: string | null;
  trackName: string | null;
  isPinned: boolean;
  expiresUtc: string | null;
  createdUtc: string;
  updatedUtc: string;
  /** Saved, not published: only the admin sees it. */
  isDraft: boolean;
  /** Scheduled: shown from this time on; null when shown right away. */
  publishAtUtc: string | null;
  /** How many accounts it is meant for (admin list only). */
  reach: number;
}

export interface AnnouncementInput {
  title: string;
  body: string;
  audience: AnnouncementAudience;
  trackCode?: string | null;
  isPinned?: boolean;
  expiresUtc?: string | null;
  isDraft?: boolean;
  /** A future time schedules it; null publishes it now. */
  publishAtUtc?: string | null;
}

export type AnnouncementStatus = "draft" | "scheduled" | "live" | "expired";

export function announcementStatus(a: Announcement, now = Date.now()): AnnouncementStatus {
  if (a.isDraft) return "draft";
  if (a.publishAtUtc && new Date(a.publishAtUtc).getTime() > now) return "scheduled";
  if (a.expiresUtc && new Date(a.expiresUtc).getTime() <= now) return "expired";
  return "live";
}

export const getAdminAnnouncements = () => api.get<Announcement[]>("/api/v1/admin/announcements");
export const createAnnouncement = (body: AnnouncementInput) => api.post<Announcement>("/api/v1/admin/announcements", body);
export const updateAnnouncement = (id: string, body: AnnouncementInput) => api.put<Announcement>(`/api/v1/admin/announcements/${id}`, body);
export const deleteAnnouncement = (id: string) => api.delete<void>(`/api/v1/admin/announcements/${id}`);

/** Squad submissions per track: mentors review them, the admin follows each track. */
export interface TrackSubmissions {
  trackCode: string;
  trackName: string;
  squads: number;
  submitted: number;
  inReview: number;
  approved: number;
}
export const getSubmissionsByTrack = () => api.get<TrackSubmissions[]>("/api/v1/admin/submissions/by-track");

export interface CountItem {
  key: string;
  count: number;
}

/** The whole system in numbers. */
export interface SystemReport {
  generatedUtc: string;
  users: { total: number; byRole: CountItem[]; byStatus: CountItem[]; newLast30Days: number; activeLast7Days: number };
  students: {
    total: number;
    independent: number;
    inSchools: number;
    withoutTrack: number;
    activeLast7Days: number;
    activeLast30Days: number;
    averageXp: number;
    longestStreak: number;
    byTrack: CountItem[];
    byLevel: CountItem[];
    byGender: CountItem[];
  };
  learning: {
    tracks: number;
    lessons: number;
    lessonsCompleted: number;
    lessonsCompletedLast30Days: number;
    levelExams: number;
    trackQuizzes: number;
    badgesEarned: number;
    xpAwarded: number;
  };
  mentorship: {
    mentors: number;
    activeMentors: number;
    averageRating: number;
    studentsWithMentor: number;
    studentsWithoutMentor: number;
    pendingChangeRequests: number;
    sessionsUpcoming: number;
    sessionsCompleted: number;
    sessionsNoShow: number;
    sessionsCancelled: number;
    feedbacks: number;
    messages: number;
  };
  squads: {
    total: number;
    byStatus: CountItem[];
    currentMembers: number;
    averageSize: number;
    withoutMonitor: number;
    useCases: number;
    tasksTotal: number;
    tasksDone: number;
  };
  teaching: {
    schools: number;
    teachers: number;
    classes: number;
    assignments: number;
    submissions: number;
    graded: number;
    waitingForGrade: number;
    questions: number;
    questionsOpen: number;
  };
  recruitment: { jobs: number; applications: number; applicationsByStatus: CountItem[]; certificates: number };
  platform: { notifications: number; unreadNotifications: number; announcements: number; pendingApprovals: number; assistantConversations: number };
}
export const getSystemReport = () => api.get<SystemReport>("/api/v1/admin/reports/system");

export const createAdminRole = (body: { name: string; description: string; permissions?: RolePermission[] }) =>
  api.post<AdminRole>("/api/v1/admin/roles", body);
export const deleteAdminRole = (id: string) => api.delete<void>(`/api/v1/admin/roles/${id}`);

/** One thing a student did on the platform, for the dashboard's live feed. */
export interface PlatformActivity {
  studentId: string;
  studentName: string;
  photoUrl: string | null;
  type: string;
  text: string;
  trackName: string | null;
  createdUtc: string;
}
export const getPlatformActivity = (limit = 6) => api.get<PlatformActivity[]>(`/api/v1/admin/activity?limit=${limit}`);
