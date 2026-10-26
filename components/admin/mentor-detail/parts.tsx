import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { PANEL } from "../page-parts";

export function Section({
  title,
  sub,
  icon,
  action,
  children,
  className = "",
  id,
}: {
  title: string;
  sub?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`${PANEL} min-w-0 p-[1.3em] ${className}`}>
      <header className="mb-[1em] flex flex-wrap items-start justify-between gap-[0.6em]">
        <div className="flex min-w-0 items-start gap-[0.6em]">
          {icon && <span className="mt-[0.2em] grid size-[2em] shrink-0 place-items-center rounded-[0.55em] bg-[#e6f1fb] text-[#0b6f86]">{icon}</span>}
          <div className="min-w-0">
            <h2 className="text-[1.15em] font-bold text-[#0b1b2b]">{title}</h2>
            {sub && <p className="text-[0.75em] text-[#5b6b7c]">{sub}</p>}
          </div>
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
      <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: color }} />
    </div>
  );
}

export const SOFT = "rounded-[0.9em] bg-[#f1f5fd] p-[1em]";

/** The designed card's place when there is no data (or no API) for it. */
export function EmptyNote({ text, icon }: { text: string; icon?: ReactNode }) {
  return (
    <div className="grid place-items-center gap-[0.5em] rounded-[0.9em] bg-[#f4f8fd] px-[1em] py-[1.8em] text-center">
      <span className="text-[#8a97a6]">{icon ?? <Inbox className="size-[1.6em]" />}</span>
      <p className="max-w-[26em] text-[0.8em] font-medium text-[#5b6b7c]">{text}</p>
    </div>
  );
}

/** A whole tab with nothing to show yet. */
export function EmptyCard({ title, text }: { title: string; text: string }) {
  return (
    <Section title={title}>
      <EmptyNote text={text} />
    </Section>
  );
}
