"use client";

import { Flag } from "lucide-react";
import type { CountItem } from "@/lib/admin-api";
import { useT } from "@/lib/i18n/client";
import { LoadState } from "../admin-data";
import { CardFooter, Empty, fmt, Pill, Section } from "./ui";

const COLORS = ["#06b6d4", "#0f5f73", "#14b8a6", "#1e293b", "#94a3b8"];

/** Milestone Velocity & Funnel: how many students sit at each level (students.byLevel). */
export function LevelDonut({ levels, error, onRetry }: { levels: CountItem[] | null; error: string | null; onRetry: () => void }) {
  const t = useT();
  const items = levels ?? [];
  const total = items.reduce((a, l) => a + l.count, 0);
  const r = 40;
  const c = 2 * Math.PI * r;
  // Each segment starts where the ones before it end.
  const starts = items.map((_, i) => (items.slice(0, i).reduce((a, l) => a + l.count, 0) / (total || 1)) * c);

  return (
    <Section
      icon={Flag}
      title={t("Level Funnel")}
      description={t("Students at each learning level across all tracks.")}
      aside={levels && <Pill tone="green">{t("{count} students placed", { count: fmt(total) })}</Pill>}
      className="flex flex-col"
    >
      {!levels ? (
        <LoadState error={error} onRetry={onRetry} />
      ) : total === 0 ? (
        <Empty icon={Flag} title={t("No students placed on a level yet")} className="mt-[1em] flex-1" />
      ) : (
        <div className="mt-[1em] flex flex-1 flex-col items-center gap-[1.2em] sm:flex-row">
          <div className="relative size-[10em] shrink-0">
            <svg viewBox="0 0 120 120" className="size-full -rotate-90" role="img" aria-label={t("Level Funnel")}>
              {items.map((l, i) => {
                const len = (l.count / total) * c;
                return (
                  <circle
                    key={l.key}
                    cx="60"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth="16"
                    strokeDasharray={`${len} ${c - len}`}
                    strokeDashoffset={-starts[i]}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-[1.6em] font-extrabold leading-none text-[#0b1b2b]">{fmt(total)}</p>
                <p className="text-[0.68em] text-[#5b6b7c]">{t("Students")}</p>
              </div>
            </div>
          </div>

          <ul className="w-full min-w-0 flex-1 space-y-[0.5em]">
            {items.map((l, i) => (
              <li key={l.key} className="flex items-center gap-[0.6em] rounded-[0.7em] bg-[#f5f8fe] px-[0.8em] py-[0.55em] text-[0.75em]">
                <span className="size-[0.75em] shrink-0 rounded-[0.2em]" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="min-w-0 flex-1 truncate font-semibold text-[#0b1b2b]">{t(l.key)}</span>
                <span className="font-bold text-[#0b1b2b]">{fmt(l.count)}</span>
                <span dir="ltr" className="w-[3em] text-end text-[#0b89a6]">
                  {Math.round((l.count / total) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <CardFooter>
        <span>{t("Levels come from the placement test and level exams.")}</span>
      </CardFooter>
    </Section>
  );
}
