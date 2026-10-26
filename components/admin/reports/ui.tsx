"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { useT } from "@/lib/i18n/client";
import { PANEL } from "../page-parts";

/** Shared pieces of the new-look Reports, Security, Settings and Rewards screens. */

export const DASH = "—";

/** Numbers always in Latin digits, grouped (1,120). */
export const fmt = (n: number) => n.toLocaleString("en");

/** A white card with an icon, a title, a short description and a pill or action on the other side. */
export function Section({
  id,
  icon: Icon,
  title,
  description,
  aside,
  children,
  className = "",
  dark = false,
}: {
  id?: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  dark?: boolean;
}) {
  return (
    <section id={id} className={`${dark ? "rounded-[1.1em] bg-[#13233a] text-white" : PANEL} min-w-0 scroll-mt-[2em] p-[1.2em] sm:p-[1.4em] ${className}`}>
      <header className="flex flex-wrap items-start justify-between gap-[0.8em]">
        <div className="flex min-w-0 items-start gap-[0.7em]">
          {Icon && (
            <span className="grid size-[2.3em] shrink-0 place-items-center rounded-[0.7em] bg-[#e0f6fc] text-[#0b89a6]">
              <Icon className="size-[1.15em]" />
            </span>
          )}
          <div className="min-w-0">
            <h2 className={`text-[1.15em] font-bold leading-tight ${dark ? "text-white" : "text-[#0b1b2b]"}`}>{title}</h2>
            {description && <p className={`mt-[0.25em] text-[0.75em] leading-snug ${dark ? "text-white/70" : "text-[#5b6b7c]"}`}>{description}</p>}
          </div>
        </div>
        {aside && <div className="flex shrink-0 flex-wrap items-center gap-[0.5em]">{aside}</div>}
      </header>
      {children}
    </section>
  );
}

const PILL_TONE = {
  cyan: "bg-[#dff3fb] text-[#0b6f86]",
  green: "bg-[#dff7ea] text-[#17935f]",
  amber: "bg-[#fdf0d4] text-[#a8680c]",
  red: "bg-[#fde4e4] text-[#c03d3d]",
  violet: "bg-[#ece8fd] text-[#5b44c9]",
  gray: "bg-[#eef2f7] text-[#5b6b7c]",
} as const;

export type PillTone = keyof typeof PILL_TONE;

export function Pill({ tone = "cyan", children, className = "" }: { tone?: PillTone; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[0.35em] whitespace-nowrap rounded-full px-[0.8em] py-[0.2em] text-[0.68em] font-bold ${PILL_TONE[tone]} ${className}`}>
      {children}
    </span>
  );
}

/** The "Coming soon" tag next to a feature that has no backend yet. */
export function Soon({ className = "" }: { className?: string }) {
  const t = useT();
  return <Pill tone="gray" className={className}>{t("Coming soon")}</Pill>;
}

/** Calm placeholder when there is nothing to show. */
export function Empty({ icon: Icon, title, text, className = "" }: { icon: LucideIcon; title: string; text?: string; className?: string }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-[0.4em] rounded-[0.9em] border border-dashed border-[#d6e1ec] bg-[#f8fbfe] px-[1em] py-[2em] text-center ${className}`}>
      <span className="grid size-[2.6em] place-items-center rounded-full bg-[#e8f1f9] text-[#6b819a]">
        <Icon className="size-[1.2em]" />
      </span>
      <p className="text-[0.85em] font-semibold text-[#14365a]">{title}</p>
      {text && <p className="max-w-[28em] text-[0.72em] text-[#8a97a6]">{text}</p>}
    </div>
  );
}

/** Footer strip at the bottom of a card (label + value, link on the other side). */
export function CardFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="mt-[1em] flex flex-wrap items-center justify-between gap-[0.6em] rounded-[0.7em] bg-[#f1f6fb] px-[0.9em] py-[0.6em] text-[0.72em] text-[#5b6b7c]">
      {children}
    </footer>
  );
}

/** Round initials avatar. */
export function Initials({ name, className = "" }: { name: string; className?: string }) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
  return (
    <span aria-hidden className={`grid size-[2.3em] shrink-0 place-items-center rounded-full bg-[#0f5f73] text-[0.8em] font-bold text-white ${className}`}>
      {letters || "?"}
    </span>
  );
}

/** An on/off switch; disabled ones are dimmed. */
export function Switch({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`relative h-[1.5em] w-[2.7em] shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
        checked ? "bg-[#06b6d4]" : "bg-[#c4cfdb]"
      }`}
    >
      <span
        className={`absolute top-[0.2em] size-[1.1em] rounded-full bg-white shadow transition-all ${checked ? "start-[1.4em]" : "start-[0.2em]"}`}
      />
    </button>
  );
}

/** Tabs drawn as in the designs: the active one is dark navy. */
export function TabBar<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string; icon: LucideIcon; count?: number }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  return (
    <nav aria-label={label} className="-mx-[0.2em] flex gap-[0.5em] overflow-x-auto px-[0.2em] pb-[0.2em] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const on = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            aria-pressed={on}
            className={`inline-flex shrink-0 items-center gap-[0.5em] whitespace-nowrap rounded-[0.7em] px-[1em] py-[0.6em] text-[0.82em] font-semibold transition ${
              on ? "bg-[#13233a] text-[#5ee0f5] shadow-[0_6px_16px_rgba(19,35,58,0.25)]" : "bg-white text-[#14365a] shadow-[0_4px_14px_rgba(20,54,90,0.06)] hover:bg-[#f1f6fb]"
            }`}
          >
            <tab.icon className="size-[1.1em]" />
            {tab.label}
            {tab.count != null && (
              <span className={`rounded-full px-[0.55em] text-[0.8em] ${on ? "bg-[#5ee0f5]/20" : "bg-[#dff3fb] text-[#0b6f86]"}`}>{tab.count}</span>
            )}
          </button>
        );
      })}
    </nav>
  );
}

/** Measures an element so a chart can draw at its real pixel size. */
export function useBox<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: Math.floor(e.contentRect.width), h: Math.floor(e.contentRect.height) }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, box] as const;
}

/** One CSV cell. A leading = + - @ is neutralised so Excel never runs it as a formula. */
export function csvCell(value: string | number) {
  let s = String(value);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

/** Builds the CSV (with a BOM so Excel reads Arabic) and downloads it. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  return csv.length;
}
