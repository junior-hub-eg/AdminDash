"use client";

import { useEffect, useState } from "react";
import { Check, Headset, LoaderCircle, Megaphone, Search, Users, X } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import {
  createGroupChat,
  openBroadcast,
  openSupportChat,
  searchChatPeople,
  startDirectChat,
  type BroadcastAudience,
  type ChatContact,
  type ChatRole,
  type Conversation,
} from "@/lib/chat-api";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { PersonAvatar, ROLE_LABELS } from "./chat-parts";

const ROLES: ("" | ChatRole)[] = ["", "student", "mentor", "teacher", "admin"];

const AUDIENCES: { id: BroadcastAudience; label: string }[] = [
  { id: "everyone", label: "Everyone" },
  { id: "students", label: "All students" },
  { id: "mentors", label: "All mentors" },
  { id: "teachers", label: "All teachers" },
];

interface Props {
  isAdmin: boolean;
  onOpened: (conversation: Conversation) => void;
  onClose: () => void;
}

/** Start a conversation with anyone, make a group, ask technical support, or (admins) broadcast. */
export default function NewChatDialog({ isAdmin, onOpened, onClose }: Props) {
  const { t, dir } = useI18n();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<"" | ChatRole>("");
  const [people, setPeople] = useState<ChatContact[] | null>(null);
  const [group, setGroup] = useState<ChatContact[] | null>(null);
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchChatPeople(query.trim(), role).then(setPeople, (e) => setErr(errorMessage(e)));
    }, 250);
    return () => clearTimeout(timer);
  }, [query, role]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const open = (job: () => Promise<Conversation>) => {
    setBusy(true);
    setErr(null);
    job().then(onOpened, (e) => {
      setErr(errorMessage(e));
      setBusy(false);
    });
  };

  const toggle = (p: ChatContact) =>
    setGroup((g) => (g?.some((x) => x.id === p.id) ? g.filter((x) => x.id !== p.id) : [...(g ?? []), p]));

  return (
    <div dir={dir} className="fixed inset-0 z-[90] grid place-items-center bg-[#0b1b33]/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("New conversation")}
        onClick={(e) => e.stopPropagation()}
        className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white text-[#1b2d54] shadow-2xl"
      >
        <header className="flex items-center gap-3 border-b border-[#eef2f6] px-4 py-3">
          <h2 className="flex-1 text-base font-bold">{group ? t("New group") : t("New conversation")}</h2>
          <button type="button" onClick={onClose} aria-label={t("Close")} className="grid size-9 place-items-center rounded-full hover:bg-[#f2f5f8]">
            <X className="size-5" />
          </button>
        </header>

        {!group && (
          <div className="flex flex-wrap gap-2 border-b border-[#eef2f6] px-4 py-3">
            {!isAdmin && (
              <button type="button" disabled={busy} onClick={() => open(openSupportChat)} className="flex items-center gap-1.5 rounded-full bg-[#e6f4ff] px-3 py-1.5 text-sm font-semibold text-[#1769aa]">
                <Headset className="size-4" /> {t("Technical support")}
              </button>
            )}
            <button type="button" onClick={() => setGroup([])} className="flex items-center gap-1.5 rounded-full bg-[#e3f5f1] px-3 py-1.5 text-sm font-semibold text-[#0f7378]">
              <Users className="size-4" /> {t("New group")}
            </button>
            {isAdmin &&
              AUDIENCES.map((a) => (
                <button key={a.id} type="button" disabled={busy} onClick={() => open(() => openBroadcast(a.id))} className="flex items-center gap-1.5 rounded-full bg-[#fde8f1] px-3 py-1.5 text-sm font-semibold text-[#b4236a]">
                  <Megaphone className="size-4" /> {t("Broadcast: {audience}", { audience: t(a.label) })}
                </button>
              ))}
          </div>
        )}

        {group && (
          <div className="space-y-2 border-b border-[#eef2f6] px-4 py-3">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder={t("Group name")}
              aria-label={t("Group name")}
              className="w-full rounded-xl border border-[#e1e8f0] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0f7378]/30"
            />
            {group.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {group.map((p) => (
                  <span key={p.id} className="flex items-center gap-1 rounded-full bg-[#f2f5f8] py-0.5 ps-2.5 pe-1 text-xs font-semibold">
                    {p.name}
                    <button type="button" onClick={() => toggle(p)} aria-label={t("Remove {name}", { name: p.name })} className="grid size-5 place-items-center rounded-full hover:bg-white">
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="space-y-2 px-4 pt-3">
          <label className="flex items-center gap-2 rounded-xl border border-[#e1e8f0] px-3 py-2 focus-within:ring-2 focus-within:ring-[#0f7378]/30">
            <Search className="size-4 text-[#64748b]" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search by name or email")}
              aria-label={t("Search by name or email")}
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </label>
          <div className="flex flex-wrap gap-1.5" role="group" aria-label={t("Role")}>
            {ROLES.map((r) => (
              <button
                key={r || "all"}
                type="button"
                onClick={() => setRole(r)}
                aria-pressed={role === r}
                className={cn("rounded-full px-3 py-1 text-xs font-semibold", role === r ? "bg-[#1b2d54] text-white" : "bg-[#f2f5f8] text-[#1b2d54]")}
              >
                {r ? t(ROLE_LABELS[r]) : t("Everyone")}
              </button>
            ))}
          </div>
        </div>

        <ul className="flex-1 overflow-y-auto px-2 py-2">
          {!people && <LoaderCircle className="mx-auto my-6 size-6 animate-spin text-[#0f7378]" />}
          {people?.length === 0 && <li className="py-6 text-center text-sm text-[#64748b]">{t("No one found.")}</li>}
          {people?.map((p) => {
            const picked = group?.some((x) => x.id === p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => (group ? toggle(p) : open(() => startDirectChat(p.id)))}
                  className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-start hover:bg-[#f7fafc]"
                >
                  <PersonAvatar person={p} size="size-9" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{p.name}</span>
                    <span className="block text-xs text-[#64748b]">{t(ROLE_LABELS[p.role] ?? p.role)}</span>
                  </span>
                  {group && (
                    <span className={cn("grid size-6 place-items-center rounded-full border", picked ? "border-[#0f7378] bg-[#0f7378] text-white" : "border-[#cbd5e1]")}>
                      {picked && <Check className="size-4" />}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>

        {err && <p role="alert" className="bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
        {group && (
          <footer className="flex justify-end gap-2 border-t border-[#eef2f6] px-4 py-3">
            <button type="button" onClick={() => setGroup(null)} className="rounded-xl px-4 py-2 text-sm font-semibold hover:bg-[#f2f5f8]">
              {t("Back")}
            </button>
            <button
              type="button"
              disabled={busy || group.length < 2 || !title.trim()}
              onClick={() => open(() => createGroupChat(title.trim(), group.map((p) => p.id)))}
              className="rounded-xl bg-[#0f7378] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              {t("Create group")}
            </button>
          </footer>
        )}
      </div>
    </div>
  );
}
