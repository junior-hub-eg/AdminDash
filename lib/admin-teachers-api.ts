/**
 * The admin watches the teachers (backend AdminTeachersController, 27 Oct 2026): the list with each teacher's numbers,
 * and each teacher's own pages as the teacher sees them, read only.
 */
import { api } from "@/lib/api-client";
import { tk } from "@/lib/i18n/translate";
import { downloadAdminFile } from "@/lib/admin-reports-api";
import type { Gender } from "@/lib/avatars";

export type UserStatus = "PendingActivation" | "PendingEmailConfirmation" | "Active" | "PendingApproval" | "Rejected" | "Suspended";
/** How an account's status reads on the page. */
export const STATUS_LABEL: Record<string, string> = {
  Active: tk("Active"),
  PendingApproval: tk("Pending approval"),
  PendingEmailConfirmation: tk("Email not confirmed"),
  PendingActivation: tk("Not activated"),
  Rejected: tk("Rejected"),
  Suspended: tk("Deactivated"),
};

/** The subjects a teacher can teach (backend SchoolSubject). */
export const SUBJECTS = ["Math", "Science", "Physics", "Language", "Biology", "Chemistry"] as const;

export type StudentStatus = "TopQuartile" | "OnTrack" | "NeedsAssistance";
export type AssignmentStatus = "NotStarted" | "Submitted" | "Late" | "Graded" | "Missing";

export interface AdminTeacher {
  id: string;
  fullName: string;
  email: string;
  status: UserStatus;
  schoolId: string;
  schoolName: string;
  subjects: string[];
  grades: number[];
  classes: number;
  students: number;
  /** Students active in the last 7 days. */
  weeklyActive: number;
  assignments: number;
  /** Submissions not graded yet. */
  toGrade: number;
  /** Assignments past the due date with work not graded yet. */
  overdue: number;
  openQuestions: number;
  averageScore: number | null;
  lastLoginUtc: string | null;
  createdUtc: string;
}

export interface AdminTeachersPage {
  stats: { teachers: number; active: number; students: number; toGrade: number; openQuestions: number; averageScore: number | null };
  teachers: AdminTeacher[];
}

export interface TeacherAlert {
  kind: "MissedDeadline" | "LowScore" | "Inactive" | "JoinRequest";
  studentId: string;
  fullName: string;
  classId: string;
  className: string;
  detail: string | null;
  atUtc: string | null;
}

export interface ClassQuestion {
  id: string;
  classId: string;
  className: string;
  studentId: string;
  studentName: string;
  text: string;
  createdUtc: string;
  answer: string | null;
  answeredUtc: string | null;
}

export interface TeacherDashboard {
  stats: { totalEnrolled: number; weeklyActive: number; dueThisWeek: number; averageScore: number | null; plannedLessons: number; needsFocus: number };
  alerts: TeacherAlert[];
  questions: ClassQuestion[];
  classProgress: {
    classId: string;
    grade: number;
    name: string;
    students: number;
    onTrack: number;
    percent: number;
    nextAssignment: string | null;
    nextDueUtc: string | null;
    currentPlan: string | null;
  }[];
  schedule: { dateUtc: string; kind: "Due" | "Plan"; title: string; className: string; classId: string }[];
}

export interface TeacherClass {
  id: string;
  grade: number;
  name: string;
  students: number;
  activeRate: number;
  averageScore: number | null;
  joinCode: string;
  autoAccept: boolean;
  pendingRequests: number;
  openAssignments: number;
  currentPlan: string | null;
}

export interface TeacherStudentRow {
  studentId: string;
  fullName: string;
  email: string;
  photoUrl: string | null;
  gender: Gender | null;
  classId: string;
  className: string;
  grade: number;
  lessonsDone: number;
  lessonsTotal: number;
  problemsSolved: number;
  problemsTotal: number;
  mastery: number | null;
  timeSpentMinutes: number;
  lastActiveUtc: string | null;
  status: StudentStatus;
}

