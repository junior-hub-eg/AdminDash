"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { CheckCircle2, Flag, LoaderCircle, MessageSquare, ScanSearch, ShieldAlert, Trash2 } from "lucide-react";
import { errorMessage } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";
import { MessageBubble, PersonAvatar, ROLE_LABELS } from "@/components/chat/chat-parts";
import { AdminSurface, PageHeader, StatCard, StatGrid } from "./page-parts";
import AllConversations from "./moderation/AllConversations";
import ConversationThread from "./moderation/ConversationThread";
import { deleteMessage, getReports, resolveReport, scanOldMessages, type ChatReport } from "./moderation/moderation-api";

/**
 * Chat moderation (27 Oct 2026): the messages people reported and those the safety check flagged (a phone number, an
 * e-mail address or a link outside the platform, since the students are 12 to 18), and every conversation to watch.
 */
export default function AdminChatModeration() {
  const { t, intl } = useI18n();
  const [tab, setTab] = useState<"flags" | "all">("flags");
  const [reports, setReports] = useState<ChatReport[] | null>(null);
  const [openOnly, setOpenOnly] = useState(true);
  const [contextId, setContextId] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(() => getReports(openOnly).then(setReports, (e) => setErr(errorMessage(e))), [openOnly]);
  useEffect(() => {
    void load();
  }, [load]);

  const open = reports?.filter((r) => !r.resolvedUtc) ?? [];
  const automatic = open.filter((r) => r.automatic).length;

  const scan = () => {
    setScanning(true);
    scanOldMessages()
      .then((r) => {
        setNotice(t("{checked} older messages checked, {flagged} flagged.", { checked: r.checked, flagged: r.flagged }));
        void load();
      }, (e) => setErr(errorMessage(e)))
      .finally(() => setScanning(false));
  };

  const remove = (r: ChatReport) => {
    if (!window.confirm(t("Delete this message for everyone in the conversation?"))) return;
    deleteMessage(r.message.id).then(() => void load(), (e) => setErr(errorMessage(e)));
  };

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={t("Safety")}
        title={t("Chat moderation")}
        description={t("Every chat on the platform. Messages with a phone number, an e-mail address or a link outside Junior Hub are flagged automatically; reported ones come here too.")}
        actions={
          <button
            type="button"
            onClick={scan}
            disabled={scanning}
            className="flex items-center gap-2 rounded-xl bg-[#1b2d54] px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {scanning ? <LoaderCircle className="size-4 animate-spin" /> : <ScanSearch className="size-4" />}
            {t("Check older messages")}
          </button>
        }
      />
      <StatGrid>
        <StatCard label={t("Open reports")} value={reports ? String(open.length) : "…"} icon={Flag} tone="amber" />
        <StatCard label={t("Flagged automatically")} value={reports ? String(automatic) : "…"} icon={ShieldAlert} tone="red" />
        <StatCard label={t("Shown")} value={reports ? String(reports.length) : "…"} icon={MessageSquare} tone="cyan" />
      </StatGrid>

      <div role="tablist" className="flex gap-2 border-b border-[#e5eaf0]">
        {(["flags", "all"] as const).map((v) => (
          <button
            key={v}
            type="button"
            role="tab"
            aria-selected={tab === v}
            onClick={() => setTab(v)}
            className={cn("-mb-px border-b-2 px-4 py-2 text-sm font-semibold", tab === v ? "border-[#0f7378] text-[#0f7378]" : "border-transparent text-[#64748b]")}
          >
            {v === "flags" ? t("Flagged and reported") : t("All conversations")}
          </button>
        ))}
      </div>

      {notice && <p role="status" className="rounded-xl bg-[#e7f6f2] px-4 py-2 text-sm font-semibold text-[#0f7378]">{notice}</p>}
      {err && <p role="alert" className="rounded-xl bg-[#fdecec] px-4 py-2 text-sm font-semibold text-[#b83232]">{err}</p>}

      {tab === "all" ? (
        <AllConversations onChanged={() => void load()} />
      ) : (
        <>
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

          {!reports && !err && <LoaderCircle className="mx-auto my-10 size-7 animate-spin text-[#0f7378]" />}
          {reports?.length === 0 && <p className="rounded-2xl bg-white px-4 py-10 text-center text-sm text-[#64748b]">{t("No reported messages.")}</p>}

          <ul className="space-y-3">
            {reports?.map((r) => (
              <li key={r.id} className="rounded-2xl bg-white p-4 shadow-[0_4px_24px_rgba(20,54,90,0.06)]">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-sm text-[#1b2d54]">
                  {r.automatic ? (
                    <span className="grid size-8 place-items-center rounded-full bg-[#fdecec] text-[#e8505b]"><ShieldAlert className="size-4" /></span>
                  ) : (
                    <PersonAvatar person={r.reporter} size="size-8" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="font-semibold">{r.automatic ? t("Flagged automatically") : r.reporter.name}</span>{" "}
                    <span className="text-[#64748b]">
                      {!r.automatic && <>· {t(ROLE_LABELS[r.reporter.role] ?? r.reporter.role)} </>}· {new Date(r.createdUtc).toLocaleString(intl)}
                    </span>
                    <span className="block text-xs text-[#64748b]">{t("In {where}", { where: r.conversationTitle || t("a direct conversation") })}</span>
                  </span>
                  {r.resolvedUtc ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#0f7378]"><CheckCircle2 className="size-4" /> {t("Resolved")}</span>
                  ) : (
                    <span className="flex gap-2">
                      {!r.message.deleted && (
                        <button
                          type="button"
                          onClick={() => remove(r)}
                          className="flex items-center gap-1 rounded-xl bg-[#e8505b] px-3 py-1.5 text-xs font-semibold text-white"
                        >
                          <Trash2 className="size-3.5" /> {t("Delete message")}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => resolveReport(r.id).then(() => void load(), (e) => setErr(errorMessage(e)))}
                        className="rounded-xl bg-[#0f7378] px-3 py-1.5 text-xs font-semibold text-white"
                      >
                        {r.automatic ? t("It is fine") : t("Resolve")}
                      </button>
                    </span>
                  )}
                </div>
                {r.reason && <p className="mb-3 rounded-xl bg-[#fff7e6] px-3 py-2 text-sm text-[#8a5a00]">{t(r.reason)}</p>}
                <div className="rounded-xl bg-[#f7fafc] p-3">
                  <MessageBubble message={r.message} mine={false} showSender onReply={() => undefined} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-sm">
                  <button
                    type="button"
                    onClick={() => setContextId(contextId === r.id ? null : r.id)}
                    className="rounded-xl bg-[#f2f5f8] px-3 py-1.5 font-semibold text-[#1b2d54]"
                  >
                    {contextId === r.id ? t("Hide the conversation") : t("Read the conversation")}
                  </button>
                  <Link href={`/admin/messages?with=${r.message.sender.id}` as Route} className="rounded-xl bg-[#e6f4ff] px-3 py-1.5 font-semibold text-[#1769aa]">
                    {t("Message {name}", { name: r.message.sender.name })}
                  </Link>
                </div>
                {contextId === r.id && (
                  <div className="mt-3">
                    <ConversationThread conversationId={r.conversationId} highlightId={r.message.id} onChanged={() => void load()} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminSurface>
  );
}
