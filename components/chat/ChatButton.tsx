"use client";

import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MessageCircle } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { getChatUnread, onOpenChat, resolveChatTarget, type ConversationMessageEvent } from "@/lib/chat-api";
import { useI18n } from "@/lib/i18n/client";
import { useLiveChannel } from "@/lib/live-channel";
import { cn } from "@/lib/utils";
import ChatWorkspace, { useMyId } from "./ChatWorkspace";

/**
 * The top bar's chat button (every dashboard, 27 Oct 2026): the unread count, and the whole chat in a side panel. Any
 * page opens it on a conversation with openChat() from lib/chat-api.
 */
export function ChatButton({ className }: { className?: string }) {
  const { t, dir } = useI18n();
  const me = useMyId();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const refresh = useCallback(() => getChatUnread().then((u) => setUnread(u.messages), () => undefined), []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  const live = useLiveChannel({
    ConversationMessage: (e: ConversationMessageEvent) => {
      if (e.message.sender.id !== me && !e.message.deleted && !open) setUnread((n) => n + 1);
    },
  });
  // Without the live channel, look for new messages every 30 seconds.
  useEffect(() => {
    if (live) return;
    const timer = setInterval(() => void refresh(), 30000);
    return () => clearInterval(timer);
  }, [live, refresh]);

  useEffect(
    () =>
      onOpenChat((t) => {
        setErr(null);
        setOpen(true);
        resolveChatTarget(t).then(setTarget, (e) => setErr(errorMessage(e)));
      }),
    [],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    setTarget(null);
    void refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={unread ? t("Messages, {n} unread", { n: unread }) : t("Messages")}
        title={t("Messages")}
        className={cn("relative grid size-[2.4em] place-items-center rounded-full text-current hover:bg-black/5", className)}
      >
        <MessageCircle className="size-[1.15em]" />
        {unread > 0 && (
          <span className="absolute -top-0.5 grid min-w-[1.25em] place-items-center rounded-full bg-[#e8505b] px-1 text-[0.65em] font-bold leading-[1.25em] text-white end-0">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>
      {open &&
        createPortal(
          <div dir={dir} className="fixed inset-0 z-[80] flex justify-end bg-[#0b1b33]/30" onClick={close}>
            <div role="dialog" aria-modal="true" aria-label={t("Messages")} onClick={(e) => e.stopPropagation()} className="flex h-full w-full max-w-[28rem] flex-col bg-white shadow-[0_0_40px_rgba(20,54,90,0.25)]">
              {err && <p role="alert" className="bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
              <ChatWorkspace compact initialConversationId={target} onClose={close} className="min-h-0 flex-1" />
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