export interface TeacherStudents {
  stats: { total: number; needsAssistance: number; onTrack: number; topQuartile: number; averageMastery: number | null };
  students: TeacherStudentRow[];
}

export interface TeacherAssignment {
  id: string;
  classId: string;
  className: string;
  subject: string;
  title: string;
  instructions: string | null;
  openUtc: string;
  dueUtc: string;
  maxPoints: number;
  enrolled: number;
  submitted: number;
  graded: number;
  averagePercent: number | null;
}

export interface TeacherAssignmentDetail extends Omit<TeacherAssignment, "enrolled"> {
  students: {
    studentId: string;
    fullName: string;
    status: AssignmentStatus;
    answer: string | null;
    submittedUtc: string | null;
    score: number | null;
    feedback: string | null;
  }[];
}

export interface ThreadMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  mine: boolean;
  text: string;
  createdUtc: string;
  broadcast: boolean;
}

export interface TeacherMessages {
  stats: { unreadDirect: number; openQuestions: number; eventsToday: number; averageReplyMinutes: number | null };
  channels: { classId: string; name: string; grade: number; students: number; lastText: string | null; lastSender: string | null; lastUtc: string | null; messages: number }[];
  direct: {
    studentId: string;
    fullName: string;
    photoUrl: string | null;
    gender: Gender | null;
    classId: string;
    className: string;
    lastText: string | null;
    lastUtc: string | null;
    unread: number;
  }[];
}

export interface MessageThread {
  name: string;
  messages: ThreadMessage[];
}

export interface CalendarItem {
  id: string;
  /** "Event", "Due" or "Plan". */
  source: string;
  kind: string;
  title: string;
  notes: string | null;
  location: string | null;
  className: string | null;
  studentName: string | null;
  startUtc: string;
  endUtc: string;
}

export interface TeacherCalendar {
  from: string;
  to: string;
  items: CalendarItem[];
  channels: { kind: string; count: number; hours: number }[];
}

export interface Competency {
  title: string;
  percent: number;
}

export interface TeacherProgress {
  basis: "Grammar" | "Subjects";
  columns: { key: string; title: string }[];
  rows: { studentId: string; fullName: string; className: string; scores: (number | null)[]; mastery: number | null; status: StudentStatus }[];
  stats: { mastery: number | null; ready: number; total: number; needsFocus: number; weeklyHoursPerStudent: number };
  skillGaps: Competency[];
}

const base = (id: string) => `/api/v1/admin/teachers/${id}`;

export const getAdminTeachers = () => api.get<AdminTeachersPage>("/api/v1/admin/teachers");
export const getAdminTeacher = (id: string) => api.get<AdminTeacher>(base(id));
export const getTeacherDashboard = (id: string) => api.get<TeacherDashboard>(`${base(id)}/dashboard`);
export const getTeacherClasses = (id: string) => api.get<TeacherClass[]>(`${base(id)}/classes`);
export const getTeacherStudents = (id: string) => api.get<TeacherStudents>(`${base(id)}/students`);
export const getTeacherAssignments = (id: string) => api.get<TeacherAssignment[]>(`${base(id)}/assignments`);
export const getTeacherAssignment = (id: string, assignmentId: string) =>
  api.get<TeacherAssignmentDetail>(`${base(id)}/assignments/${assignmentId}`);
export const getTeacherQuestions = (id: string) => api.get<ClassQuestion[]>(`${base(id)}/questions?all=true`);
export const getTeacherMessages = (id: string) => api.get<TeacherMessages>(`${base(id)}/messages`);
/** The conversation stays unread for the teacher. */
export const getTeacherStudentThread = async (id: string, studentId: string): Promise<MessageThread> => {
  const t = await api.get<{ fullName: string; messages: ThreadMessage[] }>(`${base(id)}/messages/students/${studentId}`);
  return { name: t.fullName, messages: t.messages };
};
export const getTeacherChannel = (id: string, classId: string) =>
  api.get<MessageThread>(`${base(id)}/messages/classes/${classId}`);
