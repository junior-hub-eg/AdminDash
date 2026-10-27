"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import type { ChatMessage } from "@/lib/chat-api";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { MessageBubble } from "@/components/chat/chat-parts";
import { deleteMessage, getConversationMessages } from "./moderation-api";

/** Any conversation's messages for the admins, older ones on request; each message can be deleted. */
export default function ConversationThread({
  conversationId,
  highlightId,
  onChanged,
}: {
  conversationId: string;
  highlightId?: string;
  onChanged?: () => void;
}) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    () =>
      getConversationMessages(conversationId).then(
        (p) => {
          setMessages(p.messages);
          setHasMore(p.hasMore);
        },
        (e) => setErr(errorMessage(e)),
      ),
    [conversationId],
  );
  useEffect(() => {
    void load();
  }, [load]);

  const older = () =>
    messages?.length &&
    getConversationMessages(conversationId, messages[0].createdUtc).then(
      (p) => {
        setMessages((m) => [...p.messages, ...(m ?? [])]);
        setHasMore(p.hasMore);
      },
      (e) => setErr(errorMessage(e)),
    );

  const remove = (m: ChatMessage) => {
    if (!window.confirm(t("Delete this message for everyone in the conversation?"))) return;
    deleteMessage(m.id).then(
      () => {
        setMessages((list) => list?.map((x) => (x.id === m.id ? { ...x, deleted: true, text: null, stickerCode: null, attachments: [] } : x)) ?? null);
        onChanged?.();
      },
      (e) => setErr(errorMessage(e)),
    );
  };

  return (
    <div className="max-h-[28rem] space-y-2 overflow-y-auto rounded-xl border border-[#eef2f6] bg-[#f7fafc] p-3">
      {err && <p role="alert" className="rounded-xl bg-[#fdecec] px-3 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
      {!messages && !err && <LoaderCircle className="mx-auto my-6 size-6 animate-spin text-[#0f7378]" />}
      {hasMore && (
        <button type="button" onClick={() => void older()} className="mx-auto block rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#1b2d54]">
          {t("Older messages")}
        </button>
      )}
      {messages?.length === 0 && <p className="py-6 text-center text-sm text-[#64748b]">{t("No messages yet.")}</p>}
      {messages?.map((m) => (
        <div key={m.id} className={cn(m.id === highlightId && "rounded-xl ring-2 ring-[#e8505b]/50")}>
          <MessageBubble message={m} mine={false} showSender onReply={() => undefined} onDelete={() => remove(m)} />
        </div>
      ))}
    </div>
  );
}
