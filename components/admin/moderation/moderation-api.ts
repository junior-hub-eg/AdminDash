import { api } from "@/lib/api-client";
import type { ChatContact, ChatMessage } from "@/lib/chat-api";

// The admins watch the whole chat (27 Oct 2026): the students are 12 to 18, so messages with a phone number, an e-mail
// address or a link outside the platform are flagged automatically, and the admins can read any conversation.

export interface ChatReport {
  id: string;
  message: ChatMessage;
  conversationId: string;
  conversationKind: string;
  conversationTitle: string;
  reporter: ChatContact;
  reason: string | null;
  createdUtc: string;
  resolvedUtc: string | null;
  /** The safety check flagged it, not a person. */
  automatic: boolean;
}

export interface AdminConversation {
  id: string;
  kind: string;
  title: string;
  members: ChatContact[];
  memberCount: number;
  openFlags: number;
  lastMessage: ChatMessage | null;
  lastMessageUtc: string;
  audience: string | null;
}

export const CONVERSATION_KINDS = ["direct", "group", "squad", "class", "support", "broadcast"] as const;

export const getReports = (openOnly: boolean) => api.get<ChatReport[]>(`/api/v1/admin/chat/reports?openOnly=${openOnly}`);
export const resolveReport = (id: string) => api.post<void>(`/api/v1/admin/chat/reports/${id}/resolve`);
export const deleteMessage = (id: string) => api.delete<void>(`/api/v1/admin/chat/messages/${id}`);
export const scanOldMessages = () => api.post<{ checked: number; flagged: number }>("/api/v1/admin/chat/scan");

export const getConversationMessages = (id: string, before?: string) =>
  api.get<{ messages: ChatMessage[]; hasMore: boolean }>(
    `/api/v1/admin/chat/conversations/${id}/messages?take=40${before ? `&before=${encodeURIComponent(before)}` : ""}`,
  );

export function getConversations(filters: { kind: string; q: string; flaggedOnly: boolean; page: number }) {
  const params = new URLSearchParams({ page: String(filters.page), take: "20" });
  if (filters.kind) params.set("kind", filters.kind);
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.flaggedOnly) params.set("flaggedOnly", "true");
  return api.get<{ items: AdminConversation[]; total: number }>(`/api/v1/admin/chat/conversations?${params}`);
}
