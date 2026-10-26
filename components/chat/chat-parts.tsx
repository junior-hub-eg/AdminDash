"use client";

import { useEffect, useRef, useState } from "react";
import { Download, FileText, Flag, Megaphone, Paperclip, Reply, Smile, Sticker, Trash2, Users, X, Headset, GraduationCap, Send, LoaderCircle } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { CHARACTERS, EMOTIONS } from "@/lib/avatars";
import {
  CHAT_ACCEPT,
  CHAT_LIMITS,
  attachmentHref,
  stickerSrc,
  type ChatAttachment,
  type ChatContact,
  type ChatMessage,
  type Conversation,
} from "@/lib/chat-api";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";

export const ROLE_LABELS: Record<string, string> = {
  student: tk("Student"),
  mentor: tk("Mentor"),
  teacher: tk("Teacher"),
  admin: tk("Admin"),
};

const AUDIENCE_LABELS: Record<string, string> = {
  everyone: tk("Announcements for everyone"),
  students: tk("Announcements for students"),
  mentors: tk("Announcements for mentors"),
  teachers: tk("Announcements for teachers"),
};

/** The title as the person reads it: support and broadcasts have fixed names. */
export function useConversationTitle() {
  const { t } = useI18n();
  return (c: Conversation) => {
    if (c.kind === "broadcast" && c.audience) return t(AUDIENCE_LABELS[c.audience]);
    if (c.kind === "support" && !c.other) return t("Technical support");
    return c.title;
  };
}

function initials(name: string) {
  return name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function PersonAvatar({ person, size = "size-10" }: { person: Pick<ChatContact, "name" | "photoUrl">; size?: string }) {
  return (
    <span className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#ffd38a] text-sm font-bold text-[#1b2d54]", size)}>
      {person.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={person.photoUrl} alt="" className="size-full object-cover" />
      ) : (
        initials(person.name)
      )}
    </span>
  );
}

/** A conversation's picture: the other person, or an icon for squads, classes, support and broadcasts. */
export function ConversationAvatar({ conversation, size = "size-10" }: { conversation: Conversation; size?: string }) {
  if (conversation.other) return <PersonAvatar person={conversation.other} size={size} />;
  const Icon =
    conversation.kind === "broadcast" ? Megaphone : conversation.kind === "support" ? Headset : conversation.kind === "class" ? GraduationCap : Users;
  const tint =
    conversation.kind === "broadcast"
      ? "bg-[#fde8f1] text-[#b4236a]"
      : conversation.kind === "support"
        ? "bg-[#e6f4ff] text-[#1769aa]"
        : conversation.kind === "class"
          ? "bg-[#fff4d6] text-[#a26a00]"
          : "bg-[#e3f5f1] text-[#0f7378]";
  return (
    <span className={cn("grid shrink-0 place-items-center rounded-full", tint, size)}>
      <Icon className="size-[45%]" aria-hidden />
    </span>
  );
}

export function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** One line about a message, for the list and the reply bar. */
export function useMessagePreview() {
  const { t } = useI18n();
  return (m: Pick<ChatMessage, "kind" | "text" | "deleted"> & { attachments?: ChatAttachment[] }) => {
    if (m.deleted) return t("This message was deleted");
    if (m.kind === "sticker") return t("Sticker");
    if (m.kind === "image") return m.text || t("Photo");
    if (m.kind === "file") return m.text || (m.attachments?.map((a) => a.fileName).join(", ") ?? t("File"));
    return m.text ?? "";
  };
}

