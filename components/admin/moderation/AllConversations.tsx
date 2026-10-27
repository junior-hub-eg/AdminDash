"use client";

import { useCallback, useEffect, useState } from "react";
import { Flag, LoaderCircle, Search } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { tk } from "@/lib/i18n/translate";
import { cn } from "@/lib/utils";
import { PersonAvatar, useMessagePreview } from "@/components/chat/chat-parts";
import ConversationThread from "./ConversationThread";
import { CONVERSATION_KINDS, getConversations, type AdminConversation } from "./moderation-api";

const KIND_LABELS: Record<string, string> = {
  direct: tk("Direct"),
  group: tk("Group"),
  squad: tk("Squad"),
  class: tk("Class"),
  support: tk("Technical support"),
  broadcast: tk("Broadcast"),
};

/** Every conversation on the platform, by kind, member or title; the admin opens any of them and deletes messages. */
export default function AllConversations({ onChanged }: { onChanged: () => void }) {
  const { t, intl } = useI18n();
  const preview = useMessagePreview();
  const [kind, setKind] = useState("");
  const [query, setQuery] = useState("");
  const [q, setQ] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<{ items: AdminConversation[]; total: number } | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(
    () => getConversations({ kind, q, flaggedOnly, page }).then(setData, (e) => setErr(errorMessage(e))),
    [kind, q, flaggedOnly, page],
  );
  useEffect(() => {
    void load();
  }, [load]);

  const pages = data ? Math.max(1, Math.ceil(data.total / 20)) : 1;

  return (
    <div className="space-y-4">
      <form
        className="flex flex-wrap items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          setQ(query);
        }}
      >
        <label className="flex min-w-60 flex-1 items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm shadow-sm">
          <Search className="size-4 text-[#64748b]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("A member's name or e-mail, or a group's name")}
            className="w-full bg-transparent outline-none"
          />
        </label>
        <select
          value={kind}
          onChange={(e) => {
            setPage(1);
            setKind(e.target.value);
          }}
          aria-label={t("Kind")}
          className="rounded-xl bg-white px-3 py-2 text-sm text-[#1b2d54] shadow-sm"
        >
          <option value="">{t("All kinds")}</option>
          {CONVERSATION_KINDS.map((k) => (
            <option key={k} value={k}>{t(KIND_LABELS[k])}</option>
          ))}
        </select>
        <button
          type="button"
          aria-pressed={flaggedOnly}
          onClick={() => {
            setPage(1);
            setFlaggedOnly((v) => !v);
          }}
          className={cn("flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold shadow-sm", flaggedOnly ? "bg-[#e8505b] text-white" : "bg-white text-[#1b2d54]")}
        >
          <Flag className="size-4" /> {t("Flagged only")}
        </button>
      </form>

      {err && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
      {!data && !err && <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />}
      {data?.items.length === 0 && <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-[#64748b]">{t("No conversations match.")}</p>}

      <ul className="space-y-3">
        {data?.items.map((c) => (
          <li key={c.id} className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(20,54,90,0.06)]">
            <button type="button" onClick={() => setOpenId(openId === c.id ? null : c.id)} className="flex w-full flex-wrap items-center gap-3 text-start">
              <span className="flex -space-x-2 rtl:space-x-reverse">
                {c.members.slice(0, 4).map((m) => (
                  <span key={m.id} className="rounded-full ring-2 ring-white"><PersonAvatar person={m} size="size-8" /></span>
                ))}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-[#1b2d54]">{c.title}</span>
                <span className="block truncate text-xs text-[#64748b]">
                  {t(KIND_LABELS[c.kind] ?? c.kind)} · {t("{n} members", { n: c.memberCount })}
                  {c.lastMessage && <> · {preview(c.lastMessage)} · {new Date(c.lastMessageUtc).toLocaleString(intl)}</>}
                </span>
              </span>
              {c.openFlags > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-[#fdecec] px-2.5 py-1 text-xs font-semibold text-[#b83232]">
                  <Flag className="size-3.5" /> {t("{n} flagged", { n: c.openFlags })}
                </span>
              )}
            </button>
            {openId === c.id && (
              <div className="mt-3">
                <ConversationThread
                  conversationId={c.id}
                  onChanged={() => {
                    void load();
                    onChanged();
                  }}
                />
              </div>
            )}
          </li>
        ))}
      </ul>

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 text-sm text-[#1b2d54]">
          <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)} className="rounded-xl bg-white px-3 py-1.5 font-semibold disabled:opacity-40">
            {t("Previous")}
          </button>
          <span>{t("Page {page} of {pages}", { page, pages })}</span>
          <button type="button" disabled={page >= pages} onClick={() => setPage((p) => p + 1)} className="rounded-xl bg-white px-3 py-1.5 font-semibold disabled:opacity-40">
            {t("Next")}
          </button>
        </div>
      )}
    </div>
  );
}
