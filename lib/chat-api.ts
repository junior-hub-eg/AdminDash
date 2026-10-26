/**
 * The one chat of every dashboard (backend api/v1/chat, 27 Oct 2026): anyone on the platform messages anyone, with
 * text, stickers, pictures and files. Squads and classes have their conversation, every user one with the admins
 * (technical support), and the admins broadcast to everyone or one role. New messages arrive live as
 * "ConversationMessage" on /hubs/live.
 */
import { API_BASE_URL, api } from "@/lib/api-client";

export type ChatRole = "student" | "mentor" | "teacher" | "admin";
export type ConversationKind = "direct" | "group" | "squad" | "class" | "support" | "broadcast";
export type ChatMessageKind = "text" | "sticker" | "image" | "file";
export type BroadcastAudience = "everyone" | "students" | "mentors" | "teachers";

export interface ChatContact {
  id: string;
  name: string;
  role: ChatRole;
  photoUrl: string | null;
}

export interface ChatAttachment {
  id: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  isImage: boolean;
  /** A signed path on the API, valid for some hours; works in an img src. */
  url: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  sender: ChatContact;
  kind: ChatMessageKind;
  text: string | null;
  stickerCode: string | null;
  attachments: ChatAttachment[];
  replyTo: { id: string; senderName: string; kind: ChatMessageKind; text: string | null } | null;
  createdUtc: string;
  deleted: boolean;
}

export interface Conversation {
  id: string;
  kind: ConversationKind;
  title: string;
  other: ChatContact | null;
  audience: BroadcastAudience | null;
  memberCount: number;
  unread: number;
  lastMessage: ChatMessage | null;
  lastMessageUtc: string;
  /** False for a broadcast to someone who is not an admin: they reply in support. */
  canWrite: boolean;
  squadId: string | null;
  classId: string | null;
}

export interface ConversationMessageEvent {
  message: ChatMessage;
  conversationKind: ConversationKind;
}

/** The limits the backend checks (ChatFileRules). */
export const CHAT_LIMITS = {
  imageBytes: 5 * 1024 * 1024,
  fileBytes: 10 * 1024 * 1024,
  files: 5,
  text: 4000,
  imageTypes: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
  fileTypes: [".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip"],
};

export const CHAT_ACCEPT = [...CHAT_LIMITS.imageTypes, ...CHAT_LIMITS.fileTypes].join(",");

const base = "/api/v1/chat";

export const getConversations = () => api.get<Conversation[]>(`${base}/conversations`);
export const getConversation = (id: string) =>
  api.get<{ conversation: Conversation; members: ChatContact[] }>(`${base}/conversations/${id}`);
export const getChatMessages = (id: string, before?: string) =>
  api.get<{ messages: ChatMessage[]; hasMore: boolean }>(
    `${base}/conversations/${id}/messages${before ? `?before=${encodeURIComponent(before)}` : ""}`,
  );
export const sendChatMessage = (id: string, body: { text?: string; stickerCode?: string; replyToId?: string | null }) =>
  api.post<ChatMessage>(`${base}/conversations/${id}/messages`, body);
export const sendChatFiles = (id: string, files: File[], text?: string, replyToId?: string | null) => {
  const form = new FormData();
  for (const f of files) form.append("files", f, f.name);
  if (text) form.append("text", text);
  if (replyToId) form.append("replyToId", replyToId);
  return api.postForm<ChatMessage>(`${base}/conversations/${id}/files`, form);
};
export const markConversationRead = (id: string) => api.post<void>(`${base}/conversations/${id}/read`);
export const getChatUnread = () => api.get<{ conversations: number; messages: number }>(`${base}/unread`);
export const searchChatPeople = (q: string, role?: ChatRole | "") =>
  api.get<ChatContact[]>(`${base}/people?q=${encodeURIComponent(q)}${role ? `&role=${role}` : ""}`);
export const startDirectChat = (userId: string) => api.post<Conversation>(`${base}/conversations/direct`, { userId });
export const createGroupChat = (title: string, memberIds: string[]) =>
  api.post<Conversation>(`${base}/conversations/group`, { title, memberIds });
export const openSupportChat = () => api.post<Conversation>(`${base}/conversations/support`);
export const deleteChatMessage = (id: string) => api.delete<void>(`${base}/messages/${id}`);
export const reportChatMessage = (id: string, reason: string) => api.post<void>(`${base}/messages/${id}/report`, { reason });
export const openBroadcast = (audience: BroadcastAudience) => api.post<Conversation>(`/api/v1/admin/chat/broadcasts/${audience}`);

/** A file's address: the API's signed link; download=true saves it instead of opening it. */
export const attachmentHref = (a: ChatAttachment, download = false) =>
  `${API_BASE_URL}${a.url}${download ? "&download=true" : ""}`;

/** The stickers: the site's cartoon avatars (decision of 27 Oct 2026), the same codes the backend accepts. */
export const stickerSrc = (code: string) => `/images/avatars/${code}.webp`;

// ---------- Opening the chat from anywhere ----------

/** What to open in the chat panel of the top bar. */
export type ChatTarget = { conversationId: string } | { userId: string } | { kind: "squad" | "support" } | { squadId: string } | { classId: string };

const OPEN_EVENT = "jh:open-chat";

/** Opens the top bar's chat panel on a conversation (the panel listens for this event). */
export function openChat(target: ChatTarget = { kind: "support" }) {
  window.dispatchEvent(new CustomEvent<ChatTarget>(OPEN_EVENT, { detail: target }));
}

export function onOpenChat(handler: (target: ChatTarget) => void): () => void {
  const listener = (e: Event) => handler((e as CustomEvent<ChatTarget>).detail);
  window.addEventListener(OPEN_EVENT, listener);
  return () => window.removeEventListener(OPEN_EVENT, listener);
}

/** Resolves a target to a conversation id. */
export async function resolveChatTarget(target: ChatTarget): Promise<string | null> {
  if ("conversationId" in target) return target.conversationId;
  if ("userId" in target) return (await startDirectChat(target.userId)).id;
  if ("kind" in target && target.kind === "support") return (await openSupportChat()).id;
  const all = await getConversations();
  if ("squadId" in target) return all.find((c) => c.squadId === target.squadId)?.id ?? null;
  if ("classId" in target) return all.find((c) => c.classId === target.classId)?.id ?? null;
  return all.find((c) => c.kind === "squad")?.id ?? null;
}
