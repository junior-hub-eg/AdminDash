"use client";

import { useState } from "react";
import { BookOpen, GraduationCap, LoaderCircle, Megaphone, Monitor, Pencil, Pin, Send, Users, X } from "lucide-react";
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

const PAGE_SIZE = 5;

const AUDIENCE_ICON: Record<AnnouncementAudience, { icon: typeof Users; tone: string }> = {
  Everyone: { icon: Megaphone, tone: "bg-[#e6eefb] text-[#14365a]" },
  Students: { icon: GraduationCap, tone: "bg-[#e0f6fc] text-[#0b89a6]" },
  Mentors: { icon: Users, tone: "bg-[#dff7ea] text-[#17935f]" },
  Teachers: { icon: BookOpen, tone: "bg-[#ece8fd] text-[#6a52d9]" },
};

const STATUS: Record<AnnouncementStatus, { label: string; style: string }> = {
  live: { label: tk("Delivered"), style: "bg-[#d7f3e8] text-[#12676b]" },
  scheduled: { label: tk("Scheduled"), style: "bg-[#dff3fb] text-[#0b6f86]" },
  draft: { label: tk("Draft"), style: "bg-[#fdf0d4] text-[#a8680c]" },
  expired: { label: tk("Expired"), style: "bg-[#eef2f7] text-[#5b6b7c]" },
};

