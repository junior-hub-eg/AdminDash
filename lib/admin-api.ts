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

export const getAdminOverview = () => api.get<AdminOverview>("/api/v1/admin/overview");
export const getAdminStudents = () => api.get<AdminStudent[]>("/api/v1/admin/students");
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

export interface AdminSubmissionsOverview {
  stats: { totalSubmissions: number; avgScore: string; pendingReview: number; approved: number };
  rows: {
    id: string;
    student: string;
    assignment: string;
    track: string;
    /** "Submitted", "Pending" or "Graded" */
    status: string;
    /** A picture in /images/Intern. */
    avatar: string;
    bg: string;
    /** "Assignment" or "Squad" */
    type: string;
    submittedUtc: string;
  }[];
}

export const getAdminSubmissions = () => api.get<AdminSubmissionsOverview>("/api/v1/admin/submissions");

/* ---------- Roles & permissions ---------- */

export interface RolePermission {
  area: string;
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
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

// ---------- Review notes (backend AdminManagementController, 25 Oct 2026) ----------

export type SquadRole = "Frontend" | "Backend" | "UIUX" | "AI" | "Testing" | "Data" | "Mobile" | "Gaming";
export const SQUAD_ROLES: SquadRole[] = ["Frontend", "Backend", "UIUX", "AI", "Testing", "Data", "Mobile", "Gaming"];

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
}) => api.post<AdminSquad>("/api/v1/admin/squads", body);

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
