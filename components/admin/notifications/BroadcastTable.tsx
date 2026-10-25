"use client";

import { useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, GraduationCap, LoaderCircle, Megaphone, Monitor, Pencil, Pin, Send, Trash2, Users } from "lucide-react";
import {
  announcementStatus,
  deleteAnnouncement,
  updateAnnouncement,
  type Announcement,
  type AnnouncementAudience,
  type AnnouncementStatus,
} from "@/lib/admin-api";
import { errorMessage } from "@/lib/api-client";
import { useT } from "@/lib/i18n/client";
import { dateLocale, tk } from "@/lib/i18n/translate";
import { PANEL } from "../page-parts";

const PAGE_SIZE = 6;

const AUDIENCE_ICON: Record<AnnouncementAudience, typeof Users> = {
  Everyone: Megaphone,
  Students: GraduationCap,
  Mentors: Users,
  Teachers: BookOpen,
};

const STATUS: Record<AnnouncementStatus, { label: string; style: string }> = {
  live: { label: tk("Delivered"), style: "bg-[#d7efe6] text-[#12676b]" },
  scheduled: { label: tk("Scheduled"), style: "bg-[#dff3fb] text-[#0b6f86]" },
  draft: { label: tk("Draft"), style: "bg-[#fdf0d4] text-[#a8680c]" },
  expired: { label: tk("Expired"), style: "bg-[#eef2f7] text-[#5b6b7c]" },
};

const when = (iso: string) =>
  new Date(iso).toLocaleString(dateLocale("en-US"), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** The announcements: who they are for, how many people that is, status and date, with edit / publish / delete. */
export function BroadcastTable({
  items,
  onEdit,
  onChanged,
  onDeleted,
}: {
  items: Announcement[];
  onEdit: (a: Announcement) => void;
  onChanged: (a: Announcement) => void;
  onDeleted: (id: string) => void;
}) {
  const t = useT();
  const [page, setPage] = useState(1);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const pages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const from = (current - 1) * PAGE_SIZE;
  const visible = items.slice(from, from + PAGE_SIZE);

  async function run(id: string, work: () => Promise<void>) {
    setBusy(id);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(errorMessage(e, tk("We couldn't save the change. Please try again.")));
    } finally {
      setBusy(null);
    }
  }

  const publishNow = (a: Announcement) =>
    run(a.id, async () =>
      onChanged(
        await updateAnnouncement(a.id, {
          title: a.title,
          body: a.body,
          audience: a.audience,
          trackCode: a.trackCode,
          isPinned: a.isPinned,
          expiresUtc: a.expiresUtc,
          isDraft: false,
          publishAtUtc: null,
        }),
      ),
    );

  const remove = (a: Announcement) => {
    if (!window.confirm(t("Delete the announcement \"{title}\"?", { title: a.title }))) return;
    run(a.id, async () => {
      await deleteAnnouncement(a.id);
      onDeleted(a.id);
    });
  };

  return (
    <section className={`${PANEL} min-w-0 overflow-hidden`}>
      {error && <p role="alert" className="bg-[#fdecec] px-[1.1em] py-[0.6em] text-[0.8em] font-semibold text-[#b83232]">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[44em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#eaf1fd] text-[0.8em] font-bold uppercase text-[#14365a]/70">
              {["Notification Title & Topic", "Target Audience", "Channel", "Status & Date"].map((h) => (
                <th key={h} className="px-[1.1em] py-[0.9em] text-start">
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {visible.map((a) => {
              const Icon = AUDIENCE_ICON[a.audience];
              const status = announcementStatus(a);
              const waiting = status === "draft" || status === "scheduled";
              return (
                <tr key={a.id} className="border-b border-[#eef2f6] align-middle last:border-0">
                  <td className="px-[1.1em] py-[1em]">
                    <div className="flex items-center gap-[0.8em]">
                      <span className="grid size-[2.6em] shrink-0 place-items-center rounded-[0.7em] bg-[#e0f6fc] text-[#0b89a6]">
                        <Icon className="size-[1.2em]" />
                      </span>
                      <div className="min-w-0">
                        <b className="flex items-center gap-[0.4em] text-[1.05em] text-[#0b1b2b]">
                          {a.isPinned && <Pin className="size-[0.9em] text-[#d04a4a]" aria-label={t("Pinned")} />}
                          {a.title}
                        </b>
                        <span className="line-clamp-1 text-[0.85em] text-[#8a97a6]">{a.body}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-[1.1em]">
                    <b className="block">{a.trackName ? `${t(a.audience)} · ${a.trackName}` : t(a.audience)}</b>
                    <span className="text-[0.85em] text-[#8a97a6]">{t("{count} people", { count: a.reach })}</span>
                  </td>
                  <td className="px-[1.1em]">
                    <span className="inline-flex items-center gap-[0.4em] rounded-full bg-[#dff3fb] px-[0.7em] py-[0.15em] text-[0.85em] font-semibold text-[#0b6f86]">
                      <Monitor className="size-[0.95em]" />
                      {t("In-App")}
                    </span>
                  </td>
                  <td className="px-[1.1em]">
                    <span className={`inline-block rounded-full px-[0.8em] py-[0.2em] text-[0.85em] font-semibold ${STATUS[status].style}`}>
                      ● {t(STATUS[status].label)}
                    </span>
                    <span className="mt-[0.3em] block text-[0.85em] text-[#8a97a6]">{when(a.publishAtUtc ?? a.createdUtc)}</span>
                    <span className="mt-[0.4em] flex gap-[0.7em] text-[#5b6b7c]">
                      {busy === a.id ? (
                        <LoaderCircle className="size-[1em] animate-spin" />
                      ) : (
                        <>
                          <button type="button" onClick={() => onEdit(a)} aria-label={t("Edit")} title={t("Edit")}>
                            <Pencil className="size-[1em]" />
                          </button>
                          {waiting && (
                            <button type="button" onClick={() => publishNow(a)} aria-label={t("Send now")} title={t("Send now")}>
                              <Send className="size-[1em]" />
                            </button>
                          )}
                          <button type="button" onClick={() => remove(a)} aria-label={t("Delete")} title={t("Delete")} className="text-[#d04a4a]">
                            <Trash2 className="size-[1em]" />
                          </button>
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              );
            })}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="py-[2.5em] text-center text-[#5b6b7c]">
                  {t("No broadcasts match your filters.")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-[0.8em] px-[1.1em] py-[0.9em] text-[0.75em] text-[#5b6b7c]">
        <span>
          {t("Showing {from}-{to} of {total} broadcasts", {
            from: items.length ? from + 1 : 0,
            to: from + visible.length,
            total: items.length,
          })}
        </span>
        <nav aria-label={t("Pagination")} className="flex items-center gap-[0.3em]">
          <button
            type="button"
            aria-label={t("Previous page")}
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40 rtl:rotate-180"
          >
            <ChevronLeft className="size-[1.1em]" />
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setPage(n)}
              aria-current={n === current ? "page" : undefined}
              className={`grid h-[2.2em] min-w-[2.2em] place-items-center rounded-[0.4em] px-[0.5em] font-semibold ${n === current ? "bg-[#06b6d4] text-white" : "text-[#14365a] hover:bg-[#eef3fa]"}`}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            aria-label={t("Next page")}
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
            className="grid size-[2.2em] place-items-center rounded-[0.4em] bg-[#eef3fa] disabled:opacity-40 rtl:rotate-180"
          >
            <ChevronRight className="size-[1.1em]" />
          </button>
        </nav>
      </footer>
    </section>
  );
}