/** from inclusive, to exclusive, yyyy-MM-dd. */
export const getTeacherCalendar = (id: string, from: string, to: string) =>
  api.get<TeacherCalendar>(`${base(id)}/calendar?from=${from}&to=${to}`);
export const getTeacherProgress = (id: string) => api.get<TeacherProgress>(`${base(id)}/progress`);
export const downloadTeacherReport = (id: string, lang: "en" | "ar") =>
  downloadAdminFile(`${base(id)}/progress/export?lang=${lang}`, `teacher-report-${lang}.xlsx`);

// ---------- The admin manages the teachers (27 Oct 2026) ----------

export interface School {
  id: string;
  name: string;
}

export interface TeacherAccount {
  fullName: string;
  schoolId: string;
  subjects: string[];
  grades: number[];
}

export interface NewTeacher extends TeacherAccount {
  email: string;
  password: string;
  phone?: string;
}

export interface ClassStudent {
  id: string;
  fullName: string;
  email: string;
  joinedVia: "School" | "Code";
  attendance: number;
  mastery: number | null;
  status: StudentStatus;
  lastActiveUtc: string | null;
}

export interface TeacherClassDetail {
  id: string;
  grade: number;
  name: string;
  joinCode: string;
  autoAccept: boolean;
  subjects: string[];
  students: ClassStudent[];
  requests: { studentId: string; fullName: string; requestedUtc: string }[];
}

export const getSchools = async () =>
  (await api.get<{ schools: School[] }>("/api/v1/auth/signup-options")).schools;
export const createTeacher = (body: NewTeacher) => api.post<AdminTeacher>("/api/v1/admin/teachers", body);
export const updateTeacher = (id: string, body: TeacherAccount) => api.put<AdminTeacher>(base(id), body);
/** Deactivated teachers cannot sign in; they are signed out everywhere. */
export const setTeacherActive = (id: string, isActive: boolean) => api.patch<AdminTeacher>(base(id), { isActive });
export const setTeacherPassword = (id: string, password: string) => api.put<void>(`${base(id)}/password`, { password });
/** Only a teacher with no work yet; 409 TEACHER_HAS_WORK otherwise. */
export const deleteTeacher = (id: string) => api.delete<void>(base(id));

const cls = (id: string, classId: string) => `${base(id)}/classes/${classId}`;
export const getTeacherClass = (id: string, classId: string) => api.get<TeacherClassDetail>(cls(id, classId));
export const addClassStudent = (id: string, classId: string, email: string) =>
  api.post<TeacherClassDetail>(`${cls(id, classId)}/students`, { email });
export const removeClassStudent = (id: string, classId: string, studentId: string) =>
  api.delete<void>(`${cls(id, classId)}/students/${studentId}`);
export const decideJoinRequest = (id: string, classId: string, studentId: string, accept: boolean) =>
  api.post<TeacherClassDetail>(`${cls(id, classId)}/requests/${studentId}/${accept ? "accept" : "decline"}`);
export const setClassAutoAccept = (id: string, classId: string, autoAccept: boolean) =>
  api.patch<TeacherClassDetail>(cls(id, classId), { autoAccept });
export const renewClassCode = (id: string, classId: string) => api.post<TeacherClassDetail>(`${cls(id, classId)}/code`);

export const moveAssignmentDue = (id: string, assignmentId: string, dueUtc: string) =>
  api.patch<TeacherAssignmentDetail>(`${base(id)}/assignments/${assignmentId}`, { dueUtc });
export const gradeSubmission = (id: string, assignmentId: string, studentId: string, score: number, feedback: string) =>
  api.post<TeacherAssignmentDetail>(`${base(id)}/assignments/${assignmentId}/students/${studentId}/grade`, { score, feedback: feedback || null });
