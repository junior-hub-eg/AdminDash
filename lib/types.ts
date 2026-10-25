/**
 * Core data entities — mirrors PRD Section 10 (Core Data Entities, Draft).
 * These are the frontend-facing shapes; they will need to be reconciled with
 * the real backend contracts once the .NET API ships (Sprint 1+).
 */

export type UserRole = "learner" | "guardian" | "mentor" | "admin" | "teacher";

export interface User {
  id: string;
  role: UserRole;
  firstName: string;
  lastName?: string;
  email: string;
  /** The chosen cartoon avatar (lib/avatars.ts), or null. */
  photoUrl?: string | null;
  /** Boy or girl ("Male" / "Female"); null for a student from before the question, who is asked once. */
  gender?: "Male" | "Female" | null;
  phone?: string;
  /** Admin accounts only: the main admin (junorhub@gmail.com), who adds the other admins. */
  isOwner?: boolean;
  age?: number;
  guardianId?: string;
  createdAt: string;
}

export type ConsentType = "account" | "data" | "chat_communication";

export interface GuardianConsent {
  id: string;
  guardianId: string;
  learnerId: string;
  consentType: ConsentType;
  status: "pending" | "granted" | "revoked";
  timestamp: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  piiFilterStatus: "clean" | "flagged" | "blocked";
  reviewed: boolean;
  timestamp: string;
}

export interface Track {
  id: string;
  slug: string;
  name: string;
  description?: string;
}

export interface Course {
  id: string;
  trackId: string;
  title: string;
  modules: Module[];
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  videos: Video[];
}

export interface Video {
  id: string;
  moduleId: string;
  title: string;
  url: string;
  durationSeconds?: number;
}

export interface Quiz {
  id: string;
  videoId: string;
  concept: string;
  format: "quiz" | "case_study";
}

export interface QuizAttempt {
  id: string;
  userId: string;
  videoId: string;
  concept: string;
  passed: boolean;
  attempts: number;
  timestamp: string;
}

export type InterviewStage = "A" | "B" | "C";

export interface AIInterviewSession {
  id: string;
  userId: string;
  trackId: string;
  stageResults: Partial<Record<InterviewStage, unknown>>;
  readinessPercentage: number | null;
  gapReport?: string;
  recommendedPlan?: string;
  timestamp: string;
}

export interface MentorAssignment {
  id: string;
  learnerId: string;
  mentorId: string;
  trackId: string;
  active: boolean;
  history: { mentorId: string; from: string; to?: string }[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  source: "admin";
  disciplineSlotsNeeded: Partial<Record<string, number>>;
  status: "draft" | "active" | "completed";
}

export interface ProjectMembership {
  id: string;
  projectId: string;
  userId: string;
  discipline: string;
  role: string;
}

export interface Task {
  id: string;
  projectId: string;
  assigneeId: string;
  description: string;
  status: "todo" | "in_progress" | "in_review" | "done";
  score?: number;
  reviewerId?: string;
}

export interface TaskEvaluation {
  id: string;
  taskId: string;
  reviewerId: string;
  score: number;
  writtenFeedback: string;
  timestamp: string;
}

export interface PlacementProfile {
  id: string;
  userId: string;
  compositeReadinessScore: number;
  projectHistory: string[];
  recommendedCompanies?: string[];
}

export type ExternalAccountProvider = "github" | "figma" | "linkedin";

export interface ExternalAccountLink {
  id: string;
  userId: string;
  provider: ExternalAccountProvider;
  externalProfileUrl: string;
  linkedAt: string;
  guardianConsentRef?: string;
}

export type AchievementType = "project_completed" | "milestone" | "high_score";

export interface ShareableAchievement {
  id: string;
  userId: string;
  achievementType: AchievementType;
  generatedAssetUrl?: string;
  sharedAt?: string;
  guardianNotified: boolean;
}
