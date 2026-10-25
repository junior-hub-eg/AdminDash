"use client";

import { LoaderCircle, MessageSquareQuote } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import type { QueueItem } from "./types";

type Props = {
  item: QueueItem | null;
  busy: boolean;
  /** Another request is being saved, so the buttons wait. */
  locked: boolean;
  onApprove: (item: QueueItem) => void;
  onDecline: (item: QueueItem) => void;
};

const initials = (name: string) =>
  name
    .replace(/^(Dr|Eng)\.?\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

export default function ApprovalInspector({ item, busy, locked, onApprove, onDecline }: Props) {
  const { t } = useI18n();

  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm" aria-labelledby="approval-inspector-title">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 id="approval-inspector-title" className="flex items-center gap-2 text-[0.95rem] font-bold text-[#0d2a45]">
          <span className="size-2 rounded-full bg-[#06b6d4]" />
          {t("Selected Inspector")}
        </h2>

        {item && (
          <span dir="ltr" className="rounded-full bg-[#cdeffa] px-3 py-1 text-[0.64rem] font-bold uppercase tracking-wide text-[#0a7f99]">
            {t("Ticket")} {item.inspector.ticket}
          </span>
        )}
      </div>

      {!item ? (
        <div className="grid h-48 place-items-center rounded-2xl border border-dashed border-[#cfe0ee] text-[0.78rem] text-[#14365a]/55">
          {t("Select a request to inspect it.")}
        </div>
      ) : (
        <div className="space-y-3">
          <div className="rounded-2xl bg-[#f1f6fa] p-4">
            <div className="flex items-center gap-3">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-[#0d2a45] text-[1rem] font-bold text-white">
                {initials(item.name)}
              </span>

              <div className="min-w-0">
                <p className="truncate text-[1rem] font-bold text-[#0d2a45]">{item.name}</p>
                <p dir="ltr" className="truncate text-[0.72rem] text-[#14365a]/60 rtl:text-end">
                  {item.inspector.idLabel}
                </p>

                {item.inspector.chips.length > 0 && (
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {item.inspector.chips.map((c) => (
                      <span
                        key={c}
                        className="rounded-md bg-[#dbeaf6] px-2 py-0.5 text-[0.66rem] font-semibold text-[#14365a]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {item.inspector.cards.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {item.inspector.cards.map((c) => (
                  <div key={c.label} className="min-w-0 rounded-xl bg-white p-3">
                    <p className="text-[0.64rem] text-[#14365a]/55">{t(c.label)}</p>
                    <p
                      className={`mt-0.5 break-words text-[0.78rem] font-semibold ${c.accent ? "text-[#0a7f99]" : "text-[#0d2a45]"}`}
                    >
                      {c.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {item.inspector.progress && (
            <div>
              <div className="flex items-center justify-between gap-3 text-[0.66rem] font-semibold uppercase tracking-wide text-[#14365a]/60">
                <span>{t(item.inspector.progress.label)}</span>
                <span className="normal-case text-[#0d2a45]">{item.inspector.progress.note}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[#e1e8f0]">
                <div
                  className="h-full rounded-full bg-[#06b6d4]"
                  style={{ width: `${Math.min(100, Math.max(0, item.inspector.progress.pct))}%` }}
                />
              </div>
            </div>
          )}

          {item.inspector.quote && (
            <figure className="rounded-2xl bg-[#f6f9fc] p-4">
              <figcaption className="flex items-center gap-2 text-[0.72rem]">
                <MessageSquareQuote className="size-4 shrink-0 text-[#6b63d6]" />
                <span className="font-bold text-[#0d2a45]">{t(item.inspector.quote.title)}</span>
                <span className="ms-auto text-[#14365a]/55">{item.inspector.quote.by}</span>
              </figcaption>
              <blockquote className="mt-2 border-s-2 border-[#d5e3ee] ps-3 text-[0.74rem] italic leading-relaxed text-[#14365a]/80">
                “{item.inspector.quote.text}”
              </blockquote>
            </figure>
          )}

          <button
            type="button"
            disabled={locked}
            onClick={() => onApprove(item)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06b6d4] px-4 py-3 text-[0.82rem] font-semibold text-white hover:bg-[#0597b1] disabled:opacity-50"
          >
            {busy && <LoaderCircle className="size-4 animate-spin" />}
            {t(item.inspector.approveLabel)}
          </button>

          <button
            type="button"
            disabled={locked}
            onClick={() => onDecline(item)}
            className="w-full rounded-xl bg-[#ffe6e6] px-4 py-2.5 text-[0.78rem] font-semibold text-[#b42a2a] hover:bg-[#ffd8d8] disabled:opacity-50"
          >
            {t("Decline Application")}
          </button>
        </div>
      )}
    </section>
  );
}