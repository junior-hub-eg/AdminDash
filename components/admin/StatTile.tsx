import type { ReactNode } from "react";

/** Stat card with a big number, an optional badge next to it and a hint line. */
export default function StatTile({
  label,
  icon,
  value,
  badge,
  badgeClass = "bg-[#e3f6fb] text-[#0a7f99]",
  hint,
}: {
  label: string;
  icon: ReactNode;
  value: string;
  badge?: string;
  badgeClass?: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-wider text-[#14365a]/60">{label}</p>
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-[#e8f2f8] text-[#12676b]">{icon}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-[1.9rem] font-extrabold leading-none text-[#0d2a45]">{value}</span>
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[0.68rem] font-bold ${badgeClass}`}>{badge}</span>
        )}
      </div>

      <p className="mt-2 text-[0.72rem] text-[#14365a]/60">{hint}</p>
    </div>
  );
}