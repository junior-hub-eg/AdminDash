import type { ReactNode } from "react";
import { PANEL } from "../page-parts";

export function Section({ title, sub, action, children, className = "" }: { title: string; sub?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${PANEL} min-w-0 p-[1.3em] ${className}`}>
      <header className="mb-[1em] flex flex-wrap items-start justify-between gap-[0.6em]">
        <div>
          <h2 className="text-[1.15em] font-bold text-[#0b1b2b]">{title}</h2>
          {sub && <p className="text-[0.75em] text-[#5b6b7c]">{sub}</p>}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}

export function Bar({ pct, color = "#06b6d4" }: { pct: number; color?: string }) {
  return (
    <div className="h-[0.45em] w-full overflow-hidden rounded-full bg-[#e6edf3]">
      <div className="h-full rounded-full" style={{ width: `${Math.min(100, pct)}%`, background: color }} />
    </div>
  );
}

export const SOFT = "rounded-[0.9em] bg-[#f1f5fd] p-[1em]";