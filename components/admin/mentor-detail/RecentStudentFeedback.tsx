"use client";

import { MessageSquareQuote, Star } from "lucide-react";
import type { AdminFeedbackPage } from "@/lib/admin-mentor-sessions-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { EmptyNote, Section } from "./parts";
import { initials, shortDate } from "./format";

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex gap-[0.1em]" aria-label={`${value} / 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`size-[0.95em] ${i <= value ? "fill-[#f5b301] text-[#f5b301]" : "text-[#d5dfea]"}`} />
      ))}
    </span>
  );
}

/**
 * Students' session reviews, newest first. `full` is the Student Reviews tab: every review with paging;
 * otherwise the latest three and a link to the tab.
 */
export function RecentStudentFeedback({
  feedback,
  error,
  onRetry,
  full = false,
  onViewAll,
  onPage,
}: {
  feedback: AdminFeedbackPage | null;
  error: string | null;
  onRetry: () => void;
  full?: boolean;
  onViewAll?: () => void;
  onPage?: (page: number) => void;
}) {
  const t = useT();
  const items = feedback ? (full ? feedback.items : feedback.items.slice(0, 3)) : [];
  const pages = feedback ? Math.max(1, Math.ceil(feedback.total / feedback.pageSize)) : 1;
  return (
    <Section
      title={full ? t("Student Reviews") : t("Recent Student Feedback")}
      sub={
        feedback && feedback.total > 0
          ? t("{avg} average from {n} reviews", { avg: feedback.averageRating.toFixed(2), n: feedback.total })
          : t("Verified qualitative testimonials from sprint reviews and 1:1 clinics")
      }
      icon={<MessageSquareQuote className="size-[1.1em]" />}
      action={
        !full && feedback && feedback.total > 3 && onViewAll ? (
          <button type="button" onClick={onViewAll} className="text-[0.75em] font-semibold text-[#0b6f86] hover:underline">
            {t("View all")}
          </button>
        ) : undefined
      }
    >
      {!feedback ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : items.length === 0 ? (
        <EmptyNote text={t("No student reviews to show yet.")} />
      ) : (
        <ul className={full ? "grid gap-[0.8em] md:grid-cols-2" : "grid gap-[0.8em]"}>
          {items.map((f) => (
            <li key={f.id} className="rounded-[0.9em] bg-[#f4f8fd] p-[1em] text-[0.8em]">
              <div className="flex items-center justify-between gap-[0.6em]">
                <span className="flex min-w-0 items-center gap-[0.6em]">
                  <span className="grid size-[2.2em] shrink-0 place-items-center rounded-full bg-[#12939b] text-[0.8em] font-bold text-white">{initials(f.studentName)}</span>
                  <span className="min-w-0">
                    <b className="block truncate text-[#0b1b2b]">{f.studentName}</b>
                    <span className="text-[0.85em] text-[#8a97a6]">
                      {shortDate(f.createdUtc)}
                      {f.sessionTopic ? ` · ${f.sessionTopic}` : ""}
                    </span>
                  </span>
                </span>
                <Stars value={f.rating} />
              </div>
              {f.comment && <p className="mt-[0.6em] leading-relaxed text-[#14365a]">“{f.comment}”</p>}
            </li>
          ))}
        </ul>
      )}
      {full && feedback && pages > 1 && onPage && (
        <div className="mt-[1em] flex items-center justify-center gap-[0.8em] text-[0.78em]">
          <button
            type="button"
            disabled={feedback.page <= 1}
            onClick={() => onPage(feedback.page - 1)}
            className="rounded-[0.5em] border border-[#e1e8f0] bg-white px-[0.9em] py-[0.3em] font-semibold text-[#14365a] disabled:opacity-40"
          >
            {t("Previous")}
          </button>
          <span className="text-[#5b6b7c]">{t("Page {page} of {pages}", { page: feedback.page, pages })}</span>
          <button
            type="button"
            disabled={feedback.page >= pages}
            onClick={() => onPage(feedback.page + 1)}
            className="rounded-[0.5em] border border-[#e1e8f0] bg-white px-[0.9em] py-[0.3em] font-semibold text-[#14365a] disabled:opacity-40"
          >
            {t("Next")}
          </button>
        </div>
      )}
    </Section>
  );
}
