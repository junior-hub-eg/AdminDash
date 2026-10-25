import Image from "next/image";
import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

const baseFont = { fontSize: "clamp(11px, calc(var(--u) * 1.05), 17px)" } as CSSProperties;

/* ======================================================================
   Old look: park picture hero.
   Pages that were not redesigned yet still use these three.
   ====================================================================== */

/**
 * Wraps an admin page: fills the space above Quick Management (set by AdminShell).
 */
export function AdminPage({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col xl:min-h-0 xl:flex-1" style={baseFont}>
      {children}
    </div>
  );
}

/** Top part of a page, with the park picture behind it (same as the dashboard hero). */
export function AdminHero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative shrink-0 overflow-hidden ${className}`}>
      <Image src="/images/Intern/bg-park.png" alt="" fill priority sizes="100vw" className="object-cover" />
      <div className="relative z-10 px-[calc(var(--u)*1.6)] pb-[1.6em] pt-[calc(var(--u)*5.4)]">{children}</div>
    </section>
  );
}

/** Below the hero: scrolls by itself on tall pages so Quick Management stays visible. */
export function AdminBody({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`px-[calc(var(--u)*1.6)] py-[1.4em] xl:min-h-0 xl:flex-1 xl:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}
    >
      {children}
    </div>
  );
}

/* ======================================================================
   New look: light page, white cards, cyan accent (no picture).
   ====================================================================== */

/** The white card used everywhere. */
export const PANEL = "rounded-[1.1em] bg-white shadow-[0_6px_22px_rgba(20,54,90,0.07)]";

export const BTN_PRIMARY =
  "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] bg-[#06b6d4] px-[1.2em] py-[0.65em] text-[0.85em] font-semibold text-white shadow-[0_6px_16px_rgba(6,182,212,0.35)] hover:bg-[#0aa5c0] disabled:cursor-not-allowed disabled:opacity-50";

export const BTN_SECONDARY =
  "inline-flex items-center justify-center gap-[0.5em] rounded-[0.7em] border border-[#dfe7f1] bg-white px-[1.1em] py-[0.65em] text-[0.85em] font-semibold text-[#14365a] hover:bg-[#f1f6fb] disabled:cursor-not-allowed disabled:opacity-50";

/** Inputs and selects in filter bars. */
export const INPUT =
  "h-[2.6em] min-w-0 rounded-[0.7em] border border-[#e1e8f0] bg-white px-[0.9em] text-[0.8em] text-[#14365a] outline-none placeholder:text-[#8a97a6] focus:ring-2 focus:ring-[#06b6d4]/40";

/**
 * Page container for the new look: light background with a soft blue glow on top.
 * < xl : normal flow (the shell scrolls). xl+ : fills the space above Quick Management and scrolls inside.
 */
export function AdminSurface({ children }: { children: ReactNode }) {
  return (
    <div
      className="relative flex min-w-0 flex-col bg-[#f5f8fe] xl:min-h-0 xl:flex-1 xl:overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={baseFont}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[24em] bg-[radial-gradient(ellipse_70%_100%_at_50%_0%,rgba(125,211,252,0.35),transparent_70%)]"
      />

      <div className="relative z-10 flex flex-col gap-[1.4em] px-[calc(var(--u)*1.6)] pb-[2em] pt-[calc(var(--u)*5.4)]">
        {children}
      </div>
    </div>
  );
}

/** Small tag, big title, description, and action buttons on the other side. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-[1.5em] gap-y-[1em]">
      <div className="min-w-0 max-w-[44em]">
        {eyebrow && (
          <span className="mb-[0.7em] inline-flex items-center gap-[0.5em] rounded-full bg-[#dff3fb] px-[0.9em] py-[0.25em] text-[0.62em] font-bold uppercase tracking-[0.08em] text-[#0b6f86]">
            <span className="size-[0.6em] rounded-full bg-[#06b6d4]" />
            {eyebrow}
          </span>
        )}

        <h1 className="text-[1.9em] font-extrabold leading-tight text-[#0b1b2b] xl:text-[2.2em]">{title}</h1>

        {description && <p className="mt-[0.4em] text-[0.82em] leading-snug text-[#5b6b7c]">{description}</p>}
      </div>

      {actions && <div className="flex flex-wrap items-center gap-[0.6em]">{actions}</div>}
    </header>
  );
}

export type Tone = "cyan" | "green" | "amber" | "red" | "violet";

const ICON_TONE: Record<Tone, string> = {
  cyan: "bg-[#e0f6fc] text-[#0b89a6]",
  green: "bg-[#dff7ea] text-[#17935f]",
  amber: "bg-[#fdf0d4] text-[#c7851a]",
  red: "bg-[#fde4e4] text-[#d04a4a]",
  violet: "bg-[#ece8fd] text-[#6a52d9]",
};

const BLOB_TONE: Record<Tone, string> = {
  cyan: "bg-[#bff0fb]",
  green: "bg-[#c5f3dc]",
  amber: "bg-[#fde7b4]",
  red: "bg-[#fbd0d0]",
  violet: "bg-[#d9d2fb]",
};

export type BadgeTone = "up" | "down" | "warn" | "neutral";

const BADGE_TONE: Record<BadgeTone, string> = {
  up: "bg-[#e3f7ee] text-[#17935f]",
  down: "bg-[#fde8e8] text-[#d04a4a]",
  warn: "bg-[#fdf0d4] text-[#a8680c]",
  neutral: "bg-[#eef2f7] text-[#5b6b7c]",
};

/** Row of stat cards: 1 column on phones, 2 on tablets, 4 on desktop. */
export function StatGrid({
  children,
  busy,
  className = "",
}: {
  children: ReactNode;
  busy?: boolean;
  className?: string;
}) {
  return (
    <ul className={`grid grid-cols-1 gap-[1.1em] sm:grid-cols-2 xl:grid-cols-4 ${className}`} aria-busy={busy}>
      {children}
    </ul>
  );
}

/** Label, big number, icon on the corner, a small badge and a hint line. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "cyan",
  badge,
  badgeTone = "up",
  hint,
  valueClass,
}: {
  label: string;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  badge?: string;
  badgeTone?: BadgeTone;
  hint?: string;
  valueClass?: string;
}) {
  return (
    <li className={`${PANEL} relative flex min-h-[8.5em] flex-col overflow-hidden p-[1.1em]`}>
      <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-[2.5em] -end-[2em] size-[8em] rounded-full opacity-60 blur-[0.8em] ${BLOB_TONE[tone]}`}
      />

      <div className="relative flex items-start justify-between gap-[0.6em]">
        <h2 className="text-[0.78em] font-semibold text-[#5b6b7c]">{label}</h2>

        <span className={`grid size-[2.3em] shrink-0 place-items-center rounded-[0.7em] ${ICON_TONE[tone]}`}>
          <Icon className="size-[1.15em]" />
        </span>
      </div>

      <p className={`relative mt-[0.45em] text-[2em] font-extrabold leading-none ${valueClass ?? "text-[#0b1b2b]"}`}>
        {value}
      </p>

      {(badge || hint) && (
        <div className="relative mt-auto flex flex-wrap items-center gap-[0.5em] pt-[0.7em] text-[0.7em]">
          {badge && (
            <span dir="ltr" className={`rounded-full px-[0.7em] py-[0.15em] font-semibold ${BADGE_TONE[badgeTone]}`}>
              {badge}
            </span>
          )}

          {hint && <span className="text-[#8a97a6]">{hint}</span>}
        </div>
      )}
    </li>
  );
}