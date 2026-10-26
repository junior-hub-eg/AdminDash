import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

export type SquadStatTone = "cyan" | "green" | "violet" | "slate";

const ICON: Record<SquadStatTone, string> = {
  cyan: "bg-[#e0f6fc] text-[#0b89a6]",
  green: "bg-[#dff7ea] text-[#17935f]",
  violet: "bg-[#e9e7fd] text-[#4f46c8]",
  slate: "bg-[#eef2f7] text-[#14365a]",
};

const BLOB: Record<SquadStatTone, string> = {
  cyan: "bg-[#c9f2fb]",
  green: "bg-[#cdf3e0]",
  violet: "bg-[#dcd8fb]",
  slate: "bg-[#dde7f2]",
};

/**
 * Stat card of the squad screens: uppercase label, icon circle, big number with a small
 * suffix next to it, an optional bar, a hint line and a soft colour blob in the corner.
 */
export function SquadStat({
  label,
  icon: Icon,
  value,
  suffix,
  hint,
  bar,
  tone = "cyan",
  valueClass = "text-[2.1em]",
}: {
  label: string;
  icon: LucideIcon;
  value: ReactNode;
  suffix?: ReactNode;
  hint?: ReactNode;
  /** 0-100, drawn under the number. */
  bar?: { value: number; color?: string };
  tone?: SquadStatTone;
  valueClass?: string;
}) {
  return (
    <li className="relative flex min-h-[8.6em] min-w-0 flex-col overflow-hidden rounded-[1.1em] bg-white p-[1.2em] shadow-[0_6px_22px_rgba(20,54,90,0.07)]">
      <span
        aria-hidden
        className={`pointer-events-none absolute -bottom-[3em] -end-[2.5em] size-[8.5em] rounded-full opacity-60 blur-[1.2em] ${BLOB[tone]}`}
      />

      <div className="relative flex items-start justify-between gap-[0.6em]">
        <h2 className="pt-[0.3em] text-[0.7em] font-semibold uppercase tracking-[0.1em] text-[#3d4f61]">{label}</h2>
        <span className={`grid size-[2.4em] shrink-0 place-items-center rounded-full ${ICON[tone]}`}>
          <Icon className="size-[1.1em]" />
        </span>
      </div>

      <p className="relative mt-auto flex flex-wrap items-baseline gap-x-[0.4em] pt-[0.6em]">
        <span className={`font-extrabold leading-none text-[#0b1b2b] ${valueClass}`}>{value}</span>
        {suffix && <span className="text-[0.75em] font-semibold text-[#5b6b7c]">{suffix}</span>}
      </p>

      {bar && (
        <div className="relative mt-[0.7em] h-[0.4em] overflow-hidden rounded-full bg-[#e7eef6]">
          <div
            className={`h-full rounded-full ${bar.color ?? "bg-[#06b6d4]"}`}
            style={{ width: `${Math.max(0, Math.min(100, bar.value))}%` }}
          />
        </div>
      )}

      {hint && <div className="relative mt-[0.5em] text-[0.72em] leading-snug text-[#5b6b7c]">{hint}</div>}
    </li>
  );
}