const when = (iso: string) =>
  new Date(iso).toLocaleString(dateLocale("en-US"), { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

/** 1 2 3 … 9 style page list. */
function pageList(page: number, count: number): (number | "gap")[] {
  if (count <= 5) return Array.from({ length: count }, (_, i) => i + 1);
  const near = new Set([1, count, page - 1, page, page + 1]);
  const out: (number | "gap")[] = [];
  for (let i = 1; i <= count; i++) {
    if (near.has(i)) out.push(i);
    else if (out[out.length - 1] !== "gap") out.push("gap");
  }
  return out;
}

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

  const pager = "grid h-[2.3em] min-w-[2.3em] place-items-center rounded-[0.5em] px-[0.6em] font-semibold";

  return (
    <section className={`${PANEL} min-w-0 overflow-hidden`}>
      {error && <p role="alert" className="bg-[#fdecec] px-[1.1em] py-[0.6em] text-[0.8em] font-semibold text-[#b83232]">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[46em] text-start text-[0.8em]">
          <thead>
            <tr className="bg-[#eaf1fd] text-[0.78em] font-semibold uppercase tracking-[0.04em] text-[#3d4f61]">
              {["Notification Title & Topic", "Target Audience", "Channel", "Status & Date"].map((h) => (
                <th key={h} className="px-[1.3em] py-[1.1em] text-start">
                  {t(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="text-[#14365a]">
            {visible.map((a) => {
              const { icon: Icon, tone } = AUDIENCE_ICON[a.audience];
              const status = announcementStatus(a);
              const waiting = status === "draft" || status === "scheduled";
              return (
                <tr key={a.id} className="border-b border-[#eef2f6] align-middle last:border-0">
                  <td className="max-w-[20em] px-[1.3em] py-[1.4em]">
                    <div className="flex items-start gap-[0.9em]">
                      <span className={`grid size-[2.6em] shrink-0 place-items-center rounded-[0.7em] ${tone}`}>
                        <Icon className="size-[1.2em]" />
                      </span>
                      <div className="min-w-0">
                        <b className="flex items-center gap-[0.4em] text-[1.2em] font-semibold text-[#0b1b2b]">
                          {a.isPinned && <Pin className="size-[0.8em] shrink-0 text-[#d04a4a]" aria-label={t("Pinned")} />}
                          <span className="truncate" title={a.title}>
                            {a.title}
                          </span>
                        </b>
                        <span className="mt-[0.2em] flex flex-wrap items-center gap-x-[0.5em] text-[0.9em] text-[#5b6b7c]">
                          <span className="line-clamp-1 max-w-[14em]">{a.isPinned ? t("Pinned") : a.trackName ? `${t("Tag")}: ${a.trackName}` : t(a.audience)}</span>
                          <span aria-hidden>•</span>
                          <span dir="ltr">ID: #{a.id.slice(0, 8).toUpperCase()}</span>
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-[1.3em]">
                    <span className="block font-medium text-[#0b1b2b]">{a.trackName ? `${t(a.audience)} · ${a.trackName}` : t(a.audience)}</span>
                    <span className="text-[0.9em] text-[#5b6b7c]">{t("{count} people", { count: a.reach.toLocaleString("en") })}</span>
                  </td>
                  <td className="px-[1.3em]">
                    <span className="inline-flex items-center gap-[0.35em] rounded-[0.5em] bg-[#e6eefb] px-[0.6em] py-[0.15em] text-[0.9em] font-medium text-[#0b6f86]">
                      <Monitor className="size-[0.95em]" />
                      {t("In-App")}
                    </span>
                  </td>
                  <td className="px-[1.3em] py-[1em]">
                    <span className={`inline-flex items-center gap-[0.4em] rounded-full px-[0.7em] py-[0.2em] text-[0.9em] font-semibold ${STATUS[status].style}`}>
                      <span className="size-[0.45em] rounded-full bg-current" />
                      {t(STATUS[status].label)}
                    </span>
                    <span className="mt-[0.3em] block text-[0.9em] text-[#5b6b7c]">{when(a.publishAtUtc ?? a.createdUtc)}</span>
                    <span className="mt-[0.5em] flex justify-end gap-[0.8em] text-[#5b6b7c]">
                      {busy === a.id ? (
                        <LoaderCircle className="size-[1.1em] animate-spin" />
                      ) : (
                        <>
                          <button type="button" onClick={() => onEdit(a)} aria-label={t("Edit")} title={t("Edit")} className="hover:text-[#0b6f86]">
                            <Pencil className="size-[1.1em]" />
                          </button>
                          {waiting && (
                            <button type="button" onClick={() => publishNow(a)} aria-label={t("Send now")} title={t("Send now")} className="hover:text-[#0b6f86]">
                              <Send className="size-[1.1em] rtl:-scale-x-100" />
                            </button>
                          )}
                          <button type="button" onClick={() => remove(a)} aria-label={t("Delete")} title={t("Delete")} className="hover:text-[#d04a4a]">
                            <X className="size-[1.1em]" />
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

      <footer className="flex flex-wrap items-center justify-between gap-[0.8em] px-[1.3em] py-[1em] text-[0.75em] text-[#5b6b7c]">
        <span>
          {t("Showing")}{" "}
          <b className="text-[#0b1b2b]" dir="ltr">
            {items.length ? from + 1 : 0}-{from + visible.length}
          </b>{" "}
          {t("of")} <b className="text-[#0b1b2b]">{items.length.toLocaleString("en")}</b> {t("broadcasts")}
        </span>
        <nav aria-label={t("Pagination")} className="flex flex-wrap items-center gap-[0.35em]">
          <button type="button" disabled={current <= 1} onClick={() => setPage(current - 1)} className={`${pager} bg-[#f1f5fd] text-[#14365a] disabled:opacity-40`}>
            {t("Previous")}
          </button>
          {pageList(current, pages).map((p, i) =>
            p === "gap" ? (
              <span key={`gap-${i}`} className="px-[0.2em]">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                aria-current={p === current ? "page" : undefined}
                className={`${pager} ${p === current ? "bg-[#06b6d4] text-white" : "bg-[#f1f5fd] text-[#14365a] hover:bg-[#e6eefb]"}`}
              >
                {p}
              </button>
            ),
          )}
          <button type="button" disabled={current >= pages} onClick={() => setPage(current + 1)} className={`${pager} bg-[#f1f5fd] text-[#14365a] disabled:opacity-40`}>
            {t("Next")}
          </button>
        </nav>
      </footer>
    </section>
  );
}
