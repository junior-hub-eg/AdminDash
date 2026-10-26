"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Flag, LoaderCircle, MessageSquare } from "lucide-react";
import { api, errorMessage } from "@/lib/api-client";
import type { ChatContact, ChatMessage } from "@/lib/chat-api";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { MessageBubble, PersonAvatar, ROLE_LABELS } from "@/components/chat/chat-parts";
import { AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";

interface ChatReport {
  id: string;
  message: ChatMessage;
  conversationKind: string;
  conversationTitle: string;
  reporter: ChatContact;
  reason: string | null;
  createdUtc: string;
  resolvedUtc: string | null;
}

const getReports = (openOnly: boolean) => api.get<ChatReport[]>(`/api/v1/admin/chat/reports?openOnly=${openOnly}`);
const resolveReport = (id: string) => api.post<void>(`/api/v1/admin/chat/reports/${id}/resolve`);
const getConversationMessages = (id: string) => api.get<{ messages: ChatMessage[] }>(`/api/v1/admin/chat/conversations/${id}/messages?take=30`);

/** Chat moderation (27 Oct 2026): the messages people reported, with their conversation, until an admin resolves them. */
export default function AdminChatModeration() {
  const { t, intl } = useI18n();
  const [reports, setReports] = useState<ChatReport[] | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [context, setContext] = useState<{ id: string; messages: ChatMessage[] } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => getReports(openOnly).then(setReports, (e) => setErr(errorMessage(e))), [openOnly]);
  useEffect(() => {
    void load();
  }, [load]);

  const open = reports?.filter((r) => !r.resolvedUtc).length ?? 0;

  return (
    <AdminSurface>
      <PageHeader eyebrow={t("Safety")} title={t("Chat moderation")} description={t("Messages that students, mentors or teachers reported. Read the conversation, then resolve the report.")} />
      <StatGrid>
        <StatCard label={t("Open reports")} value={reports ? String(open) : "…"} icon={Flag} tone="amber" />
        <StatCard label={t("Shown")} value={reports ? String(reports.length) : "…"} icon={MessageSquare} tone="cyan" />
      </StatGrid>

      <div className="flex gap-2">
        {[true, false].map((v) => (
          <button
            key={String(v)}
            type="button"
            aria-pressed={openOnly === v}
            onClick={() => setOpenOnly(v)}
            className={cn("rounded-full px-4 py-1.5 text-sm font-semibold", openOnly === v ? "bg-[#1b2d54] text-white" : "bg-white text-[#1b2d54]")}
          >
            {v ? t("Open") : t("All reports")}
          </button>
        ))}
      </div>

      {err && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}
      {!reports && !err && <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />}
      {reports?.length === 0 && <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-[#64748b]">{t("No reported messages.")}</p>}

      <ul className="space-y-3">
        {reports?.map((r) => (
          <li key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(20,54,90,0.06)]">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#1b2d54]">
              <PersonAvatar person={r.reporter} size="size-8" />
              <span className="min-w-0 flex-1">
                <span className="font-semibold">{r.reporter.name}</span>{" "}
                <span className="text-[#64748b]">· {t(ROLE_LABELS[r.reporter.role] ?? r.reporter.role)} · {new Date(r.createdUtc).toLocaleString(intl)}</span>
                <span className="block text-xs text-[#64748b]">{t("In {where}", { where: r.conversationTitle || t("a direct conversation") })}</span>
              </span>
              {r.resolvedUtc ? (
                <span className="flex items-center gap-1 text-xs font-semibold text-[#0f7378]"><CheckCircle2 className="size-4" /> {t("Resolved")}</span>
              ) : (
                <button
                  type="button"
                  onClick={() => resolveReport(r.id).then(() => void load(), (e) => setErr(errorMessage(e)))}
                  className="rounded-xl bg-[#0f7378] px-3 py-1.5 text-xs font-semibold text-white"
                >
                  {t("Resolve")}
                </button>
              )}
            </div>
            {r.reason && <p className="mb-3 rounded-xl bg-[#fff7e6] px-3 py-2 text-sm text-[#8a5a00]">{r.reason}</p>}
            <div className="rounded-xl bg-[#f7fafc] p-3">
              <MessageBubble message={r.message} mine={false} showSender onReply={() => undefined} />
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                onClick={() =>
                  context?.id === r.id
                    ? setContext(null)
                    : getConversationMessages(r.message.conversationId).then((p) => setContext({ id: r.id, messages: p.messages }), (e) => setErr(errorMessage(e)))
                }
                className="rounded-xl bg-[#f2f5f8] px-3 py-1.5 font-semibold text-[#1b2d54]"
              >
                {context?.id === r.id ? t("Hide the conversation") : t("Read the conversation")}
              </button>
              <Link href={`/admin/messages?with=${r.message.sender.id}` as Route} className="rounded-xl bg-[#e6f4ff] px-3 py-1.5 font-semibold text-[#1769aa]">
                {t("Message {name}", { name: r.message.sender.name })}
              </Link>
            </div>
            {context?.id === r.id && (
              <div className="mt-3 max-h-96 space-y-2 overflow-y-auto rounded-xl border border-[#eef2f6] p-3">
                {context.messages.map((m) => (
                  <div key={m.id} className={cn(m.id === r.message.id && "rounded-xl ring-2 ring-[#e8505b]/50")}>
                    <MessageBubble message={m} mine={false} showSender onReply={() => undefined} />
                  </div>
                ))}
              </div>
            )}
          </li>
        ))}
      </ul>
    </AdminSurface>
  );
}
