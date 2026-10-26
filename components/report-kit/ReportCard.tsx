"use client";

/**
 * ReportCard: the white card every report section sits in.
 *   icon?, title, description?, aside? (pill or small actions on the other side),
 *   className?, id?, children.
 *   Printing keeps each card on one page where it fits (class jh-print-section).
 *
 * StateBlock: loading spinner, or the error with a "Try again" button.
 *   error: string | null, onRetry, className?.
 *
 * EmptyState: calm placeholder. icon, title, text?, className?.
 *
 * Skeleton: grey shimmering block. className (size it).
 */

import type { ReactNode } from "react";
import { LoaderCircle, RotateCcw, type LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { CARD } from "./tokens";

export function ReportCard({
  id,
  icon: Icon,
  title,
  description,
  aside,
  children,
  className = "",
}: {
  id?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`${CARD} jh-print-section min-w-0 scroll-mt-[2em] p-[1.2em] sm:p-[1.4em] ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-[0.8em]">
        <div className="flex min-w-0 items-start gap-[0.7em]">
          {Icon && (
            <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.7em] bg-[#e0f6fc] text-[#0b89a6]">
              <Icon className="size-[1.15em]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className="text-[1.1em] font-bold leading-tight text-[#0b1b2b]">{title}</h2>
            {description && <p className="mt-[0.25em] text-[0.75em] leading-snug text-[#5b6b7c]">{description}</p>}
          </div>
        </div>
        {aside && <div className="flex shrink-0 flex-wrap items-center gap-[0.5em]">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

export function StateBlock({ error, onRetry, className = "" }: { error: string | null; onRetry: () => void; className?: string }) {
  const t = useT();
  if (!error) {
    return (
      <div role="status" aria-label={t("Loading")} className={`grid place-items-center py-[2.5em] ${className}`}>
        <LoaderCircle className="size-[2em] animate-spin text-[#06b6d4]" />
      </div>
    );
  }
  return (
    <div
      role="alert"
      className={`flex flex-wrap items-center justify-center gap-[0.8em] rounded-[0.8em] bg-[#fdecec] px-[1em] py-[0.8em] text-[0.82em] font-semibold text-[#b83232] ${className}`}
    >
      <span>{error}</span>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-[0.4em] rounded-full bg-white px-[0.9em] py-[0.3em] text-[#14365a] shadow-sm hover:bg-[#eef4fa] print:hidden"
      >
        <RotateCcw className="size-[1em]" /> {t("Try again")}
      </button>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, text, className = "" }: { icon: LucideIcon; title: string; text?: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-[0.4em] rounded-[0.9em] border border-dashed border-[#d6e1ec] bg-[#f8fbfe] px-[1em] py-[2em] text-center ${className}`}
    >
      <span className="grid size-[2.6em] place-items-center rounded-full bg-[#e8f1f9] text-[#6b819a]">
        <Icon className="size-[1.2em]" />
      </span>
      <p className="text-[0.85em] font-semibold text-[#14365a]">{title}</p>
      {text && <p className="max-w-[28em] text-[0.72em] text-[#8a97a6]">{text}</p>}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <span aria-hidden className={`block animate-pulse rounded-[0.5em] bg-[#e8eef5] ${className}`} />;
}
