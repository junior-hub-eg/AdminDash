"use client";

import { useEffect, type ReactNode } from "react";
import { X, type LucideIcon } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import { AdminSurface, PageHeader, PANEL, StatCard, StatGrid, type Tone } from "./page-parts";

/** Same white card the rest of the admin uses. */
export const CARD = PANEL;

export type HeroStat = {
  label: string;
  value: string;
  icon: LucideIcon;
  valueClass?: string;
  hint?: string;
};

const TONES: Tone[] = ["cyan", "green", "amber", "violet"];

/** New look: title, four stat cards, then the page content (built on page-parts). */
export function AdminPageHero({
  title,
  stats,
  eyebrow,
  description,
  children,
}: {
  title: string;
  stats: HeroStat[];
  eyebrow?: string;
  description?: string;
  children: ReactNode;
}) {
  const { t } = useI18n();

  return (
    <AdminSurface>
      <PageHeader
        eyebrow={eyebrow ? t(eyebrow) : undefined}
        title={t(title)}
        description={description ? t(description) : undefined}
      />

      <StatGrid>
        {stats.map((s, i) => (
          <StatCard
            key={s.label}
            label={t(s.label)}
            value={s.value}
            icon={s.icon}
            tone={TONES[i % TONES.length]}
            hint={s.hint ? t(s.hint) : undefined}
            valueClass={s.valueClass}
          />
        ))}
      </StatGrid>

      <div className="min-w-0">{children}</div>
    </AdminSurface>
  );
}

export function AdminCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${PANEL} p-[1.2em] ${className}`}>{children}</div>;
}

export function AdminDialog({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t } = useI18n();

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();

    window.addEventListener("keydown", onKey);

    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center p-4">
      <button
        type="button"
        aria-label={t("Close")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#14365a]/40 backdrop-blur-[1px]"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={t(title)}
        className="relative w-full max-w-md rounded-2xl bg-white p-5 text-[#14365a] shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-bold">{t(title)}</h2>

          <button
            type="button"
            onClick={onClose}
            aria-label={t("Close")}
            className="grid size-8 place-items-center rounded-full hover:bg-[#eef4fa]"
          >
            <X className="size-4" />
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "green" | "amber"; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-[0.68rem] font-semibold ${
        tone === "green" ? "bg-[#c9f0d2] text-[#1b7a3a]" : "bg-[#fde7b0] text-[#9a6200]"
      }`}
    >
      {children}
    </span>
  );
}

export const FIELD =
  "h-9 w-full rounded-xl border border-[#cfe0ee] bg-white px-3 text-[0.8rem] text-[#14365a] outline-none focus:ring-2 focus:ring-[#06b6d4]/40";