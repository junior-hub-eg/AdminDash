/**
 * The admin's view of the mentors' sessions, availability and feedback
 * (backend AdminMentorSessionsController, 26 Oct 2026). Capacity is saved with
 * PUT /api/v1/admin/mentors/{id}/capacity (AdminMentorAreaController).
 */
import { api } from "@/lib/api-client";

export type SessionStatus = "Upcoming" | "Completed" | "NoShow" | "Cancelled";

export interface AdminSession {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorPhotoUrl: string;
  /** "OneToOne" or "Group". */
  type: string;
  /** The mentor's topic; empty when none was written. */
  title: string;
  startsUtc: string;
  endsUtc: string;
  status: SessionStatus;
  meetingLink: string | null;
  students: { id: string; fullName: string; photoUrl: string | null }[];
  squadName: string | null;
}

export interface AdminSessionsPage {
  items: AdminSession[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AvailabilitySlot {
  /** 0 (Sunday) to 6 (Saturday). */
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface MentorTimeOff {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
}

export interface AdminMentorProfile {
  id: string;
  fullName: string;
  bio: string;
  email: string | null;
  phone: string | null;
  joinedUtc: string | null;
  languages: string[];
  skills: string[];
  meetingLink: string | null;
  maxStudents: number;
  maxSquads: number;
  currentStudents: number;
  currentSquads: number;
  loadPercent: number;
  availability: AvailabilitySlot[];
  weeklyAvailableHours: number;
  timeOff: MentorTimeOff[];
  averageRating: number;
  ratingsCount: number;
  /** Counts of 5, 4, 3, 2 and 1 star reviews. */
  ratingBreakdown: number[];
  feedbackRatePercent: number | null;
  averageReplyHours: number | null;
  sessionsCompleted: number;
  sessionsUpcoming: number;
  sessionsNoShow: number;
  sessionsCancelled: number;
  mentoringHours: number;
}

export interface AdminFeedback {
  id: string;
  studentId: string;
  studentName: string;
  studentPhotoUrl: string | null;
  rating: number;
  comment: string;
  createdUtc: string;
  sessionId: string;
  sessionStartsUtc: string | null;
  sessionTopic: string | null;
}

export interface AdminFeedbackPage {
  items: AdminFeedback[];
  total: number;
  page: number;
  pageSize: number;
  averageRating: number;
}

export interface SessionsQuery {
  mentorId?: string;
  status?: SessionStatus;
  fromUtc?: string;
  toUtc?: string;
  page?: number;
  pageSize?: number;
}

export function getAdminSessions(query: SessionsQuery = {}) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) if (value !== undefined && value !== "") params.set(key, String(value));
  const qs = params.toString();
  return api.get<AdminSessionsPage>(`/api/v1/admin/sessions${qs ? `?${qs}` : ""}`);
}

export const getMentorProfile = (id: string) => api.get<AdminMentorProfile>(`/api/v1/admin/mentors/${id}/profile`);

export const getMentorFeedback = (id: string, page = 1, pageSize = 10) =>
  api.get<AdminFeedbackPage>(`/api/v1/admin/mentors/${id}/feedback?page=${page}&pageSize=${pageSize}`);

/** maxSquads is kept when left out. */
export const setMentorCapacity = (id: string, maxStudents: number) =>
  api.put<{ maxStudents: number; maxSquads: number }>(`/api/v1/admin/mentors/${id}/capacity`, { maxStudents });

export const cancelMentorSession = (mentorId: string, sessionId: string, reason: string) =>
  api.post<void>(`/api/v1/admin/mentors/${mentorId}/sessions/${sessionId}/cancel`, { reason });
