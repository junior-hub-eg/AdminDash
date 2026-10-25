/** The Arabic grammar coach "مدرّب النحو" (backend TeachingAiControllers and AdminGrammarController, 25-26 Oct 2026). */
import { api } from "@/lib/api-client";

export type GrammarStatus = "New" | "Practicing" | "Mastered";
/** blue مرفوع, green منصوب, orange مجرور, purple مجزوم, gray مبني/حروف. */
export type WordColor = "blue" | "green" | "orange" | "purple" | "gray" | "teal";

export interface GrammarTopic {
  key: string;
  titleAr: string;
  titleEn: string;
  status: GrammarStatus;
  rightSentences: number;
  quickCheckScore: number | null;
  order: number;
  descriptionAr: string | null;
  videoUrl: string | null;
  notes: string[];
  roles: string[];
}

export interface ParsedWord {
  word: string;
  role: string;
  case: string;
  sign: string;
  explanation: string;
  color: WordColor;
}

export interface ParsedSentence {
  text: string;
  words: ParsedWord[];
}

export interface Practice {
  exerciseId: string;
  text: string;
  words: { index: number; word: string; options: string[] }[];
}

export interface GrammarLesson {
  topicKey: string;
  topicTitle: string;
  points: { title: string; text: string; color: WordColor }[];
  examples: ParsedSentence[];
  practice: Practice;
}

export interface SentenceResult {
  correct: boolean;
  words: { word: string; given: string; expected: string; right: boolean; case: string; sign: string; explanation: string; color: WordColor }[];
  feedback: { word: string; what: string; why: string; guidingQuestions: { question: string; answer: string }[] }[] | null;
  xpAwarded: number;
  status: GrammarStatus;
  next: Practice | null;
}

export interface GrammarQuiz {
  exerciseId: string;
  topicKey: string;
  questions: { question: string; options: string[] }[];
}

export interface GrammarQuizResult {
  correct: number;
  total: number;
  rightAnswers: number[];
  explanations: string[];
  xpAwarded: number;
  status: GrammarStatus;
}

export interface GrammarPassage {
  id: string;
  title: string;
  sourceText: string;
  sentences: ParsedSentence[];
  byTeacher: boolean;
  isPublished: boolean;
  grade: number | null;
  createdUtc: string;
  publishedUtc: string | null;
}

export interface NewPassage {
  title?: string;
  text?: string;
  imageBase64?: string;
  mimeType?: string;
  grade?: number;
}

// Student
export const getGrammarTopics = () => api.get<GrammarTopic[]>("/api/v1/student/grammar/topics");
export const startGrammarLesson = (key: string) => api.post<GrammarLesson>(`/api/v1/student/grammar/topics/${key}/lesson`);
export const answerSentence = (exerciseId: string, answers: string[]) =>
  api.post<SentenceResult>(`/api/v1/student/grammar/exercises/${exerciseId}/answer`, { answers });
export const startQuickCheck = (key: string) => api.post<GrammarQuiz>(`/api/v1/student/grammar/topics/${key}/quick-check`);
export const answerQuickCheck = (exerciseId: string, answers: number[]) =>
  api.post<GrammarQuizResult>(`/api/v1/student/grammar/quick-checks/${exerciseId}/answer`, { answers });
export const askGrammarCoach = (key: string, question: string, context: string, history: { role: "student" | "coach"; text: string }[]) =>
  api.post<{ answer: string }>(`/api/v1/student/grammar/topics/${key}/ask`, { question, context, history });
export const getStudentPassages = () => api.get<GrammarPassage[]>("/api/v1/student/grammar/passages");
export const addStudentPassage = (passage: NewPassage) => api.post<GrammarPassage>("/api/v1/student/grammar/passages", passage);

// Teacher
export const getTeacherPassages = () => api.get<GrammarPassage[]>("/api/v1/teacher/grammar/passages");
export const addTeacherPassage = (passage: NewPassage) => api.post<GrammarPassage>("/api/v1/teacher/grammar/passages", passage);
export const updateTeacherPassage = (id: string, changes: { title?: string; sentences?: ParsedSentence[] }) =>
  api.put<GrammarPassage>(`/api/v1/teacher/grammar/passages/${id}`, changes);
export const publishTeacherPassage = (id: string) => api.post<GrammarPassage>(`/api/v1/teacher/grammar/passages/${id}/publish`);
export const deleteTeacherPassage = (id: string) => api.delete<void>(`/api/v1/teacher/grammar/passages/${id}`);

// Admin
export interface AdminGrammarTopic {
  id: string;
  key: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string | null;
  roles: string[];
  videoUrl: string | null;
  notes: string[];
  order: number;
  isActive: boolean;
  practicing: number;
  mastered: number;
}

export interface SaveGrammarTopic {
  key?: string;
  titleAr?: string;
  titleEn?: string;
  descriptionAr?: string | null;
  roles?: string[];
  videoUrl?: string | null;
  notes?: string[];
  isActive?: boolean;
}

export interface GrammarCorrectionsReport {
  total: number;
  passages: number;
  teachers: number;
  topMistakes: { aiRole: string; teacherRole: string; count: number }[];
  recent: {
    id: string;
    passageId: string;
    passageTitle: string;
    teacherName: string;
    sentence: string;
    word: string;
    aiRole: string;
    teacherRole: string;
    createdUtc: string;
  }[];
}

export const getAdminGrammarTopics = () => api.get<AdminGrammarTopic[]>("/api/v1/admin/grammar/topics");
export const createGrammarTopic = (topic: SaveGrammarTopic) => api.post<AdminGrammarTopic[]>("/api/v1/admin/grammar/topics", topic);
export const updateGrammarTopic = (id: string, topic: SaveGrammarTopic) => api.put<AdminGrammarTopic[]>(`/api/v1/admin/grammar/topics/${id}`, topic);
export const reorderGrammarTopics = (ids: string[]) => api.put<AdminGrammarTopic[]>("/api/v1/admin/grammar/topics/order", { ids });
export const getGrammarCorrections = () => api.get<GrammarCorrectionsReport>("/api/v1/admin/grammar/corrections");

/** Tailwind classes for a word's grammatical case color (the same colors on every screen, US-03). */
export const WORD_COLOR: Record<WordColor, string> = {
  blue: "bg-[#dcecff] text-[#1d5fb8] ring-[#9cc4f5]",
  green: "bg-[#dcf5e7] text-[#11704a] ring-[#93dcb6]",
  orange: "bg-[#ffecd9] text-[#b5560c] ring-[#f6bf8c]",
  purple: "bg-[#efe3ff] text-[#6b3fb5] ring-[#c8acf2]",
  gray: "bg-[#eef1f4] text-[#4b5563] ring-[#d3d8de]",
  teal: "bg-[#d8f3f1] text-[#0f6f6b] ring-[#98dcd6]",
};
