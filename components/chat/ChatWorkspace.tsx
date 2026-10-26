"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Headset, LoaderCircle, MessageSquarePlus, Search, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { decodeToken, getToken } from "@/lib/auth/token";
import {
  deleteChatMessage,
  getChatMessages,
  getConversation,
  getConversations,
  markConversationRead,
  openSupportChat,
  reportChatMessage,
  resolveChatTarget,
  sendChatFiles,
  sendChatMessage,
  type ChatContact,
  type ChatMessage,
  type ChatTarget,
  type Conversation,
  type ConversationMessageEvent,
} from "@/lib/chat-api";
import { useI18n } from "@/lib/i18n/client";
import { useLiveChannel } from "@/lib/live-channel";
import { cn } from "@/lib/utils";
import { Composer, ConversationAvatar, MessageBubble, ROLE_LABELS, useConversationTitle, useMessagePreview } from "./chat-parts";
import NewChatDialog from "./NewChatDialog";

/** The signed-in person's id, from the access token. */
export function useMyId(): string | null {
  const [id] = useState(() => {
    const token = typeof window === "undefined" ? null : getToken();
    return token ? (decodeToken(token)?.sub ?? null) : null;
  });
  return id;
}

/** Merges a message into a list by id, keeping it sorted by time. */
function merge(list: ChatMessage[], m: ChatMessage) {
  const i = list.findIndex((x) => x.id === m.id);
  if (i >= 0) return list.map((x, j) => (j === i ? m : x));
  return [...list, m].sort((a, b) => a.createdUtc.localeCompare(b.createdUtc));
}

// ---------- One conversation ----------

interface ThreadProps {
  conversationId: string;
  /** Shown in the header; the thread loads it when missing. */
  conversation?: Conversation;
  onBack?: () => void;
  onClose?: () => void;
  /** Opens another conversation (support, from a broadcast). */
  onOpen?: (conversation: Conversation) => void;
  /** A new or changed message, for the list beside it. */
  onActivity?: (m: ChatMessage) => void;
  className?: string;
}