function Attachments({ files, mine }: { files: ChatAttachment[]; mine: boolean }) {
  const { t } = useI18n();
  const [zoom, setZoom] = useState<ChatAttachment | null>(null);
  const images = files.filter((f) => f.isImage);
  const others = files.filter((f) => !f.isImage);
  return (
    <div className="space-y-1.5">
      {images.length > 0 && (
        <div className={cn("grid gap-1.5", images.length > 1 && "grid-cols-2")}>
          {images.map((f) => (
            <button key={f.id} type="button" onClick={() => setZoom(f)} className="overflow-hidden rounded-xl bg-black/5" aria-label={t("Open {name}", { name: f.fileName })}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={attachmentHref(f)} alt={f.fileName} loading="lazy" className="max-h-64 w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {others.map((f) => (
        <a
          key={f.id}
          href={attachmentHref(f, true)}
          className={cn("flex items-center gap-2 rounded-xl px-2.5 py-2 text-start", mine ? "bg-white/10 hover:bg-white/20" : "bg-[#f2f5f8] hover:bg-[#e8eef4]")}
        >
          <FileText className="size-5 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{f.fileName}</span>
            <span className={cn("block text-xs", mine ? "text-white/60" : "text-[#64748b]")}>{formatSize(f.sizeBytes)}</span>
          </span>
          <Download className="size-4 shrink-0" aria-label={t("Download")} />
        </a>
      ))}
      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={zoom.fileName} className="fixed inset-0 z-[95] grid place-items-center bg-black/80 p-4" onClick={() => setZoom(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={attachmentHref(zoom)} alt={zoom.fileName} className="max-h-[85vh] max-w-full rounded-xl object-contain" />
          <div className="absolute top-4 flex gap-2 end-4">
            <a href={attachmentHref(zoom, true)} onClick={(e) => e.stopPropagation()} className="grid size-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={t("Download")}>
              <Download className="size-5" />
            </a>
            <button type="button" className="grid size-10 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25" aria-label={t("Close")}>
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

interface BubbleProps {
  message: ChatMessage;
  mine: boolean;
  showSender: boolean;
  onReply: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

export function MessageBubble({ message: m, mine, showSender, onReply, onDelete, onReport }: BubbleProps) {
  const { t, intl } = useI18n();
  const preview = useMessagePreview();
  const time = new Date(m.createdUtc).toLocaleTimeString(intl, { hour: "numeric", minute: "2-digit" });
  const sticker = m.kind === "sticker" && !m.deleted && m.stickerCode;
  return (
    <div className={cn("group flex items-end gap-2", mine ? "flex-row-reverse" : "flex-row")}>
      {!mine && (showSender ? <PersonAvatar person={m.sender} size="size-8" /> : <span className="w-8 shrink-0" />)}
      <div className={cn("flex max-w-[78%] flex-col", mine ? "items-end" : "items-start")}>
        {!mine && showSender && (
          <span className="mb-0.5 px-1 text-xs font-semibold text-[#64748b]">
            {m.sender.name} <span className="font-normal">· {t(ROLE_LABELS[m.sender.role] ?? m.sender.role)}</span>
          </span>
        )}
        <div
          className={cn(
            "break-words text-sm",
            sticker ? "" : "rounded-2xl px-3 py-2",
            !sticker && (mine ? "rounded-ee-sm bg-[#1b2d54] text-white" : "rounded-es-sm bg-white text-[#1b2d54] shadow-sm"),
            m.deleted && "italic opacity-70",
          )}
        >
          {m.replyTo && !m.deleted && (
            <span className={cn("mb-1.5 block border-s-2 ps-2 text-xs", mine ? "border-white/50 text-white/75" : "border-[#0f7378] text-[#64748b]")}>
              <span className="block font-semibold">{m.replyTo.senderName}</span>
              <span className="line-clamp-2">{preview({ kind: m.replyTo.kind, text: m.replyTo.text, deleted: false })}</span>
            </span>
          )}
          {m.deleted ? (
            t("This message was deleted")
          ) : sticker ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={stickerSrc(sticker)} alt={t("Sticker")} className="size-28 object-contain" />
          ) : (
            <>
              {m.attachments.length > 0 && <Attachments files={m.attachments} mine={mine} />}
              {m.text && <p className={cn("whitespace-pre-wrap", m.attachments.length > 0 && "mt-1.5")}>{m.text}</p>}
            </>
          )}
          <span className={cn("mt-1 block text-[0.7rem]", sticker ? "text-[#98a2b3]" : mine ? "text-white/60" : "text-[#98a2b3]")}>{time}</span>
        </div>
      </div>
      {!m.deleted && (
        <div className="flex shrink-0 gap-0.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <IconAction label={t("Reply")} onClick={onReply}><Reply className="size-4 rtl:-scale-x-100" /></IconAction>
          {onDelete && <IconAction label={t("Delete")} onClick={onDelete}><Trash2 className="size-4" /></IconAction>}
          {onReport && <IconAction label={t("Report")} onClick={onReport}><Flag className="size-4" /></IconAction>}
        </div>
      )}
    </div>
  );
}

function IconAction({ label, onClick, children }: { label: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-label={label} title={label} className="grid size-7 place-items-center rounded-full text-[#64748b] hover:bg-white hover:text-[#1b2d54]">
      {children}
    </button>
  );
}

const EMOJI = [
  "😀", "😁", "😂", "🤣", "😊", "😍", "🥰", "😎", "🤩", "🤔", "😅", "😇", "🙂", "😉", "😴", "😢", "😭", "😡", "😱", "🥳",
  "👍", "👎", "👏", "🙌", "🙏", "💪", "👋", "🤝", "✌️", "👌", "❤️", "💙", "💚", "💛", "🔥", "⭐", "✨", "🎉", "🎯", "🏆",
  "✅", "❌", "❓", "❗", "💡", "📚", "📝", "💻", "🚀", "🎨", "🧠", "⏰", "📅", "📎", "🐞", "🤖", "🎮", "⚽", "☕", "🍕",
];

function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const { t } = useI18n();
  return (
    <div role="listbox" aria-label={t("Emoji")} className="grid grid-cols-10 gap-0.5 p-2">
      {EMOJI.map((e) => (
        <button key={e} type="button" onClick={() => onPick(e)} className="grid size-8 place-items-center rounded-lg text-xl hover:bg-[#f2f5f8]">
          {e}
        </button>
      ))}
    </div>
  );
}

function StickerPicker({ onPick }: { onPick: (code: string) => void }) {
  const { t } = useI18n();
  const [character, setCharacter] = useState(CHARACTERS[0].id);
  return (
    <div className="p-2">
      <div className="mb-2 flex gap-1 overflow-x-auto pb-1">
        {CHARACTERS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setCharacter(c.id)}
            aria-pressed={character === c.id}
            aria-label={t(c.label)}
            className={cn("size-9 shrink-0 overflow-hidden rounded-full border-2", character === c.id ? "border-[#0f7378]" : "border-transparent")}
            style={{ background: c.bg }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerSrc(`${c.id}-smile`)} alt="" className="size-full object-cover" />
          </button>
        ))}
      </div>
      <div className="grid max-h-56 grid-cols-4 gap-1 overflow-y-auto">
        {EMOTIONS.map((e) => (
          <button key={e.id} type="button" onClick={() => onPick(`${character}-${e.id}`)} aria-label={t(e.label)} title={t(e.label)} className="rounded-xl p-1 hover:bg-[#f2f5f8]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerSrc(`${character}-${e.id}`)} alt="" loading="lazy" className="aspect-square w-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}

interface ComposerProps {
  replyTo: ChatMessage | null;
  onCancelReply: () => void;
  onSendText: (text: string) => Promise<void>;
  onSendSticker: (code: string) => Promise<void>;
  onSendFiles: (files: File[], text: string) => Promise<void>;
}

/** Text, emoji, a sticker, or up to 5 files (picked, pasted or dropped) with a caption. */
export function Composer({ replyTo, onCancelReply, onSendText, onSendSticker, onSendFiles }: ComposerProps) {
  const { t } = useI18n();
  const preview = useMessagePreview();
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [panel, setPanel] = useState<"emoji" | "sticker" | null>(null);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const input = useRef<HTMLTextAreaElement>(null);
  const picker = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (replyTo) input.current?.focus();
  }, [replyTo]);

  const addFiles = (list: FileList | File[]) => {
    const picked = Array.from(list);
    for (const f of picked) {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      const image = CHAT_LIMITS.imageTypes.includes(ext);
      if (!image && !CHAT_LIMITS.fileTypes.includes(ext)) {
        setProblem(t("{name} cannot be sent: send pictures (jpg, png, webp, gif), PDF, Office, text or zip files.", { name: f.name }));
        return;
      }
      if (f.size > (image ? CHAT_LIMITS.imageBytes : CHAT_LIMITS.fileBytes)) {
        setProblem(t("{name} is too large: up to {mb} MB.", { name: f.name, mb: image ? 5 : 10 }));
        return;
      }
    }
    setProblem(null);
    setFiles((now) => [...now, ...picked].slice(0, CHAT_LIMITS.files));
  };

  const run = async (job: () => Promise<void>) => {
    setBusy(true);
    setProblem(null);
    try {
      await job();
    } catch (e) {
      setProblem(errorMessage(e));
    } finally {
      setBusy(false);
    }
  };

  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (busy) return;
    const body = text.trim();
    if (files.length > 0)
      void run(async () => {
        await onSendFiles(files, body);
        setFiles([]);
        setText("");
      });
    else if (body)
      void run(async () => {
        await onSendText(body);
        setText("");
      });
  };

  return (
    <div
      className={cn("relative border-t border-[#eef2f6] bg-white", dragging && "ring-2 ring-inset ring-[#0f7378]")}
      onDragOver={(e) => {
        if (e.dataTransfer.types.includes("Files")) {
          e.preventDefault();
          setDragging(true);
        }
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
      }}
    >
      {replyTo && (
        <div className="flex items-center gap-2 border-b border-[#eef2f6] bg-[#f7fafc] px-3 py-2 text-xs">
          <Reply className="size-4 shrink-0 text-[#0f7378] rtl:-scale-x-100" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block font-semibold text-[#1b2d54]">{t("Replying to {name}", { name: replyTo.sender.name })}</span>
            <span className="block truncate text-[#64748b]">{preview(replyTo)}</span>
          </span>
          <button type="button" onClick={onCancelReply} aria-label={t("Cancel reply")} className="grid size-7 place-items-center rounded-full hover:bg-white">
            <X className="size-4" />
          </button>
        </div>
      )}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-[#eef2f6] px-3 py-2">
          {files.map((f, i) => (
            <span key={`${f.name}-${i}`} className="flex max-w-[12rem] items-center gap-1.5 rounded-lg bg-[#f2f5f8] px-2 py-1 text-xs">
              <Paperclip className="size-3.5 shrink-0" aria-hidden />
              <span className="truncate">{f.name}</span>
              <span className="text-[#64748b]">{formatSize(f.size)}</span>
              <button type="button" onClick={() => setFiles((all) => all.filter((_, j) => j !== i))} aria-label={t("Remove {name}", { name: f.name })}>
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
      {problem && <p role="alert" className="bg-[#fdecec] px-3 py-2 text-sm font-semibold text-[#b83232]">{problem}</p>}
      {panel && (
        <div className="absolute bottom-full z-10 mb-2 w-[min(22rem,calc(100%-1rem))] rounded-2xl border border-[#eef2f6] bg-white shadow-[0_10px_40px_rgba(20,54,90,0.2)] start-2">
          {panel === "emoji" ? (
            <EmojiPicker
              onPick={(e) => {
                setText((v) => v + e);
                input.current?.focus();
              }}
            />
          ) : (
            <StickerPicker
              onPick={(code) => {
                setPanel(null);
                void run(() => onSendSticker(code));
              }}
            />
          )}
        </div>
      )}
      <form onSubmit={submit} className="flex items-end gap-1.5 p-2.5">
        <ToolButton label={t("Emoji")} active={panel === "emoji"} onClick={() => setPanel((p) => (p === "emoji" ? null : "emoji"))}>
          <Smile className="size-5" />
        </ToolButton>
        <ToolButton label={t("Stickers")} active={panel === "sticker"} onClick={() => setPanel((p) => (p === "sticker" ? null : "sticker"))}>
          <Sticker className="size-5" />
        </ToolButton>
        <ToolButton label={t("Attach files")} onClick={() => picker.current?.click()}>
          <Paperclip className="size-5" />
        </ToolButton>
        <input
          ref={picker}
          type="file"
          multiple
          accept={CHAT_ACCEPT}
          className="hidden"
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <textarea
          ref={input}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onFocus={() => setPanel((p) => (p === "sticker" ? null : p))}
          onPaste={(e) => {
            if (e.clipboardData.files.length) {
              e.preventDefault();
              addFiles(e.clipboardData.files);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) submit(e);
          }}
          rows={1}
          maxLength={CHAT_LIMITS.text}
          placeholder={files.length ? t("Add a caption...") : t("Write a message...")}
          aria-label={t("Message")}
          className="max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-[#e1e8f0] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f7378]/30"
        />
        <button
          type="submit"
          disabled={busy || (!text.trim() && files.length === 0)}
          aria-label={t("Send")}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#0f7378] text-white disabled:opacity-50"
        >
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4 rtl:-scale-x-100" />}
        </button>
      </form>
    </div>
  );
}

function ToolButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-pressed={active}
      className={cn("grid size-10 shrink-0 place-items-center rounded-xl text-[#64748b] hover:bg-[#f2f5f8] hover:text-[#1b2d54]", active && "bg-[#e3f5f1] text-[#0f7378]")}
    >
      {children}
    </button>
  );
}