/** A conversation: its messages, older ones on request, and the composer. Messages arrive live. */
export function ChatThread({ conversationId, conversation, onBack, onClose, onOpen, onActivity, className }: ThreadProps) {
  const { t, intl } = useI18n();
  const title = useConversationTitle();
  const me = useMyId();
  const [info, setInfo] = useState<{ conversation: Conversation; members: ChatContact[] } | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const stick = useRef(true);

  const shown = info?.conversation ?? conversation;

  useEffect(() => {
    let off = false;
    getConversation(conversationId).then((x) => !off && setInfo(x), () => undefined);
    getChatMessages(conversationId).then(
      (page) => {
        if (off) return;
        stick.current = true;
        setMessages(page.messages);
        setHasMore(page.hasMore);
      },
      (e) => !off && setErr(errorMessage(e)),
    );
    markConversationRead(conversationId).catch(() => undefined);
    return () => {
      off = true;
    };
  }, [conversationId]);

  useEffect(() => {
    const box = scroller.current;
    if (box && stick.current) box.scrollTop = box.scrollHeight;
  }, [messages]);

  const live = useLiveChannel({
    ConversationMessage: (e: ConversationMessageEvent) => {
      if (e.message.conversationId !== conversationId) return;
      const box = scroller.current;
      stick.current = !box || box.scrollHeight - box.scrollTop - box.clientHeight < 120;
      setMessages((all) => merge(all ?? [], e.message));
      if (e.message.sender.id !== me) markConversationRead(conversationId).catch(() => undefined);
    },
  });

  // Without the live channel, look for new messages every 15 seconds.
  useEffect(() => {
    if (live) return;
    const timer = setInterval(() => {
      getChatMessages(conversationId).then((page) => setMessages((all) => page.messages.reduce(merge, all ?? [])), () => undefined);
    }, 15000);
    return () => clearInterval(timer);
  }, [live, conversationId]);

  const older = () => {
    if (!messages?.length || loadingOlder) return;
    setLoadingOlder(true);
    const box = scroller.current;
    const fromBottom = box ? box.scrollHeight - box.scrollTop : 0;
    getChatMessages(conversationId, messages[0].createdUtc).then(
      (page) => {
        stick.current = false;
        setMessages((all) => page.messages.reduce(merge, all ?? []));
        setHasMore(page.hasMore);
        setLoadingOlder(false);
        requestAnimationFrame(() => {
          if (box) box.scrollTop = box.scrollHeight - fromBottom;
        });
      },
      () => setLoadingOlder(false),
    );
  };

  const sent = (m: ChatMessage) => {
    stick.current = true;
    setMessages((all) => merge(all ?? [], m));
    setReplyTo(null);
    onActivity?.(m);
  };

  const [opened] = useState(() => Date.now());
  const groups = useMemo(() => {
    const out: { label: string; items: ChatMessage[] }[] = [];
    const today = new Date(opened).toDateString();
    const yesterday = new Date(opened - 86400000).toDateString();
    for (const m of messages ?? []) {
      const d = new Date(m.createdUtc).toDateString();
      const label =
        d === today ? t("Today") : d === yesterday ? t("Yesterday") : new Date(m.createdUtc).toLocaleDateString(intl, { weekday: "long", month: "short", day: "numeric" });
      if (out[out.length - 1]?.label !== label) out.push({ label, items: [] });
      out[out.length - 1].items.push(m);
    }
    return out;
  }, [messages, t, intl, opened]);

  const isGroup = shown ? !["direct"].includes(shown.kind) : false;
  const subtitle = !shown
    ? ""
    : shown.kind === "direct" && shown.other
      ? t(ROLE_LABELS[shown.other.role] ?? shown.other.role)
      : shown.kind === "broadcast"
        ? t("Only the admins write here")
        : shown.kind === "support" && !shown.other
          ? t("The Junior Hub team answers here")
          : t("{n} members", { n: info?.members.length ?? shown.memberCount });

  return (
    <section className={cn("flex min-h-0 flex-col bg-[#f7fafc]", className)} aria-label={shown ? title(shown) : t("Conversation")}>
      <header className="flex items-center gap-3 border-b border-[#eef2f6] bg-white px-3 py-2.5">
        {onBack && (
          <button type="button" onClick={onBack} aria-label={t("Back to conversations")} className="grid size-9 place-items-center rounded-full hover:bg-[#f2f5f8]">
            <ArrowLeft className="size-5 rtl:-scale-x-100" />
          </button>
        )}
        {shown && <ConversationAvatar conversation={shown} />}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold text-[#1b2d54]">{shown ? title(shown) : ""}</span>
          <span className="block truncate text-xs text-[#64748b]" title={info?.members.map((m) => m.name).join(", ")}>{subtitle}</span>
        </span>
        {onClose && (
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-9 place-items-center rounded-full hover:bg-[#f2f5f8]">
            <X className="size-5" />
          </button>
        )}
      </header>

      <div
        ref={scroller}
        onScroll={(e) => {
          const box = e.currentTarget;
          if (box.scrollTop < 40 && hasMore) older();
        }}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-4"
      >
        {hasMore && (
          <button type="button" onClick={older} className="mx-auto block rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#0f7378] shadow-sm">
            {loadingOlder ? <LoaderCircle className="size-4 animate-spin" /> : t("Earlier messages")}
          </button>
        )}
        {!messages && !err && <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />}
        {messages?.length === 0 && <p className="py-10 text-center text-sm text-[#64748b]">{t("No messages yet. Say hello!")}</p>}
        {groups.map((g) => (
          <div key={g.label} className="space-y-2">
            <p className="text-center text-xs font-medium text-[#64748b]">{g.label}</p>
            {g.items.map((m, i) => {
              const mine = m.sender.id === me;
              return (
                <MessageBubble
                  key={m.id}
                  message={m}
                  mine={mine}
                  showSender={isGroup && (i === 0 || g.items[i - 1].sender.id !== m.sender.id)}
                  onReply={() => setReplyTo(m)}
                  onDelete={
                    mine
                      ? () => {
                          if (!window.confirm(t("Delete this message for everyone?"))) return;
                          deleteChatMessage(m.id).then(
                            () => setMessages((all) => (all ?? []).map((x) => (x.id === m.id ? { ...x, deleted: true, text: null, attachments: [], stickerCode: null } : x))),
                            (e) => setErr(errorMessage(e)),
                          );
                        }
                      : undefined
                  }
                  onReport={
                    mine
                      ? undefined
                      : () => {
                          const reason = window.prompt(t("Why are you reporting this message? The admins will look at it."));
                          if (reason === null) return;
                          reportChatMessage(m.id, reason).then(() => setNotice(t("Thank you. The admins will look at this message.")), (e) => setErr(errorMessage(e)));
                        }
                  }
                />
              );
            })}
          </div>
        ))}
      </div>

      {notice && (
        <p role="status" className="flex items-center justify-between bg-[#e3f5f1] px-4 py-2 text-sm font-semibold text-[#0f7378]">
          {notice}
          <button type="button" onClick={() => setNotice(null)} aria-label={t("Close")}><X className="size-4" /></button>
        </p>
      )}
      {err && <p role="alert" className="bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
      {shown && !shown.canWrite ? (
        <div className="flex items-center justify-center gap-2 border-t border-[#eef2f6] bg-white p-3">
          <button
            type="button"
            onClick={() => openSupportChat().then((c) => onOpen?.(c), (e) => setErr(errorMessage(e)))}
            className="flex items-center gap-2 rounded-xl bg-[#e6f4ff] px-4 py-2 text-sm font-semibold text-[#1769aa]"
          >
            <Headset className="size-4" /> {t("Reply to technical support")}
          </button>
        </div>
      ) : (
        <Composer
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
          onSendText={async (text) => sent(await sendChatMessage(conversationId, { text, replyToId: replyTo?.id }))}
          onSendSticker={async (stickerCode) => sent(await sendChatMessage(conversationId, { stickerCode, replyToId: replyTo?.id }))}
          onSendFiles={async (files, text) => sent(await sendChatFiles(conversationId, files, text, replyTo?.id))}
        />
      )}
    </section>
  );
}

// ---------- The list and the thread ----------

type Filter = "all" | "unread" | "people" | "groups";

interface WorkspaceProps {
  /** The conversation to open first (from ?c= or the top bar). */
  initialConversationId?: string | null;
  /** In the top bar's panel: one column at a time, with a close button. */
  compact?: boolean;
  onClose?: () => void;
  className?: string;
}

/** Every conversation of the person beside the open one: the one chat of every dashboard (27 Oct 2026). */
export default function ChatWorkspace({ initialConversationId, compact, onClose, className }: WorkspaceProps) {
  const { t, intl } = useI18n();
  const title = useConversationTitle();
  const preview = useMessagePreview();
  const me = useMyId();
  const [isAdmin] = useState(() => {
    const token = typeof window === "undefined" ? null : getToken();
    const claims = token ? decodeToken(token) : null;
    const role = claims?.role ?? claims?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
    return role === "Admin";
  });
  const [list, setList] = useState<Conversation[] | null>(null);
  const [openId, setOpenId] = useState<string | null>(initialConversationId ?? null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const reload = useCallback(() => getConversations().then(setList, (e) => setErr(errorMessage(e))), []);
  useEffect(() => {
    void reload();
  }, [reload]);
  // A new conversation to open (the top bar resolved a target): follow it.
  const [asked, setAsked] = useState(initialConversationId);
  if (asked !== initialConversationId) {
    setAsked(initialConversationId);
    if (initialConversationId) setOpenId(initialConversationId);
  }

  const bump = useCallback(
    (m: ChatMessage, read: boolean) =>
      setList((all) => {
        if (!all) return all;
        const c = all.find((x) => x.id === m.conversationId);
        if (!c) {
          void reload();
          return all;
        }
        const unread = read || m.sender.id === me ? 0 : c.unread + (m.deleted ? 0 : 1);
        const next = { ...c, lastMessage: m, lastMessageUtc: m.createdUtc, unread: m.deleted ? c.unread : unread };
        return [next, ...all.filter((x) => x.id !== c.id)];
      }),
    [me, reload],
  );

  const live = useLiveChannel({
    ConversationMessage: (e: ConversationMessageEvent) => bump(e.message, e.message.conversationId === openId),
  });
  // Without the live channel, refresh the list every 20 seconds.
  useEffect(() => {
    if (live) return;
    const timer = setInterval(() => void reload(), 20000);
    return () => clearInterval(timer);
  }, [live, reload]);

  const open = (id: string) => {
    setOpenId(id);
    setList((all) => all?.map((c) => (c.id === id ? { ...c, unread: 0 } : c)) ?? all);
  };

  const visible = (list ?? []).filter((c) => {
    if (query && !title(c).toLowerCase().includes(query.toLowerCase())) return false;
    if (filter === "unread") return c.unread > 0;
    if (filter === "people") return c.kind === "direct" || c.kind === "support";
    if (filter === "groups") return c.kind !== "direct" && c.kind !== "support";
    return true;
  });
  const current = list?.find((c) => c.id === openId);
  const showList = !compact || !openId;
  const showThread = !!openId;

  const when = (iso: string) => {
    const d = new Date(iso);
    return d.toDateString() === new Date().toDateString()
      ? d.toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" })
      : d.toLocaleDateString(intl, { month: "short", day: "numeric" });
  };

  return (
    <div className={cn("flex min-h-0 overflow-hidden bg-white text-[#1b2d54]", className)}>
      {showList && (
        <aside className={cn("flex min-h-0 flex-col border-[#eef2f6]", compact ? "w-full" : "w-full max-w-[22rem] shrink-0 border-e", !compact && openId && "max-md:hidden")}>
          <header className="flex items-center gap-2 px-3 pt-3">
            <h2 className="flex-1 text-lg font-bold">{t("Messages")}</h2>
            <button
              type="button"
              onClick={() => setCreating(true)}
              className="flex items-center gap-1.5 rounded-xl bg-[#0f7378] px-3 py-2 text-sm font-semibold text-white"
            >
              <MessageSquarePlus className="size-4" /> {t("New")}
            </button>
            {onClose && (
              <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-9 place-items-center rounded-full hover:bg-[#f2f5f8]">
                <X className="size-5" />
              </button>
            )}
          </header>
          <div className="space-y-2 px-3 py-3">
            <label className="flex items-center gap-2 rounded-xl bg-[#f2f5f8] px-3 py-2">
              <Search className="size-4 text-[#64748b]" aria-hidden />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("Search conversations")} aria-label={t("Search conversations")} className="flex-1 bg-transparent text-sm outline-none" />
            </label>
            <div className="flex gap-1.5" role="group" aria-label={t("Show")}>
              {(["all", "unread", "people", "groups"] as Filter[]).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                  className={cn("rounded-full px-3 py-1 text-xs font-semibold", filter === f ? "bg-[#1b2d54] text-white" : "bg-[#f2f5f8]")}
                >
                  {t(f === "all" ? "All" : f === "unread" ? "Unread" : f === "people" ? "People" : "Groups")}
                </button>
              ))}
            </div>
          </div>
          <ul className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
            {!list && !err && <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />}
            {err && <li role="alert" className="px-3 py-2 text-sm font-semibold text-[#b83232]">{err}</li>}
            {list && visible.length === 0 && (
              <li className="px-4 py-10 text-center text-sm text-[#64748b]">{list.length === 0 ? t("No conversations yet. Start one with New.") : t("Nothing matches.")}</li>
            )}
            {visible.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => open(c.id)}
                  aria-current={c.id === openId}
                  className={cn("flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-start hover:bg-[#f7fafc]", c.id === openId && "bg-[#eef6f6]")}
                >
                  <ConversationAvatar conversation={c} size="size-11" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline gap-2">
                      <span className={cn("min-w-0 flex-1 truncate text-sm", c.unread ? "font-bold" : "font-semibold")}>{title(c)}</span>
                      {c.lastMessage && <span className="shrink-0 text-[0.7rem] text-[#98a2b3]">{when(c.lastMessageUtc)}</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className={cn("min-w-0 flex-1 truncate text-xs", c.unread ? "font-semibold text-[#1b2d54]" : "text-[#64748b]")}>
                        {c.lastMessage
                          ? `${c.lastMessage.sender.id === me ? t("You") + ": " : c.kind !== "direct" ? c.lastMessage.sender.name.split(" ")[0] + ": " : ""}${preview(c.lastMessage)}`
                          : t("No messages yet")}
                      </span>
                      {c.unread > 0 && (
                        <span className="grid min-w-5 place-items-center rounded-full bg-[#e8505b] px-1.5 text-[0.7rem] font-bold text-white" aria-label={t("{n} unread", { n: c.unread })}>
                          {c.unread > 99 ? "99+" : c.unread}
                        </span>
                      )}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </aside>
      )}
      {showThread ? (
        <ChatThread
          key={openId}
          conversationId={openId}
          conversation={current}
          className="min-w-0 flex-1"
          onBack={compact || openId ? () => setOpenId(null) : undefined}
          onClose={compact ? onClose : undefined}
          onOpen={(c) => {
            setList((all) => (all?.some((x) => x.id === c.id) ? all : [c, ...(all ?? [])]));
            open(c.id);
          }}
          onActivity={(m) => bump(m, true)}
        />
      ) : (
        !compact && (
          <div className="grid flex-1 place-items-center bg-[#f7fafc] p-6 text-center max-md:hidden">
            <div>
              <MessageSquarePlus className="mx-auto mb-3 size-10 text-[#0f7378]" aria-hidden />
              <p className="font-bold">{t("Pick a conversation")}</p>
              <p className="mt-1 text-sm text-[#64748b]">{t("Or start a new one with anyone on Junior Hub.")}</p>
            </div>
          </div>
        )
      )}
      {creating && (
        <NewChatDialog
          isAdmin={isAdmin}
          onClose={() => setCreating(false)}
          onOpened={(c) => {
            setCreating(false);
            setList((all) => (all?.some((x) => x.id === c.id) ? all : [c, ...(all ?? [])]));
            open(c.id);
          }}
        />
      )}
    </div>
  );
}

// ---------- A squad's or a class's conversation inside its page ----------

/** The conversation of a squad or a class (or any target), in place: the squad page's chat tab, a class's channel. */
export function EmbeddedChat({ target, className }: { target: ChatTarget; className?: string }) {
  const { t } = useI18n();
  const [id, setId] = useState<string | null | undefined>(undefined);
  const key = JSON.stringify(target);
  useEffect(() => {
    let off = false;
    resolveChatTarget(JSON.parse(key) as ChatTarget).then((x) => !off && setId(x), () => !off && setId(null));
    return () => {
      off = true;
    };
  }, [key]);
  if (id === undefined) return <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />;
  if (id === null) return <p className="py-10 text-center text-sm text-[#64748b]">{t("This chat is not open to you.")}</p>;
  return <ChatThread conversationId={id} className={cn("overflow-hidden rounded-2xl border border-[#eef2f6]", className)} />;
}

/** The messages page of a dashboard: ?c= opens a conversation, ?with= the conversation with a person. */
export function MessagesPage({ conversationId, withUserId, fill }: { conversationId?: string; withUserId?: string; fill?: boolean }) {
  const [start, setStart] = useState<string | null>(conversationId ?? null);
  useEffect(() => {
    if (!conversationId && withUserId) resolveChatTarget({ userId: withUserId }).then(setStart, () => undefined);
  }, [conversationId, withUserId]);
  return (
    <ChatWorkspace
      initialConversationId={start}
      className={
        fill
          ? "min-h-[28rem] flex-1"
          : "h-[calc(100dvh-9rem)] min-h-[28rem] rounded-2xl border border-[#eef2f6] shadow-[0_4px_24px_rgba(20,54,90,0.06)]"
      }
    />
  );
}
